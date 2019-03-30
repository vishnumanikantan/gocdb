var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    territory: [],
    level: {type: Number, default: 1},
    task: {type: Number, default: 2},
    opponent: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      name: String,
      count: { type: Number, default: 0}
    },
    count: { type: Number, default: 0},
    ingame: {type: Boolean, default: true},
    swordscapture: [
        {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Sword"
      }
        ]
    
});

module.exports = mongoose.model("User", userSchema);