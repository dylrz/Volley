console.log(process.cwd())

const fs = require('fs');
fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading .env file', err);
    } else {
        console.log('.env content:', data);
    }
});
