var request = require('../model/requests');

module.exports = {
    insert_request: function (user_id, company_id, date, product, flavor, callback) {
        var requestInsert = new request({
            user_id: user_id,
            //    page_id: page_id,
            company_id: company_id,
            product_type_id: product[0].tipos_produtos_id_tipo_produto,
            product_id: product[0].id_produto,
            product_name: product[0].nome_produto,
            product_value: product[0].valor_unitario_produto,
            flavors: "{'id_flavor_product':" + flavor[0].id_sabor_produto + ", 'name_flavor_product':'" + flavor[0].nome_sabor_produto + "'}",
            date: date
        });
        requestInsert.save(function (err, result) {
            if (!err)
                return callback(null, result.id);
            else
                return callback(err, null);
        });
    },
    find_request: function (user_id, company_id, callback) {
        request.find({user_id: user_id, company_id: company_id}, function (err, request) {
            if (err)
                throw err;
            return callback(null, request);
        });
    },
    findById_request: function (objectId, callback) {
        request.find({_id: objectId}, function (err, request) {
            if (err)
                throw err;
            return callback(null, request);
        });
    },
    remove_request: function (objectId, callback) {
        request.remove({_id: objectId}, function (err, request) {
            if (err)
                throw err;
            return callback(null, request);
        });
    },
    remove_request_client: function (user_id, company_id, callback) {
        request.remove({user_id: user_id, company_id: company_id}, function (err, request) {
            if (err)
                throw err;
            return callback(null, true);
        });
    },
    insertFlavor_request: function (objectId, flavor) {
        request.findByIdAndUpdate({_id: objectId}, {$push: {flavors: "{'id_flavor_product':" + flavor[0].id_sabor_produto + ", 'name_flavor_product':'" + flavor[0].nome_sabor_produto + "'}"}}, {safe: true, upsert: true}, function (err, request) {
            if (err)
                throw err;
            // if (request[0] !== undefined)
            //    console.log(request[0].flavors[0]);
            // request[0].flavors.push("{id_flavor_product:"+flavor[0].id_sabor_produto+", name_flavor_product:'"+flavor[0].nome_sabor_produto+"'}");  
        });
    }
};
