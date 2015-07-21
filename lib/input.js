/**
 * Created by daisy on 15/7/18.
 */
var util = require('util');
var _ = require('underscore');
var NoInput = require('no-input');

var Input = module.exports = function (source, name, pattern, defaultValue, error) {
    return function *(next) {
        if (!(source in this.request)) {
            if (source in this) {
                this.request[source] = this[source];
            }
        }
        try {
            var value = NoInput(this.request[source], name, pattern, defaultValue, Input.getError(name, error));
        } catch(e) {
            this.throw(e);
        }
        this.request[source][name] = value;
        yield next;
    };
};

Input.onError = NoInput.onError;
Input.InvalidInputError = NoInput.InvalidInputError;

Input.error = function (name) {
    var error = new NoInput.InvalidInputError(util.format('Invalid input %s', name));
    error.status = 400;
    return error;
};

Input.onError(Input.error);

Input.getError = function (name, error) {
    if (_.isUndefined(error)) {
        return error;
    }
    var err = error;
    if (!_.isError(error)) {
        err = new Input.error(name);
    }
    switch (typeof error) {
        case 'string':
            err.message = error;
            break;
        case 'number':
            err.status = error;
            break;
        case 'object':
            err = _.extend(err, error);
            break;
    }
    return err;
};

Input.query = function (name, pattern, defaultValue, error) {
    return Input('query', name, pattern, defaultValue, error);
};

Input.params = function (name, pattern, defaultValue, error) {
    return Input('params', name, pattern, defaultValue, error);
};

Input.body = function (name, pattern, defaultValue, error) {
    return Input('body', name, pattern, defaultValue, error);
};

Input.headers = function (name, pattern, defaultValue, error) {
    return Input('headers', name, pattern, defaultValue, error);
};

var Builder = Input.Builder = function () {
};

Builder.prototype.source = function (source) {
    this._source = source;
};

Builder.prototype.name = function (name) {
    this._name = name;
    return this;
};

Builder.prototype.pattern = function (pattern) {
    this._pattern = pattern;
    return this;
};

Builder.prototype.default = function (defaultValue) {
    this._default = defaultValue;
    return this;
};

Builder.prototype.error = function (error) {
    this._error = error;
    return this;
};

Builder.prototype.build = function () {
    return Input(this._source, this._name, this._pattern, this._default, this._error);
};

Input.source = function (source) {
    var builder = new Builder();
    builder.source(source);
    return builder;
};