var jjv = require('./../lib/jjv');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
    'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
    'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
    'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
    'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};


var suite = require('/Users/alexanderko/Sites/schema/jjv-instance/test/fixtures/allOf.json');

// Object.keys(refs).forEach(function (uri) {
// 	env.addSchema(uri, refs[uri]);
// });

suite.map(function(test){
    var env = new jjv();
    env.addSchema('test', test.schema);


    try { env.validate('test', test.data) }
    catch(e){ console.log('I dont know'); };
    // if(test.valid == errors) {
    //     console.log(suite.description);
    //     console.log(test.description);
    //     console.warn('wrong', errors);
    // }
});

// var errors = env.validate('test', test.tests[0].data);
// console.log('Done, ', errors);