vu.builders.zone = {
	_: {
		opts: core.config.ctvu.builders.room,
		furniture: core.config.ctvu.builders.furniture,
		selectors: {},
		menus: {
			cameras: "top",
			basic: "topleft",
			structural: "topleft",
			lights: "topright",
			controls: "bottomright",
			furnishings: "topright",
			minimap: "bottom",
			portal_requests: "bottomleft"
		},
		swappers: ["furnishings", "lights", "basic", "structural"],
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
		fscale: function(furn, cb, min, max, unit) {
			return CT.dom.div([
				"Scale",
				CT.dom.range(function(val) {
					var fval = parseFloat(val);
					furn.scale(fval);
					furn.setBounds(true); // TODO: maybe move to zero.core.Thing.scale()?
					cb ? cb(fval) : vu.storage.setOpts(furn.opts.key, {
						scale: [fval, fval, fval]
					});
				}, min || 0.1, max || 16, furn.scale().x, unit || 0.01, "w1")
			], "topbordered padded margined");
		},
		rtilt: function(ramp, cb) {
			var unit = Math.PI / 16;
			return CT.dom.div([
				"Tilt",
				CT.dom.range(function(val) {
					var fval = parseFloat(val);
					ramp.adjust("rotation", "x", fval);
					ramp.setBounds(true);
					cb(fval);
				}, unit * 4, unit * 12, ramp.rotation().x, unit, "w1")
			], "topbordered padded margined");
		},
		plevel: function(furn, cb) {
			var rbz = zero.core.current.room.bounds;
			return CT.dom.div([
				"Level",
				CT.dom.range(function(val) {
					var fval = parseInt(val);
					furn.adjust("position", "y", fval);
					if (cb)
						cb(fval);
					else {
						var fp = furn.position();
						vu.storage.setOpts(furn.opts.key, {
							position: [fp.x, fp.y, fp.z]
						});
					}
				}, rbz.min.y, rbz.max.y, furn.position().y, 1, "w1")
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
				CT.modal.choice({
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
						if (target.kind != "portal")
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
									CT.modal.choice({
										data: ["new portal"].concat(_.opts.objects.filter(function(f) {
											return f.kind == "portal";
										})),
										cb: function(port) {
											var pup = function(pthing) {
												vu.storage.edit({
													key: p.key,
													target: pthing.opts.key
												}, function() {
													n.remove();
													p.target = pthing.opts.key;
													CT.data.remove(_.opts.portals, p);
													pthing.opts.portals.incoming.push(p);
													selz.portal_requests.update();
													selz.furnishings.update();
												});
											};
											if (port == "new portal")
												_.selfurn("portal", pup);
											else
												pup(zero.core.Thing.get(port.key));
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
		fname: function(furn) {
			var n = CT.dom.div(furn.name);
			n.onclick = function() {
				vu.builders.zone._.selectors.controls.update(furn);
			};
			return n;
		},
		portal: function(portal) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(portal),
			 	_.fname(portal),
			 	_.fscale(portal),
			 	_.materials(portal),
			 	_.plinx(portal)
			 ];
		},
		poster: function(poster) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(poster),
			 	_.fname(poster),
			 	_.fscale(poster),
			 	_.materials(poster)
			 ];
		},
		vidsel: function(scr) {
			var opts = CT.data.get(scr.opts.key);
			return vu.media.selector(opts, "video", function() {
				vu.storage.setOpts(scr.opts.key, {
					video: opts.video
				});
				scr.unvideo();
				opts.video.item && scr.update({ video: opts.video });
			}, true);
		},
		fznsel: function(stream) {
			var opts = CT.data.get(stream.opts.key),
				chan = opts.video && opts.video.slice(4),
				cnode = CT.dom.node(chan, "b");
			return CT.dom.div([
				[
					CT.dom.span("fzn channel:"),
					CT.dom.pad(),
					cnode
				],
				CT.dom.smartField(function(val) {
					cnode.innerHTML = val;
					opts.video = "fzn:" + val;
					vu.storage.setOpts(opts.key, {
						video: opts.video
					});
					val && stream.update({ video: opts.video });
				}, "w1", null, chan)
			], "topbordered padded margined");
		},
		screen: function(scr) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(scr),
			 	_.fname(scr),
			 	_.fscale(scr),
			 	_.materials(scr),
			 	_.vidsel(scr)
			 ];
		},
		stream: function(scr) {
			 var _ = vu.builders.zone._;
			 return [
			 	_.unfurn(scr),
			 	_.fname(scr),
			 	_.fscale(scr),
			 	_.materials(scr),
			 	_.fznsel(scr)
			 ];
		},
		struct: function(variety, fopts, i) {
			var _ = vu.builders.zone._,
				item = zero.core.current.room[variety + i],
				s3 = variety == "obstacle";
			var cont = [
				_.fname(item),
				_[s3 ? "scalers" : "fscale"](item, function(scale) {
					fopts.scale = s3 ? scale : [scale, scale, scale];
					_.strup(variety);
				}, 5, 500, 5),
				_.plevel(item, function(yval) {
					fopts.position[1] = yval;
					_.strup(variety);
				})
			], rot, ry;
			if (variety == "wall") {
				cont.push(CT.dom.button("rotate", function() {
					rot = item.rotation();
					ry = rot.y ? 0 : Math.PI / 2;
					item.adjust("rotation", "y", ry);
					fopts.rotation = [rot.x, ry, rot.z];
					_.strup(variety);
				}, "w1"));
			} else if (variety == "ramp") {
				cont.push(_.rtilt(item, function(rot) {
					fopts.rotation = [rot, 0, 0];
					_.strup(variety);
				}));
			}
			return cont;
		},
		wall: function(fopts, i) {
			return vu.builders.zone._.struct("wall", fopts, i);
		},
		ramp: function(fopts, i) {
			return vu.builders.zone._.struct("ramp", fopts, i);
		},
		floor: function(fopts, i) {
			return vu.builders.zone._.struct("floor", fopts, i);
		},
		obstacle: function(fopts, i) {
			return vu.builders.zone._.struct("obstacle", fopts, i);
		},
		furnishing: function(furn) {
			var _ = vu.builders.zone._;
			return [
				_.unfurn(furn),
				_.fname(furn),
				_.fscale(furn),
				(furn.opts.name == "pool") && _.plevel(furn), // eh do better...
				CT.dom.div([
					"Rotation",
					CT.dom.range(function(val) {
						var rot = [0, parseFloat(val), 0];
						furn.rotation(rot);
						vu.storage.setOpts(furn.opts.key, {
							rotation: rot
						});
					}, 0, 6, furn.rotation().y, 0.01, "w1")
				], "topbordered padded margined"),
			 	furn.opts.material && _.materials(furn)
			];
		},
		furn: function(furn) {
			return CT.dom.div(vu.builders.zone._[furn.opts.kind](furn), "margined padded bordered round");
		},
		part: function(thing, kind, cb) {
			var _ = vu.builders.zone._, selz = _.selectors, eopts = {
				parent: _.opts.key,
				modelName: "furnishing"
			}, zccr = zero.core.current.room;
			if (thing) // not required for screen
				eopts.base = thing.key;
			if (kind == "poster" || kind == "screen" || kind == "stream") { // TODO: probs do this elsewhere/better!
				eopts.opts = {
					wall: 0,
					planeGeometry: [100, 100] // TODO: should derive from img/video dims
				};
				if (kind != "poster") {
					eopts.opts.name = kind + Math.floor(Math.random() * 1000);
					eopts.opts.kind = kind; // no base necessary...
				}
			} else if (kind == "portal")
				eopts.opts = { wall: 0 };
			if (thing && zccr[thing.name]) {
				eopts.opts = eopts.opts || {};
				if (!eopts.opts.name) {
					var altname = thing.name;
					while (altname in zccr)
						altname += "_";
					eopts.opts.name = altname;
				}
			}
			vu.storage.edit(eopts, function(furn) {
				var f = zccr.addObject(furn, function() {
					_.regObj(f);
					f.setBounds(); // TODO: this should probably be in zero.core.Room
					cb && cb(f);
					selz.controls.update(f);
					selz.furnishings.update();
				});
			});
		},
		selfurn: function(kind, cb) {
			var _ = vu.builders.zone._;
			if (kind == "screen" || kind == "stream")
				return _.part(null, kind, cb);
			var options = vu.storage.get(kind);
			if (!options)
				return alert("add something on the item page!");
			CT.modal.choice({
				data: Object.values(options),
				cb: function(thing) {
					_.part(thing, kind, cb);
				}
			});
		},
		furnishings: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			selz.furnishings = CT.dom.div();
			selz.furnishings.update = function() {
				CT.dom.setContent(selz.furnishings, [
					CT.dom.button("add", function() {
						CT.modal.choice({
							data: ["furnishing", "poster", "portal", "screen", "stream"],
							cb: _.selfurn
						});
					}, "up20 right"),
					zero.core.current.room.objects.map(_.furn)
				]);
			};
		},
		strup: function(variety) {
			var ro = zero.core.current.room.opts, d = {};
			vu.builders.zone._.opts[variety] = d[variety] = ro[variety];
			vu.storage.setOpts(ro.key, d);
		},
		structs: function(variety) {
			var _ = vu.builders.zone._, selz = _.selectors,
				zcc = zero.core.current, zccr, voz, fpz, flo,
				plur = variety + "s",
				sel = selz[plur] = CT.dom.div();
			sel.update = function() {
				zccr = zcc.room;
				voz = zccr.opts[variety] = zccr.opts[variety] || {
					parts: [],
					material: {
						side: THREE.DoubleSide
					}
				};
				if (variety == "obstacle")
					voz.dimensions = [10, 10, 10, 1, 1];
				fpz = voz.parts;
				CT.dom.setContent(sel, [
					CT.dom.button("add", function() {
						flo = {
							position: [0, 0, 0]
						};
						if (variety == "obstacle")
							flo.scale = [10, 10, 10];
						else {
							flo.planeGeometry = true;
							flo.scale = [100, 100, 100];
						}
						fpz.push(flo);
						_.strup(variety);
						vu.builders.zone.update(); // overkill?
						setTimeout(sel.update, 500);
					}, "up20 right"),
					fpz.map(_[variety])
				]);
			};
			return CT.dom.div([
				plur,
				sel
			], "topbordered padded margined");
		},
		structural: function() {
			var _ = vu.builders.zone._, selz = _.selectors, sel = selz.structural = CT.dom.div([
				_.structs("wall"),
				_.structs("ramp"),
				_.structs("floor"),
				_.structs("obstacle")
			]);
			sel.update = function() {
				selz.walls.update();
				selz.ramps.update();
				selz.floors.update();
				selz.obstacles.update();
			};
		},
		posup: function() {
			var _ = vu.builders.zone._, target = _.controls.target,
				zccr = zero.core.current.room, fi, pos, opts, kind;
			if (!target.gesture) { // person (probs detect in a nicer way)
				pos = target.position(), opts = {
					position: [pos.x, pos.y, pos.z]
				};
				kind = target.opts.kind;
				if (["floor", "obstacle", "wall", "ramp"].includes(kind)) {
					fi = parseInt(target.name.slice(kind.length));
					zccr.opts[kind].parts[fi].position = opts.position;
					_.strup(kind);
				} else {
					if ("wall" in target.opts)
						opts.wall = target.opts.wall;
					vu.storage.setOpts(target.opts.key, opts);
					if (kind == "screen")
						target.playPause();
				}
				_.selectors.controls.update();
			}
		},
		controls: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			_.controls = new zero.core.Controls({
				cb: _.posup
			});
			selz.controls = CT.dom.div();
			selz.controls.update = function(target) {
				if (!target) {
					target = zero.core.current.person;
					zero.core.camera.follow(target.body.looker);
				} else
					zero.core.camera.follow(target);
				_.controls.setTarget(target);
				CT.dom.setContent(selz.controls, [
					CT.dom.div(target.name, "bigger"),
					target.body ? [
						"(for scale)",
						"move around with wasd",
						"SPACE for jump",
						"1-9 for gestures (0 to ungesture)",
						"1-9 + SHIFT for dances (0 to undance)"
					] : [
						"move around with arrow keys",
						"press ENTER to save position"
					]
				]);
			};
		},
		scalers: function(obj, cb, min, max, unit) {
			var scale = obj.scale(),
				scopts = [scale.x, scale.y, scale.z];
			return ["x", "y", "z"].map(function(dim, i) {
				return [
					dim,
					CT.dom.range(function(val) {
						val = parseFloat(val);
						scopts[i] = val;
						obj.adjust("scale", dim, val);
						obj.setBounds();
						cb(scopts);
					}, min || 0.3, max || 6, scale[dim], unit || 0.01, "w1")
				];
			});
		},
		mima: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				sel = selz.minimap = CT.dom.div();
			_.minimap = new vu.menu.Map({ node: sel, wait: true });
			sel.update = _.minimap.refresh;
		},
		setup: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				persist = vu.builders.zone.persist;
			_.opts = vu.storage.get("room") || _.opts;

			selz.name = CT.dom.smartField(function(val) {
				if (_.opts && (_.opts.name != val)) {
					persist({
						name: val
					});
					_.opts.name = val;
				}
			}, "w1", null, null, null, core.config.ctvu.blurs.name);

			_.furnishings();
			_.lights();
			_.cameras();
			_.controls();
			_.structural();
			_.preqs();
			_.mima();

			var enz = core.config.ctvu.loaders.environments;
			var eselector = selz.environment = CT.dom.select(enz.map(function(item) {
				return item.slice(item.indexOf(".") + 1);
			}), enz, null, _.opts.environment, null, function() {
				if (_.opts.environment != eselector.value) {
					_.opts.environment = eselector.value;
					persist({
						environment: eselector.value
					});
					zero.core.util.room(_.opts);
				}
			});

			selz.base = CT.dom.div();
			selz.base.update = function() {
				var options = [], browse = function() {
					vu.media.browse("background", function(img) {
						var upobj = { texture: img.item },
							r = zero.core.current.room;
						r.update(upobj);
						vu.storage.setOpts(r.opts.key, upobj);
					});
				};
				if (vu.storage.has("shell"))
					options.push("shell");
				if (vu.storage.has("wallpaper"))
					options.push("wallpaper");
				options.push("wallpaper (extended)");
				var content = [
					CT.dom.button("swap", function() {
						if (options.length == 1)
							return browse();
						CT.modal.choice({
							data: options,
							cb: function(variety) {
								if (variety == "wallpaper (extended)")
									return browse();
								CT.modal.choice({
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
										persist({
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
				var room = zero.core.current.room;
				CT.dom.setContent(selz.scale, _.scalers(room, function(scopts) {
					room.updateCameras();
					vu.storage.setOpts(_.opts.key, {
						scale: scopts
					});
				}));
			};

			selz.friction = CT.dom.div();
			selz.friction.update = function() {
				var r = zero.core.current.room;
				CT.dom.setContent(selz.friction,
					CT.dom.checkboxAndLabel("grippy floor", r.grippy,
						null, null, null, function(cbox) {
							var g = _.opts.grippy = cbox.checked;
							r.setFriction(g);
							persist({
								grippy: g
							});
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
				], "padded bordered round mb5"),
				CT.dom.div([
					"Friction",
					selz.friction
				], "padded bordered round mb5"),
				CT.dom.div([
					"Scale",
					selz.scale
				], "padded bordered round mb5"),
				CT.dom.div([
					"Materials",
					_.materials()
				], "padded bordered round mb5")
			];
		},
		materials: function(furn) {
			var obj, selz = furn || vu.builders.zone._.selectors;
			selz.color = CT.dom.div();
			selz.color.update = function() {
				obj = furn || zero.core.current.room;
				CT.dom.setContent(selz.color, vu.color.selector(obj, "color"));
			};

			selz.specular = CT.dom.div();
			selz.specular.update = function() {
				obj = furn || zero.core.current.room;
				CT.dom.setContent(selz.specular, vu.color.selector(obj, "specular"));
			};

			selz.shininess = CT.dom.div();
			selz.shininess.update = function() {
				obj = furn || zero.core.current.room;
				if (!obj.thring)
					return CT.dom.hide(selz.shininess.full);
				CT.dom.show(selz.shininess.full);
				CT.dom.setContent(selz.shininess, CT.dom.range(function(val) {
					val = parseInt(val);
					obj.opts.material.shininess = obj.thring.material.shininess = val;
					vu.storage.setMaterial(obj.opts.key, { shininess: val });
				}, 0, 150, obj.thring.material.shininess || 30, 1, "w1"));
			};
			selz.shininess.full = CT.dom.div([
				"Shininess",
				selz.shininess
			], "topbordered padded margined");

			if (furn) {
				selz.color.update();
				selz.specular.update();
				selz.shininess.update();
			}

			return [
				CT.dom.div([
					"Color",
					selz.color
				], "topbordered padded margined"),
				CT.dom.div([
					"Specular",
					selz.specular
				], "topbordered padded margined"),
				selz.shininess.full
			];
		},
		lightup: function(color, lnum) {
			var _ = vu.builders.zone._;
			_.opts.lights[lnum].color = color;
			vu.builders.zone.persist({
				lights: _.opts.lights
			});
		},
		lights: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				room, color, intensity, content;
			selz.lights = CT.dom.div();
			selz.lights.update = function() {
				room = zero.core.current.room;
				CT.dom.setContent(selz.lights, [
					CT.dom.button("add", function() {
						CT.modal.choice({
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
						color = vu.color.selector(light, null, i, _.lightup);
						intensity = CT.dom.range(function(val) {
							val = parseInt(val) / 100;
							light.setIntensity(val);
							_.opts.lights[i].intensity = val;
							vu.builders.zone.persist({
								lights: _.opts.lights
							});
						}, 0, 100, light.opts.intensity * 100, 1, "w1");
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
			var selz = vu.builders.zone._.selectors;
			selz.cameras = CT.dom.div();
			vu.controls.initCamera(selz.cameras);
		},
		set: function(room, noUpdate) {
			var _ = vu.builders.zone._, selz = _.selectors, upmenus = function() {
				selz.base.update();
				selz.scale.update();
				selz.color.update();
				selz.lights.update();
				selz.cameras.update();
				selz.minimap.update();
				selz.controls.update();
				selz.friction.update();
				selz.specular.update();
				selz.shininess.update();
				selz.structural.update();
				selz.furnishings.update();
				selz.portal_requests.update();
			}, name = room.name || room.environment;
			_.opts = room;
			_.sharer.update(room);
			vu.core.setroom(room);
			CT.dom.setContent(_.curname, name);
			selz.name.value = name;
			selz.environment.value = room.environment;
			noUpdate ? upmenus() : vu.builders.zone.update(upmenus);
		},
		build: function() {
			var _ = vu.builders.zone._;
			CT.modal.prompt({
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
			CT.modal.choice({
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
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			// add person for scale
			popts.body.onclick = function() {
				_.selectors.controls.update();
			};
			zero.core.util.join(vu.core.person(popts), function(person) {
				zero.core.current.person = person;
				zero.core.current.room.objects.forEach(_.regObj);
				var r = vu.storage.get("room");
				r ? _.set(r, true) : _.build();
			});
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.select),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		},
		regObj: function(furn) {
			CT.data.add(furn.opts);
			zero.core.click.register(furn, function() {
				vu.builders.zone._.selectors.controls.update(furn);
			});
		},
		swap: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			_.swappers.forEach(function(section) {
				selz[section].modal.showHide("ctmain");
			});
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section));
			if (vu.builders.zone._.swappers.indexOf(section) != -1)
				n.onclick = vu.builders.zone._.swap;
			return n;
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
				room.objects.forEach(vu.builders.zone._.regObj);
				cb && cb();
				room.cut();
			}
		}, vu.builders.zone._.opts));
	},
	menus: function() {
		var section, _ = vu.builders.zone._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section], _.head(section));
			(section == "furnishings") || (section == "structural")
				|| selz[section].modal.show("ctmain");
		}
	}
};