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
				Object.keys(pz).map(p => p + ": " + pz[p])
			], "bordered padded margined round");
		},
		initial: function() { // deprecated!
			var h = vu.game.hopper, scfg = h.scfg();
			return CT.dom.range(function(val) {
				scfg.initial = parseInt(val);
				h._.upscore();
			}, 0, 10, scfg.initial, 1, "w1 block");
		},
		nosplat: function() {
			zero.core.current.person.powerjumping = false;
		},
		megasource: function(pcfg) {
			return pcfg && pcfg.source && pcfg.mega;
		},
		ztick: function() {
			var zc = zero.core, zcc = zc.current, person = zcc.person, p, target,
				_ = vu.game.hopper._, ztick = _.ztick, touching = zc.util.touching;
			person.score.ztick -= 1;
			person.zombified = person.score.ztick > 0;
			zcc.adventure.menus.score();
			setTimeout(vu.live.meta, 600);
			if (!person.zombified)
				return zc.camera.angle(_.prevCam);
			for (p in zcc.people) {
				target = zcc.people[p];
				if (target.score && !target.score.ztick) {
					if (touching(target.body, person.body, 100)) {
						vu.live.game("average", [target.name, person.name]);
						setTimeout(ztick, 500);
					} else
						person.approach(target.body, ztick, false, false, 1000, true);
					return;
				}
			}
			person.wander("room", ztick, 1000);
		},
		smack: function(prey, amount) {
			var h = vu.game.hopper, zcc = zero.core.current,
				_ = h._, pcfg = h.pcfg().player[prey.opts.kind];
			amount = (amount || 1) * zcc.person.score.level;
			h.log("you smacked " + prey.name + " @ " + prey.hp + " for " + amount);
			vu.color.splash("blue");
			prey.hp -= amount;
			if (prey.hp < 1) {
				h.setCritter(prey, pcfg);
				_.splode(prey, pcfg);
				_.megasource(pcfg) && h.bosses[pcfg.source].incLevel();
				return true;
			}
		},
		splode: function(prey, pcfg) {
			var h = vu.game.hopper, zcc = zero.core.current;
			pcfg = pcfg || h.pcfg().player[prey.opts.kind];
			zcc.sploder.splode(prey.position());
			zcc.adventure.score(pcfg.value * prey.level);
		}
	},
	on: {
		pounce: function(pouncer) {
			var h = vu.game.hopper, pd = pouncer.direction || pouncer.getDirection(),
				pn = pouncer.name, pk = pouncer.opts.kind,
				hcfg = h.pcfg(), pcfg = hcfg.fauna[pk], ppcfg = hcfg.player[pk],
				pv = pcfg.value * (pouncer.level || 1), mag = pv * 1000,
				zcc = zero.core.current, adv = zcc.adventure,
				per = zcc.person, pbs = per.body.springs;
			h.log(pn + " pounced on player for " + pv + " points");
			pbs.weave.shove = pd.x * mag;
			pbs.slide.shove = pd.z * mag;

			adv.damage(pv, pcfg.zombifying);

			h._.megasource(ppcfg) && h.bosses[ppcfg.source].decLevel();
			return per.zombified && pcfg.zombifying;
		},
		knock: function(prey, side) {
			return vu.game.hopper._.smack(prey,
				zero.core.current.person.held(side) ? 2 : 1);
		},
		kick: function(prey, side) {
			return vu.game.hopper._.smack(prey);
		},
		splat: function(prey) {
			var h = vu.game.hopper, _ = h._, zcc = zero.core.current,
				pcfg = h.pcfg().player[prey.opts.kind], zccp = zcc.person,
				amount = zccp.powerjumping ? 2 : 1;
			zccp.powerjumping && pcfg.powerjump && zccp.shouldFly();
			zccp.powerjumping = pcfg.powerjump;
			zccp.powerjumping && setTimeout(() => zcc.adventure.controls.jump(2));
			return _.smack(prey, amount);
		},
		crash: function(prey) {
			var h = vu.game.hopper, _ = h._;
			h.log(prey.name + " crashed into " + prey.source);
			h.bosses[prey.source].crash(prey);
			_.smack(prey);
		}
	},
	directions: {
		fauna: "fauna pouncing on player",
		player: "player pouncing on fauna"
	},
	bosses: {},
	log: function(msg) {
		CT.log("hopper: " + msg);
	},
	scfg: function(game) {
		var zcc = zero.core.current,
			scfg = (game || zcc.scene.game || zcc.adventure.game).score;
		if (!scfg.pounce)
			scfg.pounce = { fauna: {}, player: {} };
//		if (!scfg.initial)
//			scfg.initial = 0;
		return scfg;
	},
	pcfg: function(game) {
		return vu.game.hopper.scfg(game).pounce;
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
	zombify: function(zval) {
		var zc = zero.core, _ = vu.game.hopper._,
			person = zc.current.person;
		person.zombified = true;
		person.score.ztick = zval;
		_.prevCam = zc.camera.current; // TODO: improve?
		setTimeout(_.ztick, 1000);
	},
	setCritter: function(creature, ccfg) {
		var h = vu.game.hopper, hp = ccfg.hp,
			level = ccfg.source ? h.bosses[ccfg.source].level : ccfg.level;
		vu.game.hopper.log(creature.name + ": level " + level);
		creature.level = level;
		creature.hp = hp * level;
		creature.scale(level, true);
	},
	swinger: function(prey, cb, cfg, variety) {
		var zc = zero.core;
		return function(side) {
			zc.current.adventure.exert();
			return zc.knocker[variety](prey, cb, cfg, side);
		};
	},
	init: function() {
		var h = vu.game.hopper, zc = zero.core, zcc = zc.current,
			men = zcc.room.menagerie, pcfg = h.pcfg(), source,
			hunters = Object.keys(pcfg.fauna), ccfg, _ = h._,
			ppcfg = pcfg.player, prey = Object.keys(ppcfg);
		if (!men)
			return h.log("skipping init() - no menagerie");
		if (hunters.length) {
			h.log("activating " + hunters.length + " hunter varieties");
			men.huntPlayer(hunters, h.on.pounce);
		}
		if (prey.length) {
			h.log("activating " + prey.length + " prey varieties");
			zcc.person.onland(() => zc.knocker.splat(prey, h.on.splat, ppcfg, _.nosplat));
			zcc.person.body.onkick(h.swinger(prey, h.on.kick, ppcfg, "kick"));
			zcc.person.body.onthrust(h.swinger(prey, h.on.knock, ppcfg, "knock"));
			zcc.sploder = new zc.Sploder();
			prey.forEach(function(p) {
				ccfg = ppcfg[p];
				ccfg.level = ccfg.level || 1;
				ccfg.hp = ccfg.hp || ccfg.value || 1;
				men.setProp(p, "hp", ccfg.hp * ccfg.level);
				if (ccfg.source) {
					men.setProp(p, "source", ccfg.source);
					h.bosses[ccfg.source] = new vu.game.Boss({
						critter: p,
						name: ccfg.source,
						level: ccfg.level,
						oncrash: h.on.crash
					});
				}
			});
		}
	}
};