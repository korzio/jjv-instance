var resolve = require('./resolve');
var utils = require('./utils');
var validators = require('./validators.gen');

module.exports = function generate(env, schema, schemas) {
    Object.assign(fn, validators, {
        data: ['data'],
        schema: ['this.schema'],
        schemas: schemas || Object.assign({ '#': schema }, env.schema),
        context: Object.assign([], utils),
        lines: [],
        error: function (errorType) {
            return 'return { "' + errorType + '": ' + fn.data + ' }';
        },
        resolve: function (reference) {
            // TODO move to resolve.gen
            if(typeof reference === 'string') {
                if(reference === '#'){
                    reference = 0;
                } else {
                    var referenceParts = reference.split(/#\/?/),
                        uri = referenceParts[0] || '#',
                        name = referenceParts[1],
                        currentSchema = fn.schemas[uri],
                        components = name && name.split('/');

                    while (components && components.length > 0) {
                        var currentPath = decodeURIComponent(components[0].replace(/~1/g, '/').replace(/~0/g, '~'));
                        if (!currentSchema.hasOwnProperty(currentPath)) {
                            throw new Error('Schema not found');
                        }

                        currentSchema = currentSchema[currentPath];
                        components.shift();
                    }

                    reference = currentSchema;
                }
            }

            if(typeof reference === 'object') {
                reference = fn.context.push(generate(env, reference, fn.schemas));
            } else if(typeof reference === 'function') {
                reference = fn.context.push(reference);
            }

            if (typeof reference !== 'string' && typeof reference !== 'number') {
                throw new Error('Not implemented');
            }

            return 'this.context["' + reference + '"]';
        },
        toFunction: function(){
            var src = fn.lines.join('\n');
            var generatedFn = new Function('data', src).bind(fn);
            fn.context.unshift(generatedFn);
            if(typeof schema.id === 'string') {
                fn.context[schema.id] = generatedFn;
            }

            // console.log(generatedFn + '');
            return generatedFn;
        },
        cached: [], cachedIndex: 0,
        cache: function(expression){
            var layer = fn.cached[fn.cached.length - 1];

            if(layer[expression]) {
                return 'i' + layer[expression];
            } else {
                layer[expression] = ++fn.cachedIndex;
                return '(i' + layer[expression] + ' = ' + expression + ')';
            }

            // TODO when it is unknown whether if will be executed
            return '(%i = %i || ' + expression + ')';
        },
        visit: function (schema) {
            fn.cached.push({});

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

            fn.cached.pop();
        },
        push: fn
    });

    fn.data.toString = fn.schema.toString = function () {
        return this.join('.').replace(/\.\[/g, '[');
    };

    fn.visit(schema);
    return fn.toFunction();

    //
    function fn(expression) {
        var args = Array.prototype.slice.call(arguments, 1),
            last;

        fn.lines.push(
            expression
                .replace(/%i/g, function(match, index){
                    return 'i';
                })
                .replace(/\$(\d)/g, function(match, index){
                    return '' + args[index - 1];
                })
                .replace(/(%[sd])/g, function(match){
                    if(args.length) {
                        last = args.shift();
                    }

                    return '' + last;
                })
        );

        return fn.push;
    }
};