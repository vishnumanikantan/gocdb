var mongoose = require("mongoose");

var swordSchema = new mongoose.Schema({
    snum: Number,
    bearerhouse: String, 
    isscanned: {type: Boolean, default: false}
    
});

module.exports = mongoose.model("Sword", swordSchema);