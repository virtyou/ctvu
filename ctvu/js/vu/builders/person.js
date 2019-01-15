vu.builders.person = {
	_: {
		opts: core.config.ctvu.builders.person,
		accessories: core.config.ctvu.builders.accessories,
		selectors: {},
		joined: function(_person) {
			var person = vu.builders.current.person = _person,
				_ = vu.builders.person._, popts = _.opts,
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

			if (location.pathname == "/vu/talk.html")
				person.opts.moody = true;

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
			zero.core.camera.unfollow();

			_.setTriggers(person.opts.responses);
		},
		setColor: function(target, color) {
			target.material.color = vu.core.hex2rgb(color);
			if (core.config.ctvu.storage.mode == "local") {
				vu.builders.person._.opts.colors[target.path] = color;
				vu.builders.person.persist();
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
			var cfg = core.config.ctzero, _ = vu.builders.person._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts, accz = _.accessories,
				persist = vu.builders.person.persist;

			selz.responses = CT.dom.div();
			selz.responses.trigger = CT.dom.div(null, "bold");
			selz.disable = CT.dom.div();
			selz.mood = CT.dom.div();
			selz.bread = CT.dom.div(null, "right");
			selz.crumbz = CT.dom.div();
			selz.triggers = CT.dom.div();

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
		},
		setTriggers: function(responses, path) {
			var trigz = Object.keys(responses),
				_ = vu.builders.person._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				rz = selz.responses, dz = selz.disable, rzt = rz.trigger,
				persist = vu.builders.person.persist,
				cur = vu.builders.current;

			rzt.innerHTML = trigz[0];
			var justlow = function(f) {
				f.value = f.value.replace(/[^a-z]/g, '');
			};
			var tfl = CT.dom.fieldList(trigz, function(v) {
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						rzt.innerHTML = f._trigger;
						rz.refresh(f._trigger);
					};
					f.onkeyup = function() {
						if (f.value) {
							justlow(f);
							responses[f.value] = responses[f._trigger];
							delete responses[f._trigger];
							rzt.innerHTML = f._trigger = f.value;
							persist({ responses: popts.responses });
						} else
							f.value = f._trigger; // meh
					};
				} else
					f.onkeyup = function() { justlow(f); };
				return f;
			}, null, function(iput) {
				var key = iput.value;
				if (key in responses) return; // already exists...
				responses[key] = { mood: {}, phrase: [] };
				setTimeout(function() {
					iput.focus();
				});
			});
			CT.dom.setContent(selz.triggers, [
				tfl.empty,
				tfl.addButton,
				tfl
			]);
			rz.update = function() {
				responses[rzt.innerHTML].phrase = rz.fields.value();
				persist({ responses: cur.person.opts.responses });
			};
			rz.refresh = function() {
				var rez = responses[rzt.innerHTML];
				if (!Array.isArray(rez.phrase))
					rez.phrase = [rez.phrase];
				rz.fields = CT.dom.fieldList(rez.phrase, function(v) {
					var f = CT.dom.field(null, v);
					if (v)
						f.onkeyup = rz.update;
					return f;
				}, null, rz.update, rz.update);
				CT.dom.setContent(rz, [
					rz.fields.empty,
					rz.fields.addButton,
					rz.fields
				]);
				selz.disable.refresh();
				selz.mood.refresh();
			};
			dz.update = function() {
				responses[rzt.innerHTML].disable = dz.fields.value();
				persist({ responses: cur.person.opts.responses });
			};
			dz.refresh = function() {
				dz.fields = CT.dom.fieldList(responses[rzt.innerHTML].disable, function(v) {
					var f = CT.dom.field(null, v);
					if (v)
						f.onkeyup = dz.update;
					return f;
				}, null, dz.update, dz.update);
				CT.dom.setContent(dz, [
					dz.fields.empty,
					dz.fields.addButton,
					dz.fields
				]);
			};
			selz.mood.refresh = function() {
				CT.dom.setContent(selz.mood, ["mad", "happy", "sad", "antsy"].map(function(sel) {
					var rez = responses[rzt.innerHTML],
						moodz = rez.mood = rez.mood || {};
					var range = CT.dom.range(function(val) {
						CT.log(sel + ": " + val);
						moodz[sel] = val / 100;
						persist({ responses: popts.responses });
					}, 0, 100, 100 * (moodz[sel] || 0), 1, "w1" + ((sel in moodz) ? "" : " hidden"));
					return [
						CT.dom.checkboxAndLabel(sel, sel in moodz, null, null, null, function(cbox) {
							CT.dom.showHide(range, cbox.checked, !cbox.checked);
							if (!cbox.checked)
								delete moodz[sel];
						}),
						range
					];
				}));
			};
			path = path || ["base"];
			CT.dom.setContent(selz.crumbz, (path.length == 1) ? "" : path.map(function(pname, i) {
				return CT.dom.span([
					CT.dom.span(i ? "->" : "path:"),
					CT.dom.pad(),
					CT.dom.link(pname, function() {
						var resps = popts.responses,
							npath = ["base"];
						if (pname != "base") {
							for (var j = 1; j <= i; j++) {
								var pn = path[j];
								npath.push(pn);
								resps = resps[pn].branches;
							}
						}
						vu.builders.person._.setTriggers(resps, npath);
					}),
					CT.dom.pad()
				]);
			}));
			CT.dom.setContent(selz.bread, CT.dom.link("view branches", function() {
				path.push(rzt.innerHTML);
				var resps = responses[rzt.innerHTML];
				if (!resps.branches) {
					resps.branches = {
						"*": {
							"phrase": "fallback response",
							"mood": {}
						}
					};
				}
				vu.builders.person._.setTriggers(resps.branches, path);
			}));
			rz.refresh();
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.person._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menu: function() {
		var cur = vu.builders.current, _ = vu.builders.person._, selz = _.selectors;
		_.setup();
		var popts = _.opts, items = [
			CT.dom.div("your virtYou", "bigger centered pb10")
		];
		if (location.pathname == "/vu/talk.html") {
			var respond = function(val) {
				cur.person.respond(val);
				return "clear";
			}, listButt = CT.dom.button("listen", function() {
				listButt.style.color = "red";
				zero.core.rec.listen(function(phrase) {
					respond(phrase);
					listButt.style.color = "black";
				});
			}, "right");
			items = items.concat([
				CT.dom.div([
					listButt,
					CT.dom.span("Voice"),
					CT.dom.pad(),
					selz.voice,
					CT.dom.smartField(respond, "w1 block mt5", null, null, null, ["say something", "test voice", "type something"])
				], "padded bordered round mb5"),
				CT.dom.div([
					"Triggers",
					selz.triggers
				], "padded bordered round mb5"),
				CT.dom.div([
					selz.bread,
					selz.responses.trigger,
					selz.crumbz
				], "padded bordered round mb5"),
				CT.dom.div([
					"Responses",
					selz.responses
				], "padded bordered round mb5"),
				CT.dom.div([
					"Disable",
					selz.disable
				], "padded bordered round mb5"),
				CT.dom.div([
					"Mood",
					selz.mood
				], "padded bordered round")
			]);
		} else {
			items = items.concat([
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
					}, "w1 block mt5", null, null, null, ["say something", "test voice", "type something"])
				], "padded bordered round mb5"),
				CT.dom.div([
					CT.dom.checkboxAndLabel("moody", null, null, null, null, function(cbox) {
						cur.person.opts.moody = cbox.checked;
					}),
					["mad", "happy", "sad", "antsy"].map(function(sel) {
						return [
							sel,
							CT.dom.range(function(val) {
								CT.log(sel + ": " + val);
								var mod = {};
								mod[sel] = popts.mood[sel] = val / 100;
								cur.person.mood.update(mod);
								vu.builders.person.persist({ mood: popts.mood });
							}, 0, 100, 100 * (popts.mood[sel] || 0), 1, "w1")
						];
					}),
				], "padded bordered round centered mb5"),
				"[custom parts; spring tuning]",
			]);
		}
		return items;
	}
};