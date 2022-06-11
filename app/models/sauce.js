const mongoose = require("mongoose");

//This sauce schema contain the userId, name, url, manufacturer, description, main pepper,imageUrl, heat, likes, dislikes, user who like or dislike, and RGPD report + reporter ID.
const sauceSchema = mongoose.Schema({
  userId: 
    { 
      type: String,
      required: true, 
      ref: "User" 
    },
  name: 
    { 
      type: String, 
      required: true 
    },
  manufacturer: 
    { 
      type: String, 
      required: true 
    },
  description: 
    { 
      type: String, 
      required: true 
    },
  mainPepper: 
    { 
      type: String, 
      required: true 
    },
  imageUrl: 
    { 
      type: String, 
      required: true 
    },
  heat: 
    { 
      type: Number, 
      required: true 
    },
  likes: 
    { 
      type: Number, 
      default: 0 
    },
  dislikes: 
    { 
      type: Number, 
      default: 0 
    },
  usersLiked: 
    [{ 
      type: String,
      ref: "User" 
    }],
  usersDisliked: 
    [{ 
      type: String,
      ref: "User"
    }], 
    reports: 
    { 
      type: Number, 
      default: 0 
    },
    usersWhoReportedTheSauce: 
    [{ 
      type: String,
      ref: "User" 
    }]
}, {timestamps: true});



module.exports = mongoose.model("Sauce", sauceSchema); // better call Sauce 
