var jjv = require('./../lib/jjv.gen');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
    'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
    'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
    'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
    'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};


var suite = require('/Users/alexanderko/Sites/schema/jjv-instance/scripts/tests.json');

suite.map(function(test){
    var env = new jjv();

    Object.keys(refs).forEach(function (uri) {
        env.addSchema(uri, refs[uri]);
    });

    env.addSchema('test', test.schema);
    test.tests.forEach(function(test){
        var errors = env.validate('test', test.data);

        if(test.valid == errors) {
            console.log(suite.description);
            console.log(test.description);
            console.log(JSON.stringify(test.schema, null, 4));
            console.warn('wrong', errors);
        }
    });
});

console.info('done');