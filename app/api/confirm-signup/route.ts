import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

const region = process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const clientSecret = process.env.COGNITO_CLIENT_SECRET!;

function getSecretHash(username: string) {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  const client = new CognitoIdentityProviderClient({ region });

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    SecretHash: getSecretHash(email),
  });

  try {
    const result = await client.send(command);
    return NextResponse.json({ message: 'User confirmed successfully', data: result });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
