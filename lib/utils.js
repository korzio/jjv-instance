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
    var newStack = [clone(stack[0])], key = newStack[0].key, obj = newStack[0].object;
    for (var i = 1, len = stack.length; i < len; i++) {
        obj = obj[key];
        key = stack[i].key;
        newStack.push({ object: obj, key: key });
    }
    return newStack;
};

var copyStack = function (newStack, oldStack) {
    var stackLast = newStack.length - 1, key = newStack[stackLast].key;
    oldStack[stackLast].object[key] = newStack[stackLast].object[key];
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
			return frame.key;
	} else
		frame = objectStack[0];

	object = frame.object[frame.key];

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

module.exports = {
    clone: clone,
    cloneStack: cloneStack,
    copyStack: copyStack,
    normalizeID: normalizeID,
    resolveObjectRef: resolveObjectRef
};