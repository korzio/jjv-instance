module.exports = function properties(schema, fn) {
    if(!schema.hasOwnProperty('properties')) {
        return;
    }

    for(var propertyKey in schema.properties) {
        var propertySchema = schema.properties[propertyKey];
        if(!Object.keys(propertySchema).length) {
            continue;
        }

        fn.data.push(propertyKey);
        if(!schema.required || !~schema.required.indexOf(propertyKey)) {
            fn('if (%s)', fn.data);
        }
        fn.visit(propertySchema);
        fn.data.pop();
    }
};