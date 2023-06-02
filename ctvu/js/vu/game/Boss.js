vu.game.Boss = CT.Class({
	CLASSNAME: "vu.game.Boss",
	crash: function(critter) {
		this.shove(critter.direction, critter.level);
		zero.core.util.invert(critter.direction);
		this.drop();
	},
	shove: function(direction, amount) {
		this.person.body.shove(direction, amount);
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
			hp: 10
		});
		if (!opts.person)
			opts.person = zero.core.current.people[opts.name];
		this.person = opts.person;
		this.setLevel(opts.level);
		this.person.body.oncrash = opts.oncrash;
	}
});