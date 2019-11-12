Array.prototype.indexOf = function (searchElement, fromIndex) {
    var k;
    if (this == null) {
        throw new TypeError('"this" is null or not defined');
    }
    var o = Object(this);
    var len = o.length >>> 0;
    if (len === 0) {
        return -1;
    }
    var n = fromIndex | 0;
    if (n >= len) {
        return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
        if (k in o && o[k] === searchElement) {
            return k;
        }
        k++;
    }
    return -1;
};

Array.prototype.map = function (callback) {
    var T, A, k;
    if (this == null) {
        throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
        T = arguments[1];
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
        }
        k++;
    }
    return A;
};

function reduce(callback, initialVal, arr) {
    var newArr = [].concat(arr);
    var accumulator = (initialVal === undefined) ? undefined : initialVal;
    for (var i = 0; i < newArr.length; i++) {
        if (accumulator !== undefined) accumulator = callback.call(undefined, accumulator, newArr[i], i, newArr);
        else accumulator = newArr[i];
    }
    return accumulator;
};

Array.prototype.fill = function (value) {
    if (this == null) {
        throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    var start = arguments[1];
    var relativeStart = start >> 0;
    var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
    var end = arguments[2];
    var relativeEnd = end === undefined ? len : end >> 0;
    var last = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
    while (k < last) {
        O[k] = value;
        k++;
    }
    return O;
}

function closest(arr, target) {
    if (!(arr) || arr.length == 0) return null;
    if (arr.length == 1) return arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > target) {
            var p = arr[i - 1];
            var c = arr[i];
            return Math.abs(p - target) < Math.abs(c - target) ? p : c;
        }
    }
    return arr[arr.length - 1];
}
