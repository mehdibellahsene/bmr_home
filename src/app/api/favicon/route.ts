import { generateFavicon } from '@/lib/favicon';

export async function GET() {
  try {
    const faviconBuffer = await generateFavicon();
    
    return new Response(faviconBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating favicon:', error);
    return new Response('Error generating favicon', { status: 500 });
  }
}