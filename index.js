/**
 * Created by Jayant Bhawal on 07-05-2016.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var YQL = require('yql');
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
        sendTextMessage(sessionId,message);
        cb();
    },
    merge(sessionId, context, entities, message, cb) {
        context.ents = entities;
        cb(context);
    },
    error(sessionId, context, err) {
        console.log(err.message);
    },
    weather_lookup(sessionId, context, cb){
        console.log("WEATHER LOOKUP");
        var location = context.ents.location[0].value;

        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+location+'") and u="c"');
        query.exec(function(err, data) {
            var location = data.query.results.channel.location;
            var condition = data.query.results.channel.item.condition;

            sendTextMessage(sessionId,'The current weather in ' + location.city + ',' + location.region + ' is ' + condition.temp + '°C.');
            cb(context);
        });
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
    for (var i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        console.log(event);

        context[sender] = context[sender] || {};
        if(event.optin){
            sendTextMessage(sender, "Hey there! To see a list of things you can do on Jayant's Experiments, type 'help'.");
        }
        else if (event.message && event.message.text) {
            var text = event.message.text;
            if(text == "help"){
                var helpText = "Welcome to Jayant's Experiments Messenger Bot.\n" +
                    "For now, the listed things are all that this bot can do:\n" +
                    "1. 'What's the weather in Kolkata?'";

                text = helpText;
                sendTextMessage(sender, text);
            }
            else{
                client.runActions(sender,text,context[sender],(error, data) => {
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log("Data!",JSON.stringify(data));
                    }
                });
            }
            console.log(text);
        }
        // else {
        //     sendTextMessage(sender, "Damn. This action seems to be unhandled for now. Message m.me/jayantbhawal about this.");
        // }
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