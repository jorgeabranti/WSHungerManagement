var moment = require('moment');
var templateMessageFunction = require('../controller/templateMessageController');
var templateMessage = new templateMessageFunction();

function outOfHours(senderId, startTime, endTime) {
    var messageText = "Desculpe, nosso horário de atendimento é entre " + startTime + " e " + endTime + ". Aguardamos seu pedido! Obrigado.";
    console.log("outfhours");
    templateMessage.returnDefault(senderId, messageText);
}
;

module.exports = function () {
    this.operatingHours = function (event, result) {
        var senderId = event.sender.id;
            if(result[0].atendimento_domingo === 1){ 
               var  domingo = "Domingo das "+result[0].horario_inicio_domingo + "Hrs ás " + result[0].horario_fim_domingo + "Hrs.\n";
            } else {
               var domingo = "";
            };
            if(result[0].atendimento_segunda === 1){ 
              var  segunda = "Segunda das "+result[0].horario_inicio_segunda + "Hrs ás " + result[0].horario_fim_segunda + "Hrs.\n";
            } else {
               var segunda = "";
            };
            if(result[0].atendimento_terca === 1){ 
              var  terca = "Terça das "+result[0].horario_inicio_terca + "Hrs ás " + result[0].horario_fim_terca + "Hrs.\n";
            } else {
               var terca = "";
            };
            if(result[0].atendimento_quarta === 1){ 
              var  quarta = "Quarta das "+result[0].horario_inicio_quarta + "Hrs ás " + result[0].horario_fim_quarta + "Hrs.\n";
            } else {
               var quarta = "";
            };
            if(result[0].atendimento_quinta === 1){ 
              var  quinta = "Quinta das "+result[0].horario_inicio_quinta + "Hrs ás " + result[0].horario_fim_quinta + "Hrs.\n";
            } else {
               var quinta = "";
            };
            if(result[0].atendimento_sexta === 1){ 
              var  sexta = "Sexta das "+result[0].horario_inicio_sexta + "Hrs ás " + result[0].horario_fim_sexta + "Hrs.\n";
            } else {
               var sexta = "";
            };
            if(result[0].atendimento_sabado === 1){ 
              var  sabado = "Sabádo das "+result[0].horario_inicio_sabado + "Hrs ás " + result[0].horario_fim_sabado + "Hrs.\n";
            } else {
               var sabado = "";
            };
        var messageText = "Estamos atendendo nos dias e horários abaixo:\n"+domingo+segunda+terca+quarta+quinta+sexta+sabado;
        templateMessage.returnDefault(senderId, messageText);
    };
    this.checkTime = function (event, empresa, result) {

        var senderId = event.sender.id;
        var now = new Date(empresa[0].date);
        var currentTime = moment(now).format('HH:mm:ss');

        if (empresa[0].day === 1 && result[0].atendimento_domingo === 1) {
            if (currentTime >= result[0].horario_inicio_domingo && currentTime <= result[0].horario_fim_domingo) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_domingo, result[0].horario_fim_domingo);
                return false;
            }
        } else if (empresa[0].day === 2 && result[0].atendimento_segunda === 1) {
            if (currentTime >= result[0].horario_inicio_segunda && currentTime <= result[0].horario_fim_segunda) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_segunda, result[0].horario_fim_segunda);
                return false;
            }
        } else if (empresa[0].day === 3 && result[0].atendimento_terca === 1) {
            if (currentTime >= result[0].horario_inicio_terca && currentTime <= result[0].horario_fim_terca) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_terca, result[0].horario_fim_terca);
                return false;
            }
        } else if (empresa[0].day === 4 && result[0].atendimento_quarta === 1) {
            if (currentTime >= result[0].horario_inicio_quarta && currentTime <= result[0].horario_fim_quarta) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_quarta, result[0].horario_fim_quarta);
                return false;
            }
        } else if (empresa[0].day === 5 && result[0].atendimento_quinta === 1) {
            if (currentTime >= result[0].horario_inicio_quinta && currentTime <= result[0].horario_fim_quinta) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_quinta, result[0].horario_fim_quinta);
                return false;
            }
        } else if (empresa[0].day === 6 && result[0].atendimento_sexta === 1) {
            if (currentTime >= result[0].horario_inicio_sexta && currentTime <= result[0].horario_fim_sexta) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_sexta, result[0].horario_fim_sexta);
                return false;
            }
        } else if (empresa[0].day === 7 && result[0].atendimento_sabado === 1) {
            if (currentTime >= result[0].horario_inicio_sabado && currentTime <= result[0].horario_fim_sabado) {
                return true;
            } else {
                outOfHours(senderId, result[0].horario_inicio_sabado, result[0].horario_fim_sabado);
                return false;
            }
        } else {
            templateMessage.returnDefault(senderId, "Desculpe, não estamos atendendo hoje :|. Verifique os horários de atendimento.");
        }
    };
};