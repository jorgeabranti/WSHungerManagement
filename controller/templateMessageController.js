var request = require('request');
var PAGE_ACCESS_TOKEN = require('../controller/tokensController').pageAcessToken();
var productDaoDB = require('../dao_db/productDaoDB');
var companyDaoDB = require('../dao_db/companyDaoDB');
var sendMessage = require('../controller/sendMessageController');
var requestSchema = require('../dao_db/requestDaoDB');
module.exports = function () {

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    ;
//Exibe opçoes iniciais************************************************************
    this.serviceOptions = function (senderId) {
        var elements = [];
        elements[0] = {title: "Cardápio",
            subtitle: "Clique no texto abaixo ↘",
            image_url: "https://wshungermanagement.herokuapp.com/images/notepad_icon.png",
            buttons: [
                {title: "Ver Cardápio",
                    type: "postback",
                    payload: "{Id:0, command:3}"}]};
        elements[1] = {title: "Horários de atendimento:",
            subtitle: "Clique no texto abaixo ↘",
            image_url: "https://wshungermanagement.herokuapp.com/images/mat_relogio.sorrir.gif",
            buttons: [{title: 'Ver Horário',
                    type: "postback",
                    payload: "{Id:0, command:1}"}]};
        elements[2] = {title: "Pedidos em aberto",
            subtitle: "Clique no texto abaixo ↘",
            image_url: "https://wshungermanagement.herokuapp.com/images/evaluation.jpg",
            buttons: [{title: "Ver Pedidos",
                    type: "postback",
                    payload: "{Id:0, command:2}"}]};

        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: []
                    }
                }
            }
        };
        messageData.message.attachment.payload.elements = elements;
        sendMessage.callSendAPI(messageData);
    };
//Envia mensagem de texto genérica************************************************************
    this.returnDefault = function (senderId, messageText) {
        sendMessage.sendMessageText(senderId, messageText);
    };
    this.sendMessageTyping = function (senderId) {
        sendMessage.sendMessageTyping(senderId);
    };
//Retorna dados de usuário do cliente************************************************************
    this.getUserProfile = function (recipientId, callback) {
        // <USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=PAGE_ACCESS_TOKEN 
        //fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=
        request.get("https://graph.facebook.com/v2.6/" + recipientId + "?fields=first_name,last_name&access_token=" + PAGE_ACCESS_TOKEN,
                function (error, response, body) {
                    if (error) {
                        console.log("Error get profile");
                    } else {
                        var userObj = JSON.parse(body);
                        return callback(null, userObj);
                    }
                });
    };
//Mensagem de bem vindo************************************************************
    this.sendWelcome = function (senderId) {
        request.get("https://graph.facebook.com/v2.6/" + senderId + "?fields=first_name&access_token=" + PAGE_ACCESS_TOKEN,
                function (error, response, body) {
                    var messageText = "";
                    if (error) {
                        console.log("Error getting user's name: " + error);
                    } else {
                        var bodyObj = JSON.parse(body);
                        messageText = "Oi " + bodyObj.first_name + "! :D ";
                    }
                    //messageText = messageText + "Em que posso lhe ajudar?";
                    sendMessage.sendMessageText(senderId, messageText);
                    ;
                });
    };
//Listagem de produtos************************************************************
    this.listProducts = function (pageID, senderId, productTypeId) {
        productDaoDB.listProductsCompany(pageID, productTypeId, function (err, result) {
            if (err) {
                console.log("Query error: " + err);
            } else {
                var elements = [];
                for (var product in result) {
                    if (result[product].produto_img !== null) {
                        var image = "http://hungermanagement.dominiobinario.kinghost.net/img/products/" + result[product].produto_img;
                    } else {
                        var image = "https://wshungermanagement.herokuapp.com/images/cook.jpg";
                    }
                    elements[product] = {title: "" + result[product].nome_produto + "",
                        subtitle: "" + result[product].descricao_produto + ", R$" + Number(result[product].valor_unitario_produto).toFixed(2) + "",
                        image_url: image,
                        buttons: [
                            {
                                title: "Voltar",
                                type: "postback",
                                payload: "{command: 3}"
                            }, {
                                title: "Pedir",
                                type: "postback",
                                payload: "{product_id:" + result[product].id_produto + ",command: 5,productTypeId:" + productTypeId + ",maxId: 0}"
                            }]};
                }
                var messageData = {
                    messaging_type: 'RESPONSE',
                    recipient: {
                        id: senderId
                    },
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "generic",
                                elements: []
                            }
                        }
                    }
                };
                messageData.message.attachment.payload.elements = elements;
                sendMessage.callSendAPI(messageData);
            }
        });
    };
//Listagem de tipos de produtos************************************************************
    this.listProductType = function (pageID, senderId) {
        productDaoDB.listProductTypeCompany(pageID, function (err, result) {
            if (!err && result.length !== 0) {
                var quick_replies = [];
                for (var product in result) {
                    quick_replies[product] = {content_type: "text",
                        title: "" + result[product].nome_tipo_produto + "",
                        payload: "{productTypeId:" + result[product].id_tipo_produto + ",command: 4}"
                    };
                }
                var messageData = {
                    messaging_type: 'RESPONSE',
                    recipient: {
                        id: senderId
                    }, 
                    message: {
                        text: "Clica na tua escolha ai embaixo ou digita o nome do produto 👇",
                        quick_replies: []
                    }
                };
                messageData.message.quick_replies = quick_replies;
                sendMessage.callSendAPI(messageData);
            } else {
                console.log("Query error: " + err);
            }
        });
    };
//Listagem de sabores dos produtos************************************************************
    this.listFlavorsProduct = function (productTypeId, product_id, senderId, maxId, object_id) {
        var elements = [];
        var buttons = [];
        productDaoDB.listFlavorsProduct(productTypeId, maxId, function (err, result) {
            if (!err) {
                for (var flavor in result) {
                    elements[flavor] = {title: "" + result[flavor].nome_sabor_produto + "",
                        subtitle: "" + result[flavor].descricao_sabor_produto + "",
                        image_url: "https://wshungermanagement.herokuapp.com/images/cook.jpg",
                        buttons: [{
                                title: "Pedir " + result[flavor].nome_sabor_produto + "",
                                type: "postback",
                                payload: "{flavor_id:" + result[flavor].id_sabor_produto + ",command: 6,product_type_id: " + productTypeId + ",product_id:" + product_id + ",object_id:*" + object_id + "*}"
                            }]};
                    if (result[flavor].id_sabor_produto > maxId) {
                        maxId = result[flavor].id_sabor_produto;
                    }
                    if (maxId === result[flavor].maxId_table) {
                        maxId = 0;
                    }
                }
                buttons[0] = {title: "Mais sabores",
                    type: "postback",
                    payload: "{productTypeId:" + productTypeId + ",maxId:" + maxId + ",command: 5,product_id:" + product_id + ",object_id:*" + object_id + "*}"};
                var messageData = {
                    messaging_type: 'RESPONSE',
                    recipient: {
                        id: senderId
                    },
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "list",
                                top_element_style: "compact",
                                elements: [],
                                buttons: []
                            }
                        }
                    }
                };
                messageData.message.attachment.payload.elements = elements;
                messageData.message.attachment.payload.buttons = buttons;
                sendMessage.callSendAPI(messageData);
            } else {
                console.log("Query error: " + err);
            }
        });
    };
//Recibo de pedido************************************************************    
    this.orderReceipt = function (senderId, id_empresa, requests, payment_id, deliveryValue, request) {
        var elements = [], sumProdct = 0, forma_pagamento;

        for (var product in requests) {
            elements[product] = {title: "" + requests[product].product_name + "",
                //    "subtitle: ''," +
                image_url: 'https://wshungermanagement.herokuapp.com/images/cook.jpg',
                quantity: "" + 1 + "",
                price: "" + requests[product].product_value + "",
                currency: "USD"};
            sumProdct = sumProdct + requests[product].product_value;
            var date = requests[product].date;
        }
        subtotal = sumProdct;
        total_cost = sumProdct + deliveryValue;
        companyDaoDB.carrega_cliente_empresa_chatbot(senderId, id_empresa, function (err, client) {
            companyDaoDB.carrega_formas_pagamento_escolhida(payment_id, function (err, payment) {
                var d = new Date(date);
                var timeStamp = d.getTime();
                var str = timeStamp.toString();
                var time = str.substr(0, 10);
                //console.log(time);
                if (client[0].cep_cliente === null) {
                    var cep = "indefinido";
                } else {
                    var cep = client[0].cep_cliente;
                }
                var messageData = {
                    messaging_type: "RESPONSE",
                    recipient: {
                        id: senderId
                    },
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                "template_type": "receipt",
                                "recipient_name": client[0].nome_cliente,
                                "order_number": request,
                                "currency": "USD",
                                "payment_method": payment[0].nome_forma_pagamento,
                                "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                                "timestamp": time,
                                "address": {
                                    "street_1": client[0].endereco_cliente + " - " + client[0].endereco_numero_cliente,
                                    "street_2": client[0].bairro_cliente,
                                    "city": client[0].cidade_cliente,
                                    "postal_code": cep,
                                    "state": client[0].uf_cliente,
                                    "country": "BR"
                                },
                                "summary": {
                                    "subtotal": subtotal,
                                    "shipping_cost": deliveryValue,
                                    // "total_tax": 6.19,
                                    "total_cost": total_cost
                                },
                                "adjustments": [/*
                                 {
                                 "name": "New Customer Discount",
                                 "amount": 20
                                 },
                                 {
                                 "name": "$10 Off Coupon",
                                 "amount": 10
                                 }*/
                                ],
                                elements: ""
                            }
                        }
                    }
                };
                messageData.message.attachment.payload.elements = elements;
                //  console.log(JSON.stringify(messageData));
                sendMessage.callSendAPI(messageData);
            });
        });
    };
//Pedidos não finalizados pelo cliente************************************************************
    this.unfinishedRequests = function (pageID, senderId, pedido) {
        var elements = [];
        for (var item in pedido) {
            var flavorsProduct = "";
            pedido[item].flavors.forEach(function (flavor) {
                JObject = (new Function('return ' + flavor))();
                flavorsProduct = flavorsProduct + JObject.name_flavor_product + ". ";
            });
            elements[item] = {title: "" + pedido[item].product_name + "",
                subtitle: "" + flavorsProduct + "",
                buttons: [{
                        title: "Excluir",
                        type: "postback",
                        payload: "{command:7,  object_id:*" + pedido[item]._id + "*}"
                    }, {
                        title: "Adicionar + produtos",
                        type: "postback",
                        payload: "{command:3}"
                    }, {
                        title: "Finalizar Pedido",
                        type: "postback",
                        payload: "{command: 8}"
                    }]};
        }
        var messageData = {
            messaging_type: "RESPONSE",
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: ""
                    }
                }
            }
        };
        messageData.message.attachment.payload.elements = elements;
        sendMessage.callSendAPI(messageData);
    };
//Inserir mais sabores************************************************************
    this.insertFlavor = function (senderId, requestObjectId, product) {
        requestSchema.findById_request(requestObjectId, function (err, result) {
            const text = "Deseja adicionar mais sabores? Você já adicionou " + result[0].flavors.length + " de " + product[0].quant_sabores_produto + ".";
            const buttons = "{" +
                    "title: 'Sim'," +
                    "type: 'postback'," +
                    "payload: '{productTypeId:" + product[0].tipos_produtos_id_tipo_produto + ",product_id:" + product[0].id_produto + ",command: 5, object_id:*" + requestObjectId + "*,maxId: 0}'" +
                    "}," +
                    "{" +
                    "title: 'Não'," +
                    "type: 'postback'," +
                    "payload: '{command:30}'" +
                    "}";
            var messageData = {
                messaging_type: 'RESPONSE',
                recipient: {
                    id: senderId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: "",
                            buttons: ""
                        }
                    }
                }
            };
            messageData.message.attachment.payload.text = text;
            messageData.message.attachment.payload.buttons = "[" + buttons + "]";
            sendMessage.callSendAPI(messageData);
        });
    };
//Finalizar pedido************************************************************
    this.finishRequest = function (senderId) {
        const text = "Deseja finalizar o pedido?";
        const buttons = "{" +
                "title: 'Sim'," +
                "type: 'postback'," +
                "payload: '{command:8}'" +
                "}," +
                "{" +
                "title: 'Não'," +
                "type: 'postback'," +
                "payload: '{command:3}'" +
                "}";
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "",
                        buttons: ""
                    }
                }
            }
        };
        messageData.message.attachment.payload.text = text;
        messageData.message.attachment.payload.buttons = "[" + buttons + "]";
        sendMessage.callSendAPI(messageData);
    };
//Listagem de formas de pagamento************************************************************
    this.paymentFormsList = function (senderId, deliveryValue, id_empresa) {
        companyDaoDB.carrega_formas_pagamento_empresa(id_empresa,async function (err, result) {
            if (!err && result.length !== 0) {
                var quick_replies = [];
                for (var payment in result) {
                    quick_replies[payment] = {content_type: "text",
                        title: "" + result[payment].nome_forma_pagamento + "",
                        payload: "{payment_id:" + result[payment].id_forma_pagamento_empresa + ", deliveryValue:" + deliveryValue + ", command: 20}"
                    };
                }
                var messageData = {
                    messaging_type: 'RESPONSE',
                    recipient: {
                        id: senderId
                    }, 
                    message: {
                        text: "Clica na tua escolha 👇",
                        quick_replies: []
                    }
                };
                messageData.message.quick_replies = quick_replies;   
                console.log(JSON.stringify(messageData));
                sendMessage.callSendAPI(messageData);
            } else {
                console.log("Query error: " + err);
            }
        });
    };
//Confirmação endereço do pedido************************************************************
    this.confirmationAddress = function (senderId, cliente) {
        const text = "Esse é o seu endereço? \n" + cliente[0].endereco_cliente + ", \n " + cliente[0].endereco_numero_cliente + ", \n" + cliente[0].bairro_cliente + ".";
        const buttons = "{" +
                "title: 'Sim'," +
                "type: 'postback'," +
                "payload: '{command:13, maxId: 0}'" +
                "}," +
                "{" +
                "title: 'Não'," +
                "type: 'postback'," +
                "payload: '{command:8, addressUpdate: 1}'" +
                "}";
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "",
                        buttons: ""
                    }
                }
            }
        };
        messageData.message.attachment.payload.text = text;
        messageData.message.attachment.payload.buttons = "[" + buttons + "]";
        sendMessage.callSendAPI(messageData);
    };

//Confirmação os telefones de contato************************************************************
    this.confirmationPhone = function (senderId, cliente) {
        const text = "Esses são seus telefones para contato? \nCelular:" + cliente[0].telefone_celular_cliente + " \nFixo:" + cliente[0].telefone_residencial_cliente + ".";
        const buttons = "{" +
                "title: 'Sim'," +
                "type: 'postback'," +
                "payload: '{command:18, maxId: 0}'" +
                "}," +
                "{" +
                "title: 'Não'," +
                "type: 'postback'," +
                "payload: '{command:14}'" +
                "}";
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "",
                        buttons: ""
                    }
                }
            }
        };
        messageData.message.attachment.payload.text = text;
        messageData.message.attachment.payload.buttons = "[" + buttons + "]";
        sendMessage.callSendAPI(messageData);
    };

//Selecione o tipo de telefone para atualizar************************************************************
    this.selectTypePhone = function (senderId) {
        const text = "Selecione o tipo de telefone para cadastrar.";
        const buttons = "{" +
                "title: 'Celular'," +
                "type: 'postback'," +
                "payload: '{command:15,typephone:1}'" +
                "}," +
                "{" +
                "title: 'Fixo'," +
                "type: 'postback'," +
                "payload: '{command:15,typephone:2}'" +
                "}";
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "",
                        buttons: ""
                    }
                }
            }
        };
        messageData.message.attachment.payload.text = text;
        messageData.message.attachment.payload.buttons = "[" + buttons + "]";
        sendMessage.callSendAPI(messageData);
    };

//Mensagem de bem vindo************************************************************
    this.sendAlertDelivery = function (result) {
        var senderId = result[0].id_rede_social_cliente;
        var id_pedido = result[0].id_pedido;
        var placa_entregador = result[0].placa_entregador;
        var nome_entregador = result[0].nome_entregador;
        request.get("https://graph.facebook.com/v2.12/" + senderId + "?fields=first_name&access_token=" + PAGE_ACCESS_TOKEN,
                function (error, response, body) {
                    var messageText = "";
                    if (error) {
                        console.log("Error getting user's name: " + error);
                    } else {
                        var bodyObj = JSON.parse(body);
                        messageText = "Oi " + bodyObj.first_name + ". ";
                    }
                    messageText = messageText + "Informamos que seu pedido " + id_pedido + " saiu para entrega." +
                            " Entregador: " + nome_entregador + ", Placa: " + placa_entregador + ".";
                    //console.log(messageText);
                    sendMessage.sendMessageText(senderId, messageText);
                    ;
                });
    };

//Listagem de produtos dinamicamente************************************************************
    this.listProductsDinamic = function (senderId, result) {
        var elements = [];
        for (var product in result) {
            elements[product] = {title: "" + result[product].nome_produto + "",
                subtitle: "" + result[product].descricao_produto + " , R$ " + Number(result[product].valor_unitario_produto).toFixed(2) + "",
                image_url: "https://wshungermanagement.herokuapp.com/images/cook.jpg",
                buttons: [{
                        title: "Voltar",
                        type: "postback",
                        payload: "{command: 3}"
                    }, {
                        title: "Pedir",
                        type: "postback",
                        payload: "{product_id: " + result[product].id_produto + " ,command: 5,productTypeId:" + result[product].tipos_produtos_id_tipo_produto + ",maxId: 0}"
                    }]
            };
        }
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: []
                    }
                }
            }
        };
        messageData.message.attachment.payload.elements = elements;
        sendMessage.callSendAPI(messageData);
    };
//Lista pedidos abertos do cliente************************************************************
    this.listRequestOpen = async function (senderId, result) {
        var messageText = "", messageTextTemp;
        for (var i = 0; i < result.length; i++) {
            messageTextTemp = "Seu pedido " + result[i].id_pedido + " com ";
            companyDaoDB.carrega_itens_pedido_cliente(result[i].id_pedido, function (err, products) {
                for (var product in products) {
                    messageTextTemp = messageTextTemp + products[product].nome_produto + ",";
                }
            });
            await sleep(1000);
            if (result[i].status_pedido === 1) {
                messageTextTemp = messageTextTemp + " esta com status Pendente.\n";
            } else if (result[i].status_pedido === 2) {
                messageTextTemp = messageTextTemp + " esta com status Em produção.\n";
            }
            if (result[i].status_pedido === 3) {
                messageTextTemp = messageTextTemp + " esta com status Expedido.\n";
            }
            messageText = messageText + messageTextTemp;
        }
        sendMessage.sendMessageText(senderId, messageText);
    };
//Confirma o valor do pedido e frete************************************************************
    this.confirmDeliveryValue = function (senderId, deliveryValue, requests) {
        var sumProdct = 0;
        for (var product in requests) {
            sumProdct = sumProdct + requests[product].product_value;
        }
        var total = sumProdct + deliveryValue;
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{title: "Valor do pedido + Valor da entrega",
                                subtitle: "Pedido R$ " + Number(sumProdct).toFixed(2) + " + Entrega R$ " + Number(deliveryValue).toFixed(2) + " \nTotal: " + Number(total).toFixed(2),
                                image_url: "https://wshungermanagement.herokuapp.com/images/money.jpg",
                                buttons: [{
                                        title: "Cancelar Pedido",
                                        type: "postback",
                                        payload: "{command:0}"
                                    }, {
                                        title: "Aceitar",
                                        type: "postback",
                                        payload: "{command:19, deliveryValue:" + deliveryValue + "}"
                                    }]
                            }]
                    }
                }
            }
        };
        sendMessage.callSendAPI(messageData);
    };

//Envia valor do pedido em andamento************************************************************    
    this.sendOrderValue = function (senderId, requests, deliveryValue, id_empresa) {
        var sumProdct = 0, frete = "";
        for (var product in requests) {
            sumProdct = sumProdct + requests[product].product_value;
        }
        if (!deliveryValue) {
            frete = ", ainda não sei seu endereço para o frete";
            sendMessage.sendMessageText(senderId, "O valor do seu pedido até o momento é de R$ " + sumProdct + frete);
        } else {
            companyDaoDB.carrega_cliente_empresa_chatbot(senderId, id_empresa, function (err, client) {
                frete = " mais frete de R$ " + deliveryValue + " para o endereço " + client[0].endereco_cliente + " - " + client[0].endereco_numero_cliente + " - " + client[0].bairro_cliente;
                sendMessage.sendMessageText(senderId, "O valor do seu pedido até o momento é de R$ " + sumProdct + frete);
            });
        }
    };
//Envia imagem************************************************************
    this.sendImage = function (senderId, urlImage) {
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: "" + urlImage + "",
                        is_reusable: true
                    }
                }
            }
        };
        messageData.message;
        sendMessage.callSendAPI(messageData);
    };
    /*
     this.teste = function (senderId) {
     
     var messageData = {
     messaging_type: 'RESPONSE',
     recipient: {
     id: senderId
     },
     message: {
     text: "Here is a quick reply!",
     quick_replies:[
     {
     content_type:"text",
     title:"**Search**",
     payload:"<POSTBACK_PAYLOAD>",
     image_url:"http://example.com/img/red.png"
     },
     {
     content_type:"location"
     }
     ]
     }
     };       
     sendMessage.callSendAPI(messageData);
     };
     */
};