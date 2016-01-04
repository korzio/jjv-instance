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

// Object.keys(refs).forEach(function (uri) {
// 	env.addSchema(uri, refs[uri]);
// });

var test = {
        "description": "an array of schemas for items",
        "schema": {
            "properties": {
                "foo": {"$ref": "#"}
            },
            "additionalProperties": false
        },
        "tests": [
            {
                "description": "correct types",
                "data": [ 1, "foo" ],
                "valid": true
            }
        ]
    };

    // "items": [
    //             {"type": "integer"},
    //             {"$ref": "#/items/0"}
    //         ]

env.addSchema('test', test.schema);

var errors = env.validate('test', test.tests[0].data);
console.log('Done, ', errors);