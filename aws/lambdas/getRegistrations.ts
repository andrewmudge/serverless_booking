import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    // Query Registrations table for all events for this user
    const command = new QueryCommand({
      TableName: 'Registrations', // Make sure this matches your table name
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': { S: userId },
      },
      ProjectionExpression: 'eventId',
    });

    const result = await client.send(command);

    // Extract eventIds from the result
    const eventIds = (result.Items || []).map(item => item.eventId.S);

    return {
      statusCode: 200,
      body: JSON.stringify({ eventIds }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};