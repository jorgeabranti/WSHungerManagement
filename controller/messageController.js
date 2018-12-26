//var client = require('../dao_db/dbconnection_redis');
var templateMessageFunction = require('../controller/templateMessageController');
var templateMessage = new templateMessageFunction();
var hourTratamentFunction = require('../controller/hourTratamentController');
var hourTratament = new hourTratamentFunction();
var botIOSchema = require('../dao_db/botIODaoDB');
var decisionController = require('../controller/decisionController');
var messageSchema = require('../dao_db/messageDaoDB');
var company = require('../dao_db/companyDaoDB');

function unixToDate(timeOfEvent, callback) {
    var dateTimeString = new Date(parseInt(timeOfEvent) * 1e3).toISOString('yyyy-MM-dd HH:mm:ss a');
    return callback(null, dateTimeString);
}
;

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
;

function retira_acentos(str) {
    with_accent = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    without_accent = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    newstr = "";
    for (i = 0; i < str.length; i++) {
        swap = false;
        for (a = 0; a < with_accent.length; a++) {
            if (str.substr(i, 1) === with_accent.substr(a, 1)) {
                newstr += without_accent.substr(a, 1);
                swap = true;
                break;
            }
        }
        if (swap === false) {
            newstr += str.substr(i, 1);
        }
    }
    return newstr;
}

module.exports = {
    receivedMessage: function (event, pageID, empresa, timeOfEvent) {
        company.horarios_atendimento_empresa(empresa[0].id_empresa, function (err, result) {
            if (hourTratament.checkTime(event, empresa, result) === true) {
                if (!event.message.is_echo && event.message.text && !event.message.quick_reply) {
                    var message = event.message;
                    var senderId = event.sender.id;
                    var str = timeOfEvent.toString();
                    var time = str.substr(0, 10);
                    messageSchema.findMax_message(senderId, empresa[0].id_empresa, function (err, request) {
                        console.log(request[0]);
                        if (!err && request[0] !== undefined) {
                            switch (request[0].message) {
                                case "command 8":
                                    JObject = (new Function('return ' + "{command: 9, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 9":
                                    JObject = (new Function('return ' + "{command: 10, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 10":
                                    JObject = (new Function('return ' + "{command: 11, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 11":
                                    JObject = (new Function('return ' + "{command: 12, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 12":
                                    JObject = (new Function('return ' + "{command: 16, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 13":
                                    JObject = (new Function('return ' + "{command: 17, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 14":
                                    JObject = (new Function('return ' + "{command: 23, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 15":
                                    JObject = (new Function('return ' + "{command: 24, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 16":
                                    JObject = (new Function('return ' + "{command: 25, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 17":
                                    JObject = (new Function('return ' + "{command: 26, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                                case "command 18":
                                    JObject = (new Function('return ' + "{command: 27, text:'" + message.text.toLowerCase().trim() + "'}"))();
                                    unixToDate(time, function (err, resultDate) {
                                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                                    });
                                    break;
                            }
                        } else {
                            unixToDate(time, async function (err, resultDate) {
                                var formattedMsg = message.text.toLowerCase().trim();
                                const arr = formattedMsg.split(' ');
                                var arrBot = [];
                                var obj = {};
                                String.prototype.replaceArray = String.prototype.replaceArray || function () {
                                    var find = ['.', '?', '!'];
                                    var replaceString = this;
                                    for (var i = 0; i < find.length; i++) {
                                        replaceString = replaceString.replace(find[i], '');
                                    }
                                    return replaceString;
                                };
                                for (var i = 0; i < arr.length; i++) {
                                    var word = retira_acentos(arr[i]);
                                    var newword = word.replaceArray();
                                    botIOSchema.findBotIO(newword, function (err, result) {
                                        return arrBot.push("{command:" + result[0].outCommand + ",weight:" + result[0].weight + ",word:'" + newword + "'}");
                                    });
                                    await sleep(1000);
                                }
                                setTimeout(function () {
                                    var temp = -1;
                                    for (var i in arrBot) {
                                        JObject = (new Function('return ' + arrBot[i]))();
                                        if (JObject.weight > temp) {
                                            temp = JObject.weight;
                                            obj = JObject;
                                        }
                                    }
                                    decisionController.actions(obj, event, pageID, empresa, senderId, resultDate);
                                }, 3000);
                            });
                        }
                    });
                } else if (event.message.attachments){
                    var senderId = event.sender.id;
                    var response = Array('Digita alguma coisa ai vai ', 'Digita o nome do produto que procura', ':D', 'Digita menu ai', 'Digita opções para ver o que temos');
                    var randomMessage = response[Math.floor(Math.random() * response.length)];
                    event.message.attachments.forEach(async function (event) {
                        if (event.type ==='image'){
                            templateMessage.returnDefault(senderId, "Ok, mas não consigo ver...");
                            await sleep(2000); 
                            templateMessage.returnDefault(senderId, "...ainda.");
                            await sleep(1000); 
                            templateMessage.returnDefault(senderId, "😎");
                            await sleep(1000); 
                            templateMessage.returnDefault(senderId, randomMessage);                            
                        } else if (event.type ==='audio') {                          
                            templateMessage.returnDefault(senderId, "Ok, mas não consigo ouvir...");
                            await sleep(2000); 
                            templateMessage.returnDefault(senderId, "...ainda.");
                            await sleep(1000);
                            templateMessage.returnDefault(senderId, "🤫");
                            await sleep(1000); 
                            templateMessage.returnDefault(senderId, randomMessage);                              
                        } /*else {
                            templateMessage.returnDefault(senderId, "Oops! Desculpe por isso, mas não lhe entendi. Tente novamente.");
                            templateMessage.returnDefault(senderId, randomMessage); 
                        }*/
                    });
                } else if (event.message.quick_reply){
                    console.log("recebi quick_reply");
                    var senderId = event.sender.id;
                    var payload = event.message.quick_reply.payload;
                   // console.log(payload);
                    String.prototype.replaceAll = String.prototype.replaceAll || function (needle, replacement) {
                        return this.split(needle).join(replacement);
                    };
                    const payloadReplace = payload.replaceAll('*', '\"');
                    JObject = (new Function('return ' + payloadReplace))();
                    var str = timeOfEvent.toString();
                    var time = str.substr(0, 10);
                   // console.log(JSON.stringify(JObject));
                    unixToDate(time, function (err, resultDate) {
                        decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                    });                 
                }
            }
        });
    },

    receivedPostback: function (event, pageID, empresa, timeOfEvent) {
        company.horarios_atendimento_empresa(empresa[0].id_empresa, function (err, result) {
            if (hourTratament.checkTime(event, empresa, result) === true) {
                var senderId = event.sender.id;
                var payload = event.postback.payload;
                String.prototype.replaceAll = String.prototype.replaceAll || function (needle, replacement) {
                    return this.split(needle).join(replacement);
                };
                const payloadReplace = payload.replaceAll('*', '\"');
                JObject = (new Function('return ' + payloadReplace))();
                var str = timeOfEvent.toString();
                var time = str.substr(0, 10);
                unixToDate(time, function (err, resultDate) {
                    decisionController.actions(JObject, event, pageID, empresa, senderId, resultDate);
                });
            }
        });
    },

    receivedAlertDelivery: function (result) {
        templateMessage.sendAlertDelivery(result);
    }
};