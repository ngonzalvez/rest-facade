# rest-orm
Node.js module that abstracts the process of consuming a REST endpoint.


## Create a new endpoint client

```
var rest = require('rest-orm');
var Users = new rest.Client('http://domain.com/users/:id');
```


## Get all instances from the API

```
Users
  .getAll()
  .then(function (users) {
    console.log(users.length, 'users retrieved');
  });
```


## Create a new instance and save it to the API

```
var user = Users.create({ firstName: 'John', lastName: 'Doe' });

user
  .save
  .then(function (user) {
    console.log('User created');
  });
```


## Delete an instance from the API by ID

```
Users
  .delete({ id: 1 })
  .then(function () {
    console.log('User deleted');
  });
```


## Update an instance.

```
Users
  .update(userId, data)
  .then(function () {
    console.log('User updated');
  });
```
