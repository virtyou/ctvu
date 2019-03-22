vu.builders.gesture = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		arms: [],
		legs: [],
		menus: {
			camera: "top",
			gestures: "topleft",
			dances: "topright",
			left_leg: "right",
			right_leg: "left",
			left_arm: "right",
			right_arm: "left",
			left_hand: "bottomright",
			right_hand: "bottomleft"
		},
		joined: function(person) {
			vu.builders.current.person = person;
			vu.builders.gesture._.initCamera();
			if (!Object.keys(person.opts.gestures).length)
				vu.builders.gesture._.initGesture();
			else
				vu.builders.gesture._.loadGestures();
		},
		swapLimbs: function(ons, offs) {
			var _ = vu.builders.gesture._;
			_[ons].forEach(function(modal) {
				modal.show("ctmain");
			});
			_[offs].forEach(function(modal) {
				modal.hide();
			});
		},
		initCamera: function() {
			zero.core.camera.unfollow();
			var _ = vu.builders.gesture._, butt = CT.dom.button("far", function() {
				if (butt.innerHTML == "far") {
					butt.innerHTML = "near";
					zero.core.camera.move({ z: 280 });
					_.swapLimbs("legs", "arms");
				} else {
					butt.innerHTML = "far";
					zero.core.camera.move({ z: 120 });
					_.swapLimbs("arms", "legs");
				}
			});
			CT.dom.setContent(_.selectors.camera, butt);
		},
		initGesture: function() {
			var _ = vu.builders.gesture._,
				cur = vu.builders.current;
			vu.core.prompt({
				prompt: "what's the new gesture?",
				cb: function(val) {
					val = vu.core.jlo(val);
					cur.person.opts.gestures[val] = {};
					cur.person.activeGesture = val;
					vu.builders.gesture.persist({ gestures: cur.person.opts.gestures });
					_.loadGestures();
				}
			});
		},
		setDance: function(dname) {
			var _ = vu.builders.gesture._, selz = _.selectors,
				person = vu.builders.current.person,
				dopts = person.opts.dances;

			selz.steps.update = function() {
				dopts[dname].steps = selz.steps.fields.value();
				vu.builders.gesture.persist({ dances: dopts });
			};
			vu.core.fieldList(selz.steps, dopts[dname].steps);
			CT.dom.setContent(selz.step, dname);
		},
		loadGestures: function() {
			var _ = vu.builders.gesture._,
				person = vu.builders.current.person,
				gopts = person.opts.gestures,
				dopts = person.opts.dances,
				curDance, dbutt = CT.dom.button("dance", function() {
					if (person.activeDance)
						person.undance();
					else
						person.dance(curDance);
					dbutt.innerHTML = person.activeDance ? "undance" : "dance";
				});
			CT.dom.setContent(_.selectors.dances_button, dbutt);
			vu.core.fieldList(_.selectors.dances, Object.keys(dopts), null, function(v, i) {
				// generator
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						if (person.activeDance)
							person.undance();
//						dopts[f.value].steps && person.dance(f.value);
						curDance = f.value;
						_.setDance(f.value);
					};
					f.onkeyup = function() {
						if (f.value) {
							dopts[f.value] = dopts[f._trigger];
							delete dopts[f._trigger];
							person.activeDance = f._trigger = f.value;
							vu.builders.gesture.persist({ dances: dopts });
						} else
							f.value = f._trigger; // meh
					};
					!i && setTimeout(f.onfocus); // select 1st
				}
				return f;
			}, function(iput) {
				// onadd
				var key = iput.value;
				if (key in dopts) return; // already exists...
				dopts[key] = {};
				setTimeout(function() {
					iput.focus();
				});
			}, function(val) {
				// onremove
				delete dopts[val];
				vu.builders.gesture.persist({ dances: dopts });
			});
			CT.dom.addContent(_.selectors.dances, [_.selectors.step, "Steps", _.selectors.steps]);
			vu.core.fieldList(_.selectors.gestures, Object.keys(gopts), null, function(v, i) {
				// generator
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						if (person.activeGesture)
							person.ungesture();
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
					!i && setTimeout(f.onfocus); // select 1st
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
		},
		jointRange: function(gesture, val, side, sub, part, axis, modpart) {
			var person = vu.builders.current.person,
				gopts = person.opts.gestures,
				gesture_opts = gopts[gesture],
				popts = { gestures: gopts },
				constraints = person.body.torso[sub + "s"][side].aspects[part + "_" + axis].opts;
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
				val, modpart, partnames;
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
						return _.jointRange(gesture, val[axis], side, sub, part, axis, modpart);
					})
				], "jblock pr10");
			}) : "");
			CT.dom.setContent(selz[side + "_" + sub + "_button"], partnames.length ? CT.dom.button("clear", function() {
				if (!confirm("really?"))
					return;
				person.ungesture(null, side, sub);
				delete gesture_opts[side][sub];
				if (!Object.keys(gesture_opts[side]).length)
					delete gesture_opts[side];
				_.setJoints(gesture, side, sub);
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
				["leg", "arm", "hand"].forEach(function(sub) {
					vu.builders.gesture._.setJoints(gesture, side, sub);
				});
			});
			CT.dom.setContent(vu.builders.gesture._.selectors.gestures_button, gesture);
		},
		setup: function() {
			var _ = vu.builders.gesture._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.steps = CT.dom.div();
			selz.dances = CT.dom.div();
			selz.gestures = CT.dom.div();
			selz.step = CT.dom.div(null, "right");
			selz.camera = CT.dom.div(null, "centered");
			selz.dances_button = CT.dom.div(null, "right");
			selz.gestures_button = CT.dom.div(null, "right"); // active gesture label
			["left", "right"].forEach(function(side) {
				["leg", "arm", "hand"].forEach(function(sub) {
					selz[side + "_" + sub] = CT.dom.div();
					selz[side + "_" + sub + "_button"] = CT.dom.div(null, "right");
				});
			});
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
		var modal, section, _ = vu.builders.gesture._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			modal = vu.core.menu(section, _.menus[section], selz[section], [
				selz[section + "_button"],
				CT.parse.key2title(section)
			]);
			if (section.endsWith("arm"))
				_.arms.push(modal);
			if (section.endsWith("leg"))
				_.legs.push(modal);
			else
				modal.show("ctmain");
		}
	}
};