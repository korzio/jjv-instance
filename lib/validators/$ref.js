var validate = require('./../validate');
var resolve = require('./../resolve');

module.exports = function $ref(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('$ref')) {/*r-condition*/
		return;
	}

	schemaStack = resolve(env, schemaStack, schema.$ref);
	if (!schemaStack) {
		return { '$ref': schema.$ref };
	}

	var errors = validate(env, schemaStack, objectStack, options);
    if(errors) {
        return errors;
    }
};