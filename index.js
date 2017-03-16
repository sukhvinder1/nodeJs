'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

//restService.post('/echo', function(req, res) {
//    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
//    return res.json({
//        speech: speech,
//        displayText: speech,
//        source: 'webhook-echo-sample'
//    });
//});

restService.post('/signOn', function(req, res) {
   var speech = "Just like that !"
   
//   var request = require('request');
//
//    var options = {
//      uri: 'https://pilot.api.ebanking.cibc.com/ebm-anp/api/v1/json/sessions',
//      method: 'POST',
//      json: {
//        "card" : {
//            "value" : "4506448426446045",
//            "encrypted" : "false",
//            "encrypt" : "true"
//        },
//          "password" : "potato"
//      }
//    };
//
//    request(options, function (error, response, body) {
//      if (!error && response.statusCode == 200) {
//          speech = "You have successfuly signed in!"
//        //console.log(body.id) // Print the shortened url.
//      } else {
//          speech = "na nai chaleya !! "
//      }
//    });
   
   
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'cibc'
    });
});



restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
