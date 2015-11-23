'use strict';

exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get: function () {
            var object = this;
            var result = getMethods(object);
            Object.defineProperty(result, 'not', {
                get: function () {
                    return Object.keys(result).reduce(function (state, key) {
                        state[key] = function () {
                            return !result[key].apply(object, arguments);
                        };
                        return result;
                    }, {});
                }
            });
            return result;
        }
    });
};

exports.wrap = function (object) {
    if (object === null) {
        return {
            getValue: function () {
                return null;
            },
            isNull: function () {
                return true;
            }
        };
    }
    Object.setPrototypeOf(object, {
        isNull: function () {
            return false;
        }
    });
    return object;
};

function getMethods(object) {
    var type = Array.isArray(object) ? 'array' : typeof object;
    var result = {};
    switch (type) {
        case 'array' :
            result.hasLength = callFunction(hasLength).bind(object);
        case 'object' :
            result.containsKeys = callFunction(containsKeys).bind(object);
            result.hasKeys = callFunction(hasKeys).bind(object);
            result.containsValues = callFunction(containsValues).bind(object);
            result.hasValues = callFunction(hasValues).bind(object);
            result.hasValueType = callFunction(hasValueType).bind(object);
            return result;
        case 'string' :
            result.hasLength = callFunction(hasLength).bind(object);
            result.hasWordsCount = callFunction(hasWordsCount).bind(object);
            return result;
        case 'function' :
            result.hasParamsCount = callFunction(hasParamsCount).bind(object);
            return result;
    }
}

function callFunction(func) {
    return function () {
        return func.apply(this, arguments);
    };
}

function containsKeys(keys) {
    return keys.every(function (key) {
        return this.hasOwnProperty(key);
    }, this);
}

function hasKeys(keys) {
    if (this.check.containsKeys(keys)) {
        return keys.check.hasValues(Object.keys(this));
    }
}

function containsValues(values) {
    return values.every(function (value) {
        return Object.keys(this).some(function (key) {
            return value === this[key];
        }, this);
    }, this);
}

function hasValues(values) {
    if (this.check.containsValues(values)) {
        var containsValues = Object.keys(this).map(function (key) {
            return this[key];
        }, this);
        return values.check.containsValues(containsValues);
    }
}

function hasValueType(key, type) {
    if (!this.hasOwnProperty(key)) {
        return false;
    }
    return Object.getPrototypeOf(this[key]) === Object.getPrototypeOf(type());
}

function hasLength(length) {
    return this.length === length;
}

function hasParamsCount(count) {
    return this.length === count;
}

function hasWordsCount(count) {
    var words = this.split(' ').filter(function (word) {
        return word.length > 0;
    });
    return count === words.length;
}
