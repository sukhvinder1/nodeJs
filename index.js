
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const ApiAiApp = require('actions-on-google').ApiAiApp;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// User session token
var xAuthToken = ""

// Server routes
app.post('/homeHook', function(req, res) {
    // result.metadata.intentName
    var intent = req.body.result && req.body.result.metadata && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : ''

    console.log("Incoming request to /homeHook")
    console.log("Intent is: " + intent)
    console.log("\n\n\nRequested Url:")
    console.log(req.url)
    console.log("\n\n\nHeaders in the request:")
    console.log(req.headers)
    console.log("\n\n\nBody of the request:")
    console.log(req.body)

    var signOnHandler = function() {

        // Get the card number and password from the request
        var cardNickname = req.body.result && req.body.result.parameters && req.body.result.parameters.cardNickname ? req.body.result.parameters.cardNickname : ''
        var password = req.body.result && req.body.result.parameters && req.body.result.parameters.password ? req.body.result.parameters.password : ''
        // var cardNumber = "4506445090048206"
        // var password = "banking"

        var cardNumbers = [
            "4506448426445187",
            "4506448426445112",
            "4506448426445252",
            "4506445644608992"
        ]

        var cardNumber = ""
        if (cardNickname.toUpperCase() === "Greg".toUpperCase()) {
            cardNumber = cardNumbers[0]
        } else if (cardNickname.toUpperCase() === "Mohit".toUpperCase()) {
            cardNumber = cardNumbers[1]
        } else if (cardNickname.toUpperCase() === "Nick".toUpperCase()) {
            cardNumber = cardNumbers[2]
        } else if (cardNickname.toUpperCase() === "Colin".toUpperCase() || cardNickname.toUpperCase() === "young money".toUpperCase()) {
            cardNumber = cardNumbers[3]
        }

        // Set the callback for the call
        var callback = function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("success")
                // console.log(body)
                xAuthToken = response.headers["x-auth-token"]
                console.log(response.headers["x-auth-token"])

                res.status(200)
                res.json({
                    speech: "You have successfully signed on, what would you like to do today ?",
                    displayText: "You have successfully signed on, what would you like to do today ?",
                    source: 'CIBC'
                })

            } else {
                console.log("failed")
                console.log(error)

                res.status(200)
                return res.json({
                    speech: "Signing on as " + cardNickname + " failed.  Please try again.",
                    displayText: "Signing on as " + cardNickname + " failed.  Please try again.",
                    source: 'CIBC'
                })
            }
        }

        // Send the sign on request
        console.log("Trying to sign in with card number: " + cardNumber)
        console.log("and password: " + password)
        signOnRequest(cardNumber, password, callback)

    }

    var getBalanceHandler = function() {

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
    }

    var helpIntentHelper = function() {

        var questionContext = req.body.result && req.body.result.parameters && req.body.result.parameters.questioncontext ? req.body.result.parameters.questioncontext : ''

        var response = "Question not recognized, please try again."

        if (questionContext == "customer service") {
            response = "Please call 1-800-465-2422 for service in English or call 1-888-337-2422 for service in French."
        } else if (questionContext == "raise salary") {
            response = "According to my records, you work for CIBC.  Keep up the good work and your wonderful managers will take care of your pay."
        } else if (questionContext == "edeposit") {
            response = "First, you must have the CIBC Mobile Banking app and be registered for CIBC Online and Mobile Banking, then sign on."
        } else if (questionContext == "stolen credit card") {
            response = "I'm sorry to hear that, we're here to help.  If you believe that your card may have been used fraudulently, contact CIBC Credit Card Services at 1-800-663-4575 in Canada or the U.S., or 514-861-9898 from elsewhere."
        } else if (questionContext == "fx rate") {
            response = "To obtain historical or current foreign exchange rates, please contact CIBC Telephone Banking at 1-800-465-2422. Assistance is available 24 hours a day, seven days a week."
        }

        res.status(200)
        res.json({
            speech: response,
            displayText: response,
            source: 'CIBC'
        })
    }

    if (intent == 'signIn') {
        signOnHandler()
    } else if (intent == 'getBalance') {
        getBalanceHandler()
    }
    else if (intent == 'help') {
        helpIntentHelper()
    } else {
        res.status(200)
        res.json({
            speech: "Command not recognized.  Please try again.",
            displayText: "Command not recognized.  Please try again.",
            source: 'CIBC'
        })
    }
})

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
        "4506445675079386",
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
                    speech: "Signing on as " + cardNickname + " failed.  Please try again.",
                    displayText: "Signing on as " + cardNickname + " failed.  Please try again.",
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

app.post('/location', (req, res) => {
	const apiApp = new ApiAiApp({request: req, response: res});
	const intent = apiApp.getIntent();

  console.log(req);

	switch(intent){
		case 'input.welcome':
			// you are able to request for multiple permissions at once
			const permissions = [
				apiApp.SupportedPermissions.NAME,
				apiApp.SupportedPermissions.DEVICE_PRECISE_LOCATION
			];
			apiApp.askForPermissions('Your own reason', permissions);
		break;
		case 'DefaultWelcomeIntent.DefaultWelcomeIntent-fallback':
			if (apiApp.isPermissionGranted()) {
				// permissions granted.
				let displayName = apiApp.getUserName().displayName;

				//NOTE: apiApp.getDeviceLocation().address always return undefined for me. not sure if it is a bug.
				// 			apiApp.getDeviceLocation().coordinates seems to return a correct values
				//			so i have to use node-geocoder to get the address out of the coordinates
				let coordinates = apiApp.getDeviceLocation().address;

				apiApp.tell('Hi ' + apiApp.getUserName().givenName + '! Your address is ' + address);
			}else{
				// permissions are not granted. ask them one by one manually
				apiApp.ask('Alright. Can you tell me you address please?');
			}
		break;
	}

  console.log(res);
});
// End server routes

// api.ai call handlers

// End api.ai call handlers

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
            "password": "potato"
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
