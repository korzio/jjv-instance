var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function not(env, schemaStack, objectStack, options) {
    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('not')) {/*r-condition*/
        var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
            newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
            errors = validate(env, schemaStack.concat(schema.not), newStack, options);

        if (!errors) {
            return { 'not': true };
        }
    }
};