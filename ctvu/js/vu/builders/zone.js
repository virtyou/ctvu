vu.builders.zone = {
	_: {
		opts: core.config.ctvu.builders.room,
		furniture: core.config.ctvu.builders.furniture,
		selectors: {},
		setup: function() {
			var cfg = core.config.ctzero, _ = vu.builders.zone._,
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
			var enz = core.config.ctvu.loaders.environments;
			var eselector = _.selectors.environment = CT.dom.select(enz.map(function(item) {
				return item.slice(item.indexOf(".") + 1);
			}), enz, null, ropts.environment, null, function() {
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
		var _ = vu.builders.zone._, selz = _.selectors;
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