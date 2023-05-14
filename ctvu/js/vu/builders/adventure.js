vu.builders.adventure = {
	_: {
		selectors: {},
		menus: {
			chat: "bottom",
			auto: "left"
		},
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
					player: vu.core.person(fullp),
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
			}, "json");
		},
		resume: function(aopts) {
			zero.core.current.adventure = new vu.game.Adventure(aopts);
		},
		setup: function() {
			var gkey = location.hash.slice(1), u = user.core.get(),
				_ = vu.builders.adventure._, selz = _.selectors;
			if (!gkey)
				return alert("no game specified!");
			selz.chat = vu.multi.chatterbox();
			selz.auto = CT.dom.div();
			vu.clix.init({
				auto: selz.auto
			});
			if (!u)
				return _.begin(gkey);
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
		var sec, section, _ = vu.builders.adventure._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			sec = selz[section];
			sec.collapser = () => vu.core.collapse(sec);
			sec.modal = vu.core.menu(section, _.menus[section],
				sec, null, sec.collapser);
		}
		selz.chat.modal.show("ctmain");
	}
};