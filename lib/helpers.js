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
 
 // Export the module
 module.exports = helpers;