vu.builders.test = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			camera: "top",
			minimap: "topright",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		joined: function(person) {
			var _ = vu.builders.test._;
			zero.core.current.person = person;
			vu.controls.initCamera(_.selectors.camera);
			vu.controls.setTriggers(_.selectors.triggers);
			vu.controls.setGestures(_.selectors.gestures);
		},
		setup: function() {
			var _ = vu.builders.test._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.camera = CT.dom.div(null, "centered");
			selz.minimap = CT.dom.div();
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
		}
	},
	menus: function() {
		var section, _ = vu.builders.test._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};