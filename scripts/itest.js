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
    "description": "additionalItems as schema",
    "schema": {
        "items": [{}],
        "additionalItems": {"type": "integer"}
    },
    "tests": [
        {
            "description": "additional items match schema",
            "data": [ null, 2, 3, 4 ],
            "valid": true
        },
        {
            "description": "additional items do not match schema",
            "data": [ null, 2, 3, "foo" ],
            "valid": false
        }
    ]
};

env.addSchema('test', test.schema);

var errors = env.validate('test', test.tests[0].data);
console.log(errors);