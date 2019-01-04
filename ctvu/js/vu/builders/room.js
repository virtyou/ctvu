vu.builders.room = {
	_: {
		opts: {
			environment: "techno",
			objects: []
		},
		furniture: {
			pool: {
				name: "pool",
				thing: "Pool",
				scale: [1.2, 1.2, 2],
				position: [0, -35, 0],
				rotation: [-6.28/4, 0, 0]
			}
		},
		selectors: {},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.room._,
				ropts = _.opts = vu.storage.get("room") || _.opts,
				fz = _.furniture = vu.storage.get("furnishing") || _.furniture,
				pool = _.furniture.pool;
			cfg.room = CT.merge(ropts, cfg.room);

			// TODO: handle furniture properly ... just pool for now
			var ptoggle = _.selectors.pool = CT.dom.checkboxAndLabel(null,
				!!ropts.objects.length, "Pool", null, null, function() {
					if (vu.builders.current.person) {
						ropts.objects = ptoggle.isChecked() ? [pool] : [];
						if (pool.key) { // remote mode!!
							if (ptoggle.isChecked()) {
								vu.storage.edit({
									base: pool.key,
									parent: ropts.key,
									modelName: "furnishing"
								}, function(furn) {
									ptoggle._pool = furn;
								});
							} else
								vu.storage.edit(ptoggle._pool.key, null, "delete", "key");
						} else
							vu.storage.save(ropts, null, "room", { objects: ropts.objects });
						if (ptoggle.isChecked())
							zero.core.util.room.addObject(pool);
						else
							zero.core.util.room.removeObject(pool);
					}
				});
			if (ropts.objects.length)
				ptoggle._pool = ropts.objects[0];
			var eselector = _.selectors.environment = CT.dom.select([
				"techno", "kidroom"
			], null, null, ropts.environment, null, function() {
				if (vu.builders.current.person) {
					ropts.environment = eselector.value;
					vu.storage.save(ropts, null, "room",
						{ opts: { environment: eselector.value } });
					location = location; // hack! do something smarter...
				}
			});
		}
	},
	menu: function() {
		var _ = vu.builders.room._, selz = _.selectors;
		_.setup();
		return [
			CT.dom.div("your vRoom", "bigger centered pv10"),
			CT.dom.div([
				CT.dom.span("Environment"),
				CT.dom.pad(),
				selz.environment,
			], "padded bordered round mb5"),
			CT.dom.div(selz.pool, "padded bordered round mb5")
		];
	}
};