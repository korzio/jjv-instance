/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var tests = __webpack_require__(2);
	var jjv = __webpack_require__(3);

	var refs = {
		'http://localhost:1234/integer.json': __webpack_require__(24),
		'http://localhost:1234/subSchemas.json': __webpack_require__(25),
		'http://localhost:1234/folder/folderInteger.json': __webpack_require__(26),
		'http://json-schema.org/draft-04/schema': __webpack_require__(27)
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
	    suite.tests.map(function(test){
	        var env = config.setup();
	        env.addSchema('test', suite.schema);

	        var errors = env.validate('test', test.data);
	        if(test.valid == errors) {
	            console.log(suite.description);
	            console.log(test.description);
	            console.warn('wrong', errors);
	        }
	    });
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = [
		{
			"description": "additionalItems as schema",
			"schema": {
				"items": [
					{}
				],
				"additionalItems": {
					"type": "integer"
				}
			},
			"tests": [
				{
					"description": "additional items match schema",
					"data": [
						null,
						2,
						3,
						4
					],
					"valid": true
				},
				{
					"description": "additional items do not match schema",
					"data": [
						null,
						2,
						3,
						"foo"
					],
					"valid": false
				}
			]
		},
		{
			"description": "items is schema, no additionalItems",
			"schema": {
				"items": {},
				"additionalItems": false
			},
			"tests": [
				{
					"description": "all items match schema",
					"data": [
						1,
						2,
						3,
						4,
						5
					],
					"valid": true
				}
			]
		},
		{
			"description": "array of items with no additionalItems",
			"schema": {
				"items": [
					{},
					{},
					{}
				],
				"additionalItems": false
			},
			"tests": [
				{
					"description": "no additional items present",
					"data": [
						1,
						2,
						3
					],
					"valid": true
				},
				{
					"description": "additional items are not permitted",
					"data": [
						1,
						2,
						3,
						4
					],
					"valid": false
				}
			]
		},
		{
			"description": "additionalItems as false without items",
			"schema": {
				"additionalItems": false
			},
			"tests": [
				{
					"description": "items defaults to empty schema so everything is valid",
					"data": [
						1,
						2,
						3,
						4,
						5
					],
					"valid": true
				},
				{
					"description": "ignores non-arrays",
					"data": {
						"foo": "bar"
					},
					"valid": true
				}
			]
		},
		{
			"description": "additionalItems are allowed by default",
			"schema": {
				"items": [
					{
						"type": "integer"
					}
				]
			},
			"tests": [
				{
					"description": "only the first item is validated",
					"data": [
						1,
						"foo",
						false
					],
					"valid": true
				}
			]
		},
		{
			"description": "additionalProperties being false does not allow other properties",
			"schema": {
				"properties": {
					"foo": {},
					"bar": {}
				},
				"patternProperties": {
					"^v": {}
				},
				"additionalProperties": false
			},
			"tests": [
				{
					"description": "no additional properties is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "an additional property is invalid",
					"data": {
						"foo": 1,
						"bar": 2,
						"quux": "boom"
					},
					"valid": false
				},
				{
					"description": "ignores non-objects",
					"data": [
						1,
						2,
						3
					],
					"valid": true
				},
				{
					"description": "patternProperties are not additional properties",
					"data": {
						"foo": 1,
						"vroom": 2
					},
					"valid": true
				}
			]
		},
		{
			"description": "additionalProperties allows a schema which should validate",
			"schema": {
				"properties": {
					"foo": {},
					"bar": {}
				},
				"additionalProperties": {
					"type": "boolean"
				}
			},
			"tests": [
				{
					"description": "no additional properties is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "an additional valid property is valid",
					"data": {
						"foo": 1,
						"bar": 2,
						"quux": true
					},
					"valid": true
				},
				{
					"description": "an additional invalid property is invalid",
					"data": {
						"foo": 1,
						"bar": 2,
						"quux": 12
					},
					"valid": false
				}
			]
		},
		{
			"description": "additionalProperties can exist by itself",
			"schema": {
				"additionalProperties": {
					"type": "boolean"
				}
			},
			"tests": [
				{
					"description": "an additional valid property is valid",
					"data": {
						"foo": true
					},
					"valid": true
				},
				{
					"description": "an additional invalid property is invalid",
					"data": {
						"foo": 1
					},
					"valid": false
				}
			]
		},
		{
			"description": "additionalProperties are allowed by default",
			"schema": {
				"properties": {
					"foo": {},
					"bar": {}
				}
			},
			"tests": [
				{
					"description": "additional properties are allowed",
					"data": {
						"foo": 1,
						"bar": 2,
						"quux": true
					},
					"valid": true
				}
			]
		},
		{
			"description": "allOf",
			"schema": {
				"allOf": [
					{
						"properties": {
							"bar": {
								"type": "integer"
							}
						},
						"required": [
							"bar"
						]
					},
					{
						"properties": {
							"foo": {
								"type": "string"
							}
						},
						"required": [
							"foo"
						]
					}
				]
			},
			"tests": [
				{
					"description": "allOf",
					"data": {
						"foo": "baz",
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "mismatch second",
					"data": {
						"foo": "baz"
					},
					"valid": false
				},
				{
					"description": "mismatch first",
					"data": {
						"bar": 2
					},
					"valid": false
				},
				{
					"description": "wrong type",
					"data": {
						"foo": "baz",
						"bar": "quux"
					},
					"valid": false
				}
			]
		},
		{
			"description": "allOf with base schema",
			"schema": {
				"properties": {
					"bar": {
						"type": "integer"
					}
				},
				"required": [
					"bar"
				],
				"allOf": [
					{
						"properties": {
							"foo": {
								"type": "string"
							}
						},
						"required": [
							"foo"
						]
					},
					{
						"properties": {
							"baz": {
								"type": "null"
							}
						},
						"required": [
							"baz"
						]
					}
				]
			},
			"tests": [
				{
					"description": "valid",
					"data": {
						"foo": "quux",
						"bar": 2,
						"baz": null
					},
					"valid": true
				},
				{
					"description": "mismatch base schema",
					"data": {
						"foo": "quux",
						"baz": null
					},
					"valid": false
				},
				{
					"description": "mismatch first allOf",
					"data": {
						"bar": 2,
						"baz": null
					},
					"valid": false
				},
				{
					"description": "mismatch second allOf",
					"data": {
						"foo": "quux",
						"bar": 2
					},
					"valid": false
				},
				{
					"description": "mismatch both",
					"data": {
						"bar": 2
					},
					"valid": false
				}
			]
		},
		{
			"description": "allOf simple types",
			"schema": {
				"allOf": [
					{
						"maximum": 30
					},
					{
						"minimum": 20
					}
				]
			},
			"tests": [
				{
					"description": "valid",
					"data": 25,
					"valid": true
				},
				{
					"description": "mismatch one",
					"data": 35,
					"valid": false
				}
			]
		},
		{
			"description": "anyOf",
			"schema": {
				"anyOf": [
					{
						"type": "integer"
					},
					{
						"minimum": 2
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
		},
		{
			"description": "anyOf with base schema",
			"schema": {
				"type": "string",
				"anyOf": [
					{
						"maxLength": 2
					},
					{
						"minLength": 4
					}
				]
			},
			"tests": [
				{
					"description": "mismatch base schema",
					"data": 3,
					"valid": false
				},
				{
					"description": "one anyOf valid",
					"data": "foobar",
					"valid": true
				},
				{
					"description": "both anyOf invalid",
					"data": "foo",
					"valid": false
				}
			]
		},
		{
			"description": "invalid type for default",
			"schema": {
				"properties": {
					"foo": {
						"type": "integer",
						"default": []
					}
				}
			},
			"tests": [
				{
					"description": "valid when property is specified",
					"data": {
						"foo": 13
					},
					"valid": true
				},
				{
					"description": "still valid when the invalid default is used",
					"data": {},
					"valid": true
				}
			]
		},
		{
			"description": "invalid string value for default",
			"schema": {
				"properties": {
					"bar": {
						"type": "string",
						"minLength": 4,
						"default": "bad"
					}
				}
			},
			"tests": [
				{
					"description": "valid when property is specified",
					"data": {
						"bar": "good"
					},
					"valid": true
				},
				{
					"description": "still valid when the invalid default is used",
					"data": {},
					"valid": true
				}
			]
		},
		{
			"description": "valid definition",
			"schema": {
				"$ref": "http://json-schema.org/draft-04/schema#"
			},
			"tests": [
				{
					"description": "valid definition schema",
					"data": {
						"definitions": {
							"foo": {
								"type": "integer"
							}
						}
					},
					"valid": true
				}
			]
		},
		{
			"description": "invalid definition",
			"schema": {
				"$ref": "http://json-schema.org/draft-04/schema#"
			},
			"tests": [
				{
					"description": "invalid definition schema",
					"data": {
						"definitions": {
							"foo": {
								"type": 1
							}
						}
					},
					"valid": false
				}
			]
		},
		{
			"description": "dependencies",
			"schema": {
				"dependencies": {
					"bar": [
						"foo"
					]
				}
			},
			"tests": [
				{
					"description": "neither",
					"data": {},
					"valid": true
				},
				{
					"description": "nondependant",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "with dependency",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "missing dependency",
					"data": {
						"bar": 2
					},
					"valid": false
				},
				{
					"description": "ignores non-objects",
					"data": "foo",
					"valid": true
				}
			]
		},
		{
			"description": "multiple dependencies",
			"schema": {
				"dependencies": {
					"quux": [
						"foo",
						"bar"
					]
				}
			},
			"tests": [
				{
					"description": "neither",
					"data": {},
					"valid": true
				},
				{
					"description": "nondependants",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "with dependencies",
					"data": {
						"foo": 1,
						"bar": 2,
						"quux": 3
					},
					"valid": true
				},
				{
					"description": "missing dependency",
					"data": {
						"foo": 1,
						"quux": 2
					},
					"valid": false
				},
				{
					"description": "missing other dependency",
					"data": {
						"bar": 1,
						"quux": 2
					},
					"valid": false
				},
				{
					"description": "missing both dependencies",
					"data": {
						"quux": 1
					},
					"valid": false
				}
			]
		},
		{
			"description": "multiple dependencies subschema",
			"schema": {
				"dependencies": {
					"bar": {
						"properties": {
							"foo": {
								"type": "integer"
							},
							"bar": {
								"type": "integer"
							}
						}
					}
				}
			},
			"tests": [
				{
					"description": "valid",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "no dependency",
					"data": {
						"foo": "quux"
					},
					"valid": true
				},
				{
					"description": "wrong type",
					"data": {
						"foo": "quux",
						"bar": 2
					},
					"valid": false
				},
				{
					"description": "wrong type other",
					"data": {
						"foo": 2,
						"bar": "quux"
					},
					"valid": false
				},
				{
					"description": "wrong type both",
					"data": {
						"foo": "quux",
						"bar": "quux"
					},
					"valid": false
				}
			]
		},
		{
			"description": "simple enum validation",
			"schema": {
				"enum": [
					1,
					2,
					3
				]
			},
			"tests": [
				{
					"description": "one of the enum is valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "something else is invalid",
					"data": 4,
					"valid": false
				}
			]
		},
		{
			"description": "heterogeneous enum validation",
			"schema": {
				"enum": [
					6,
					"foo",
					[],
					true,
					{
						"foo": 12
					}
				]
			},
			"tests": [
				{
					"description": "one of the enum is valid",
					"data": [],
					"valid": true
				},
				{
					"description": "something else is invalid",
					"data": null,
					"valid": false
				},
				{
					"description": "objects are deep compared",
					"data": {
						"foo": false
					},
					"valid": false
				}
			]
		},
		{
			"description": "enums in properties",
			"schema": {
				"type": "object",
				"properties": {
					"foo": {
						"enum": [
							"foo"
						]
					},
					"bar": {
						"enum": [
							"bar"
						]
					}
				},
				"required": [
					"bar"
				]
			},
			"tests": [
				{
					"description": "both properties are valid",
					"data": {
						"foo": "foo",
						"bar": "bar"
					},
					"valid": true
				},
				{
					"description": "missing optional property is valid",
					"data": {
						"bar": "bar"
					},
					"valid": true
				},
				{
					"description": "missing required property is invalid",
					"data": {
						"foo": "foo"
					},
					"valid": false
				},
				{
					"description": "missing all properties is invalid",
					"data": {},
					"valid": false
				}
			]
		},
		{
			"description": "a schema given for items",
			"schema": {
				"items": {
					"type": "integer"
				}
			},
			"tests": [
				{
					"description": "valid items",
					"data": [
						1,
						2,
						3
					],
					"valid": true
				},
				{
					"description": "wrong type of items",
					"data": [
						1,
						"x"
					],
					"valid": false
				},
				{
					"description": "ignores non-arrays",
					"data": {
						"foo": "bar"
					},
					"valid": true
				}
			]
		},
		{
			"description": "an array of schemas for items",
			"schema": {
				"items": [
					{
						"type": "integer"
					},
					{
						"type": "string"
					}
				]
			},
			"tests": [
				{
					"description": "correct types",
					"data": [
						1,
						"foo"
					],
					"valid": true
				},
				{
					"description": "wrong types",
					"data": [
						"foo",
						1
					],
					"valid": false
				}
			]
		},
		{
			"description": "maxItems validation",
			"schema": {
				"maxItems": 2
			},
			"tests": [
				{
					"description": "shorter is valid",
					"data": [
						1
					],
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": [
						1,
						2
					],
					"valid": true
				},
				{
					"description": "too long is invalid",
					"data": [
						1,
						2,
						3
					],
					"valid": false
				},
				{
					"description": "ignores non-arrays",
					"data": "foobar",
					"valid": true
				}
			]
		},
		{
			"description": "maxLength validation",
			"schema": {
				"maxLength": 2
			},
			"tests": [
				{
					"description": "shorter is valid",
					"data": "f",
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": "fo",
					"valid": true
				},
				{
					"description": "too long is invalid",
					"data": "foo",
					"valid": false
				},
				{
					"description": "ignores non-strings",
					"data": 100,
					"valid": true
				},
				{
					"description": "two supplementary Unicode code points is long enough",
					"data": "💩💩",
					"valid": true
				}
			]
		},
		{
			"description": "maxProperties validation",
			"schema": {
				"maxProperties": 2
			},
			"tests": [
				{
					"description": "shorter is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "too long is invalid",
					"data": {
						"foo": 1,
						"bar": 2,
						"baz": 3
					},
					"valid": false
				},
				{
					"description": "ignores non-objects",
					"data": "foobar",
					"valid": true
				}
			]
		},
		{
			"description": "maximum validation",
			"schema": {
				"maximum": 3
			},
			"tests": [
				{
					"description": "below the maximum is valid",
					"data": 2.6,
					"valid": true
				},
				{
					"description": "above the maximum is invalid",
					"data": 3.5,
					"valid": false
				},
				{
					"description": "ignores non-numbers",
					"data": "x",
					"valid": true
				}
			]
		},
		{
			"description": "exclusiveMaximum validation",
			"schema": {
				"maximum": 3,
				"exclusiveMaximum": true
			},
			"tests": [
				{
					"description": "below the maximum is still valid",
					"data": 2.2,
					"valid": true
				},
				{
					"description": "boundary point is invalid",
					"data": 3,
					"valid": false
				}
			]
		},
		{
			"description": "minItems validation",
			"schema": {
				"minItems": 1
			},
			"tests": [
				{
					"description": "longer is valid",
					"data": [
						1,
						2
					],
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": [
						1
					],
					"valid": true
				},
				{
					"description": "too short is invalid",
					"data": [],
					"valid": false
				},
				{
					"description": "ignores non-arrays",
					"data": "",
					"valid": true
				}
			]
		},
		{
			"description": "minLength validation",
			"schema": {
				"minLength": 2
			},
			"tests": [
				{
					"description": "longer is valid",
					"data": "foo",
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": "fo",
					"valid": true
				},
				{
					"description": "too short is invalid",
					"data": "f",
					"valid": false
				},
				{
					"description": "ignores non-strings",
					"data": 1,
					"valid": true
				},
				{
					"description": "one supplementary Unicode code point is not long enough",
					"data": "💩",
					"valid": false
				}
			]
		},
		{
			"description": "minProperties validation",
			"schema": {
				"minProperties": 1
			},
			"tests": [
				{
					"description": "longer is valid",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": true
				},
				{
					"description": "exact length is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "too short is invalid",
					"data": {},
					"valid": false
				},
				{
					"description": "ignores non-objects",
					"data": "",
					"valid": true
				}
			]
		},
		{
			"description": "minimum validation",
			"schema": {
				"minimum": 1.1
			},
			"tests": [
				{
					"description": "above the minimum is valid",
					"data": 2.6,
					"valid": true
				},
				{
					"description": "below the minimum is invalid",
					"data": 0.6,
					"valid": false
				},
				{
					"description": "ignores non-numbers",
					"data": "x",
					"valid": true
				}
			]
		},
		{
			"description": "exclusiveMinimum validation",
			"schema": {
				"minimum": 1.1,
				"exclusiveMinimum": true
			},
			"tests": [
				{
					"description": "above the minimum is still valid",
					"data": 1.2,
					"valid": true
				},
				{
					"description": "boundary point is invalid",
					"data": 1.1,
					"valid": false
				}
			]
		},
		{
			"description": "by int",
			"schema": {
				"multipleOf": 2
			},
			"tests": [
				{
					"description": "int by int",
					"data": 10,
					"valid": true
				},
				{
					"description": "int by int fail",
					"data": 7,
					"valid": false
				},
				{
					"description": "ignores non-numbers",
					"data": "foo",
					"valid": true
				}
			]
		},
		{
			"description": "by number",
			"schema": {
				"multipleOf": 1.5
			},
			"tests": [
				{
					"description": "zero is multiple of anything",
					"data": 0,
					"valid": true
				},
				{
					"description": "4.5 is multiple of 1.5",
					"data": 4.5,
					"valid": true
				},
				{
					"description": "35 is not multiple of 1.5",
					"data": 35,
					"valid": false
				}
			]
		},
		{
			"description": "by small number",
			"schema": {
				"multipleOf": 0.0001
			},
			"tests": [
				{
					"description": "0.0075 is multiple of 0.0001",
					"data": 0.0075,
					"valid": true
				},
				{
					"description": "0.00751 is not multiple of 0.0001",
					"data": 0.00751,
					"valid": false
				}
			]
		},
		{
			"description": "not",
			"schema": {
				"not": {
					"type": "integer"
				}
			},
			"tests": [
				{
					"description": "allowed",
					"data": "foo",
					"valid": true
				},
				{
					"description": "disallowed",
					"data": 1,
					"valid": false
				}
			]
		},
		{
			"description": "not multiple types",
			"schema": {
				"not": {
					"type": [
						"integer",
						"boolean"
					]
				}
			},
			"tests": [
				{
					"description": "valid",
					"data": "foo",
					"valid": true
				},
				{
					"description": "mismatch",
					"data": 1,
					"valid": false
				},
				{
					"description": "other mismatch",
					"data": true,
					"valid": false
				}
			]
		},
		{
			"description": "not more complex schema",
			"schema": {
				"not": {
					"type": "object",
					"properties": {
						"foo": {
							"type": "string"
						}
					}
				}
			},
			"tests": [
				{
					"description": "match",
					"data": 1,
					"valid": true
				},
				{
					"description": "other match",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "mismatch",
					"data": {
						"foo": "bar"
					},
					"valid": false
				}
			]
		},
		{
			"description": "forbidden property",
			"schema": {
				"properties": {
					"foo": {
						"not": {}
					}
				}
			},
			"tests": [
				{
					"description": "property present",
					"data": {
						"foo": 1,
						"bar": 2
					},
					"valid": false
				},
				{
					"description": "property absent",
					"data": {
						"bar": 1,
						"baz": 2
					},
					"valid": true
				}
			]
		},
		{
			"description": "oneOf",
			"schema": {
				"oneOf": [
					{
						"type": "integer"
					},
					{
						"minimum": 2
					}
				]
			},
			"tests": [
				{
					"description": "first oneOf valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "second oneOf valid",
					"data": 2.5,
					"valid": true
				},
				{
					"description": "both oneOf valid",
					"data": 3,
					"valid": false
				},
				{
					"description": "neither oneOf valid",
					"data": 1.5,
					"valid": false
				}
			]
		},
		{
			"description": "oneOf with base schema",
			"schema": {
				"type": "string",
				"oneOf": [
					{
						"minLength": 2
					},
					{
						"maxLength": 4
					}
				]
			},
			"tests": [
				{
					"description": "mismatch base schema",
					"data": 3,
					"valid": false
				},
				{
					"description": "one oneOf valid",
					"data": "foobar",
					"valid": true
				},
				{
					"description": "both oneOf valid",
					"data": "foo",
					"valid": false
				}
			]
		},
		{
			"description": "integer",
			"schema": {
				"type": "integer"
			},
			"tests": [
				{
					"description": "a bignum is an integer",
					"data": 1.2345678910111214e+52,
					"valid": true
				}
			]
		},
		{
			"description": "number",
			"schema": {
				"type": "number"
			},
			"tests": [
				{
					"description": "a bignum is a number",
					"data": 9.824928374923492e+52,
					"valid": true
				}
			]
		},
		{
			"description": "integer",
			"schema": {
				"type": "integer"
			},
			"tests": [
				{
					"description": "a negative bignum is an integer",
					"data": -1.2345678910111214e+52,
					"valid": true
				}
			]
		},
		{
			"description": "number",
			"schema": {
				"type": "number"
			},
			"tests": [
				{
					"description": "a negative bignum is a number",
					"data": -9.824928374923492e+52,
					"valid": true
				}
			]
		},
		{
			"description": "string",
			"schema": {
				"type": "string"
			},
			"tests": [
				{
					"description": "a bignum is not a string",
					"data": 9.824928374923492e+52,
					"valid": false
				}
			]
		},
		{
			"description": "integer comparison",
			"schema": {
				"maximum": 18446744073709552000
			},
			"tests": [
				{
					"description": "comparison works for high numbers",
					"data": 18446744073709552000,
					"valid": true
				}
			]
		},
		{
			"description": "float comparison with high precision",
			"schema": {
				"maximum": 9.727837981879871e+26,
				"exclusiveMaximum": true
			},
			"tests": [
				{
					"description": "comparison works for high numbers",
					"data": 9.727837981879871e+26,
					"valid": false
				}
			]
		},
		{
			"description": "integer comparison",
			"schema": {
				"minimum": -18446744073709552000
			},
			"tests": [
				{
					"description": "comparison works for very negative numbers",
					"data": -18446744073709552000,
					"valid": true
				}
			]
		},
		{
			"description": "float comparison with high precision on negative numbers",
			"schema": {
				"minimum": -9.727837981879871e+26,
				"exclusiveMinimum": true
			},
			"tests": [
				{
					"description": "comparison works for very negative numbers",
					"data": -9.727837981879871e+26,
					"valid": false
				}
			]
		},
		{
			"description": "validation of date-time strings",
			"schema": {
				"format": "date-time"
			},
			"tests": [
				{
					"description": "a valid date-time string",
					"data": "1963-06-19T08:30:06.283185Z",
					"valid": true
				},
				{
					"description": "an invalid date-time string",
					"data": "06/19/1963 08:30:06 PST",
					"valid": false
				},
				{
					"description": "only RFC3339 not all of ISO 8601 are valid",
					"data": "2013-350T01:01:01",
					"valid": false
				}
			]
		},
		{
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
		},
		{
			"description": "validation of e-mail addresses",
			"schema": {
				"format": "email"
			},
			"tests": [
				{
					"description": "a valid e-mail address",
					"data": "joe.bloggs@example.com",
					"valid": true
				},
				{
					"description": "an invalid e-mail address",
					"data": "2962",
					"valid": false
				}
			]
		},
		{
			"description": "validation of IP addresses",
			"schema": {
				"format": "ipv4"
			},
			"tests": [
				{
					"description": "a valid IP address",
					"data": "192.168.0.1",
					"valid": true
				},
				{
					"description": "an IP address with too many components",
					"data": "127.0.0.0.1",
					"valid": false
				},
				{
					"description": "an IP address with out-of-range values",
					"data": "256.256.256.256",
					"valid": false
				},
				{
					"description": "an IP address without 4 components",
					"data": "127.0",
					"valid": false
				},
				{
					"description": "an IP address as an integer",
					"data": "0x7f000001",
					"valid": false
				}
			]
		},
		{
			"description": "validation of IPv6 addresses",
			"schema": {
				"format": "ipv6"
			},
			"tests": [
				{
					"description": "a valid IPv6 address",
					"data": "::1",
					"valid": true
				},
				{
					"description": "an IPv6 address with out-of-range values",
					"data": "12345::",
					"valid": false
				},
				{
					"description": "an IPv6 address with too many components",
					"data": "1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1",
					"valid": false
				},
				{
					"description": "an IPv6 address containing illegal characters",
					"data": "::laptop",
					"valid": false
				}
			]
		},
		{
			"description": "validation of host names",
			"schema": {
				"format": "hostname"
			},
			"tests": [
				{
					"description": "a valid host name",
					"data": "www.example.com",
					"valid": true
				},
				{
					"description": "a host name starting with an illegal character",
					"data": "-a-host-name-that-starts-with--",
					"valid": false
				},
				{
					"description": "a host name containing illegal characters",
					"data": "not_a_valid_host_name",
					"valid": false
				},
				{
					"description": "a host name with a component too long",
					"data": "a-vvvvvvvvvvvvvvvveeeeeeeeeeeeeeeerrrrrrrrrrrrrrrryyyyyyyyyyyyyyyy-long-host-name-component",
					"valid": false
				}
			]
		},
		{
			"description": "some languages do not distinguish between different types of numeric value",
			"schema": {
				"type": "integer"
			},
			"tests": [
				{
					"description": "a float is not an integer even without fractional part",
					"data": 1,
					"valid": false
				}
			]
		},
		{
			"description": "pattern validation",
			"schema": {
				"pattern": "^a*$"
			},
			"tests": [
				{
					"description": "a matching pattern is valid",
					"data": "aaa",
					"valid": true
				},
				{
					"description": "a non-matching pattern is invalid",
					"data": "abc",
					"valid": false
				},
				{
					"description": "ignores non-strings",
					"data": true,
					"valid": true
				}
			]
		},
		{
			"description": "pattern is not anchored",
			"schema": {
				"pattern": "a+"
			},
			"tests": [
				{
					"description": "matches a substring",
					"data": "xxaayy",
					"valid": true
				}
			]
		},
		{
			"description": "patternProperties validates properties matching a regex",
			"schema": {
				"patternProperties": {
					"f.*o": {
						"type": "integer"
					}
				}
			},
			"tests": [
				{
					"description": "a single valid match is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "multiple valid matches is valid",
					"data": {
						"foo": 1,
						"foooooo": 2
					},
					"valid": true
				},
				{
					"description": "a single invalid match is invalid",
					"data": {
						"foo": "bar",
						"fooooo": 2
					},
					"valid": false
				},
				{
					"description": "multiple invalid matches is invalid",
					"data": {
						"foo": "bar",
						"foooooo": "baz"
					},
					"valid": false
				},
				{
					"description": "ignores non-objects",
					"data": 12,
					"valid": true
				}
			]
		},
		{
			"description": "multiple simultaneous patternProperties are validated",
			"schema": {
				"patternProperties": {
					"a*": {
						"type": "integer"
					},
					"aaa*": {
						"maximum": 20
					}
				}
			},
			"tests": [
				{
					"description": "a single valid match is valid",
					"data": {
						"a": 21
					},
					"valid": true
				},
				{
					"description": "a simultaneous match is valid",
					"data": {
						"aaaa": 18
					},
					"valid": true
				},
				{
					"description": "multiple matches is valid",
					"data": {
						"a": 21,
						"aaaa": 18
					},
					"valid": true
				},
				{
					"description": "an invalid due to one is invalid",
					"data": {
						"a": "bar"
					},
					"valid": false
				},
				{
					"description": "an invalid due to the other is invalid",
					"data": {
						"aaaa": 31
					},
					"valid": false
				},
				{
					"description": "an invalid due to both is invalid",
					"data": {
						"aaa": "foo",
						"aaaa": 31
					},
					"valid": false
				}
			]
		},
		{
			"description": "regexes are not anchored by default and are case sensitive",
			"schema": {
				"patternProperties": {
					"[0-9]{2,}": {
						"type": "boolean"
					},
					"X_": {
						"type": "string"
					}
				}
			},
			"tests": [
				{
					"description": "non recognized members are ignored",
					"data": {
						"answer 1": "42"
					},
					"valid": true
				},
				{
					"description": "recognized members are accounted for",
					"data": {
						"a31b": null
					},
					"valid": false
				},
				{
					"description": "regexes are case sensitive",
					"data": {
						"a_x_3": 3
					},
					"valid": true
				},
				{
					"description": "regexes are case sensitive, 2",
					"data": {
						"a_X_3": 3
					},
					"valid": false
				}
			]
		},
		{
			"description": "object properties validation",
			"schema": {
				"properties": {
					"foo": {
						"type": "integer"
					},
					"bar": {
						"type": "string"
					}
				}
			},
			"tests": [
				{
					"description": "both properties present and valid is valid",
					"data": {
						"foo": 1,
						"bar": "baz"
					},
					"valid": true
				},
				{
					"description": "one property invalid is invalid",
					"data": {
						"foo": 1,
						"bar": {}
					},
					"valid": false
				},
				{
					"description": "both properties invalid is invalid",
					"data": {
						"foo": [],
						"bar": {}
					},
					"valid": false
				},
				{
					"description": "doesn't invalidate other properties",
					"data": {
						"quux": []
					},
					"valid": true
				},
				{
					"description": "ignores non-objects",
					"data": [],
					"valid": true
				}
			]
		},
		{
			"description": "properties, patternProperties, additionalProperties interaction",
			"schema": {
				"properties": {
					"foo": {
						"type": "array",
						"maxItems": 3
					},
					"bar": {
						"type": "array"
					}
				},
				"patternProperties": {
					"f.o": {
						"minItems": 2
					}
				},
				"additionalProperties": {
					"type": "integer"
				}
			},
			"tests": [
				{
					"description": "property validates property",
					"data": {
						"foo": [
							1,
							2
						]
					},
					"valid": true
				},
				{
					"description": "property invalidates property",
					"data": {
						"foo": [
							1,
							2,
							3,
							4
						]
					},
					"valid": false
				},
				{
					"description": "patternProperty invalidates property",
					"data": {
						"foo": []
					},
					"valid": false
				},
				{
					"description": "patternProperty validates nonproperty",
					"data": {
						"fxo": [
							1,
							2
						]
					},
					"valid": true
				},
				{
					"description": "patternProperty invalidates nonproperty",
					"data": {
						"fxo": []
					},
					"valid": false
				},
				{
					"description": "additionalProperty ignores property",
					"data": {
						"bar": []
					},
					"valid": true
				},
				{
					"description": "additionalProperty validates others",
					"data": {
						"quux": 3
					},
					"valid": true
				},
				{
					"description": "additionalProperty invalidates others",
					"data": {
						"quux": "foo"
					},
					"valid": false
				}
			]
		},
		{
			"description": "root pointer ref",
			"schema": {
				"properties": {
					"foo": {
						"$ref": "#"
					}
				},
				"additionalProperties": false
			},
			"tests": [
				{
					"description": "match",
					"data": {
						"foo": false
					},
					"valid": true
				},
				{
					"description": "recursive match",
					"data": {
						"foo": {
							"foo": false
						}
					},
					"valid": true
				},
				{
					"description": "mismatch",
					"data": {
						"bar": false
					},
					"valid": false
				},
				{
					"description": "recursive mismatch",
					"data": {
						"foo": {
							"bar": false
						}
					},
					"valid": false
				}
			]
		},
		{
			"description": "relative pointer ref to object",
			"schema": {
				"properties": {
					"foo": {
						"type": "integer"
					},
					"bar": {
						"$ref": "#/properties/foo"
					}
				}
			},
			"tests": [
				{
					"description": "match",
					"data": {
						"bar": 3
					},
					"valid": true
				},
				{
					"description": "mismatch",
					"data": {
						"bar": true
					},
					"valid": false
				}
			]
		},
		{
			"description": "relative pointer ref to array",
			"schema": {
				"items": [
					{
						"type": "integer"
					},
					{
						"$ref": "#/items/0"
					}
				]
			},
			"tests": [
				{
					"description": "match array",
					"data": [
						1,
						2
					],
					"valid": true
				},
				{
					"description": "mismatch array",
					"data": [
						1,
						"foo"
					],
					"valid": false
				}
			]
		},
		{
			"description": "escaped pointer ref",
			"schema": {
				"tilda~field": {
					"type": "integer"
				},
				"slash/field": {
					"type": "integer"
				},
				"percent%field": {
					"type": "integer"
				},
				"properties": {
					"tilda": {
						"$ref": "#/tilda~0field"
					},
					"slash": {
						"$ref": "#/slash~1field"
					},
					"percent": {
						"$ref": "#/percent%25field"
					}
				}
			},
			"tests": [
				{
					"description": "slash invalid",
					"data": {
						"slash": "aoeu"
					},
					"valid": false
				},
				{
					"description": "tilda invalid",
					"data": {
						"tilda": "aoeu"
					},
					"valid": false
				},
				{
					"description": "percent invalid",
					"data": {
						"percent": "aoeu"
					},
					"valid": false
				},
				{
					"description": "slash valid",
					"data": {
						"slash": 123
					},
					"valid": true
				},
				{
					"description": "tilda valid",
					"data": {
						"tilda": 123
					},
					"valid": true
				},
				{
					"description": "percent valid",
					"data": {
						"percent": 123
					},
					"valid": true
				}
			]
		},
		{
			"description": "nested refs",
			"schema": {
				"definitions": {
					"a": {
						"type": "integer"
					},
					"b": {
						"$ref": "#/definitions/a"
					},
					"c": {
						"$ref": "#/definitions/b"
					}
				},
				"$ref": "#/definitions/c"
			},
			"tests": [
				{
					"description": "nested ref valid",
					"data": 5,
					"valid": true
				},
				{
					"description": "nested ref invalid",
					"data": "a",
					"valid": false
				}
			]
		},
		{
			"description": "remote ref, containing refs itself",
			"schema": {
				"$ref": "http://json-schema.org/draft-04/schema#"
			},
			"tests": [
				{
					"description": "remote ref valid",
					"data": {
						"minLength": 1
					},
					"valid": true
				},
				{
					"description": "remote ref invalid",
					"data": {
						"minLength": -1
					},
					"valid": false
				}
			]
		},
		{
			"description": "remote ref",
			"schema": {
				"$ref": "http://localhost:1234/integer.json"
			},
			"tests": [
				{
					"description": "remote ref valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "remote ref invalid",
					"data": "a",
					"valid": false
				}
			]
		},
		{
			"description": "fragment within remote ref",
			"schema": {
				"$ref": "http://localhost:1234/subSchemas.json#/integer"
			},
			"tests": [
				{
					"description": "remote fragment valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "remote fragment invalid",
					"data": "a",
					"valid": false
				}
			]
		},
		{
			"description": "ref within remote ref",
			"schema": {
				"$ref": "http://localhost:1234/subSchemas.json#/refToInteger"
			},
			"tests": [
				{
					"description": "ref within ref valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "ref within ref invalid",
					"data": "a",
					"valid": false
				}
			]
		},
		{
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
				},
				{
					"description": "changed scope ref invalid",
					"data": [
						[
							"a"
						]
					],
					"valid": false
				}
			]
		},
		{
			"description": "required validation",
			"schema": {
				"properties": {
					"foo": {},
					"bar": {}
				},
				"required": [
					"foo"
				]
			},
			"tests": [
				{
					"description": "present required property is valid",
					"data": {
						"foo": 1
					},
					"valid": true
				},
				{
					"description": "non-present required property is invalid",
					"data": {
						"bar": 1
					},
					"valid": false
				}
			]
		},
		{
			"description": "required default validation",
			"schema": {
				"properties": {
					"foo": {}
				}
			},
			"tests": [
				{
					"description": "not required by default",
					"data": {},
					"valid": true
				}
			]
		},
		{
			"description": "integer type matches integers",
			"schema": {
				"type": "integer"
			},
			"tests": [
				{
					"description": "an integer is an integer",
					"data": 1,
					"valid": true
				},
				{
					"description": "a float is not an integer",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is not an integer",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is not an integer",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not an integer",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not an integer",
					"data": true,
					"valid": false
				},
				{
					"description": "null is not an integer",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "number type matches numbers",
			"schema": {
				"type": "number"
			},
			"tests": [
				{
					"description": "an integer is a number",
					"data": 1,
					"valid": true
				},
				{
					"description": "a float is a number",
					"data": 1.1,
					"valid": true
				},
				{
					"description": "a string is not a number",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is not a number",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not a number",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not a number",
					"data": true,
					"valid": false
				},
				{
					"description": "null is not a number",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "string type matches strings",
			"schema": {
				"type": "string"
			},
			"tests": [
				{
					"description": "1 is not a string",
					"data": 1,
					"valid": false
				},
				{
					"description": "a float is not a string",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is a string",
					"data": "foo",
					"valid": true
				},
				{
					"description": "an object is not a string",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not a string",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not a string",
					"data": true,
					"valid": false
				},
				{
					"description": "null is not a string",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "object type matches objects",
			"schema": {
				"type": "object"
			},
			"tests": [
				{
					"description": "an integer is not an object",
					"data": 1,
					"valid": false
				},
				{
					"description": "a float is not an object",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is not an object",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is an object",
					"data": {},
					"valid": true
				},
				{
					"description": "an array is not an object",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not an object",
					"data": true,
					"valid": false
				},
				{
					"description": "null is not an object",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "array type matches arrays",
			"schema": {
				"type": "array"
			},
			"tests": [
				{
					"description": "an integer is not an array",
					"data": 1,
					"valid": false
				},
				{
					"description": "a float is not an array",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is not an array",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is not an array",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not an array",
					"data": [],
					"valid": true
				},
				{
					"description": "a boolean is not an array",
					"data": true,
					"valid": false
				},
				{
					"description": "null is not an array",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "boolean type matches booleans",
			"schema": {
				"type": "boolean"
			},
			"tests": [
				{
					"description": "an integer is not a boolean",
					"data": 1,
					"valid": false
				},
				{
					"description": "a float is not a boolean",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is not a boolean",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is not a boolean",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not a boolean",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not a boolean",
					"data": true,
					"valid": true
				},
				{
					"description": "null is not a boolean",
					"data": null,
					"valid": false
				}
			]
		},
		{
			"description": "null type matches only the null object",
			"schema": {
				"type": "null"
			},
			"tests": [
				{
					"description": "an integer is not null",
					"data": 1,
					"valid": false
				},
				{
					"description": "a float is not null",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "a string is not null",
					"data": "foo",
					"valid": false
				},
				{
					"description": "an object is not null",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is not null",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is not null",
					"data": true,
					"valid": false
				},
				{
					"description": "null is null",
					"data": null,
					"valid": true
				}
			]
		},
		{
			"description": "multiple types can be specified in an array",
			"schema": {
				"type": [
					"integer",
					"string"
				]
			},
			"tests": [
				{
					"description": "an integer is valid",
					"data": 1,
					"valid": true
				},
				{
					"description": "a string is valid",
					"data": "foo",
					"valid": true
				},
				{
					"description": "a float is invalid",
					"data": 1.1,
					"valid": false
				},
				{
					"description": "an object is invalid",
					"data": {},
					"valid": false
				},
				{
					"description": "an array is invalid",
					"data": [],
					"valid": false
				},
				{
					"description": "a boolean is invalid",
					"data": true,
					"valid": false
				},
				{
					"description": "null is invalid",
					"data": null,
					"valid": false
				}
			]
		},
		{
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
		}
	];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var utils = __webpack_require__(4);
	var validators = __webpack_require__(5);
	var validate = __webpack_require__(6)("./validate" + (typeof process !== 'undefined' && process.env.NODE_ENV || ''));
	var resolve = __webpack_require__(10);

	(function () {
	    var defaultOptions = {
	        useDefault: false,
	        useCoerce: false,
	        checkRequired: true,
	        removeAdditional: false
	    };

	    function Environment() {
	        if (!(this instanceof Environment))
	            return new Environment();

	        this.coerceType = {};
	        this.fieldType = utils.clone(validators.fieldType);
	        this.fieldValidate = utils.clone(validators.fieldValidate);
	        this.fieldFormat = utils.clone(validators.fieldFormat);
	        this.defaultOptions = utils.clone(defaultOptions);
	        this.schema = {};
	    }

	    Environment.prototype = {
	        validate: function (name, object, options) {
	            var schemaStack = [name],
	                errors = null,
	                objectStack = [object];

	            if (typeof name === 'string') {
	                schemaStack = this.resolve(null, name);
	                if (!schemaStack)
	                    throw new Error('jjv: could not find schema \'' + name + '\'.');
	            }

	            if (!options) {
	                options = this.defaultOptions;
	            } else {
	                for (var p in this.defaultOptions)
	                    if (this.defaultOptions.hasOwnProperty(p) && !options.hasOwnProperty(p))
	                        options[p] = this.defaultOptions[p];
	            }

	            errors = validate(this, schemaStack, objectStack, options);

	            if (errors)
	                return { validation: errors.hasOwnProperty('schema') ? errors.schema : errors };
	            else
	                return null;
	        },

	        resolve: function (schemaStack, $ref) {
	            return resolve(this, schemaStack, $ref);
	        },

	        addType: function (name, func) {
	            this.fieldType[name] = func;
	        },

	        addTypeCoercion: function (type, func) {
	            this.coerceType[type] = func;
	        },

	        addCheck: function (name, func) {
	            this.fieldValidate[name] = func;
	        },

	        addFormat: function (name, func) {
	            this.fieldFormat[name] = func;
	        },

	        addSchema: function (name, schema) {
	            if (!schema && name) {
	                schema = name;
	                name = undefined;
	            }
	            if (schema.hasOwnProperty('id') && typeof schema.id === 'string' && schema.id !== name) {
	                if (schema.id.charAt(0) === '/')
	                    throw new Error('jjv: schema id\'s starting with / are invalid.');
	                this.schema[utils.normalizeID(schema.id)] = schema;
	            } else if (!name) {
	                throw new Error('jjv: schema needs either a name or id attribute.');
	            }
	            if (name)
	                this.schema[utils.normalizeID(name)] = schema;
	        }
	    };

	    // Export for use in server and client.
	    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	        module.exports = Environment;
	    else if (true)
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return Environment; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    else
	        this.jjv = Environment;
	}).call(this);


/***/ },
/* 4 */
/***/ function(module, exports) {

	var clone = function (obj) {
	    // Handle the 3 simple types (string, number, function), and null or undefined
	    if (obj === null || typeof obj !== 'object') return obj;
	    var copy;

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // handle RegExp
	    if (obj instanceof RegExp) {
	        copy = new RegExp(obj);
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        copy = [];
	        for (var i = 0, len = obj.length; i < len; i++)
	            copy[i] = clone(obj[i]);
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        copy = {};
	        var hasOwnProperty = copy.hasOwnProperty;
	        //           copy = Object.create(Object.getPrototypeOf(obj));
	        for (var attr in obj) {
	            if (hasOwnProperty.call(obj, attr))
	                copy[attr] = clone(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to clone object!");
	};

	var copyStack = function (newStack, oldStack) {
	    var stackLast = newStack.length - 1;
	    oldStack[stackLast] = newStack[stackLast];
	};

	var normalizeID = function (id) {
	    return id.indexOf("://") === -1 ? id : id.split("#")[0];
	};

	var resolveObjectRef = function (objectStack, uri) {
	    var components,
	        object,
	        lastFrame = objectStack.length - 1,
	        skipFrames,
	        frame,
	        m = /^(\d+)/.exec(uri);

	    if (m) {
	        uri = uri.substr(m[0].length);
	        skipFrames = parseInt(m[1], 10);
	        if (skipFrames < 0 || skipFrames > lastFrame)
	            return;
	        frame = objectStack[lastFrame - skipFrames];
	        if (uri === '#')
	            return frame;
	    } else
	        frame = objectStack[0];

	    object = frame;

	    if (uri === '')
	        return object;

	    if (uri.charAt(0) === '/') {
	        uri = uri.substr(1);
	        components = uri.split('/');
	        while (components.length > 0) {
	            components[0] = components[0].replace(/~1/g, '/').replace(/~0/g, '~');
	            if (!object.hasOwnProperty(components[0]))
	                return;
	            object = object[components[0]];
	            components.shift();
	        }
	        return object;
	    } else
	        return;
	};

	/**
	* Creates an array containing the numeric code points of each Unicode
	* character in the string. While JavaScript uses UCS-2 internally,
	* this function will convert a pair of surrogate halves (each of which
	* UCS-2 exposes as separate characters) into a single code point,
	* matching UTF-16.
	* @see `punycode.ucs2.encode`
	* @see <https://mathiasbynens.be/notes/javascript-encoding>
	* @memberOf punycode.ucs2
	* @name decode
	* @param {String} string The Unicode input string (UCS-2).
	* @returns {Array} The new array of code points.
	*/
	function ucs2decodeLength(string) {
	    var output = [],
	        counter = 0,
	        length = string.length,
	        value,
	        extra;

	    while (counter < length) {
	        value = string.charCodeAt(counter++);
	        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	            // high surrogate, and there is a next character
	            extra = string.charCodeAt(counter++);
	            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
	                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	            } else {
	                // unmatched surrogate; only append this code unit, in case the next
	                // code unit is the high surrogate of a surrogate pair
	                output.push(value);
	                counter--;
	            }
	        } else {
	            output.push(value);
	        }
	    }

	    return output.length;
	}

	module.exports = {
	    clone: clone,
	    copyStack: copyStack,
	    normalizeID: normalizeID,
	    resolveObjectRef: resolveObjectRef,
	    ucs2decodeLength: ucs2decodeLength
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(4);

	var fieldType = {
		'null': function (x) {
			return x === null;
		},
		'string': function (x) {
			return typeof x === 'string';
		},
		'boolean': function (x) {
			return typeof x === 'boolean';
		},
		'number': function (x) {
			// Use x === x instead of !isNaN(x) for speed
			return typeof x === 'number' && x === x;
		},
		'integer': function (x) {
			return typeof x === 'number' && x % 1 === 0;
		},
		'object': function (x) {
			return x && typeof x === 'object' && !Array.isArray(x);
		},
		'array': function (x) {
			return Array.isArray(x);
		},
		'date': function (x) {
			return x instanceof Date;
		}
	};

	// missing: uri, date-time, ipv4, ipv6
	var fieldFormat = {
		'alpha': function (v) {
			return (/^[a-zA-Z]+$/).test(v);
		},
		'alphanumeric': function (v) {
			return (/^[a-zA-Z0-9]+$/).test(v);
		},
		'identifier': function (v) {
			return (/^[-_a-zA-Z0-9]+$/).test(v);
		},
		'hexadecimal': function (v) {
			return (/^[a-fA-F0-9]+$/).test(v);
		},
		'numeric': function (v) {
			return (/^[0-9]+$/).test(v);
		},
		'date-time': function (v) {
			return !isNaN(Date.parse(v)) && v.indexOf('/') === -1;
		},
		'uppercase': function (v) {
			return v === v.toUpperCase();
		},
		'lowercase': function (v) {
			return v === v.toLowerCase();
		},
		'hostname': function (v) {
			return v.length < 256 && (/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/).test(v);
		},
		'uri': function (v) {
			return (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(v);
		},
		'email': function (v) { // email, ipv4 and ipv6 adapted from node-validator
			return (/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/).test(v);
		},
		'ipv4': function (v) {
			if ((/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/).test(v)) {
				var parts = v.split('.').sort();
				if (parts[3] <= 255)
					return true;
			}
			return false;
		},
		'ipv6': function (v) {
			return (/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/).test(v);
			/*  return (/^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/).test(v); */
		}
	};

	var fieldValidate = {
		'readOnly': function (v, p) {
			return false;
		},
		// ****** numeric validation ********
		'minimum': function (v, p, schema) {
			return !(v < p || schema.exclusiveMinimum && v <= p);
		},
		'maximum': function (v, p, schema) {
			return !(v > p || schema.exclusiveMaximum && v >= p);
		},
		'multipleOf': function (v, p) {
			return (v / p) % 1 === 0 || typeof v !== 'number';
		},
		// ****** string validation ******
		'pattern': function (v, p) {
			if (typeof v !== 'string')
				return true;
			var pattern, modifiers;
			if (typeof p === 'string')
				pattern = p;
			else {
				pattern = p[0];
				modifiers = p[1];
			}
			var regex = new RegExp(pattern, modifiers);
			return regex.test(v);
		},
		'minLength': function (v, p) {
			return typeof v !== 'string' || utils.ucs2decodeLength(v) >= p;
		},
		'maxLength': function (v, p) {
			return typeof v !== 'string' || utils.ucs2decodeLength(v) <= p;
		},
		// ***** array validation *****
		'minItems': function (v, p) {
			return v.length >= p || !Array.isArray(v);
		},
		'maxItems': function (v, p) {
			return v.length <= p || !Array.isArray(v);
		},
		'uniqueItems': function (v, p) {
			var hash = {}, key;
			for (var i = 0, len = v.length; i < len; i++) {
				key = JSON.stringify(v[i]);
				if (hash.hasOwnProperty(key))
					return false;
				else
					hash[key] = true;
			}
			return true;
		},
		// ***** object validation ****
		'minProperties': function (v, p) {
			if (typeof v !== 'object')
				return true;
			var count = 0;
			for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
			return count >= p;
		},
		'maxProperties': function (v, p) {
			if (typeof v !== 'object')
				return true;
			var count = 0;
			for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
			return count <= p;
		},
		// ****** all *****
		'constant': function (v, p) {
			return JSON.stringify(v) == JSON.stringify(p);
		},
		'enum': function (v, p) {
			var i, len, vs;
			if (typeof v === 'object') {
				vs = JSON.stringify(v);
				for (i = 0, len = p.length; i < len; i++)
					if (vs === JSON.stringify(p[i]))
						return true;
			} else {
				for (i = 0, len = p.length; i < len; i++)
					if (v === p[i])
						return true;
			}
			return false;
		}
	};

	module.exports = {
		fieldType: fieldType,
		fieldFormat: fieldFormat,
		fieldValidate: fieldValidate
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./validate": 7,
		"./validate.build": 23,
		"./validate.build.1": 28,
		"./validate.build.1.js": 28,
		"./validate.build.js": 23,
		"./validate.gen.build": 29,
		"./validate.gen.build.js": 29,
		"./validate.js": 7
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 6;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(env, schemaStack, objectStack, options) {
		for(var i = 0, arr = [
			'required',
	        'property',
	        'type',

	        '$ref',
	        'not',
	        'anyOf',
	        'oneOf',
	        'allOf',
	        'dependencies',

	        'properties',
	        'items',
	        'additionalItems'
		], len = arr.length; i < len; i++) {
			var error = __webpack_require__(8)("./" + arr[i])(env, schemaStack, objectStack, options);
			if(error) {
				return error;
			}
		}
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./$ref": 9,
		"./$ref.js": 9,
		"./additionalItems": 11,
		"./additionalItems.js": 11,
		"./allOf": 12,
		"./allOf.js": 12,
		"./anyOf": 13,
		"./anyOf.js": 13,
		"./dependencies": 14,
		"./dependencies.js": 14,
		"./items": 15,
		"./items.js": 15,
		"./not": 16,
		"./not.js": 16,
		"./oneOf": 17,
		"./oneOf.js": 17,
		"./properties": 18,
		"./properties.js": 18,
		"./property": 19,
		"./property.js": 19,
		"./required": 21,
		"./required.js": 21,
		"./type": 22,
		"./type.js": 22
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 8;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var resolve = __webpack_require__(10);

	module.exports = function $ref(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('$ref')) {/*r-condition*/
	        var newSchemaStack = resolve(env, schemaStack, schema.$ref);
	        if (!newSchemaStack) {
	            return { '$ref': schema.$ref };
	        }

	        var errors = validate(env, newSchemaStack, objectStack, options);
	        if (errors) {
	            return errors;
	        }
	    }
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function resolveURI(env, schemaStack, uri) {
		var curschema, components, hashIdx, name;

		hashIdx = uri.indexOf('#');
		if (hashIdx === -1) {
			if (!env.schema.hasOwnProperty(uri)) {
	            uri = schemaStack.slice(0, -1).map(function(stack){ return stack.id }).join('') + uri;
			}

			if (!env.schema.hasOwnProperty(uri)) {
				return null;
			}

			return [env.schema[uri]];
		}

		if (hashIdx > 0) {
			name = uri.substr(0, hashIdx);
			uri = uri.substr(hashIdx + 1);
			if (!env.schema.hasOwnProperty(name)) {
				if (schemaStack && schemaStack[0].id === name) {
					schemaStack = [schemaStack[0]];
				}
				else {
					return null;
				}
			} else {
				schemaStack = [env.schema[name]];
			}
		} else {
			if (!schemaStack) {
				return null;
			}

			uri = uri.substr(1);
		}

		if (uri === '') {
			return [schemaStack[0]];
		}

		if (uri.charAt(0) === '/') {
			uri = uri.substr(1);
			curschema = schemaStack[0];
			components = uri.split('/');
			while (components.length > 0) {
				var currentPath = decodeURIComponent(components[0].replace(/~1/g, '/').replace(/~0/g, '~'));
				if (!curschema.hasOwnProperty(currentPath)) {
					return null;
				}

				curschema = curschema[currentPath];
				schemaStack.push(curschema);
				components.shift();
			}

			return schemaStack;
		} else { // FIX: should look for subschemas whose id matches uri
			return null;
		}
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);

	module.exports = function additionalItems(env, schemaStack, objectStack, options) {
		var schema = schemaStack[schemaStack.length - 1],
			prop = objectStack[objectStack.length - 1];

		if (schema.additionalItems && Array.isArray(prop) && typeof schema.additionalItems !== 'boolean') {/*r-condition*/
	        var errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	        if (errors) {
	            return errors;
	        }
	    }
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);

	module.exports = function allOf(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];

	    if (schema.hasOwnProperty('allOf')) {/*r-condition*/
	        for (var i = 0, len = schema.allOf.length; i < len; i++) {
	            var errors = validate(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function anyOf(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('anyOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.anyOf.length; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
	            if (!errors) {
	                break;
	            }
	        }

	        if (errors) {
	            return errors;
	        }
	    }
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function dependencies(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('dependencies')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        for (var p in schema.dependencies) {
	            if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
	                if (Array.isArray(schema.dependencies[p])) {
	                    for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
	                        if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
	                            return { 'dependencies': true };
	                        }
	                } else {
	                    var errors = validate(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        }
	    }
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);

	module.exports = function items(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1],
	        errors, i, len;

	    if (Array.isArray(prop) && schema.hasOwnProperty('items')) {/*r-condition*/
	        if (Array.isArray(schema.items)) {
	            for (i = 0, len = schema.items.length; i < len; i++) {
	                errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), options);
	                if (errors) {
	                    return errors;
	                }
	            }

	            if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
	                if (typeof schema.additionalItems === 'boolean') {
	                    if (!schema.additionalItems) {
	                        return { 'additionalItems': true };
	                    }
	                } else {
	                    errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        } else {
	            errors = validate(env, schemaStack.concat(schema.items), objectStack.concat(prop), options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function not(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('not')) {/*r-condition*/
	        var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
	            newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
	            errors = validate(env, schemaStack.concat(schema.not), newStack, options);

	        if (!errors) {
	            return { 'not': true };
	        }
	    }
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function oneOf(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('oneOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
	            if (!errors) {
	                if (++count > 1) {
	                    break;
	                } else if (customTypesUsage) {
	                    utils.copyStack(newStack, objectStack);
	                }
	            }
	        }

	        if (count > 1) {
	            return { 'oneOf': true };
	        } else if (count < 1) {
	            return errors;
	        }
	    }
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function properties(env, schemaStack, objectStack, options) {
	    var prop = objectStack[objectStack.length - 1],
	        schema = schemaStack[schemaStack.length - 1],
	        hasProp = schema.hasOwnProperty('properties'),
	        hasPattern = schema.hasOwnProperty('patternProperties');

	    if (prop && !Array.isArray(prop)) {/*r-condition*/
	        var props = Object.keys(prop),
	            errors = {}, objerr, matched, i, len, p;

	        if (hasProp || hasPattern) {
	            i = props.length;
	            while (i--) {
	                matched = false;
	                if (hasProp && schema.properties.hasOwnProperty(props[i])) {
	                    matched = true;
	                    objerr = validate(env, schemaStack.concat(schema.properties[props[i]]), objectStack.concat([prop[props[i]]]), options);
	                    if (objerr) {
	                        errors[props[i]] = objerr;
	                        return errors;
	                    }
	                }
	                if (hasPattern) {
	                    for (p in schema.patternProperties)
	                        if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
	                            matched = true;
	                            objerr = validate(env, schemaStack.concat(schema.patternProperties[p]), objectStack.concat([prop[props[i]]]), options);
	                            if (objerr) {
	                                errors[props[i]] = objerr;
	                                return errors;
	                            }
	                        }
	                }
	                if (matched)
	                    props.splice(i, 1);
	            }
	        }

	        if (options.useDefault && hasProp) {
	            for (p in schema.properties)
	                if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
	                    prop[p] = utils.clone(schema.properties[p]['default']);
	        }

	        if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
	            for (i = 0, len = props.length; i < len; i++)
	                delete prop[props[i]];
	        } else {
	            if (schema.hasOwnProperty('additionalProperties')) {
	                if (typeof schema.additionalProperties === 'boolean') {
	                    if (!schema.additionalProperties) {
	                        for (i = 0, len = props.length; i < len; i++) {
	                            errors[props[i]] = { 'additional': true };
	                            return errors;
	                        }
	                    }
	                } else {
	                    for (i = 0, len = props.length; i < len; i++) {
	                        objerr = validate(env, schemaStack.concat(schema.additionalProperties), objectStack.concat([prop[props[i]]]), options);
	                        if (objerr) {
	                            errors[props[i]] = objerr;
	                            return errors;
	                        }
	                    }
	                }
	            }
	        }
	    }
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var keywords = __webpack_require__(20);
	var validate = __webpack_require__(7);
	var utils = __webpack_require__(4);

	module.exports = function property(env, schemaStack, objectStack, options) {
		var prop = objectStack[objectStack.length - 1],
			schema = schemaStack[schemaStack.length - 1],
			errors = {};

		for (var v in schema) {
			if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
				if (v === 'format') {
					if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
						errors[v] = true;
						return errors;
					}
				} else {
					var useSchemaStack = schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v];

					if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, useSchemaStack, schema, objectStack, options)) {
						errors[v] = true;
						return errors;
					}
				}
			}
		}
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = [
		"type",
		"not",
		"anyOf",
		"allOf",
		"oneOf",
		"$ref",
		"$schema",
		"id",
		"exclusiveMaximum",
		"exclusiveMininum",
		"properties",
		"patternProperties",
		"additionalProperties",
		"items",
		"additionalItems",
		"required",
		"default",
		"title",
		"description",
		"definitions",
		"dependencies"
	];

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function required(env, schema, object, fn) {
	    if (Array.isArray(schema.required)) {/*r-condition*/
	        for (var i = 0, len = schema.required.length; i < len; i++) {
	            if (!object.hasOwnProperty(schema.required[i])) {
	                var errors = {};
	                errors[schema.required[i]] = { 'required': true };
	                return errors;
	            }
	        }
	    }
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function type(env, schemaStack, objectStack, options) {
	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('type')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        if (typeof schema.type === 'string') {
	            if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type)) {
	                prop = env.coerceType[schema.type](prop);
	            }
	            if (!env.fieldType[schema.type](prop)) {
	                return { 'type': schema.type };
	            }
	        } else if (Array.isArray(schema.type)) {
	            for (var i = 0, len = schema.type.length; i < len; i++) {
	                if (env.fieldType[schema.type[i]](prop)) {
	                    return;/*r-continue*/
	                }
	            }

	            return { 'type': schema.type };
	        }
	    }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(4);
	var validators = __webpack_require__(5);
	var keywords = __webpack_require__(20);
	var resolve = __webpack_require__(10);

	module.exports = function validate(env, schemaStack, objectStack, options) {
	    /** required **/

	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1];

	    if (options.checkRequired && schema.required && !Array.isArray(prop)) {/*r-condition*/
	        for (var i = 0, len = schema.required.length; i < len; i++) {
	            if (!prop.hasOwnProperty(schema.required[i])) {
	                var errors = {};
	                errors[schema.required[i]] = { 'required': true };
	                return errors;
	            }
	        }
	    }


	    /** property **/

	    var prop = objectStack[objectStack.length - 1],
	        schema = schemaStack[schemaStack.length - 1],
	        errors = {};

	    for (var v in schema) {
	        if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
	            if (v === 'format') {
	                if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
	                    errors[v] = true;
	                    return errors;
	                }
	            } else {
	                var useSchemaStack = schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v];

	                if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, useSchemaStack, schema, objectStack, options)) {
	                    errors[v] = true;
	                    return errors;
	                }
	            }
	        }
	    }

	    /** type **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('type')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        if (typeof schema.type === 'string') {
	            if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type)) {
	                prop = env.coerceType[schema.type](prop);
	            }
	            if (!env.fieldType[schema.type](prop)) {
	                return { 'type': schema.type };
	            }
	        } else if (Array.isArray(schema.type)) {
	            for (var i = 0, len = schema.type.length; i < len; i++) {
	                if (env.fieldType[schema.type[i]](prop)) {
	                    return;/*r-continue*/
	                }
	            }

	            return { 'type': schema.type };
	        }
	    }

	    /** $ref **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('$ref')) {/*r-condition*/
	        var newSchemaStack = resolve(env, schemaStack, schema.$ref);
	        if (!newSchemaStack) {
	            return { '$ref': schema.$ref };
	        }

	        var errors = validate(env, newSchemaStack, objectStack, options);
	        if (errors) {
	            return errors;
	        }
	    }

	    /** not **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('not')) {/*r-condition*/
	        var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
	            newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
	            errors = validate(env, schemaStack.concat(schema.not), newStack, options);

	        if (!errors) {
	            return { 'not': true };
	        }
	    }

	    /** anyOf **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('anyOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.anyOf.length; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
	            if (!errors) {
	                break;
	            }
	        }

	        if (errors) {
	            return errors;
	        }
	    }

	    /** oneOf **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('oneOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
	            if (!errors) {
	                if (++count > 1) {
	                    break;
	                } else if (customTypesUsage) {
	                    utils.copyStack(newStack, objectStack);
	                }
	            }
	        }

	        if (count > 1) {
	            return { 'oneOf': true };
	        } else if (count < 1) {
	            return errors;
	        }
	    }

	    /** allOf **/

	    var schema = schemaStack[schemaStack.length - 1];

	    if (schema.hasOwnProperty('allOf')) {/*r-condition*/
	        for (var i = 0, len = schema.allOf.length; i < len; i++) {
	            var errors = validate(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }

	    /** dependencies **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('dependencies')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        for (var p in schema.dependencies) {
	            if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
	                if (Array.isArray(schema.dependencies[p])) {
	                    for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
	                        if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
	                            return { 'dependencies': true };
	                        }
	                } else {
	                    var errors = validate(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        }
	    }

	    /** properties **/

	    var prop = objectStack[objectStack.length - 1],
	        schema = schemaStack[schemaStack.length - 1],
	        hasProp = schema.hasOwnProperty('properties'),
	        hasPattern = schema.hasOwnProperty('patternProperties');

	    if (prop && !Array.isArray(prop)) {/*r-condition*/
	        var props = Object.keys(prop),
	            errors = {}, objerr, matched, i, len, p;

	        if (hasProp || hasPattern) {
	            i = props.length;
	            while (i--) {
	                matched = false;
	                if (hasProp && schema.properties.hasOwnProperty(props[i])) {
	                    matched = true;
	                    objerr = validate(env, schemaStack.concat(schema.properties[props[i]]), objectStack.concat([prop[props[i]]]), options);
	                    if (objerr) {
	                        errors[props[i]] = objerr;
	                        return errors;
	                    }
	                }
	                if (hasPattern) {
	                    for (p in schema.patternProperties)
	                        if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
	                            matched = true;
	                            objerr = validate(env, schemaStack.concat(schema.patternProperties[p]), objectStack.concat([prop[props[i]]]), options);
	                            if (objerr) {
	                                errors[props[i]] = objerr;
	                                return errors;
	                            }
	                        }
	                }
	                if (matched)
	                    props.splice(i, 1);
	            }
	        }

	        if (options.useDefault && hasProp) {
	            for (p in schema.properties)
	                if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
	                    prop[p] = utils.clone(schema.properties[p]['default']);
	        }

	        if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
	            for (i = 0, len = props.length; i < len; i++)
	                delete prop[props[i]];
	        } else {
	            if (schema.hasOwnProperty('additionalProperties')) {
	                if (typeof schema.additionalProperties === 'boolean') {
	                    if (!schema.additionalProperties) {
	                        for (i = 0, len = props.length; i < len; i++) {
	                            errors[props[i]] = { 'additional': true };
	                            return errors;
	                        }
	                    }
	                } else {
	                    for (i = 0, len = props.length; i < len; i++) {
	                        objerr = validate(env, schemaStack.concat(schema.additionalProperties), objectStack.concat([prop[props[i]]]), options);
	                        if (objerr) {
	                            errors[props[i]] = objerr;
	                            return errors;
	                        }
	                    }
	                }
	            }
	        }
	    }

	    /** items **/

	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1],
	        errors, i, len;

	    if (Array.isArray(prop) && schema.hasOwnProperty('items')) {/*r-condition*/
	        if (Array.isArray(schema.items)) {
	            for (i = 0, len = schema.items.length; i < len; i++) {
	                errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), options);
	                if (errors) {
	                    return errors;
	                }
	            }

	            if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
	                if (typeof schema.additionalItems === 'boolean') {
	                    if (!schema.additionalItems) {
	                        return { 'additionalItems': true };
	                    }
	                } else {
	                    errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        } else {
	            errors = validate(env, schemaStack.concat(schema.items), objectStack.concat(prop), options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }

	    /** additionalItems **/

	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1];

	    if (schema.additionalItems && Array.isArray(prop) && typeof schema.additionalItems !== 'boolean') {/*r-condition*/
	        var errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	        if (errors) {
	            return errors;
	        }
	    }
	}

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = {
		"type": "integer"
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = {
		"integer": {
			"type": "integer"
		},
		"refToInteger": {
			"$ref": "#/integer"
		}
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = {
		"type": "integer"
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = {
		"id": "http://json-schema.org/draft-04/schema#",
		"$schema": "http://json-schema.org/draft-04/schema#",
		"description": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": {
					"$ref": "#"
				}
			},
			"positiveInteger": {
				"type": "integer",
				"minimum": 0
			},
			"positiveIntegerDefault0": {
				"allOf": [
					{
						"$ref": "#/definitions/positiveInteger"
					},
					{
						"default": 0
					}
				]
			},
			"simpleTypes": {
				"enum": [
					"array",
					"boolean",
					"integer",
					"null",
					"number",
					"object",
					"string"
				]
			},
			"stringArray": {
				"type": "array",
				"items": {
					"type": "string"
				},
				"minItems": 1,
				"uniqueItems": true
			}
		},
		"type": "object",
		"properties": {
			"id": {
				"type": "string",
				"format": "uri"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"title": {
				"type": "string"
			},
			"description": {
				"type": "string"
			},
			"default": {},
			"multipleOf": {
				"type": "number",
				"minimum": 0,
				"exclusiveMinimum": true
			},
			"maximum": {
				"type": "number"
			},
			"exclusiveMaximum": {
				"type": "boolean",
				"default": false
			},
			"minimum": {
				"type": "number"
			},
			"exclusiveMinimum": {
				"type": "boolean",
				"default": false
			},
			"maxLength": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minLength": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": {
				"anyOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				],
				"default": {}
			},
			"items": {
				"anyOf": [
					{
						"$ref": "#"
					},
					{
						"$ref": "#/definitions/schemaArray"
					}
				],
				"default": {}
			},
			"maxItems": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minItems": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"maxProperties": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minProperties": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"required": {
				"$ref": "#/definitions/stringArray"
			},
			"additionalProperties": {
				"anyOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				],
				"default": {}
			},
			"definitions": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": {
					"anyOf": [
						{
							"$ref": "#"
						},
						{
							"$ref": "#/definitions/stringArray"
						}
					]
				}
			},
			"enum": {
				"type": "array",
				"minItems": 1,
				"uniqueItems": true
			},
			"type": {
				"anyOf": [
					{
						"$ref": "#/definitions/simpleTypes"
					},
					{
						"type": "array",
						"items": {
							"$ref": "#/definitions/simpleTypes"
						},
						"minItems": 1,
						"uniqueItems": true
					}
				]
			},
			"allOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"anyOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"oneOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"not": {
				"$ref": "#"
			}
		},
		"dependencies": {
			"exclusiveMaximum": [
				"maximum"
			],
			"exclusiveMinimum": [
				"minimum"
			]
		},
		"default": {}
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(4);
	var validators = __webpack_require__(5);
	var keywords = __webpack_require__(20);
	var resolve = __webpack_require__(10);

	module.exports = function transform(env, schemaStack, objectStack, options){
	    var object = { keys: '' };

	    return validate(env, schemaStack[0], objectStack[0]);
	}

	function validate(env, schema, object) {
	    if (schema.required ^ object.keys) {
	        return -1;
	    }

	    return;

	    /** property **/

	    var prop = objectStack[objectStack.length - 1],
	        schema = schemaStack[schemaStack.length - 1],
	        errors = {};

	    for (var v in schema) {
	        if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
	            if (v === 'format') {
	                if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
	                    errors[v] = true;
	                    return errors;
	                }
	            } else {
	                var useSchemaStack = schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v];

	                if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, useSchemaStack, schema, objectStack, options)) {
	                    errors[v] = true;
	                    return errors;
	                }
	            }
	        }
	    }

	    /** type **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('type')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        if (typeof schema.type === 'string') {
	            if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type)) {
	                prop = env.coerceType[schema.type](prop);
	            }
	            if (!env.fieldType[schema.type](prop)) {
	                return { 'type': schema.type };
	            }
	        } else if (Array.isArray(schema.type)) {
	            for (var i = 0, len = schema.type.length; i < len; i++) {
	                if (env.fieldType[schema.type[i]](prop)) {
	                    return;/*r-continue*/
	                }
	            }

	            return { 'type': schema.type };
	        }
	    }

	    /** $ref **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('$ref')) {/*r-condition*/
	        var newSchemaStack = resolve(env, schemaStack, schema.$ref);
	        if (!newSchemaStack) {
	            return { '$ref': schema.$ref };
	        }

	        var errors = validate(env, newSchemaStack, objectStack, options);
	        if (errors) {
	            return errors;
	        }
	    }

	    /** not **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('not')) {/*r-condition*/
	        var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
	            newStack = customTypesUsage ? utils.clone(objectStack) : objectStack,
	            errors = validate(env, schemaStack.concat(schema.not), newStack, options);

	        if (!errors) {
	            return { 'not': true };
	        }
	    }

	    /** anyOf **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('anyOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.anyOf.length; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
	            if (!errors) {
	                break;
	            }
	        }

	        if (errors) {
	            return errors;
	        }
	    }

	    /** oneOf **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('oneOf')) {/*r-condition*/
	        var errors,
	            newStack = objectStack,
	            customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	        for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
	            if (customTypesUsage) {
	                newStack = utils.clone(objectStack);
	            }

	            errors = validate(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
	            if (!errors) {
	                if (++count > 1) {
	                    break;
	                } else if (customTypesUsage) {
	                    utils.copyStack(newStack, objectStack);
	                }
	            }
	        }

	        if (count > 1) {
	            return { 'oneOf': true };
	        } else if (count < 1) {
	            return errors;
	        }
	    }

	    /** allOf **/

	    var schema = schemaStack[schemaStack.length - 1];

	    if (schema.hasOwnProperty('allOf')) {/*r-condition*/
	        for (var i = 0, len = schema.allOf.length; i < len; i++) {
	            var errors = validate(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }

	    /** dependencies **/

	    var schema = schemaStack[schemaStack.length - 1];
	    if (schema.hasOwnProperty('dependencies')) {/*r-condition*/
	        var prop = objectStack[objectStack.length - 1];
	        for (var p in schema.dependencies) {
	            if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
	                if (Array.isArray(schema.dependencies[p])) {
	                    for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
	                        if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
	                            return { 'dependencies': true };
	                        }
	                } else {
	                    var errors = validate(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        }
	    }

	    /** properties **/

	    var prop = objectStack[objectStack.length - 1],
	        schema = schemaStack[schemaStack.length - 1],
	        hasProp = schema.hasOwnProperty('properties'),
	        hasPattern = schema.hasOwnProperty('patternProperties');

	    if (prop && !Array.isArray(prop)) {/*r-condition*/
	        var props = Object.keys(prop),
	            errors = {}, objerr, matched, i, len, p;

	        if (hasProp || hasPattern) {
	            i = props.length;
	            while (i--) {
	                matched = false;
	                if (hasProp && schema.properties.hasOwnProperty(props[i])) {
	                    matched = true;
	                    objerr = validate(env, schemaStack.concat(schema.properties[props[i]]), objectStack.concat([prop[props[i]]]), options);
	                    if (objerr) {
	                        errors[props[i]] = objerr;
	                        return errors;
	                    }
	                }
	                if (hasPattern) {
	                    for (p in schema.patternProperties)
	                        if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
	                            matched = true;
	                            objerr = validate(env, schemaStack.concat(schema.patternProperties[p]), objectStack.concat([prop[props[i]]]), options);
	                            if (objerr) {
	                                errors[props[i]] = objerr;
	                                return errors;
	                            }
	                        }
	                }
	                if (matched)
	                    props.splice(i, 1);
	            }
	        }

	        if (options.useDefault && hasProp) {
	            for (p in schema.properties)
	                if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
	                    prop[p] = utils.clone(schema.properties[p]['default']);
	        }

	        if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
	            for (i = 0, len = props.length; i < len; i++)
	                delete prop[props[i]];
	        } else {
	            if (schema.hasOwnProperty('additionalProperties')) {
	                if (typeof schema.additionalProperties === 'boolean') {
	                    if (!schema.additionalProperties) {
	                        for (i = 0, len = props.length; i < len; i++) {
	                            errors[props[i]] = { 'additional': true };
	                            return errors;
	                        }
	                    }
	                } else {
	                    for (i = 0, len = props.length; i < len; i++) {
	                        objerr = validate(env, schemaStack.concat(schema.additionalProperties), objectStack.concat([prop[props[i]]]), options);
	                        if (objerr) {
	                            errors[props[i]] = objerr;
	                            return errors;
	                        }
	                    }
	                }
	            }
	        }
	    }

	    /** items **/

	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1],
	        errors, i, len;

	    if (Array.isArray(prop) && schema.hasOwnProperty('items')) {/*r-condition*/
	        if (Array.isArray(schema.items)) {
	            for (i = 0, len = schema.items.length; i < len; i++) {
	                errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), options);
	                if (errors) {
	                    return errors;
	                }
	            }

	            if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
	                if (typeof schema.additionalItems === 'boolean') {
	                    if (!schema.additionalItems) {
	                        return { 'additionalItems': true };
	                    }
	                } else {
	                    errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	                    if (errors) {
	                        return errors;
	                    }
	                }
	            }
	        } else {
	            errors = validate(env, schemaStack.concat(schema.items), objectStack.concat(prop), options);
	            if (errors) {
	                return errors;
	            }
	        }
	    }

	    /** additionalItems **/

	    var schema = schemaStack[schemaStack.length - 1],
	        prop = objectStack[objectStack.length - 1];

	    if (schema.additionalItems && Array.isArray(prop) && typeof schema.additionalItems !== 'boolean') {/*r-condition*/
	        var errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
	        if (errors) {
	            return errors;
	        }
	    }
	}

/***/ },
/* 29 */
/***/ function(module, exports) {

	1848

/***/ }
/******/ ]);