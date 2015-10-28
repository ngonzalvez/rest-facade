# rest-orm [![Build Status](https://travis-ci.org/ngonzalvez/rest-orm.svg?branch=master)](https://travis-ci.org/ngonzalvez/rest-orm)

Node.js module that abstracts the process of consuming a REST endpoint.


## Installation

    npm install rest-orm@0.2.1


## Usage

### Create a new endpoint client

~~~js
var rest = require('rest-orm');
var Users = new rest.Client('http://domain.com/users');
~~~


### Get all instances from the API

~~~js
Users
  .getAll()
  .then(function (users) {
    console.log(users.length, 'users retrieved');
  });
~~~


### Create a new instance and save it to the API

~~~js
Users
  .create({ firstName: 'John', lastName: 'Doe' });
  .then(function (user) {
    console.log('User created');
  });
~~~


### Delete an instance from the API by ID

~~~js
Users
  .delete(userId)
  .then(function () {
    console.log('User deleted');
  });
~~~


### Update an instance.

~~~js
Users
  .update(userId, data)
  .then(function () {
    console.log('User updated');
  });
~~~

### Callbacks

All methods support callbacks. However, if a callback function is given no promise will be returned. E.g.:

~~~js
Users.getAll(function (users) {

});
~~~
