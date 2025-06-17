import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

const region = process.env.NEXT_PUBLIC_AWS_REGION!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const clientSecret = process.env.COGNITO_CLIENT_SECRET!;

function getSecretHash(username: string) {
  return crypto.createHmac('sha256', clientSecret)
               .update(username + clientId)
               .digest('base64');
}

export async function POST(req: NextRequest) {
  const { email, password, givenName, familyName } = await req.json();

  const client = new CognitoIdentityProviderClient({ region });

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    SecretHash: getSecretHash(email),
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'given_name', Value: givenName },
      { Name: 'family_name', Value: familyName },
    ],
  });

  try {
    const response = await client.send(command);
    return NextResponse.json({ message: 'User signed up', data: response });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
