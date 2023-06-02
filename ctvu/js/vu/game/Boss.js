vu.game.Boss = CT.Class({
	CLASSNAME: "vu.game.Boss",
	crash: function(critter) {
		this.shove(critter.direction);
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
	setLevel: function(level) {
		this.log("level", level);
		this.level = level;
		this.scale(level);
	},
	incLevel: function() {
		this.setLevel(this.level + 1);
		if (this.level == 5) {
			// TODO: initiate boss mode!
			this.drop();
		}
	},
	decLevel: function() {
		if (this.level > 1)
			this.setLevel(this.level - 1);
		else
			this.log("defeated!!!")
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			level: 1
		});
		if (!opts.person)
			opts.person = zero.core.current.people[opts.name];
		this.person = opts.person;
		this.setLevel(opts.level);
		this.person.body.oncrash = opts.oncrash;
	}
});