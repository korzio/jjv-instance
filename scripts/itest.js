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
    "description": "change resolution scope",
    "schema": {
        "id": "http://localhost:1234/",
        "items": {
            "id": "folder/",
            "items": {
                "$ref": "folderInteger.json"
            }
        }
    },
    "tests": [
        {
            "description": "changed scope ref valid",
            "data": [
                [
                    1
                ]
            ],
            "valid": true
        }
    ]
}];

suite.map(function (testSuite) {
    var env = new jjv();

    Object.keys(refs).forEach(function (uri) {
        env.addSchema(uri, refs[uri]);
    });

    env.addSchema('test', testSuite.schema);
    testSuite.tests.forEach(function (test) {
        var errors = env.validate('test', test.data),
            status = !errors ? { valid: true } : { valid: false, errors: [errors] };

        if (test.valid !== status.valid) {
            console.log(testSuite.description);
            console.log(test.description);
            console.log('schema', JSON.stringify(testSuite.schema, null, 4));
            console.log('data', test.data);
            console.warn('wrong', errors);
        }
    });
});

console.info('done');