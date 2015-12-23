var utils = require('./utils');
var validators = require('./validators');
var keywords = require('./keywords');
var resolve = require('./resolve');

module.exports = function validate(env, schemaStack, objectStack, options) {
    var args = [[schemaStack, objectStack, {}]], valid;

    global: while (args.length) {
        schemaStack = args[args.length - 1][0];
        objectStack = args[args.length - 1][1];
        valid = args[args.length - 1][2];

        /** $ref **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!valid.$ref && !(!schema.hasOwnProperty('$ref'))) {

            var newSchemaStack = resolve(env, schemaStack, schema.$ref);
            if (!newSchemaStack) {
                return { '$ref': schema.$ref };
            }

            valid.$ref = true;
            args.push([newSchemaStack, objectStack, {}]);

            continue;
        }
        /** type **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!(!schema.hasOwnProperty('type'))) {

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
                        args.pop();
                        continue global;
                    }
                }

                return { 'type': schema.type };
            }
        }
        /** allOf **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!valid.allOf && !(!schema.hasOwnProperty('allOf'))) {
            valid.allOf = true;
            for (var i = 0, len = schema.allOf.length; i < len; i++) {
                args.push([schemaStack.concat(schema.allOf[i]), objectStack, {}]);
            }
            continue;
        }
        /** oneOf **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!(!schema.hasOwnProperty('oneOf'))) {

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
        /** anyOf **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!(!schema.hasOwnProperty('anyOf'))) {

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
        /** not **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!(!schema.hasOwnProperty('not'))) {

            var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
                newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
                errors = validate(env, schemaStack.concat(schema.not), newStack, options);

            if (!errors) {
                return { 'not': true };
            }
        }
        /** dependencies **/

        var schema = schemaStack[schemaStack.length - 1];
        if (!valid.dependencies && !(!schema.hasOwnProperty('dependencies'))) {

            valid.dependencies = true;
            var prop = objectStack[objectStack.length - 1],
                toContinue;

            for (var p in schema.dependencies) {
                if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
                    if (Array.isArray(schema.dependencies[p])) {
                        for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
                            if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
                                return { 'dependencies': true };
                            }
                    } else {
                        toContinue = true;
                        args.push([schemaStack.concat(schema.dependencies[p]), objectStack, {}]);
                    }
                }
            }

            if(toContinue) {
                continue;
            }
        }
        /** required **/

        var schema = schemaStack[schemaStack.length - 1],
            prop = objectStack[objectStack.length - 1];

        if (!(!options.checkRequired || !schema.required || Array.isArray(prop))) {

            for (var i = 0, len = schema.required.length; i < len; i++) {
                if (!prop.hasOwnProperty(schema.required[i])) {
                    var errors = {};
                    errors[schema.required[i]] = { 'required': true };
                    return errors;
                }
            }
        }
        /** properties **/

        var prop = objectStack[objectStack.length - 1],
            schema = schemaStack[schemaStack.length - 1],
            hasProp = schema.hasOwnProperty('properties'),
            hasPattern = schema.hasOwnProperty('patternProperties');

        if (!(!prop || Array.isArray(prop))) {

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
                    } else if(!valid.additionalProperties){
                        for (i = 0, len = props.length; i < len; i++) {
                            args.push([schemaStack.concat(schema.additionalProperties), objectStack.concat([prop[props[i]]]), {}]);
                        }

                        valid.additionalProperties = true;
                        continue;
                    }
                }
            }
        }
        /** items **/

        var schema = schemaStack[schemaStack.length - 1],
            prop = objectStack[objectStack.length - 1],
            errors, i, len;

        if (!valid.items && !(!Array.isArray(prop) || !schema.hasOwnProperty('items'))) {
            valid.items = true;

            if (Array.isArray(schema.items)) {
                for (i = 0, len = schema.items.length; i < len; i++) {
                    args.push([schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), {}]);
                }

                if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
                    if (typeof schema.additionalItems === 'boolean') {
                        if (!schema.additionalItems) {
                            return { 'additionalItems': true };
                        }
                    } else {
                        args.push([schemaStack.concat(schema.additionalItems), objectStack.concat(prop), {}]);
                    }
                }
            } else {
                args.push([schemaStack.concat(schema.items), objectStack.concat(prop), {}])
            }

            continue;
        }
        /** additionalItems **/

        var schema = schemaStack[schemaStack.length - 1],
            prop = objectStack[objectStack.length - 1];

        if (!valid.additionalItems && !(!schema.additionalItems || Array.isArray(prop) || typeof schema.additionalItems === 'boolean')) {
            valid.additionalItems = true;
            args.push([schemaStack.concat(schema.additionalItems), objectStack.concat(prop), {}]);
            continue;
        }
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

        /** finish **/
        args.pop();
    }
}