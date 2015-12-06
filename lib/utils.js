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

var clone_stack = function (stack) {
    var new_stack = [clone(stack[0])], key = new_stack[0].key, obj = new_stack[0].object;
    for (var i = 1, len = stack.length; i < len; i++) {
        obj = obj[key];
        key = stack[i].key;
        new_stack.push({ object: obj, key: key });
    }
    return new_stack;
};

var copy_stack = function (new_stack, old_stack) {
    var stack_last = new_stack.length - 1, key = new_stack[stack_last].key;
    old_stack[stack_last].object[key] = new_stack[stack_last].object[key];
};

var normalizeID = function (id) {
    return id.indexOf("://") === -1 ? id : id.split("#")[0];
};

module.exports = {
    clone: clone,
    clone_stack: clone_stack,
    copy_stack: copy_stack,
    normalizeID: normalizeID
};