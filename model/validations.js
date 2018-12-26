var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = require('../dao_db/dbConnectionMongoose');

var ValidationSchema = new mongoose.Schema({
  user_id: {type: String},
  page_id: {type: String},
  company_id: {type: Number},  
  date: {type: Date},
  name: {type: String},
  age: {type: Number},
  q1: {type: Number},
  q2: {type: Number},
  q3: {type: Number}
});
db.close();
module.exports = mongoose.model("Validation", ValidationSchema);
