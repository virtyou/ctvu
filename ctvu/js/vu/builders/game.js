vu.builders.game = {
	_: {
		selectors: {},
		menus: {},
		newa: function(gkey, pkey) {
			vu.storage.edit({
				modelName: "adventure",
				owner: user.core.get("key"),
				player: pkey,
				game: gkey
			}, vu.builders.game._.resume);
		},
		begin: function(gkey) {
			var _ = vu.builders.game._;
			CT.db.one(gkey, function(gopts) {
				if (gopts.players.length == 1)
					return _.newa(gkey, gopts.players[0]);
				CT.db.multi(gopts.players, function(players) {
					CT.modal.choice({
						prompt: "please select your player",
						data: players,
						cb: function(player) {
							_.newa(gkey, player.key);
						}
					});
				});
			});
		},
		resume: function(aopts) {
			zero.core.current.adventure = new vu.game.Adventure(aopts);
		},
		setup: function() {
			var gkey = location.hash.slice(1),
				_ = vu.builders.game._;
			if (!gkey)
				return alert("no game specified!");
			CT.db.get("adventure", function(advz) {
				if (advz.length == 0)
					_.begin(gkey);
				else
					_.resume(advz[0]);
			}, 1, 0, null, {
				game: gkey,
				owner: user.core.get("key")
			}, null, null, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.game._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};
//modelName, cb, limit, offset, order, filters, sync, count, exporter