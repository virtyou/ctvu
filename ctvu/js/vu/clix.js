vu.clix = {
	_: {
		roomclix: [],
		unclixroom: function() {
			var _ = vu.clix._;
			_.roomclix.forEach(zero.core.click.unregister);
			_.roomclix.length = 0;
		},
		yinfo: function() {
			var oz = vu.clix.opts;
			return [
				CT.dom.div("(you)", "up20 right"),
				"move around with WASDZC",
				"move cam w/ ARROWS or QERF",
				"zoom w/ PERIOD/T & COMMA/G",
				"SPACE = jump, SHIFT = run",
				"ENTER or X to enter portal",
				"BRACKETS move arms",
				"SEMICOLON/QUOTE move legs",
				"1-9 for gestures",
				"1-9 + SHIFT for dances",
				"0 to ungesture",
				"0 + SHIFT to undance",
				oz.streamer && oz.streamer()
			];
		}
	},
	action: function() {
		// TODO: other actions.....
		if (vu.game) {
			var item = vu.game.dropper.check();
			if (item)
				return vu.game.dropper.get(item);
		}
		vu.portal.check();
	},
	room: function() {
		var vc = vu.clix, room = zero.core.current.room;
		vc._.unclixroom();
		room.objects.forEach(vc.register);
		room.automatons.forEach(a => a.onperson(vc.auto));
	},
	auto: function(p) {
		vu.help.triggerize(p.brain, vu.clix.opts.auto, vu.squad.emit);
		vu.clix.register(p);
	},
	info: function(name, description) {
		var inode = this.opts.info, zcc = zero.core.current;
		if (!inode) {
			CT.log("vu.clix.info(): opts.info node not found - using Game Menu");
			zcc.adventure.menus.basic(name, description, true);
		} else {
			CT.dom.setContent(inode, [
				vu.controls.help("info"),
				CT.dom.div(name, "bigger"),
				description
			]);
			CT.trans.glow(inode);
		}
		zero.core.audio.ux("blipon");
	},
	register: function(thing) {
		var zc = zero.core, vc = vu.clix, _ = vc._, other = [
			"SHIFT + click to approach"
		], zcc = zc.current, cam = zc.camera,
			target = thing.body || thing, oz = vc.opts,
			isYou = vu.core.ischar(thing.opts.key);
		if (thing.body) {
			if (thing.automaton)
				other.push(vu.live.autochatter(thing));
			else if (vu.core.ownz()) {
				other.push(CT.dom.button("dunk", function() {
					confirm("dunk this person?") && vu.live.emit("dunk", thing.opts.key);
				}));
			}
		} else if (thing.opts.kind == "book")
			other.push(thing.readbutt());
		else if (thing.opts.kind == "carpentry") {
			thing.opts.items.length && other.push(thing.perusebutt());
			thing.openable() && other.push(thing.openbutt());
		} else if (thing.opts.kind == "portal")
			other.push(CT.dom.button("enter", () => zcc.person.approach(thing, vc.action)));
		zc.click.register(target, function() {
			vc.info(thing.name, isYou ? _.yinfo() : other);
			cam.follow(target.looker || target);
			if (!isYou) {
				target.playPause(oz.audup);
				CT.key.down("SHIFT") && zcc.person.approach(target);
			}
		});
		isYou || _.roomclix.push(thing);
	},
	init: function(opts) { // {info,streamer,audup,auto}
		vu.clix.opts = opts;
	}
};