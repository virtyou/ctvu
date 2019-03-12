vu.builders.zone = {
	_: {
		opts: core.config.ctvu.builders.room,
		furniture: core.config.ctvu.builders.furniture,
		selectors: {},
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
		furnishings: function() {
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
		},
		setColor: function(target, color, prop) {
			var copts = {};
			if (target.material) { // object
				target.material.color = vu.core.hex2rgb(color);
				color = parseInt(color.slice(1), 16);
				copts[prop] = color;
				vu.storage.setMaterial(target.opts.key, copts);
			} else // light
				target.setColor(color);
		},
		colorSelector: function(target, prop, lnum) {

			// TODO: fix color selection!!!!

			var _ = vu.builders.zone._, selz = _.selectors,
				bcolor, scolor, room = zero.core.current.room;
			if (target.material) { // object
				bcolor = target.thring.material[prop] || "#111111",
				scolor = (typeof bcolor == "string") ? bcolor : ("#" + bcolor.toString(16));
			} else // light
				scolor = target.opts.color;
			if (!prop)
				prop = "light " + lnum;
			return vu.core.color(prop + " selector", scolor, function() {
				_.setColor(target, selz[prop].value, prop);
			});
		},
		lights: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				room, color, intensity, direction;
			selz.lights = CT.dom.div();
			selz.lights.update = function() {
				room = zero.core.current.room;
				CT.dom.setContent(selz.lights, room.lights.map(function(light, i) {
					color = _.colorSelector(light, null, i);
					intensity = CT.dom.range(function(val) {
						light.setIntensity(val);
					}, null, null, light.opts.intensity, "w1");
					direction = CT.dom.div(); // finish
					return CT.dom.div([
						light.opts.variety,
						CT.dom.div([
							"Color",
							color
						], "topbordered padded margined"),
						CT.dom.div([
							"Intensity",
							intensity
						], "topbordered padded margined"),
						CT.dom.div([
							"Direction",
							direction
						], "topbordered padded margined")
					], "margined padded bordered round");
				}));
			};
		},
		cameras: function() {
			var _ = vu.builders.zone._, selz = _.selectors,
				cycbutt = CT.dom.button("cycle cameras", function() {
					if (cycbutt._cycler) {
						clearInterval(cycbutt._cycler);
						delete cycbutt._cycler;
						cycbutt.innerHTML = "cycle cameras";
					} else {
						cycbutt._cyclear = setInterval(zero.core.current.room.cut, 1000);
						cycbutt.innerHTML = "stop cycling";
					}
				});
			selz.cameras = CT.dom.div();
			selz.cameras.update = function() {
				CT.dom.setContent(selz.cameras, cycbutt);
			};
		},
		set: function(room, noUpdate) {
			var _ = vu.builders.zone._, selz = _.selectors,
				name = room.name || room.environment;
			_.opts = room;
			CT.dom.setContent(_.curname, name);
			selz.name.value = name;
			selz.environment.value = room.environment;
			noUpdate || vu.builders.zone.update();
			selz.lights.update();
			selz.cameras.update();
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
			var _ = vu.builders.zone._;
			_.curname = CT.dom.span(null, "bold");
			// add person for scale
			zero.core.util.join(vu.core.person(vu.storage.get("person")), function() {
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
	update: function() {
		zero.core.util.room(vu.builders.zone._.opts);
	},
	menu: function() {
		var _ = vu.builders.zone._, selz = _.selectors;
		_.setup();
		return [
			CT.dom.div("your vRoom", "bigger centered pv10"),
			CT.dom.div([
				"Name",
				selz.name
			], "padded bordered round mb5"),
			CT.dom.div([
				CT.dom.span("Environment"),
				CT.dom.pad(),
				selz.environment,
			], "padded bordered round mb5"),
			CT.dom.div([
				"Lights",
				selz.lights
			], "padded bordered round mb5"),
			CT.dom.div([
				"Cameras",
				selz.cameras
			], "padded bordered round mb5"),
			CT.dom.div(selz.pool, "padded bordered round mb5")
		];
	}
};