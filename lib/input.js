/**
 * Created by daisy on 15/7/18.
 */
var util = require('util');
var _ = require('underscore');

var Input = module.exports = function (source, name, pattern, defaultValue, error) {
    return function *(next) {
        if (!(source in this.request)) {
            if (!(source in this)) {
                this.throw(Input.getError(source, name, error));
            }
            this.request[source] = this[source];
        }
        if (!(name in this.request[source])) {
            if (_.isUndefined(defaultValue)) {
                this.throw(Input.getError(source, name, error));
            }
            this.request[source][name] = Input.getDefault(defaultValue);
            return yield next;
        }
        var value = Input.validate(this.request[source][name], pattern);
        if (_.isUndefined(value)) {
            if (_.isUndefined(defaultValue)) {
                this.throw(Input.getError(source, name, error));
            }
            value = Input.getDefault(defaultValue);
        }
        this.request[source][name] = value;
        return yield next;
    };
};

Input.error = function (source, name) {
    var error = new Error(util.format('Invalid input %s from %s', name, source));
    error.status = 400;
    return error;
};

Input.getError = function (source, name, error) {
    var err = error;
    if (!_.isError(error)) {
        err = Input.error(source, name);
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

Input.getDefault = function (defaultValue) {
    if (_.isFunction(defaultValue)) {
        return defaultValue();
    }
    return defaultValue;
};

Input.validate = function (value, pattern) {
    if (_.isUndefined(pattern)) {
        return value;
    }
    if (_.isRegExp(pattern)) {
        return _.isNull(pattern.exec(value)) ? undefined : value;
    }
    if (_.isFunction(pattern)) {
        return pattern(value) ? value : undefined;
    }

    if (_.isArray(pattern)) {
        return _.indexOf(pattern, value) > -1 ? value : undefined;
    }

    if (_.isObject(pattern)) {
        return pattern[value];
    }
    return pattern === value ? value : undefined;
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