var keywords = require('./../keywords.json');
var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function property(schema, fn) {
	for (var key in schema) {
		if (!~keywords.indexOf(key)) {
			if (key === 'format') {
                fn('if (' + fn.fieldFormat[schema.type] + ')', fn.data)
                    (fn.error('format'));
			} else {
                var validateStr = fn.fieldValidate[key];
                if(typeof validateStr === 'function') {
                    validateStr = validateStr(schema);
                }

                fn('if (' + validateStr + ')', fn.data, schema[key])
                    (fn.error('format'));
			}
		}
	}
};