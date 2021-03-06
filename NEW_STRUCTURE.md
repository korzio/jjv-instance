# Why use json-schema

- Instantiate
- Validate
- Randomize

# What relative tasks can be?

- Instantiate
- Validate
- Randomize
- Models like objectmodel validation or any format
- [Validation for React](https://facebook.github.io/react/docs/reusable-components.html)
- RAML

# Meta programming

What is generate-function? How to write very optimized functions?

- Templates
- Validators

# What I did by steps

## Goals

- keep structure and code clean

in is-my-json-schema-valid and jjv packages structure is - one file, and is hard to understand what is inside

- add architecture ability to set instantiate and randomize data
- fast validation
- normal speed generation

## Refactoring jjv

- splitted into files
- updated variable names

## Refactoring for generated function

investigate c++ inline functions

- is-my-json-valid implementation
- got a generated-function
- updated generated function with few methods - resolve, error, etc, cache - Maybe it is better to use some meta language for it?

## Optimized things

- Added Measured
- Describe All measurements

## Google Closure Advanced

- features
- what is used
- why still need optimizations

### Todo Optimizations List

- generatedNonRefFunctions 1377, generatedFunctionsUsed 3003 - make fn.if function, and transport scope/context/state to generate function
- { count: 361, key: 'if (Array.isArray($1) && $1.some(function(item, key) {            key = JSON.stringify(item);            if(i1.hasOwnProperty(key))            return true;            i1[key] = true;        }))' }, // http://jsperf.com/array-some-vs-loop/5
- { count: 181, key: 'if (!/[-a-zA-Z0-9@:%_\\+.~#?&//=]{2,256}\\.[a-z]{2,4}\\b(\\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?/.test(%s))' }

# TODO

- resolve override ('changed scope ref valid' test)
- use strict
- [if optimization](http://jsperf.com/ifs-vs-expression)?
- variables names with quotes, aka properties '%%%%' will throw error
- update ref usage for non-ref inline functions - if a linke does not contain refs inside (can be easily checked by json.stringify), it should be a regular if-else consequence as well
- override fieldType
- todo i,property foreach, vars!
- compile/optimize json schema structure itself
- add 'assert' fn
- remove clone
- split properties
- [add compile step](http://ejohn.org/blog/asmjs-javascript-compile-target/)
- https://www.npmjs.com/package/generate-function
- add instantiate
- add generate random
- add license
- add tests to json schema suite and json-schema-benchmark
- change package tests runner
- add prev jjv functional
- to hasOwnProperty
- remove generate-function package (keep link)
- es6
- errors
- extreme values
- http://habrahabr.ru/company/mailru/blog/273839/
- docs
- [compile with google closure or smth](https://www.npmjs.com/package/google-closure-compiler)
- // TODO $data
- Optimize small schemas (like in allOf example - don't generate function, althought return context)
- add static generated functions posibility
- Read ajv implementation
- add tests to [resolve](http://tools.ietf.org/html/draft-zyp-json-schema-04#section-7.2.4)

# References

- [how to](http://spacetelescope.github.io/understanding-json-schema/basics.html#declaring-a-unique-identifier)