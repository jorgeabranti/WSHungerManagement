var express = require('express');
var router = express.Router();
var company = require('../dao_db/companyDaoDB');
var messageTratament = require('../controller/messageController');
router.get('/', function (req, res, next) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'senha123') {
        res.status(200).send(req.query['hub.challenge']);
        console.log('conectou');
    } else {
        console.log('não conectou');
        res.sendStatus(403);
    }
});
router.post('/', function (req, res) {
    var data = req.body;
    console.log(JSON.stringify(data));
    if (data && data.object === 'page') {
        try {
            data.entry.forEach(function (entry) {
                var pageID = entry.id;
                var timeOfEvent = entry.time;
                company.valida_id_page_empresa(pageID, function (err, result) {
                    if (!err) {
                        if (result[0] !== undefined) {
                            if (entry.standby) {
                                console.log("recebi standbay");
                            } else {
                                entry.messaging.forEach(function (event) {
                                    if (event.message) {
                                        messageTratament.receivedMessage(event, pageID, result, timeOfEvent);
                                    } else if (event.postback && event.postback.payload) {
                                        messageTratament.receivedPostback(event, pageID, result, timeOfEvent);
                                    } else {
                                        console.log("Webhook received unknown event: ", JSON.stringify(event));
                                    }
                                });
                            }
                        } else {
                            console.log("Pagina não cadastrada");
                        }
                    } else {
                        console.log("Erro na consulta: " + err);
                    }
                });
            });
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    }
});
module.exports = router;
