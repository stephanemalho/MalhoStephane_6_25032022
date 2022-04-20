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

exports.createSauce = (req, res, next) => {
  const sauceObj = JSON.parse(req.body.sauce);
  delete sauceObj._id;
  const sauce = new Sauce({
    ...sauceObj,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce send !" }))
    .catch((error) => res.status(400).json({ error }));
}

exports.addLike = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 } })
    .then(() => res.status(200).json({ message: "Sauce liked !" }))
    .catch((error) => res.status(400).json({ error }));
}

exports.addDislike = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 } })
    .then(() => res.status(200).json({ message: "Sauce disliked !" }))
    .catch((error) => res.status(400).json({ error }));
}

exports.updateSauce = (req, res, next) => {
  const sauceObj = req.file ? { ...JSON.parse(req.body.sauce), imageUrl: req.file.filename } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObj, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce updated !" }))
    .catch((error) => res.status(400).json({ error }));
}
