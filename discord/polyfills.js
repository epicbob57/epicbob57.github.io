console.log_ = console.log;
console.log = function(s){
	console.log_(s);
	var e = document.getElementById("console_log");
    e.insertAdjacentHTML("beforeend", `<p><b>CONSOLE:</b> ${s}</p>`);
    e.scrollTop = e.scrollHeight;
}

if (!Array.prototype.every) {
// Array.prototype.every
Array.prototype.every = function every(callback, scope) {
	for (var array = this, index = 0, length = array.length; index < length; ++index) {
		if (!callback.call(scope || window, array[index], index, array)) {
			break;
		}
	}

	return index === length;
};

}
if (!Array.prototype.filter) {
// Array.prototype.filter
Array.prototype.filter = function filter(callback, scope) {
	for (var array = this, arrayB = [], index = 0, length = array.length, element; index < length; ++index) {
		element = array[index];

		if (callback.call(scope || window, element, index, array)) {
			arrayB.push(element);
		}
	}

	return arrayB;
};

}
if (!Array.prototype.forEach) {
// Array.prototype.forEach
Array.prototype.forEach = function forEach(callback, scope) {
	for (var array = this, index = 0, length = array.length; index < length; ++index) {
		callback.call(scope || window, array[index], index, array);
	}
};

}
if (!Array.prototype.indexOf) {
// Array.prototype.indexOf
Array.prototype.indexOf = function indexOf(searchElement) {
	for (var array = this, index = 0, length = array.length; index < length; ++index) {
		if (array[index] === searchElement) {
			return index;
		}
	}

	return -1;
};

}
if (!Array.prototype.lastIndexOf) {
// Array.prototype.lastIndexOf
Array.prototype.lastIndexOf = function lastIndexOf(searchElement) {
	for (var array = this, index = array.length - 1; index > -1; --index) {
		if (array[index] === searchElement) {
			return index;
		}
	}

	return -1;
};

}
if (!Array.prototype.reduce) {
// Array.prototype.reduce
Array.prototype.reduce = function reduce(callback, initialValue) {
	var array = this, previousValue = initialValue || 0;

	for (var index = 0, length = array.length; index < length; ++index) {
		previousValue = callback.call(window, previousValue, array[index], index, array);
	}

	return previousValue;
};

}
if (typeof Date !== "undefined" && !Date.now) {
// Date.now
Date.now = function now() {
	return new Date().getTime();
};

}
if (!Function.prototype.bind) {
// Function.prototype.bind
Function.prototype.bind = function bind(scope) {
	var
	callback = this,
	prepend = Array.prototype.slice.call(arguments, 1),
	Constructor = function () {},
	bound = function () {
		return callback.apply(
			this instanceof Constructor && scope ? this : scope,
			prepend.concat(Array.prototype.slice.call(arguments, 0))
		);
	};

	Constructor.prototype = bound.prototype = callback.prototype;

	return bound;
};

}
if (typeof Object !== "undefined" && !Object.keys) {
// Object.keys
Object.keys = function keys(object) {
	var buffer = [], key;

	for (key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			buffer.push(key);
		}
	}

	return buffer;
};

}
