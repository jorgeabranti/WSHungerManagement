var request = require('request');
var PAGE_ACCESS_TOKEN = require('../controller/tokensController').pageAcessToken();

module.exports = {
    callSendAPI: function(messageData) {
        request({
            uri: 'https://graph.facebook.com/v3.0/me/messages',
            qs: {access_token: PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: messageData

        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

               console.log("Successfully sent generic message with id %s to recipient %s",
                       messageId, recipientId);
            } else {
               //console.error("Unable to send message.");
               //console.error(response);
               //console.error(error);
            }
        });
    } , 
    sendMessageText: function (recipientId, messageText) {
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };
        console.log(messageData);
        this.callSendAPI(messageData);
    },
    
    sendMessageTextUpdate: function (recipientId, messageText) {
        var messageData = {
            messaging_type: 'UPDATE',
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };
        console.log(messageData);
        this.callSendAPI(messageData);
    },
    
    sendMessageTyping: function (recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_on"
        };
        this.callSendAPI(messageData);
    }     
};