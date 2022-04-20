const Sauce = require("../models/sauce");



exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json({ sauce, message: "Sauce founded" });
    })
    .catch((error) => res.status(404).json({ error: "Sauce not found" }));
}

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
}

exports.getAllSaucesByUserId = (req, res, next) => {
  Sauce.find({ userId: req.params.userId })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
}

