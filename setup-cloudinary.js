// Simple script to help set up Cloudinary in .env file
// Run this with: node setup-cloudinary.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('🔧 Cloudinary Setup Helper\n');
console.log('I\'ll help you add Cloudinary credentials to your .env file.\n');
console.log('You can find these in your Cloudinary Dashboard:');
console.log('1. Go to https://cloudinary.com/console');
console.log('2. Look for: Cloud Name, API Key, and API Secret\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setup() {
  try {
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing Cloudinary variables
    envContent = envContent
      .split('\n')
      .filter(line => 
        !line.startsWith('CLOUDINARY_URL=') &&
        !line.startsWith('CLOUDINARY_CLOUD_NAME=') &&
        !line.startsWith('CLOUDINARY_API_KEY=') &&
        !line.startsWith('CLOUDINARY_API_SECRET=')
      )
      .join('\n')
      .trim();

    // Get credentials from user
    console.log('Enter your Cloudinary credentials:\n');
    
    const cloudName = await askQuestion('Cloud Name (e.g., dgtgjgby4): ');
    const apiKey = await askQuestion('API Key (e.g., 425338811227916): ');
    const apiSecret = await askQuestion('API Secret (the long string): ');

    if (!cloudName || !apiKey || !apiSecret) {
      console.log('\n❌ All fields are required. Please try again.');
      rl.close();
      return;
    }

    // Add Cloudinary variables
    const cloudinaryVars = [
      '',
      '# Cloudinary Configuration',
      `CLOUDINARY_CLOUD_NAME=${cloudName}`,
      `CLOUDINARY_API_KEY=${apiKey}`,
      `CLOUDINARY_API_SECRET=${apiSecret}`,
    ].join('\n');

    // Write to .env file
    const newContent = envContent + (envContent ? '\n' : '') + cloudinaryVars + '\n';
    fs.writeFileSync(envPath, newContent, 'utf8');

    console.log('\n✅ Success! Your .env file has been updated.');
    console.log('\n📝 Added to .env:');
    console.log(`   CLOUDINARY_CLOUD_NAME=${cloudName}`);
    console.log(`   CLOUDINARY_API_KEY=${apiKey}`);
    console.log(`   CLOUDINARY_API_SECRET=***** (hidden)`);
    console.log('\n🔄 Next steps:');
    console.log('   1. Restart your development server (Ctrl+C, then npm run dev)');
    console.log('   2. Try uploading a file!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setup();

