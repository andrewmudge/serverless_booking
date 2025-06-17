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

    const command = new QueryCommand({
      TableName: 'Registrations',
      IndexName: 'userId-index', // <-- Must match your GSI name exactly!
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': { S: userId },
      },
      ProjectionExpression: 'eventId',
    });

    const result = await client.send(command);

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