vu.builders.test = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			camera: "top",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		joined: function(person) {
			vu.builders.current.person = person;
			vu.builders.test._.initCamera();
			vu.builders.test._.setTriggers();
			vu.builders.test._.setGestures();
		},
		initCamera: function() {
			zero.core.camera.unfollow();
			var _ = vu.builders.test._, butt = CT.dom.button("far", function() {
				if (butt.innerHTML == "far") {
					butt.innerHTML = "near";
					zero.core.camera.move({ z: 280 });
				} else {
					butt.innerHTML = "far";
					zero.core.camera.move({ z: 120 });
				}
			});
			CT.dom.setContent(_.selectors.camera, butt);
		},
		setTriggers: function() {
			var _ = vu.builders.test._,
				person = vu.builders.current.person,
				responses = person.opts.responses,
				triggers = person.brain.triggers,
				trigz = CT.data.uniquify(Object.keys(responses).concat(Object.keys(triggers)));
			CT.dom.setContent(_.selectors.triggers, trigz.map(function(trig) {
				return CT.dom.div(trig, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						person.respond(trig);
						_.setTriggers();
					}
				});
			}));
		},
		setGestures: function() {
			var _ = vu.builders.test._,
				person = vu.builders.current.person,
				gestz = person.opts.gestures,
				dances = person.opts.dances;
			CT.dom.setContent(_.selectors.gestures, [
				["ungesture"].concat(Object.keys(gestz)).map(function(gest, i) {
					return CT.dom.div(gest, "bordered padded margined inline-block hoverglow", null, {
						onclick: function() {
							i ? person.gesture(gest) : person.ungesture();
						}
					});
				}),
				"Dances",
				["undance"].concat(Object.keys(dances)).map(function(dance, i) {
					return CT.dom.div(dance, "bordered padded margined inline-block hoverglow", null, {
						onclick: function() {
							i ? person.dance(dance) : person.undance();
						}
					});
				})
			]);
		},
		setup: function() {
			var _ = vu.builders.test._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.camera = CT.dom.div(null, "centered");
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