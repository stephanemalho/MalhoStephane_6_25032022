const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");

function encrypt(email) {
  return CryptoJS.AES.encrypt(
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
  var bytes = CryptoJS.AES.decrypt(
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
    .hash(req.body.password, 10)
    .then((hash) => {
      const emailEncrypted = encrypt(req.body.email);
      const user = new User({
        email: emailEncrypted ,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
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
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

