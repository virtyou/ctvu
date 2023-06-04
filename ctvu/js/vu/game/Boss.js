vu.game.Boss = CT.Class({
	CLASSNAME: "vu.game.Boss",
	crash: function(critter) {
		this.shove(critter.getDirection(), critter.level);
		this.person.dance("fall", 800);
//		zero.core.util.invert(critter.direction);
		this.drop();
	},
	shove: function(direction, amount) {
		this.person.body.shove(direction, amount);
		this.hit();
	},
	hit: function(amount) {
		this.hp -= (amount || 1);
		this.meter.set(this.hp);
		if (this.hp < 1) { // TODO: actual defeat...
			this.log("defeated!!!!!");
		}
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
		this.drop();
		this.meter.show();
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
			cap: 5,
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