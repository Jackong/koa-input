/**
 * Created by daisy on 15/7/18.
 */
var util = require('util');
var _ = require('underscore');

var Input = module.exports = function (source, name, pattern, defaultValue, error) {
    return function *(next) {
        if (!(source in this.request)) {
            this.throw(Input.getError(source, name, error));
        }
        if (!(name in this.request[source])) {
            if (_.isUndefined(defaultValue)) {
                this.throw(Input.getError(source, name, error));
            }
            this.request[source][name] = defaultValue;
            return yield next;
        }
        var value = Input.validate(this.request[source][name], pattern);
        if (_.isUndefined(value)) {
            if (_.isUndefined(defaultValue)) {
                this.throw(Input.getError(source, name, error));
            }
            value = defaultValue;
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

Input.query = function (name, pattern, defaultValue, error) {
    return Input('query', name, pattern, defaultValue, error);
};

Input.param = function (name, pattern, defaultValue, error) {
    return Input('param', name, pattern, defaultValue, error);
};

Input.body = function (name, pattern, defaultValue, error) {
    return Input('body', name, pattern, defaultValue, error);
};

Input.header = function (name, pattern, defaultValue, error) {
    return Input('header', name, pattern, defaultValue, error);
};

Input.validate = function (value, pattern) {
    if (_.isUndefined(pattern)) {
        return value;
    }
    if (_.isRegExp(pattern)) {
        return _.isNull(pattern.exec(value)) ? undefined : value;
    }
    if (_.isFunction(pattern)) {
        return pattern(value);
    }

    return undefined;
};