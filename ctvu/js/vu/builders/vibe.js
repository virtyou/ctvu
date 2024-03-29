vu.builders.vibe = {
	_: {
		opts: core.config.ctvu.builders.person,
		accessories: core.config.ctvu.builders.accessories,
		selectors: {},
		joined: function(person) {
			zero.core.util.setCurPer(person);
			vu.builders.vibe._.loadVibes();
		},
		loadVibes: function() {
			var _ = vu.builders.vibe._,
				person = zero.core.current.person,
				vopts = person.vibe.opts.vibes;
			vu.core.fieldList(_.selectors.vibes, Object.keys(vopts), null, function(v) {
				// generator
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						person.vibe.update(f.value);
						_.setVibe(person.vibe.current);
					};
					f.onkeyup = function() {
						if (f.value) {
							vopts[f.value] = vopts[f._trigger];
							delete vopts[f._trigger];
							person.vibe.current = f._trigger = f.value;
							vu.builders.vibe.persist({ vibe: vopts });
						} else
							f.value = f._trigger; // meh
					};
				}
				return f;
			}, function(iput) {
				// onadd
				var key = iput.value;
				if (key in vopts) return; // already exists...
				vopts[key] = CT.merge(vopts["default"]);
				setTimeout(function() {
					iput.focus();
				});
			}, function(val) {
				// onremove
				delete vopts[val];
				vu.builders.vibe.persist({ vibe: vopts });
			});
			_.setVibe(person.vibe.current);
		},
		setVibe: function(vibe) {
			var person = zero.core.current.person,
				vopts = person.vibe.opts.vibes;
			CT.dom.setContent(vu.builders.vibe._.selectors.mood, [
				CT.dom.div(vibe, "big"),
				zero.core.Mood.vectors.map(function(sel) {
					return [
						sel,
						CT.dom.range(function(val) {
							CT.log(sel + ": " + val);
							var mood_opts = vopts[vibe] = person.mood.snapshot(),
								mod = {}, popts = { vibe: vopts };
							mod[sel] = mood_opts[sel] = val / 100;
							person.mood.update(mod);
							if (vibe == "default")
								popts.mood = mood_opts;
							vu.builders.vibe.persist(popts);
						}, 0, 100, 100 * (vopts[vibe][sel] || 0), 1, "w1")
					];
				})
			]);
		},
		setup: function() {
			var _ = vu.builders.vibe._, selz = _.selectors, vsel,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.mood = CT.dom.div();
			selz.vibes = CT.dom.div();
			selz.voice = CT.dom.span();
			selz.voice.update = function() {
				CT.dom.setContent(selz.voice,
					vsel = CT.dom.select(vu.lang.voices(selz.lang.value),
						null, null, popts.voice, null, function() {
							var person = zero.core.current.person;
							if (person) {
								person.voice = vsel.value;
								vu.builders.vibe.persist({ voice: person.voice });
							}
						}));
			};
			selz.lang = CT.dom.select(vu.lang.langs(),
				null, null, "All", null, selz.voice.update);
			selz.voice.update();
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.vibe._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menu: function() {
		var cur = zero.core.current, _ = vu.builders.vibe._,
			selz = _.selectors, blurs = core.config.ctvu.blurs;
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				CT.dom.span("Lang"),
				CT.dom.pad(),
				selz.lang,
				CT.dom.span("Voice"),
				CT.dom.pad(),
				selz.voice,
				CT.dom.smartField(function(val) {
					cur.person.say(val);
					return "clear";
				}, "w1 block mt5", null, null, null, blurs.talk)
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.link("import/export", function() {
					vu.core.impex(cur.person.vibe.opts.vibes, function(val) {
						vu.builders.vibe.persist({ vibe: val });
					});
				}, null, "right"),
				"Vibes",
				selz.vibes
			], "padded bordered round mb5"),
			CT.dom.div([
				selz.mood
			], "padded bordered round centered")
		];
	}
};