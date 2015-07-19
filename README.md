# koa-input
============
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/koa-input.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-input
[travis-image]: https://travis-ci.org/Jackong/koa-input.svg?branch=master
[travis-url]: https://travis-ci.org/Jackong/koa-input
[david-image]: https://img.shields.io/david/Jackong/koa-input.svg?style=flat-square
[david-url]: https://david-dm.org/Jackong/koa-input
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.11-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[gittip-image]: https://img.shields.io/gratipay/Jackong.svg
[gittip-url]: https://gratipay.com/~Jackong

### A middleware for koa to validate the input (query, params, body and headers etc.)
Stop to write CIERR(Check-If-Error-Return-Repeatedly) style code, it can be done automatically!

# Install

[![NPM](https://nodei.co/npm/koa-input.png?downloads=true)](https://nodei.co/npm/koa-input/)

# Usage
* Quick start
```js
var app = require('koa')();
var input = require('koa-input');
app.use(input('query', 'name', /^[a-zA-Z]+$/, 'default value', 'Your name is invalid'));
app.use(function *() {
    this.body = this.request.query.name
});
```

* Support query, params([koa-router](https://github.com/alexmingoia/koa-router)), body([koa-bodyparser](https://github.com/koajs/bodyparser)) and headers etc.
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

* Support custom error handler
```js
input.error = function (source, name) {
    var error = new Error(util.format('Invalid get %s from %s', name, source));
    error.status = 200;
    error.code = 77;
    return error;
};
```

* Support special error
```js
//String as error.message
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, 'invalid query name'));
//Number as error.status
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, 400));
//Object will be extended by input.error()
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, {status: 400, message: 'invalid query name'}));
//The same as Object
app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, new Error('invalid query name')));
```

* Support default value as an optional input
```js
app.use(input('query', 'type', /^(cat|dog)$/, 'defaultValue'));
```
* Support Regex, Function, Object, Array, Basic-Type pattern to validate the input
```js
//Function(you can use any other module like validator)
app.use(input('query', 'email', validator.isEmail));
//Object(it will get the value if match the key)
app.use(input('query', 'status', {'normal': 0, 'invalid': 1}));
//Array(it must be element of the array)
app.use(input('query', 'type', ['cat', 'dog']));
//String(it must be equal to)
app.use(input('query', 'type', 'cat'));
```
* Support multiple patterns
```js
app.use(input('query', 'type', ['cat', 'dog']));
app.use(input('query', 'type', {cat: 1, dog: 2}));
app.use(input('query', 'type', function (value) {
    return value === 'cat';
}));
```
* Support builder
```js
//if you want to ignore some middle-arguments:
app.use(input('query', 'name', undefined, undefined, 'invalid input'));
//see also, it may be easer to read
app.use(input.source('query').name('name').error('invalid input').build());
```
## Licences

[MIT](LICENSE)