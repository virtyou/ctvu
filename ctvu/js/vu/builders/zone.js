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
			furnishings: "topright",
			portal_requests: "bottom"
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
		unfurn: function(furn) {
			var msg = "really remove this " + furn.opts.kind;
			if (furn.opts.kind == "portal")
				msg += " and all incoming/outgoing linkages";
			msg += "?";
			return CT.dom.button("remove " + furn.opts.kind, function() {
				if (!confirm(msg)) return;
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
		portin: function(door) {
			var _ = vu.builders.zone._, source, rsource, snode,
				n = CT.dom.div(), pz = door.opts.portals.incoming;
			CT.db.multi(pz.map(function(p) {
				return p.source;
			}), function() {
				CT.dom.setContent(n, pz.map(function(p) {
					source = CT.data.get(p.source);
					rsource = CT.data.get(source.parent);
					snode = CT.dom.div([
						CT.dom.link("X", function() {
							if (!confirm("really unlink?")) return;
							vu.storage.edit({
								key: p.key,
								target: _.opts.key // demoted to room incoming
							}, function() {
								snode.remove();
								CT.data.remove(pz, p);
								p.target = _.opts.key;
								_.opts.portals.push(p);
								_.selectors.portal_requests.update();
							});
						}, null, "right red"),
						rsource.name + " (" + source.name + ")"
					]);
					return snode;
				}));
			}, "json");
			return n;
		},
		portout: function(door) {
			var n = CT.dom.div(), og, out, name, sel = function() {
				vu.core.choice({
					data: vu.storage.get("allrooms"),
					cb: function(room) {
						og = door.opts.portals.outgoing;
						out = {};
						if (og)
							out.key = og.key;
						else {
							out.modelName = "portal";
							out.source = door.opts.key;
						}
						out.target = room.key;
						vu.storage.edit(out, function(pdata) {
							door.opts.portals.outgoing = pdata;
							room.portals.push(pdata);
							setP();
						});
					}
				});
			}, setP = function() {
				if (door.opts.portals.outgoing) {
					CT.db.one(door.opts.portals.outgoing.target, function(target) {
						if (target.owner) // room
							name = target.name + " (pending)";
						else
							name = CT.data.get(target.parent).name + " (" + target.name + ")";
						CT.dom.setContent(n, CT.dom.link(name, sel));
					}, "json");
				} else
					CT.dom.setContent(n, CT.dom.link("select", sel));
			};
			setP();
			return n;
		},
		plinx: function(portal) {
			var _ = vu.builders.zone._;
			return [
				CT.dom.div([
					"Outgoing",
					_.portout(portal)
				], "topbordered padded margined"),
				CT.dom.div([
					"Incoming",
					_.portin(portal)
				], "topbordered padded margined")
			];
		},
		preqs: function() { // incoming portal requests
			var _ = vu.builders.zone._, selz = _.selectors;
			selz.portal_requests = CT.dom.div();
			selz.portal_requests.update = function() {
				CT.db.multi(_.opts.portals.map(function(p) {
					return p.source;
				}), function() {
					CT.dom.setContent(selz.portal_requests, _.opts.portals.map(function(p) {
						var source = CT.data.get(p.source),
							rsource = CT.data.get(source.parent),
							n = CT.dom.div([
								rsource.name + " (" + source.name + ")",
								CT.dom.link("ACCEPT", function() {
									vu.core.choice({
										data: ["new portal"].concat(_.opts.objects.filter(function(f) {
											return f.kind == "portal";
										})),
										cb: function(port) {
											var pup = function(pthing, upfurn) {
												vu.storage.edit({
													key: p.key,
													target: pthing.opts.key
												}, function() {
													n.remove();
													p.target = pthing.opts.key;
													CT.data.remove(_.opts.portals, p);
													pthing.opts.portals.incoming.push(p);
													selz.portal_requests.update();
													upfurn && selz.furnishings.update();
												});
											};
											if (port == "new portal")
												_.selfurn("portal", pup);
											else
												pup(zero.core.Thing.get(port.key), true);
										}
									});
								}),
								CT.dom.pad(),
								CT.dom.link("REJECT", function() {
									if (!confirm("really reject?")) return;
									n.remove();
									CT.data.remove(_.opts.portals, p);
									vu.storage.edit(p.key, null, "delete", "key");
								})
							]);
						return n;
					}));
				}, "json");
			};
		},
		portal: function(portal) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(portal),
			 	portal.name,
			 	_.fscale(portal),
			 	_.plinx(portal)
			 ];
		},
		poster: function(poster) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(poster),
			 	poster.name,
			 	_.fscale(poster)
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
		selfurn: function(kind, cb) {
			var _ = vu.builders.zone._, selz = _.selectors;
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
						var f = zero.core.current.room.addObject(furn, function() {
							f.setBounds(); // TODO: this should probably be in zero.core.Room
							cb && cb(f);
							selz.controls.update(f);
							selz.furnishings.update();
						});
					});
				}
			});
		},
		furnishings: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			selz.furnishings = CT.dom.div();
			selz.furnishings.update = function() {
				CT.dom.setContent(selz.furnishings, [
					CT.dom.button("add", function() {
						vu.core.choice({
							data: ["furnishing", "poster", "portal"],
							cb: _.selfurn
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
			_.preqs();

			var enz = core.config.ctvu.loaders.environments;
			var eselector = selz.environment = CT.dom.select(enz.map(function(item) {
				return item.slice(item.indexOf(".") + 1);
			}), enz, null, _.opts.environment, null, function() {
				if (_.opts.environment != eselector.value) {
					_.opts.environment = eselector.value;
					vu.builders.zone.persist({
						environment: eselector.value
					});
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
										var upobj = {};
										_.opts.thing_key = base.key;
										if (base.texture)
											upobj.texture = _.opts.texture = base.texture;
										if (base.stripset)
											upobj.stripset = _.opts.stripset = base.stripset;
										selz.base.update();
										zero.core.current.room.update(upobj);
//										vu.builders.zone.update();
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
							room.adjust("scale", dim, val, true);
							room.setBounds();
							room.updateCameras();
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
				selz.portal_requests.update();
			}, name = room.name || room.environment;
			_.opts = room;
			vu.core.setroom(room);
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
						vu.storage.get("rooms").push(room);
						vu.storage.get("allrooms").push(room);
						CT.data.add(room);
						_.set(room);
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
				vu.builders.current.person = zero.core.current.person = person;
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