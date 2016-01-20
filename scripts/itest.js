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
    "description": "validation of URIs",
    "schema": {
        "format": "uri"
    },
    "tests": [
        {
            "description": "a valid URI",
            "data": "http://foo.bar/?baz=qux#quux",
            "valid": true
        },
        {
            "description": "a valid protocol-relative URI",
            "data": "//foo.bar/?baz=qux#quux",
            "valid": true
        },
        {
            "description": "an invalid URI",
            "data": "\\\\WINDOWS\\fileshare",
            "valid": false
        },
        {
            "description": "an invalid URI though valid URI reference",
            "data": "abc",
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
            console.log(JSON.stringify(testSuite.schema, null, 4));
            console.log(test.data);
            console.warn('wrong', errors);
        }
    });
});

console.info('done');