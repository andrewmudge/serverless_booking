import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Replace with your actual Lambda endpoint:
  const lambdaUrl = `https://ylmwuiuh6f.execute-api.us-east-1.amazonaws.com/dev/registrations?userId=${userId}`;
  const res = await fetch(lambdaUrl);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: 'Invalid response from backend' };
  }
  return NextResponse.json(data, { status: res.status });
}