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
    this.body = this.params.name;//no need to change existed koa-router code
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
* support Regex, Function, Object, Array, Basic-Type pattern to validate the input
* support multiple patterns
```js
app.use(input('query', 'type', ['cat', 'dog']));
app.use(input('query', 'type', {cat: true, dog: false}));
app.use(input('query', 'type', function (value) {
    return value ? 1 : 0;
}));
```
* support builder
