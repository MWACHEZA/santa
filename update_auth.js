const fs = require('fs');
let code = fs.readFileSync('backend/routes/auth.js', 'utf8');

// login
code = code.replace(/delete user\.password_hash;/, `delete user.password_hash;
    const baseUrl = \`\${req.protocol}://\${req.get('host')}\`;
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      user.profilePicture = \`\${baseUrl}\${user.profilePicture}\`;
    }`);

// register
code = code.replace(/message: 'User registered successfully',[\s\S]*?data: \{\s*user: newUser\[0\]\s*\}/, `message: 'User registered successfully',
      data: {
        user: {
          ...newUser[0],
          profilePicture: newUser[0].profilePicture && !newUser[0].profilePicture.startsWith('http') ? \`\${req.protocol}://\${req.get('host')}\${newUser[0].profilePicture}\` : newUser[0].profilePicture
        }
      }`);

// profile GET
code = code.replace(/message: 'User profile retrieved successfully',[\s\S]*?data: \{\s*user: users\[0\]\s*\}/, `message: 'User profile retrieved successfully',
      data: {
        user: {
          ...users[0],
          profilePicture: users[0].profilePicture && !users[0].profilePicture.startsWith('http') ? \`\${req.protocol}://\${req.get('host')}\${users[0].profilePicture}\` : users[0].profilePicture
        }
      }`);

// profile PUT
code = code.replace(/message: 'Profile updated successfully',[\s\S]*?data: \{\s*user: updatedUser\[0\]\s*\}/, `message: 'Profile updated successfully',
      data: {
        user: {
          ...updatedUser[0],
          profilePicture: updatedUser[0].profilePicture && !updatedUser[0].profilePicture.startsWith('http') ? \`\${req.protocol}://\${req.get('host')}\${updatedUser[0].profilePicture}\` : updatedUser[0].profilePicture
        }
      }`);

fs.writeFileSync('backend/routes/auth.js', code);
console.log('backend/routes/auth.js updated');
