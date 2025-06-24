import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    adminUsername: process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET',
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  });
}
