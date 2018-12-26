var express = require('express');
var router = express.Router();
var company = require('../dao_db/companyDaoDB');
var messageTratament = require('../controller/messageController');

router.post('/', function (req, res) {
    var data = req.body;
    console.log('Recebi de HM');
    console.log(JSON.stringify(data));
    if (data && data.object === 'page') {
        console.log('Possui data e page');
        data.entry.forEach(function (entry) {
            console.log('Data entry: '+entry);
            var user = entry.user;
            var password = entry.verify_token;
            var id_pedido = entry.id_pedido;
            if (user === 'hunger-management-system' && password === '4SWZVxQg8QHXIkhkAjKU4IL6bCtqzmta') {
                console.log('Conectado');
                company.carrega_pedido_empresa(id_pedido, function (err, result) {
                    console.log('Retorno consulta pedido: '+result);
                    messageTratament.receivedAlertDelivery(result);
                });
            }
        });
        res.sendStatus(200);
    }
});
module.exports = router;
