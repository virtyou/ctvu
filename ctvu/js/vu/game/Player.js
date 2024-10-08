vu.game.Player = CT.Class({
	CLASSNAME: "vu.game.Player",
	_: {
		ztick: function() {
			var zc = zero.core, zcc = zc.current, p, target,
				person = this.person, touching = zc.util.touching;
			person.score.ztick -= 1;
			person.zombified = person.score.ztick > 0;
			if (!person.zombified)
				return zc.camera.angle("preferred");
			for (p in zcc.people) {
				target = zcc.people[p];
				if (target.score && !target.score.ztick) {
					if (touching(target.body, person.body, 100))
						vu.live.game("average", [target.name, person.name]);
					else
						person.approach(target.body, null, false, false, 1000, true);
					return;
				}
			}
			person.wander("room", null, false, 1000);
		},
		cap: function() {
			return this.person.score.level * this.opts.mult;
		}
	},
	tick: function() {
		var _ = this._, p = this.person, t = 1000, unChanged,
			w = p.body.within, s = p.score, cap = _.cap(), floor = -5;
		if (w && w.opts.state == "liquid") {
			if (s.breath && !w.opts.lava)
				s.breath -= 1;
			else
				s.hp -= 1;
		} else if (p.running)
			s.breath -= 1;
		else if (s.breath < cap) {
			if (s.breath < floor)
				s.breath = floor;
			else
				s.breath += 1;
		} else {
			if (s.hp < cap)
				s.hp += 1
			else
				unChanged = true;
			t = 4000;
		}
		p.body.panting = s.breath < 0;
		if (p.zombified) {
			_.ztick();
			t = 1000; // meh
			unChanged = false; // meh..
		}
		if (!unChanged) {
			vu.live.meta();
			this.menus.score();
		}
		setTimeout(this.tick, t);
	},
	zombify: function(zval) {
		var person = this.person;
		person.zombified = true;
		person.score.ztick = zval;
		this._.prevCam = zero.core.camera.current; // TODO: improve?
	},
	exert: function(amount) {
		var p = this.person, s = p.score, e = p.energy;
		s.breath -= (amount || 1);
		this.menus.score();
		e.setMult("k", s.breath > 0 ? 1 : 0.5);
//		e.setMult("damp", s.breath > 0 ? 1 : 5);
	},
	damage: function(amount, zombifying) {
		var per = this.person, ps = per.score;
		amount = amount || 1;
		ps.hp -= amount;
		ps.hp < 0 && this.die();
		zombifying && CT.data.random() && this.zombify(amount * 2);
		vu.color.splash(per.zombified ? "green" : "red");
		per.sfx("thud");
		vu.live.meta();
		this.menus.score();
	},
	die: function() {
		this.log("YOU DIE!");
		this.person.dance("fall");
		CT.modal.modal("You died! Better luck next time...",
			() => location.reload(), { noClose: true }, true);
	},
	score: function(prop, val, absolute, upmen) {
		var ps = this.person.score, cap;
		if (absolute)
			ps[prop] = val;
		else {
			ps[prop] += val;
			if (prop == "hp" || prop == "breath") {
				cap = this._.cap();
				if (ps[prop] > cap)
					this.score("xp", ps[prop] - cap);
			}
		}
		upmen && this.menus.score();
	},
	position: function(pos, glopo) {
		return this.person.body.position(pos, glopo);
	},
	levelup: function() {
		var ps = this.person.score;
		ps.hp = ps.breath = ps.level * this.opts.mult;
		vu.game.util.text("you got to level " + ps.level + "!");
		zero.core.current.sploder.confettize(this.position(), true);
	},
	init: function(opts) { // required: person, menus
		this.opts = opts = CT.merge(opts, {
			level: 1,
			mult: 20
		});
		this.person = opts.person;
		this.menus = opts.menus;
		zero.core.current.player = this;

		// TODO: load from game state?
		var juice = opts.level * opts.mult;
		this.person.score = {
			xp: 0,
			hp: juice,
			breath: juice,
			level: opts.level
		};
//		person.score = person.score || vu.game.hopper.scfg().initial;

		setTimeout(this.tick);
	}
});