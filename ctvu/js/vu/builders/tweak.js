vu.builders.tweak = {
	_: {
		opts: core.config.ctvu.builders.person,
		accessories: core.config.ctvu.builders.accessories,
		selectors: {},
		joined: function(person) {
			var _ = vu.builders.tweak._,
				zcu = zero.core.util, popts = _.opts;
			zcu.setCurPer(person);
			for (var c in popts.colors) {
				var comps = c.split(".").slice(1);
				_.target = person.body;
				comps.forEach(function(comp) {
					_.target = _.target[comp];
				});
				_.target.material.color = zcu.hex2rgb(popts.colors[c]);
			}
			_.partLabel(person.body, null, true);

			var reg = function(part) {
				zero.core.click.register(part, function() {
					_.partLabel(part);
				});
			};

			["body", "head"].forEach(function(part) {
				reg(person[part]);
			});
			["teeth", "tongue", "teeth_top"].map(function(p) {
				reg(person.head[p]);
			});
			["L", "R"].map(function(part) {
				reg(person.head["eye" + part]);
			});
			new vu.menu.Hair({
				person: person,
				cb: _.partLabel
			});
			new vu.menu.Hair({
				kind: "beard",
				thing: "Beard",
				buttpos: "cbr",
				person: person,
				cb: _.partLabel,
				name: "wildbeard",
				varieties: ["wild", "bald"],
				prompt: "wild beard or no beard?"
			});
			new vu.menu.Hair({
				kind: "tail",
				thing: "Tail",
				buttpos: "cbl",
				person: person,
				cb: _.partLabel,
				name: "wildtail",
				varieties: ["wild", "bald"],
				prompt: "wild tail or no tail?"
			});
			_.setMorphs(person, "head");
			_.setMorphs(person, "body");
			_.selectors.rotation.update();
		},
		partLabel: function(target, clicker, nosay) {
			var _ = vu.builders.tweak._, k = target.opts.kind;
			_.target = target;
			nosay || zero.core.current.person.say(k);
			target._has_vstrip = !!target.opts.vstrip;
			CT.dom.setContent(_.selectors.partLabel, [
				CT.dom[clicker ? "link" : "span"](target.name + " (" + k +")",
					clicker),
				CT.dom.pad(),
				vu.media.swapper.texmo(target, _.uptex, true)
			]);
		},
		uptex: function(txdata) {
			var _ = vu.builders.tweak._, tar = _.target,
				tx = txdata.texture, hasvstrip = !!txdata.vstrip;
			vu.storage.edit({
				key: tar.opts.key,
				texture: tx && tx.key || null
			});
			if (txdata.vstrip || hasvstrip != tar._has_vstrip) {
				vu.storage.setOpts(tar.opts.key, {
					vstrip: txdata.vstrip
				});
				tar._has_vstrip = hasvstrip;
			}
		},
		setMorphs: function(person, part) {
			var _ = vu.builders.tweak._, bod = person[part],
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
			CT.dom.setContent(_.selectors["morphs_" + part], bod.staticMorphs.map(function(sel) {
				var upMo = function(val) {
					bod.springs[sel].target = bod.opts.morphs[sel] = val / 100;
				};
				return [
					sel,
					CT.dom.range(upMo, 0, 100, 100 * (bod.opts.morphs[sel] || 0),
						1, "w1", null, function(val) {
							CT.log(sel + ": " + val);
							upMo(val);
							vu.builders.tweak.persist({
								morphs: bod.opts.morphs
							}, part);
						})
				];
			}));
		},
		setColor: function(target, color, prop) {
			target.setColor(zero.core.util.hex2rgb(color));
			if (core.config.ctvu.storage.mode == "local") {
				vu.builders.tweak._.opts[prop][target.path] = color;
				vu.builders.tweak.persist();
			} else { // remote
				color = parseInt(color.slice(1), 16);
				var bod = zero.core.current.person.body;
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
			selz[prop] = vu.color.picker(prop + " selector", scolor, function() {
				_.setColor(_.target, selz[prop].value, prop);
			});
		},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.tweak._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts, accz = _.accessories,
				persist = vu.builders.tweak.persist, zcc = zero.core.current;

			var bt = popts.body.template, template = bt ? bt.split(".").pop() : popts.name,
				rawp = _.raw = vu.core.person(popts);

			_.colorSelector(rawp, "color");
			_.colorSelector(rawp, "specular");
			
			selz.partLabel = CT.dom.span("body", "bold"),
			selz.shininess = CT.dom.range(function(val) {
				CT.log("shininess: " + val);
				_.target.material.shininess = val;
				vu.storage.setMaterial(_.target.opts.key, { shininess: val });
			}, 0, 150, rawp.body.material.shininess || 30, 1, "w1");
			selz.opacity = CT.dom.range(function(val) {
				CT.log("opacity: " + val);
				var tm = _.target.material;
				tm.opacity = val / 100;
				tm.transparent = val < 100;
				vu.storage.setMaterial(_.target.opts.key, {
					opacity: tm.opacity,
					transparent: tm.transparent
				});
			}, 0, 100, rawp.body.material.opacity * 100, 1, "w1");

			rawp.body.skipPrecompile = true;

			var avz = core.config.ctvu.loaders.avatars;
			var pselector = selz.character = CT.dom.select(avz.map(function(item) {
				return item.split(".").pop();
			}), avz, null, bt && bt.slice(bt.indexOf(".") + 1), null, function() {
				if (zcc.person) {
					persist({ template: "templates." + pselector.value }, "body");
					location = location; // hack! do something smarter...
				}
			});
			selz.accessories = (accz[template] || accz.sassy).map(function(acc) {
				return CT.dom.checkboxAndLabel(acc, true, null, null, null, function(cb) {
					var head = zcc.person.head;
					if (cb.checked) // hard-wiring one.body for now ... genericize later
						head.attach(templates.one.body.accessories[acc]);
					else
						head.detach(acc);
				});
			});
			selz.morphs_head = CT.dom.div();
			selz.morphs_body = CT.dom.div();

			selz.rotation = CT.dom.div();
			selz.rotation.update = function() {
				CT.dom.setContent(selz.rotation,
					CT.dom.range(zcc.person.orientation,
						0, Math.PI * 2, 0, 0.01, "w1"));
			};
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.tweak._.opts;
		if (sub == "head")
			popts.body.parts[0] = CT.merge(updates, popts.body.parts[0]);
		else if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menu: function() {
		var cur = zero.core.current, _ = vu.builders.tweak._, selz = _.selectors,
			blurs = core.config.ctvu.blurs, popts = _.opts,
			mode = core.config.ctvu.storage.mode,
			baseClass = "padded bordered round mb5" + (mode == "remote" ? " hidden" : "");
		_.setup();
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				"Rotation",
				selz.rotation
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.span("Base"),
				CT.dom.pad(),
				selz.character
			], baseClass),
//			CT.dom.div([
//				CT.dom.div("accessories", "centered"),
//				selz.accessories
//			], "padded bordered round mb5"),
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
				"Opacity",
				selz.opacity
			], "padded bordered round mb5"),
			CT.dom.div([
				"Shininess",
				selz.shininess
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.div("morphs", "centered"),
				CT.dom.link("import/export", function() {
					vu.core.impex(cur.person.head.opts.morphs, function(val) {
						vu.builders.tweak.persist({ morphs: val }, "head");
					});
				}, null, "right"),
				CT.dom.div("head", "backtilt yellow"),
				selz.morphs_head,
				CT.dom.link("import/export", function() {
					vu.core.impex(cur.person.body.opts.morphs, function(val) {
						vu.builders.tweak.persist({ morphs: val }, "body");
					});
				}, null, "right"),
				CT.dom.div("body", "backtilt yellow"),
				selz.morphs_body,
			], "padded bordered round")
		];
	}
};