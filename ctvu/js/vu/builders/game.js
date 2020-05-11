//modelName, cb, limit, offset, order, filters, sync, count, exporter
vu.builders.game = {
	_: {
		create: function() {
			CT.modal.prompt({
				prompt: "what's the new game called?",
				cb: function(name) {
					CT.modal.prompt({
						isTA: true,
						prompt: "please describe the game",
						cb: function(desc) {
							vu.storage.edit({
								modelName: "game",
								name: name,
								description: desc,
								owners: [user.core.get("key")]
							}, vu.builders.game._.load);
						}
					});
				}
			});
		},
		load: function(game) {
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
			]);
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