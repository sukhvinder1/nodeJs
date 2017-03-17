'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request')

var speech = "Just like that !"

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

var options = {
    url: 'https://uat3.www.cibc.mobi/ebm-anp/api/v1/json/sessions',
    method: "POST",
    headers: {
        "WWW-Authenticate": "CardAndPassword",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "brand": "cibc",
        "Cookie": "brand=cibc;client_type=mobile_android?os_version=23&app_version=6.0;COOKIE_ACCESS_CHANNEL=MOBILE_ANDROID;eb_version=1.2;"
    },
    body: JSON.stringify({
        "card": {
            "encrypt": true,
            "encrypted": false,
            "value": "4506445090048206"
        },
        "password": "banking"
    })
}

restService.get('/testPing', function(req, res) {
    res.sendStatus(200)
})

restService.post('/signOn', function(req, res) {
    
    request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("success")
        console.log(response.headers['x-auth-token'])
        speech = "Signed in !"
        console.log(body)
    } else {
        console.log("failed")
        speech = "not signed in !"
        console.log(error)
    }
        
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'CIBC'
        });  
    })
});

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
