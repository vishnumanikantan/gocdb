var mongoose = require("mongoose");

var swordSchema = new mongoose.Schema({
    sname: String,
    bearer: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
    },
    count: {type: Number, default: 0}
    
});

module.exports = mongoose.model("Sword", swordSchema);