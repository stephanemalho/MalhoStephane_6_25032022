const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");


var data = User({email: ""});
var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.PASSPHRASE).toString();

function encrypt(email) {
  return ciphertext;
}


function decrypt(email) {
  var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.PASSPHRASE);
  //var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  //return decryptedData;
  return originalText;
}



// function encrypt(email) {
//   return CryptoJS.AES.encrypt(
//     // encrypt the email
//     email,
//     CryptoJS.enc.Base64.parse(process.env.PASSPHRASE),
//     {
//       iv: CryptoJS.enc.Base64.parse(process.env.IV),
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     }
//   ).toString();
// }

// function decrypt(email) {
//   var bytes = CryptoJS.AES.decrypt(
//     // decrypt the email
//     email,
//     CryptoJS.enc.Base64.parse(process.env.PASSPHRASE),
//     {
//       iv: CryptoJS.enc.Base64.parse(process.env.IV),
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     }
//   );
//   return bytes.toString(CryptoJS.enc.Utf8);
// }


exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // hash the password
    .then((hash) => {
      const emailEncrypted = encrypt(req.body.email); // encrypt the email
      const user = new User({
        // create a new user
        email: emailEncrypted,
        password: hash,
        hateoasLinks: hateoasLinks(req),
      });
      user
        .save() // save the user
        .then(() =>
          res
            .status(201)
            .json({ message: "Utilisateur créé" }, user, hateoasLinks(req))
        )
        .catch((error) => res.status(422).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const emailEncrypted = encrypt(req.body.email);
  User.findOne({ email: emailEncrypted })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
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
              expiresIn: "24h",
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
  User.findOneAndDelete({ userId: req.auth.userID }) // find the user and delete it
    .then(() => {
      res.status(200).json({ message: "User deleted" });
    }) // send the response and the user
    .catch((error) =>
      res.status(404).json({ error: "User not found" + error })
    ); // if not found
};


// report user 
exports.reportUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user["userWhoReported"].includes(req.auth.userID)) {
        User.findByIdAndUpdate(
          { _id: req.params.id },
          {
            $inc: { reports: 1 },
            $push: { userWhoReported: req.auth.userID },
          },
          { new: true }
        )
          .then((newUser) => {
            return res.status(200).json(newUser, hateoasLinks(req, User._id));
          })
          .catch((error) => {
            return res.status(400).json({ error: error });
          });
      } else {
        res.status(404).json({ error: "User not found or already reported" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};


exports.readUserInfo = (req, res, next) => {
  let emailToDecrypt = decrypt(req.body.email);
  User.findOneAndUpdate(
    { email: emailToDecrypt },
  )
    .then((user) => {
      if (!user) {
        res.status(404).send({ error });
      } else {
        
        user.email = emailToDecrypt;
        res.status(200).json(user, hateoasLinks(req, User._id));

      }

    })
    .catch((error) => res.status(500).json({ error }));
};

exports.updateUserAccount = (req, res, next) => {
  
};


const hateoasLinks = (req, id) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/auth"}`;
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
      href: URI + id,
      method: "DELETE",
    },
    {
      rel: "read",
      title: "Read",
      href: URI,
      method: "GET",
    },
    {
      rel: "update",
      title: "Update",
      href: URI,
      method: "PUT",
    },
    {
      rel: "report",
      title: "Report",
      href: URI + id + "/report",
      method: "POST",
    },
    {
      rel: "readUserInfo",
      title: "ReadUserInfo",
      href: URI,
      method: "GET",
    },
  ];
};
