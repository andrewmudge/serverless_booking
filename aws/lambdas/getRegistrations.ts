import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const REGISTRATIONS_TABLE = process.env.BOOKINGS_TABLE || 'Registrations';
const USER_ID_INDEX = process.env.USER_ID_INDEX || 'userId-index'; // GSI name

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const command = new QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: USER_ID_INDEX,
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
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ eventIds }),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: message }),
    };
  }
};