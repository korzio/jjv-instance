var fs = require('fs');

module.exports = {
	toCamelCase: function(fileName){
		var file = fs.readFileSync(fileName).toString();
		fs.writeFile(fileName, file.replace(/([a-zA-Z])_([a-zA-Z])/g, function(fullText, $1, $2){
			return $1 + $2.toUpperCase();
		}));
	}
};

module.exports.toCamelCase('lib/jjv.js');
module.exports.toCamelCase('lib/schema.js');
module.exports.toCamelCase('lib/utils.js');
module.exports.toCamelCase('lib/validators.js');