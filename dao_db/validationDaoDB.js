var validation = require('../model/validations');

module.exports = {

    insert_validation: function (user_id, page_id, company_id, date, name) {
        var validationInsert = new validation({
            user_id: user_id,
            page_id: page_id,
            company_id: company_id,
            date: date,
            name: name,
            age: "",
            q1: "",
            q2: "",
            q3: ""
        });
        validationInsert.save(function (err, result) {
            if (err)
                return err;
        });
    },
    insertAge_validation: function (user_id, company_id, age) {
        validation.updateOne({user_id: user_id, company_id: company_id}, {$set: {age: age}}, {safe: true, upsert: true}, function (err, result) {
            if (err)
                throw err;
        });
    },    
    insertQ1_validation: function (user_id, company_id, q1) {
        validation.updateOne({user_id: user_id, company_id: company_id}, {$set: {q1: q1}}, {safe: true, upsert: true}, function (err, result) {
            if (err)
                throw err;
        });
    },
    insertQ2_validation: function (user_id, company_id, q2) {
        validation.updateOne({user_id: user_id, company_id: company_id}, {$set: {q2: q2}}, {safe: true, upsert: true}, function (err, result) {
            if (err)
                throw err;
        });
    },
    insertQ3_validation: function (user_id, company_id, q3) {
        validation.updateOne({user_id: user_id, company_id: company_id}, {$set: {q3: q3}}, {safe: true, upsert: true}, function (err, result) {
            if (err)
                throw err;
        });
    },
    remove_validation: function (user_id, company_id) {
        validation.remove({user_id: user_id, company_id: company_id}, function (err, result) {
            if (err)
                throw err;
        });
    },
    find_validation: function (user_id, company_id, callback) {
        validation.find({user_id: user_id, company_id: company_id}, function (err, result) {
            if (err)
                throw err;
            return callback(null, result);
        });
    }    
};
