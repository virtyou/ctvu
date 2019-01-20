vu.builders.current = {};

vu.builders.core = {
	init: function() {
		zero.core.util.init();
		zero.core.util.join(vu.builders.person._.raw, vu.builders.person._.joined);
	}
};