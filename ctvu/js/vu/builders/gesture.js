vu.builders.gesture = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			yours: "topleft",
			globals: "topright",
			left_arm: "left",
			right_arm: "right",
			left_hand: "bottomleft",
			right_hand: "bottomright"
		},
		joined: function(person) {
			vu.builders.current.person = person;
			zero.core.camera.unfollow();
			vu.builders.gesture._.loadGestures();
		},
		loadGestures: function() {
			var _ = vu.builders.gesture._,
				person = vu.builders.current.person,
				gopts = person.opts.gestures;
			vu.core.fieldList(_.selectors.yours, Object.keys(gopts), null, function(v) {
				// generator
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						person.gesture(f.value);
						_.setGesture(f.value);
					};
					f.onkeyup = function() {
						if (f.value) {
							gopts[f.value] = gopts[f._trigger];
							delete gopts[f._trigger];
							person.activeGesture = f._trigger = f.value;
							vu.builders.gesture.persist({ gestures: gopts });
						} else
							f.value = f._trigger; // meh
					};
				}
				return f;
			}, function(iput) {
				// onadd
				var key = iput.value;
				if (key in gopts) return; // already exists...
				gopts[key] = {};
				setTimeout(function() {
					iput.focus();
				});
			}, function(val) {
				// onremove
				delete gopts[val];
				vu.builders.gesture.persist({ gestures: gopts });
			});
			_.setGesture(person.activeGesture);
		},
		jointRange: function(gesture, val, side, sub, part, modpart, axis) {
			var person = vu.builders.current.person,
				gopts = person.opts.gestures,
				gesture_opts = gopts[gesture],
				popts = { gestures: gopts },
				constraints = zero.base.aspects[sub][part][axis];
			return CT.dom.div([
				axis ? CT.parse.toCaps([part, axis]).join(" ") : CT.parse.capitalize(part),
				CT.dom.range(function(val) {
					CT.log([side, sub, part, axis, ":", val].join(" "));
					modpart[part][axis] = val / 100;
					person.gesture(gesture);
					vu.builders.gesture.persist(popts);
				}, constraints.min * 100, constraints.max * 100, 100 * (val || 0), 1, "w1")
			], "w1 pr10");
		},
		setJoints: function(gesture, side, sub) {
			var _ = vu.builders.gesture._, selz = _.selectors,
				person = vu.builders.current.person,
				gopts = person.opts.gestures,
				gesture_opts = gopts[gesture],
				jointRange = _.jointRange,
				jmap = _.jmap, val, modpart, partnames;
			if (!gesture_opts)
				gesture_opts = gopts[gesture] = {};
			if (!gesture_opts[side])
				gesture_opts[side] = {};
			if (!gesture_opts[side][sub])
				gesture_opts[side][sub] = {};
			modpart = gesture_opts[side][sub]; // such as hand or arm
			partnames = Object.keys(modpart);
			CT.dom.setContent(selz[side + "_" + sub], partnames.length ? partnames.map(function(part) {
				val = modpart[part];
				return CT.dom.div([
					Object.keys(val).map(function(axis) {
						return jointRange(gesture, val[axis], side, sub, part, modpart, axis);
					})
				], "jblock pr10");
			}) : CT.dom.button("add", function() {
				zero.core[CT.parse.capitalize(sub)].parts.forEach(function(part) {
					modpart[part] = {};
					Object.keys(zero.base.aspects[sub][part]).forEach(function(dim) {
						modpart[part][dim] = 0;
					});
				});
				_.setJoints(gesture, side, sub);
			}));
		},
		setGesture: function(gesture) {
			["left", "right"].forEach(function(side) {
				["arm", "hand"].forEach(function(sub) {
					vu.builders.gesture._.setJoints(gesture, side, sub);
				});
			});
		},
		setup: function() {
			var _ = vu.builders.gesture._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
			selz.yours = CT.dom.div();
			selz.globals = CT.dom.div();
			selz.left_arm = CT.dom.div();
			selz.right_arm = CT.dom.div();
			selz.left_hand = CT.dom.div();
			selz.right_hand = CT.dom.div();
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.gesture._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menus: function() {
		var cur = vu.builders.current, _ = vu.builders.gesture._,
			selz = _.selectors, blurs = core.config.ctvu.blurs,
			main = CT.dom.id("ctmain");
		_.setup();

		for (var section in _.menus) {
			(new CT.modal.Modal({
				center: false,
				noClose: true,
				transition: "slide",
				slide: { origin: _.menus[section] },
				content: [
					CT.parse.key2title(section),
					selz[section]
				],
				className: "abs above padded bordered round pointer gmenu " + section
			})).show(main);
		}
	}
};