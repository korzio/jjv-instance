var resolve = require('./resolve');
var validators = require('./validators.gen');

module.exports = function generate(env, schema) {
    var fn = push,
        lines = [],
        data = ['data'],
        schemaStack = ['this.schema'],
        context = { '#': 'validate', reference: 0 };

    data.toString = schemaStack.toString = function () {
        return this.join('.').replace(/\.\[/g, '[');
    };

    Object.assign(fn, validators, {
        data: data,
        schema: schemaStack,
        context: context,
        error: function (errorType) {
            return 'return { ' + errorType + ': ' + fn.data + ' }';
        },
        resolve: function (reference) {
            if(typeof reference === 'object') {
                context[++context.reference] = generate(env, reference);
                reference = context.reference;
            }

            return 'this.context[' + reference + ']';
        },
        toFunction: function(){
            var src = lines.join('\n');
            return new Function('data', src);//.bind(fn);
        },
        visit: function (schema) {
            [
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
                'patternProperties',
                'items'
            ].forEach(function(validator){
                require('./validators-gen/' + validator)(schema, fn);
            });
        }
    });

    fn.visit(schema);
    console.log(fn.toFunction() + '');
    return fn.toFunction();

    //
    function push(expression) {
        var args = Array.prototype.slice.call(arguments, 1),
            last;

        lines.push(expression.replace(/(%[sd])/g, function(match){
            if(args.length) {
                last = args.shift();
            }

            return '' + last;
        }));

        return push;
    }
};