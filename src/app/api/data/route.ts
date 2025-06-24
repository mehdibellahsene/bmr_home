import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');

function readData() {
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(fileContents);
}

function writeData(data: Record<string, unknown>) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readData();
    // Remove admin credentials from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...publicData } = data;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Failed to read data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readData();
    
    // Update the data
    Object.keys(body).forEach(key => {
      if (key !== 'admin') {
        data[key] = body[key];
      }
    });
    
    writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
