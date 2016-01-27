var keywords = require('./../keywords.json');
var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function property(schema, fn) {
	for (var key in schema) {
		if (!~keywords.indexOf(key)) {
			if (key === 'format') {
                if(fn.fieldFormat[schema[key]]) {
                    fn('if (' + fn.fieldFormat[schema[key]] + ')', fn.data)
                        (fn.error('format'));
                }
			} else {
                var validateStr = fn.fieldValidate[key];
                if(!validateStr) {
                    return;
                }

                if(typeof validateStr === 'function') {
                    validateStr = validateStr(schema, fn);
                }

                fn('if (' + validateStr + ')', fn.data, schema[key])
                    (fn.error(key));
			}
		}
	}
};