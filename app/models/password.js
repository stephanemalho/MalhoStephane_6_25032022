const passwordValidator = require('password-validator');

const schemaPassword = new passwordValidator;

// Schema controlling passwords to validate in routes
schemaPassword
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123','1234567','AZERTY123','azerty123','qwerty123','QWERTY123']); // Blacklist these values


console.log(schemaPassword);
module.exports = schemaPassword;