var validate = require('./../validate');

module.exports = function allOf(schema, fn) {
    if (!schema.hasOwnProperty('allOf')) {
        return;
    }

    fn('if (!(')
        (schema.allOf.map(function(reference){
            return fn.resolve(reference);
        }).join('(%s)) || !('), fn.data)
        ('(%s)))', fn.data)
        (fn.error('allOf'));
};