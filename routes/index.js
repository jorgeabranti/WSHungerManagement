var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//TESTE
/*
var controller  = require('../controller/messageController');

router.get('/', controller.mensagem_list);
*/
module.exports = router;
