var boIO = require('../model/botIO');

module.exports = {
    insertBotIO: function () {
        var botIOInsert = new boIO({
            outPutString: 'cardapio',
            inputString: ['cardapio','opções','opcoes','lanches'],
            weight: 0
        });
        botIOInsert.save(function (err) {
            if (err)
                return handleError(err);
        });
    },
    findBotIO: function (inputString, callback) {      
        boIO.find({inputString: inputString}, function (err, res) {
            if (err) throw err;
            if (res[0] !== undefined)
                return callback(null, res);
        });
    }

};
