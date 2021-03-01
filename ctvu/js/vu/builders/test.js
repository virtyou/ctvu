vu.builders.test = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			camera: "top",
			voice: "topleft",
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
			new vu.menu.Map({ node: _.selectors.minimap });
		},
		setup: function() {
			var _ = vu.builders.test._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.voice = CT.dom.button("listen for voice commands", function() {
				selz.voice._listening = !selz.voice._listening;
				if (selz.voice._listening) {
					vu.voice.listen();
					selz.voice.innerHTML = "stop listening";
				} else {
					vu.voice.unlisten();
					selz.voice.innerHTML = "listen for voice commands";
				}
			});
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