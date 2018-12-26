var templateMessageFunction = require('../controller/templateMessageController');
var templateMessage = new templateMessageFunction();
var hourTratamentFunction = require('../controller/hourTratamentController');
var hourTratament = new hourTratamentFunction();
var messageSchema = require('../dao_db/messageDaoDB');
var requestSchema = require('../dao_db/requestDaoDB');
var companyDaoDB = require('../dao_db/companyDaoDB');
var productDaoDB = require('../dao_db/productDaoDB');
var validationSchema = require('../dao_db/validationDaoDB');

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
;
function diff_minutes(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    // diff /= 60;
    return Math.abs(Math.round(diff));
}
function verifyPhone(numero) {
    var continuar = true;
    // Verificar se vazio
    if (numero.length === 0) {
        console.log("Brincalhão, preenche lá o número!");
        continuar = false;
    }
    // Verificar se número é de utilidade publica
    if (numero.length === 3) {
        console.log("Número de utilidade publica");
        continuar = false;
    }
    // Verificar se tem código do país para retirar
    if (continuar && numero.substring(0, 3) === "+55") {
        numero = numero.substring(3);
    }
    // Verificar se menos que 12 digitos
    if (continuar && numero.length < 12) {
        console.log("Número inválido, por favor introduza Cod. Operadora + Cod. Area + Numero");
        continuar = false;
    }
    // Verificar se contém 13 digitos
    if (continuar && numero.length === 13) {
        console.log("Número móvel");
        continuar = false;
    }
    // Verificar se o 5º digito
    var digitoControlo = numero.charAt(4);
    if (continuar) {
        if (digitoControlo >= 2 && digitoControlo <= 5) {
            console.log("Número fixo");
            return 1;
        } else if (digitoControlo >= 6 && digitoControlo <= 9) {
            console.log("Número móvel");
            return 2;
        } else {
            console.log("Número especial");
            return 0;
        }
    }
}

module.exports = {
    actions: function (JObject, event, pageID, empresa, senderId, timeOfEvent) {
        console.log("Comando recebido: "+JObject.command);
        switch (JObject.command) {
            case 0:
                //Primeira interação com o atendimento 
                //Salva contato do cliente caso não esteja cadastrado
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    var items = Array('Vamos pedir? ;)', 'Huuumm, é cada sabor! 😋', 'Oi, já deu uma olhada em nosso cardápio?', 'Tanta coisa gostosa! :v');
                    var randomMessage = items[Math.floor(Math.random() * items.length)];
                    //console.log('random '+ randomMessage);
                    if (!err && rowsClient.length === 0) {
                        templateMessage.getUserProfile(senderId, async function (err, result) {
                            companyDaoDB.salva_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, result);
                        });
                        //Procura por pedidos não finalizados do cliente
                        requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                            if (rowsRequest[0] === undefined) {
                                //Não encontrou pedidos não finalizados
                                templateMessage.sendWelcome(senderId);
                                setTimeout(function () {
                                    templateMessage.returnDefault(senderId, "Sou seu assistente virtual. Em que posso te ajudar?");
                                    templateMessage.serviceOptions(senderId);
                                }, 3000);
                            } else {
                                //Encontrou pedidos não finalizados
                                templateMessage.returnDefault(senderId, "você possui pedidos não finalizados. Escolha uma das ações disponíveis.");
                                templateMessage.unfinishedRequests(pageID, senderId, rowsRequest);
                            }
                        });
                    } else if (!err && rowsClient.length > 0) {
                        //Procuto por pedidos não finalizados do cliente
                        requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                            if (rowsRequest[0] === undefined) {
                                //Não encontrou pedidos não finalizados
                                var diferencetime = diff_minutes(rowsClient[0].ultimo_contato, empresa[0].date);
                                if (diferencetime > 600) {
                                    templateMessage.sendWelcome(senderId);
                                    setTimeout(function () {
                                        templateMessage.returnDefault(senderId, "O que vamos pedir hoje?");
                                        templateMessage.serviceOptions(senderId);
                                    }, 3000);
                                    companyDaoDB.atualiza_ultimo_contato(senderId, empresa[0].id_empresa);
                                } else if (diferencetime >= 30 && diferencetime <= 600) {
                                    setTimeout(function () {
                                        templateMessage.returnDefault(senderId, randomMessage);
                                        templateMessage.listProductType(pageID, senderId);
                                    }, 3000);
                                } else if (diferencetime < 30) {
                                    setTimeout(function () {
                                        templateMessage.returnDefault(senderId, randomMessage);
                                        templateMessage.returnDefault(senderId, "Dê uma olhada nas opções que tenho");
                                        templateMessage.serviceOptions(senderId);
                                    }, 3000);
                                }
                            } else {
                                //Encontrou pedidos não finalizados
                                templateMessage.returnDefault(senderId, "você possui pedidos não finalizados. Escolha uma das ações disponíveis.");
                                templateMessage.unfinishedRequests(pageID, senderId, rowsRequest);
                                companyDaoDB.atualiza_ultimo_contato(senderId, empresa[0].id_empresa);
                            }
                        });
                    }
                });
                break;
            case 1:
                //Verificar horario de atendimento
                companyDaoDB.horarios_atendimento_empresa(empresa[0].id_empresa, function (err, result) {
                    hourTratament.operatingHours(event, result);
                });
                setTimeout(function () {
                    templateMessage.serviceOptions(senderId);
                }, 3000);
                break;
            case 2:
                //Pedidos em aberto
                companyDaoDB.carrega_pedido_aberto_cliente(senderId, empresa[0].id_empresa, async function (err, result) {
                    if (result[0] !== undefined) {
                        templateMessage.listRequestOpen(senderId, result);
                        await sleep(4000);
                        templateMessage.serviceOptions(senderId);

                    } else {
                        templateMessage.returnDefault(senderId, "Você não possui pedidos em aberto no momento.");
                        setTimeout(function () {
                            templateMessage.serviceOptions(senderId);
                        }, 3000);
                    }
                });
                break;
            case 3:
                //Listagem de tipo de tipos produtos cadastrados pela empresa
                templateMessage.listProductType(pageID, senderId);
                break;
            case 4:
                //Listagem de produtos da empresa
                templateMessage.listProducts(pageID, senderId, JObject.productTypeId);
                break;
            case 5:
                //Listagem de sabore para os respectivos tipo de produto selecionado
                if (JObject.object_id) {
                    templateMessage.listFlavorsProduct(JObject.productTypeId, JObject.product_id, senderId, JObject.maxId, JObject.object_id);
                } else {
                    templateMessage.listFlavorsProduct(JObject.productTypeId, JObject.product_id, senderId, JObject.maxId, "");
                }
                break;
            case 6:
                if (JObject.object_id) {
                    requestSchema.findById_request(JObject.object_id, function (err, request) {
                        productDaoDB.findByIdProduct(JObject.product_id, function (err, product) {
                            if (!err)
                                if (request[0] === undefined) {
                                    var amountFlavors = 0;
                                } else {
                                    var amountFlavors = request[0].flavors.length;
                                }
                            if (amountFlavors < product[0].quant_sabores_produto) {
                                productDaoDB.findFlavorProduct(JObject.flavor_id, function (err, flavor) {
                                    if (!err) {
                                        requestSchema.insertFlavor_request(JObject.object_id, flavor);
                                        setTimeout(function () {
                                            requestSchema.findById_request(JObject.object_id, function (err, request) {
                                                if (request[0] === undefined) {
                                                    var amountFlavors = 0;
                                                } else {
                                                    var amountFlavors = request[0].flavors.length;
                                                }
                                                //console.log("quantidade de sabores que possui " + amountFlavors + " quantidade de sabores limite " + product[0].quant_sabores_produto);
                                                if (amountFlavors < product[0].quant_sabores_produto) {
                                                    templateMessage.insertFlavor(senderId, JObject.object_id, product);
                                                } else {
                                                    setTimeout(function () {
                                                        templateMessage.finishRequest(senderId);
                                                    }, 3000);
                                                }
                                            });
                                        }, 2000);
                                    }
                                });
                            } else {
                                var messageText = "Desculpe, mas este produto só permite até " + product[0].quant_sabores_produto + " sabores." +
                                        " Você pode adicionar mais produtos no seu pedido logo abaixo";
                                templateMessage.returnDefault(senderId, messageText);
                                setTimeout(function () {
                                    templateMessage.listProductType(pageID, senderId);
                                }, 3000);
                            }
                        });
                    });
                } else {
                    console.log("não tem object id");
                    productDaoDB.findByIdProduct(JObject.product_id, function (err, product) {
                        if (!err)
                            productDaoDB.findFlavorProduct(JObject.flavor_id, function (err, flavor) {
                                if (!err) {
                                    requestSchema.insert_request(senderId, empresa[0].id_empresa, timeOfEvent, product, flavor, function (err, inserted) {
                                        if (!err)
                                            requestSchema.findById_request(inserted, function (err, request) {
                                                if (request[0] === undefined) {
                                                    var amountFlavors = 0;
                                                } else {
                                                    var amountFlavors = request[0].flavors.length;
                                                }
                                                if (amountFlavors < product[0].quant_sabores_produto) {
                                                    templateMessage.insertFlavor(senderId, inserted, product);
                                                } else {
                                                    setTimeout(function () {
                                                        templateMessage.finishRequest(senderId);
                                                    }, 3000);
                                                }
                                            });
                                    });
                                }
                            });
                    });
                }
                break;
            case 7:
                requestSchema.remove_request(JObject.object_id, function (err, request) {
                    if (!err)
                        console.log("removido");
                });
                this.actions({command: 0}, event, pageID, empresa, senderId, timeOfEvent);
                break;
            case 8:
                requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                    if (rowsRequest[0] === undefined) {
                        console.log('Sem pedidos');
                        templateMessage.returnDefault(senderId, 'Você não possui pedidos para finalizar, que tal pedir alguma das opções abaixo?');
                        const recursive = require('../controller/decisionController');
                        recursive.actions({command: 3}, event, pageID, empresa, senderId, timeOfEvent);
                    } else {
                        console.log('tem pedidos');
                        //Limpa endereco para atualização
                        if (JObject.addressUpdate === 1) {
                            companyDaoDB.limpa_endereco_cliente_chatbot(senderId, empresa[0].id_empresa);
                        }
                        //Verifica se possui endereço para entrega
                        companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                            console.log('carrega cliente'+senderId+'/'+empresa[0].id_empresa+'/'+rowsClient)
                            if (!err && rowsClient.length !== 0) {
                                if (rowsClient[0].endereco_cliente === null) {
                                    templateMessage.returnDefault(senderId, 'Qual o nome da rua para entrega?');
                                    messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 8");
                                } else {
                                    const recursive = require('../controller/decisionController');
                                    recursive.actions({command: 9}, event, pageID, empresa, senderId, timeOfEvent);
                                }
                            }
                        });
                    }
                });
                break;
            case 9:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (!err && rowsClient.length !== 0) {
                        if (rowsClient[0].endereco_cliente === null) {
                            companyDaoDB.salva_rua_endereco_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                        }
                        if (rowsClient[0].endereco_numero_cliente === null) {
                            templateMessage.returnDefault(senderId, "Qual número da residência para entrega?");
                            messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 9");
                        } else {
                            const recursive = require('../controller/decisionController');
                            recursive.actions({command: 10}, event, pageID, empresa, senderId, timeOfEvent);
                        }
                    }
                });
                break;
            case 10:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (rowsClient[0].endereco_numero_cliente === null) {
                        companyDaoDB.salva_numero_endereco_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                    }
                    if (!err && rowsClient.length !== 0) {
                        if (rowsClient[0].bairro_cliente === null) {
                            templateMessage.returnDefault(senderId, "Qual bairro para entrega?");
                            messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 10");
                        } else {
                            const recursive = require('../controller/decisionController');
                            recursive.actions({command: 11}, event, pageID, empresa, senderId, timeOfEvent);
                        }
                    }
                });
                break;
            case 11:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (rowsClient[0].bairro_cliente === null) {
                        companyDaoDB.salva_bairro_endereco_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                    }
                    if (!err && rowsClient.length !== 0) {
                        if (rowsClient[0].cidade_cliente === null) {
                            templateMessage.returnDefault(senderId, "Qual a sua cidade entrega?");
                            messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 11");
                        } else {
                            const recursive = require('../controller/decisionController');
                            recursive.actions({command: 12}, event, pageID, empresa, senderId, timeOfEvent);
                        }
                    }
                });
                break;
            case 12:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (rowsClient[0].cidade_cliente === null) {
                        companyDaoDB.salva_cidade_endereco_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                    }
                    templateMessage.confirmationAddress(senderId, rowsClient);
                });
                break;
            case 13:
                //Verifica se possui telefone de contato
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (!err && rowsClient.length !== 0) {
                        if (rowsClient[0].telefone_celular_cliente === null && rowsClient[0].telefone_residencial_cliente === null) {
                            const recursive = require('../controller/decisionController');
                            recursive.actions({command: 14}, event, pageID, empresa, senderId, timeOfEvent);
                        } else {
                            templateMessage.confirmationPhone(senderId, rowsClient);
                        }
                    }
                });
                break;
            case 14:
                //Seleciona o tipo de telefone para cadastrar
                templateMessage.selectTypePhone(senderId);
                break;
            case 15:
                //Pergunta o numero
                companyDaoDB.carrega_cliente_empresa_chatbot(senderId, empresa[0].id_empresa, function (err, rowsClient) {
                    if (!err && rowsClient.length !== 0) {
                        templateMessage.returnDefault(senderId, 'Qual o número do telefone? Ex:51999999999');
                        if (JObject.typephone === 1) {
                            //Se celular
                            messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 12");
                        } else if (JObject.typephone === 2) {
                            //Se fixo
                            messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 13");
                        }
                    }
                });
                break;
            case 16:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.salva_telefone_celular_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                const recursive16 = require('../controller/decisionController');
                recursive16.actions({command: 13}, event, pageID, empresa, senderId, timeOfEvent);
                break;
            case 17:
                messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                    console.log("message removida");
                });
                companyDaoDB.salva_telefone_residencial_cliente_chatbot(JObject.text, senderId, empresa[0].id_empresa);
                const recursive17 = require('../controller/decisionController');
                recursive17.actions({command: 13}, event, pageID, empresa, senderId, timeOfEvent);
                break;
            case 18:
                companyDaoDB.calcula_frete(senderId, empresa[0].id_empresa, function (err, deliveryValue) {
                    console.log("calculei o frete " + deliveryValue);
                    requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                        templateMessage.confirmDeliveryValue(senderId, deliveryValue, rowsRequest);
                    });
                });
                break;
            case 19:
                //Seleciona formas de pagamento
                templateMessage.paymentFormsList(senderId, JObject.deliveryValue, empresa[0].id_empresa);
                break;
            case 20:
                //Procura por pedidos do cliente para finalizar
                requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                    companyDaoDB.salva_pedido_chatbot(senderId, empresa[0].id_empresa, rowsRequest, JObject.payment_id, JObject.deliveryValue, function (err, request) {
                        if (!err) {
                            console.log(request);
                            if (request !== null) {
                                templateMessage.returnDefault(senderId, "Seu pedido foi encaminhado para a produção, avisaremos quando sair para entrega. Obrigado.");
                                setTimeout(async function () {
                                    templateMessage.orderReceipt(senderId, empresa[0].id_empresa, rowsRequest, JObject.payment_id, JObject.deliveryValue, request);
                                    requestSchema.remove_request_client(senderId, empresa[0].id_empresa, function (err, result) {
                                    });
                                    await sleep(2000);
                                }, 3000);
                               // const recursive20 = require('../controller/decisionController');
                               // recursive20.actions({command: 22}, event, pageID, empresa, senderId, timeOfEvent);
                            }
                        } else {
                        }
                    });
                });
                break;
            case 21:
                //Procuto por pedidos não finalizados do cliente
                requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                    if (rowsRequest[0] === undefined) {
                        //Não encontrou pedidos não finalizados
                        console.log('Vou buscar algo para vender');
                        productDaoDB.findByNameTypeProduct(JObject.word, function (err, result) {
                            if (!err && result[0] !== undefined) {
                                templateMessage.listProductsDinamic(senderId, result);
                            } else {
                                templateMessage.returnDefault(senderId, "Não encontrei nada parecido com o que você pediu, veja se algumas das opções abaixo lhe atende.");
                                setTimeout(function () {
                                    templateMessage.serviceOptions(senderId);
                                }, 3000);
                            }
                        });
                    } else {
                        //Encontrou pedidos não finalizados
                        templateMessage.returnDefault(senderId, "você possui pedidos não finalizados. Escolha uma das ações disponíveis.");
                        templateMessage.unfinishedRequests(pageID, senderId, rowsRequest);
                    }
                });
                break;
            case 22:
                setTimeout(async function () {
                    await sleep(2000);
                    if (JObject.attempt === 1) {
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "Vamos tentar novamente.");                        
                    } else {
                        templateMessage.returnDefault(senderId, "Muito bem, agora que efetuamos seu pedido, que tal avaliar meu atendimento e minha performance respondendo algumas perguntas?");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "Vamos lá!");
                    }
                    await sleep(1000);
                    templateMessage.returnDefault(senderId, "Qual seu nome?");
                    messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 14");
                }, 3000);
                break;
            case 23:
                if (JObject.text && isNaN(JObject.text)) {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    validationSchema.insert_validation(senderId, pageID, empresa[0].id_empresa, timeOfEvent, JObject.text);
                    setTimeout(function () {
                        templateMessage.returnDefault(senderId, "Qual sua idade?");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 15");
                    }, 3000);
                } else if (JObject.attempt === 1) {
                    setTimeout(function () {
                        templateMessage.returnDefault(senderId, "Qual sua idade?");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 15");
                    }, 3000);
                } else {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    const recursive24 = require('../controller/decisionController');
                    recursive24.actions({command: 22, attempt: 1}, event, pageID, empresa, senderId, timeOfEvent);
                }
                break;
            case 24:
                if (JObject.text && !isNaN(JObject.text)) {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    validationSchema.insertAge_validation(senderId, empresa[0].id_empresa, JObject.text);
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir:");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "O chatbot funciona corretamente.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 16");
                    }, 3000);
                } else if (JObject.attempt === 1) {
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "O chatbot funciona corretamente.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 16");
                    }, 3000);
                } else {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    const recursive24 = require('../controller/decisionController');
                    recursive24.actions({command: 23, attempt: 1}, event, pageID, empresa, senderId, timeOfEvent);
                }
                break;
            case 25:
                var options = Array('1', '2', '3', '4', '5');
                if (JObject.text && options.indexOf(JObject.text) > -1) {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    validationSchema.insertQ1_validation(senderId, empresa[0].id_empresa, JObject.text);
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "Consigo entender com facilidade as opções que o chatbot me apresenta.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 17");
                    }, 3000);
                } else if (JObject.attempt === 1) {
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "Consigo entender com facilidade as opções que o chatbot me apresenta.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 17");
                    }, 3000);
                } else {
                    const recursive25 = require('../controller/decisionController');
                    recursive25.actions({command: 24, attempt: 1}, event, pageID, empresa, senderId, timeOfEvent);
                }
                break;
            case 26:
                var options = Array('1', '2', '3', '4', '5');
                if (JObject.text && options.indexOf(JObject.text) > -1) {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    validationSchema.insertQ2_validation(senderId, empresa[0].id_empresa, JObject.text);
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "O chatbot entende com facilidade a minha necessidade.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 18");
                    }, 3000);
                } else if (JObject.attempt === 1) {
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Qual seu nível de concordância com a afirmação a seguir.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "O chatbot entende com facilidade a minha necessidade.");
                        await sleep(1000);
                        templateMessage.returnDefault(senderId, "(1)Discordo totalmente \n(2)Discordo parcialmente \n(3)Não concordo, nem discordo \n(4)Concordo parcialmente \n(5)Concordo totalmente");
                        await sleep(2000);
                        templateMessage.returnDefault(senderId, "Digite o número correspondente a resposta.");
                        messageSchema.insert_message(senderId, pageID, empresa[0].id_empresa, timeOfEvent, "command 18");
                    }, 3000);
                } else {
                    const recursive26 = require('../controller/decisionController');
                    recursive26.actions({command: 25, attempt: 1}, event, pageID, empresa, senderId, timeOfEvent);
                }
                break;
            case 27:
                var options = Array('1', '2', '3', '4', '5');
                if (JObject.text && options.indexOf(JObject.text) > -1) {
                    messageSchema.remove_message(senderId, empresa[0].id_empresa, function (err, result) {
                        console.log("message removida");
                    });
                    validationSchema.insertQ3_validation(senderId, empresa[0].id_empresa, JObject.text);
                    setTimeout(async function () {
                        templateMessage.returnDefault(senderId, "Ok, vou repassar suas respotas ao meu administrador. Obrigado pela sua atenção!");
                        await sleep(2000);
                        validationSchema.find_validation(senderId, empresa[0].id_empresa, function (err, validation) {
                            companyDaoDB.salva_validacao_chatbot(validation);
                        });
                        await sleep(3000);
                        validationSchema.remove_validation(senderId, empresa[0].id_empresa);
                    }, 3000);
                } else {
                    const recursive27 = require('../controller/decisionController');
                    recursive27.actions({command: 26, attempt: 1}, event, pageID, empresa, senderId, timeOfEvent);
                }
                break;
            case 28:  
               
                break;
            case 29:
                //Procuto por pedidos não finalizados do cliente
                requestSchema.find_request(senderId, empresa[0].id_empresa, function (err, rowsRequest) {
                    if (rowsRequest[0] === undefined) {
                        //Não encontrou pedidos não finalizados
                        templateMessage.returnDefault(senderId, "Dê uma olhada logo abaixo do nome do produto para ver o valor dele.");
                        templateMessage.sendImage(senderId, "https://wshungermanagement.herokuapp.com/images/help/ajuda_valor_produto.PNG");
                        setTimeout(async function () {
                            templateMessage.returnDefault(senderId, "Depois é só clicar em \"Pedir\" ou rolar para a lateral para ver mais produtos.");
                        }, 2000);    
                    } else {
                        //Encontrou pedidos não finalizados
                        companyDaoDB.calcula_frete(senderId, empresa[0].id_empresa, function (err, deliveryValue) {
                            templateMessage.sendOrderValue(senderId, rowsRequest, deliveryValue, empresa[0].id_empresa);
                        });                                                                        
                    }
                });                
                break;
            case 30:
                setTimeout(function () {
                    templateMessage.finishRequest(senderId);
                }, 3000);
                break;
            default:
                templateMessage.returnDefault(senderId, "Oops! Estou aprendendo e tem coisas que ainda não sei responder. Veja se alguma das opções abaixo lhe atende ou tente novamente.");
                setTimeout(function () {
                    templateMessage.serviceOptions(senderId);
                }, 3000);
                break;
        }
    }
};