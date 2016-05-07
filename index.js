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

app.get("/",function (req, res) {
    res.send("On!");
});

app.listen(process.env.PORT || 8080,"0.0.0.0",function () {
    console.log("Go!");
});