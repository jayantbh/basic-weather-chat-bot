/**
 * Created by Jayant Bhawal on 07-05-2016.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var yql = require('yql');
var Wit = require('node-wit').Wit;

var token = process.env.FB_TOKEN;
var wit_token = process.env.WIT_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

function sendTextMessage(sender, text) {
    var messageData = {
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

const actions = {
    say(sessionId, context, message, cb) {
        console.log(message);
        cb();
    },
    merge(sessionId, context, entities, message, cb) {
        cb(context);
    },
    error(sessionId, context, err) {
        console.log(err.message);
    }
};
const client = new Wit(wit_token, actions);
var context = {};

//WebHook validator
app.get("/webhook", function (req, res) {
    if (req.query['hub.verify_token'] === process.env.HUB_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

//WebHook Handler
app.post('/webhook', function (req, res) {
    var messaging_events = req.body.entry[0].messaging;
    var event;
    var sender;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        console.log(event);

        context[sender] = context[sender] || {};
        if(event.optin){
            sendTextMessage(sender, "Hey there! Call me Jay. To see a list of things you can do on Jayant's Experiments, type 'help'.");
        }
        // else if (event.message && event.message.text) {
        //     text = event.message.text;
        //     sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
        //     console.log(text);
        // }
        else {
            sendTextMessage(sender, "Damn. This action seems to be unhandled for now. Message m.me/jayantbhawal about this.");
            sendTextMessage(sender, "Event body:");
            sendTextMessage(sender, req.body);
        }
    }
    res.sendStatus(200);
});

//Home Page
app.get("/", function (req, res) {
    res.sendFile(__dirname+"/index.html");
});

app.listen(process.env.PORT || 8080, "0.0.0.0", function () {
    console.log("Go!");
});