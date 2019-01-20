vu.builders.talk = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		joined: function(person) {
			vu.builders.current.person = person;
			person.opts.moody = true;
			zero.core.camera.unfollow();
			vu.builders.talk._.setTriggers(person.opts.responses);
		},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				persist = vu.builders.talk.persist;
			selz.responses = CT.dom.div();
			selz.responses.trigger = CT.dom.div(null, "bold");
			selz.disable = CT.dom.div();
			selz.mood = CT.dom.div();
			selz.media = CT.dom.div();
			selz.bread = CT.dom.div(null, "right");
			selz.crumbz = CT.dom.div();
			selz.triggers = CT.dom.div();
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
		},
		setTriggers: function(responses, path) {
			var trigz = Object.keys(responses),
				_ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				rz = selz.responses, dz = selz.disable, rzt = rz.trigger,
				persist = vu.builders.talk.persist,
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
				selz.media.refresh();
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
			var checkBoxGate = function(obj, sel, node) {
				return CT.dom.checkboxAndLabel(sel, sel in obj, null, null, null, function(cbox) {
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
			var mediaSelector = function(rez, sel) {
				var opts = rez[sel] || {
					modelName: "resource"
				};

				// viewer (img/audio)
				var viewer = CT.dom.div();
				var setViewer = function() {
					CT.dom.setContent(viewer, CT.dom[(sel == "audio") ? "audio" : "img"](opts.item));
				};
				if (opts.item)
					setViewer();

				// item (drag drop)
				var dragdrop = CT.file.dragdrop(function(ctfile) {
					ctfile.upload("/_db", function(url) {
						opts.item = url;
						setViewer();
						persist({ responses: popts.responses });
					}, {
						action: "blob",
						key: opts.key,
						property: "item"
					});
				}, !("item" in opts) && "hidden");

				// name (required)
				var name = CT.dom.smartField(function(val) {
					if (!val) return name.blur();
					opts.name = val;
					CT.net.post({
						path: "/_db",
						params: {
							action: "edit",
							pw: core.config.ctvu.storage.apikey,
							data: opts
						},
						cb: function(resource) {
							if (!sel in rez)
								rez[sel] = opts;
							opts.key = resource.key;
							persist({ responses: popts.responses });
							CT.dom.show(dragdrop);
						}
					});
				}, null, null, opts.name, null, ["what's the name?", "name this resource", "what's it called?"]);

				return CT.dom.div([name, dragdrop, viewer], !(sel in rez) && "hidden");
			};
			selz.media.refresh = function() {
				CT.dom.setContent(selz.media, ["image", "background", "audio"].map(function(sel) {
					var rez = responses[rzt.innerHTML], node = mediaSelector(rez, sel);
					return [
						checkBoxGate(rez, sel, node),
						node
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
						vu.builders.talk._.setTriggers(resps, npath);
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
				vu.builders.talk._.setTriggers(resps.branches, path);
			}));
			rz.refresh();
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
		var cur = vu.builders.current, _ = vu.builders.talk._, selz = _.selectors,
			blurs = core.config.ctvu.blurs;
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
				CT.dom.span("Voice"),
				CT.dom.pad(),
				selz.voice,
				CT.dom.smartField(respond, "w1 block mt5", null, null, null, blurs.talk)
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
			], "padded bordered round mb5"),
			CT.dom.div([
				"Media",
				selz.media
			], "padded bordered round")
		];
	}
};