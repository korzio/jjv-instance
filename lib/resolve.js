module.exports = function resolveURI(env, schemaStack, uri) {
	var curschema, components, hashIdx, name;

	hashIdx = uri.indexOf('#');
	if (hashIdx === -1) {
		if (!env.schema.hasOwnProperty(uri)) {
			uri = schemaStack.slice(0, -1).map(function(stack){ return stack.id }).join('') + uri;
		}

		if (!env.schema.hasOwnProperty(uri)) {
			return null;
		}

		return [env.schema[uri]];
	}

	if (hashIdx > 0) {
		name = uri.substr(0, hashIdx);
		uri = uri.substr(hashIdx + 1);
		if (!env.schema.hasOwnProperty(name)) {
			if (schemaStack && schemaStack[0].id === name) {
				schemaStack = [schemaStack[0]];
			}
			else {
				return null;
			}
		} else {
			schemaStack = [env.schema[name]];
		}
	} else {
		if (!schemaStack) {
			return null;
		}

		uri = uri.substr(1);
	}

	if (uri === '') {
		return [schemaStack[0]];
	}

	if (uri.charAt(0) === '/') {
		uri = uri.substr(1);
		curschema = schemaStack[0];
		components = uri.split('/');
		while (components.length > 0) {
			var currentPath = decodeURIComponent(components[0].replace(/~1/g, '/').replace(/~0/g, '~'));
			if (!curschema.hasOwnProperty(currentPath)) {
				return null;
			}

			curschema = curschema[currentPath];
			schemaStack.push(curschema);
			components.shift();
		}

		return schemaStack;
	} else { // FIX: should look for subschemas whose id matches uri
		return null;
	}
};