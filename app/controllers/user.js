const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const CryptoJS = require("crypto-js");




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
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ error: errors.array() }); // Bad Request from express-validator controller
  // }
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
        .then((newUser) =>
          res
            .status(201) // created
            .json({ message: "User created", user: newUser },  hateoasLinks(req, newUser._id))
        )
        .catch((error) => res.status(400).json({ error })); // bad request
    }) 
    .catch((error) => res.status(500).json({ error })); // Internal Server Error
};

/*****************************************************************
 *****************     USER LOGING           *********************
 *****************************************************************/
exports.login = (req, res, next) => {
  const emailEncrypted = encryptString(req.body.email);
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ error: errors.array() }); // Bad Request from express-validator controller
  // }
  User.findOne({ email: emailEncrypted })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" }); // Not found
      }
      bcrypt
        .compare(req.body.password, user.password) // compare the password
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" }); // Unauthorized
          }
          user.email = decryptString(user.email);
          res.status(200).json({
            // OK
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
              expiresIn: "24h",
            }),
            User: user,
            hateoasLinks: hateoasLinks(req, user._id),
          });
        })
        .catch((error) => res.status(500).json({ error })); // Internal Server Error
    })
    .catch((error) => res.status(500).json({ error })); // Internal Server Error
};

/*****************************************************************
 *****************     DELETE THE USER       *********************
 *****************************************************************/
exports.deleteUser = (req, res, next) => {
  User.findOneAndDelete({ _id: req.auth.userID }) // find the user and delete it
    .then((user) => {
      if (!user) {
        res.status(404).send("User not found"); // not found
      }
      res.status(204).json({ message: "User deleted" }); // no content
    })
    .catch(
      (error) => res.status(500).json({ error }) // Internal Server Error
    );
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
            return res
              .status(201)
              .json(newUser, hateoasLinks(req, newUser._id)); // the report as been created
          })
          .catch((error) => {
            return res.status(403).json({ error: error }); // forbidden
          });
      } else {
        res.status(404).json({ error: "User not found or already reported" }); // not found or already reported
      }
    })
    .catch((error) => res.status(500).json({ error })); // Internal Server Error
};

/*****************************************************************
 *****************  READ THE USER SETUP      *********************
 *****************************************************************/
exports.readUser = (req, res, next) => {
  User.findOne({ _id: req.auth.userID })
    .then((user) => {
      if (!user) {
        res.status(404).send("User not found"); // not found
      }
      user.email = decryptString(user.email);
      res.status(200).json(user, hateoasLinks(req, user._id)); // OK
    })
    .catch((error) => console.log(error));
};

/*****************************************************************
 *****************  UPDATE THE USER SETUP    *********************
 *****************************************************************/
exports.updateUser = async (req, res) => {
  const update = {};
  if (req.body.password) {
    const hash = await bcrypt.hash(req.body.password, 10);
    update.password = hash;
  }
  if (req.body.email) {
    update.email = encryptString(req.body.email);
  }
  User.findOneAndUpdate({ _id: req.auth.userID }, update, {
    // update the changes for the user
    returnOriginal: true,
    updatedExisting: true,
  })
    .then((user) => {
      if (!user) {
        return res
          .status(404) // not found
          .json({ error: "User not found." });
      }
      user.email = decryptString(user.email);
      res.status(201).json(user, hateoasLinks(req, user._id));
    })
    .catch((error) => res.status(500).json({ error })); // Internal Server Error
};

/*****************************************************************
 *****************  EXPORT THE USER DATA     *********************
 *****************************************************************/
exports.exportData = (req, res) => {
  User.findOne({ _id: req.auth.userID })
    .then((user) => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(404) // Not found
          .json({ error: "User not found." });
      }
      // Decrypt email
      user.email = decryptString(user.email);
      var text = user.toString();
      res.attachment("user-datas.txt");
      res.type("txt");
      return res.status(200).send(text); // ok
    })
    .catch((error) => res.status(500).json({ error })); // Internal Server Error
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
    }
  ];
};
