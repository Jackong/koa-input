/**
 * Created by daisy on 15/7/18.
 */
var co = require('co');
var expect = require('chai').expect;
var request = require('supertest-koa-agent');
var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var input = require('../lib/input');
var util = require('util');

describe('input name not found', function () {
    describe('with default value', function () {
        var app = koa();
        app.use(input('query', 'name', undefined, 'default'));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should get the default value', function (done) {
            request(app)
                .get('/')
                .expect('default')
                .end(done);
        });
    });

    describe('without default value', function () {
        var app = koa();
        app.use(input('query', 'name', /^[a-zA-Z]+$/));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should response error when input not found', function (done) {
            request(app)
                .get('/')
                .expect(400, 'Invalid input name from query')
                .end(done);
        });
    });
});

describe('input invalid value', function () {
    describe('with default value', function () {
        var app = koa();
        app.use(input('query', 'name', /^[a-zA-Z]+$/, 'default'));
        app.use(function *() {
            this.body = this.request.query.name
        });

        it('should get the default value', function (done) {
            request(app)
                .get('/')
                .query({name: 111})
                .expect('default')
                .end(done);
        })
    });

    describe('without default value', function () {
        var app = koa();
        app.use(input('query', 'name', /^[a-zA-Z]+$/));
        app.use(function *() {
            this.body = this.request.query.name
        });

        it('should response error', function (done) {
            request(app)
                .get('/')
                .query({name: 111})
                .expect(400, 'Invalid input name from query')
                .end(done);
        });
    });
});

describe('input with custom error handler', function () {
    var defaultError = input.error;
    before(function () {
        input.error = function (source, name) {
            var error = new Error(util.format('Invalid get %s from %s', name, source));
            error.status = 200;
            error.code = 77;
            return error;
        };
    });

    after(function () {
        input.error = defaultError;
    });

    var app = koa();
    app.use(input('query', 'name', /^[a-zA-Z]+$/));
    app.use(function *() {
        this.body = this.request.query.name
    });

    it('should response custom error', function (done) {
        request(app)
            .get('/')
            .expect(200, 'Invalid get name from query')
            .end(done);
    });
});

describe('input with special error', function () {
    describe('type of string', function () {
        var app = koa();
        app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined));
        app.use(function *() {
            this.body = this.request.query.name
        });
    });

    describe('type of number', function () {

    });

    describe('type of object', function () {

    });
});

describe('input valid value', function () {

});

describe('input without pattern', function () {

});

describe('input with regex pattern', function () {

});

describe('input with function pattern', function () {

});

describe('input with object pattern', function () {

});

describe('input with array pattern', function () {

});

describe('input with instance pattern', function () {

});

describe('input with multiple patterns', function () {

});

describe('input with promise pattern', function () {

});