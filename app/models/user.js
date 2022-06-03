const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: 
    { 
      type: String, 
      required: [true, "Champ requis"], 
      unique: true,
      trim: true,
      maxlength: 64 
    },
    password: 
    { 
      type: String, 
      required: [true, "Mot de passe requis"],
      trim: true,
      minLength: [6, "Le mot de passe doit contenir au mois 6 caractères"],
      maxlength: [64, "Le mot de passe ne doit pas dépasser 64 caractères"], // A common maximum length is 64 characters due to limitations in certain hashing algorithms
      minNumbers: 1,
      minLowercase: 1,
      minUppercase: 1
    },
    reports: 
    { 
      type: Number, 
      default: 0 
    },
    userWhoReported: 
    [{ 
      type: String,
      ref: "User" 
    }]
    
});

userSchema.plugin(uniqueValidator, {message: 'Éxiste déja.'});

module.exports = mongoose.model('User', userSchema);