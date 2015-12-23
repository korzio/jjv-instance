var tests = require('./tests.json');
var jjv = require('./../lib/jjv');

var refs = {
	'http://localhost:1234/integer.json': require('./../node_modules/json-schema-test-suite/remotes/integer.json'),
	'http://localhost:1234/subSchemas.json': require('./../node_modules/json-schema-test-suite/remotes/subSchemas.json'),
	'http://localhost:1234/folder/folderInteger.json': require('./../node_modules/json-schema-test-suite/remotes/folder/folderInteger.json'),
	'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};

var config = {
    name: 'jjv-utils',
    setup: function () {
        var validator = new jjv();
        Object.keys(refs).forEach(function (uri) {
            validator.addSchema(uri, refs[uri]);
        });
        return validator;
    },
    test: function (instance, json, schema) {
        return instance.validate(schema, json) === null;
    }
};

tests.map(function(suite){
    console.log(suite.description);

    suite.tests.map(function(test){
        console.log(test.description);

        var env = config.setup();
        env.addSchema('test', suite.schema);

        var errors = env.validate('test', test.data);
        if(test.valid == errors) {
            console.warn('wrong', errors);
        }
    });

});