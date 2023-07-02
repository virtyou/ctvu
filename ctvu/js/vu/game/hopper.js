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
		hopCheck: function(property, animal, pcfg) {
			return CT.dom.checkboxAndLabel(property,
				pcfg[property], null, null, null, function(cbox) {
					pcfg[property] = cbox.checked;
					vu.game.hopper._.upscore();
				}, animal);
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
				cont.push(_.hopCheck("mega", p, pcfg));
				cont.push(_.hopCheck("powerjump", p, pcfg));
			} else // fauna
				cont.push(_.hopCheck("zombifying", p, pcfg));
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
				Object.keys(pz).map(p => p + ": " + JSON.stringify(pz[p]))
			], "bordered padded margined round");
		},
		initial: function() { // deprecated!
			var h = vu.game.hopper, scfg = h.scfg();
			return CT.dom.range(function(val) {
				scfg.initial = parseInt(val);
				h._.upscore();
			}, 0, 10, scfg.initial, 1, "w1 block");
		}
	},
	directions: {
		fauna: "fauna pouncing on player",
		player: "player pouncing on fauna"
	},
	bosses: {},
	hoppers: {},
	log: function(msg) {
		CT.log("hopper: " + msg);
	},
	scfg: function(game) {
		var zcc = zero.core.current,
			scfg = (game || zcc.scene.game || zcc.adventure.game).score;
		if (!scfg.pounce)
			scfg.pounce = {};// { fauna: {}, player: {} };
		else if (scfg.pounce.fauna || scfg.pounce.player)
			scfg.pounce = { room: scfg.pounce };
//		if (!scfg.initial)
//			scfg.initial = 0;
		return scfg;
	},
	pcfg: function(game, area) {
		var pcfg = vu.game.hopper.scfg(game).pounce;
		if (!area)
			return pcfg;
		if (!pcfg[area])
			pcfg[area] = { player: {}, fauna: {} };
		return pcfg[area];
	},
	hop: function() {
		var hz = vu.game.hopper.hoppers,
			upon = zero.core.current.person.body.upon;
		return upon && hz[upon.name] || hz.room;
	},
	modder: function() { // { fauna: { dog: 2, cat: 10 }, player: { cat: 1 } }
		var _ = vu.game.hopper._, pounces = CT.dom.div();
		var node = _.editor = CT.dom.div([
//			CT.dom.div("initial score", "big"),
//			_.initial(),
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
//			"initial score: " + h.scfg(game).initial,
			"pounce dynamics",
			_.vgroup("player", game), _.vgroup("fauna", game)
		], "bordered padded margined round");
	},
	swinger: function(variety, side) {
		var hop = vu.game.hopper.hop();
		zero.core.current.player.exert();
		return hop && hop.swing(variety, side);
	},
	splatter: function() {
		var hop = vu.game.hopper.hop();
		return hop && hop.splat();
	},
	getBoss: function(name) {
		var h = vu.game.hopper, bz = h.bosses;
		if (!(name in bz)) {
			bz[name] = new vu.game.Boss({
				name: name
//				level: ccfg.level,   // set in Boss constructor from acfg?
			});
		}
		return bz[name];
	},
	initBosses: function() {
		var h = vu.game.hopper, bz = h.bosses, name,
			agi = zero.core.current.adventure.game.initial,
			acfg = agi.automatons = agi.automatons || {};
		for (name in acfg)
			h.getBoss(name);
	},
	initPlayer: function() {
		var person = zero.core.current.person;
		person.onland(h.splatter);
		person.body.onkick(side => h.swinger("kick", side));
		person.body.onthrust(side => h.swinger("knock", side));
	},
	init: function() {
		var h = vu.game.hopper, zc = zero.core, zcc = zc.current,
			menz = zcc.room.menagerie || {}, area;
		zcc.sploder = new zc.Sploder();
		h.initPlayer();
		h.initBosses();
		for (area in menz) {
			h.hoppers[area] = new vu.game.hopper.Hopper({
				area: area,
				menagerie: menz[area]
			});
		}
	}
};

vu.game.hopper.Hopper = CT.Class({
	CLASSNAME: "vu.game.hopper.Hopper",
	_: {
		smack: function(prey, amount) {
			var _ = this._, pcfg = _.pcfg(prey.opts.kind);
			amount = (amount || 1) * zero.core.current.person.score.level;
			this.log("you smacked", prey.name, "@", prey.hp, "for", amount);
			vu.color.splash("blue");
			prey.hp -= amount;
			if (prey.hp < 1) {
				this.setCritter(prey);
				_.splode(prey);
				_.megasource(prey) && _.boss(pcfg.source).incLevel();
				return true;
			}
		},
		megasource: function(prey) {
			var pcfg = this._.pcfg(prey.opts.kind);
			return pcfg && pcfg.source && pcfg.mega;
		},
		boss: function(name) {
			return vu.game.hopper.getBoss(name);
		},
		cfg: function(variety, critter, property) {
			var ccfg = this.cfg[variety][critter];
			return (ccfg && property) ? ccfg[property] : ccfg;
		},
		pcfg: function(prey, property) {
			return this._.cfg("player", prey, property);
		},
		hcfg: function(hunter, property) {
			return this._.cfg("fauna", hunter, property);
		},
		splode: function(prey) {
			var zcc = zero.core.current;
			zcc.sploder.splode(prey.position());
			zcc.adventure.score(this._.pcfg(prey.opts.kind, "value") * prey.level);
		},
		nosplat: function() {
			zero.core.current.person.powerjumping = false;
		}
	},
	on: {
		pounce: function(pouncer) {
			var _ = this._, pd = pouncer.direction || pouncer.getDirection(),
				pn = pouncer.name, pk = pouncer.opts.kind,
				hcfg = _.hcfg(pk), pcfg = _.pcfg(pk),
				pv = hcfg.value * (pouncer.level || 1), mag = pv * 1000,
				zcc = zero.core.current, player = zcc.player,
				per = player.person, pbs = per.body.springs;
			this.log(pn, "pounced on player for", pv, "points");
			pbs.weave.shove = pd.x * mag;
			pbs.slide.shove = pd.z * mag;
			player.damage(pv, hcfg.zombifying);
			_.megasource(pouncer) && _.boss(pcfg.source).decLevel();
			return per.zombified && hcfg.zombifying;
		},
		knock: function(prey, side) {
			return this._.smack(prey, zero.core.current.person.held(side) ? 2 : 1);
		},
		kick: function(prey, side) {
			return this._.smack(prey);
		},
		splat: function(prey) {
			var _ = this._, pcfg = _.pcfg(prey.opts.kind),
				zcc = zero.core.current, zccp = zcc.person,
				amount = zccp.powerjumping ? 2 : 1;
			zccp.powerjumping && pcfg.powerjump && zccp.shouldFly();
			zccp.powerjumping = pcfg.powerjump;
			zccp.powerjumping && setTimeout(() => zcc.adventure.controls.jump(2));
			return _.smack(prey, amount);
		},
		crash: function(prey) {
			var _ = this._;
			this.log(prey.name, "crashed into", prey.source);
			_.boss(prey.source).crash(prey);
			_.smack(prey);
		}
	},
	splat: function() {
		return zero.core.knocker.splat(this.menagerie, this.prey,
			this.on.splat, this._.pcfg(), this._.nosplat);
	},
	swing: function(variety, side) { // knock or kick
		var zc = zero.core;
		zc.current.player.exert();
		return zc.knocker[variety](this.menagerie, this.prey,
			this.on[variety], this._.pcfg(), side);
	},
	setCritter: function(creature) {
		var _ = this._, ccfg = _.pcfg(creature.opts.kind), hp = ccfg.hp,
			level = ccfg.source ? _.boss(ccfg.source).level : ccfg.level;
		this.log(creature.name, ":: level", level);
		creature.level = level;
		creature.hp = hp * level;
		creature.scale(level, true);
	},
	initHunters: function() {
		var hunters = this.hunters = Object.keys(this.cfg.fauna);
		if (hunters.length) {
			this.log("activating", hunters.length, "hunter varieties");
			this.menagerie.huntPlayer(hunters, this.on.pounce);
		}
	},
	initPrey: function() {
		var prey = this.prey = Object.keys(this.cfg.player),
			men = this.menagerie, pcfg = this.cfg.player,
			_ = this._, crasher = this.on.crash, ccfg, boss;
		prey.forEach(function(p) {
			ccfg = pcfg[p];
			ccfg.level = ccfg.level || 1;
			ccfg.hp = ccfg.hp || ccfg.value || 1;
			men.setProp(p, "hp", ccfg.hp * ccfg.level);
			if (ccfg.source) {
				men.setProp(p, "source", ccfg.source);
				boss = _.boss(ccfg.source);
				boss.addCritter(p);
				boss.setMenagerie(men);
				boss.setOnCrash(crasher);
			}
		});
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			// what here?
		});
		this.area = opts.area;
		this.menagerie = opts.menagerie;
		this.cfg = vu.game.hopper.pcfg(null, this.area);
		this.initHunters();
		this.initPrey();
	}
});