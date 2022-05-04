const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");

function encrypt(email) {
  return CryptoJS.AES.encrypt(  // encrypt the email
    email,
    CryptoJS.enc.Base64.parse(process.env.PASSPHRASE), 
    {
      iv: CryptoJS.enc.Base64.parse(process.env.IV),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString();
}

function decrypt(email) { 
  var bytes = CryptoJS.AES.decrypt(   // decrypt the email
    email, 
    CryptoJS.enc.Base64.parse(process.env.PASSPHRASE),  
    {
      iv: CryptoJS.enc.Base64.parse(process.env.IV), 
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return bytes.toString(CryptoJS.enc.Utf8);
}

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // hash the password
    .then((hash) => {
      const emailEncrypted = encrypt(req.body.email); // encrypt the email
      const user = new User({      // create a new user
        email: emailEncrypted ,
        password: hash,
        hateoasLinks: hateoasLinks(req),
      });
      user
        .save() // save the user
        .then(() => res.status(201).json({ message: "Utilisateur créé"}, hateoasLinks(req)))
        .catch((error) => res.status(422).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const emailEncrypted = encrypt(req.body.email);
  User.findOne({ email: emailEncrypted }) 
    .then((user) => {
      if (!user) {
        return res.status(201).json({ error: "Utilisateur non trouvé" });
      }
      bcrypt 
        .compare(req.body.password, user.password) // compare the password
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
              expiresIn: "24h"
            }), 
            hateoasLinks: hateoasLinks(req),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

const hateoasLinks = (req) => {
  const Uri = `${req.protocol}://${req.get("host")}`;
  return [
    {
      rel: "signup",
      title: "Signup",
      href: Uri + "/api/auth/signup",
    },
    {
      rel: "login",
      title: "Login",
      href: Uri + "/api/auth/login",
    }    
  ]
}