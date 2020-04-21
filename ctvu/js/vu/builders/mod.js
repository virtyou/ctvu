vu.builders.mod = {
	_: {
		setup: function() {
			var _ = vu.builders.mod._;
			_.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(_.opts);
		}
	},
	menus: function() {
		vu.builders.mod._.setup();
	}
};