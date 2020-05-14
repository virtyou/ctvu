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
				}).join(", "),
				"portal linkages!!!!!"
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

		}
	},
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
						}), cb || vu.builders.game.load);
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
		CT.db.get("game", function(games) {
			CT.modal.choice({
				prompt: "please select a game",
				data: ["new game"].concat(games),
				cb: function(game) {
					if (game == "new game")
						vu.builders.game.create();
					else
						vu.builders.game.load(game);
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