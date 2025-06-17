import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Events';

export const handler = async () => {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);

    console.log('Items:', response.Items);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.Items),
    };
  } catch (error) {
    console.error('❌ Lambda failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Requested resource not found' }),
    };
  }
};
