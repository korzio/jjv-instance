var assert = require('assert'),
    glob = require('glob'),
    util = require('util'),
    testsuite = require('json-schema-test-suite');

var jjv = require('./../lib/jjv');
var globalPath = './../node_modules/json-schema-test-suite';
var refs = {
	'http://localhost:1234/integer.json': require(globalPath + '/remotes/integer.json'),
	'http://localhost:1234/subSchemas.json': require(globalPath + '/remotes/subSchemas.json'),
	'http://localhost:1234/folder/folderInteger.json': require(globalPath + '/remotes/folder/folderInteger.json'),
	'http://json-schema.org/draft-04/schema': require('./../test/draft-04-schema.json')
};

var factory = function (schema, options) {
  return {
    validate: function (json) {
      try {
        var env = new jjv();

        Object.keys(refs).forEach(function (uri) {
            env.addSchema(uri, refs[uri]);
        });
		env.addSchema('test', schema);

        var errors = env.validate('test', json);

        if(schema.lookup) {
            console.log('---------');
            console.log(schema, json);
            console.log(errors);
            console.log(JSON.stringify(env));
        }

        return !errors ? { valid: true } : { valid: false, errors: [ errors ] };
      } catch (err) {
        return { valid: false, errors: [err.message] };
      }
    }
  };
};

var drafts = [ /*'draft3', */'draft4'];

describe('verify test suite loads all json test files', function() {
    var testMessage = 'The number of %s test groups should match the number of %s json files';
    var errorMessage = 'the actual number of test groups was expected match the number of %s json files';

    var globalPath = './node_modules/json-schema-test-suite'
    var allPattern = globalPath + '/tests/%s/**/*.json';
    var requiredPattern = {
        glob: globalPath + '/tests/%s/**/*.json',
        ignore: globalPath + '/tests/%s/optional/*.json'
    };
    var optionalPattern = globalPath + '/tests/%s/optional/*.json';
    var minPattern = globalPath + '/tests/%s/**/min*.json';

    var testPlans = [{
        name: 'all',
        globPattern: allPattern
    }, {
        name: 'required',
        globPattern: requiredPattern,
        filter: testsuite.requiredOnlyFilter
    }, {
        name: 'optional',
        globPattern: optionalPattern,
        filter: testsuite.optionalOnlyFilter
    }, {
        name: '"min"-prefixed',
        globPattern: minPattern,
        filter: function(file) {
            return /^min/.test(file);
        }
    }];

    function loadFiles(draft, globPattern) {
        if (typeof globPattern == 'string') {
            return glob.sync(util.format(globPattern, draft));
        } else {
            return glob.sync(util.format(globPattern.glob, draft), {
                ignore: util.format(globPattern.ignore, draft)
            });
        }
    }

    function compareCount(draft, globPattern, filter, name) {
        var tests = testsuite.loadSync({
            filter: filter,
            draft: draft
        });
        var files = loadFiles(draft, globPattern);

        assert.equal(tests.length, files.length, util.format(errorMessage, name));
    }

    // for the combination of draft directories and test plans, create a test case
    // and verify the number of tests returned by the test suite is equal to the actual
    // number of files that match the glob pattern.
    drafts.forEach(function(draft) {
        testPlans.forEach(function(pt) {
            it(util.format(testMessage, draft, pt.name), function() {
                compareCount(draft, pt.globPattern, pt.filter, pt.name);
            });
        })
    });

    // test helper functions loadRequiredSync and loadOptionalSync
    drafts.forEach(function(draft) {
        it(util.format('should load required %s tests', draft), function() {
            var tests = testsuite.loadRequiredSync(draft);
            var files = loadFiles(draft, requiredPattern);

            assert.equal(tests.length, files.length, util.format(errorMessage, 'required'));
        })

        it(util.format('should load optional %s tests', draft), function() {
            var tests = testsuite.loadOptionalSync(draft);
            var files = loadFiles(draft, optionalPattern);

            assert.equal(tests.length, files.length, util.format(errorMessage, 'optional'));
        })
    });

});

describe('validator tests', function() {
    var validatorResults = [];

    after(function() {
        validatorResults.forEach(function(validator) {
            console.log('\n******************************');
            console.log('validator: %s (%s)', validator.name, validator.draft);
            console.log('pass: ' + validator.results.pass);
            console.log('fail: ' + validator.results.fail);
        });
    });

    describe('jjv validator tests', function() {
		// create a test suite for each draft
        drafts.forEach(function(draft) {
            var validatorResult = {
                name: 'jjv',
                draft: draft,
                results: {
                    pass: 0,
                    fail: 0
                }
            };

            validatorResults.push(validatorResult);
            runTests(factory, draft, validatorResult);
        });
    });
});

function runTests(factory, draft, validatorResult) {
    describe(draft, function() {
        var tests = testsuite.testSync(factory, {}, void 0, draft);
        tests.forEach(function(test) {
            describe(test.name, function() {
                test.schemas.forEach(function(schema) {
                    describe(schema.description, function() {
                        schema.tests.forEach(function(testCase) {
                            it(testCase.description, function() {
                                var result = testCase.result;
                                if (result.valid === testCase.valid) {
                                    validatorResult.results.pass++;
                                } else {
                                    validatorResult.results.fail++;
                                }

                                if(result.valid !== testCase.valid) {
                                    console.log(JSON.stringify(schema.schema, 4));
                                    console.log(JSON.stringify(testCase, 4));
                                }

                                assert.equal(result.valid, testCase.valid);
                            });
                        });
                    });
                });
            })
        });
    });
}