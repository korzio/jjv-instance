'use strict';

var jjv = require('./jjv.gen');

// Example from http://json-schema.org/latest/json-schema-core.html#anchor29
var schema = {
    "id": "http://x.y.z/rootschema.json#",
    "schema1": {
        "id": "#foo",
        "description": "schema1"
    },
    "schema2": {
        "id": "otherschema.json",
        "description": "schema2",
        "nested": {
            "id": "#bar",
            "description": "nested"
        },
        "alsonested": {
            "id": "t/inner.json#a",
            "description": "alsonested"
        }
    },
    "schema3": {
        "id": "some://where.else/completely#",
        "description": "schema3"
    }
};


describe('resolve', function () {
    describe('resolve.ids method', function () {

        it('should resolve ids in schema', function () {
            var validate = jjv.compile(schema);
        });

    });
    
});
