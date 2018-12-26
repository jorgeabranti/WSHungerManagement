var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = require('../dao_db/dbConnectionMongoose');

var RequestSchema = new mongoose.Schema({ 
  user_id: {type: String},
 // page_id: {type: String},
  company_id: {type: Number},
  product_type_id: {type: Number},
  product_id: {type: Number},
  product_name: {type: String},
  product_value: {type: Number},
  flavors: [{type: String}],  
  date: {type: Date}
});
db.close();
module.exports = mongoose.model("Requests", RequestSchema);