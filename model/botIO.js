var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = require('../dao_db/dbConnectionMongoose');

var BotIOSchema = new mongoose.Schema({
    outCommand: {type: Number},
    inputString: [{type: String}],
    weight: {type: Number}
});
db.close();
module.exports = mongoose.model("BotIO", BotIOSchema);
