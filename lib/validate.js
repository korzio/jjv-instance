module.exports = function(env, schemaStack, objectStack, options) {
	for(var i = 0, arr = [
		'required',
        'property',
        'type',

        '$ref',
        'not',
        'anyOf',
        'oneOf',
        'allOf',
        'dependencies',

        'properties',
        'items',
        'additionalItems'
	], len = arr.length; i < len; i++) {
		var error = require('./validators/' + arr[i])(env, schemaStack, objectStack, options);
		if(error) {
			return error;
		}
	}
};