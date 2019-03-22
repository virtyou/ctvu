vu.builders.zone = {
	_: {
		opts: core.config.ctvu.builders.room,
		furniture: core.config.ctvu.builders.furniture,
		selectors: {},
		menus: {
			cameras: "top",
			basic: "topleft",
			lights: "bottomleft",
			controls: "bottomright",
			furnishings: "topright"
		},
		lightdirs: {
			point: "Position",
			directional: "Direction"
		},
		starter: {
			environment: "one.box",
			cameras: [
				[0, 32, 120],
				[256, 256, 256],
				[256, -256, 256],
				[-256, 256, 256],
				[-256, -256, 256],
				[256, 256, -256],
				[256, -256, -256],
				[-256, 256, -256],
				[-256, -256, -256]
			]
		},
		furnishings_depped: function() {
			var _ = vu.builders.zone._, pool = _.furniture.pool,
				fz = _.furniture = vu.storage.get("furnishing") || _.furniture;

			// TODO: handle furniture properly ... just pool for now
			var ptoggle = _.selectors.pool = CT.dom.checkboxAndLabel(null,
				!!_.opts.objects.length, "Pool", null, null, function() {
					if (ptoggle.isChecked() != !!_.opts.objects.length) {
						_.opts.objects = ptoggle.isChecked() ? [pool] : [];
						if (pool.key) { // remote mode!!
							if (ptoggle.isChecked()) {
								vu.storage.edit({
									base: pool.key,
									parent: _.opts.key,
									modelName: "furnishing"
								}, function(furn) {
									ptoggle._pool = furn;
								});
							} else
								vu.storage.edit(ptoggle._pool.key, null, "delete", "key");
						} else
							vu.storage.save(_.opts, null, "room", { objects: _.opts.objects });
						if (ptoggle.isChecked())
							zero.core.current.room.addObject(pool);
						else
							zero.core.current.room.removeObject(pool);
					}
				});
			if (_.opts.objects.length)
				ptoggle._pool = _.opts.objects[0];
		},
		unfurn: function(furn) {
			return CT.dom.button("remove " + furn.opts.kind, function() {
				zero.core.current.room.removeObject(furn);
				vu.builders.zone._.selectors.furnishings.update();
				vu.storage.edit(furn.opts.key, null, "delete", "key");
			}, "up5 right");
		},
		fscale: function(furn) {
			return CT.dom.div([
				"Scale",
				CT.dom.range(function(val) {
					var fval = parseFloat(val);
					furn.scale(fval);
					furn.setBounds(true); // TODO: maybe move to zero.core.Thing.scale()?
					vu.storage.setOpts(furn.opts.key, {
						scale: [fval, fval, fval]
					});
				}, 0, 10, furn.scale().x, 0.01, "w1")
			], "topbordered padded margined");
		},
		poster: function(poster) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(poster),
			 	poster.name,
			 	_.fscale(poster)
			 ];
		},
		portal: function(portal) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(portal),
			 	portal.name,
			 	_.fscale(portal)
			 ];
		},
		furnishing: function(furn) {
			var _ = vu.builders.zone._;
			return [
				_.unfurn(furn),
				furn.name,
				_.fscale(furn),
				CT.dom.div([
					"Rotation",
					CT.dom.range(function(val) {
						var rot = [0, parseFloat(val), 0];
						furn.rotation(rot);
						vu.storage.setOpts(furn.opts.key, {
							rotation: rot
						});
					}, 0, 6, furn.rotation().y, 0.01, "w1")
				], "topbordered padded margined")
			];
		},
		furn: function(furn) {
			return CT.dom.div(vu.builders.zone._[furn.opts.kind](furn), "margined padded bordered round");
		},
		furnishings: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			selz.furnishings = CT.dom.div();
			selz.furnishings.update = function() {
				CT.dom.setContent(selz.furnishings, [
					CT.dom.button("add", function() {
						vu.core.choice({
							data: ["furnishing", "poster", "portal"],
							cb: function(kind) {
								vu.core.choice({
									data: Object.values(vu.storage.get(kind)),
									cb: function(thing) {
										var eopts = {
											base: thing.key,
											parent: _.opts.key,
											modelName: "furnishing"
										};
										if (kind == "poster") { // TODO: probs do this elsewhere/better!
											eopts.opts = {
												wall: 0,
												planeGeometry: [100, 100]
											};
										} else if (kind == "portal")
											eopts.opts = { wall: 0 };
										vu.storage.edit(eopts, function(furn) {
											var f = zero.core.current.room.addObject(CT.merge(furn, furn.opts, thing), function() {
												f.setBounds(); // TODO: this should probably be in zero.core.Room
												selz.controls.update(f);
												selz.furnishings.update();
											});
										});
									}
								});
							}
						});
					}, "up20 right"),
					zero.core.current.room.objects.map(_.furn)
				]);
			};
		},
		posup: function() {
			var _ = vu.builders.zone._, target = _.controls.target,
				pos = target.position(), opts = {
					position: [pos.x, pos.y, pos.z]
				};
			if ("wall" in target.opts)
				opts.wall = target.opts.wall;
			vu.storage.setOpts(target.opts.key, opts);
			_.selectors.controls.update();
		},
		controls: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			_.controls = new zero.core.Controls({
				cb: _.posup
			});
			selz.controls = CT.dom.div();
			selz.controls.update = function(target) {
				if (!target) {
					target = vu.builders.current.person;
					zero.core.camera.follow(target.body.looker);
				} else
					zero.core.camera.follow(target);
				_.controls.setTarget(target);
				CT.dom.setContent(selz.controls, [
					CT.dom.div(target.name, "bigger"),
					target.body ? [
						"(for scale)",
						"move around with arrow keys",
						"1-9 for gestures (0 to ungesture)",
						"1-9 + SHIFT for dances (0 to undance)"
					] : [
						"move around with arrow keys",
						"press ENTER to save position"
					]
				]);
			};
		},
		setup: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			_.opts = vu.storage.get("room") || _.opts;

			selz.name = CT.dom.smartField(function(val) {
				if (_.opts && (_.opts.name != val)) {
					vu.builders.zone.persist({
						name: val
					});
					_.opts.name = val;
				}
			}, "w1", null, null, null, core.config.ctvu.blurs.name);

			_.furnishings();
			_.lights();
			_.cameras();
			_.controls();

			var enz = core.config.ctvu.loaders.environments;
			var eselector = selz.environment = CT.dom.select(enz.map(function(item) {
				return item.slice(item.indexOf(".") + 1);
			}), enz, null, _.opts.environment, null, function() {
				if (_.opts.environment != eselector.value) {
					_.opts.environment = eselector.value;
					vu.builders.zone.persist({
						environment: eselector.value
					});
//					vu.storage.save(ropts, null, "room",
//						{ opts: { environment: eselector.value } });
					zero.core.util.room(_.opts);
				}
			});

			selz.base = CT.dom.div();
			selz.base.update = function() {
				var content = [
					CT.dom.button("swap", function() {
						vu.core.choice({
							data: ["wallpaper", "shell"],
							cb: function(variety) {
								vu.core.choice({
									data: Object.values(vu.storage.get(variety)),
									cb: function(base) {
										_.opts.thing_key = base.key;
										if (base.texture)
											_.opts.texture = base.texture;
										if (base.stripset)
											_.opts.stripset = base.stripset;
										selz.base.update();
										vu.builders.zone.update();
										vu.builders.zone.persist({
											base: base.key
										});
									}
								});
							}
						});
					}, "up20 right")
				];
				if (_.opts.thing_key) {
					var thing = CT.data.get(_.opts.thing_key);
					content.push(thing.name + " (" + thing.kind + ")");
				}
				CT.dom.setContent(selz.base, content);
			};

			selz.scale = CT.dom.div();
			selz.scale.update = function() {
				var room = zero.core.current.room,
					scale = room.scale(),
					scopts = [scale.x, scale.y, scale.z];
				CT.dom.setContent(selz.scale, ["x", "y", "z"].map(function(dim, i) {
					return [
						dim,
						CT.dom.range(function(val) {
							val = parseFloat(val);
							scopts[i] = val;
							room.updateCams = true;
							room.adjust("scale", dim, val);
							room.setBounds();
							vu.storage.setOpts(_.opts.key, {
								scale: scopts
							});
						}, 0.3, 3, scale[dim], 0.01, "w1")
					];
				}));
			};

			selz.basic = [
				CT.dom.div([
					"Name",
					selz.name
				], "padded bordered round mb5"),
				CT.dom.div([
					CT.dom.span("Environment"),
					CT.dom.pad(),
					selz.environment
				], "padded bordered round mb5"),
				CT.dom.div([
					"Base",
					selz.base
				], "padded bordered round mb5 base"),
				CT.dom.div([
					"Scale",
					selz.scale
				], "padded bordered round nonowrap")
			];
		},
		setColor: function(target, color, prop) {
			var copts = {};
			if (target.material) { // object
				target.material.color = vu.color.hex2rgb(color);
				color = parseInt(color.slice(1), 16);
				copts[prop] = color;
				vu.storage.setMaterial(target.opts.key, copts);
			} else // light
				target.setColor(vu.color.hex2rgb(color));
		},
		colorSelector: function(target, prop, lnum) {

			// TODO: fix color selection!!!!

			var _ = vu.builders.zone._, selz = _.selectors,
				bcolor, scolor, room = zero.core.current.room;
			if (target.material) // object
				bcolor = target.thring.material[prop] || "#111111";
			else // light
				bcolor = target.opts.color || "#111111";
			scolor = (typeof bcolor == "string") ? bcolor : ("#" + bcolor.toString(16));
			if (!prop)
				prop = "light " + lnum;
			var cnode = vu.color.picker(prop + " selector", scolor, function() {
				_.setColor(target, cnode.value, prop);
			});
			return cnode;
		},
		lights: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				room, color, intensity, content;
			selz.lights = CT.dom.div();
			selz.lights.update = function() {
				room = zero.core.current.room;
				CT.dom.setContent(selz.lights, [
					CT.dom.button("add", function() {
						vu.core.choice({
							data: ["ambient", "directional", "point"],
							cb: function(variety) {
								room.addLight({
									variety: variety
								});
								selz.lights.update();
							}
						});
					}, "vcrunch right"),
					room.lights.map(function(light, i) {
						color = _.colorSelector(light, null, i);
						intensity = CT.dom.range(function(val) {
							light.setIntensity(val);
						}, 0, 1, light.opts.intensity, 0.01, "w1");
						content = [
							CT.dom.button("remove", function() {
								room.removeLight(light);
								selz.lights.update();
							}, "up5 right"),
							light.opts.variety,
							CT.dom.div([
								"Color",
								color
							], "topbordered padded margined"),
							CT.dom.div([
								"Intensity",
								intensity
							], "topbordered padded margined")
						];
						if (light.opts.variety != "ambient") {
							var pos = light.position();
							content.push(CT.dom.div([
								_.lightdirs[light.opts.variety],
								CT.dom.div(["x", "y", "z"].map(function(dim, i) {
									return [
										dim,
										CT.dom.range(function(val) {
											light.thring.position[dim] = val;
											// TODO: persist
										}, -256, 256, pos[dim], 0.1, "w1")
									];
								}))
							], "topbordered padded margined"));
						}
						return CT.dom.div(content, "margined padded bordered round");
					})
				]);
			};
		},
		cameras: function() {
			var _ = vu.builders.zone._, cycbutt = CT.dom.button("cycle", function() {
				if (cycbutt._cycler) {
					clearInterval(cycbutt._cycler);
					delete cycbutt._cycler;
					cycbutt.innerHTML = "cycle";
				} else {
					cycbutt._cycler = setInterval(zero.core.current.room.cut, 3000);
					cycbutt.innerHTML = "stop cycling";
				}
			}), pov = CT.dom.button("pov", function() {
				zero.core.camera.setSprings(200);
				zero.core.camera.perspective(vu.builders.current.person);
			}), selz = _.selectors, room;
			selz.cameras = CT.dom.div();
			selz.cameras.update = function() {
				room = zero.core.current.room;
				CT.dom.setContent(selz.cameras, [
					CT.dom.div([
						cycbutt,
						CT.dom.button("refresh", function() {
							room.updateCameras();
							selz.cameras.update();
							vu.builders.zone.persist({
								cameras: room.cameras
							});
						})
					], "right up20"),
					CT.dom.div([pov].concat(room.cameras.map(function(cam, i) {
						return CT.dom.button("cam " + i, function() {
							zero.core.camera.setSprings(20);
							zero.core.camera.perspective();
							room.cut(i);
						});
					})), "centered clearnode")
				]);
			};
		},
		set: function(room, noUpdate) {
			var _ = vu.builders.zone._, selz = _.selectors, upmenus = function() {
				selz.base.update();
				selz.scale.update();
				selz.lights.update();
				selz.cameras.update();
				selz.controls.update();
				selz.furnishings.update();
			}, name = room.name || room.environment;
			_.opts = room;
			CT.dom.setContent(_.curname, name);
			selz.name.value = name;
			selz.environment.value = room.environment;
			noUpdate ? upmenus() : vu.builders.zone.update(upmenus);
		},
		build: function() {
			var _ = vu.builders.zone._;
			vu.core.prompt({
				prompt: "what's the new zone's name?",
				cb: function(name) {
					vu.core.v(CT.merge({
						action: "room",
						name: name,
						owner: user.core.get("key")
					}, _.starter), function(room) {
						var ropts = CT.merge(room, room.opts);
						vu.storage.get("rooms").push(ropts);
						CT.data.add(ropts);
						_.set(ropts);
					});
				}
			});
		},
		select: function() {
			var _ = vu.builders.zone._,
				zones = vu.storage.get("rooms");
			vu.core.choice({
				prompt: "select zone",
				data: [{ name: "new zone" }].concat(zones),
				cb: function(zone) {
					if (zone.name == "new zone")
						return _.build();
					_.set(zone);
				}
			});
		},
		linx: function() {
			var _ = vu.builders.zone._, popts = vu.storage.get("person");
			_.curname = CT.dom.span(null, "bold");
			// add person for scale
			popts.body.onclick = function() {
				_.selectors.controls.update();
			};
			zero.core.util.join(vu.core.person(popts), function(person) {
				vu.builders.current.person = person;
				vu.builders.zone._.set(vu.storage.get("room"), true);
			});
			return CT.dom.div([[
				CT.dom.span("viewing:"),
				CT.dom.pad(),
				_.curname
			], CT.dom.link("swap", _.select)], "left shiftall");
		}
	},
	persist: function(updates) { // NB: this only works in remote mode, screw it ;)
		vu.storage.edit(CT.merge(updates, {
			key: vu.builders.zone._.opts.key
		}));
	},
	update: function(cb) {
		zero.core.util.room(CT.merge({
			onbuild: function(room) {
				room.objects.forEach(function(furn) {
					zero.core.click.register(furn, function() {
						vu.builders.zone._.selectors.controls.update(furn);
					});
				});
				cb && cb();
			}
		}, vu.builders.zone._.opts));
	},
	menus: function() {
		var section, _ = vu.builders.zone._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};