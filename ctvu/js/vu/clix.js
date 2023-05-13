vu.clix = {
	action: function() {
		// TODO: other actions.....
		vu.portal.check();
	},
	room: function() {
		var vc = vu.clix, room = zero.core.current.room;
		room.objects.forEach(vc.register);
		room.automatons.forEach(a => a.onperson(vc.auto));
	},
	auto: function(p) {
		vu.help.triggerize(p.brain, vu.clix.opts.auto, vu.squad.emit);
		vu.clix.register(p);
	},
	register: function(thing) {
		var zc = zero.core, other = [
			"SHIFT + click to approach"
		], zcc = zc.current, cam = zc.camera,
			target = thing.body || thing,
			oz = vu.clix.opts, inode = oz.inode,
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
		else if (thing.opts.kind == "carpentry" && thing.opts.items.length)
			other.push(thing.perusebutt());
		else if (thing.opts.kind == "portal")
			other.push(CT.dom.button("enter", () => zcc.person.approach(thing, vu.clix.action)));
		zc.click.register(target, function() {
			CT.dom.setContent(inode, [
				vu.controls.help("info"),
				CT.dom.div(thing.name, "bigger"),
				isYou ? [
					CT.dom.div("(you)", "up20 right"),
					"move around with WASD",
					"rotate with Q and E",
					"adjust the camera with ARROWS",
					"zoom with PERIOD and COMMA",
					"SPACE for jump",
					"SHIFT for run",
					"ENTER to enter portal",
					"1-9 for gestures",
					"1-9 + SHIFT for dances",
					"0 to ungesture",
					"0 + SHIFT to undance",
					oz.streamer && oz.streamer()
				] : other
			]);
			zc.audio.ux("blipon");
			CT.trans.glow(inode);
			cam.follow(target.looker || target);
			if (!isYou) {
				target.playPause(oz.audup);
				CT.key.down("SHIFT") && zcc.person.approach(target);
			}
		});
	},
	init: function(opts) { // {inode,streamer,audup,auto}
		this.opts = opts;
	}
};