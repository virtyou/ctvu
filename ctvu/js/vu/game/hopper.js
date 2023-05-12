vu.game.hopper = {
	_: {
		upscore: function() {
			var game = zero.core.current.scene.game;
			vu.storage.edit({
				key: game.key,
				score: game.score
			});
		},
		addhop: function(variety) {
			var h = vu.game.hopper, _ = h._, pz = h.pcfg()[variety],
				kinds, men = zero.core.current.room.menagerie;
			if (!men)
				return alert("this room has no associated menagerie - please add one on the pop page!");
			kinds = men.kinds.filter(k => !(k in pz));
			if (!kinds.length)
				return alert("all animals are accounted for!");
			CT.modal.choice({
				prompt: [
					CT.dom.div(h.directions[variety], "bold"),
					"please select an animal"
				],
				data: kinds,
				cb: function(kind) {
					pz[kind] = 1;
					_.upscore();
					_.editor.refresh();
				}
			});
		},
		egroup: function(variety) { // player or fauna
			var h = vu.game.hopper, _ = h._, pz = h.pcfg()[variety];
			return CT.dom.div([
				CT.dom.button("add", () => _.addhop(variety), "right"),
				h.directions[variety],
				Object.keys(pz).map(function(p) {
					return [
						p,
						CT.dom.range(function(val) {
							pz[p] = parseInt(val);
							_.upscore();
						}, 1, 10, pz[p], 1, "w1 block")
					];
				})
			], "bordered padded margined round");
		},
		vgroup: function(variety, game) {
			var h = vu.game.hopper, pz = h.pcfg(game)[variety];
			return CT.dom.div([
				h.directions[variety],
				Object.keys(pz).map(p => p + ": " + pz[p])
			], "bordered padded margined round");
		},
		onpounce: function(pouncer) {
			var h = vu.game.hopper, pd = pouncer.direction,
				pn = pouncer.name, pk = pouncer.opts.kind, pv = h.pcfg().fauna[pk],
				pbs = zero.core.current.person.body.springs, mag = pv * 1000;
			h.log(pn + " pounced on player for " + pv + " points");
			zero.core.current.person.sfx("thud");
			pbs.weave.shove = pd.x * mag;
			pbs.slide.shove = pd.z * mag;
			// TODO: score!!!
		},
		onsplat: function(prey) {
			var h = vu.game.hopper;
			h.log("you splatted " + prey.name);
			// TODO:
			// 1 sfx!
			// 2 score!
			// 3 recycle (down and up elsewhere?)
		}
	},
	directions: {
		fauna: "fauna pouncing on player",
		player: "player pouncing on fauna"
	},
	log: function(msg) {
		CT.log("hopper: " + msg);
	},
	pcfg: function(game) {
		var zcc = zero.core.current,
			scfg = (game || zcc.scene.game || zcc.adventure.game).score;
		if (!scfg.pounce)
			scfg.pounce = { fauna: {}, player: {} };
		return scfg.pounce;
	},
	modder: function() { // { fauna: { dog: 2, cat: 10 }, player: { cat: 1 } }
		var _ = vu.game.hopper._, pounces = CT.dom.div();
		var node = _.editor = CT.dom.div([
			CT.dom.div("pounce dynamics", "big"),
			pounces
		], "bordered padded margined round");
		node.refresh = function() {
			CT.dom.setContent(pounces, [
				_.egroup("player"), _.egroup("fauna")
			]);
		};
		node.refresh();
		return node;
	},
	view: function(game) {
		var _ = vu.game.hopper._;
		return CT.dom.div([
			"pounce dynamics",
			_.vgroup("player", game), _.vgroup("fauna", game)
		], "bordered padded margined round");
	},
	init: function() {
		var h = vu.game.hopper, zcc = zero.core.current,
			men = zcc.room.menagerie, pcfg = h.pcfg(),
			hunters = Object.keys(pcfg.fauna),
			prey = Object.keys(pcfg.player), _ = h._;
		if (!men)
			return h.log("skipping init() - no menagerie");
		if (hunters.length) {
			h.log("activating " + hunters.length + " hunter varieties");
			men.huntPlayer(hunters, _.onpounce);
		}
		if (prey.length) {
			h.log("activating " + prey.length + " prey varieties");
			zcc.person.onland(() => men.splat(prey, _.onsplat));
		}
	}
};