var mongoose = require("mongoose");

var territorySchema = new mongoose.Schema({
    tnum: Number,
    king: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      name: String
    }
    
});

module.exports = mongoose.model("Territory", territorySchema);