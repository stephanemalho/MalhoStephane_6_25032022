const Sauce = require("../models/sauce"); // import the sauce model
const fs = require("fs"); // file system

// get one sauce
exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add the image url
      res.status(200).json(sauce, hateoasLinks(req, req.params.id)); // send the sauce
    }) // find the sauce
    .catch((error) => res.status(404).json({ error: "Sauce not found" })); // if not found
};

// get all the sauces
exports.readAllSauces = (req, res, next) => {
  Sauce.find() // find all the sauces
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl =
          `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add image url
          const hateoasLink =  hateoasLinks(req, sauce._id);
          return {...sauce._doc, hateoasLink}
      });
      res.status(200).json(sauces);
    }) // send the sauces
    .catch((error) => res.status(400).json({ error })); // if not found
};

// create the sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // get the sauce object
  delete sauceObject._id; // delete the _id
  const sauce = new Sauce({
    ...sauceObject, // add the sauce object
    imageUrl: `images/${
      req.file.filename // add the image url
    }`,
  }); // create a new sauce
  sauce
    .save() // save the sauce
    .then(() => res.status(201).json(sauce, hateoasLinks(req, sauce._id))) // if ok send a message
    .catch((error) => res.status(400).json({ error })); // if not send the error
};

// update the sauce
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `images/${req.file.filename}`
    } : { ...req.body }; // if there is a file, add the image url
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // update the sauce
    .then(() => res.status(200).json( { message: "The update as been sent " }, hateoasLinks(req, Sauce._id)))
    .catch((error) => res.status(400).json({ error: error }));
};

// delete the sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; // get the filename
      fs.unlink(`images/${filename}`, () => { 
        Sauce.deleteOne({ _id: req.params.id }) 
          .then(() => res.status(200).json({ message: "Sauce deleted !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
}

// likes methods
exports.likeSauce = (req, res, next) => {
   Sauce.findById(req.params.id) // find the sauce
        .then((sauce) => {
          let toChange = {};
          switch (req.body.like) { 
            
            case -1: 
            toChange = {
              $inc: { dislikes: 1}, // add a dislike
              $push: { usersDisliked: req.body.userId }, // add the user to the list of users disliked
            }
            if (sauce["usersLiked"].includes(req.body.userId)) {
                toChange = {
                  $inc: { dislikes: 1, likes: -1}, // add a dislike and remove a like
                  $push: { usersDisliked: req.body.userId }, 
                  $pull: { usersLiked: req.body.userId } 
                }
            } 
              Sauce.updateOne(
                { _id: req.params.id },
                toChange
              )
                .then(() => {
                  res.status(200).json({ message: "your dislike as been sent!" }); 
                })
                .catch((error) => {
                  res.status(400).json({ error: error });
                });
              break;
            case 0:
                  if (sauce["usersLiked"].includes(req.body.userId)) { // if the user is already liked
                    Sauce.updateOne(
                      { _id: req.params.id },
                      {
                        $inc: { likes: -1}, // remove a like
                        $pull: { usersLiked: req.body.userId }, // remove the user from the list of users liked
                      }
                    )
                      .then(() => {
                        res.status(200).json({ message: "User liked removed" });
                      })
                      .catch((error) => {
                        res.status(400).json({ error: error }); 
                      });
                  }
                  if (sauce["usersDisliked"].includes(req.body.userId)) { // if the user is already disliked
                    Sauce.updateOne(
                      { _id: req.params.id },
                      {
                        $inc: { dislikes: -1},  // remove a dislike
                        $pull: { usersDisliked: req.body.userId }, // remove the user from the list of users disliked
                      }
                    )
                      .then(() => {
                        res.status(200).json({ message: "User disliked removed" });
                      })
                      .catch((error) => {
                        res.status(400).json({ error: error });
                      });
                  }
              break;
            case 1:
              toChange = {
                $inc: { likes: 1},
                $push: { usersLiked: req.body.userId }, 
              }
              if (sauce["usersDisliked"].includes(req.body.userId)) {
                  toChange = {
                    $inc: { dislikes: -1, likes: 1}, // add a dislike and remove a like
                    $pull: { usersDisliked: req.body.userId }, 
                    $push: { usersLiked: req.body.userId } 
                  }
              }
              Sauce.updateOne( 
                { _id: req.params.id }, 
                toChange 
              )
                .then(() => {
                  res.status(200).json( sauce,  hateoasLinks(req, sauce._id) ); 
                })
                .catch((error) => {
                  console.log(error);
                  res.status(400).json({ error: error });
                });
              break;
            default:
              console.error("Bad request");
          }
        })
        .catch();
};



// hateoas links
const hateoasLinks = (req, id) => { 
  const URI = req.protocol + "://" + req.get("host");
  return [
    {
      rel: "readSauce",
      method: "GET",
      href: URI + "/api/sauces/" + id,
      title: "Read sauce",
    },
    {
      rel: "readAllSauces",
      method: "GET",
      href: URI + "/api/sauces",
      title: "Read all sauces",
    },
    {
      rel: "create",
      method: "POST",
      href: URI + "/api/sauces",
      title: "Create a new sauce"
    },
    {
      rel: "update",
      method: "PUT",
      href: URI + "/api/sauces/" + id,
      title: "Update a sauce"
    },
    {
      rel: "delete",
      method: "DELETE",
      href: URI + "/api/sauces/" + id,
      title: "Delete a sauce"
    },
    {
      rel: "like",
      method: "POST",
      href: URI + "/api/sauces/" + id + "/like",
      title: "Add like"
    },
    {
      rel: "dislike",
      method: "POST",
      href: URI + "/api/sauces/" + id + "/dislike",
      title: "Remove like"
    }
  ]
}

