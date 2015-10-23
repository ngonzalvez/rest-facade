# rest-orm [![Build Status](https://travis-ci.org/ngonzalvez/rest-orm.svg?branch=dev)](https://travis-ci.org/ngonzalvez/rest-orm)

Node.js module that abstracts the process of consuming a REST endpoint.


## Installation

    npm install rest-orm


## Usage

### Create a new endpoint client

~~~js
var rest = require('rest-orm');
var Users = new rest.Client('http://domain.com/users/:id');
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
var user = Users.create({ firstName: 'John', lastName: 'Doe' });

user
  .save
  .then(function (user) {
    console.log('User created');
  });
~~~


### Delete an instance from the API by ID

~~~js
Users
  .delete({ id: 1 })
  .then(function () {
    console.log('User deleted');
  });
~~~


### Update an instance.

~~~js
Users
  .update({ id: 1 }, data)
  .then(function () {
    console.log('User updated');
  });
~~~
