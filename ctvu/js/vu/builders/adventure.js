vu.builders.adventure = {
	_: {
		selectors: {},
		menus: {},
		anonmsg: CT.dom.div("playing anonymously - log in to save your progress!", "bigger padded bold"),
		newa: function(gkey, pkey, fullg, fullp) {
			var _ = vu.builders.adventure._, u = user.core.get();
			u ? vu.storage.edit({
				modelName: "adventure",
				owner: u.key,
				player: pkey,
				game: gkey
			}, _.resume) : CT.modal.modal(_.anonmsg, function() {
				_.resume({
					player: zero.core.util.person(vu.core.bgen(fullp.body), fullp.name || "you", null, fullp, fullp.body),
					state: fullg.initial,
					game: fullg
				});
				CT.dom.id("helperoo").onclick();
			}, { noClose: true }, true);
		},
		begin: function(gkey) {
			var _ = vu.builders.adventure._;
			CT.db.one(gkey, function(gopts) {
				var gonew = function(player) {
					_.newa(gkey, player.key, gopts, player);
				}, playpro = function(players) {
					(players.length == 1) ? gonew(players[0]) : CT.modal.choice({
						prompt: "please select your player",
						data: players,
						cb: gonew
					});
				};
				if (gopts.players.length == 0)
					playpro(vu.storage.get("people"));
				else
					CT.db.multi(gopts.players, playpro);
			});
		},
		resume: function(aopts) {
			zero.core.current.adventure = new vu.game.Adventure(aopts);
		},
		setup: function() {
			var gkey = location.hash.slice(1),
				_ = vu.builders.adventure._, u = user.core.get();
			if (!gkey)
				return alert("no game specified!");
			if (!u) {
				return _.begin(gkey);
			}
			CT.db.get("adventure", function(advz) {
				if (advz.length == 0)
					_.begin(gkey);
				else
					_.resume(advz[0]);
			}, 1, 0, null, {
				game: gkey,
				owner: u.key
			}, null, null, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.adventure._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};