import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new DynamoDBClient({});
const ses = new SESClient({});

const SENDER_EMAIL = process.env.SENDER_EMAIL!; // e.g., 'noreply@yourdomain.com'

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { eventId, userId, userEmail } = JSON.parse(event.body || '{}');

    if (!eventId || !userId || !userEmail) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing eventId, userId, or userEmail' }),
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

    // Send SES email notification
    const emailCommand = new SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [userEmail], // Send to the user who registered
      },
      Message: {
        Subject: { Data: 'Event Registration Confirmation' },
        Body: {
          Text: {
            Data: `Thank you for registering for event ${eventId}! Your booking is confirmed.`,
          },
        },
      },
    });

    await ses.send(emailCommand);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Booking confirmed and email sent' }),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: message }),
    };
  }
};
