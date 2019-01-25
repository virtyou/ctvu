vu.builders.vibe = {
	_: {
		opts: core.config.ctvu.builders.person,
		accessories: core.config.ctvu.builders.accessories,
		selectors: {},
		joined: function(person) {
			vu.builders.current.person = person;
			CT.dom.setContent(vu.builders.vibe._.selectors.mood, zero.core.Mood.vectors.map(function(sel) {
				return [
					sel,
					CT.dom.range(function(val) {
						CT.log(sel + ": " + val);
						var mod = {},
							mood_opts = person.mood.snapshot();
						mod[sel] = mood_opts[sel] = val / 100;
						person.mood.update(mod);
						vu.builders.vibe.persist({ mood: mood_opts });
					}, 0, 100, 100 * (person.mood.opts[sel] || 0), 1, "w1")
				];
			}));
			zero.core.camera.unfollow();
		},
		setup: function() {
			var _ = vu.builders.vibe._,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
			_.selectors.mood = CT.dom.div();
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
		var cur = vu.builders.current, _ = vu.builders.vibe._, selz = _.selectors;
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				CT.dom.checkboxAndLabel("moody", null, null, null, null, function(cbox) {
					cur.person.opts.moody = cbox.checked;
				}),
				selz.mood
			], "padded bordered round centered")
		];
	}
};