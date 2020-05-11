vu.builders.scene = {
	_: {
		selectors: {},
		menus: {},
		setup: function() {
			var skey = location.hash.slice(1),
				_ = vu.builders.scene._;
			if (!skey)
				return alert("no scene specified!");
			CT.db.one(skey, function(scene) {
				
			}, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};