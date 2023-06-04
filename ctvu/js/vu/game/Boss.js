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
	moves: { // TODO: jump, charge, punch, kick...
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
		}
	},
	tick: function() {
		var _ = this._;
		if (this.hp < 1) { // TODO: actual defeat...
			this.person.say(CT.data.choice(_.laments), _.die);
			return this.log("defeated!!!!!");
		}
		this.moves[CT.data.choice(Object.keys(this.moves))]();
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
		this.person.body.scale(s, true);
	},
	position: function(pos, world) {
		return this.person.body.position(pos, world);
	},
	drop: function() {
		vu.game.dropper.drop(this.position());
	},
	wileOut: function() {
		this.climax = true;
		this.meter.show();
		this.drop();
		this.tick();
	},
	setLevel: function(level) {
		this.log("level", level);
		this.level = level;
		this.scale(level);
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
			cap: 4,
			hp: 100
		});
		if (!opts.person)
			opts.person = zero.core.current.people[opts.name];
		this.hp = opts.hp;
		this.person = opts.person;
		this.setLevel(opts.level);
		this.person.body.oncrash = opts.oncrash;
		this.meter = new vu.game.Boss.Meter({ hp: opts.hp });
	}
});

vu.game.Boss.Meter = CT.Class({
	CLASSNAME: "vu.game.Boss.Meter",
	_: {
		width: function() {
			return (this.hp * this.opts.unit) + "px";
		}
	},
	set: function(hp) {
		this.hp = Math.max(hp, 0);
		this.bloodLine.style.width = this._.width();
	},
	show: function() {
		this.menu.show("ctmain");
	},
	initMenu: function() {
		this.bloodLine = CT.dom.div(null, "h15p redback");
		this.lifeLine = CT.dom.div(this.bloodLine, "bordered noflow");
		this.bloodLine.style.width = this.lifeLine.style.width = this._.width();
		this.menu = vu.core.menu("battle", "top", this.lifeLine);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			hp: 100,
			unit: 4
		});
		this.hp = opts.hp;
		this.initMenu();
	}
});