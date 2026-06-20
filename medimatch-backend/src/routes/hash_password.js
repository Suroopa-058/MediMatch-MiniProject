// Run this inside your medimatch-backend folder (where bcrypt is already installed):
//   node hash_password.js
// It will print a bcrypt hash for the password "demo1234" — paste that hash
// into the seed SQL file wherever you see <<PASTE_HASH_HERE>>.

const bcrypt = require('bcryptjs'); // or 'bcrypt' if that's what your project uses
const hash = bcrypt.hashSync('demo1234', 10);
console.log('\nDemo password hash for "demo1234":\n');
console.log(hash);
console.log('\nCopy this value into seed_data.sql\n');
