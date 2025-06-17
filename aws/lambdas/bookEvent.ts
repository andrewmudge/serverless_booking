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
        body: JSON.stringify({ error: 'Missing eventId or userId' }),
      };
    }

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: 'Events', // <-- Use your actual table name
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
            TableName: 'Registrations', // <-- Use your actual table name
            Item: {
              userId: { S: userId },
              eventId: { S: eventId },
            },
            ConditionExpression: 'attribute_not_exists(eventId)', // eventId as sort key
          },
        },
      ],
    });

    await client.send(command);

    // On success
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking confirmed' }),
    };
  } catch (err: any) {
    // On error
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
