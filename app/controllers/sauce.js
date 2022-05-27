const Sauce = require("../models/sauce"); // import the sauce model
const fs = require("fs"); // file system

/*****************************************************************
 *****************  READ SAUCE BY ITS ID     *********************
 *****************************************************************/
exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add the image url
      res.status(200).json(sauce, hateoasLinks(req, req.params.id)); // send the sauce
    }) // find the sauce
    .catch((error) => res.status(404).json({ error: "Sauce not found" })); // if not found
};

/*****************************************************************
 *****************  READ ALL THE SAUCES      *********************
 *****************************************************************/
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl =
          `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add image url
        const hateoasLink = hateoasLinks(req, sauce._id);
        return { ...sauce._doc, hateoasLink };
      });
      res.status(200).json(sauces, hateoasLinks(req, sauces._id)); // send the sauces
    }) // send the sauces
    .catch((error) => res.status(404).json({ error })); // if not found
};

/*****************************************************************
 *****************  CREATE ONE SAUCE         *********************
 *****************************************************************/
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // get the sauce object
  delete sauceObject._id; // delete the _id
  const sauce = new Sauce({
    ...sauceObject, // add the sauce object
    imageUrl: `images/${req.file.filename}`,
  }); // create a new sauce
  sauce
    .save() // save the sauce
    .then(() => res.status(201).json(sauce, hateoasLinks(req, sauce._id))) // if ok send a message
    .catch((error) => res.status(403).json({ error })); // if not send the error
};

/*****************************************************************
 *****************  UPDATE ELEMENT IN  SAUCE    ******************
 *****************************************************************/
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `images/${req.file.filename}`,
      }
    : { ...req.body }; // if there is a file, add the image url
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      try {
        if (sauceObject.imageUrl) {
          fs.unlinkSync(sauce.imageUrl.splice(1));
        }
      } catch (error) {
        console.log(error);
      }
    })
    .catch((error) => res.status(500).json({ error: error }));
  Sauce.findOneAndUpdate({ _id: req.params.id }, sauceObject, { new: true }) // update the sauce
    .then((sauce) => res.status(201).json(sauce, hateoasLinks(req, sauce._id)))
    .catch((error) => res.status(500).json({ error: error }));
};

/*****************************************************************
 *****************  DELETE THE SAUCE         *********************
 *****************************************************************/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; // get the filename
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(204).send())
          .catch((error) => res.status(403).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
};

/*****************************************************************
 *****************  LIKE OR DISLIKE A SAUCE    *******************
 *****************  AND SEND THE USER ID       *******************
 *****************  OF THE LIKER OR DISLIKER   *******************
 *****************  TO THE LIKED USER DB       *******************
 *****************************************************************/
exports.likeSauce = (req, res, next) => {
  try {
    Sauce.findById(req.params.id).then((sauce) => {
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
                res.status(201).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                res.status(400).json({ message: error });
              });
          } else {
            res.status(204).json({ message: "User already dislike the sauce" });
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
              { new: true }
            )
              .then((newSauce) => {
                res.status(201).json(newSauce, hateoasLinks(req, sauce._id));
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
              { new: true }
            )
              .then((newSauce) => {
                return res
                  .status(201)
                  .json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                return res.status(400).json({ message: error });
              });
          }
          if (
            !sauce["usersDisliked"].includes(req.auth.userID) &&
            !sauce["usersLiked"].includes(req.auth.userID)
          ) {
            res
              .status(201)
              .json({ message: "Don't need to dislike or undislike" });
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
                res.status(201).json(newSauce, hateoasLinks(req, sauce._id));
              })
              .catch((error) => {
                res.status(400).json({ message: error });
              });
          } else {
            res.status(204).json({ message: "User already like the sauce" });
          }
          break;
        default:
          res.status(400).json({ message: "Bad request" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

/*****************************************************************
 *****************  REPORT THE SAUCE         *********************
 *****************************************************************/
exports.reportSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce["usersWhoReportedTheSauce"].includes(req.auth.userID)) {
        Sauce.findByIdAndUpdate(
          { _id: req.params.id },
          {
            $inc: { reports: 1 },
            $push: { usersWhoReportedTheSauce: req.auth.userID },
          },
          { new: true }
        )
          .then((newSauce) => {
            return res
              .status(201)
              .json(newSauce, hateoasLinks(req, newSauce._id));
          })
          .catch((error) => {
            return res.status(400).json({ error: error });
          });
      } else {
        res.status(404).json({ error: "No sauce to report" });
      }
    })
    .catch((error) => res.status(500).json({ error }, console.log(error)));
};

// hateoas links
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
