module.exports = function(env, schemaStack, objectStack, options) {
	function validate(validatorName){
		var error = require('./validators/' + validatorName)(env, schemaStack, objectStack, options);
		return error || null;
	}

	for(var i = 0, arr = [
		'$ref',
		'type',
		'allOf',
		'oneOf',
		'anyOf',
		'not',
		'dependencies',
		'required',
		'properties',
		'items',
		'additionalItems'
	], len = arr.length; i < len; i++) {
		var error = validate(arr[i]);
		if(error) {
			return error;
		}
	}

	return validate('property');
};