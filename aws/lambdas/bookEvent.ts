import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new DynamoDBClient({});
const ses = new SESClient({});

// Make sure to set SENDER_EMAIL in your environment variables
const SENDER_EMAIL = process.env['SENDER_EMAIL']!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { eventId, userId, userEmail, title, day, time } = JSON.parse(event.body || '{}');

    if (!eventId || !userId || !userEmail || !title || !day || !time) {
      console.error('Missing required fields:', { eventId, userId, userEmail, title, day, time });
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing eventId, userId, userEmail, title, day, or time' }),
      };
    }

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId: { S: eventId } },
            ConditionExpression: 'seatsRemaining > :zero',
            UpdateExpression: 'SET seatsRemaining = seatsRemaining - :one',
            ExpressionAttributeValues: {
              ':one': { N: '1' },
              ':zero': { N: '0' },
            },
          },
        },
        {
          Put: {
            TableName: process.env.BOOKINGS_TABLE,
            Item: {
              userId: { S: userId },
              eventId: { S: eventId },
            },
            ConditionExpression: 'attribute_not_exists(eventId)',
          },
        },
      ],
    });

    await client.send(command);

    // Send SES email notification with event details
    const emailBody = `Thank you for registering for ${title} on ${day} at ${time}. Your booking is confirmed.`;

    const emailCommand = new SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Subject: { Data: 'Event Registration Confirmation' },
        Body: {
          Text: { Data: emailBody },
        },
      },
    });

    // Log before sending email
    console.log('Sending SES email:', {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: 'Event Registration Confirmation',
      body: emailBody,
    });

    try {
      await ses.send(emailCommand);
      console.log('SES email sent successfully');
    } catch (sesErr) {
      console.error('SES send error:', sesErr);
      throw sesErr;
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Booking confirmed and email sent' }),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Lambda error:', message, err);
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: message }),
    };
  }
};
