/* 
 * Helpers for various tasks
 *
 */
 
 // Dependencies
 var crypto = require('crypto');
 var config = require('./config');
 var https = require('https');
 var querystring = require('querystring');
 var path = require('path');
 var fs = require('fs');
 
 // Module container
 var helpers = {};
 
 // Create a SHA256 hash
helpers.hash = function(str) {
	if(typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
 };
 
 // Decode a buffer into JSON
 // Parse a JSON string to an object in all cases, without throwing
 helpers.parseJsonToObject = function(str) {
	try {
		var obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
 };
 
 
 // Create a string of random alphanumeric characters of a given length
 helpers.createRandomString = function(strLength) {
	 strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
	 if(strLength) {
		 // Define all the possible characters
		 var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		 
		 // Start the final string
		 var str = '';
		 for(i = 1; i <= strLength; i++) {
			 // Get a random character
			 var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
			 // Append this character to the final string
			 str+=randomCharacter;
		 }
		 
		 // Return the final string
		 return str;
	 } else {
		 return false;
	 }
 }
 

// Charge a token using Stripe
helpers.chargeToken = function(token, amount, description, callback) {
	token = typeof(token) == 'string' && token.trim().length >= 1 ? token.trim() : false;
	amount = typeof(amount) == 'number' && amount > 0 ? amount*100 : false; // Prepare amount for Stripe
	description = typeof(description) == 'string' && description.trim().length >= 1 ? description.trim() : false;
	
	if(token && amount) {
		// Configure the request payload
		var payload = {
			'amount' : amount,
			'currency' : 'usd',
			'source' : token,
			'description' : description
		};
		
		// Stringify the payload
		var stringPayload = querystring.stringify(payload);
		
		// Configure the request details
		var requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.stripe.com',
			'method' : 'POST',
			'path' : '/v1/charges',
			'auth' : config.stripePrivateKey+':',
			'headers' : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		};
		
		// Instantiate the request object
		var req = https.request(requestDetails, function(res) {
			// Grab the status of the sent request

			var data = '';
			
			res.on('data', function(chunk) {
				data += chunk;
			});
			
			res.on('end', function() {
				var status = res.statusCode;
				// Callback successfully if the request went through
				if(status == 200 || status == 201) {
					callback({'Error' : false, 'chargeId' : JSON.parse(data).id});
				} else {
					callback({'Error' : true, 'Message' : 'Status code returned was '+status});
				}
			});
		});
			
		// Bind to the error event so that it doesn't get thrown
		req.on('error', function(e) {
			callback(e);
		});
		
		// Add the payload
		req.write(stringPayload);
		
		// End the request
		req.end();
		
	} else {
		callback('Required parameters were missing or invalid');
	}
}


// Charge a token using Stripe
helpers.sendEmail = function(email, name, subject, message, callback) {
	email = typeof(email) == 'string' && email.trim().length >= 1 ? email.trim() : false;
	name = typeof(name) == 'string' && name.trim().length >= 1 ? name.trim() : false;
	subject = typeof(subject) == 'string' && subject.trim().length >= 1 ? subject.trim() : false;
	message = typeof(message) == 'string' && message.trim().length >= 1 ? message.trim() : false;
	
	if(email && name && message) {
		// Configure the request payload
		var payload = {
			'from' : config.mailgun.from,
			'to' : name + ">" + email + ">",
			'subject' : subject,
			'text' : message
		};
		
		// Stringify the payload
		var stringPayload = querystring.stringify(payload);
		
		// Configure the request details
		var requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.mailgun.net',
			'method' : 'POST',
			'path' : '/v3/'+config.mailgun.subdomain+'.mailgun.org/messages',
			'auth' : config.mailgun.username+':'+config.mailgun.password,
			'headers' : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		};
		
		// Instantiate the request object
		var req = https.request(requestDetails, function(res) {
			// Grab the status of the sent request

			var data = '';
			
			res.on('data', function(chunk) {
				data += chunk;
			});
			
			res.on('end', function() {
				var status = res.statusCode;
				// Callback successfully if the request went through
				if(status == 200 || status == 201) {
					callback({'Error' : false, 'data' : JSON.parse(data)});
				} else {
					callback({'Error' : true, 'Message' : 'Status code returned was '+status});
				}
			});
		});
			
		// Bind to the error event so that it doesn't get thrown
		req.on('error', function(e) {
			callback(e);
		});
		
		// Add the payload
		req.write(stringPayload);
		
		// End the request
		req.end();
		
	} else {
		callback('Required parameters were missing or invalid');
	}
}
 
 // Export the module
 module.exports = helpers;