var resolve = require('./resolve');
var validators = require('./validators.gen');

module.exports = function (env, schema) {
    var fn = push,
        lines = [],
        data = ['data'],
        schemaStack = ['schema'],
        context = { '#': 'validate' };

    data.toString = function () {
        return data.join('.');
    };

    schemaStack.toString = function () {
        return schemaStack.join('.');
    };

    Object.assign(fn, validators, {
        data: data,
        schema: schemaStack,
        context: context,
        error: function (errorType) {
            return 'return { ' + errorType + ': ' + fn.data + ' }';
        },
        resolve: function (reference) {
            return 'this.context["' + fn.context[reference] + '"]';
        },
        toFunction: function(){
            var src = 'return (' + lines.join('\n') + ').bind(this)';
            return new Function(src);//.call(line);
        },
        visit: function (schema) {
            for (var i = 0, arr = [
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
            ], len = arr.length; i < len; i++) {
                require('./validators-gen/' + arr[i])(schema, this, env);
            }
        }
    })

    fn('function validate(data) {');
    fn.visit(schema);
    fn('}');

    console.log(fn.toFunction() + '');
    return fn.context['#'];

    //
    function push(expression) {
        var args = Array.prototype.slice.call(arguments, 1);
        lines.push(expression.replace(/(%[sd])/g, function(match, p1){
            var s = args[0]
            args.unshift();

            return '' + s;
        }));

        return push;
    }
};