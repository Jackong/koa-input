/**
 * Created by daisy on 15/7/18.
 */
var util = require('util');

var Input = module.exports = function (source, name, pattern, defaultValue, error) {
    return function *(next) {
        if (!(source in this.request)) {
            Input.throw(this, source, name, error);
        }
        if (!(name in this.request[source])) {
            if (!defaultValue) {
                Input.throw(this, source, name, error);
            }
            this.request[source][name] = defaultValue;
            return yield next;
        }
        var value = Input.validate(this.request[source][name], pattern);
        if (typeof value === 'undefined') {
            Input.throw(this, source, name, error);
        }
        this.request[source][name] = value;
        return yield next;
    };
};

Input.throw = function (ctx, source, name, error) {
    if (!error) {
        error = new Error(util.format('Invalid input %s from %s', name, source))
    }
    error.status = 400;
    ctx.throw(error.message, error.status, error);
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

Input.validate = function (value, pattern) {
    if (!pattern) {
        return value;
    }
    if (!pattern.exec(value)) {
        return undefined;
    }
    return value;
};