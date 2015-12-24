var utils = require('./utils');
var validators = require('./validators');
var keywords = require('./keywords');
var resolve = require('./resolve');

module.exports = function transform(env, schemaStack, objectStack, options){
    var object = { keys: '' };

    return validate(env, schemaStack[0], objectStack[0]);
}

function validate(env, schema, object) {
    if (schema.required ^ object.keys) {
        return -1;
    }

    return;

    /** property **/

    var prop = objectStack[objectStack.length - 1],
        schema = schemaStack[schemaStack.length - 1],
        errors = {};

    for (var v in schema) {
        if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
            if (v === 'format') {
                if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
                    errors[v] = true;
                    return errors;
                }
            } else {
                var useSchemaStack = schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v];

                if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, useSchemaStack, schema, objectStack, options)) {
                    errors[v] = true;
                    return errors;
                }
            }
        }
    }

    /** type **/

    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('type')) {/*r-condition*/
        var prop = objectStack[objectStack.length - 1];
        if (typeof schema.type === 'string') {
            if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type)) {
                prop = env.coerceType[schema.type](prop);
            }
            if (!env.fieldType[schema.type](prop)) {
                return { 'type': schema.type };
            }
        } else if (Array.isArray(schema.type)) {
            for (var i = 0, len = schema.type.length; i < len; i++) {
                if (env.fieldType[schema.type[i]](prop)) {
                    return;/*r-continue*/
                }
            }

            return { 'type': schema.type };
        }
    }

    /** $ref **/

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

    /** not **/

    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('not')) {/*r-condition*/
        var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
            newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
            errors = validate(env, schemaStack.concat(schema.not), newStack, options);

        if (!errors) {
            return { 'not': true };
        }
    }

    /** anyOf **/

    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('anyOf')) {/*r-condition*/
        var errors,
            newStack = objectStack,
            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

        for (var i = 0, len = schema.anyOf.length; i < len; i++) {
            if (customTypesUsage) {
                newStack = utils.clone(objectStack);
            }

            errors = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
            if (!errors) {
                break;
            }
        }

        if (errors) {
            return errors;
        }
    }

    /** oneOf **/

    var schema = schemaStack[schemaStack.length - 1];
    if (schema.hasOwnProperty('oneOf')) {/*r-condition*/
        var errors,
            newStack = objectStack,
            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

        for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
            if (customTypesUsage) {
                newStack = utils.clone(objectStack);
            }

            errors = validate(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
            if (!errors) {
                if (++count > 1) {
                    break;
                } else if (customTypesUsage) {
                    utils.copyStack(newStack, objectStack);
                }
            }
        }

        if (count > 1) {
            return { 'oneOf': true };
        } else if (count < 1) {
            return errors;
        }
    }

    /** allOf **/

    var schema = schemaStack[schemaStack.length - 1];

    if (schema.hasOwnProperty('allOf')) {/*r-condition*/
        for (var i = 0, len = schema.allOf.length; i < len; i++) {
            var errors = validate(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
            if (errors) {
                return errors;
            }
        }
    }

    /** dependencies **/

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

    /** properties **/

    var prop = objectStack[objectStack.length - 1],
        schema = schemaStack[schemaStack.length - 1],
        hasProp = schema.hasOwnProperty('properties'),
        hasPattern = schema.hasOwnProperty('patternProperties');

    if (prop && !Array.isArray(prop)) {/*r-condition*/
        var props = Object.keys(prop),
            errors = {}, objerr, matched, i, len, p;

        if (hasProp || hasPattern) {
            i = props.length;
            while (i--) {
                matched = false;
                if (hasProp && schema.properties.hasOwnProperty(props[i])) {
                    matched = true;
                    objerr = validate(env, schemaStack.concat(schema.properties[props[i]]), objectStack.concat([prop[props[i]]]), options);
                    if (objerr) {
                        errors[props[i]] = objerr;
                        return errors;
                    }
                }
                if (hasPattern) {
                    for (p in schema.patternProperties)
                        if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
                            matched = true;
                            objerr = validate(env, schemaStack.concat(schema.patternProperties[p]), objectStack.concat([prop[props[i]]]), options);
                            if (objerr) {
                                errors[props[i]] = objerr;
                                return errors;
                            }
                        }
                }
                if (matched)
                    props.splice(i, 1);
            }
        }

        if (options.useDefault && hasProp) {
            for (p in schema.properties)
                if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
                    prop[p] = utils.clone(schema.properties[p]['default']);
        }

        if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
            for (i = 0, len = props.length; i < len; i++)
                delete prop[props[i]];
        } else {
            if (schema.hasOwnProperty('additionalProperties')) {
                if (typeof schema.additionalProperties === 'boolean') {
                    if (!schema.additionalProperties) {
                        for (i = 0, len = props.length; i < len; i++) {
                            errors[props[i]] = { 'additional': true };
                            return errors;
                        }
                    }
                } else {
                    for (i = 0, len = props.length; i < len; i++) {
                        objerr = validate(env, schemaStack.concat(schema.additionalProperties), objectStack.concat([prop[props[i]]]), options);
                        if (objerr) {
                            errors[props[i]] = objerr;
                            return errors;
                        }
                    }
                }
            }
        }
    }

    /** items **/

    var schema = schemaStack[schemaStack.length - 1],
        prop = objectStack[objectStack.length - 1],
        errors, i, len;

    if (Array.isArray(prop) && schema.hasOwnProperty('items')) {/*r-condition*/
        if (Array.isArray(schema.items)) {
            for (i = 0, len = schema.items.length; i < len; i++) {
                errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), options);
                if (errors) {
                    return errors;
                }
            }

            if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
                if (typeof schema.additionalItems === 'boolean') {
                    if (!schema.additionalItems) {
                        return { 'additionalItems': true };
                    }
                } else {
                    errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
                    if (errors) {
                        return errors;
                    }
                }
            }
        } else {
            errors = validate(env, schemaStack.concat(schema.items), objectStack.concat(prop), options);
            if (errors) {
                return errors;
            }
        }
    }

    /** additionalItems **/

    var schema = schemaStack[schemaStack.length - 1],
        prop = objectStack[objectStack.length - 1];

    if (schema.additionalItems && Array.isArray(prop) && typeof schema.additionalItems !== 'boolean') {/*r-condition*/
        var errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
        if (errors) {
            return errors;
        }
    }
}