/**
* Creates an array containing the numeric code points of each Unicode
* character in the string. While JavaScript uses UCS-2 internally,
* this function will convert a pair of surrogate halves (each of which
* UCS-2 exposes as separate characters) into a single code point,
* matching UTF-16.
* @see `punycode.ucs2.encode`
* @see <https://mathiasbynens.be/notes/javascript-encoding>
* @memberOf punycode.ucs2
* @name decode
* @param {String} string The Unicode input string (UCS-2).
* @returns {Array} The new array of code points.
*/
function ucs2decodeLength(string) {
    var output = [],
        counter = 0,
        length = string.length,
        value,
        extra;

    while (counter < length) {
        value = string.charCodeAt(counter++);
        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // high surrogate, and there is a next character
            extra = string.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
                // unmatched surrogate; only append this code unit, in case the next
                // code unit is the high surrogate of a surrogate pair
                output.push(value);
                counter--;
            }
        } else {
            output.push(value);
        }
    }

    return output.length;
}

function resolve(reference, schemas) {
    if(reference === '#'){
        return 0;
    }

    if(typeof reference !== 'string') {
        return reference;
    }

    var referenceParts = reference.split(/#\/?/),
        uri = referenceParts[0] || '#',
        name = referenceParts[1],
        currentSchema = schemas[uri].schema,
        components = name && name.split('/');

    while (components && components.length > 0) {
        var currentPath = decodeURIComponent(components[0].replace(/~1/g, '/').replace(/~0/g, '~'));
        if (!currentSchema.hasOwnProperty(currentPath)) {
            throw new Error('Schema not found');
        }

        currentSchema = currentSchema[currentPath];
        components.shift();
    }

    schemas['#'] = schemas[uri];
    return currentSchema;
}

module.exports = {
    ucs2decodeLength: ucs2decodeLength,
    resolve: resolve
};