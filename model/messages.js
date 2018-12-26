var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = require('../dao_db/dbConnectionMongoose');

var MessagesSchema = new mongoose.Schema({
  user_id: {type: String},
  page_id: {type: String},
  company_id: {type: Number},  
  date: {type: Date},
  message: {type: String},
  seq: {type: Number}
});
db.close();
module.exports = mongoose.model("Message", MessagesSchema);
