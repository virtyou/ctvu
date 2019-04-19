vu.builders.talk = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		media: {
			image: "img",
			background: "img"
		},
		joined: function(person) {
			zero.core.current.person = person;
			zero.core.camera.unfollow();
			vu.builders.talk._.initTriggers();
		},
		initTriggers: function() {
			var _ = vu.builders.talk._,
				path = decodeURIComponent(document.location.hash.slice(1)) || "ctl_root";
			_.loadTriggers.apply(null, _.getCluster(path));
		},
		setup: function() {
			var _ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				persist = vu.builders.talk.persist,
				trigz = ["responses", "disable", "chain", "vibe", "mood",
					"media", "crumbz", "gesture", "dance", "triggers"];
			trigz.forEach(function(trig) {
				selz[trig] = CT.dom.div();
			});
			selz.responses.trigger = CT.dom.div(null, "bold");
			selz.bread = CT.dom.div(null, "right");
			_.raw = vu.core.person(popts);
		},
		loadTriggers: function(r, path, trig) {
			path = path || ["root"];
			if (!r.branches || !Object.keys(r.branches).length)
				vu.builders.talk._.initCluster(r, path);
			else
				vu.builders.talk._.setTriggers(r.branches, path, trig);
		},
		tree: function(path) {
			var person = zero.core.current.person,
				_ = vu.builders.talk._;
			CT.dom.setContent("tree", CT.layout.tree({
				branches: person.opts.responses,
				nameCb: function(opts) {
					if (opts.name == "root")
						return opts.name;
					var resp, path, trig, chain;
					[resp, path, trig] = _.getCluster(opts.id);
					chain = CT.dom.span(resp.chain);
					return [
						CT.dom.span(opts.name),
						CT.dom.pad(),
						CT.dom.link("->", function() {
							vu.core.prompt({
								prompt: "chain to what?",
								cb: function(val) {
									if (!val) return;
									resp.chain = val;
									CT.dom.setContent(chain, val);
									vu.builders.talk.persist({
										responses: person.opts.responses
									});
									_.setTriggers(resp.branches, path, trig);
								}
							});
						}),
						CT.dom.pad(),
						chain
					];
				},
				cb: function(node) {
					_.loadTriggers.apply(null, _.getCluster(node.id));
				}
			}));
			CT.dom.id("ctl_" + path).classList.add("selbranch");
		},
		getCluster: function(id) {
			var i, p, r = {
				branches: {
					root: {
						branches: zero.core.current.person.opts.responses
					}
				}
			}, path = id.slice(4).split("_"), trig;
			if (path.length > 1)
				trig = path.pop();
			for (i = 0; i < path.length; i++) {
				p = path[i];
				if (!r.branches[p]) {
					r.branches[p] = {
						branches: {}
					};
				}
				r = r.branches[p];
			}
			if (trig && !r.branches[trig])
				r.branches[trig] = {};
			return [r, path, trig];
		},
		initCluster: function(resps, path) {
			var _ = vu.builders.talk._,
				cur = zero.core.current;
			vu.core.prompt({
				prompt: "what's the new trigger?",
				cb: function(val) {
					if (!val) return;
					resps.branches = {};
					resps.branches[val] = {
						"phrase": "you said " + val,
						"mood": {}
					};
					if (!Object.keys(cur.person.opts.responses).length)
						cur.person.opts.responses = resps.branches;
					vu.builders.talk.persist({ responses: cur.person.opts.responses });
					_.setTriggers(resps.branches, path);
				}
			});
		},
		setTriggers: function(responses, path, trig) {
			var trigz = Object.keys(responses), cfg = core.config.ctvu,
				_ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				rz = selz.responses, dz = selz.disable, rzt = rz.trigger,
				persist = vu.builders.talk.persist, blurs = cfg.blurs,
				cur = zero.core.current;

			rzt.innerHTML = trig || trigz[0];
			vu.core.fieldList(selz.triggers, trigz, null, function(v) {
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						rzt.innerHTML = f._trigger;
						rz.refresh(f._trigger);
					};
					f.onkeyup = function() {
						if (f.value) {
							responses[f.value] = responses[f._trigger];
							delete responses[f._trigger];
							rzt.innerHTML = f._trigger = f.value;
							persist({ responses: cur.person.opts.responses });
						} else
							f.value = f._trigger; // meh
					};
				}
				return f;
			}, function(iput) {
				var key = iput.value;
				if (key in responses) return; // already exists...
				responses[key] = { mood: {}, phrase: ["you said " + key] };
				setTimeout(function() {
					iput.focus();
				});
			}, function(val) {
				delete responses[val];
				persist({ responses: cur.person.opts.responses });
			});
			rz.update = function() {
				responses[rzt.innerHTML].phrase = rz.fields.value();
				persist({ responses: cur.person.opts.responses });
			};
			rz.refresh = function() {
				var rez = responses[rzt.innerHTML];
				if (!Array.isArray(rez.phrase))
					rez.phrase = [rez.phrase];
				vu.core.fieldList(rz, rez.phrase);
				["disable", "mood", "vibe", "media", "chain", "gesture", "dance"].forEach(function(trig) {
					selz[trig].refresh();
				});
				_.tree(path.join("_") + "_" + rzt.innerHTML);
			};
			dz.update = function() {
				responses[rzt.innerHTML].disable = dz.fields.value();
				persist({ responses: cur.person.opts.responses });
			};
			dz.refresh = function() {
				vu.core.fieldList(dz, responses[rzt.innerHTML].disable);
			};
			["chain", "vibe", "gesture", "dance"].forEach(function(reaction) {
				selz[reaction].refresh = function() {
					CT.dom.setContent(selz[reaction], CT.dom.smartField(function(val) {
						responses[rzt.innerHTML][reaction] = val;
						persist({ responses: cur.person.opts.responses });
					}, "w1 block mt5", null, responses[rzt.innerHTML][reaction], null, blurs[reaction]));
				};
			});
			var bgz = ["background", "video", "iframe", "map", "panorama", "environment"];
			var checkBoxGate = function(obj, sel, node) {
				return CT.dom.checkboxAndLabel(sel, !!obj[sel], null, null, null, function(cbox) {
					if (cbox.checked && (bgz.indexOf(sel) != -1)) {
						for (var i = 0; i < bgz.length; i++) {
							if (obj[bgz[i]]) {
								cbox.checked = false;
								return;
							}
						}
					}
					CT.dom.showHide(node, cbox.checked, !cbox.checked);
					if (!cbox.checked)
						delete obj[sel];
				});
			};
			selz.mood.refresh = function() {
				CT.dom.setContent(selz.mood, zero.core.Mood.vectors.map(function(sel) {
					var rez = responses[rzt.innerHTML],
						moodz = rez.mood = rez.mood || {};
					var range = CT.dom.range(function(val) {
						CT.log(sel + ": " + val);
						moodz[sel] = val / 100;
						persist({ responses: popts.responses });
					}, 0, 100, 100 * (moodz[sel] || 0), 1, "w1" + ((sel in moodz) ? "" : " hidden"));
					return [
						checkBoxGate(moodz, sel, range),
						range
					];
				}));
			};
			selz.media.refresh = function() {
				CT.dom.setContent(selz.media, ["image", "audio", "background", "video", "iframe", "map", "panorama", "environment"].map(function(sel) {
					var rez = responses[rzt.innerHTML], node = vu.media.selector(rez, sel, function() {
						persist({ responses: cur.person.opts.responses });
					});
					return [
						checkBoxGate(rez, sel, node),
						node
					];
				}));
			};
			CT.dom.setContent(selz.crumbz, (path.length == 1) ? "" : path.map(function(pname, i) {
				return CT.dom.span([
					CT.dom.span(i ? "->" : "path:"),
					CT.dom.pad(),
					CT.dom.link(pname, function() {
						var resps = popts.responses,
							npath = ["root"];
						if (pname != "root") {
							for (var j = 1; j <= i; j++) {
								var pn = path[j];
								npath.push(pn);
								resps = resps[pn].branches;
							}
						}
						_.setTriggers(resps, npath);
					}),
					CT.dom.pad()
				]);
			}));
			CT.dom.setContent(selz.bread, CT.dom.link("view branches", function() {
				path.push(rzt.innerHTML);
				_.loadTriggers(responses[rzt.innerHTML], path);
			}));
			rz.refresh();
		},
		helno: function(variety) {
			return CT.dom.link("help", function() {
				(new CT.modal.Modal({
					transition: "slide",
					content: [
						CT.dom.div(variety, "big centered"),
						core.config.ctvu.builders.talk.help[variety.toLowerCase()]
					]
				})).show();
			}, null, "right italic small");
		}
	},
	persist: function(updates, sub) {
		var popts = vu.builders.talk._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	menu: function() {
		var cur = zero.core.current, _ = vu.builders.talk._,
			selz = _.selectors, blurs = core.config.ctvu.blurs;
		_.setup();
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
		return [
			CT.dom.div("your virtYou", "bigger centered pb10"),
			CT.dom.div([
				listButt,
				"Voice",
				CT.dom.smartField(respond, "w1 block mt5", null, null, null, blurs.talk)
			], "padded bordered round mb5"),
			CT.dom.div([
				_.helno("Triggers"),
				[
					CT.dom.span("Triggers"),
					CT.dom.pad(),
					CT.dom.link("import/export", function() {
						vu.core.impex(cur.person.opts.responses, function(val) {
							vu.builders.talk.persist({ responses: val });
						});
					})
				],
				selz.triggers
			], "padded bordered round mb5"),
			CT.dom.div([
				selz.bread,
				selz.responses.trigger,
				selz.crumbz
			], "padded bordered round"),
			["Responses", "Disable", "Chain", "Gesture", "Dance", "Vibe", "Mood", "Media"].map(function(item) {
				return CT.dom.div([
					_.helno(item),
					item,
					selz[item.toLowerCase()]
				], "padded bordered round mt5");
			})
		];
	}
};