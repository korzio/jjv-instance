var jjv = require('./../lib/jjv');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
	'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
	'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
	'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
	'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};

var env = new jjv();
// var test = require('/Users/alexanderko/Sites/schema/jjv-instance/node_modules/json-schema-benchmark/JSON-Schema-Test-Suite/tests/draft4/additionalItems.json').pop();

Object.keys(refs).forEach(function (uri) {
	env.addSchema(uri, refs[uri]);
});

var test = {
    "description": "not multiple types",
    "schema": {
        "not": {"type": ["integer", "boolean"]}
    },
    "tests": [
        {
            "description": "valid",
            "data": "foo",
            "valid": true
        },
        {
            "description": "mismatch",
            "data": 1,
            "valid": false
        },
        {
            "description": "other mismatch",
            "data": true,
            "valid": false
        }
    ]
};

env.addSchema('test', test.schema);

var errors = env.validate('test', test.tests[1].data);
debugger;