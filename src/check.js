'use strict';

exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get: function () {
            var object = this;
            var result = getMethods(object, false);
            Object.defineProperty(result, 'not', {
                get: function () {
                    return getMethods(object, true);
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
    object.__proto__.isNull = function () {
        return false;
    };
    return object;
};

function getMethods(object, isInverse) {
    var type = Array.isArray(object) ? 'array' : typeof object;
    var result = {};
    switch (type) {
        case 'array' :
            result.hasLength = callFunction(hasLength, isInverse).bind(object);
        case 'object' :
            result.containsKeys = callFunction(containsKeys, isInverse).bind(object);
            result.hasKeys = callFunction(hasKeys, isInverse).bind(object);
            result.containsValues = callFunction(containsValues, isInverse).bind(object);
            result.hasValues = callFunction(hasValues, isInverse).bind(object);
            result.hasValueType = callFunction(hasValueType, isInverse).bind(object);
            return result;
        case 'string' :
            result.hasLength = callFunction(hasLength, isInverse).bind(object);
            result.hasWordsCount = callFunction(hasWordsCount, isInverse).bind(object);
            return result;
        case 'function' :
            result.hasParamsCount = callFunction(hasParamsCount, isInverse).bind(object);
            return result;
    }
}

function callFunction(func, isInverse) {
    return function () {
        return isInverse ? !func.apply(this, arguments) : func.apply(this, arguments);
    };
}

function containsKeys(keys) {
    var object = this;
    return keys.every(function (key) {
        return object.hasOwnProperty(key);
    });
}

function hasKeys(keys) {
    if (this.check.containsKeys(keys)) {
        return keys.check.hasValues(Object.keys(this));
    }
}

function containsValues(values) {
    var object = this;
    return values.every(function (value) {
        return Object.keys(object).some(function (key) {
            return value === object[key];
        });
    });
}

function hasValues(values) {
    var object = this;
    if (this.check.containsValues(values)) {
        return values.check.containsValues(Object.keys(object).map(function (key) {
            return object[key];
        }));
    }
}

function hasValueType(key, type) {
    return this.hasOwnProperty(key) ? typeof this[key] === typeof type() : false;
}

function hasLength(length) {
    return this.length === length;
}

function hasParamsCount(count) {
    return this.length === count;
}

function hasWordsCount(count) {
    return count === this.split(' ').filter(function (word) {
            return word.length > 0;
        }).length;
}
