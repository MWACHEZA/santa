const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test registration with profile picture
async function testRegistrationWithProfilePicture() {
  try {
    console.log('🧪 Testing registration with profile picture upload...');
    
    // Create a simple test image file (SVG converted to PNG)
    const testImagePath = path.join(__dirname, 'test-profile.png');
    
    // Create a simple PNG image using a base64 encoded 1x1 red pixel
    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ Created test image file');
    
    // Create form data
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('username', `testuser${Date.now()}`);
    formData.append('email', `testuser${Date.now()}@example.com`);
    formData.append('password', 'TestPassword123!');
    formData.append('phoneNumber', '+263771234567');
    formData.append('dateOfBirth', '1990-01-01');
    formData.append('address', '123 Test Street');
    formData.append('emergencyContact', 'Emergency Contact');
    formData.append('emergencyPhone', '+263778765432');
    formData.append('medicalConditions', 'None');
    formData.append('dietaryRestrictions', 'None');
    formData.append('accessibilityNeeds', 'None');
    formData.append('profilePicture', fs.createReadStream(testImagePath), {
      filename: 'test-profile.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending registration request with profile picture...');
    
    // Send registration request
    const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Registration response:', response.data);
    
    // Verify the response includes profile picture URL
    if (response.data.user && response.data.user.profilePictureUrl) {
      console.log('✅ Profile picture URL in response:', response.data.user.profilePictureUrl);
    } else {
      console.log('⚠️  No profile picture URL in response');
    }
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('🧹 Cleaned up test image file');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test database verification
async function verifyDatabaseRecords() {
  try {
    console.log('\n🔍 Verifying database records...');
    
    // Connect to database
    const mysql = require('mysql2/promise');
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'st_patricks_db'
    });
    
    // Check recent users
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, profile_picture_id FROM users ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log('📋 Recent users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, Profile Picture ID: ${user.profile_picture_id})`);
    });
    
    // Check media files
    const [mediaFiles] = await db.execute(
      'SELECT id, filename, file_path, file_type, uploaded_by FROM media_files ORDER BY uploaded_at DESC LIMIT 5'
    );
    
    console.log('\n📁 Recent media files:');
    mediaFiles.forEach(file => {
      console.log(`  - ${file.filename} (ID: ${file.id}, Path: ${file.file_path}, Type: ${file.file_type})`);
    });
    
    await db.end();
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  }
}

// Test file storage
function verifyFileStorage() {
  try {
    console.log('\n📂 Verifying file storage...');
    
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const profileDir = path.join(uploadPath, 'profiles');
    
    if (fs.existsSync(profileDir)) {
      const files = fs.readdirSync(profileDir);
      console.log(`✅ Found ${files.length} files in profiles directory:`);
      files.forEach(file => {
        const filePath = path.join(profileDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${stats.size} bytes)`);
      });
    } else {
      console.log('⚠️  Profiles directory does not exist');
    }
    
  } catch (error) {
    console.error('❌ File storage verification failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('🚀 Starting registration and profile picture upload tests...\n');
    
    // Test registration with profile picture
    await testRegistrationWithProfilePicture();
    
    // Verify database records
    await verifyDatabaseRecords();
    
    // Verify file storage
    verifyFileStorage();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testRegistrationWithProfilePicture,
  verifyDatabaseRecords,
  verifyFileStorage
};