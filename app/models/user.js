const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: [true, "Champ requis"], match: [/\S+@\S+\.\S+/, 'Invalide'],lowercase: true, unique: true },
  password: { type: String, required: true }
});

UserSchema.plugin(uniqueValidator, {message: 'Éxiste déja.'});

module.exports = mongoose.model('User', userSchema);