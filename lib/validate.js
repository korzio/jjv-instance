module.exports = function(env, schemaStack, objectStack, options) {
	function validate(validatorName){
		var error = require('./validators/' + validatorName)(env, schemaStack, objectStack, options);
		return error || null;
	}

	for(var i = 0, arr = [
		'type',
        'dependencies',
        'required',
		'properties',
		'items',
		'additionalItems',
		'property',

		'$ref',
		'allOf',
		'oneOf',
		'anyOf',
		'not'
	], len = arr.length; i < len; i++) {
		var error = validate(arr[i]);
		if(error) {
			return error;
		}
	}
};