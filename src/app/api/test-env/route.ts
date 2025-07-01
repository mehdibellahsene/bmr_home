import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    adminUsername: process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET',
    adminPassword: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    // For debugging - never do this in production
    actualUsername: process.env.ADMIN_USERNAME,
    actualPassword: process.env.ADMIN_PASSWORD ? '***HIDDEN***' : 'NOT SET'
  });
}
