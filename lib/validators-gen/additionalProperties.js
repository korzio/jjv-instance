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
};