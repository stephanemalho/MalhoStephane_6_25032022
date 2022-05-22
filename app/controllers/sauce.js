const Sauce = require("../models/sauce"); // import the sauce model
const fs = require("fs"); // file system


/*****************************************************************
 *****************  READ ONE SAUCE BY ID     ********************* 
 *****************************************************************/
exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce its object ID
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add the image url
      res.status(200).json(sauce, hateoasLinks(req, req.params.id));
    }) 
    .catch((error) => res.status(404).json({ error: "Sauce not found" })); 
};

/*****************************************************************
 *****************  GET ALL SAUCES           ********************* 
 *****************************************************************/
exports.readAllSauces = (req, res, next) => {
  Sauce.find()  // find all the sauces
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl =
          `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; 
        const hateoasLink = hateoasLinks(req, sauce._id);
        return { ...sauce._doc, hateoasLink };
      });
      res.status(200).json(sauces, hateoasLinks(req, sauces._id));
    }) 
    .catch((error) => res.status(400).json({ error })); 
};

/*****************************************************************
 *****************  CREATE A SAUCE           ********************* 
 *****************************************************************/
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // get the sauce object
  delete sauceObject._id; 
  const sauce = new Sauce({
    ...sauceObject, 
    imageUrl: `images/${
      req.file.filename 
    }`,
  }); // create a new sauce
  sauce
    .save() // save the sauce
    .then(() => res.status(201).json(sauce, hateoasLinks(req, sauce._id))) 
    .catch((error) => res.status(400).json({ error })); 
};

/*****************************************************************
 *****************  UPDATING A SAUCE         ********************* 
 *****************************************************************/
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file // get the file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `images/${req.file.filename}`, 
      }
    : { ...req.body };  
  Sauce.findOneAndUpdate({ _id: req.params.id }, sauceObject, { new: true }) // update the sauce
    .then((sauce) => res.status(200).json(sauce, hateoasLinks(req, sauce._id)))
    .catch((error) => res.status(400).json({ error: error }));
};

/*****************************************************************
 *****************  DELETING A SAUCE BY ITS ID ******************* 
 *****************************************************************/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; 
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id }) // delete the sauce
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
};

/*****************************************************************
 *****************  LIKE OR DISLIKE A SAUCE  ********************* 
 *****************************************************************/
exports.likeSauce = (req, res, next) => {
  Sauce.findById(req.params.id) 
    .then((sauce) => {
      let toChange = {};
      switch (req.body.like) {
        case -1:
          toChange = {
            $inc: { dislikes: 1 }, // add a dislike
            $push: { usersDisliked: req.auth.userID }, // add the user to the list of users disliked
          };
          if (sauce["usersLiked"].includes(req.auth.userID)) {
            toChange = {
              $inc: { dislikes: 1, likes: -1 }, // add a dislike and remove a like
              $push: { usersDisliked: req.auth.userID },
              $pull: { usersLiked: req.auth.userID },
            };
          }
          if (!sauce["usersDisliked"].includes(req.auth.userID)) {
            Sauce.findByIdAndUpdate({ _id: req.params.id }, toChange, {
              new: true,
            })
              .then((newSauce) => {
                return res.status(200).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                return res.status(400).json({ message: error });
              });
          } else {
            res.status(200).json("User already dislike the sauce");
          }
          

          break;
        case 0:
          if (sauce["usersLiked"].includes(req.auth.userID)) {
            // if the user is already liked
            Sauce.findByIdAndUpdate(
              { _id: req.params.id },
              {
                $inc: { likes: -1 }, // remove a like
                $pull: { usersLiked: req.auth.userID }, // remove the user from the list of users liked
                
              },
              { new: true}
            )
              .then((newSauce) => {
                res.status(200).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                res.status(400).json({ message: error });
              });
          }
          if (sauce["usersDisliked"].includes(req.auth.userID)) {
            // if the user is already disliked
            Sauce.findByIdAndUpdate(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 }, // remove a dislike
                $pull: { usersDisliked: req.auth.userID }, // remove the user from the list of users disliked
              },
              {new: true}
            )
              .then((newSauce) => {
                res.status(200).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                res.status(400).json({ message: error });
              });
          }
          if (!sauce["usersDisliked"].includes(req.auth.userID) || !sauce["usersLiked"].includes(req.auth.userID) ) {
            res.status(200).json("Don't need to dislike or undislike")
          }
          break;
        case 1:
          toChange = {
            $inc: { likes: 1 },
            $push: { usersLiked: req.auth.userID },
          };
          if (sauce["usersDisliked"].includes(req.auth.userID)) {
            toChange = {
              $inc: { dislikes: -1, likes: 1 }, // add a dislike and remove a like
              $pull: { usersDisliked: req.auth.userID },
              $push: { usersLiked: req.auth.userID },
            };
          }
          if (!sauce["usersLiked"].includes(req.auth.userID)) {
            Sauce.findByIdAndUpdate({ _id: req.params.id }, toChange, {
              new: true,
            })
              .then((newSauce) => {
                return res.status(200).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                return res.status(400).json({ message: error });
              });
          } else {
            res.status(200).json("User already like the sauce");
          } 
          break;
        default:
          console.error("Bad request");
      }
    })
    .catch();
};

/*****************************************************************
 ***************** REPORT A SAUCE            ********************* 
 *****************************************************************/
exports.reportSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce["usersWhoReportedTheSauce"].includes(req.auth.userID)) { // if the user hasn't already reported the sauce
        Sauce.findByIdAndUpdate(
          { _id: req.params.id },
          {
            $inc: { reports: 1 },
            $push: { usersWhoReportedTheSauce: req.auth.userID },
          },
          { new: true }
        )
          .then((newSauce) => {
            return res.status(200).json(newSauce, hateoasLinks(req, sauce._id));
          })
          .catch((error) => {
            return res.status(400).json({ error: error });
          });
      } else {
        res.status(404).json({ error: "No sauce to report" }); // if the user has already reported the sauce or there is no sauce
      }
    })
    .catch((error) => res.status(500).json({ error }, console.log(error)));
};


/*****************************************************************
 *****************  API RESTFULL SAUCE SETUP ********************* 
 *****************************************************************/
const hateoasLinks = (req, id) => {
  const URI = req.protocol + "://" + req.get("host");
  return [
    {
      rel: "readOne",
      method: "GET",
      href: URI + "/api/sauces/" + id,
      title: "Read sauce",
    },
    {
      rel: "readAll",
      method: "GET",
      href: URI + "/api/sauces",
      title: "Read all sauces",
    },
    {
      rel: "create",
      method: "POST",
      href: URI + "/api/sauces",
      title: "Create a new sauce",
    },
    {
      rel: "update",
      method: "PUT",
      href: URI + "/api/sauces/" + id,
      title: "Update a sauce",
    },
    {
      rel: "delete",
      method: "DELETE",
      href: URI + "/api/sauces/" + id,
      title: "Delete a sauce",
    },
    {
      rel: "likeDislike",
      method: "POST",
      href: URI + "/api/sauces/" + id + "/like",
      title: "Add like or dislike",
    },
    {
      rel: "report",
      title: "Report",
      href: URI + "/api/sauces/" + id + "/report",
      method: "POST",
    },
  ];
};
