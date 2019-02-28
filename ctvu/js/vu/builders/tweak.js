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
				var comps = c.split(".").slice(1);
				_.target = person.body;
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
				CT.dom.setContent(_.selectors.partLabel, "skin");
			});
			["teeth", "tongue", "teeth_top"].map(function(p) {
				var pthing = person.head[p],
					part = p.replace("_", " ");
				zero.core.click.register(pthing, function() {
					if (has_menu) return true;
					person.say(part);
					_.target = pthing;
					CT.dom.setContent(_.selectors.partLabel, part);
				});
			});
			["L", "R"].map(function(part) {
				var pthing = person.head["eyeGroup" + part]["eye" + part],
					pname = ((part == "L") ? "left" : "right") + " eye";
				zero.core.click.register(pthing, function() {
					if (has_menu) return true;
					person.say(pname);
					_.target = pthing;
					CT.dom.setContent(_.selectors.partLabel, pname);
				});
			});
			var registerHair = function() {
				zero.core.click.register(Object.values(person.head.hair)[0], function() {
					if (has_menu) return true;
					has_menu = true;
					var m = new zero.core.Menu({
						items: Object.values(vu.storage.get("hair")),
						onselect: function(hopts) {
							CT.log(hopts.name);
							m.close();
							person.head.detach("hair");
							person.head.attach(hopts, registerHair, true);
							has_menu = false;
						}
					});
				});
			};
			if (core.config.ctvu.storage.mode == "remote")
				registerHair(); // local disabled for now (must add hair alternatives 1st)
			_.setMorphs(person);
			zero.core.camera.unfollow();
		},
		setMorphs: function(person) {
			var _ = vu.builders.tweak._, bod = person.body,
				spropts = core.config.ctvu.builders.tweak.staticSpring;

			bod.staticMorphs.forEach(function(m) {
				bod.springs[m] = zero.core.springController.add(CT.merge({
					target: bod.opts.morphs[m] || 0
				}, spropts), m, bod);
				var aspringz = {};
				aspringz[m] = 1;
				bod.aspects[m] = zero.core.aspectController.add({
					springs: aspringz
				}, m, bod);
				zero.core.morphs.delta(bod, m);
			});

			CT.dom.setContent(_.selectors.morphs, bod.staticMorphs.map(function(sel) {
				return [
					sel,
					CT.dom.range(function(val) {
						CT.log(sel + ": " + val);
						bod.springs[sel].target = bod.opts.morphs[sel] = val / 100;
						vu.builders.tweak.persist({
							morphs: bod.opts.morphs
						}, "body");
					}, 0, 100, 100 * (bod.opts.morphs[sel] || 0), 1, "w1")
				];
			}));
		},
		setColor: function(target, color, prop) {
			target.material.color = vu.core.hex2rgb(color);
			if (core.config.ctvu.storage.mode == "local") {
				vu.builders.tweak._.opts[prop][target.path] = color;
				vu.builders.tweak.persist();
			} else { // remote
				color = parseInt(color.slice(1), 16);
				var bod = vu.builders.current.person.body;
				if (bod.head.opts.key) { // parts tree
					var copts = {};
					copts[prop] = color;
					vu.storage.setMaterial(target.opts.key, copts);
				} else { // template
					var opts = {}, tn = target.name;
					opts[(tn == "body") ? prop : (tn + "_" + prop)] = color;
					vu.storage.setOpts(bod.opts.key, opts);
				}
			}
		},
		colorSelector: function(rawp, prop) {
			var _ = vu.builders.tweak._, selz = _.selectors,
				bcolor = rawp.body.material[prop] || "#111111",
				scolor = (typeof bcolor == "string") ? bcolor : ("#" + bcolor.toString(16));
			selz[prop] = vu.core.color(prop + " selector", scolor, function() {
				_.setColor(_.target, selz[prop].value, prop);
			});
		},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.tweak._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts, accz = _.accessories,
				persist = vu.builders.tweak.persist;

			var bt = popts.body.template, template = bt ? bt.split(".").pop() : popts.name,
				rawp = _.raw = zero.core.util.person(vu.core.bgen(popts.body),
					popts.name || "you", null, popts, popts.body);

			_.colorSelector(rawp, "color");
			_.colorSelector(rawp, "specular");
			
			selz.partLabel = CT.dom.span("Skin", "bold"),
			selz.shininess = CT.dom.range(function(val) {
				CT.log("shininess: " + val);
				_.target.material.shininess = val;
				vu.storage.setMaterial(_.target.opts.key, { shininess: val });
			}, 0, 150, rawp.body.material.shininess || 30, 1, "w1");

			rawp.body.skipPrecompile = true;

			var avz = core.config.ctvu.loaders.avatars;
			var pselector = selz.character = CT.dom.select(avz.map(function(item) {
				return item.split(".").pop();
			}), avz, null, bt && bt.slice(bt.indexOf(".") + 1), null, function() {
				if (vu.builders.current.person) {
					persist({ template: "templates." + pselector.value }, "body");
					location = location; // hack! do something smarter...
				}
			});
			selz.accessories = (accz[template] || accz.sassy).map(function(acc) {
				return CT.dom.checkboxAndLabel(acc, true, null, null, null, function(cb) {
					var head = vu.builders.current.person.head;
					if (cb.checked) // hard-wiring one.body for now ... genericize later
						head.attach(templates.one.body.accessories[acc]);
					else
						head.detach(acc);
				});
			});
			selz.morphs = CT.dom.div();
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
			blurs = core.config.ctvu.blurs, popts = _.opts,
			mode = core.config.ctvu.storage.mode,
			baseClass = "padded bordered round mb5" + (mode == "remote" ? " hidden" : "");
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				CT.dom.span("Base"),
				CT.dom.pad(),
				selz.character
			], baseClass),
			CT.dom.div([
				CT.dom.div("accessories", "centered"),
				selz.accessories
			], "padded bordered round mb5"),
			CT.dom.div(selz.partLabel, "padded bordered round mb5"),
			CT.dom.div([
				"Color",
				selz.color
			], "padded bordered round mb5"),
			CT.dom.div([
				"Specular",
				selz.specular
			], "padded bordered round mb5"),
			CT.dom.div([
				"Shininess",
				selz.shininess
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.div("morphs", "centered"),
				selz.morphs
			], "padded bordered round")
		];
	}
};