/**
 * Created by Jayant Bhawal on 07-05-2016.
 */
var express = require('express');
var app = express();

app.get("/webhook",function (req, res) {
    if (req.query['hub.verify_token'] === process.env.HUB_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});
app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            // Handle a text message from this sender
            console.log(text);
        }
    }
    res.sendStatus(200);
});
app.get("/",function (req, res) {
    res.send("On!");
});

app.listen(process.env.PORT || 8080,"0.0.0.0",function () {
    console.log("Go!");
});