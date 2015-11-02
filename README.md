# rest-orm [![Build Status](https://travis-ci.org/ngonzalvez/rest-orm.svg?branch=master)](https://travis-ci.org/ngonzalvez/rest-orm)

Node.js module that abstracts the process of consuming a REST endpoint.


## Installation

    npm install rest-orm


## Usage

### Create a new endpoint client

When creating a new client, a URL must be given as first arguments. If the URL have dynamic params, those variable params must be marked with the colon notation, as shown below.

~~~js
var rest = require('rest-orm');
var options = {
  headers: {
    Authorization: 'Bearer token'
  }
};

var Users = new rest.Client('http://domain.com/users/:id', options);

// The URL can have several dynamic params.
var UserVideos = new rest.Client('http://domain.com/users/:userId/videos/:slug');
~~~


### Get all instances from the API
The `getAll()` method can take an optional object as first parameters specifying the URL params. Considering the UserVideos model from last example:

~~~js
// Retrieve all videos from the user with ID 4.
// This will resolve to a "GET http://domain.com/users/4/videos" request.
UserVideos
  .getAll({ userId: 4 })
  .then(function (users) {
    console.log(users.length, 'users retrieved');
  });
~~~


## Get one instance from the API.
~~~js
// Retrieve the user with ID 4.
Users
  .get({ id: 4 })
  .then(function (user) {
    console.log(user);
  });
~~~


### Create a new instance and save it to the API
The create method can be called using several signatures.

- `create(data)` returns a Promise.
- `create(urlParams, data)` returns a Promise.
- `create(data, callback)` doesn't return a promise.
- `create(urlParams, data, callback)` doesn't return a promise.

~~~js
Users
  .create({ firstName: 'John', lastName: 'Doe' });
  .then(function (user) {
    console.log('User created');
  });

UserVideos
  .create({ userId: 4 }, { title: 'Learning Javascript', slug: 'learn-javascript' })
  .then(function (video) {
    console.log('User video created');
  }):
~~~


### Delete an instance from the API by ID
As it was the case with the `create()` method, `delete()` can also be called with different signatures.

- `delete(urlParams)` returns a Promise.
- `delete(callback)` returns a Promise.
- `delete(urlParams, callback)` doesn't return a Promise.

~~~js
Users
  .delete({ id: userId })
  .then(function () {
    console.log('User deleted');
  });

// This will resolve to: DELETE http://domain.com/users/videos/learn-javascript
UserVideos
  .delete({ slug: 'learn-javascript' })
  .then(function () {
    // ...
  });
~~~


### Update an instance.
As with the previous methods, an object with the URL parameters must be provided as first argument. The second argument must be an object with the new data.

~~~js
Users
  .update({ id: userId }, data)
  .then(function () {
    console.log('User updated');
  });
~~~

### Callbacks

All methods support callbacks. However, if a callback function is given no promise will be returned. Callbacks must always be provided after all other function arguments. E.g.:

~~~js
Users.getAll(function (err, users) {
  console.log(users.length, 'users found');
});
~~~
