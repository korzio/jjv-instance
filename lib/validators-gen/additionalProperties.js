module.exports = function properties(schema, fn) {
    if (!schema.hasOwnProperty('patternProperties')) {
        return;
    }

    // TODO property to dynamic
    fn('for (var property in %s) {', fn.data)
    for (var propertyKey in schema.patternProperties) {
        var propertySchema = schema.patternProperties[propertyKey];

        fn('if (%s.test(%s[property])) {', new RegExp(propertyKey), fn.data);
        fn.data.push('[property]');
        fn.visit(propertySchema);
        fn.data.pop();
        fn('}');
    }
    fn('}');

    return;

    if (prop && !Array.isArray(prop)) {/*r-condition*/
        if (matched)
            props.splice(i, 1);
    }

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
};