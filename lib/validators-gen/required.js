module.exports = function (schema, fn) {
    if (!Array.isArray(schema.required)) {
        return;
    }

    schema.required.forEach(function(name){
        fn.data.push(name);
        fn('if (!%s)', fn.data)
            (fn.error('required'))
        fn.data.pop();
    });
};