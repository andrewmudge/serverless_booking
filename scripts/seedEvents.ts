import {
  DynamoDBClient,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const REGION = 'us-east-1';
const TABLE_NAME = 'Events';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

const agenda: Record<string, { time: string; title: string; seats: number }[]> = {
  Friday: [
    { time: '9:00 AM', title: 'Introduction to AWS Cloud Fundamentals', seats: 24 },
    { time: '11:00 AM', title: 'Serverless Architectures with AWS Lambda', seats: 18 },
    { time: '2:00 PM', title: 'Scaling Applications Using AWS Auto Scaling', seats: 12 },
  ],
  Saturday: [
    { time: '9:00 AM', title: 'Securing Cloud Infrastructure with AWS IAM', seats: 20 },
    { time: '11:00 AM', title: 'Building Data Pipelines with AWS Glue', seats: 15 },
    { time: '2:00 PM', title: 'Optimizing Costs with AWS Cost Explorer', seats: 10 },
  ],
  Sunday: [
    { time: '9:00 AM', title: 'Deploying Containers with Amazon ECS and EKS', seats: 22 },
    { time: '11:00 AM', title: 'Monitoring and Logging with AWS CloudWatch', seats: 16 },
    { time: '2:00 PM', title: 'Machine Learning on AWS with SageMaker', seats: 8 },
  ],
};

async function validateTableExists(tableName: string) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    console.log(`✅ Table "${tableName}" found in region "${REGION}".`);
    return response;
  } catch (error) {
    console.error(`❌ Table "${tableName}" not found in region "${REGION}".`);
    throw error;
  }
}

async function seedEvents() {
  try {
    await validateTableExists(TABLE_NAME);

    for (const [day, events] of Object.entries(agenda)) {
      for (const event of events) {
        const id = uuidv4();
        const params = {
          TableName: TABLE_NAME,
          Item: {
            eventId: id,
            day,
            time: event.time,
            title: event.title,
            seatsRemaining: event.seats,
          },
        };

        try {
          await docClient.send(new PutCommand(params));
          console.log(`✅ Seeded: ${event.title} on ${day} at ${event.time}`);
        } catch (err) {
          console.error(`❌ Failed to seed: ${event.title} on ${day} at ${event.time}`);
          console.error(err);
        }
      }
    }

    console.log('\n🎉 All events seeded successfully.');
  } catch (err) {
    console.error('\n💥 Seeding failed due to missing table or region mismatch.');
    process.exit(1);
  }
}

seedEvents();
