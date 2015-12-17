var clone = function (obj) {
    // Handle the 3 simple types (string, number, function), and null or undefined
    if (obj === null || typeof obj !== 'object') return obj;
    var copy;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // handle RegExp
    if (obj instanceof RegExp) {
        copy = new RegExp(obj);
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++)
            copy[i] = clone(obj[i]);
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        var hasOwnProperty = copy.hasOwnProperty;
        //           copy = Object.create(Object.getPrototypeOf(obj));
        for (var attr in obj) {
            if (hasOwnProperty.call(obj, attr))
                copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to clone object!");
};

var cloneStack = function (stack) {
    return clone(stack);
};

var copyStack = function (newStack, oldStack) {
    var stackLast = newStack.length - 1;
    oldStack[stackLast] = newStack[stackLast];
};

var normalizeID = function (id) {
    return id.indexOf("://") === -1 ? id : id.split("#")[0];
};

var resolveObjectRef = function (objectStack, uri) {
    var components,
        object,
        lastFrame = objectStack.length - 1,
        skipFrames,
        frame,
        m = /^(\d+)/.exec(uri);

    if (m) {
        uri = uri.substr(m[0].length);
        skipFrames = parseInt(m[1], 10);
        if (skipFrames < 0 || skipFrames > lastFrame)
            return;
        frame = objectStack[lastFrame - skipFrames];
        if (uri === '#')
            return frame;
    } else
        frame = objectStack[0];

    object = frame;

    if (uri === '')
        return object;

    if (uri.charAt(0) === '/') {
        uri = uri.substr(1);
        components = uri.split('/');
        while (components.length > 0) {
            components[0] = components[0].replace(/~1/g, '/').replace(/~0/g, '~');
            if (!object.hasOwnProperty(components[0]))
                return;
            object = object[components[0]];
            components.shift();
        }
        return object;
    } else
        return;
};

/**
* Creates an array containing the numeric code points of each Unicode
* character in the string. While JavaScript uses UCS-2 internally,
* this function will convert a pair of surrogate halves (each of which
* UCS-2 exposes as separate characters) into a single code point,
* matching UTF-16.
* @see `punycode.ucs2.encode`
* @see <https://mathiasbynens.be/notes/javascript-encoding>
* @memberOf punycode.ucs2
* @name decode
* @param {String} string The Unicode input string (UCS-2).
* @returns {Array} The new array of code points.
*/
function ucs2decodeLength(string) {
    var output = [],
        counter = 0,
        length = string.length,
        value,
        extra;

    while (counter < length) {
        value = string.charCodeAt(counter++);
        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // high surrogate, and there is a next character
            extra = string.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
                // unmatched surrogate; only append this code unit, in case the next
                // code unit is the high surrogate of a surrogate pair
                output.push(value);
                counter--;
            }
        } else {
            output.push(value);
        }
    }

    return output.length;
}

module.exports = {
    clone: clone,
    cloneStack: cloneStack,
    copyStack: copyStack,
    normalizeID: normalizeID,
    resolveObjectRef: resolveObjectRef,
    ucs2decodeLength: ucs2decodeLength
};