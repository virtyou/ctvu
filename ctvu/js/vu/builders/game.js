vu.builders.game = {
	_: {
		states: {
			initial: CT.dom.div(),
			victory: CT.dom.div(),
			defeat: CT.dom.div()
		},
		scene: function(s) {
			return CT.dom.div([
				CT.dom.link(s.name, null,
					"/vu/scene.html#" + s.key, "big"),
				s.description,
				"room: " + s.room.name,
				"actors: " + s.actors.map(function(a) {
					return a.name;
				}).join(", ")
			], "bordered padded margined round inline-block");
		},
		scenes: function(game) {
			var n = CT.dom.div(), vbg = vu.builders.game,
				scene = vbg._.scene, create = vbg.create;
			CT.db.multi(game.scenes, function(scenes) {
				var snode = CT.dom.div(scenes.map(scene));
				CT.dom.setContent(n, [
					snode,
					CT.dom.button("add scene", function() {
						vu.game.util.scene(game, function(s) {
							CT.dom.addContent(snode, scene(s));
						});
					})
				]);
			}, "json");
			return n;
		},
		mod: function(actor, aname, prop, sec) {
			var _ = vu.builders.game._, cur = _.cur, eobj = { key: cur.key };
			CT.modal.prompt({
				prompt: "what's the new value?",
				cb: function(val) {
					actor[prop] = val;
					eobj[sec] = cur[sec];
					vu.storage.edit(eobj, function() {
						CT.dom.id(sec + "_" + aname).replaceWith(_.actor(cur[sec].actors,
							aname, sec));
					});
				}
			})
		},
		state: function(actor, aname, sec) {
			var _ = vu.builders.game._, cur = _.cur, state,
				oz = ["add property", "change property"], sa;
			if (sec == "initial") {
				["victory", "defeat"].forEach(function(state) {
					if (!(aname in cur[state].actors))
						oz.push("add " + state + " condition");
				});
			}
			CT.modal.choice({
				data: oz,
				cb: function(sel) {
					if (sel == "add property") {
						CT.modal.prompt({
							prompt: "what's the new property?",
							cb: p => _.mod(actor, aname, prop, sec)
						});
					} else if (sel == "change property") {
						CT.modal.choice({
							prompt: "what's changing?",
							data: Object.keys(actor).filter(p => p != "positioners"),
							cb: p => _.mod(actor, aname, prop, sec)
						});
					} else {
						state = sel.split(" ")[1];
						sa = cur[state].actors;
						sa[aname] = {};
						_.states[state].appendChild(_.actor(sa, aname, state));
					}
				}
			});
		},
		actor: function(actors, aname, sec) {
			var actor = actors[aname], propz = CT.dom.div(), p;
			for (p in actor)
				if (p != "positioners")
					propz.appendChild(CT.dom.div(p + ": " + actor[p]));
			return CT.dom.div([
				CT.dom.link(aname, function() {
					vu.builders.game._.state(actor, aname, sec);
				}, null, "big"),
				propz
			], "bordered padded margined round inline-block vtop", sec + "_" + aname);
		},
		cond: function(game, sec) {
			var state = game[sec], _ = vu.builders.game._,
				anode = _.states[sec], a,
				actors = state.actors = state.actors || {};
			for (a in actors)
				anode.appendChild(_.actor(actors, a, sec));
			return CT.dom.div([
				sec, anode
			], "bordered padded margined round");
		},
		conditions: function(game) {
			return CT.dom.div(["initial", "victory", "defeat"].map(function(sec) {
				return vu.builders.game._.cond(game, sec);
			}));
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
		vu.core.my("game", function(games) {
			_.games = games;
			if (games.length)
				g.load(games[0]);
			else
				g.create();
		});
	}
};