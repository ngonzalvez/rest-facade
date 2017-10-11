# rest-facade [![Build Status](https://travis-ci.org/ngonzalvez/rest-facade.svg?branch=master)](https://travis-ci.org/ngonzalvez/rest-facade)

Node.js module that abstracts the process of consuming a REST endpoint.


## Installation

    npm install rest-facade


## Usage

### Create a new endpoint client

When creating a new client, a URL must be given as first arguments. If the URL have dynamic params, those variable params must be marked with the colon notation, as shown below.

~~~js
var rest = require('rest-facade');
var options = {
  headers: {
    Authorization: 'Bearer token'
  },
  errorFormatter: {
    name: 'error.title',
    message: 'error.text',
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
  .then(function (videos) {
    console.log(videos.length, 'videos retrieved');
  });
~~~


### Get one instance from the API.
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

There are 2 ways to update data, if you are using correctly the HTTP methods, 1 is PUT and the other one is PATCH, rest-facade supports both of them:`Client.update` and `Client.patch`.

As with the previous methods, an object with the URL parameters must be provided as first argument. The second argument must be an object with the new data.

#### PUT request
~~~js
Users
  .update({ id: userId }, data)
  .then(function () {
    console.log('User updated');
  });
~~~

or

~~~js
Users
  .put({ id: userId }, data)
  .then(function () {
    console.log('User updated');
  });
~~~

#### PATCH request

~~~js
Users
  .patch({ id: userId }, data)
  .then(function () {
    console.log('User updated');
  });
~~~

Both functions work exactly the same, the only difference is the method used to perform the request.

### Plain HTTP requests
In case you don't want to use the all the fancy abstractions (`create`, `update`, `delete`, `getAll`) you can also send plain HTTP requests using the HTTP method function.


~~~js
// GET request.
Users.get(qsParams[, cb]);

// POST request.
Users.post(qsParams, data[, cb]);

// PUT request.
Users.put(qsParams, data[, cb]);

// PATCH request.
Users.patch(qsParams, data[, cb]);

// DELETE request.
Users.delete(qsParams[, data, cb]);
~~~


### Callbacks

All methods support callbacks. However, if a callback function is given no promise will be returned. Callbacks must always be provided after all other function arguments. E.g.:

~~~js
Users.getAll(function (err, users) {
  console.log(users.length, 'users found');
});
~~~


### Response headers

~~~js
Users.getAll(function (err, body, headers) {
  // ...
});


Users
  .getAll()
  .then(function (body, headers) {
    // ...
  })
  .catch(function (err) {
    // ...
  });
~~~

### Query String

All methods accept an object with URL params as first argument. The properties in this object will be used to format the URL as shown above. However, the properties defined in this object, but not in the endpoint URL, will be added as query string params.

> N.B. any properties in a given `options` object whose values are Functions will be ignored with regard to generating the query string.

~~~js
var Users = new rest.Client('http://domain.com/users/:id');

Users.get({ id: 1 });  // Resolves to http://domain.com/users/1
Users.getAll({ page: 1, pageSize: 10 });  // Resolves to http://domain.com/users?page=1&pageSize=10
~~~

There may be some cases when you are working with an API that follows a different naming convention, and it is not really clean to have mixed naming conventions in our code.

~~~js
// Not good.
Users.getAll({ page: 1, 'page_size': 10 });
~~~

You can solve this problem by specifing a naming convention when creating the Rest Client. The naming convention can be any of `snakeCase`, `camelCase`, `pascalCase`, `paramCase`, or any other implemented by the [change-case](https://github.com/blakeembrey/change-case) library.

~~~js
var Users = rest.Client('http://domain.com/users/:id', { query: { convertCase: 'snakeCase' }});

Users.getAll({ page: 1, pageSize: 10 });  // Will resolve to http://domain.com/users?page=1&page_size=10
~~~

#### Arrays
By default, arrays in the querystring will be formmated this way: `?a=1&a=2&a=2`. However, you can change it to comma separated values `?a=1,2,3` by setting the `query.repeatParams` option to `false`.

~~~js
var client = new rest.Client(url, { query: { repeatParams: false }});
~~~


### Body Case Conversion
Rest-facade provides options for converting the body of the request/response. So, let's say you are consuming an API implemented in Python (using snake_case) and you want it converted to camelCase. You would specify the following options:

~~~js
var client = new rest.Client(url, {
  request: {
    body: {
      convertCase: 'snakeCase'
    }
  },
  response: {
    body: {
      convertCase: 'camelCase'
    }
  }
});
~~~

Once that's done, you can send any request and the body of it will be converted to snake_case. E.g.

~~~js
client.create({ firstName: 'John', lastName: 'Doe' });

// The server will receive
// { first_name: 'John', last_name: 'Doe' }
~~~

The same way, all the responses from the server will converted to the specified case (camelCase in this example).

### Per-Request Customization
Sometimes you need to do some customization to each individual request that is sent to the consumed API,
a likely candidate is for adding request-specific headers.

This can be done in two ways:

- defining a function in global options under `options.request.customizer`
- passing in a options object to a method call that contains a "special" `_requestCustomizer` property (which should be a function as well!)

You can define both, in which case both will be applied (in the order listed above).

In each case the function is passed the `req` and `params` representing the API call in question.

### Proxy support

If a proxy URI is provided, **all** requests will be sent through that proxy.

```js
// Rest client that sends all requests through a proxy server.
var client = new rest.Client(url, {
  proxy: 'https://myproxy.com:1234'
});
```
