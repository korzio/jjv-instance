var utils = require('./utils');

var fieldType = {
    'null': '%s !== null',
    'string': 'typeof %s !== "string"',
    'boolean': 'typeof %s !== "boolean"',
    'number': 'typeof %s !== "number" || %s !== %s',
    'integer': 'typeof %s !== "number" || %s % 1 !== 0',
    'object': '!%s || typeof %s !== "object" || Array.isArray(%s)',
    'array': '!Array.isArray(%s)',
    'date': '!(%s instanceof Date)'
};

var fieldFormat = {
    'alpha': '!/^[a-zA-Z]+$/.test(%s)',
    'alphanumeric': '!/^[a-zA-Z0-9]+$/.test(%s)',
    'identifier': '!/^[-_a-zA-Z0-9]+$/.test(%s)',
    'hexadecimal': '!/^[a-fA-F0-9]+$/.test(%s)',
    'numeric': '!/^[0-9]+$/.test(%s)',
    'date-time': 'isNaN(Date.parse(%s)) || ~%s.indexOf(\'/\')',
    'uppercase': '%s !== %s.toUpperCase()',
    'lowercase': '%s !== %s.toLowerCase()',
    'hostname': '%s.length >= 256 || !/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/.test(%s))',
    'uri': '!/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/.test(%s)',
    'email': '!/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/.test(%s)',
    'ipv4': '!/^(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}$/.test(%s)',
    'ipv6': '!/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/.test(%s)'
};

var fieldValidate = {
    'readOnly': 'false',
    'minimum': function(schema){
        return '%s <' + (schema.exclusiveMinimum ? '=' : '' ) + ' ' + schema.minimum;
    },
    'maximum': function(schema){
        return '%s >' + (schema.exclusiveMaximum ? '=' : '' ) + ' ' + schema.maximum;
    },
    'multipleOf': '($1/$2) % 1 !== 0 && typeof $1 === "number"',
    'pattern': function (schema) {
        var pattern, modifiers;
        if (typeof schema.pattern === 'string')
            pattern = schema.pattern;
        else {
            pattern = schema.pattern[0];
            modifiers = schema.pattern[1];
        }

        var regex = new RegExp(pattern, modifiers);
        return regex + '.test(%s)';
    },
    'minLength': 'typeof $1 !== "string" || this.context.ucs2decodeLength($1) >= $2',
    'maxLength': 'typeof $1 !== "string" || utils.ucs2decodeLength($1) <= $2',
    'minItems': '$1.length >= $2 || !Array.isArray($1)',
    'maxItems': '$1.length <= $2 || !Array.isArray($1)',
    'uniqueItems': function (v, p) {
        var hash = {}, key;
        for (var i = 0, len = v.length; i < len; i++) {
            key = JSON.stringify(v[i]);
            if (hash.hasOwnProperty(key))
                return false;
            else
                hash[key] = true;
        }
        return true;
    },
    // ***** object validation ****
    'minProperties': function (v, p) {
        if (typeof v !== 'object')
            return true;
        var count = 0;
        for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
        return count >= p;
    },
    'maxProperties': function (v, p) {
        if (typeof v !== 'object')
            return true;
        var count = 0;
        for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
        return count <= p;
    },
    // ****** all *****
    'constant': function (v, p) {
        return JSON.stringify(v) == JSON.stringify(p);
    },
    'enum': function (v, p) {
        var i, len, vs;
        if (typeof v === 'object') {
            vs = JSON.stringify(v);
            for (i = 0, len = p.length; i < len; i++)
                if (vs === JSON.stringify(p[i]))
                    return true;
        } else {
            for (i = 0, len = p.length; i < len; i++)
                if (v === p[i])
                    return true;
        }
        return false;
    }
};

module.exports = {
    fieldType: fieldType,
    fieldFormat: fieldFormat,
    fieldValidate: fieldValidate
};