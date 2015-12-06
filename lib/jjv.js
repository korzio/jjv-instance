/* jshint proto: true */

/**
 * jjv.js -- A javascript library to validate json input through a json-schema.
 *
 * Copyright (c) 2013 Alex Cornejo.
 *
 * Redistributable under a MIT-style open source license.
 */

var utils = require('./utils');
var validators = require('./validators');
var schema = require('./schema');

(function () {
    var defaultOptions = {
        useDefault: false,
        useCoerce: false,
        checkRequired: true,
        removeAdditional: false
    };

    function Environment() {
        if (!(this instanceof Environment))
            return new Environment();

        this.coerceType = {};
        this.fieldType = utils.clone(validators.fieldType);
        this.fieldValidate = utils.clone(validators.fieldValidate);
        this.fieldFormat = utils.clone(validators.fieldFormat);
        this.defaultOptions = utils.clone(defaultOptions);
        this.schema = {};
    }

    Environment.prototype = {
        // @deprecated
        checkValidity: schema.checkValidity,
        validate: function (name, object, options) {
            var schemaStack = [name],
                errors = null,
                objectStack = [{ object: { '__root__': object }, key: '__root__' }];

            if (typeof name === 'string') {
                schemaStack = this.resolveRef(null, name);
                if (!schemaStack)
                    throw new Error('jjv: could not find schema \'' + name + '\'.');
            }

            if (!options) {
                options = this.defaultOptions;
            } else {
                for (var p in this.defaultOptions)
                    if (this.defaultOptions.hasOwnProperty(p) && !options.hasOwnProperty(p))
                        options[p] = this.defaultOptions[p];
            }

            errors = schema.checkValidity(this, schemaStack, objectStack, options);

            if (errors)
                return { validation: errors.hasOwnProperty('schema') ? errors.schema : errors };
            else
                return null;
        },

        // -> resolve
        resolveRef: function (schemaStack, $ref) {
            return schema.resolveURI(this, schemaStack, $ref);
        },

        addType: function (name, func) {
            this.fieldType[name] = func;
        },

        addTypeCoercion: function (type, func) {
            this.coerceType[type] = func;
        },

        addCheck: function (name, func) {
            this.fieldValidate[name] = func;
        },

        addFormat: function (name, func) {
            this.fieldFormat[name] = func;
        },

        addSchema: function (name, schema) {
            if (!schema && name) {
                schema = name;
                name = undefined;
            }
            if (schema.hasOwnProperty('id') && typeof schema.id === 'string' && schema.id !== name) {
                if (schema.id.charAt(0) === '/')
                    throw new Error('jjv: schema id\'s starting with / are invalid.');
                this.schema[utils.normalizeID(schema.id)] = schema;
            } else if (!name) {
                throw new Error('jjv: schema needs either a name or id attribute.');
            }
            if (name)
                this.schema[utils.normalizeID(name)] = schema;
        }
    };

    // Export for use in server and client.
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = Environment;
    else if (typeof define === 'function' && define.amd)
        define(function () { return Environment; });
    else
        this.jjv = Environment;
}).call(this);
