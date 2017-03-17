
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// User session token
var xAuthToken = ""

// Server routes
// app.post('/signOn', function(req, res) {
app.get('/signOn', function(req, res) {

    // Get the card number and password from the request
    // var cardNumber = req.body.result && req.body.result.parameters && req.body.result.parameters.cardNumber ? req.body.result.parameters.cardNumber : ''
    // var password = req.body.result && req.body.result.parameters && req.body.result.parameters.password ? req.body.result.parameters.password : ''
    var cardNumber = "4506445090048206"
    var password = "banking"

    // Only continue if the required fields are provided
    if (cardNumber != '' && password != '') {

        // Set the callback for the call
        var callback = function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("success")
                // console.log(body)
                xAuthToken = response.headers["x-auth-token"]
                console.log(response.headers["x-auth-token"])

                res.status(200)
                res.json({
                    result: "Success",
                    message: "You have successfully signed on"
                })

            } else {
                console.log("failed")
                console.log(error)

                res.status(400)
                return res.json({
                    result: "Failure",
                    message: "Sign in failed"
                })
            }
        }

        // Send the sign on request
        signOnRequest(cardNumber, password, callback)        

    } else {
        res.status(400)
        res.json({
            result: "Failure",
            message: "Card number or password not provided"
        })
    }

});

// app.post('/getBalance', function(req, res) {
app.get('/getBalance', function(req, res) {

    // Only continue if we have an x-auth-token already
    if (xAuthToken != "") {

        var callback = function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("\n\n\n\n\n")
                console.log("success on accounts")
                jsonBody = JSON.parse(body)
                // Set balance safely (will not give an exception when null)
                var balance = jsonBody.accountGroups[0] && jsonBody.accountGroups[0].accounts[0] ? jsonBody.accountGroups[0].accounts[0].balance : undefined
                if (balance != undefined) {
                    console.log(balance)
                    var balanceCurrency = balance.currency
                    var balanceAmount = balance.amount
                    res.json({
                        result: "Success",
                        message: "Your balance has been retrieved",
                        amount: balanceAmount,
                        currency: balanceCurrency
                    })
                } else {
                    // Balance, or the path to it doesn't exist.  Something is wrong with accounts.
                    res.status(500)
                    res.json({
                        result: "Failure",
                        message: "Unable to get balance"
                    })
                }
                // console.log(body)
            } else {
                console.log("failed on accounts")
                console.log(error)
            }
        }

        getAccountsRequest(callback)

    } else {
        res.status(403)
        res.json({
            result: "Failure",
            message: "You are not authenticated."
        })
    }
})

app.get('/testPing', function(req, res) {
    res.sendStatus(200)
})
// End server routes


// eBanking calls

var signOnRequest = function(cardNumber, password, callback) {
    // Request options
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
                "value": cardNumber
            },
            "password": password
        })
    }

    // Request call
    request(options, callback)
}



var getAccountsRequest = function(callback) {
    // Request options
    var options = {
        url: 'https://uat3.www.cibc.mobi/ebm-ai/api/v1/json/accountGroups',
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "brand": "cibc",
            "X-Auth-Token": xAuthToken,
            "Cookie": "brand=cibc;client_type=mobile_android?os_version=23&app_version=6.0;COOKIE_ACCESS_CHANNEL=MOBILE_ANDROID;eb_version=1.2;"
        }
    }

    request(options, callback)
}

app.listen(12345, function() {
    console.log("App up and running, listening on port 12345.")
})