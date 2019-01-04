CT.require("vu.builders.person");
CT.require("vu.builders.room");

vu.builders.current = {};

vu.builders.init = function() {
	zero.core.util.init();
	zero.core.util.join(vu.builders.person._.raw, vu.builders.person._.joined);
};