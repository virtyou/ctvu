vu.builders.game = {
	_: {
		scene: function(s) {
			return CT.dom.div([
				CT.dom.link(s.name, null,
					"/vu/scene.html#" + s.key, "big"),
				s.description,
				"room: " + s.room.name,
				"actors: " + s.actors.map(function(a) {
					return a.name;
				}).join(", ")
			], "bordered padded margined round");
		},
		scenes: function(game) {
			var n = CT.dom.div(), vbg = vu.builders.game,
				scene = vbg._.scene, create = vbg.create;
			CT.db.multi(game.scenes, function(scenes) {
				var snode = CT.dom.div(scenes.map(scene));
				CT.dom.setContent(n, [
					snode,
					CT.dom.button("add scene", function() {
						CT.modal.choice({
							prompt: "please select a room",
							data: vu.storage.get("rooms"),
							cb: function(room) {
								create("scene", function(s) {
									game.scenes.push(s.key);
									vu.storage.edit({
										key: game.key,
										scenes: game.scenes
									});
									CT.dom.addContent(snode, scene(s));
								}, {
									room: room.key
								});
							}
						});
					})
				]);
			}, "json");
			return n;
		},
		conditions: function(game) {

		},
		swap: function() {
			var g = vu.builders.game;
			CT.modal.choice({
				prompt: "please select a game",
				data: ["new game"].concat(g._.games),
				cb: function(game) {
					if (game == "new game")
						g.create();
					else
						g.load(game);
				}
			});
		},
		play: function() {
			location = "/vu/adventure.html#" +
				vu.builders.game._.cur.key;
		},
		linx: function() {
			var _ = vu.builders.game._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("play", _.play),
					CT.dom.pad(),
					CT.dom.link("swap", _.swap),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		}
	},
	create: function(ctype, cb, extras) {
		vu.core.create(ctype, cb || vu.builders.game.load, extras);
	},
	load: function(game) {
		var _ = vu.builders.game._;
		_.cur = game;
		_.sharer.update(game);
		CT.dom.setContent(_.curname, game.name);
		CT.dom.setContent("ctmain", [
			CT.dom.div([
				"name",
				CT.dom.smartField({
					classname: "w1",
					value: game.name,
					cb: function(val) {
						game.name = val;
						vu.storage.edit({
							key: game.key,
							name: val
						});
					}
				})
			], "bordered padded margined round"),
			CT.dom.div([
				"description",
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: game.description,
					cb: function(val) {
						game.description = val;
						vu.storage.edit({
							key: game.key,
							description: val
						});
					}
				})
			], "bordered padded margined round"),
			CT.dom.div([
				"scenes",
				_.scenes(game)
			], "bordered padded margined round"),
			CT.dom.div([
				"conditions",
				_.conditions(game)
			], "bordered padded margined round"),
			CT.dom.div([
				"live",
				CT.dom.checkboxAndLabel("list on games page",
					game.live, null, null, null, function(cb) {
						game.live = cb.checked;
						vu.storage.edit({
							key: game.key,
							live: game.live
						});
					})
			], "bordered padded margined round")
		]);
	},
	init: function() {
		var g = vu.builders.game, _ = g._;
		CT.dom.addContent("ctheader", _.linx());
		CT.db.get("game", function(games) {
			_.games = games;
			if (games.length)
				g.load(games[0]);
			else
				g.create();
		}, null, null, null, {
			owners: {
				comparator: "contains",
				value: user.core.get("key")
			}
		});
	}
};