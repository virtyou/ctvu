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
					pz[kind] = {
						value: 1
					};
					_.upscore();
					_.editor.refresh();
				}
			});
		},
		hop: function(p, pz, variety) {
			var _ = vu.game.hopper._, pcfg = pz[p], cont, autosource;
			if (!isNaN(pcfg)) {
				pcfg = pz[p] = {
					value: pz[p]
				};
			}
			cont = [
				p,
				CT.dom.range(function(val) {
					pcfg.value = parseInt(val);
					_.upscore();
				}, 1, 10, pcfg.value, 1, "w1 block")
			];
			if (variety == "player") {
				autosource = CT.dom.div();
				autosource.update = function() {
					CT.dom.setContent(autosource, [
						CT.dom.button("change", function() {
							CT.modal.choice({
								prompt: "choose an automaton",
								data: zero.core.current.room.automatons.map(a => a.person.name),
								cb: function(aname) {
									pcfg.source = aname;
									autosource.update();
									_.upscore();
								}
							});
						}, "right"),
						"spawns from " + (pcfg.source || "room")
					]);
				};
				autosource.update();
				cont.push(autosource);
			} else { // fauna
				cont.push(CT.dom.checkboxAndLabel("zombifying",
					pcfg.zombifying, null, null, null, function(cbox) {
						pcfg.zombifying = cbox.checked;
						_.upscore();
					}, p));
			}
			return CT.dom.div(cont, "bordered padded margined round");
		},
		egroup: function(variety) { // player or fauna
			var h = vu.game.hopper, _ = h._, pz = h.pcfg()[variety];
			return CT.dom.div([
				CT.dom.button("add", () => _.addhop(variety), "right"),
				h.directions[variety],
				Object.keys(pz).map(p => _.hop(p, pz, variety))
			], "bordered padded margined round");
		},
		vgroup: function(variety, game) {
			var h = vu.game.hopper, pz = h.pcfg(game)[variety];
			return CT.dom.div([
				h.directions[variety],
				Object.keys(pz).map(p => p + ": " + pz[p])
			], "bordered padded margined round");
		},
		initial: function() {
			var h = vu.game.hopper, scfg = h.scfg();
			return CT.dom.range(function(val) {
				scfg.initial = parseInt(val);
				h._.upscore();
			}, 0, 10, scfg.initial, 1, "w1 block");
		},
		onpounce: function(pouncer) {
			var h = vu.game.hopper, pd = pouncer.direction,
				pn = pouncer.name, pk = pouncer.opts.kind, pcfg = h.pcfg().fauna[pk],
				pv = pcfg.value, zcc = zero.core.current, adv = zcc.adventure,
				per = zcc.person, pbs = per.body.springs, mag = pv * 1000;
			h.log(pn + " pounced on player for " + pv + " points");
			per.sfx("thud");
			pbs.weave.shove = pd.x * mag;
			pbs.slide.shove = pd.z * mag;
			(pcfg.zombifying || (per.score - pv >= 0)) && adv.score(-pv);
			vu.color.splash(per.zombified ? "green" : "red");
			return per.zombified && pcfg.zombifying;
		},
		onsplat: function(prey) {
			var h = vu.game.hopper, zcc = zero.core.current;
			h.log("you splatted " + prey.name);
			vu.color.splash("blue");
			zcc.sploder.splode(prey.position());
			zcc.adventure.score(h.pcfg().player[prey.opts.kind].value);
		},
		ztick: function() {
			var zc = zero.core, zcc = zc.current, person = zcc.person, p, target,
				_ = vu.game.hopper._, ztick = _.ztick, touching = zc.util.touching;
			person.score += 1;
			person.zombified = person.score < 0;
			zcc.adventure.menus.score();
			setTimeout(vu.live.meta, 600);
			if (!person.zombified)
				return zc.camera.angle(_.prevCam);
			for (p in zcc.people) {
				target = zcc.people[p];
				if (!isNaN(target.score) && target.score >= 0) {
					if (touching(target.body, person.body, 100)) {
						vu.live.game("average", [target.name, person.name]);
						setTimeout(ztick, 500);
					} else
						person.approach(target.body, ztick, false, false, 1000, true);
					return;
				}
			}
			person.wander("room", ztick, 1000);
		}
	},
	directions: {
		fauna: "fauna pouncing on player",
		player: "player pouncing on fauna"
	},
	log: function(msg) {
		CT.log("hopper: " + msg);
	},
	scfg: function(game) {
		var zcc = zero.core.current,
			scfg = (game || zcc.scene.game || zcc.adventure.game).score;
		if (!scfg.pounce)
			scfg.pounce = { fauna: {}, player: {} };
		if (!scfg.initial)
			scfg.initial = 0;
		return scfg;
	},
	pcfg: function(game) {
		return vu.game.hopper.scfg(game).pounce;
	},
	modder: function() { // { fauna: { dog: 2, cat: 10 }, player: { cat: 1 } }
		var _ = vu.game.hopper._, pounces = CT.dom.div();
		var node = _.editor = CT.dom.div([
			CT.dom.div("initial score", "big"),
			_.initial(),
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
		var h = vu.game.hopper, _ = h._;
		return CT.dom.div([
			"initial score: " + h.scfg(game).initial,
			"pounce dynamics",
			_.vgroup("player", game), _.vgroup("fauna", game)
		], "bordered padded margined round");
	},
	zombify: function() {
		var zc = zero.core, _ = vu.game.hopper._,
			person = zc.current.person, zombied = person.score < 0;
		if (zombied == person.zombified) return;
		person.zombified = zombied;
		_.prevCam = zc.camera.current;
		zombied && setTimeout(_.ztick, 1000);
	},
	init: function() {
		var h = vu.game.hopper, zc = zero.core, zcc = zc.current,
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
			zcc.person.onland(() => men.splat(prey, _.onsplat,
				pcfg.player[prey].source));
			zcc.sploder = new zc.Sploder();
		}
	}
};