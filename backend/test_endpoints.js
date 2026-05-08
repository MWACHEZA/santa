const http = require('http');

http.get('http://localhost:5000/api/videos/archive?published=true', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Archive Response Code:', res.statusCode);
    console.log('Archive Response:', data);
  });
}).on('error', err => {
  console.log('Archive Error:', err.message);
});

http.get('http://localhost:5000/api/categories/type/video', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Categories Response Code:', res.statusCode);
    console.log('Categories Response:', data);
  });
}).on('error', err => {
  console.log('Categories Error:', err.message);
});
