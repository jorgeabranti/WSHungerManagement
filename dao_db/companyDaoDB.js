var con = require('./dbConnectionMysql');
var distance = require('google-distance-matrix');
module.exports = {
    valida_id_page_empresa: function (page_id, callback) {
        try {
            con.connect(function () {
                con.query('select *, now() as date, DAYOFWEEK(NOW()) as day from empresas where status_empresa = 1 and id_page_empresa = ?', [page_id], function (err, rows, fields) {
                    if (!err) {
                        //  console.log(rows);
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });              
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    horarios_atendimento_empresa: function (company_id, callback) {
        try {
            con.connect(function () {
                con.query('select * from horarios_atendimento where empresas_id_empresa = ?', [company_id], function (err, rows, fields) {
                    if (!err) {
                        //  console.log(rows);
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_cliente_empresa_chatbot: function (senderId, id_empresa, userProfile) {
        try {
            con.connect(function () {
                console.log(senderId+' '+id_empresa+' '+userProfile.first_name)
                con.query('INSERT INTO clientes ' +
                        '(empresas_id_empresa,' +
                        'nome_cliente,' +
                        'id_rede_social_cliente,' +
                        ' ultimo_contato) ' +
                        'VALUES(?, ?, ?, NOW())', [id_empresa, userProfile.first_name + " " + userProfile.last_name, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                console.log(err);
                                return false;
                            }
                        });
            });

        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_cliente_empresa_chatbot: function (senderId, id_empresa, callback) {
        try {
            con.connect(function () {
                con.query('select * from clientes where empresas_id_empresa = ? and id_rede_social_cliente = ?', [id_empresa, senderId], function (err, rows) {
                    if (!err) {
                        return callback(null, rows);
                    } else {
                        return callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_formas_pagamento_empresa: function (id_empresa, callback) {
        try {
            con.connect(function () {
                con.query('select formas_pagamento.nome_forma_pagamento, formas_pagamento_empresa.id_forma_pagamento_empresa ' +
                        'from formas_pagamento_empresa ' +
                        'inner join formas_pagamento on formas_pagamento_empresa.formas_pagamento_id_forma_pagamento = formas_pagamento.id_forma_pagamento ' +
                        'where empresas_id_empresa = ? ' +
                        'and status_forma_pagamento_empresa = 1 ' +
                        'limit 4', [id_empresa], function (err, rows) {
                    if (!err) {
                        return callback(null, rows);
                    } else {
                        console.log(err);
                        return callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_rua_endereco_cliente_chatbot: function (rua_endereco, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET endereco_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [rua_endereco, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_numero_endereco_cliente_chatbot: function (numero_endereco, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET endereco_numero_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [numero_endereco, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_bairro_endereco_cliente_chatbot: function (bairro_endereco, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET bairro_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [bairro_endereco, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_cidade_endereco_cliente_chatbot: function (cidade_endereco, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET cidade_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [cidade_endereco, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_pedido_chatbot: function (senderId, id_empresa, pedido, payment_id, deliveryValue, callback) {
        var somaPedido = 0;
        for (var item in pedido) {
            somaPedido = somaPedido + pedido[item].product_value;
        }
        somaPedido = somaPedido + deliveryValue;
        console.log(somaPedido);
        try {
            con.connect(function () {
                con.query('SELECT id_cliente FROM clientes WHERE id_rede_social_cliente = ? and empresas_id_empresa = ?', [senderId, id_empresa], function (err, id_cliente) {
                    if (!err) {
                        con.query('INSERT INTO pagamentos_pedidos (' +
                                'data_pagamento_pedido,' +
                                'valor_pago,' +
                                'bandeira_cartao,' +
                                'id_transacao,' +
                                'formas_pagamento_empresa_id_forma_pagamento_empresa)' +
                                'VALUES(NOW(), ?, ?, ?, ?)', [somaPedido, null, null, payment_id],
                                function (err, payment_insertedId) {
                                    if (!err) {
                                        con.query('INSERT INTO pedidos (' +
                                                'status_pedido,' +
                                                'taxa_entrega_pedido,' +
                                                'data_pedido,' +
                                                'data_ultimo_status_pedido,' +
                                                'total_valor_pedido,' +
                                                'usuarios_id_usuario,' +
                                                'clientes_id_cliente, ' +
                                                'pagamento_pedido_id_pagamento_pedido,' +
                                                'empresas_id_empresa) ' +
                                                'VALUES(1, ?, NOW(), NOW(), ?, -1, ?, ?, ?)', [deliveryValue, somaPedido, id_cliente[0].id_cliente, payment_insertedId.insertId, id_empresa],
                                                function (err, request) {
                                                    if (!err) {
                                                        for (var item in pedido) {
                                                            for (var i = 0; i < pedido[item].flavors.length; i++) {
                                                                var replaced = pedido[item].flavors[i].replaceAll('\'', '\"');
                                                                var flavor = JSON.parse(replaced);
                                                                con.query('INSERT INTO pedidos_sabores_produtos (' +
                                                                        'id_item,' +
                                                                        'sabores_produtos_id_sabor_produto,' +
                                                                        'produtos_id_produto,' +
                                                                        'pedidos_id_pedido) ' +
                                                                        'VALUES(?, ?, ?, ?)', [item + 1, flavor.id_flavor_product, pedido[item].product_id, request.insertId],
                                                                        function (err, result) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                            }
                                                        }
                                                        return callback(null,request.insertId);
                                                    } else {
                                                        console.log(err);
                                                        return callback(err,null);
                                                    }
                                                });  
                                    } else {
                                        console.log(err);
                                    }
                                });
                    } else {
                        console.log(err);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    limpa_endereco_cliente_chatbot: function (senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET cidade_cliente = null, ' +
                        'endereco_cliente = null, ' +
                        'endereco_numero_cliente = null, ' +
                        'bairro_cliente = null ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_pedido_empresa: function (id_pedido, callback) {
        try {
            con.connect(function () {
                con.query('select pedidos.id_pedido, entregadores.nome_entregador, entregadores.placa_entregador, clientes.id_rede_social_cliente' +
                        ' from pedidos ' +
                        'inner join entregadores on pedidos.entregadores_id_entregador = entregadores.id_entregador ' +
                        'inner join clientes on pedidos.clientes_id_cliente = clientes.id_cliente ' +
                        'where id_pedido = ?', [id_pedido], function (err, rows, fields) {
                    if (!err) {
                        //  console.log(rows);
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_pedido_aberto_cliente: function (id_rede_social_cliente, id_empresa, callback) {
        try {
            con.connect(function () {
                con.query('select pedidos.* '+
                            ' from pedidos '+
                            ' inner join clientes on pedidos.clientes_id_cliente = clientes.id_cliente '+                          
                            ' where id_rede_social_cliente = ? '+
                            ' and pedidos.empresas_id_empresa = ? '+
                            ' and status_pedido < 4 '+
                            ' order by pedidos.id_pedido', [id_rede_social_cliente, id_empresa], function (err, rows, fields) {
                    if (!err) {
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    }, 
    carrega_itens_pedido_cliente: function (id_pedido, callback) {
        try {
            con.connect(function () {
                con.query('select pedidos_sabores_produtos.id_item,produtos.nome_produto '+
                        ' from produtos '+ 
                        ' inner join pedidos_sabores_produtos on produtos.id_produto = pedidos_sabores_produtos.produtos_id_produto '+
                        ' where pedidos_id_pedido = ? '+
                        ' group by pedidos_sabores_produtos.id_item', [id_pedido], function (err, rows, fields) {
                    if (!err) {
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_sabores_pedido_cliente: function (id_pedido, id_item, callback) {
        try {
            con.connect(function () {
                con.query('select sabores_produtos.nome_sabor_produto '+
                        ' from sabores_produtos '+
                        ' inner join pedidos_sabores_produtos on sabores_produtos.id_sabor_produto = pedidos_sabores_produtos.sabores_produtos_id_sabor_produto '+
                        ' where  pedidos_sabores_produtos.pedidos_id_pedido = ? '+
                        ' and pedidos_sabores_produtos.id_item = ?', [id_pedido, id_item], function (err, rows, fields) {
                    if (!err) {
                        if (rows.length !== 0) {
                            callback(null, rows);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    calcula_frete: function (id_rede_social_cliente, id_empresa, callback) {
        try {
            con.connect(function () {
                con.query('select * '+
                        ' from empresas '+
                        ' inner join clientes on empresas_id_empresa = id_empresa '+
                        ' where id_empresa = ? '+
                        ' and id_rede_social_cliente = ?', [id_empresa, id_rede_social_cliente], function (err, rows) {
                    if (!err) {
                        var valor_frete;
                        if (rows[0].utilizar_taxa_fixa === 1) {
                            valor_frete = rows[0].taxa_fixa_entrega;
                            callback(null,valor_frete);  
                        } else if (rows[0].utilizar_taxa_fixa === 0){            
                            if (rows[0].distancia_endereco_km === null) {
                                var origins = [rows[0].endereco_empresa+","+rows[0].endereco_numero_empresa+","+rows[0].bairro_empresa+","+rows[0].cidade_empresa+","+rows[0].cidade_empresa+","+rows[0].uf_empresa];
                                var destinations = [rows[0].endereco_cliente+","+rows[0].endereco_numero_cliente+","+rows[0].bairro_cliente+","+rows[0].cidade_cliente+","+rows[0].uf_cliente];
                                distance.key('AIzaSyD_6bsGtHRG86P3RlEbNNmiUKcaKA8Yxwc');
                                distance.units('metric');
                                distance.matrix(origins, destinations, function (err, distances) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    if(!distances) {
                                        return console.log('no distances');
                                    }
                                    if (distances.status === 'OK') {
                                       for (var i=0; i < origins.length; i++) {
                                            for (var j = 0; j < destinations.length; j++) {
                                                var origin = distances.origin_addresses[i];
                                                var destination = distances.destination_addresses[j];

                                                if (distances.rows[0].elements[j].status === 'OK') {
                                                    var distance = distances.rows[i].elements[j].distance.text;
                                                    console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                                                    var distanceClean = distance.replace('km', '');
                                                    con.query('update clientes set distancia_endereco_km = ? where id_cliente = ?', [distanceClean, rows[0].id_cliente], function (err, rows) {});
                                                    valor_frete = rows[0].taxa_km_entrega * parseFloat(distanceClean);
                                                    callback(null,valor_frete);
                                                } else {
                                                    console.log(destination + ' is not reachable by land from ' + origin);
                                                }
                                            }
                                        }
                                    }
                                });
                            } else {
                                valor_frete = rows[0].taxa_km_entrega * parseFloat(rows[0].distancia_endereco_km);
                                callback(null,valor_frete);                            
                            }
                        }
                    } else {
                        callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    carrega_formas_pagamento_escolhida: function (id_forma_pagamento_empresa,callback) {
        try {
            con.connect(function () {
                con.query('select formas_pagamento.nome_forma_pagamento, formas_pagamento_empresa.id_forma_pagamento_empresa ' +
                        'from formas_pagamento_empresa ' +
                        'inner join formas_pagamento on formas_pagamento_empresa.formas_pagamento_id_forma_pagamento = formas_pagamento.id_forma_pagamento ' +
                        'where id_forma_pagamento_empresa = ? ', [id_forma_pagamento_empresa], function (err, rows) {
                    if (!err) {
                        return callback(null, rows);
                    } else {
                        return callback(err, null);
                    }
                });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_telefone_celular_cliente_chatbot: function (telefone_celular_cliente, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET telefone_celular_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [telefone_celular_cliente, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    salva_telefone_residencial_cliente_chatbot: function (telefone_residencial_cliente, senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET telefone_residencial_cliente = ? ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [telefone_residencial_cliente, id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    
    atualiza_ultimo_contato: function (senderId, id_empresa) {
        try {
            con.connect(function () {
                con.query('UPDATE clientes ' +
                        'SET ultimo_contato = now() ' +
                        'WHERE empresas_id_empresa = ? ' +
                        'AND id_rede_social_cliente = ? ', [id_empresa, senderId],
                        function (err, result) {
                            if (!err) {
                                console.log(result.affectedRows);
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    },
    
    salva_validacao_chatbot: function (validation) {
        try {
            con.connect(function () {
                con.query('INSERT INTO validacao_chatbot ' +
                        ' (nome, idade, q1, q2, q3) ' +
                        ' VALUES(?, ?, ?, ?, ?)', [validation[0].name, validation[0].age, validation[0].q1, validation[0].q2, validation[0].q3],
                        function (err, result) {
                            if (!err) {
                                return true;
                            } else {
                                return false;
                            }
                        });
            });
        } catch (ex) {
            console.log("EXCEPTION : " + ex);
        }
    }      
};
