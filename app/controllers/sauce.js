const Sauce = require("../models/sauce");

// exports.createSauce = (req, res, next) => {
//   const sauceObj = JSON.parse(req.body.sauce);
//   const sauce = new Sauce({
//     ...sauceObj,
//   });
//   sauce
//     .save()
//     .then(() => res.status(201).json({ sauce, message: "Sauce send" }))
//     .catch((error) => res.status(422).json({ error }));
// };

exports.createSauce = (req, res, next) => {
  const sauceObj = JSON.parse(req.body.sauce);
  delete thingObject._id;
  const sauce = new Sauce({
    ...sauceObj,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce send !'}))
    .catch(error => res.status(400).json({ error }));
};



exports.readSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json({ sauce, message: "Sauce founded" });
    })
    .catch((error) => res.status(404).json({ error: "Sauce not found" }));
};
