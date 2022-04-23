const Sauce = require("../models/sauce");
const fs = require("fs");

exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add the image url
      res.status(200).json(sauce);
    }) // find the sauce
    .catch((error) => res.status(404).json({ error: "Sauce not found" })); // if not found
};

exports.readAllSauces = (req, res, next) => {
  Sauce.find() // find all the sauces
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl =
          `${req.protocol}://${req.get("host")}/` + sauce.imageUrl; // add image url
        return sauce;
      });
      res.status(200).json(sauces);
    }) // send the sauces
    .catch((error) => res.status(400).json({ error })); // if not found
};

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
    .then(() => res.status(201).json({ message: "Sauce send !" })) // if ok send a message
    .catch((error) => res.status(400).json({ error })); // if not send the error
};

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `images/${req.file.filename}`
    } : { ...req.body }; // if there is a file, add the image url
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // update the sauce
    .then(() => res.status(200).json({ message: "Sauce updated !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; // get the filename
      fs.unlink(`images/${filename}`, () => { // delete the file
        Sauce.deleteOne({ _id: req.params.id }) // delete the sauce
          .then(() => res.status(200).json({ message: "Sauce deleted !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
}

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the sauce
    .then((sauce) => {
      const index = sauce.usersLiked.indexOf(req.body.userId); // get the index of the user
      switch (index) {
        case -1:  // if the user is not in the array
        sauce.usersLiked.push(req.body.userId); // add the user to the array
        sauce.likes += 1; // add a like
        break;
        case 0: // if the user is in the array
        sauce.usersLiked.splice(index, 1); // remove the user from the array
        sauce.likes -= 1; // remove a like
        break;
        case 1: // if the user is in the array
        sauce.usersLiked.splice(index, 1); // remove the user from the array
        sauce.likes -= 1; // remove a like
      }
      sauce
        .save() // save the sauce
        .then(() => res.status(200).json({ message: "Sauce liked !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
    
};


