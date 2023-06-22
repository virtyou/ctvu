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
		posup: function() {
			var _ = vu.builders.zone._, target = _.controls.target,
				zccr = zero.core.current.room, fi, pos, opts, kind;
			if (!target.gesture) { // person (probs detect in a nicer way)
				pos = target.position(), opts = {
					position: [pos.x, pos.y, pos.z]
				};
				kind = target.opts.kind;
				if (["floor", "obstacle", "wall", "ramp", "boulder", "stala"].includes(kind)) {
					fi = parseInt(target.name.slice(kind.length));
					zccr.opts[kind].parts[fi].position = opts.position;
					vu.build.struct.strup(kind);
				} else {
					if ("wall" in target.opts)
						opts.wall = target.opts.wall;
					vu.storage.setOpts(target.opts.key, opts);
					if (kind == "screen")
						target.playPause();
				}
				target.setBounds(true);
				_.minimap.refresh();
				_.selectors.controls.update();
			}
		},
		controls: function() {
			var _ = vu.builders.zone._, selz = _.selectors;
			_.controls = new zero.core.Controls({
				cb: _.posup
			}), zcc = zero.core.current;
			selz.controls = CT.dom.div();
			selz.controls.update = function(target) {
				if (!target) {
					target = zcc.person;
					zero.core.camera.follow(target.body.looker);
				} else
					zero.core.camera.follow(target);
				_.controls.setTarget(target, target == zcc.person);
				CT.dom.setContent(selz.controls, [
					CT.dom.div(target.name, "bigger"),
					target.body ? [
						"(for scale)",
						"move around with WASDZC and SPACE",
						"move cam w/ QERFTG or ARROWS/PERIOD/COMMA",
						"1-9 for gestures (0 to ungesture)",
						"1-9 + SHIFT for dances (0 to undance)"
					] : [
						"move around with arrow keys",
						"press ENTER to save position"
					]
				]);
			};
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

			_.lights();
			_.cameras();
			_.controls();
			_.mima();

			vu.build.struct.structural();
			vu.build.furn.furnishings();
			vu.build.port.requests();

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
										(variety == "shell") ? _.set(_.opts) :
											zero.core.current.room.update(upobj);
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
				CT.dom.setContent(selz.scale, vu.build.core.scalers(room, function(scopts) {
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
				selz.scale,
				CT.dom.div([
					"Materials",
					vu.build.core.materials()
				], "padded bordered round mb5"),
				CT.dom.div([
					"Environmental",
					_.environmental()
				], "padded bordered round mb5"),
				CT.dom.div([
					"Interactional",
					_.interactional()
				], "padded bordered round mb5")
			];
		},
		interactional: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				sel = selz.interactional = CT.dom.div(),
				zcc = zero.core.current, ro;
			sel.update = function() {
				ro = zcc.room.opts;
				CT.dom.setContent(sel, [
					vu.build.core.mosh(ro, function(val) {
						ro.moshy = val;
						vu.storage.setOpts(ro.key, {
							moshy: val
						});
					}),
					CT.dom.checkboxAndLabel("autoplay videos", ro.autovid,
						null, null, null, function(cbox) {
							ro.autovid = cbox.checked;
							vu.storage.setOpts(ro.key, {
								autovid: ro.autovid
							})
						})
				]);
			};
			return sel;
		},
		environmental: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				sel = selz.environmental = CT.dom.div(),
				zcc = zero.core.current, ro, po;
			sel.update = function() {
				ro = zcc.room.opts;
				CT.dom.setContent(sel, ["fog", "rain"].map(function(ename) {
					return CT.dom.checkboxAndLabel(ename, ro[ename],
						null, null, null, function(cbox) {
							if (cbox.checked)
								zcc.room.addEnv(ename);
							else
								zcc.room.detach(ename);
							po = {};
							po[ename] = cbox.checked;
							vu.storage.setOpts(ro.key, po);
						});
				}));
			};
			return sel;
		},
		lightup: function(lnum, property, val, subprop) {
			var _ = vu.builders.zone._, lig;
			if (lnum == undefined)
				_.opts.lights = zero.core.current.room.opts.lights;
			else {
				lig = _.opts.lights[lnum];
				if (subprop != undefined)
					lig[property][subprop] = val;
				else
					lig[property] = val;
			}
		},
		lightput: function() {
			vu.builders.zone.persist({
				lights: vu.builders.zone._.opts.lights
			});
		},
		lights: function() {
			var _ = vu.builders.zone._;
			_.selectors.lights = vu.party.lights(_.lightup, true, _.lightput);
		},
		cameras: function() {
			var selz = vu.builders.zone._.selectors;
			selz.cameras = CT.dom.div();
			vu.controls.initCamera(selz.cameras);
		},
		set: function(room, noUpdate) {
			var _ = vu.builders.zone._, zcc = zero.core.current;
			if (!zcc.room || !zcc.room.bounds)
				return setTimeout(() => _.set(room, noUpdate), 500);
			var selz = _.selectors, upmenus = function() {
				selz.base.update();
				selz.scale.update();
				selz.color.update();
				selz.lights.update();
				selz.cameras.update();
				selz.minimap.update();
				selz.opacity.update();
				selz.controls.update();
				selz.friction.update();
				selz.specular.update();
				selz.shininess.update();
				selz.structural.update();
				selz.furnishings.update();
				selz.environmental.update();
				selz.interactional.update();
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
			var _ = vu.builders.zone._, zcc = zero.core.current,
				popts = vu.storage.get("person");
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			// add person for scale
			popts.body.onclick = function() {
				_.selectors.controls.update();
			};
			zero.core.util.join(vu.core.person(popts, false, [
				0, 800, 0 // meh, hacky (should use max height or something)
			]), function(person) {
				zero.core.util.setCurPer(person);
				zcc.room.onReady(() => zcc.room.objects.forEach(vu.build.core.regObj));
				var r = vu.storage.get("room");
				r ? _.set(r, true) : _.build();
			});
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					CT.dom.link(_.curname, function() {
						CT.modal.modal([
							"Use this key to embed this zone offsite",
							zcc.room.opts.key
						]);
					})
				], [
					CT.dom.link("swap", _.select),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section)),
				_ = vu.builders.zone._, swappers = _.swappers;
			if (swappers.indexOf(section) != -1)
				n.onclick = () => vu.core.swap(swappers, _.selectors);
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
				room.objects.forEach(vu.build.core.regObj);
				cb && cb();
				zero.core.camera.cutifroom();
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