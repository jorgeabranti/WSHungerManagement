var con = require('./dbConnectionMysql');


module.exports = {

    listProductsCompany: function (page_id, productTypeId, callback) {
        try {
            con.query('select p.* from produtos p'
                    + ' inner join tipos_produtos tp on p.tipos_produtos_id_tipo_produto = tp.id_tipo_produto'
                    + ' inner join empresas e on tp.empresas_id_empresa = e.id_empresa'
                    + ' where p.status_produto = 1'
                    + ' and e.id_page_empresa = ?'
                    + ' and p.tipos_produtos_id_tipo_produto = ?'
                    + ' order by p.id_produto', [page_id, productTypeId], function (err, rows, fields) {
                if (!err) {
                    return callback(null, rows);
                } else {
                    //console.log(err);
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },

    listProductTypeCompany: function (page_id, callback) {

        try {
            con.query('select distinct tp.* from tipos_produtos tp'
                    + ' inner join empresas e on tp.empresas_id_empresa = e.id_empresa'
                    + ' inner join sabores_produtos sp on tp.id_tipo_produto = sp.tipos_produtos_id_tipo_produto '
                    + ' where tp.status_tipo_produto = 1'
                    + ' and e.id_page_empresa = ?', [page_id], function (err, rows, fields) {
                if (!err) {
                    return callback(null, rows);
                } else {
                    //console.log(err);
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },

    listFlavorsProduct: function (product_type_id, maxId, callback) {
        try {
            con.query('select spe.*,maxspe.maxId_table from '+
                        '(select sp.* '+
                        'from sabores_produtos sp '+
                        'where sp.status_sabor_produto = 1 '+
                        'and sp.tipos_produtos_id_tipo_produto = ? '+
                        'and sp.id_sabor_produto > ? limit 4) spe, ' +
                        '(select max(sp.id_sabor_produto) maxId_table '+
                        'from sabores_produtos sp '+
                        'where sp.status_sabor_produto = 1 '+
                        'and sp.tipos_produtos_id_tipo_produto = ?) maxspe', [product_type_id, maxId, product_type_id], function (err, rows, fields) {
                if (!err) {
                    return callback(null, rows);
                } else {
                    //console.log(err);
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
 
    findByIdProduct: function (product_id, callback) {
        try {
            con.query('select * from produtos '+
                      ' where id_produto = ?'+
                      ' and status_produto = 1', [product_id], function (err, rows) {
                if (!err) {
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    }, 
 
    findFlavorProduct: function (flavor_id, callback) {
        try {
            con.query('select sp.* from sabores_produtos sp' +
                    ' where sp.id_sabor_produto = ?', [flavor_id], function (err, rows) {
                if (!err) {
                    
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    
    findByNameTypeProduct: function (product_type_name, callback) {
        try {
            con.query('select distinct p.* from produtos p '+ 
                ' inner join tipos_produtos tp on p.tipos_produtos_id_tipo_produto = tp.id_tipo_produto '+
                ' inner join sabores_produtos sp on tp.id_tipo_produto = sp.tipos_produtos_id_tipo_produto '+ 
                ' where tp.nome_tipo_produto like ? '+ 
                ' and tp.empresas_id_empresa = 1 '+
                ' and tp.status_tipo_produto = 1 '+
                ' and p.status_produto = 1', '%' + [product_type_name] + '%', function (err, rows) {
                if (!err) {
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    }     
};
