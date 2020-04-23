vu.builders.Gesture = CT.Class({
	CLASSNAME: "vu.builders.Gesture",
	jointRange: function(gesture, val, side, sub, part, axis, modpart) {
		var person = zero.core.current.person,
			gopts = person.opts.gestures,
			popts = { gestures: gopts },
			constraints = person.body.torso[sub +
				"s"][side].aspects[part + "_" + axis].opts,
			per = this.persist;
		return CT.dom.div([
			axis ? CT.parse.toCaps([part, axis]).join(" ") : CT.parse.capitalize(part),
			CT.dom.range(function(val) {
				CT.log([side, sub, part, axis, ":", val].join(" "));
				modpart[part][axis] = val / 100;
				person.gesture(gesture);
				per(popts);
			}, constraints.min * 100, constraints.max * 100, 100 * (val || 0), 1, "w1")
		], "w1 pr10");
	},
	setJoints: function(gesture, side, sub) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			gopts = person.opts.gestures,
			gesture_opts = gopts[gesture],
			val, modpart, partnames,
			jrange = this.jointRange, jset = this.setJoints;
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
					return jrange(gesture, val[axis], side, sub, part, axis, modpart);
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
			jset(gesture, side, sub);
		}) : CT.dom.button("add", function() {
			zero.core[CT.parse.capitalize(sub)].parts.forEach(function(part) {
				modpart[part] = {};
				Object.keys(zero.base.aspects[sub][part]).forEach(function(dim) {
					modpart[part][dim] = 0;
				});
			});
			jset(gesture, side, sub);
		}));
	},
	setGesture: function(gesture) {
		var jset = this.setJoints, selz = this._.selectors;
		["left", "right"].forEach(function(side) {
			["leg", "arm", "hand"].forEach(function(sub) {
				jset(gesture, side, sub);
			});
		});
		CT.dom.setContent(selz.gestures_button, gesture);
	},
	setDance: function(dname) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			dopts = person.opts.dances,
			per = this.persist;
		selz.steps.update = function() {
			dopts[dname].steps = selz.steps.fields.value();
			per({ dances: dopts });
		};
		vu.core.fieldList(selz.steps, dopts[dname].steps);
		CT.dom.setContent(selz.step, dname);
	},
	loadMain: function() {
		var _ = this._, selz = _.selectors,
			setd = this.setDance, setg = this.setGesture,
			person = zero.core.current.person, per = this.persist,
			gopts = person.opts.gestures, dopts = person.opts.dances,
			curDance, dbutt = CT.dom.button("dance", function() {
				if (person.activeDance)
					person.undance();
				else
					person.dance(curDance);
				dbutt.innerHTML = person.activeDance ? "undance" : "dance";
			});
		CT.dom.setContent(selz.dances_button, dbutt);
		vu.core.fieldList(selz.dances, Object.keys(dopts), null, function(v, i) {
			// generator
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					if (person.activeDance)
						person.undance();
//						dopts[f.value].steps && person.dance(f.value);
					curDance = f.value;
					setd(f.value);
				};
				f.onkeyup = function() {
					if (f.value) {
						dopts[f.value] = dopts[f._trigger];
						delete dopts[f._trigger];
						person.activeDance = f._trigger = f.value;
						per({ dances: dopts });
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
			per({ dances: dopts });
		});
		CT.dom.addContent(selz.dances, [selz.step, "Steps", selz.steps]);
		vu.core.fieldList(selz.gestures, Object.keys(gopts), null, function(v, i) {
			// generator
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					if (person.activeGesture)
						person.ungesture();
					person.gesture(f.value);
					setg(f.value);
				};
				f.onkeyup = function() {
					if (f.value) {
						gopts[f.value] = gopts[f._trigger];
						delete gopts[f._trigger];
						person.activeGesture = f._trigger = f.value;
						per({ gestures: gopts });
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
			per({ gestures: gopts });
		});
	}
}, vu.menu.Body);

vu.builders.gesture = {
	menus: function() {
		vu.builders.gesture = new vu.builders.Gesture({
			main: "gestures",
			topright: "dances",
			impex: ["gestures", "dances"],
			subs: {
				"step": CT.dom.div(null, "right"),
				"steps": CT.dom.div()
			}
		});
	}
};