# Mock Pizza Delivery API
A homework assignment for the Node.js Master class.

An API that facilitates the ordering of pizza from a menu.

## Before You Begin
Before you begin, you'll need the following things to test:

- Mailgun sandbox API credentials
- Stripe sandbox API credentials

The free accounts for both of these services are sufficient.

Once you have both of these, copy config.template.js, rename it config.js, and modify with your credentials.

Use the 'XXXXX' as a guide for where your own credentials need to go.


## Using the API
You can use the API to view a menu, create or modify users, and create, modify, or complete orders.

### Reading the Menu - /menu
This method doesn't require authentication.

`CURL -X GET http://localhost:4000/menu`

The response will be in the form of a JSON object:

```
{
    "APP1": {
        "name": "Garlic Knots",
        "price": 5,
        "itemId": "APP1"
    },
    "PZ1": {
        "name": "Cheese Pizza",
        "price": 12,
        "itemId": "PZ1"
    },
    "PZ2": {
        "name": "Pepperoni Pizza",
        "price": 12,
        "itemId": "PZ2"
    }
}
```

### Wokring with Users - /users

To create a user...

```
curl -X POST \
  http://localhost:4000/users \
  -d '{
	"firstName":"Johnny",
	"lastName":"Appleseed",
	"phone":"5552345678",
	"email":"test@email.com",
	"password":"password",
	"tosAgreement":true
}'
```

To read a user... (See below for how to obtain a token)
```
curl -X GET \
  'http://localhost:4000/users?phone=5552345678' \
  -H 'token: wstm9e9jdoxhf1lnc8uq'
  ```

To update a user...
```
curl -X PUT \
  http://localhost:4000/users \
  -H 'token: ygrod60gjtg97uc8xtfv' \
  -d '{
	"phone": "5552345678",
    "firstName": "John",
    "lastName": "Appleseed"
}'
```

To delete a user...
```
curl -X DELETE \
  'http://localhost:4000/users?phone=5551234567' \
  -H 'Postman-Token: 523b7217-cf79-4376-b86a-3fb9f47b5860' \
  -H 'cache-control: no-cache' \
  -H 'token: r05h7iesf93tg49kzt2y'
```


### Working with Tokens - /tokens
Tokens are used to identify a user's session.

To create a token...

```
curl -X POST \
  http://localhost:4000/tokens \
  -d '{
    "phone": "phone",
    "password": "password"
}'
```

To logout by deleting a token...
```
curl -X DELETE \
  'http://localhost:4000/tokens?id=ygrod60gjtg97uc8xtfv' \
```


### Working with Orders - /orders
You'll create an order, add some things to it, and then checkout.

To create an order...
```
curl -X POST \
  http://localhost:4000/orders \
  -H 'token: wstm9e9jdoxhf1lnc8uq' \
  -d '{
    "itemId": 1
}'
```

To read an order...
```
curl -X GET \
  'http://localhost:4000/orders?id=1p730u6tkybm08ixbwa4' \
  -H 'token: iakab4ykqetv2jqfhdlf'
```

To add an item to an order...
```
curl -X PUT \
  http://localhost:4000/orders \
  -H 'token: wstm9e9jdoxhf1lnc8uq' \
  -d '{
	"id": "1p730u6tkybm08ixbwa4",
    "itemId": "PZ2"
}'
```

Read the order prior to checkout...
```
curl -X GET \
  'http://localhost:4000/checkout?orderId=1p730u6tkybm08ixbwa4' \
  -H 'Postman-Token: 028a28cf-3aa5-4606-8ad4-4763b8fdce7e' \
  -H 'cache-control: no-cache' \
  -H 'token: o3u54plt2kyjakcom0fr'
```

Complete the checkout...
You'll need a stripe token, and to have called the endpoint with GET to allow the user to approve the order.
```
curl -X POST \
  http://localhost:4000/checkout \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 22442432-69c1-4bd7-9043-f9f458351d63' \
  -H 'cache-control: no-cache' \
  -H 'token: o3u54plt2kyjakcom0fr' \
  -d '{
	"orderId" : "1p730u6tkybm08ixbwa4",
	"stripeToken" : "tok_visa"
}'
```