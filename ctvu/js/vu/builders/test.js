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
			var _ = vu.builders.test._, btrigz = {},
				person = vu.builders.current.person,
				brain = person.brain,
				trigz = person.opts.responses,
				tnode = function(trig) {
					return CT.dom.div(trig, "bordered padded margined inline-block hoverglow", null, {
						onclick: function() {
							person.respond(trig);
							Object.keys(brain.triggers).forEach(function(t) {
								if (!(t in trigz) && !(t in btrigz)) {
									btrigz[t] = true;
									container.appendChild(tnode(t));
								}
							});
						}
					});
				}, container = CT.dom.div(Object.keys(trigz).map(tnode));
			CT.dom.setContent(_.selectors.triggers, container);
		},
		setGestures: function() {
			var _ = vu.builders.test._,
				person = vu.builders.current.person,
				gestz = person.opts.gestures;
			CT.dom.setContent(_.selectors.gestures, Object.keys(gestz).map(function(gest) {
				return CT.dom.div(gest, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						person.gesture(gest);
					}
				});
			}));
		},
		setup: function() {
			var _ = vu.builders.test._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
			selz.camera = CT.dom.div(null, "centered");
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
		}
	},
	modal: function(section) {
		var _ = vu.builders.test._, selz = _.selectors;
		return new CT.modal.Modal({
			center: false,
			noClose: true,
			transition: "slide",
			slide: { origin: _.menus[section] },
			content: [
				CT.parse.capitalize(section),
				selz[section]
			],
			className: "abs above padded bordered round pointer gmenu " + section
		});
	},
	menus: function() {
		var section, _ = vu.builders.test._;
		_.setup();
		for (section in _.menus)
			this.modal(section).show("ctmain");
	}
};