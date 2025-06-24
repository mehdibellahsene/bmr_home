import fs from 'fs';
import path from 'path';

export async function generateFavicon(): Promise<Buffer> {
  try {
    // Read the SVG favicon from the public directory
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
    
    if (fs.existsSync(faviconPath)) {
      const svgContent = fs.readFileSync(faviconPath);
      
      // For now, we'll return the SVG as is. In a production environment,
      // you might want to convert SVG to PNG using a library like sharp
      // For SVG support, we can return the SVG content directly
      return svgContent;
    }
    
    // Fallback: create a simple colored square PNG if SVG doesn't exist
    return generateSimpleFavicon();
  } catch (error) {
    console.error('Error generating favicon:', error);
    return generateSimpleFavicon();
  }
}

function generateSimpleFavicon(): Buffer {
  // Simple 16x16 PNG favicon (minimal implementation)
  // In a real application, you'd use a proper image generation library
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x10, // Width: 16
    0x00, 0x00, 0x00, 0x10, // Height: 16
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
    0x90, 0x91, 0x68, 0x36, // CRC
  ]);
  
  // This is a minimal implementation. For production, use proper image libraries
  return pngHeader;
}