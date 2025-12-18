// Script to fix Cloudinary file access mode
// Usage: node scripts/fix-file-access.js <cloudinary-url>

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
const url = process.env.CLOUDINARY_URL;
if (!url) {
  console.error('CLOUDINARY_URL not found in .env file');
  process.exit(1);
}

const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!match) {
  console.error('Invalid CLOUDINARY_URL format');
  process.exit(1);
}

const [, apiKey, apiSecret, cloudName] = match;
cloudinary.config({
  cloud_name: cloudName.trim(),
  api_key: apiKey.trim(),
  api_secret: apiSecret.trim(),
});

// Get URL from command line or use the provided one
const fileUrl = process.argv[2] || 'https://res.cloudinary.com/dgtgjgby4/raw/upload/v1766088432/uploads/jobs/cmjbuhyan0008u0tb6duvjwbl/tasks/cmjbvf9b7000au0tblppgxgie/1766088431302-USL-019_Logo-evolution_2026_v1.pdf';

// Extract public_id from URL
function extractPublicId(url) {
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return null;
  }
  
  let publicId = urlParts[1];
  // Remove version prefix (v1234567890/)
  publicId = publicId.replace(/^v\d+\//, '');
  // Remove file extension
  publicId = publicId.replace(/\.[^/.]+$/, '');
  
  return publicId;
}

// Determine resource type
const resourceType = fileUrl.includes('/raw/upload/') ? 'raw' : 'image';

const publicId = extractPublicId(fileUrl);
if (!publicId) {
  console.error('Could not extract public_id from URL:', fileUrl);
  process.exit(1);
}

console.log('Making file public...');
console.log('Public ID:', publicId);
console.log('Resource Type:', resourceType);

cloudinary.uploader.explicit(publicId, {
  type: 'upload',
  resource_type: resourceType,
  access_mode: 'public',
})
.then(result => {
  console.log('✅ Success! File is now publicly accessible');
  console.log('URL:', result.secure_url);
})
.catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
