import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://ylmwuiuh6f.execute-api.us-east-1.amazonaws.com/dev/events');
  const data = await res.json();
  return NextResponse.json(data);
}
