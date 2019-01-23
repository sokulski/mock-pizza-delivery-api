/*
	* Create and export configuration variables
	*
	*/
	
// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
	'httpPort' : 4000,
	'httpsPort' : 4001,
	'envName' : 'staging',
	'hashingSecret' : 'supersecrethash',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'XXXXX',
		'authToken' : 'XXXXX',
		'fromPhone' : '+1XXXXX'
	},
	'stripePrivateKey' : 'XXXXX',
	'mailgun' : {
		'username' : 'api',
		'password' : 'XXXXX-3939b93a-d7df6113',
		'from' : 'Mailgun Sandbox <XXXXX>',
		'subdomain' : 'XXXXX'
	}
};

// Production environment
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'differentsecrethash',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'XXXXX',
		'authToken' : 'XXXXX',
		'fromPhone' : '+1XXXXX'
	},
	'stripePrivateKey' : 'XXXXX',
	'mailgun' : {
		'username' : 'api',
		'password' : 'XXXXX',
		'from' : 'Mailgun Sandbox <XXXXX>',
		'subdomain' : 'XXXXX'
	}
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check taht the current environment is one of the environments above. If not, default to staging.
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;;