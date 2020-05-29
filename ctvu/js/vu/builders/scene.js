vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			main: "topleft",
			props: "topright",
			steps: "bottomleft",
			actors: "bottomright"
		},
		upscripts: function() {
			var scene = zero.core.current.scene;
			vu.storage.edit({
				key: scene.key,
				scripts: scene.scripts
			});
		},
		upstate: function() {
			var g = zero.core.current.scene.game;
			vu.storage.edit({
				key: g.key,
				initial: g.initial
			});
		},
		state: function(ofScene, sub) {
			var i = zero.core.current.scene.game.initial;
			if (!ofScene) return i;
			if (!i.scenes) i.scenes = {};
			if (!i.scenes[ofScene]) i.scenes[ofScene] = {};
			if (!sub) return i.scenes[ofScene];
			if (!i.scenes[ofScene][sub]) i.scenes[ofScene][sub] = {};
			return i.scenes[ofScene][sub];
		},
		step: function(cb, cur) {
			var zcc = zero.core.current, _ = vu.builders.scene._;
			CT.modal.choice({
				prompt: "please select a variety",
				data: ["lights", "camera", "action", "state", "story",
					"text", "pause", "fx", "music", "ambient"
				].filter(function(st) { // +props,state
					return !cur || !(st in cur);
				}),
				cb: function(stype) {
					if (stype == "pause") {
						CT.modal.prompt({
							prompt: "0.25 to five seconds",
							style: "number",
							cb: function(val) {
								cb({ pause: val * 1000 });
							}
						});
					} else if (stype == "action") {
						CT.modal.choice({
							prompt: "please select an actor",
							data: zcc.scene.actors,
							cb: function(actor) {
								CT.modal.choice({
									prompt: "please select an action",
									data: ["say", "respond", "move", "approach"],
									cb: function(action) {
										var act = function(line) {
											cb({
												actor: actor.name,
												action: action,
												line: line
											});
										};
										if (action == "move") {
											CT.modal.choice({
												prompt: "please adjust " + actor.name + "'s position and orientation, and click 'ready' to save. click 'cancel' to abort.",
												data: ["ready", "cancel"],
												cb: function(resp) {
													var pbs = zcc.people[actor.name].body.springs;
													(resp == "ready") && act({
														weave: pbs.weave.target,
														slide: pbs.slide.target,
														orientation: pbs.orientation.target
													});
												}
											});
										} else if (action == "approach") {
											CT.modal.choice({
												data: ["player", "actor", "furnishing"],
												cb: function(cat) {
													if (cat == "player")
														return act("player");
													var data;
													if (cat == "actor") {
														data = zcc.scene.actors.filter(function(a) {
															return a.name != actor.name;
														});
													} else // furnishing
														data = Object.values(zcc.room.objects);
													CT.modal.choice({
														prompt: "please select a target",
														data: data,
														cb: function(target) {
															act(target.name);
														}
													});
												}
											});
										} else {
											CT.modal.prompt({
												prompt: "what's the line?",
												cb: act
											})
										}
									}
								})
							}
						});
					} else if (stype == "camera") {
						CT.modal.choice({
							prompt: "please select an angle",
							data: ["behind", "pov", "cycle",
								"0", "1", "2", "3", "4", "5", "6", "7", "8"],
							cb: function(angle) {
								cb({ camera: angle });
							}
						});
					} else if (stype == "lights") {
						CT.modal.choice({
							prompt: "please adjust the lighting, and click 'ready' to save. click 'cancel' to abort.",
							data: ["ready", "cancel"],
							cb: function(resp) {
								(resp == "ready") && cb({
									lights: zcc.room.lights.map(function(light) {
										return light.opts.intensity;
									})
								});
							}
						});
					} else if (stype == "text") {
						CT.modal.prompt({
							prompt: "what should it say?",
							isTA: true,
							cb: function(msg) {
								cb({ text: msg });
							}
						});
					} else if (stype == "story") {
						CT.modal.prompt({
							prompt: "what's the story?",
							isTA: true,
							cb: function(msg) {
								cb({ story: msg });
							}
						});
					} else if (stype == "state") {
						var sgia = zcc.scene.game.initial.actors;
						CT.modal.choice({
							prompt: "please select an actor",
							data: zcc.scene.actors.map(a => a.name),
							cb: function(actor) {
								CT.modal.choice({
									prompt: "what's changing?",
									data: [
										"new property with initial state",
										"new property without initial state"
									].concat(Object.keys(sgia[actor]).filter(p => p != "positioners")),
									cb: function(prop) {
										var getval = function(prop) {
											CT.modal.prompt({
												prompt: "what's the new value?",
												cb: function(val) {
													var sobj = {};
													sobj[actor] = {};
													sobj[actor][prop] = val;
													cb({ state: sobj });
												}
											});
										};
										if (prop.startsWith("new property")) {
											CT.modal.prompt({
												prompt: "ok, what's the new property?",
												cb: function(prop) {
													if (prop.includes("without"))
														return getval(prop);
													CT.modal.prompt({
														prompt: "what's the initial value (value _prior to_ current step!)?",
														cb: function(ival) {
															sgia[actor][prop] = ival;
															_.upstate();
															getval(prop);
														}
													});
												}
											});
										} else
											getval(prop);
									}
								});
							}
						});
					} else { // fx, music, ambient
						vu.media.swapper.audio(function(aud) {
							if (!(aud.name in _.audio[stype])) {
								var uobj = {
									key: zcc.scene.key
								};
								_.audio.add(aud);
								zcc.scene[stype].push(aud);
								uobj[stype] = zcc.scene[stype].map(s => s.key);
								vu.storage.edit(uobj);
							}
							var aobj = {};
							aobj[stype] = aud.name;
							cb(aobj);
						}, stype, true);
					}
				}
			});
		},
		actor: function(a) {
			var _ = vu.builders.scene._, zcc = zero.core.current,
				gup = _.upstate, state = _.state(), r = zcc.room,
				az = state.actors = state.actors || {},
				bod = zcc.people[a.name].body, sz = bod.springs;
			az[a.name] = az[a.name] || {};
			az[a.name].positioners = az[a.name].positioners || {};
			return CT.dom.div([
				a.name,
				CT.dom.smartField({
					isTA: true,
					noBreak: true,
					classname: "w1",
					value: az[a.name].description,
					blurs: ["enter a short description", "describe this person"],
					cb: function(desc) {
						az[a.name].description = desc.trim();
						gup();
					}
				}),
				CT.dom.div([
					"weave",
					CT.dom.range(function(val) {
						sz.weave.target = parseInt(val);
					}, r.bounds.min.x, r.bounds.max.x,
						sz.weave.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"slide",
					CT.dom.range(function(val) {
						sz.slide.target = parseInt(val);
					}, r.bounds.min.z, r.bounds.max.z,
						sz.slide.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"orientation",
					CT.dom.range(function(val) {
						sz.orientation.target = parseInt(val);
					}, -Math.PI, Math.PI,
						sz.orientation.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.button("set initial position", function() {
					var posz = az[a.name].positioners
					for (axis of ["weave", "slide", "orientation"])
						az[a.name].positioners[axis] = sz[axis].target;
					gup();
				}, "w1")
			], "bordered padded margined round inline-block", null, {
				onclick: function() {
					zero.core.camera.follow(bod);
				}
			});
		},
		actors: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene, actor,
				az = CT.dom.div(scene.actors.map(_.actor));
			CT.dom.setContent(selz.actors, [
				CT.dom.button("add", function() {
					var akeys = scene.actors.map(a => a.key);
					CT.modal.choice({
						prompt: "please select an actor",
						data: vu.storage.get("people").filter(function(p) {
							return !akeys.includes(p.key);
						}),
						cb: function(perobj) {
							scene.actors.push(perobj);
							vu.storage.edit({
								key: scene.key,
								actors: scene.actors.map(a => a.key)
							});
							zero.core.util.join(perobj, function(person) {
								CT.dom.addContent(az, _.actor(perobj));
							});
						}
					});
				}, "abs ctr shiftup"),
				az
			]);
		},
		prop: function(p) {
			var zcc = zero.core.current, scene = zcc.scene,
				pobj = scene.props[p.name] = scene.props[p.name] || { name: p.name };
			return CT.dom.div([
				p.name,
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: pobj.description,
					blurs: ["enter a short description", "describe this prop"],
					cb: function(desc) {
						pobj.description = desc.trim();
						vu.storage.edit({
							key: scene.key,
							props: scene.props
						});
					}
				})
			], "bordered padded margined round", null, {
				onclick: function() {
					zero.core.camera.follow(zcc.room[p.name]);
				}
			});
		},
		props: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene,
				prop, pvalz = Object.values(scene.props),
				pz = CT.dom.div(pvalz.map(_.prop));
			CT.dom.setContent(selz.props, [
				CT.dom.button("add", function() {
					var pkeys = pvalz.map(p => p.key),
						data = zcc.room.objects.filter(function(p) {
							return !pkeys.includes(p.key);
						});
					data.length ? CT.modal.choice({
						prompt: "please select a prop",
						data: data,
						cb: function(furn) {
							zero.core.camera.follow(furn);
							CT.dom.addContent(pz, _.prop(furn));
						}
					}) : alert("add something on the zone page!");
				}, "abs ctr shiftup"),
				pz
			]);
		},
		item: function(iopts) { // also creates/places thing!!
			var r = zero.core.current.room,
				gup = vu.builders.scene._.upstate,
				item = new zero.core.Thing(CT.merge(iopts,
					vu.storage.get("held")[iopts.name]));
			return CT.dom.div([
				item.name,
				CT.dom.smartField({
					isTA: true,
					noBreak: true,
					classname: "w1",
					value: iopts.description,
					blurs: ["enter a short description", "describe this person"],
					cb: function(desc) {
						iopts.description = desc.trim();
						gup();
					}
				}),
				["x", "y", "z"].map(function(dim, i) {
					return CT.dom.div([
						dim,
						CT.dom.range(function(val) {
							item.adjust("position", dim, parseInt(val));
						}, r.bounds.min[dim], r.bounds.max[dim],
							iopts.position[i], 1, "w1 block")
					], "bordered padded margined round");
				}),
				CT.dom.button("set initial position", function() {
					var pos = item.position();
					iopts.position = [pos.x, pos.y, pos.z];
					gup();
				}, "w1")
			], "bordered padded margined round", null, {
				onclick: function() {
					zero.core.camera.follow(item);
				}
			});
		},
		items: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current,
				si = _.state(zcc.scene.name, "items"),
				iz = CT.dom.div(Object.values(si).map(_.item));
			CT.dom.setContent(selz.items, [
				CT.dom.button("add", function() {
					CT.modal.choice({
						prompt: "please select an item",
						data: Object.keys(vu.storage.get("held")),
						cb: function(iname) {
							si[iname] = {
								name: iname,
								position: [0, 0, 0]
							};
							CT.dom.addContent(iz, _.item(si[iname]));
						}
					})
				}, "right"),
				"Items",
				iz
			]);
		},
		lights: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene,
				lz = zcc.room.lights, state = _.state(scene.name);
			if (state.lights) {
				lz.forEach(function(l, i) {
					l.setIntensity(state.lights[i]);
				});
			}
			CT.dom.setContent(selz.lights, CT.dom.div([
				"Lights",
				CT.dom.div(lz.map(function(light, i) {
					return CT.dom.range(function(val) {
						light.setIntensity(parseInt(val) / 100);
					}, 0, 100, light.opts.intensity * 100, 1, "w1 block");
				}), "noflow"),
				CT.dom.button("set initial lighting", function() {
					state.lights = zcc.room.lights.map(l => l.opts.intensity);
					_.upstate();
				}, "w1")
			], "pt10"));
		},
		shifter: function(stpr, dir) {
			var _ = vu.builders.scene._, zcc = zero.core.current,
				arr = zcc.scene.scripts[zcc.script],
				i = CT.dom.childNum(stpr),
				el = arr.splice(i, 1)[0];
			if (dir == "up") {
				arr.splice(i - 1, 0, el);
				stpr.parentNode.insertBefore(stpr, stpr.previousSibling);
			} else {
				arr.splice(i + 1, 0, el);
				if (stpr.nextSibling.nextSibling)
					stpr.parentNode.insertBefore(stpr, stpr.nextSibling.nextSibling);
				else
					stpr.parentNode.appendChild(stpr);
			}
			_.upscripts();
		},
		stepper: function(s) {
			var _ = vu.builders.scene._, zcc = zero.core.current, k;
			var stpr = CT.dom.div([
				CT.dom.button("edit", function() {
					CT.modal.choice({
						prompt: "how would you like to modify this step?",
						data: ["add something", "remove entirely", "shift"],
						cb: function(etype) {
							if (etype == "remove entirely") {
								CT.data.remove(zcc.scene.scripts[zcc.script], s);
								_.upscripts();
							} else if (etype == "add something") {
								_.step(function(upz) {
									for (k in upz)
										s[k] = upz[k];
									CT.dom.replace(stpr, _.stepper(s));
									_.upscripts();
								}, s);
							} else { // shift
								if (stpr.nextSibling && stpr.previousSibling) {
									CT.modal.choice({
										prompt: "which direction?",
										data: ["up", "down"],
										cb: function(dir) {
											_.shifter(stpr, dir);
										}
									});
								} else if (stpr.nextSibling)
									_.shifter(stpr, "down");
								else if (stpr.previousSibling)
									_.shifter(stpr, "up");
								else
									alert("nowhere to shift! first, add another step!");
							}
						}
					});
				}, "right"),
				JSON.stringify(s).replace(/,/g, ",&#8203;")
			], "bordered padded margined round", null, {
				onclick: function() {
					vu.game.util.step(s, null, null, _.audio, {});
				}
			});
			return stpr;
		},
		steps: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				scene = zero.core.current.scene;
			selz.steps.refresh = function(sname) {
				zero.core.current.script = sname;
				var stez = CT.dom.div(scene.scripts[sname].map(_.stepper),
					"nonowrap");
				CT.dom.setContent(selz.steps, [
					CT.dom.div([
						CT.dom.button("add step", function() {
							_.step(function(step) {
								CT.dom.addContent(stez, _.stepper(step));
								scene.scripts[sname].push(step);
								_.upscripts();
							});
						}),
						CT.dom.button("play all", function() {
							vu.game.util.script(scene.scripts[sname],
								null, null, _.audio);
						})
					], "abs ctr shiftup"),
					stez
				]);
			};
		},
		backstage: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene;
			_.props();
			_.items();
			_.lights();
			_.actors();
			zcc.room.setFriction(false); // for positioning......
			vu.controls.initCamera(selz.cameras);
			CT.dom.addContent(selz.props, selz.items);
			CT.dom.addContent(selz.main, selz.lights);
		}
	},
	load: function(scene) {
		var _ = vu.builders.scene._, selz = _.selectors,
			snode = CT.dom.div(null, "right"), upscripts = _.upscripts;
		zero.core.current.scene = scene;
		_.audio = new vu.audio.Controller({
			fx: scene.fx,
			music: scene.music,
			ambient: scene.ambient
		});
		CT.dom.setContent(selz.main, [
			CT.dom.div(scene.name, "bigger"),
			scene.description,
			"room: " + scene.room.name,
			CT.dom.br(),
			snode,
			"Scripts",
			selz.scripts
		]);
		_.steps();

		if (!Object.keys(scene.scripts).length)
			scene.scripts.start = [];
		vu.core.fieldList(selz.scripts, Object.keys(scene.scripts), null, function(v) {
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					CT.dom.setContent(snode, f._trigger);
					selz.steps.refresh(f._trigger);
				};
				f.onkeyup = function() {
					if (f.value) {
						f.value = f.value.toLowerCase();
						scene.scripts[f.value] = scene.scripts[f._trigger];
						delete scene.scripts[f._trigger];
						CT.dom.setContent(snode, f.value);
						f._trigger = f.value;
						upscripts();
					} else
						f.value = f._trigger; // meh
				};
			} else {
				f.onkeyup = function() { f.value = f.value.toLowerCase() };
			}
			return f;
		}, function(iput) {
			var key = iput.value;
			if (key in scene.scripts) return; // already exists...
			scene.scripts[key] = [];
			setTimeout(function() {
				iput.focus();
			});
		}, function(val) {
			delete scene.scripts[val];
			upscripts();
		});

		vu.builders.scene.build();
	},
	build: function() {
		var cfg = core.config.ctzero, pobj,
			scene = zero.core.current.scene;
		cfg.room = scene.room;
		cfg.people = scene.actors;
		for (pobj of cfg.people)
			pobj.positioners = scene.game.initial.actors[pobj.name].positioners;
		zero.core.util.init(null, vu.builders.scene._.backstage);
	},
	setup: function() {
		var skey = location.hash.slice(1),
			selz = vu.builders.scene._.selectors;
		if (!skey)
			return alert("no scene specified!");
		selz.main = CT.dom.div();
		selz.scripts = CT.dom.div();
		selz.steps = CT.dom.div();
		selz.actors = CT.dom.div();
		selz.props = CT.dom.div();
		selz.items = CT.dom.div();
		selz.lights = CT.dom.div();
		selz.cameras = CT.dom.div(null, "centered");
		CT.db.one(skey, vu.builders.scene.load, "json_plus");
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		vu.builders.scene.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};