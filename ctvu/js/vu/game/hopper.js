vu.game.hopper = {
	directions: {
		fauna: "fauna pouncing on player",
		player: "player pouncing on fauna"
	},
	scfg: function(game) {
		var zcc = zero.core.current, cs = zcc.scene, sname = cs && cs.name,
			gcfg = game || cs.game || zcc.adventure.game, scfg = gcfg.score;
		if (sname) {
			if (!(sname in scfg))
				scfg[sname] = {};
			if (scfg.pounce) {
				CT.log("moving pounce to " + sname);
				scfg[sname].pounce = scfg.pounce;
				delete scfg.pounce;
			}
			scfg = scfg[sname];
			if (!scfg.pounce)
				scfg.pounce = {};
			else if (scfg.pounce.fauna || scfg.pounce.player)
				scfg.pounce = { room: scfg.pounce };
		}
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
	acfg: function(area, game) {
		return vu.game.hopper.pcfg(game, area);
	},
	mod: function() {
		return vu.game.hopper.modder.build();
	},
	view: function(game) {
		var h = vu.game.hopper;
		return h.viewer.build(h.scfg(game));
	},
	load: function() {
		vu.game.hopper.loader.init();
	}
};

vu.game.hopper.modder = {
	upscore: function() {
		var game = zero.core.current.scene.game;
		vu.storage.edit({
			key: game.key,
			score: game.score
		});
	},
	hopCheck: function(property, animal, pcfg) {
		return CT.dom.checkboxAndLabel(property,
			pcfg[property], null, null, null, function(cbox) {
				pcfg[property] = cbox.checked;
				vu.game.hopper.modder.upscore();
			}, animal);
	},
	addHop: function(variety, cfg, men) {
		var h = vu.game.hopper, hm = h.modder, pz = cfg[variety],
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
				hm.upscore();
				hm.editor.refresh();
			}
		});
	},
	hopSetter: function(pcfg, prop, name, desc, data, fallback) {
		var n = CT.dom.div(null, "clearnode");
		n.update = function() {
			CT.dom.setContent(n, [
				CT.dom.button("change", function() {
					CT.modal.choice({
						prompt: "choose " + name,
						data: data(),
						cb: function(val) {
							pcfg[prop] = val;
							n.update();
							vu.game.hopper.modder.upscore();
						}
					});
				}, "right"),
				desc + " " + (pcfg[prop] || fallback || "nothing")
			]);
		};
		n.update();
		return n;
	},
	autosource: function(pcfg) {
		return vu.game.hopper.modder.hopSetter(pcfg, "source", "automaton", "spawns from",
			() => zero.core.current.room.automatons.map(a => a.person.name), "room");
	},
	qdrop: function(pcfg) {
		return vu.game.hopper.modder.hopSetter(pcfg, "qdrop", "quest item", "drops",
			() => vu.core.options.names("held", "quest"));
	},
	hop: function(p, pz, variety) {
		var hm = vu.game.hopper.modder, pcfg = pz[p], cont;
		if (!isNaN(pcfg)) {
			pcfg = pz[p] = {
				value: pz[p]
			};
		}
		cont = [
			p,
			CT.dom.range(function(val) {
				pcfg.value = parseInt(val);
				hm.upscore();
			}, 1, 10, pcfg.value, 1, "w1 block")
		];
		if (variety == "player") {
			cont.push(hm.autosource(pcfg));
			cont.push(hm.qdrop(pcfg));
			cont.push(hm.hopCheck("mega", p, pcfg));
			cont.push(hm.hopCheck("powerjump", p, pcfg));
		} else // fauna
			cont.push(hm.hopCheck("zombifying", p, pcfg));
		return CT.dom.div(cont, "bordered padded margined round");
	},
	group: function(variety, cfg, men) { // player or fauna
		var h = vu.game.hopper, hm = h.modder, pz = cfg[variety];
		return CT.dom.div([
			CT.dom.button("add critter", () => hm.addHop(variety, cfg, men), "right"),
			h.directions[variety],
			Object.keys(pz).map(p => hm.hop(p, pz, variety))
		], "bordered padded margined round");
	},
	addArea: function(cfg) {
		var h = vu.game.hopper, hm = h.modder, mens = zero.core.current.room.menagerie || {},
			areas = Object.keys(mens).map(men => men.split("_").shift()).filter(area => !(area in cfg));
		if (!areas)
			return alert("no unconfigured menageries - add one on the pop page!");
		CT.modal.choice({
			prompt: "please select a menagerie area",
			data: areas,
			cb: function(area) {
				h.acfg(area);
				hm.upscore();
				hm.editor.refresh();
			}
		});
	},
	area: function(area, cfg) {
		var hm = vu.game.hopper.modder,
			men = zero.core.current.room.menagerie[area + "_menagerie"];
		return CT.dom.div([
			area,
			hm.group("player", cfg, men), hm.group("fauna", cfg, men)
		], "bordered padded margined round");
	},
	build: function() {
		var h = vu.game.hopper, hm = h.modder,
			cfg = h.pcfg(), pounces = CT.dom.div();
		var node = hm.editor = CT.dom.div([
			CT.dom.button("add area", () => hm.addArea(cfg), "right"),
			CT.dom.div("pounce dynamics", "big"),
			pounces
		], "bordered padded margined round");
		node.refresh = function() {
			CT.dom.setContent(pounces,
				Object.keys(cfg).map(area => hm.area(area, cfg[area])));
		};
		zero.core.util.onRoomReady(node.refresh);
		return node;
	}
};

vu.game.hopper.viewer = {
	group: function(variety, cfg) {
		var h = vu.game.hopper, pz = cfg[variety];
		return CT.dom.div([
			h.directions[variety],
			Object.keys(pz).map(p => p + ": " + JSON.stringify(pz[p]))
		], "bordered padded margined round inline-block");
	},
	area: function(area, cfg) {
		var v = vu.game.hopper.viewer;
		return CT.dom.div([
			area,
			v.group("player", cfg), v.group("fauna", cfg)
		], "bordered padded margined round inline-block");
	},
	scene: function(sname, cfg) {
		var v = vu.game.hopper.viewer, areas = Object.keys(cfg);
		return CT.dom.div([
			CT.dom.div(sname, "big"),
			areas.length ? areas.map(area => v.area(area, cfg[area])) : "nothing yet!"
		], "bordered padded margined round");
	},
	build: function(pcfg) {
		var v = vu.game.hopper.viewer, scenes = Object.keys(pcfg);
		return scenes.length ? scenes.map(scene => v.scene(scene,
			pcfg[scene].pounce)) : "nothing yet!";
	}
}

vu.game.hopper.loader = {
	bosses: {},
	hoppers: {},
	t2k: function(thing) {
		if (!thing) return;
		var o = thing.opts;
		return o.key || o.fakeKey;
	},
	hop: function() {
		var hz = vu.game.hopper.loader.hoppers,
			upon = zero.core.current.person.body.upon;
		return upon && hz[upon.name] || hz.room;
	},
	bossSwing: function(variety, side) {
		var boss, bname, bosses = vu.game.hopper.loader.bosses,
			zc = zero.core, touching = zc.util.touching,
			zcc = zc.current, p = zcc.person, damage = 1, thing;
		if (variety == "knock") {
			thing = p.held(side, true);
			if (p.held(side))
				damage = 2;
		} else
			thing = p.body.torso.legs[side].foot;
		for (bname in bosses) {
			boss = bosses[bname];
			if (boss.climax) // climax = fight in progress
				if (touching(thing, boss.person.body, 50, false, true))
					boss.shove(p.body.front.getDirection(), damage);
		}
	},
	swinger: function(variety, side) {
		var zcc = zero.core.current, item,
			hl = vu.game.hopper.loader, hop = hl.hop();
		zcc.player.exert();
		hl.bossSwing(variety, side);
		if (hop) return hop.swing(variety, side); // handles touch
		if (variety != "knock") return;
		item = zcc.person.held(side);
		item && item.touch && item.touch();
	},
	splatter: function() {
		var hop = vu.game.hopper.loader.hop();
		return hop && hop.splat();
	},
	swapper: function(area, side) {
		CT.log("swap " + area + " " + side);
		var p = zero.core.current.person, t2k = vu.game.hopper.loader.t2k,
			held = p.held(side), bagged = p.bagged(area, side),
			hk = t2k(held), bk = t2k(bagged);
		// first remove...
		held && p.unhold(side);
		bagged && p.unholster(area, side);
		// then add...
		held && p.holster(hk, area, side);
		bagged && p.hold(bk, side);
	},
	getBoss: function(name) {
		var bz = vu.game.hopper.loader.bosses;
		if (!(name in bz)) {
			bz[name] = new vu.game.Boss({
				name: name
			});
		}
		return bz[name];
	},
	initBosses: function() {
		var zcc = zero.core.current, vg = vu.game, hl = vg.hopper.loader,
			acfg = vg.util.state(zcc.scene.name, "automatons"), name;
		for (name in acfg)
			hl.getBoss(name);
	},
	initPlayer: function() {
		var hl = vu.game.hopper.loader,
			per = zero.core.current.person, thruster = per.thruster;
		per.select();
		per.onland(hl.splatter);
		thruster.on("unkick", side => hl.swinger("kick", side));
		thruster.on("unthrust", side => hl.swinger("knock", side));
		thruster.on("unback", side => hl.swapper("back", side));
		thruster.on("unhip", side => hl.swapper("hip", side));
	},
	unload: function() {
		var hl = vu.game.hopper.loader, boss, hopper;
		for (hopper in hl.hoppers)
			hl.hoppers[hopper].deallocate();
		for (boss in hl.bosses)
			hl.bosses[boss].deallocate();
		hl.hoppers = {};
		hl.bosses = {};
	},
	init: function() {
		var h = vu.game.hopper, hl = h.loader,
			zc = zero.core, zcc = zc.current,
			menz = zcc.room.menagerie || {}, mename, area;
		if (zcc.sploder) // fine a marker as any...
			hl.unload();
		else {
			zcc.sploder = new zc.Sploder();
			hl.initPlayer();
		}
		hl.initBosses();
		for (mename in menz) {
			area = mename.split("_").shift();
			hl.hoppers[area] = new h.Hopper({
				area: area,
				menagerie: menz[mename]
			});
		}
	}
};

vu.game.hopper.Hopper = CT.Class({
	CLASSNAME: "vu.game.hopper.Hopper",
	_: {
		smack: function(prey, amount) {
			var _ = this._, zcc = zero.core.current, pcfg = _.pcfg(prey.opts.kind);
			amount = (amount || 1) * zcc.person.score.level;
			this.log("you smacked", prey.name, "@", prey.hp, "for", amount);
			vu.color.splash("blue");
			prey.hp -= amount;
			if (prey.hp < 1) {
				this.setCritter(prey);
				_.splode(prey);
				_.megasource(prey) && _.boss(pcfg.source).incLevel();
				pcfg.qdrop && zcc.dropper(prey.position(), "held", "quest", pcfg.qdrop);
				return true;
			}
		},
		megasource: function(prey) {
			var pcfg = this._.pcfg(prey.opts.kind);
			return pcfg && pcfg.source && pcfg.mega;
		},
		boss: function(name) {
			return vu.game.hopper.loader.getBoss(name);
		},
		cfg: function(variety, critter, property) {
			var ccfg = this.cfg[variety];
			if (critter)
				ccfg = ccfg[critter];
			return (ccfg && property) ? ccfg[property] : ccfg;
		},
		pcfg: function(prey, property) {
			return this._.cfg("player", prey, property);
		},
		hcfg: function(hunter, property) {
			return this._.cfg("fauna", hunter, property);
		},
		splode: function(prey) {
			var zcc = zero.core.current, pp = prey.position();
			zcc.sploder.splode(pp);
			vu.game.dropper.drop(pp, "consumable");
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
	scale: function(creature) {
		creature._origScale = creature._origScale || creature.opts.scale || [1, 1, 1];
		var lev = creature.level, s = creature._origScale;
		creature.scale([lev * s[0], lev * s[1], lev * s[2]], true);
	},
	setCritter: function(creature) {
		var _ = this._, ccfg = _.pcfg(creature.opts.kind), hp = ccfg.hp,
			level = ccfg.source ? _.boss(ccfg.source).level : ccfg.level;
		this.log(creature.name, ":: level", level);
		creature.adjust("rotation", "x", 0);
		creature.adjust("rotation", "z", 0);
		creature.hp = hp * level;
		creature.level = level;
		this.scale(creature);
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
	deallocate: function() {
		delete this.menagerie; // anything else?
	},
	start: function() {
		this.initHunters();
		this.initPrey();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			// what here?
		});
		this.area = opts.area;
		this.menagerie = opts.menagerie;
		this.cfg = vu.game.hopper.pcfg(null, this.area);
		this.menagerie.onReady(this.start);
	}
});