var fs = require('fs');

var source = 'var utils = require(\'./utils\');\n\
var validators = require(\'./validators\');\n\
var keywords = require(\'./keywords\');\n\
var resolve = require(\'./resolve\');\n\n\
module.exports = function validate(env, schemaStack, objectStack, options) {';

var path = './../lib/validators/';
var FN_HEAD = /^function\s*[^\(]*\(\s*[^\)]*\)\s*\{/m;
var CONDITION = /if\s*\(([^{]+)\)\s*\{\/\*r-condition\*\/$\s*return;$\s*\}/m;
var CONDITION_TO = 'if (!($1)){';
var CONTINUE = /return;\/\*r-continue\*\//m;

for(var i = 0, arr = [
	'$ref',
	'type',
	'allOf',
	'oneOf',
	'anyOf',
	'not',
	'dependencies',
	'required',
	'properties',
	'items',
	'additionalItems',
	'property'
], len = arr.length; i < len; i++) {
	var validatorStr = require(path + arr[i]).toString();

	validatorStr = validatorStr.replace(FN_HEAD, '\n/** ' + arr[i] + ' **/\n');
	// if(CONDITION.test(validatorStr)){
	// 	validatorStr = validatorStr.replace(CONDITION, CONDITION_TO);
	// } else {
	// 	validatorStr = validatorStr.slice(0, -1);
	// }

	// validatorStr = validatorStr.replace(CONTINUE, 'continue;');
	source += validatorStr;
}

source += '}';
fs.writeFileSync('lib/validate.build.js', source);