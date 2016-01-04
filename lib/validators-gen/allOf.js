var validate = require('./../validate');

module.exports = function allOf(schema, fn) {
    if (!schema.hasOwnProperty('allOf')) {
        return;
    }

    fn('if (!(')
        (schema.allOf.map(function(reference){
            return fn.resolve(reference);
        }).join(') || !('))
        ('))')
        (fn.error('allOf'));
};