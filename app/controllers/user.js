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
        .then(() => res.status(201).json({ message: "Utilisateur créé"},user, hateoasLinks(req)))
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
            User: user,
            hateoasLinks: hateoasLinks(req),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};


exports.deleteUser = (req, res, next) => {
  const deletedUserId = req.params.id;
  User.findOneAndDelete({ _id: deletedUserId })
    .then(() => res.status(200).json({ message: "Utilisateur supprimé" }))
    .catch((error) => res.status(500).json({ error }));
}

// exports.reportUser = (req, res, next) => {
//   const userId = req.params.id;
//   User.findOne({ _id: userId })
//   .then((user) => {
//     let toChange = {};
//     switch (req.body.report){ 
//       case 0: 
//       toChange = {
//         $inc: { report: 1}, 
//       }
//         user.updateOne(
//           { _id: userId },
//           toChange
//         )
//           .then(() => {
//             res.status(200).json({ message: "your report as been sent!" }); 
//           })
//           .catch((error) => {
//             res.status(400).json({ error: error });
//           });
//         break;
//       case 1:
//         toChange = {
//           $inc: { report: -1},
//         }
//         report.updateOne( 
//           { _id: req.params.id }, 
//           toChange 
//         )
//           .then(() => {
//             res.status(200).json( sauce,  hateoasLinks(req, user._id) ); 
//           })
//           .catch((error) => {
//             console.log(error);
//             res.status(400).json({ error: error });
//           });
//         break;
//       default:
//         console.error("Bad request");
//     }
//   })
// }

exports.readUserInfo = (req, res, next) => {
  const userId = req.params.id;
  User.findOne({ _id: userId })
    .then((user) => res.status(200).json(user, hateoasLinks(req)))
    .catch((error) => res.status(500).json({ error }));
    
}

exports.updateUserAccount = (req, res, next) => {
  const userId = req.params.id;
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });
  User.findOneAndUpdate({ _id: userId }, user)
    .then(() => res.status(200).json(user , hateoasLinks(req)))
    .catch((error) => res.status(500).json({ error }));
}



const hateoasLinks = (req) => {
  const URI = `${req.protocol}://${req.get("host")+ "/api/auth"}`;
  return [
    {
      rel: "signup",
      title: "Signup",
      href: URI + "/signup",
      method: "POST",
    },
    {
      rel: "login",
      title: "Login",
      href: URI + "/login",
      method: "POST",
    },
    {
      rel: "delete",
      title: "Delete",
      href: URI + "/delete",
      method: "DELETE",
    },
    {
      rel: "read",
      title: "Read",
      href: URI + "/:id",
      method: "GET",
    },
    {
      rel: "update",
      title: "Update",
      href: URI + "/:id",
      method: "PUT",
    },
    {
      rel: "report",
      title: "Report",
      href: URI + "/:id/report",
      method: "POST",
    }
  ]
}