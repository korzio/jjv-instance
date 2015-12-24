var validate = require('./../validate');
var resolve = require('./../resolve');

module.exports = function $ref(env, schemaStack, objectStack, options) {
    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('$ref')) {/*r-condition*/
        var newSchemaStack = resolve(env, schemaStack, schema.$ref);
        if (!newSchemaStack) {
            return { '$ref': schema.$ref };
        }

        var errors = validate(env, newSchemaStack, objectStack, options);
        if (errors) {
            return errors;
        }
    }
};