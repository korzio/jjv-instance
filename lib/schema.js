var keywords = require('./keywords.json');
var utils = require('./utils');

var checkValidity = function (env, schemaStack, objectStack, options) {
	function validate(validatorName){
		var error = require('./validators/' + validatorName)(env, schemaStack, objectStack, options);
		return error;
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
		'additionalItems',
		'property'
	], len = arr.length; i < len; i++) {
		var error = validate(arr[i]);
		if(error) {
			return error;
		}
	}

	return null;
};

module.exports = {
	resolveURI: require('./resolve'),
	checkValidity: checkValidity
};