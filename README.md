# koa-input
A middleware for koa to validate the input (query, params, body and headers etc.)

# install
```shell
npm install koa-input
```

# example
* quick start
```js
var app = require('koa')();
var input = require('koa-input');
app.use(input('query', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
app.use(function *() {
    this.body = this.request.query.name
});
```

* support query, params([koa-router](https://github.com/alexmingoia/koa-router)), body([koa-bodyparser](https://github.com/koajs/bodyparser)) and headers etc.
```js
var app = require('koa')();
var input = require('koa-input');
app.use(input('query', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
//or
app.use(input('params', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
//or
app.use(input('body', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
//or
app.use(input('headers', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
app.use(function *() {
    this.body = this.request.query.name;
    //or
    this.body = this.request.params.name;
    //or 
    this.body = this.params.name;//You don't need to change existed koa-router code
    //or
    this.body = this.request.body.name;
    //or
    this.body = this.request.headers.name;
});
```

* support custom error handler
```js
input.error = function (source, name) {
    var error = new Error(util.format('Invalid get %s from %s', name, source));
    error.status = 200;
    error.code = 77;
    return error;
};
//...
app.use(...);
```

* support special error (Number(status), String(message), Object(extend by input.error()))
```js
//...
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, 'invalid query name'));
//...
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, 400));
//...
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, {status: 400, message: 'invalid query name'}));
//...
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, new Error('invalid query name')));
```

* support default value as an optional input
```js
app.use(input('query', 'type', /^(cat|dog)$/, 'defaultValue'));
```
* support Regex, Function, Object, Array, Basic-Type pattern to validate the input
```js
//Function(you can use any other module like validator)
app.use(input('query', 'age', function (value) {
    return value >= 18;
}));
//Object(it will get the value if match the key)
app.use(input('query', 'status', {'normal': 0, 'invalid': 1}));
//Array(it must be element of the array)
app.use(input('query', 'type', ['cat', 'dog']));
//String(it must be equal to)
app.use(input('query', 'type', 'cat'));
```
* support multiple patterns
```js
app.use(input('query', 'type', ['cat', 'dog']));
app.use(input('query', 'type', {cat: 1, dog: 2}));
app.use(input('query', 'type', function (value) {
    return value === 'cat';
}));
```
* support builder
```js
//if you want to ignore some middle-arguments:
app.use(input('query', 'name', undefined, undefined, 'invalid input'));
//see also, it may be easer to read
app.use(input.source('query').name('name').error('invalid input').build());
```
