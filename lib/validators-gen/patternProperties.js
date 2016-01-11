module.exports = function properties(schema, fn) {
    var hasAdditionalProperties = schema.hasOwnProperty('additionalProperties') && schema.additionalProperties !== true,
        hasPatternProperties = schema.hasOwnProperty('patternProperties');

    if (!hasAdditionalProperties && !hasPatternProperties) {
        return;
    }

    // TODO property, matched to dynamic
    fn('for (var property in %s) {', fn.data);
    if (hasAdditionalProperties && hasPatternProperties) {
        fn(fn.cache('false'));
    }

    if (hasPatternProperties) {
        for (var propertyKey in schema.patternProperties) {
            var propertySchema = schema.patternProperties[propertyKey];

            fn('if (%s.test(%s[property])) {', new RegExp(propertyKey), fn.data);
            if (hasAdditionalProperties) {
                fn(fn.cache('false') + ' = true;');
            }

            fn.data.push('[property]');
            fn.visit(propertySchema);
            fn.data.pop();
            fn('}');

            // TODO fn.schema
            fn('if(' +  (hasAdditionalProperties ? fn.cache('false') + ' || ' : '') + ' %s[property]) continue;', fn.schema);

            visitAdditionalProperties();
        }
    } else {
        fn('if(%s[property]) continue;', fn.schema);
        visitAdditionalProperties();
    }

    fn('}');

    //
    function visitAdditionalProperties() {
        if (schema.additionalProperties === false) {
            fn(fn.error('additionalProperties'));
        } else if (schema.additionalProperties) {
            fn.data.push('[property]');
            fn.visit(schema.additionalProperties);
            fn.data.pop();
        }
    }
};