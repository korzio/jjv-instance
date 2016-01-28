var jjv = require('./../lib/jjv.gen');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
    // 'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
    // 'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
    // // 'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
    // 'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};

var measure = require('./measured');
var suite = require('/Users/alexanderko/Sites/schema/jjv-instance/scripts/tests.json');
var suite = [{
    "description": "anyOf",
    "schema": {
        "anyOf": [
            {
                "type": "integer",
            },
            {
                "minimum": 2,
                "properties": {
                    "abba": {
                        "type": "integer"
                    }
                },
                "required": ["abba"]
            }
        ]
    },
    "tests": [
        {
            "description": "first anyOf valid",
            "data": 1,
            "valid": true
        },
        {
            "description": "second anyOf valid",
            "data": 2.5,
            "valid": true
        },
        {
            "description": "both anyOf valid",
            "data": 3,
            "valid": true
        },
        {
            "description": "neither anyOf valid",
            "data": 1.5,
            "valid": false
        }
    ]
}];

suite.map(function (testSuite) {
    var env = new jjv();
    env.stats = measure.stats;

    Object.keys(refs).forEach(function (uri) {
        env.addSchema(uri, refs[uri]);
    });

    env.addSchema('test', testSuite.schema);

    console.log(testSuite.description);
    console.log('schema', JSON.stringify(testSuite.schema, null, 4));

    testSuite.tests.forEach(function (test) {
        var errors = env.validate('test', test.data),
            status = !errors ? { valid: true } : { valid: false, errors: [errors] };

        console.log(test.description);
        console.log('data', test.data);

        if (test.valid !== status.valid) {
            console.warn('wrong', errors);
        } else {
            console.info('ok');
        }
    });
});

measure.print(false);
console.info('done');