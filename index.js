
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
app.post('/signOn', function(req, res) {
// app.get('/signOn', function(req, res) {

    console.log("Incoming request to /signOn")
    console.log("\n\n\nRequested Url:")
    console.log(req.url)
    console.log("\n\n\nHeaders in the request:")
    console.log(req.headers)
    console.log("\n\n\nBody of the request:")
    console.log(req.body)

    // Get the card number and password from the request
    var cardNickname = req.body.result && req.body.result.parameters && req.body.result.parameters.cardNickname ? req.body.result.parameters.cardNickname : ''
    var password = req.body.result && req.body.result.parameters && req.body.result.parameters.password ? req.body.result.parameters.password : ''
    // var cardNumber = "4506445090048206"
    // var password = "banking"

    var cardNumbers = [
        "4506448426445187",
        "4506448426445112",
        "4506448426445252"
    ]

    var cardNumber = ""
    if (cardNickname.toUpperCase() === "Greg".toUpperCase()) {
        cardNumber = cardNumbers[0]
    } else if (cardNickname.toUpperCase() === "Mohit".toUpperCase()) {
        cardNumber = cardNumbers[1]
    } else if (cardNickname.toUpperCase() === "Nick".toUpperCase()) {
        cardNumber = cardNumbers[2]
    }

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
                // res.json({
                //     result: "Success",
                //     message: "You have successfully signed on"
                // })
                res.json({
                    speech: "You have successfully signed on",
                    displayText: "You have successfully signed on",
                    source: 'CIBC'
                })

            } else {
                console.log("failed")
                console.log(error)

                res.status(200)
                return res.json({
                    speech: "Sign on with card number " + cardNumber + " failed.  Please try again.",
                    displayText: "Sign on with card number " + cardNumber + " failed.  Please try again.",
                    source: 'CIBC'
                })
            }
        }

        // Send the sign on request
        signOnRequest(cardNumber, password, callback)        

    } else {
        res.status(200)
        res.json({
            speech: "Card number or password not provided.  Please try again.",
            displayText: "Card number or password not provided.  Please try again.",
            source: 'CIBC'
        })
    }

});

app.post('/getBalance', function(req, res) {
// app.get('/getBalance', function(req, res) {

    console.log("Incoming request to /getBalance")
    console.log("\n\n\nRequested Url:")
    console.log(req.url)
    console.log("\n\n\nHeaders in the request:")
    console.log(req.headers)
    console.log("\n\n\nBody of the request:")
    console.log(req.body)


    // Only continue if we have an x-auth-token already
    if (xAuthToken != "") {

        var callback = function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("\n\n\n")
                console.log("success on accounts")
                jsonBody = JSON.parse(body)
                // Set balance safely (will not give an exception when null)
                var balance = jsonBody.accountGroups[0] && jsonBody.accountGroups[0].accounts[0] ? jsonBody.accountGroups[0].accounts[0].balance : undefined
                if (balance != undefined) {
                    console.log(balance)
                    var balanceCurrency = balance.currency
                    var balanceAmount = balance.amount
                    res.json({
                        speech: "Your balance is, $" + balanceAmount,
                        displayText: "Your balance is, $" + balanceAmount,
                        source: 'CIBC'
                    })
                } else {
                    // Balance, or the path to it doesn't exist.  Something is wrong with accounts.
                    res.status(200)
                    res.json({
                        speech: "Unable to get balance",
                        displayText: "Unable to get balance",
                        source: 'CIBC'
                    })
                }
                // console.log(body)
            } else {
                console.log("failed on accounts")
                console.log(error)

                res.status(200)
                res.json({
                    speech: "Unable to get balance",
                    displayText: "Unable to get balance",
                    source: 'CIBC'
                })
            }
        }

        getAccountsRequest(callback)

    } else {
        res.status(200)
        res.json({
            speech: 'You are not signed in, please say "sign in" to sign in first',
            displayText: 'You are not signed in, please say "sign in" to sign in first',
            source: 'CIBC'
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
        // url: 'https://uat3.www.cibc.mobi/ebm-anp/api/v1/json/sessions',
        url: 'https://pilot.api.ebanking.cibc.com/ebm-anp/api/v1/json/sessions',
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
        // url: 'https://uat3.www.cibc.mobi/ebm-ai/api/v1/json/accountGroups',
        url: 'https://pilot.api.ebanking.cibc.com/ebm-ai/api/v1/json/accountGroups',
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

app.listen((process.env.PORT || 8000), function() {
    console.log("App up and running, listening.")
})