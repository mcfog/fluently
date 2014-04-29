var expect = require('chai').expect;
var fluently = require('../');

var uniq = (function() {
	var counter = 0;
	function random() {
		return Math.random().toString(36).slice(2);
	}

	return function() {
		return 'uniq_' + random() + '_' + counter++;
	};
})();


describe("constructor & flu.getTarget", function() {
	it("new fluently(obj) works", function() {
		var obj = {};
		var flu = new fluently(obj);

		expect(flu.getTarget()).to.equal(obj);
	});

	it("fluently(obj) works", function() {
		var obj = {};
		var flu = fluently(obj);

		expect(flu.getTarget()).to.equal(obj);
	});

	it("fluently.call(obj) works", function() {
		var obj = {};
		var flu = fluently.call(obj);

		expect(flu.getTarget()).to.equal(obj);
	});

	it("fluently.call(obj, obj2) obj wins", function() {
		var obj = {};
		var flu = fluently.call(obj, {});

		expect(flu.getTarget()).to.equal(obj);
	});

	it("fluently() works", function() {
		var flu = fluently();

		expect(JSON.stringify(flu.getTarget())).to.equal('{}');
	});
});


describe("mount", function() {
	var flu, obj;

	beforeEach(function() {
		obj = {};
		flu = fluently(obj);
	});

	it("mount() works", function() {

		//chainable api test
		expect(flu.mount()).to.equal(flu);

		expect(obj._fluently_).to.equal(flu);
	});

	it("mount('name') works", function() {
		var name = uniq();

		//chainable api test
		expect(flu.mount(name)).to.equal(flu);

		expect(obj[name]).to.equal(flu);
	});
});

describe("define", function() {
	var flu, obj, key, value;

	beforeEach(function() {
		obj = {};
		flu = fluently(obj);
		key = uniq();
		value = {};
	});

	it("define(key, value) works", function() {
		//chainable api test
		expect(flu.define(key, value)).to.equal(flu);

		expect(obj[key]).to.equal(value);
	});

	it("defineObj({key: value}) works", function() {
		var defObj = {};
		defObj[key] = value;

		//chainable api test
		expect(flu.defineObj(defObj)).to.equal(flu);

		expect(obj[key]).to.equal(value);
	});

	it("redefine panics", function() {
		flu.define(key, value);
		expect(function() {
			flu.define(key, value);
		}).to.throw(Error);
	});
});


describe("override", function() {
	var flu, obj, key, value;

	beforeEach(function() {
		obj = {};
		flu = fluently(obj);
		key = uniq();
		value = {};
		obj[key] = null;
	});

	it("override(key, value) works", function() {
		//chainable api test
		expect(flu.override(key, value)).to.equal(flu);

		expect(obj[key]).to.equal(value);
	});

	it("overrideObj({key: value}) works", function() {
		var defObj = {};
		defObj[key] = value;

		//chainable api test
		expect(flu.overrideObj(defObj)).to.equal(flu);

		expect(obj[key]).to.equal(value);
	});

	it("override again works", function() {
		flu
			.override(key, null)
			.override(key, value);
		expect(obj[key]).to.equal(value);
	});
});


describe("void", function() {
	it("works", function() {
		var passed = false;
		var obj = {
			func: function() {
				passed = true;
			}
		};
		var flu = fluently(obj);
		expect(flu.void('func')).to.equal(flu);
		expect(obj.func()).to.equal(obj);
		expect(passed).to.be.true;
	});
});


describe("setter", function() {
	var key, setterKey, obj, value, flu;

	beforeEach(function() {
		key = uniq();
		setterKey = uniq();

		obj = {};
		value = {};
		flu = fluently(obj);
	});

	it("works", function() {
		expect(flu.setter(key, setterKey)).to.equal(flu);
		expect(obj[setterKey](value)).to.equal(obj);
		expect(obj[key]).to.equal(value);
	});

	it("setterObj works", function() {
		var setterObj = {};
		setterObj[key] = setterKey;

		expect(flu.setterObj(setterObj)).to.equal(flu);
		expect(obj[setterKey](value)).to.equal(obj);
		expect(obj[key]).to.equal(value);
	});
});

describe("tapper", function() {
	it("works", function() {
		var obj = {};
		var flu = fluently(obj);
		var key = uniq();

		var passed = false;

		expect(flu.tapper(key)).to.equal(flu);

		expect(obj[key](function(it) {
			expect(it).to.equal(obj);
			passed = true;

			return false;
		})).to.equal(obj);

		expect(passed).to.be.true;
	});
});

describe("tap", function() {
	it("works", function() {
		var obj = {};
		var flu = fluently(obj);

		var passed = false;

		expect(flu.tap(function(it) {
			expect(it).to.equal(flu);
			passed = true;

			return false;
		})).to.equal(flu);

		expect(passed).to.be.true;
	});
});

describe("block", function() {
	it("works", function() {
		var obj = {};
		var flu = fluently(obj);
		var block = {};
		var open = uniq();
		var close = uniq();

		var passed = false;

		expect(flu.block(open, close, block)).to.equal(flu);

		expect(obj[open]).to.equal(block);
		expect(block[close]).to.equal(obj);
	});
});
