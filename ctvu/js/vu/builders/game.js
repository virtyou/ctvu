vu.builders.game = {
	_: {
		create: function(ctype, cb, extras) {
			ctype = ctype || "game";
			CT.modal.prompt({
				prompt: "what's the new " + ctype + " called?",
				cb: function(name) {
					CT.modal.prompt({
						isTA: true,
						prompt: "please describe the " + ctype,
						cb: function(desc) {
							vu.storage.edit(CT.merge(extras, {
								modelName: ctype,
								name: name,
								description: desc,
								owners: [user.core.get("key")]
							}), cb || vu.builders.game._.load);
						}
					});
				}
			});
		},
		load: function(game) {
			var _ = vu.builders.game._;
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
				], "bordered padded margined round")
			]);
		},
		scenes: function(game) {
			var n = CT.dom.div(), _ = vu.builders.game._;
			CT.db.multi(game.scenes, function(scenes) {
				CT.dom.setContent(n, [
					scenes.map(function(s) {
						return return CT.dom.div([
							CT.dom.link(s.name, null,
								"/vu/scene.html#" + s.key, "big"),
							s.description,
							"room: " + s.room.name,
							"actors: " + s.actors.map(function(a) {
								return a.name;
							}).join(", "),
							"props...",
							"portal linkages!!!!!"
						], "bordererd padded margined round");
					}),
					CT.dom.button("add scene", function() {
						CT.modal.choice({
							prompt: "please select a room",
							data: vu.storage.get("rooms"),
							cb: function(room) {
								_.create("scene", function(s) {
									location = "/vu/scene.html#" + s.key;
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

		}
	},
	init: function() {
		var _ = vu.builders.game._;
		CT.db.get("game", function(games) {
			CT.modal.choice({
				prompt: "please select a game",
				data: ["new game"].concat(games),
				function(game) {
					if (game == "new game")
						_.create();
					else
						_.load(game);
				}
			});
		}, null, null, null, {
			owners: {
				comparator: "contains",
				value: user.core.get("key")
			}
		});
	}
};