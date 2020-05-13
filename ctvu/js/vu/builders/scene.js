vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			main: "topleft",
			lights: "topright",
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
		step: function(cb, cur) {
			var zcc = zero.core.current;
			CT.modal.choice({
				prompt: "please select a variety",
				data: ["lights", "camera", "action", "text"].filter(function(st) { // +props,state
					return !cur || !(st in cur);
				}),
				cb: function(stype) {
					if (stype == "action") {
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
												prompt: "please select a target",
												data: zcc.scene.actors.filter(function(a) {
													return a.name != actor.name;
												}),
												cb: function(target) {
													act(target.name);
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
							data: ["behind", "pov", "rotate",
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
					}
				}
			});
		},
		actor: function(a) {
			var zcc = zero.core.current, pz = zcc.people, r = zcc.room;
			return CT.dom.div([
				a.name,
				CT.dom.div([
					"weave",
					CT.dom.range(function(val) {
						pz[a.name].body.springs.weave.target = parseInt(val);
					}, r.bounds.min.x, r.bounds.max.x, 0/*?*/, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"slide",
					CT.dom.range(function(val) {
						pz[a.name].body.springs.slide.target = parseInt(val);
					}, r.bounds.min.z, r.bounds.max.z, 0/*?*/, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"orientation",
					CT.dom.range(function(val) {
						pz[a.name].body.springs.orientation.target = parseInt(val);
					}, -3, 3, 0/*?*/, 1, "w1 block")
				], "bordered padded margined round")
			], "bordered padded margined round inline-block");
		},
		actors: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				scene = zero.core.current.scene,
				az = CT.dom.div(scene.actors.map(_.actor));
			CT.dom.setContent(selz.actors, [
				CT.dom.button("add", function() {
					var akeys = scene.actors.map(function(a) {
						return a.key;
					});
					CT.modal.choice({
						prompt: "please select an actor",
						data: vu.storage.get("people").filter(function(p) {
							return !akeys.includes(p.key);
						}),
						cb: function(person) {
							scene.actors.push(person);
							CT.dom.addContent(az, _.actor(person));
							vu.storage.edit({
								key: scene.key,
								actors: scene.actors.map(function(a) {
									return a.key;
								})
							});
						}
					});
				}, "abs ctr shiftup"),
				az
			]);
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
					vu.game.util.step(s);
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
							vu.game.util.script(scene.scripts[sname]);
						})
					], "abs ctr shiftup"),
					stez
				]);
			};
		},
		backstage: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene;
			_.actors();
			zcc.room.setFriction(false); // for positioning......
			vu.controls.initCamera(selz.cameras);
			CT.dom.setContent(selz.lights, [
				CT.dom.div(zcc.room.lights.map(function(light) {
					return CT.dom.range(function(val) {
						light.setIntensity(parseInt(val) / 100);
					}, 0, 100, light.opts.intensity * 100, 1, "w1 block");
				}), "noflow"),
				CT.dom.br(),
				"Props [TODO]",
				selz.props
			]);
		}
	},
	load: function(scene) {
		var _ = vu.builders.scene._, selz = _.selectors,
			snode = CT.dom.div(null, "right"), upscripts = _.upscripts;
		zero.core.current.scene = scene;
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
		var cfg = core.config.ctzero,
			scene = zero.core.current.scene;
		cfg.room = scene.room;
		cfg.people = scene.actors;
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
		selz.lights = CT.dom.div();
		selz.cameras = CT.dom.div(null, "centered");
		CT.db.one(skey, vu.builders.scene.load, "json");
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