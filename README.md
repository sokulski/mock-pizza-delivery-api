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

### Reading the Menu
This method doesn't require authentication.

```
curl -X GET \
http://localhost:4000/menu \
-H 'Postman-Token: 912a985b-df4e-4d16-b755-428405ed18e6' \
-H 'cache-control: no-cache'
```