var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function dependencies(env, schemaStack, objectStack, options) {
    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('dependencies')) {/*r-condition*/
        var prop = objectStack[objectStack.length - 1];
        for (var p in schema.dependencies) {
            if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
                if (Array.isArray(schema.dependencies[p])) {
                    for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
                        if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
                            return { 'dependencies': true };
                        }
                } else {
                    var errors = validate(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
                    if (errors) {
                        return errors;
                    }
                }
            }
        }
    }
};