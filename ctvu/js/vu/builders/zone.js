vu.builders.zone = {
	_: {
		opts: core.config.ctvu.builders.room,
		furniture: core.config.ctvu.builders.furniture,
		selectors: {},
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
		set: function(room) {
			var _ = vu.builders.zone._, selz = _.selectors,
				name = room.name || room.environment;
			_.opts = room;
			CT.dom.setContent(_.curname, name);
			selz.name.value = name;
			selz.environment.value = room.environment;
			vu.builders.zone.update();
		},
		build: function() {
			var _ = vu.builders.zone._;
			vu.core.prompt({
				prompt: "what's the new zone's name?",
				cb: function(name) {
					vu.core.v({
						action: "room",
						name: name,
						environment: "one.box",
						owner: user.core.get("key")
					}, function(room) {
						var ropts = room.opts;
						ropts.key = room.key;
						ropts.name = room.name;
						CT.data.add(ropts);
						vu.storage.get("rooms").push(ropts);
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
			setTimeout(_.set, 1000, vu.storage.get("room")); // eh, kinda tacky...
			//_.set(vu.storage.get("room"));
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
			CT.dom.div(selz.pool, "padded bordered round mb5")
		];
	}
};