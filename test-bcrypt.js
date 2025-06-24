const bcrypt = require('bcryptjs');

// Test the existing hash
const hash = '$2b$12$5ZDaCRMAoMQcZClVzCipfOwVKdU5M12BpupZB8ws7zIsW4s9qMLZe';
const password = 'password';

console.log('Testing bcrypt hash...');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('Comparison result:', bcrypt.compareSync(password, hash));

// Generate a new hash for verification
console.log('\nGenerating new hash for "password":');
const newHash = bcrypt.hashSync(password, 12);
console.log('New hash:', newHash);
console.log('New hash comparison:', bcrypt.compareSync(password, newHash));
