var fieldType = {
	'null': function (x) {
		return x === null;
	},
	'string': function (x) {
		return typeof x === 'string';
	},
	'boolean': function (x) {
		return typeof x === 'boolean';
	},
	'number': function (x) {
		// Use x === x instead of !isNaN(x) for speed
		return typeof x === 'number' && x === x;
	},
	'integer': function (x) {
		return typeof x === 'number' && x % 1 === 0;
	},
	'object': function (x) {
		return x && typeof x === 'object' && !Array.isArray(x);
	},
	'array': function (x) {
		return Array.isArray(x);
	},
	'date': function (x) {
		return x instanceof Date;
	}
};

// missing: uri, date-time, ipv4, ipv6
var fieldFormat = {
	'alpha': function (v) {
		return (/^[a-zA-Z]+$/).test(v);
	},
	'alphanumeric': function (v) {
		return (/^[a-zA-Z0-9]+$/).test(v);
	},
	'identifier': function (v) {
		return (/^[-_a-zA-Z0-9]+$/).test(v);
	},
	'hexadecimal': function (v) {
		return (/^[a-fA-F0-9]+$/).test(v);
	},
	'numeric': function (v) {
		return (/^[0-9]+$/).test(v);
	},
	'date-time': function (v) {
		return !isNaN(Date.parse(v)) && v.indexOf('/') === -1;
	},
	'uppercase': function (v) {
		return v === v.toUpperCase();
	},
	'lowercase': function (v) {
		return v === v.toLowerCase();
	},
	'hostname': function (v) {
		return v.length < 256 && (/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/).test(v);
	},
	'uri': function (v) {
		return (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(v);
	},
	'email': function (v) { // email, ipv4 and ipv6 adapted from node-validator
		return (/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/).test(v);
	},
	'ipv4': function (v) {
		if ((/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/).test(v)) {
			var parts = v.split('.').sort();
			if (parts[3] <= 255)
				return true;
		}
		return false;
	},
	'ipv6': function (v) {
		return (/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/).test(v);
		/*  return (/^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/).test(v); */
	}
};

var fieldValidate = {
	'readOnly': function (v, p) {
		return false;
	},
	// ****** numeric validation ********
	'minimum': function (v, p, schema) {
		return !(v < p || schema.exclusiveMinimum && v <= p);
	},
	'maximum': function (v, p, schema) {
		return !(v > p || schema.exclusiveMaximum && v >= p);
	},
	'multipleOf': function (v, p) {
		return (v / p) % 1 === 0 || typeof v !== 'number';
	},
	// ****** string validation ******
	'pattern': function (v, p) {
		if (typeof v !== 'string')
			return true;
		var pattern, modifiers;
		if (typeof p === 'string')
			pattern = p;
		else {
			pattern = p[0];
			modifiers = p[1];
		}
		var regex = new RegExp(pattern, modifiers);
		return regex.test(v);
	},
	'minLength': function (v, p) {
		return v.length >= p || typeof v !== 'string';
	},
	'maxLength': function (v, p) {
		return v.length <= p || typeof v !== 'string';
	},
	// ***** array validation *****
	'minItems': function (v, p) {
		return v.length >= p || !Array.isArray(v);
	},
	'maxItems': function (v, p) {
		return v.length <= p || !Array.isArray(v);
	},
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