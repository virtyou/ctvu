vu.game.Boss = CT.Class({
	CLASSNAME: "vu.game.Boss",
	_: {
		taunts: ["is that the best you can do?", "don't make me laugh!",
			"you gotta be kidding me", "that's pathetic", "just give up!",
			"nice try, you runt!", "you're no match for me!", "i'll get you!",
			"come back here!", "get over here!", "i'll show you!", "you can't stop me!"],
		laments: ["uh oh", "oh no", "oh man", "oops!", "i was wrong!",
			"you got me", "i misjudged you", "how could you beat me?"],
		toss: function(hand, target) {
			this.person.body.unthrust(hand.opts.side);
			target.knock(this.person.direction());
		},
		hit: function(appendage, target) {
			var zc = zero.core;
			if (zc.util.touching(appendage, target, 50, null, true)) {
				zc.current.adventure.damage(this.level);
				target.shove(this.person.direction(), this.level);
			}
		},
		kick: function(side) {
			this._.hit(this.person.body.torso.legs[side].foot, zero.core.current.person.body);
		},
		windUp: function(hand, target) {
			target.stick(hand);
			this.person.body.thrust(hand.opts.side);
			this.person.orient(zero.core.current.person.body);
			setTimeout(() => this._.toss(hand, target), 400);
		},
		closest: function(critname) {
			return zero.core.current.room.menagerie.near(critname, this.person.body);
		},
		die: function() {
			var zc = zero.core;
			zc.audio.ux("confetti");
			zc.current.room.eject(this.person);
			zc.current.sploder.confettize(this.person.body.position());
		}
	},
	moves: { // TODO: jump
		taunt: function() { // (neg)
			this.person.say(CT.data.choice(this._.taunts));
		},
		throw: function() {
			var _ = this._;
			if (this.opts.critter) {
				var crit = _.closest(this.opts.critter);
				crit && this.person.touch(crit, null, null, null, _.windUp);
			} else { // orbs [fire/ice/acid]

			}
		},
		charge: function() {
			this.person.approach("player", null, null, null, null, true);
		}
	},
	melee: {
		punch: function() {
			this.person.touch(zero.core.current.person.body, null, null, null, this._.hit, true);
		},
		kick: function() {
			this.person.orient(zero.core.current.person.body);
			this.person.body.kick(CT.data.random() ? "left" : "right", 200);
		}
	},
	tick: function() {
		var _ = this._, zc = zero.core, moves = this.moves;
		if (this.hp < 1) {
			this.person.say(CT.data.choice(_.laments), _.die);
			return this.log("defeated!!!!!");
		}
		if (zc.util.touching(this.person.body, zc.current.person.body, 100))
			moves = this.melee;
		CT.data.choice(Object.values(moves))();
		setTimeout(this.tick, 3000);
	},
	crash: function(critter) {
		this.shove(critter.getDirection(), critter.level);
		this.person.dance("fall", 800);
		this.drop();
	},
	shove: function(direction, amount) {
		this.person.body.shove(direction, amount);
		this.hit();
	},
	hit: function(amount) {
		this.hp -= (amount || 1);
		this.meter.set(this.hp);
	},
	scale: function(s) {
		this.person.body.scale(s || ((this.level + 1) / 2), true);
	},
	position: function(pos, world) {
		return this.person.body.position(pos, world);
	},
	drop: function() {
		vu.game.dropper.drop(this.position());
	},
	wileOut: function() {
		this.person.mood.update({ mad: 1, energy: 2 });
		this.person.energy.damp = 0.6;
		this.person.automaton.pause();
		this.person.body.onkick(this._.kick);
		this.climax = true;
		this.meter.show();
		this.drop();
		this.tick();
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
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			level: 1,
			floor: 1,
//			hp: 100,
			cap: 5
		});
		if (!opts.hp)
			opts.hp = opts.cap * 10;
		if (!opts.person)
			opts.person = zero.core.current.people[opts.name];
		this.hp = opts.hp;
		this.person = opts.person;
		this.setLevel(opts.level);
		this.person.body.oncrash = opts.oncrash;
		this.meter = new vu.game.Meter({
			menu: true,
			cap: opts.hp,
			lineWidth: "400px"
		});
	}
});