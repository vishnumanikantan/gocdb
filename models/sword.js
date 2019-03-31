var mongoose = require("mongoose");

var swordSchema = new mongoose.Schema({
    sname: String,
    bearer: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      house: String
    },
    scanned: {type: Boolean, default: false}
    
});

module.exports = mongoose.model("Sword", swordSchema);