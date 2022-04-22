const Sauce = require("../models/sauce");

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.usersLiked.includes(req.body.userId)) {
        res.status(400).json({ error: "You already liked this sauce !" });
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(200).json({ message: "Sauce liked !" }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(200).json({ message: "Sauce liked !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
}

