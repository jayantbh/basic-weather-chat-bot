/**
 * Created by Jayant Bhawal on 07-05-2016.
 */
var express = require('express');
var app = express();

app.get("/webhook",function (req, res) {
    if (req.query['hub.verify_token'] === 'the_biggest_risk_one_can_take_is_not_taking_a_risk') {
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