'use strict';

const express = require('express')();
const router = require('express').Router();
const bodyParser = require('body-parser');
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const ApiAiApp = require('actions-on-google').ApiAiApp;

express.use(bodyParser.json({type: 'application/json'}));

// In aip.ai console, under Fulfillment set webhook url to
// https://[YOUR DOMAIN]/example/location
// don't forget to select "Enable webhook for all domains" for the DOMAIN field
router.post('/location', (req, res) => {
	const app = new ApiAiApp({request: req, response: res});
	const intent = app.getIntent();

	switch(intent){
		case 'input.welcome':
			// you are able to request for multiple permissions at once
			const permissions = [
				app.SupportedPermissions.NAME,
				app.SupportedPermissions.DEVICE_PRECISE_LOCATION
			];
			app.askForPermissions('Your own reason', permissions);
		break;
		case 'DefaultWelcomeIntent.DefaultWelcomeIntent-fallback':
			if (app.isPermissionGranted()) {
				// permissions granted.
				let displayName = app.getUserName().displayName;

				//NOTE: app.getDeviceLocation().address always return undefined for me. not sure if it is a bug.
				// 			app.getDeviceLocation().coordinates seems to return a correct values
				//			so i have to use node-geocoder to get the address out of the coordinates
				let coordinates = app.getDeviceLocation().address;

				app.tell('Hi ' + app.getUserName().givenName + '! Your address is ' + address);
			}else{
				// permissions are not granted. ask them one by one manually
				app.ask('Alright. Can you tell me you address please?');
			}
		break;
	}
});

router.get('/testPing', function(req, res) {
    res.sendStatus(200)
})

express.use('/example', router);

express.listen('8081', function () {
  console.log('Example app is running')
})
