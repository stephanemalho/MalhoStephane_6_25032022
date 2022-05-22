const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const fs = require("fs");
const Sauce = require("../models/sauce");


/*****************************************************************
 *****************  ENCRYPT THE USER EMAIL   ********************* 
 *****************************************************************/
function encryptString(content) {
  const parsedkey = CryptoJS.enc.Utf8.parse(process.env.PASSPHRASE); // PASSPHRASE in .env exemple folder
  const iv = CryptoJS.enc.Utf8.parse(process.env.IV);
  const encrypted = CryptoJS.AES.encrypt(content, parsedkey, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/*****************************************************************
 *****************  DECRYPT THE USER EMAIL   ********************* 
 *****************************************************************/
function decryptString(word) {
  var keys = CryptoJS.enc.Utf8.parse(process.env.PASSPHRASE); // PASSPHRASE in .env exemple folder
  let base64 = CryptoJS.enc.Base64.parse(word);
  let src = CryptoJS.enc.Base64.stringify(base64);
  var decrypt = CryptoJS.AES.decrypt(src, keys, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypt.toString(CryptoJS.enc.Utf8);
}


/*****************************************************************
 *****************     USER SIGNIN           ********************* 
 *****************************************************************/
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // hash the password
    .then((hash) => {
      const emailEncrypted = encryptString(req.body.email); // encryptString the email
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


/*****************************************************************
 *****************     USER LOGING           ********************* 
 *****************************************************************/
exports.login = (req, res, next) => {
  const emailEncrypted = encryptString(req.body.email);
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
          user.email = decryptString(user.email);

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


/*****************************************************************
 *****************     DELETE THE USER       ********************* 
 *****************************************************************/
exports.deleteUser = (req, res, next) => {
  User.findOneAndDelete({ userId: req.auth.userID }) // find the user and delete it
    .then(() => {
      res.status(200).json({ message: "User deleted" });
    }) // send the response and the user
    .catch((error) =>
      res.status(404).json({ error: "User not found" + error })
    ); // if not found
};

/*****************************************************************
 *****************     REPORT THE USER       ********************* 
 *****************************************************************/
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


/*****************************************************************
 *****************  READ THE USER SETUP      ********************* 
 *****************************************************************/
exports.readUser = (req, res, next) => {
  User.findOne({ _id: req.auth.userID })
    .then((user) => {
      if (!user) {
        res.status(404).send("user not find");
      }
      user.email = decryptString(user.email);
      res.status(200).json(user, hateoasLinks(req, user._id));
    })
    .catch((error) => console.log(error));
};


/*****************************************************************
 *****************  UPDATE THE USER SETUP    ********************* 
 *****************************************************************/
exports.updateUser = async (req, res) => {
  const checkBeforeUpdate = { _id: req.auth.userID }; // check if the user is the same
  const update = {};
  const emailEncrypted = encryptString(req.body.email);
  User.findOne({ email: emailEncrypted })
  if (req.body.password) {
    const hash = await bcrypt.hash(req.body.password, 10);
    update.password = hash;
  }
  if (req.body.email) {
    update.email = emailEncrypted;
  }
  User.findOneAndUpdate(checkBeforeUpdate, update, { // update the changes for the user
    returnOriginal: true,
    updatedExisting: true,
  })
    .then((user) => {
      res.status(201).json(user, hateoasLinks(req));
    })
    .catch((error) => res.status(400).json({ error }));
};


/*****************************************************************
 *****************  EXPORT THE USER DATA     ********************* 
 *****************************************************************/
exports.exportData = (req, res) => {
  
  User.findOne({ _id: req.auth.userID })
    .then(user => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
      }
      // Decrypt email
      user.email = decryptString(user.email);

      var text = user.toString();
      res.attachment('user-datas.txt');
      res.type('txt');
      return res.status(200).send(text);
    })
    .catch((error) => res.status(500).json({ error }));
};


/*****************************************************************
 *****************  API RESTFULL USER SETUP  ********************* 
 *****************************************************************/
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
    {
      rel: "updateUserInfo",
      title: "UpdateUserInfo",
      href: URI,
      method: "PUT",
    },
    {
      rel: "exportUser",
      title: "ExportUser",
      href: URI + "/export",
      method: "GET",
    }
  ];
};
