vu.builders.tweak = {
	_: {
		opts: core.config.ctvu.builders.person,
		accessories: core.config.ctvu.builders.accessories,
		selectors: {},
		joined: function(_person) {
			var person = vu.builders.current.person = _person,
				_ = vu.builders.tweak._, popts = _.opts,
				has_menu = false;
			for (var c in popts.colors) {
				var comps = c.split(".");
				_.target = person;
				comps.forEach(function(comp) {
					_.target = _.target[comp];
				});
				_.target.material.color = vu.core.hex2rgb(popts.colors[c]);
			}
			_.target = person.body;

			zero.core.click.register(_.target, function() {
				if (has_menu) return true;
				person.say("skin");
				_.target = person.body;
				CT.dom.setContent(_.selectors.colorLabel, "skin");
			});
			["teeth", "tongue", "teeth_top"].map(function(p) {
				var pthing = person.head[p],
					part = p.replace("_", " ");
				zero.core.click.register(pthing, function() {
					if (has_menu) return true;
					person.say(part);
					_.target = pthing;
					CT.dom.setContent(_.selectors.colorLabel, part);
				});
			});
			["L", "R"].map(function(part) {
				var pthing = person.head["eyeGroup" + part]["eye" + part],
					pname = ((part == "L") ? "left" : "right") + " eye";
				zero.core.click.register(pthing, function() {
					if (has_menu) return true;
					person.say(pname);
					_.target = pthing;
					CT.dom.setContent(_.selectors.colorLabel, pname);
				});
			});
			var registerHair = function() {
				zero.core.click.register(person.head.hair, function() {
					if (has_menu) return true;
					has_menu = true;
					var m = new zero.core.Menu({
						items: Object.values(vu.storage.get("hair")),
						onselect: function(hopts) {
							CT.log(hopts.name);
							m.close();
							person.head.remove("hair");
							person.head.attach(hopts, registerHair, true);
							has_menu = false;
						}
					});
				});
			};
			if (core.config.ctvu.storage.mode == "remote")
				registerHair(); // local disabled for now (must add hair alternatives 1st)

			// moods
			CT.dom.setContent(_.selectors.mood, zero.core.Mood.vectors.map(function(sel) {
				return [
					sel,
					CT.dom.range(function(val) {
						CT.log(sel + ": " + val);
						var mod = {},
							mood_opts = person.mood.snapshot();
						mod[sel] = mood_opts[sel] = val / 100;
						person.mood.update(mod);
						vu.builders.tweak.persist({ mood: mood_opts });
					}, 0, 100, 100 * (person.mood.opts[sel] || 0), 1, "w1")
				];
			}));
			zero.core.camera.unfollow();
		},
		setColor: function(target, color) {
			target.material.color = vu.core.hex2rgb(color);
			if (core.config.ctvu.storage.mode == "local") {
				vu.builders.tweak._.opts.colors[target.path] = color;
				vu.builders.tweak.persist();
			} else { // remote
				color = parseInt(color.slice(1), 16);
				var bod = vu.builders.current.person.body;
				if (bod.head.opts.key) // parts tree
					vu.storage.setMaterial(target.opts.key, { color: color });
				else { // template
					var opts = {}, tn = target.name;
					opts[(tn == "body") ? "color" : (tn + "_color")] = color;
					vu.storage.setOpts(bod.opts.key, opts);
				}
			}
		},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.tweak._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts, accz = _.accessories,
				persist = vu.builders.tweak.persist;

			var bt = popts.body.template, template = bt ? bt.split(".").pop() : popts.name,
				rawp = _.raw = zero.core.util.person(vu.core.bgen(popts.body),
					popts.name || "you", null, popts, popts.body),
				cindicator = selz.colorLabel = CT.dom.span("Skin", "bold"),
				bcolor = rawp.body.material.color,
				scolor = (typeof bcolor == "string") ? bcolor : "#" + bcolor.toString(16);
			var cselector = selz.color = vu.core.color("Color Selector", scolor, function() {
				_.setColor(_.target, cselector.value);
			});

			var avz = core.config.ctvu.loaders.avatars;
			var pselector = selz.character = CT.dom.select(avz.map(function(item) {
				return item.split(".").pop();
			}), avz, null, bt.slice(bt.indexOf(".") + 1), null, function() {
				if (vu.builders.current.person) {
					persist({ template: "templates." + pselector.value }, "body");
					location = location; // hack! do something smarter...
				}
			});
			var vselector = selz.voice = CT.dom.select(["Joanna", "Justin", "Ivy",
				"Joey", "Kendra", "Matthew", "Kimberly", "Salli"],
				null, null, popts.voice, null, function() {
					var person = vu.builders.current.person;
					if (person) {
						person.voice = vselector.value;
						persist({ voice: person.voice });
					}
				});
			selz.accessories = accz[template].map(function(acc) {
				return CT.dom.checkboxAndLabel(acc, true, null, null, null, function(cb) {
					var head = vu.builders.current.person.head;
					if (cb.checked) // hard-wiring one.torso for now ... genericize later
						head.attach(templates.one.torso.accessories[acc]);
					else
						head.remove(acc);
				});
			});
			selz.mood = CT.dom.div();
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.tweak._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menu: function() {
		var cur = vu.builders.current, _ = vu.builders.tweak._, selz = _.selectors,
			blurs = core.config.ctvu.blurs, popts = _.opts;
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				CT.dom.span("Base"),
				CT.dom.pad(),
				selz.character
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.div("accessories", "centered"),
				selz.accessories
			], "padded bordered round mb5"),
			CT.dom.div([
				[
					CT.dom.span("Color:"),
					CT.dom.pad(),
					selz.colorLabel
				],
				selz.color
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.span("Voice"),
				CT.dom.pad(),
				selz.voice,
				CT.dom.smartField(function(val) {
					cur.person.say(val);
					return "clear";
				}, "w1 block mt5", null, null, null, blurs.talk)
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.checkboxAndLabel("moody", null, null, null, null, function(cbox) {
					cur.person.opts.moody = cbox.checked;
				}),
				selz.mood
			], "padded bordered round centered mb5"),
			"[custom parts; spring tuning]",
		];
	}
};