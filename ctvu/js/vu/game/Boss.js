vu.game.Boss = CT.Class({
	CLASSNAME: "vu.game.Boss",
	_: {
		taunts: ["is that the best you can do?", "don't make me laugh!",
			"you gotta be kidding me", "that's pathetic", "just give up!",
			"nice try, you runt!", "you're no match for me!", "i'll get you!",
			"come back here!", "get over here!", "i'll show you!", "you can't stop me!"],
		laments: ["uh oh", "oh no", "oh man", "oops!", "i was wrong!",
			"you got me", "i misjudged you", "how could you beat me?"],
		orbs: ["fire", "ice", "acid"],
		orb: function(variety) {
			return new vu.game.Boss.Orb({
				caster: this,
				variety: variety,
				hitter: this._.hit
			});
		},
		toss: function(hand, target) {
			this.person.thruster.unthrust(hand.opts.side);
			target.knock(this.person.direction());
		},
		hit: function(appendage, target) {
			var zc = zero.core, zcc = zc.current;
			appendage = appendage || this.person.body;
			target = target || zcc.person.body;
			this.person.body.basicBound(); // hm ... maybe change?
			if (zc.util.touching(appendage, target, 50, null, true)) {
				zcc.player.damage(this.level);
				target.shove(this.person.direction(), this.level);
				return "splat";
			}
		},
		kick: function(side) {
			this._.hit(this.person.body.torso.legs[side].foot, zero.core.current.person.body);
		},
		windUp: function(hand, target) {
			target.stick(hand);
			this.person.thruster.thrust(hand.opts.side);
			this.person.orient(zero.core.current.person.body);
			setTimeout(() => this._.toss(hand, target), 400);
		},
		closest: function(critname) {
			return this.menagerie.near(critname, this.person.body);
		},
		crit: function() {
			var cname, crit, _ = this._;
			for (cname of this.opts.critters) {
				crit = _.closest(cname);
				if (crit)
					return crit;
			}
		},
		unimplemented: function(functionality) {
			this.person.say(functionality + " hasn't been implemented");
		},
		die: function() {
			this.meter.hide();
			this.drop(this.cfg.drop.stop);
			CT.event.emit("die", this.person.name);
			zero.core.current.room.eject(this.person);
		}
	},
	moves: {
		approach: {
			charge: function() {
				this.person.approach("player", null, null, null, null, true);
			},
			jump: function() {
				this.person.leap(zero.core.current.person.body, this._.hit, this.cfg.fly);
			}
		},
		range: {
			taunt: function() { // (neg)
				this.person.say(CT.data.choice(this._.taunts));
			},
			throw: function() {
				if (!this.throws.length)
					return this.moves.taunt();
				var _ = this._, toss = CT.data.choice(this.throws), crit;
				this.log("throw", toss);
				if (toss == "fauna") {
					crit = _.crit();
					crit && this.person.touch(crit, null, null, null, _.windUp);
				} else
					this.orbs[toss].throw();
			}
		},
		melee: {
			punch: function() {
				this.person.touch(zero.core.current.person.body, null, null, null, this._.hit, true);
			},
			kick: function() {
				this.person.orient(zero.core.current.person.body);
				this.person.thruster.kick(CT.data.random() ? "left" : "right", 200);
			}
		}
	},
	tick: function() {
		var _ = this._, zc = zero.core, pb = zc.current.person.body,
			mz = this.moves, moves = mz.range, per = this.person, bod = per.body;
		if (this.hp < 1) {
			per.say(CT.data.choice(_.laments), _.die);
			return this.log("defeated!!!!!");
		}
		setTimeout(this.tick, 3000);
		if (zc.util.touching(bod, pb, 100))
			moves = mz.melee;
		else if (!this.stayOn || this.stayOn == pb.upon)
			moves = CT.merge(moves, mz.approach);
//		else if (bod.flying)
//			return this.log("flying - skipping non-melee tick()");
		CT.data.choice(Object.values(moves))();
	},
	crash: function(critter) {
		this.shove(critter.getDirection(), critter.level);
		this.person.dance("fall", 800);
		this.drop();
	},
	shove: function(direction, amount) {
		this.person.body.shove(direction, amount);
		this.hit(amount);
	},
	hit: function(amount) {
		this.hp -= (amount || 1);
		this.meter.set(this.hp);
	},
	scale: function(s) {
		this.person.body.grow(s || ((this.level + 1) / 2), false, true);
	},
	position: function(pos, world) {
		return this.person.body.position(pos, world);
	},
	drop: function(variety) {
		vu.game.dropper.drop(this.position(),
			variety ? "held" : "consumable", variety);
	},
	wileOut: function() {
		var p = this.person;
		p.mood.update({ mad: 1, energy: 2 });
		p.energy.damp = 0.6;
		p.automaton.pause();
		p.thruster.on("unkick", this._.kick);
		this.climax = true;
		this.meter.show();
		CT.event.emit("wile", p.name);
		this.drop(this.cfg.drop.start);
		p.lastWhere && (p.lastWhere != "room") && this.setStay(p.lastWhere);
		this.tick();
	},
	setStay: function(where) {
		var place = this.stayOn = zero.core.current.room[where],
			bz = place.bounds, bmi = bz.min, bma = bz.max,
			sz = this.person.body.springs,
			wb = sz.weave.bounds, sb = sz.slide.bounds;
		wb.min = bmi.x;
		wb.max = bma.x;
		sb.min = bmi.z;
		sb.max = bma.z;
	},
	setLevel: function(level) {
		this.log("level", level);
		this.level = level;
		this.scale();
	},
	incLevel: function() {
		if (this.climax)
			return this.log("incLevel skipped - @ climax");
		this.setLevel(this.level + 1);
		(this.level == this.opts.cap) && this.wileOut();
	},
	decLevel: function() {
		if (this.climax)
			this.log("decLevel skipped - @ climax")
		else if (this.level > this.opts.floor)
			this.setLevel(this.level - 1);
		else
			this.log("decLevel skipped - @ floor");
	},
	addCritter: function(crit) {
		this.opts.critters.push(crit);
	},
	setMenagerie: function(men) {
		this.menagerie = men;
	},
	setOrbs: function() {
		var _ = this._, o;
		this.orbs = {};
		for (o of _.orbs)
			if (this.throws.includes(o))
				this.orbs[o] = _.orb(o);
	},
	setOnCrash: function(oncrash) {
		(this.person ? this.person.body : this.opts).oncrash = oncrash;
	},
	setPerson: function() {
		var opts = this.opts;
		if (this.person)
			return this.log("setPerson(): person already set!");
		this.person = opts.person || zero.core.current.people[opts.name];
		if (!this.person) {
			this.log("setPerson(): person not ready - deferring");
			return setTimeout(this.setPerson, 200);
		}
		this.setOrbs();
		this.setLevel(opts.level);
		this.setOnCrash(opts.oncrash);
	},
	deallocate: function() {
		var orb, boss;
		for (orb in this.orbs)
			this.orbs[orb].deallocate();
		delete this.orbs;
		delete this.meter;
		delete this.person;
		delete this.menagerie;
	},
	init: function(opts) {
		var zcc = zero.core.current, tcfg;
		this.opts = opts = CT.merge(opts, {
			level: 1,
			floor: 1,
//			hp: 100,
			cap: 5,
			hpmult: 5,
			critters: []
		});
		if (!opts.hp)
			opts.hp = opts.cap * opts.hpmult;
		this.hp = opts.hp;
		this.cfg = vu.game.util.state(zcc.scene.name, "automatons", opts.name);
		this.cfg.drop = this.cfg.drop || {};
		tcfg = this.cfg.throw = this.cfg.throw || {};
		this.throws = Object.keys(tcfg).filter(t => tcfg[t]);
		this.setMenagerie(opts.menagerie);
		this.setPerson();
		this.meter = new vu.game.Meter({
			menu: true,
			cap: opts.hp,
			lineWidth: "400px"
		});
	}
});

// TODO: move this stuff somewhere else???
vu.game.Boss.Orb = CT.Class({
	CLASSNAME: "vu.game.Boss.Orb",
	hitters: {
		fire: function() {
			zero.core.current.sploder.splode(this.position(), "flameburst");
			this.target.setAura("hot", 10000);
		},
		ice: function() {
			zero.core.current.sploder.shart(this, true);
			this.target.setAura("cold", 10000);
		},
		acid: function() {
			zero.core.current.sploder.shart(this, true);
		}
	},
	tick: function(dts) {
		var hit, oz = this.opts;
		if (this.throwing)
			this.setPos(this.hand.position(null, true));
		else if (this.flying) {
			this.setPos(null, true, oz.speed);
			hit = this.hitter(this);
			if (hit) {
				this.hitters[oz.variety]();
				this.target.sfx(hit);
				this.flying = false;
			}
		} else {
			this.hide();
			zero.core.util.untick(this.tick);
		}
	},
	release: function() {
		this.flying = true;
		this.throwing = false;
		this.person.thruster.unthrust(this.side);
		this.look(this.target.body.position());
		this.getDirection();
	},
	throw: function() {
		this.show();
		this.throwing = true;
		zero.core.util.ontick(this.tick);
		this.person.thruster.upthrust(this.side);
		this.person.orient(this.target.body, null, this.release);
	},
	deallocate: function() {
		delete this.hitter;
		delete this.person;
		delete this.target;
		delete this.hand;
		this.remove();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, vu.game.Boss.Orb.varieties[opts.variety], {
			speed: 4,
			invisible: true,
			sphereGeometry: 20
		}, this.opts);
		this.hitter = opts.hitter;
		this.person = opts.caster.person;
		this.target = zero.core.current.person;
		this.side = CT.data.choice(["left", "right"]);
		this.hand = this.person.body.torso.hands[this.side];
	}
}, zero.core.Thing);

vu.game.Boss.Orb.varieties = {
	fire: {
		vstrip: "templates.one.vstrip.inferno"
	},
	ice: {
		frozen: true
	},
	acid: {
		material: {
			shininess: 100,
			color: "#00ff00"
		}
	}
};