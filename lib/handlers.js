/*
 * Request handlers
 *
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

// Define the handlers
var handlers = {};


// HTML Handlers

// Index handler
handlers.index = function(data, callback) {
	// Reject any request that isn't a GET
	if(data.method == 'get') {
		callback(200, '<h1>Hello world!</h1>', 'html');
		// Read in the index template as a string
	} else {
		callback(405,undefined,'html');
	}
};





// JSON API Handlers
// Users
handlers.users = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, email, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
	// Check that all required fields are filled out
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
	
	if(firstName && lastName && phone && email && password && tosAgreement) {
		// Make sure that the user doesn't already exist
		_data.read('users',phone,function(err, data) {
			if(err) {
				// Hash the password
				var hashedPassword = helpers.hash(password);
				
				if(hashedPassword) {
					// Create the user object
					var userObject = {
						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'email' : email,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					};
					
					// Store the user
					_data.create('users', phone, userObject, function(err) {
						if(!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {'Error' : 'Could not create the new user'});
						}
					});
				} else {
					callback(500, {'Error' : 'Could not hash the user\'s password'});
				}
				
			} else {
				// User already exists
				callback(400, {'Error' : 'A user with that phone number already exists'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required fields'});	
	};
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function(data, callback) {
	// check that the phone number provided is valid
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone) {
		// Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if(tokenIsValid) {
				// Lookup the user
				_data.read('users', phone, function(err, data) {
					if(!err && data) {
						// Remove the hashed password from the data object before return
						delete data.hashedPassword;
						callback(200, data);
					} else {
						callback(404);
					}
				});
			} else {
				callback(403, {'Error' : 'Missing or invalid token in header'});
			}
		})
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, email, password (at least one must be specified)
handlers._users.put = function(data, callback) {
	// Check for the required field
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	
	// Check for the optional fields
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	
	// Error if the phone is invalid
	if(phone) {
		// Error if nothing is sent to update
		if(firstName || lastName || email || password) {
			
			// Get the token from the headers
			var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
				if(tokenIsValid) {
					_data.read('users', phone, function(err, userData) {
						if(!err && userData) {
							// Update the fields necessary
							if(firstName) {
								userData.firstName = firstName;
							}
							if(lastName) {
								userData.lastName = lastName;
							}
							if(email) {
								userData.email = email;
							}
							if(password) {
								userData.hashedPassword = helpers.hash(password);
							}
							
							// Store the new updates
							_data.update('users', phone, userData, function(err) {
								if(!err) {
									callback(200);
								} else {
									console.log(err);
									callback(500, {'Error' : 'Could not update the user'});
								}
							});
						} else {
							callback(400, {'Error' : 'The specified user does not exist'});
						}
					});
				} else {
					callback(403, {'Error' : 'Missing or invalid token in header'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing fields to update'});
		}
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};

// Users - delete
// Required data: phone
// Optional data: none
handlers._users.delete = function(data, callback) {
	// Check that the phone number provided is valid
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone) {
		// Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if(tokenIsValid) {
				// Lookup the user
				_data.read('users', phone, function(err, userData) {
					if(!err && data) {
						_data.delete('users', phone, function(err) {
							if(!err) {
								// Delete each of the checks assocaited with the user
								var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
								var checksToDelete = userChecks.length;
								if(checksToDelete > 0) {
									var checksDeleted = 0;
									var deletionErrors = false;
									
									// Loop through the checks
									userChecks.forEach(function(checkId) {
										// Delete the check
										_data.delete('checks', checkId, function(err) {
											if(err) {
												deletionErrors = true;
											}
											
											checksDeleted++;
											if(checksDeleted == checksToDelete) {
												if(!deletionErrors) {
													callback(200);
												} else {
													callback(500, {'Error' : 'Erors enountered while attempting to delete all of the user\'s checks, all checks may not have been deleted from the server successfully'});
												}
											}
										});
									});
								} else {
									callback(200);
								}
							} else {
								console.log(err);
								callback(500, {'Error' : 'Could not delete the specified user'});
							}
						});
					} else {
						callback(400, {'Error' : 'Could not find the specified user'});
					}
				});
			} else {
				callback(403, {'Error' : 'Missing or invalid token in header'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};


// Tokens
handlers.tokens = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all the tokens methods
handlers._tokens = [];

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback) {
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	if(phone && password) {
		// Lookup the user who matches that phone number
		_data.read('users', phone, function(err, userData) {
			if(!err && userData) {
				// Has the sent password and compare it to the password sotred in the user object
				var hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword) {
					// Create a new token with a random name. Set expiration date 1 hour in the future
					var tokenId = helpers.createRandomString(20);
					var expires = Date.now() + 1000 * 60 * 60; // One hour
					var tokenObject = {
						'phone' : phone,
						'id' : tokenId,
						'expires' : expires
					};
					
					// Store the token
					_data.create('tokens', tokenId, tokenObject, function(err) {
						if(!err) {
							callback(200, tokenObject);
						} else {
							callback(500, {'Error' : 'Could not create the new token'});
						}
					})
				} else {
					callback(400, {'Error' : 'Password did not match the specified user\'s stored password'});
				}
			} else {
				callback(400, {'Error' : 'Could not find the specified user'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required fields'});
	}
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
	// Check that the id is valid
	var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id) {
		// Lookup the user
		_data.read('tokens', id, function(err, tokenData) {
			if(!err && tokenData) {
				callback(200, tokenData);
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
	var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
	var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
	if(id && extend) {
		// Lookup the token
		_data.read('tokens', id, function(err, tokenData) {
			if(!err && tokenData) {
				// Check to make sure the token isn't already expired
				if(tokenData.expires > Date.now()) {
					// SEt the expiration an hour from now
					tokenData.expires = Date.now() + 1000 * 60 * 60;
					
					// Store the new updates
					_data.update('tokens', id, tokenData, function(err) {
						if(!err) {
							callback(200);
						} else {
							callback(500, {'Error' : 'Could not update the token\'s expiration'});
						}
					});
				} else {
					callback(400, {'Error' : 'The token has already expired, and cannot be extended'});
				}
			} else {
				callback(400, {'Error' : 'The specified token does not exist'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
	}
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
	// Check that the id provided is valid
	var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id) {
		// Lookup the user
		_data.read('tokens', id, function(err, data) {
			if(!err && data) {
				_data.delete('tokens', id, function(err) {
					if(!err) {
						callback(200);
					} else {
						console.log(err);
						callback(500, {'Error' : 'Could not delete the specified token'});
					}
				});
			} else {
				callback(400, {'Error' : 'Could not find the specified token'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
	// Lookup the token
	_data.read('tokens', id, function(err, tokenData) {
		if(!err && tokenData) {
			// Check that the token is for the given user and has not expired
			if(tokenData.phone == phone && tokenData.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
};

// Menu handler
handlers.menu = function(data, callback) {
	// Reject any request that isn't a GET
	if(data.method == 'get') {
		// Lookup the menu
		_data.read('menu', 'menu', function(err, menuData) {
			if(!err && menuData) {
				callback(200, menuData);
			} else {
				callback(404);
			}
		});
	} else {
		callback(405,undefined,'html');
	}
};


// Orders
handlers.orders = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._orders[data.method](data, callback);
	} else {
		callback(405);
	}
};


// Container for all the orders methods
handlers._orders = {};

// Orders - post
// Required data: itemId
// Optional data: none
handlers._orders.post = function(data, callback) {
	// Validate inputs
	var itemId = typeof(data.payload.itemId) == 'number' && data.payload.itemId % 1 === 0 && data.payload.itemId >=1 ? data.payload.itemId : false;
	
	if(itemId) {
		// Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		
		// Lookup the user by reading the token
		_data.read('tokens', token, function(err, tokenData) {
			if(!err && tokenData) {
				var userPhone = tokenData.phone;
				
				// Lookup the user data
				_data.read('users', userPhone, function(err, userData) {
					if(!err && userData) {
						// Create a random id for the order
						var orderId = helpers.createRandomString(20);
						
						// Create the items object
						var itemsArray = [
							itemId
						];
						
						// Create the order object and include the user's phone and email
						var orderObject = {
							'id' : orderId,
							'userPhone' : userPhone,
							'items' : itemsArray
						};
						
						// Save the object
						_data.create('orders', orderId, orderObject, function(err) {
							if(!err) {
								callback(200, orderObject); 
							} else {
								callback(500, {'Error' : 'Could not create the new order'});
							}
						});

					} else {
						callback(403);
					}
				})
			} else {
				callback(403);
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required inputs or inputs are invalid'});
	}
};


// Orders - get
// Required data: id
// Optional data: none
handlers._orders.get = function(data, callback) {
	// check that the id provided is valid
	var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id) {
		// Lookup the check
		_data.read('orders', id, function(err, orderData) {
			if(!err && orderData) {
				// Get the token from the headers
				var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
				// Verify that the given token is valid and belongs to the user who created the check
				// Compare this against the userPhone in the checkData object, as each check knows which user
				// This makes sure that the user making the request is the same one that the check belongs to
				handlers._tokens.verifyToken(token, orderData.userPhone, function(tokenIsValid) {
					if(tokenIsValid) {
						// Return the check data
						callback(200, orderData);
					} else {
						callback(403);
					}
				});
			} else {
				callback(404);
			}
		});
		
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};


// Orders - put
// Required data: id, itemId
// Optional data: none
handlers._orders.put = function(data,callback) {
	// Check for the required fields
	var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
	var itemId = typeof(data.payload.itemId) == 'string' && data.payload.itemId.trim().length >= 1 ? data.payload.itemId.trim() : false;
	
	if(id && itemId) {
		// Lookup the check
		_data.read('orders', id, function(err, orderData) {
			if(!err && orderData) {
				// Get the token from the headers
				var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
				// Verify that the given token is valid and belongs to the user who created the check
				handlers._tokens.verifyToken(token, orderData.userPhone, function(tokenIsValid) {
					if(tokenIsValid) {
						// Add the item to the order
						orderData.items.push(itemId);
						delete orderData.longOrderData;
						delete orderData.total;
						
						// Store the new updates
						_data.update('orders', id, orderData, function(err) {
							if(!err) {
								callback(200, orderData);
							} else {
								callback(500, {'Error' : 'Could not update the order'});
							};
						})
					} else {
						callback(403);
					}
				});
			} else {
				callback(400, {'Error' : 'Order ID did not exist'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};


// Orders - delete
// Required data: id
// Optional data: none



// Checkout
handlers.checkout = function(data, callback) {
	var acceptableMethods = ['post', 'get'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._checkout[data.method](data, callback);
	} else {
		callback(405);
	}
};


// Container for all the orders methods
handlers._checkout = {};


// Checkout - get
// Required data: orderId
// Optional data: none
// Description: Returns order boject with complete item listing, prices, and total
handlers._checkout.get = function(data, callback) {
	// check that the id provided is valid
	var orderId = typeof(data.queryStringObject.orderId) == 'string' && data.queryStringObject.orderId.trim().length == 20 ? data.queryStringObject.orderId.trim() : false;
	if(orderId) {
		// Lookup the order
		_data.read('orders', orderId, function(err, orderData) {
			if(!err && orderData) {
				// Get the token from the headers
				var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
				// Verify that the given token is valid and belongs to the user who created the check
				// Compare this against the userPhone in the checkData object, as each check knows which user
				// This makes sure that the user making the request is the same one that the check belongs to
				handlers._tokens.verifyToken(token, orderData.userPhone, function(tokenIsValid) {
					if(tokenIsValid) {
						// Get the menu
						_data.read('menu', 'menu', function(err, menuData) {
							if(!err && menuData) {
								var longOrderData = [];
								var orderTotal = 0;
								orderData.items.forEach(function(itemId) {
									longOrderData.push(menuData[itemId]);
									orderTotal += menuData[itemId].price;
								});

								orderData.longOrderData = longOrderData;
								orderData.total = orderTotal;
								
								// Store the new updates
								_data.update('orders', orderId, orderData, function(err) {
									if(!err) {
										callback(200, orderData);
									} else {
										callback(500, {'Error' : 'Could not prepare the order for checkout'});
									};
								})

							} else {
								callback(500, {'Error' : 'There was a problem tallying your order'});
							}
						});
							

					} else {
						callback(403);
					}
				});
			} else {
				callback(404);
			}
		});
		
	} else {
		callback(400, {'Error' : 'Missing required field'});
	}
};


// Checkout - post
// Required data: orderId, stripeToken
// Optional data: none
// Description: Charges stripeToken for total and sends email receipt via MailGun upon success
handlers._checkout.post = function(data, callback) {
	// Validate inputs
	var orderId = typeof(data.queryStringObject.orderId) == 'string' && data.queryStringObject.orderId.trim().length == 20 ? data.queryStringObject.orderId.trim() : false;
	var stripeToken = typeof(data.queryStringObject.stripeToken) == 'string' && data.queryStringObject.stripeToken.trim().length >= 1 ? data.queryStringObject.stripeToken.trim() : false;
	
	if(orderId && stripeToken) {
		// Lookup the order
		_data.read('orders', orderId, function(err, orderData) {
			if(!err && orderData) {
				// Verify that the order has passed through CHECKOUT GET
				var orderTotal = typeof(orderData.orderTotal) == 'number' && orderData.orderTotal > 1 ? orderData.orderTotal : false;
				
				if(orderTotal) {
					// Charge the stripeToken and record the chargeId
					
						// Email receipt
				} else {
					callback(405, {'Error' : 'You must call checkout with GET method first'});
				}
				
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required inputs or inputs are invalid'});
	}
};


// Ping handler
handlers.ping = function(data, callback) {
	callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
	callback(404);
};


// Export the module
module.exports = handlers