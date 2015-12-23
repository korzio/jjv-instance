var fs = require('fs');
var path = require('path');

function readTests(dirpath) {
	return require('fs-readdir-recursive')(dirpath).reduce(function (acc, value) {
		return acc.concat(require(path.join(dirpath, value)));
	}, []);
}

var testSuites = readTests(path.join(__dirname + '/../node_modules/JSON-Schema-Test-Suite/tests/draft4/'));
fs.writeFileSync('test.json', JSON.stringify(testSuites));