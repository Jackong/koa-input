/**
 * Created by daisy on 15/7/18.
 */
var co = require('co');
var expect = require('chai').expect;
var request = require('supertest-koa-agent');
var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var Router = require('koa-router');
var input = require('../lib/input');
var util = require('util');

var onError = function *(next) {
  try{
      yield next;
  } catch (err) {
      this.status = err.status;
      this.body = err.message;
  }
};

describe('input name not found', function () {
    describe('with default value', function () {
        var app = koa();
        app.use(onError);
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
        app.use(onError);
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
        app.use(onError);
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
        app.use(onError);
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
    app.use(onError);
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
        var msg = 'Your name can not empty';
        var app = koa();
        app.use(onError);
        app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, msg));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should response custom msg', function (done) {
            request(app)
                .get('/')
                .expect(400, msg)
                .end(done);
        });
    });

    describe('type of number', function () {
        var status = 200;
        var app = koa();
        app.use(onError);
        app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, status));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should response custom status', function (done) {
            request(app)
                .get('/')
                .expect(status, 'Invalid input name from query')
                .end(done);
        });
    });

    describe('type of object', function () {
        var err = {status: 200, message: 'Your name can not empty'};
        var app = koa();
        app.use(onError);
        app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, err));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should response custom error', function (done) {
            request(app)
                .get('/')
                .expect(err.status, err.message)
                .end(done);
        });
    });

    describe('instance of Error', function () {
        var err = new Error('Your name can not empty');
        err.status = 200;
        var app = koa();
        app.use(onError);
        app.use(input('query', 'name', /^[a-zA-Z]+$/, undefined, err));
        app.use(function *() {
            this.body = this.request.query.name
        });
        it('should response custom error', function (done) {
            request(app)
                .get('/')
                .expect(err.status, err.message)
                .end(done);
        });
    });
});

describe('input without pattern', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'name'));
    app.use(function *() {
        this.body = this.request.query.name
    });
    it('should success when input found', function (done) {
        request(app)
            .get('/')
            .query({name: 'jackong'})
            .expect(200, 'jackong')
            .end(done);
    });

    it('should response error when input not found', function (done) {
        request(app)
            .get('/')
            .expect(400, 'Invalid input name from query')
            .end(done);
    });
});

describe('input with function pattern', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'age', function (value) {
        return value >= 18 ? value : undefined;
    }));

    app.use(function *() {
        this.body = this.request.query.age
    });
    
    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .query({age: 17})
            .expect(400, 'Invalid input age from query')
            .end(done);
    });
    
    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({age: 18})
            .expect(200, '18')
            .end(done);
    });
});

describe('input with object pattern', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'status', {'normal': 0, 'invalid': 1}));

    app.use(function *() {
        this.body = this.request.query.status
    });

    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .query({status: 'unknown'})
            .expect(400, 'Invalid input status from query')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({status: 'normal'})
            .expect(200, '0')
            .end(done);
    });
});

describe('input with array pattern', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'type', ['cat', 'dog']));

    app.use(function *() {
        this.body = this.request.query.type
    });

    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .query({type: 'pig'})
            .expect(400, 'Invalid input type from query')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({type: 'cat'})
            .expect(200, 'cat')
            .end(done);
    });
});

describe('input with basic type pattern', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'type', 'cat'));

    app.use(function *() {
        this.body = this.request.query.type
    });

    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .query({type: 'pig'})
            .expect(400, 'Invalid input type from query')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({type: 'cat'})
            .expect(200, 'cat')
            .end(done);
    });
});

describe('input with multiple patterns', function () {
    var app = koa();
    app.use(onError);
    app.use(input('query', 'type', ['cat', 'dog']));
    app.use(input('query', 'type', {cat: 1, dog: 2}));
    app.use(input('query', 'type', function (value) {
        return value;
    }));

    app.use(function *() {
        this.body = this.request.query.type
    });

    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .query({type: 'pig'})
            .expect(400, 'Invalid input type from query')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({type: 'cat'})
            .expect(200, '1')
            .end(done);
    });
});

describe('input for body', function () {
    var app = koa();
    app.use(onError);
    app.use(bodyParser());
    app.use(input('body', 'age', /^[1-9]$/));

    app.use(function *() {
        this.body = this.request.body.age
    });

    it('should response error if un-match', function (done) {
        request(app)
            .post('/')
            .send({age: 0})
            .expect(400, 'Invalid input age from body')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .post('/')
            .send({age: 1})
            .expect(200, '1')
            .end(done);
    });
});

describe('input for headers', function () {
    var app = koa();
    app.use(onError);
    app.use(input('headers', 'version', /^[1-9]$/));

    app.use(function *() {
        this.body = this.request.headers.version
    });

    it('should response error if un-match', function (done) {
        request(app)
            .get('/')
            .set('version', 0)
            .expect(400, 'Invalid input version from headers')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .set('version', 1)
            .expect(200, '1')
            .end(done);
    });
});

describe('input for params', function () {
    var app = koa();
    var router = Router();

    router.get('/users/:id', input('params', 'id', function (value) {
        return value > 0;
    }), function *(next) {
        expect(this.params.id).to.be.equal(this.request.params.id);
        expect(this.params).to.be.equal(this.request.params);
        this.body = this.params.id
    });

    app.use(onError);
    app.use(router.routes());

    it('should response error if un-match', function (done) {
        request(app)
            .get('/users/0')
            .expect(400, 'Invalid input id from params')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/users/1')
            .expect(200, '1')
            .end(done);
    });
});

describe('input using builder', function () {
    var app = koa();
    app.use(onError);
    app.use(input.source('query').name('type').pattern(/^(cat|dog)$/).default('pig').build());
    app.use(function *() {
        this.body = this.request.query.type
    });

    it('should response success using default', function (done) {
        request(app)
            .get('/')
            .expect(200, 'pig')
            .end(done);
    });

    it('should response success if match', function (done) {
        request(app)
            .get('/')
            .query({type: 'cat'})
            .expect(200, 'cat')
            .end(done);
    });
});