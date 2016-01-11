var validators = require('./validators');
var validate = require('./validate' + (typeof process !== 'undefined' && process.env.NODE_ENV || ''));
var resolve = require('./resolve');

(function () {
    function Environment() {
        if (!(this instanceof Environment))
            return new Environment();

        this.schema = {};
    }

    Environment.prototype = {
        validate: function(name, object, options){
            return this.resolve(name)(object);
        },

        resolve: function (name) {
            return this.schema[name];
        },

        addSchema: function (name, schema) {
            var fn = require('./generate')(this, schema);
            // TODO fix
            if(typeof fn === 'function') {
                this.schema[name] = Object.assign(fn, schema);
            }

            return this.schema[name];
        }
    };

    // Export for use in server and client.
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = Environment;
    else if (typeof define === 'function' && define.amd)
        define(function () { return Environment; });
    else
        this.jjv = Environment;
}).call(this);
