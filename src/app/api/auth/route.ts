import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    console.log('Auth attempt:', {
      receivedUsername: username,
      receivedPassword: password ? '***HIDDEN***' : 'EMPTY',
      envUsername: adminUsername,
      envPassword: adminPassword ? '***HIDDEN***' : 'EMPTY',
      usernameMatch: username === adminUsername,
      passwordMatch: password === adminPassword
    });
    
    if (!adminUsername || !adminPassword) {
      console.error('Missing environment variables:', {
        adminUsername: !!adminUsername,
        adminPassword: !!adminPassword
      });
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
    }
    
    if (username === adminUsername && password === adminPassword) {
      console.log('Login successful for user:', username);
      // In a real app, you'd create a JWT token here
      const response = NextResponse.json({ success: true, message: 'Login successful' });
      response.cookies.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      return response;
    } else {
      console.log('Login failed - credentials mismatch');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete('admin-auth');
  return response;
}
