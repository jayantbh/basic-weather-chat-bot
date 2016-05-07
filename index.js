/**
 * Created by Jayant Bhawal on 07-05-2016.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var token = process.env.FB_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

function sendTextMessage(sender, text) {
    messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.get("/webhook", function (req, res) {
    if (req.query['hub.verify_token'] === process.env.HUB_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});
app.post('/webhook', function (req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
            console.log(text);
        }
    }
    res.sendStatus(200);
});
app.get("/", function (req, res) {
    res.sendFile("index.html");
});

app.listen(process.env.PORT || 8080, "0.0.0.0", function () {
    console.log("Go!");
});