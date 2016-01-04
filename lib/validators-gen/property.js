var keywords = require('./../keywords.json');
var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function property(schema, fn, env) {
	for (var key in schema) {
		if (!~keywords.indexOf(key)) {
			if (key === 'format') {
                fn('if (' + fn.fieldFormat[schema.type] + ')', fn.data)
                    (fn.error('format'));
			} else {
                // TODO $data
                fn('if (' + fn.fieldValidate[key] + ')', fn.data, schema[key], fn.schema)
                    (fn.error('format'));
			}
		}
	}
};