import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { eventId, userId } = JSON.parse(event.body || '{}');

    if (!eventId || !userId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing eventId or userId' }),
      };
    }

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: process.env.EVENTS_TABLE, // Use env variable
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
            TableName: process.env.BOOKINGS_TABLE, // Use env variable
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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Booking confirmed' }),
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
