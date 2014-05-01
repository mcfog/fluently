"use strict";

var has = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

function isObj(obj) {
	return obj !== null && typeof obj !== 'undefined';
}
function create(obj) {
	return new Fluently(obj);
}
function tap(cb) {
	/* jshint validthis:true */
	cb(this);

	return this;
}
function iteratorMethod(method) {
	return function(obj) {
		var flu = this;
		Object.keys(obj).forEach(function(key) {
			flu[method](key, obj[key]);
		});

		return this;
	};
}
function once(fn) {
	var runned = false, result;
	return function() {
		if(runned) {
			return result;
		}

		runned = true;
		return result = fn.apply(this, arguments);
	};
}

function Fluently(obj) {
	switch(true) {
	case this instanceof Fluently:

		//var builder = new Fluently(target);
		this._target = obj;

		break;

	case isObj(this):
		//var builder = Fluently.call(target) or target.xxx = Fluently, target.xxx()
		return create(this);

	case isObj(obj):
		//var builder = Fluently(target)
		return create(obj);

	default:
		//var builder = Fluently()
		return create({});
	}
}

Fluently.prototype = Object.freeze({
	"mount": function(name) {
		name = name || "_fluently_";

		Object.defineProperty(this._target, name, {
			configurable: false,
			enumerable: false,
			value: this,
			writable: false
		});

		return this;
	},

	"define": function(name, value) {
		if(this._target[name] !== undefined) {
			throw new Error('Fluently: define something twice');
		}
		this._target[name] = value;

		return this;
	},
	"getter": function(name, getter) {
		if(this._target[name] !== undefined) {
			throw new Error('Fluently: define something twice');
		}

		Object.defineProperty(this._target, name, {
			get: getter
		});

		return this;
	},
	"onceGetter": function(name, getter) {
		return this.getter(name, once(getter));
	},
	"defineObj": iteratorMethod('define'),

	"override": function(name, value) {
		this._target[name] = value;

		return this;
	},
	"overrideObj": iteratorMethod('override'),

	"void": function(name) {
		var method = this._target[name];

		return this.override(name, function() {
			method.apply(this, arguments);

			return this;
		});
	},
	"setter": function(name, setterName) {
		if(!setterName) {
			setterName = "set" + name[0].toUpperCase() + name.slice(1);
		}

		return this.define(setterName, function(value) {
			this[name] = value;

			return this;
		});
	},
	"setterObj": iteratorMethod('setter'),

	"tapper": function(name) {
		return this.define(name, tap);
	},

	"block": function(begin, end, block) {
		create(block).define(end, this._target);
		this.define(begin, block);

		return this;
	},

	"getterBlock": function(begin, end, getter) {
		var self = this;

		this.onceGetter(begin, function() {
			var block = getter.call(this);
			create(block).define(end, self._target);

			return block;
		});

		return this;
	},

	"tap": tap,
	"getTarget": function() {
		return this._target;
	}
});

module.exports = Fluently;
