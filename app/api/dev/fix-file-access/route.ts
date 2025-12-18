import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  try {
    const url = process.env.CLOUDINARY_URL.trim();
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, apiKey, apiSecret, cloudName] = match;
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
    }
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
      return null;
    }
    
    let afterUpload = urlParts[1];
    // Remove version prefix (v1234567890/)
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    afterUpload = afterUpload.replace(/\.[^/.]+$/, '');
    
    return afterUpload;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Could not extract public_id from URL' },
        { status: 400 }
      );
    }

    // Determine resource type from URL
    const resourceType = url.includes('/raw/upload/') ? 'raw' : 'image';

    console.log('Making file public:', publicId, 'resource_type:', resourceType);

    // Update the file to be public
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: resourceType,
      access_mode: 'public',
    });

    return NextResponse.json({
      success: true,
      message: 'File is now publicly accessible',
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error('Error fixing file access:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fix file access' },
      { status: 500 }
    );
  }
}
