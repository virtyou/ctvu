vu.builders.gesture = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		joined: function(person) {
			vu.builders.current.person = person;
			zero.core.camera.unfollow();
			vu.builders.gesture._.loadGestures();
		},
		loadGestures: function() {
			var _ = vu.builders.gesture._,
				person = vu.builders.current.person,
				gopts = person.opts.gestures;
			vu.core.fieldList(_.selectors.gestures, Object.keys(gopts), null, function(v) {
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
		setGesture: function(gesture) {
			var person = vu.builders.current.person,
				gopts = person.opts.gestures;

			/*
			CT.dom.setContent(vu.builders.gesture._.selectors.mood, [
				CT.dom.div(gesture, "big"),
				zero.core.Mood.vectors.map(function(sel) {
					return [
						sel,
						CT.dom.range(function(val) {
							CT.log(sel + ": " + val);
							var mood_opts = gopts[gesture] = person.mood.snapshot(),
								mod = {}, popts = { gestures: gopts };
							mod[sel] = mood_opts[sel] = val / 100;
							person.mood.update(mod);
							vu.builders.gesture.persist(popts);
						}, 0, 100, 100 * (gopts[gesture][sel] || 0), 1, "w1")
					];
				})
			]);
			*/
		},
		setup: function() {
			var _ = vu.builders.gesture._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
			selz.gestures = CT.dom.div();
			selz.joints = CT.dom.div();
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
	menu: function() {
		var cur = vu.builders.current, _ = vu.builders.gesture._,
			selz = _.selectors, blurs = core.config.ctvu.blurs;
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				"Gestures",
				selz.gestures
			], "padded bordered round mb5"),
			CT.dom.div([
				selz.joints
			], "padded bordered round centered")
		];
	}
};