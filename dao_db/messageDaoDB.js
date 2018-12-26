var message = require('../model/messages');

module.exports = {

    insert_message: function (user_id, page_id, company_id, date, messageText) {

                message.find({user_id: user_id, company_id: company_id},function (err, count) {
                    if (!err){
                        if (count[0] === undefined){
                            var seq = 1;    
                        }else {
                            var seq = count.length+1;
                        }
                        var messageInsert = new message({
                            user_id: user_id,
                            page_id: page_id,
                            company_id: company_id,
                            date: date,
                            message: messageText,
                            seq: seq
                        });
                        messageInsert.save(function (err, messageInsert) {
                            if (!err) {
                                //console.log(messageInsert);
                            } else
                                console.error(err);
                        });
                    }
                });
    },
    findMax_message: function (user_id, company_id, callback) { 
        message.find({user_id: user_id, company_id: company_id}, function (err, message) {
            if (err) throw err;
            return callback(null, message);
        }).sort({seq: -1}).limit(1);
    },
    remove_message: function (user_id, company_id, callback) { 
        message.remove({user_id: user_id, company_id: company_id}, function (err, message) {
            if (err) throw err;
            return callback(null, message);
        });
    }      
};
