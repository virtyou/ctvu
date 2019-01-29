vu.builders.talk = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		media: {
			image: "img",
			background: "img"
		},
		joined: function(person) {
			vu.builders.current.person = person;
			zero.core.camera.unfollow();
			vu.builders.talk._.setTriggers(person.opts.responses);
		},
		setup: function() {
			var _ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				persist = vu.builders.talk.persist;
			selz.responses = CT.dom.div();
			selz.responses.trigger = CT.dom.div(null, "bold");
			selz.disable = CT.dom.div();
			selz.chain = CT.dom.div();
			selz.vibe = CT.dom.div();
			selz.mood = CT.dom.div();
			selz.media = CT.dom.div();
			selz.bread = CT.dom.div(null, "right");
			selz.crumbz = CT.dom.div();
			selz.triggers = CT.dom.div();
			_.raw = zero.core.util.person(vu.core.bgen(popts.body),
				popts.name || "you", null, popts, popts.body);
		},
		setTriggers: function(responses, path) {
			var trigz = Object.keys(responses), cfg = core.config.ctvu,
				_ = vu.builders.talk._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts,
				rz = selz.responses, dz = selz.disable, rzt = rz.trigger,
				persist = vu.builders.talk.persist, blurs = cfg.blurs,
				cur = vu.builders.current;

			rzt.innerHTML = trigz[0];
			var jlo = function(v) {
				return v.replace(/[^a-z]/g, '');
			};
			var justlow = function(f) {
				f.value = jlo(f.value);
			};
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
							justlow(f);
							responses[f.value] = responses[f._trigger];
							delete responses[f._trigger];
							rzt.innerHTML = f._trigger = f.value;
							persist({ responses: cur.person.opts.responses });
						} else
							f.value = f._trigger; // meh
					};
				} else
					f.onkeyup = function() { justlow(f); };
				return f;
			}, function(iput) {
				var key = iput.value;
				if (key in responses) return; // already exists...
				responses[key] = { mood: {}, phrase: [] };
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
				selz.disable.refresh();
				selz.mood.refresh();
				selz.media.refresh();
				selz.chain.refresh();
				selz.vibe.refresh();
			};
			dz.update = function() {
				responses[rzt.innerHTML].disable = dz.fields.value();
				persist({ responses: cur.person.opts.responses });
			};
			dz.refresh = function() {
				vu.core.fieldList(dz, responses[rzt.innerHTML].disable);
			};
			selz.chain.refresh = function() {
				CT.dom.setContent(selz.chain, CT.dom.smartField(function(val) {
					responses[rzt.innerHTML].chain = val;
					persist({ responses: cur.person.opts.responses });
				}, "w1 block mt5", null, responses[rzt.innerHTML].chain, null, blurs.chain));
			};
			selz.vibe.refresh = function() {
				CT.dom.setContent(selz.vibe, CT.dom.smartField(function(val) {
					responses[rzt.innerHTML].vibe = val;
					persist({ responses: cur.person.opts.responses });
				}, "w1 block mt5", null, responses[rzt.innerHTML].vibe, null, blurs.vibe));
			};
			var bgz = ["background", "video", "iframe", "map", "panorama"];
			var checkBoxGate = function(obj, sel, node) {
				return CT.dom.checkboxAndLabel(sel, sel in obj, null, null, null, function(cbox) {
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
			var mediaSelector = function(rez, sel) {
				var isIframe = sel == "iframe",
					isMap = ["map", "panorama"].indexOf(sel) != -1,
					opts = rez[sel] || {
						variety: sel,
						modelName: "resource"
					}, item;

				// viewer (img/audio)
				var viewer = CT.dom.div(null, "mt5");
				var setViewer = function() {
					if (isMap) {
						viewer.classList.add("h100p");
						return zero.core.util[sel](opts.item, viewer);
					}
					CT.dom.setContent(viewer, CT.dom[_.media[sel] || sel]({
						src: opts.item,
						controls: true,
						className: "w1"
					}));
				};
				if (opts.item)
					setViewer();

				// item
				if (isMap) {
					var oi = opts.item = opts.item || {};
					item = CT.dom.div(["lat", "lng"].map(function(axis, i) {
						return CT.dom.smartField(function(val) {
							oi[axis] = parseFloat(val);
							item.lastElementChild.style.display = "block";
							if (oi.lat && oi.lng) {
								setViewer();
								persist({ responses: cur.person.opts.responses });
							}
						}, "w1 block mt5" + ((i && !oi[axis]) ? " hidden" : ""),
							null, oi[axis], null, blurs[axis]);
					}), !opts.item.lat && "hidden");
				} else if (!isIframe) { // standard -- drag drop
					item = CT.dom.div(CT.file.dragdrop(function(ctfile) {
						ctfile.upload("/_db", function(url) {
							opts.item = url;
							setViewer();
							persist({ responses: cur.person.opts.responses });
						}, {
							action: "blob",
							key: opts.key,
							property: "item"
						});
					}), !opts.item && "hidden");
				}

				// name (required)
				var name = CT.dom.smartField(function(val) {
					if (!val) return name.blur();
					opts.name = val;
					var medUp = function(resource) {
						if (!(sel in rez))
							rez[sel] = opts;
						if (resource && resource.key)
							opts.key = resource.key;
						if (isIframe) {
							opts.item = val;
							setViewer();
						} else
							CT.dom.show(item);
						persist({ responses: cur.person.opts.responses });
					};
					if (isIframe || isMap)
						return medUp();
					CT.net.post({
						path: "/_db",
						params: {
							action: "edit",
							pw: cfg.storage.apikey,
							data: opts
						},
						cb: medUp
					});
				}, null, null, opts.name, null, blurs[sel] || blurs.resource);

				return CT.dom.div([name, item, viewer], !(sel in rez) && "hidden");
			};
			selz.media.refresh = function() {
				CT.dom.setContent(selz.media, ["image", "audio", "background", "video", "iframe", "map", "panorama"].map(function(sel) {
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
				if (resps.branches)
					vu.builders.talk._.setTriggers(resps.branches, path);
				else {
					(new CT.modal.Prompt({
						prompt: "what's the new trigger?",
						transition: "slide",
						cb: function(val) {
							val = jlo(val);
							if (!val) return;
							resps.branches = {};
							resps.branches[val] = {
								"phrase": "you said " + val,
								"mood": {}
							};
							persist({ responses: cur.person.opts.responses });
							vu.builders.talk._.setTriggers(resps.branches, path);
						}
					})).show();
				}
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
		var cur = vu.builders.current, _ = vu.builders.talk._,
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
				"Triggers",
				selz.triggers
			], "padded bordered round mb5"),
			CT.dom.div([
				selz.bread,
				selz.responses.trigger,
				selz.crumbz
			], "padded bordered round"),
			["Responses", "Disable", "Chain", "Vibe", "Mood", "Media"].map(function(item) {
				return CT.dom.div([
					item,
					selz[item.toLowerCase()]
				], "padded bordered round mt5");
			})
		];
	}
};