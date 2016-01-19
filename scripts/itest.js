var jjv = require('./../lib/jjv.gen');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
    'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
    'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
    'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
    'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};


// var suite = require('/Users/alexanderko/Sites/schema/jjv-instance/scripts/tests.json');
var suite = [{
    "description": "uniqueItems validation",
    "schema": {
        "uniqueItems": true
    },
    "tests": [
        {
            "description": "unique array of integers is valid",
            "data": [
                1,
                2
            ],
            "valid": true
        },
        {
            "description": "non-unique array of integers is invalid",
            "data": [
                1,
                1
            ],
            "valid": false
        },
        {
            "description": "numbers are unique if mathematically unequal",
            "data": [
                1,
                1,
                1
            ],
            "valid": false
        },
        {
            "description": "unique array of objects is valid",
            "data": [
                {
                    "foo": "bar"
                },
                {
                    "foo": "baz"
                }
            ],
            "valid": true
        },
        {
            "description": "non-unique array of objects is invalid",
            "data": [
                {
                    "foo": "bar"
                },
                {
                    "foo": "bar"
                }
            ],
            "valid": false
        },
        {
            "description": "unique array of nested objects is valid",
            "data": [
                {
                    "foo": {
                        "bar": {
                            "baz": true
                        }
                    }
                },
                {
                    "foo": {
                        "bar": {
                            "baz": false
                        }
                    }
                }
            ],
            "valid": true
        },
        {
            "description": "non-unique array of nested objects is invalid",
            "data": [
                {
                    "foo": {
                        "bar": {
                            "baz": true
                        }
                    }
                },
                {
                    "foo": {
                        "bar": {
                            "baz": true
                        }
                    }
                }
            ],
            "valid": false
        },
        {
            "description": "unique array of arrays is valid",
            "data": [
                [
                    "foo"
                ],
                [
                    "bar"
                ]
            ],
            "valid": true
        },
        {
            "description": "non-unique array of arrays is invalid",
            "data": [
                [
                    "foo"
                ],
                [
                    "foo"
                ]
            ],
            "valid": false
        },
        {
            "description": "1 and true are unique",
            "data": [
                1,
                true
            ],
            "valid": true
        },
        {
            "description": "0 and false are unique",
            "data": [
                0,
                false
            ],
            "valid": true
        },
        {
            "description": "unique heterogeneous types are valid",
            "data": [
                {},
                [
                    1
                ],
                true,
                null,
                1
            ],
            "valid": true
        },
        {
            "description": "non-unique heterogeneous types are invalid",
            "data": [
                {},
                [
                    1
                ],
                true,
                null,
                {},
                1
            ],
            "valid": false
        }
    ]
}];

suite.map(function (testSuite) {
    var env = new jjv();

    // Object.keys(refs).forEach(function (uri) {
    //     env.addSchema(uri, refs[uri]);
    // });

    env.addSchema('test', testSuite.schema);
    testSuite.tests.forEach(function (test) {
        var errors = env.validate('test', test.data),
            status = !errors ? { valid: true } : { valid: false, errors: [errors] };

        if (test.valid !== status.valid) {
            console.log(testSuite.description);
            console.log(test.description);
            console.log(JSON.stringify(test.schema, null, 4));
            console.warn('wrong', errors);
        }
    });
});

console.info('done');