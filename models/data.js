var mongoose = require("mongoose");

var dataSchema = new mongoose.Schema({
    name: String,
    territory: [],
    level: {type: Number, default: 1},
    task: {type: Number, default: 1},
    opponent: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
    },
    swordscapture: []
    
});

module.exports = mongoose.model("Data", dataSchema);