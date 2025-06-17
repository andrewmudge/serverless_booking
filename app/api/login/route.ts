import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
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
  const { email, password } = await req.json();

  const client = new CognitoIdentityProviderClient({ region });

  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: getSecretHash(email),
    },
  });

  try {
    const response = await client.send(command);
    return NextResponse.json({ message: 'Login successful', data: response.AuthenticationResult });
  } catch (err) {
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 400 });
}
}
