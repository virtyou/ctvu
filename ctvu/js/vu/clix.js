vu.clix = {
	_: {
		roomclix: [],
		unclixroom: function() {
			var _ = vu.clix._;
			_.roomclix.forEach(zero.core.click.unregister);
			_.roomclix.length = 0;
		},
		ctlbtn: function() {
			var cnode = CT.dom.div(CT.info.mobile ? [
				"tap people/things to interact",
				"tap bottom to move legs",
				"tap top to move arms",
				"drag bottom to move body",
				"drag top to move cam",
				"pinch to zoom",
				"swipe up to jump",
				"swipe down to crawl",
				"swipe left/right to cycle items"
			] : [
				"move around with WASDZC",
				"move cam w/ ARROWS or QERFPB",
				"zoom w/ PERIOD/T & COMMA/G",
				"SPACE = jump, SHIFT = run",
				"ENTER or X to enter portal",
				"SEMICOLON/QUOTE move legs",
				"[] move arms, -=_+ swap items",
				"1-9 for gestures",
				"1-9 + SHIFT for dances",
				"0 to ungesture",
				"0 + SHIFT to undance"
			], "hidden"), cbutt = CT.dom.button("show controls", function(e) {
				cbutt._showing = !cbutt._showing;
				if (cbutt._showing) {
					CT.dom.show(cnode);
					CT.dom.setContent(cbutt, "hide controls");
				} else {
					CT.dom.hide(cnode);
					CT.dom.setContent(cbutt, "show controls");
				}
				e.stopPropagation();
			});
			return [cbutt, cnode];
		}
	},
	yinfo: function() {
		var vc = vu.clix, oz = vc.opts;
		return [
			CT.dom.div("(you)", "up20 right"),
			vc._.ctlbtn(),
			oz.streamer && oz.streamer()
		];
	},
	action: function() {
		// TODO: other actions.....
		if (vu.game) {
			var item = vu.game.dropper.check();
			if (item)
				return vu.game.dropper.get(item);
		}
		var zcc = zero.core.current, per = zcc.person, bod = per.body,
			pan = bod.upon && bod.upon.controls || zcc.room.getPanel();
		if (pan)
			return per.touch(pan, pan.toggle, null, null, null, null, true);
		var comp = zcc.room.getComputer();
		if (comp)
			return per.touch(comp, comp.use);
		var gate = zcc.room.getGate();
		if (gate)
			return per.touch(gate, gate.open);
		var tog = zcc.room.getTogglable();
		pan = tog && tog.controls;
		if (pan)
			return per.touch(pan, pan.toggle, null, null, null, null, true);
		vu.portal.check();
	},
	room: function() {
		var vc = vu.clix, room = zero.core.current.room;
		vc._.unclixroom();
		room.automatons.forEach(a => a.onperson(vc.auto));
		room.perMenagerie(men => men.perMount(vc.register));
		room.objects.forEach(o => o.onReady(() => vc.register(o)));
		room.perControllable(tog => tog.onReady(() => vc.register(tog)));
		room.perOpenable(tog => tog.onReady(() => vc.register(tog)));
		room.perUsable(tog => tog.onReady(() => vc.register(tog)));
		room.perPanel(tog => tog.onReady(() => vc.register(tog)));
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
	ridebutt: function(thing) {
		var p = zero.core.current.person, b = p.body;
		var update = function() {
			CT.dom.setContent(butt, b.riding ? "unride" : "ride");
		}, toggle = function() {
			if (b.riding) {
				p.unride();
				update();
			} else
				p.ride(thing, update);
		}, butt = CT.dom.button("ride", toggle);
		return butt;
	},
	eport: function(thing) {
		return () => zero.core.current.person.approach(thing, vu.clix.action);
	},
	epobutt: function(thing) {
		return CT.dom.button("enter", vu.clix.eport(thing));
	},
	touchbutt: function(thing, kind, globo, name) {
		return CT.dom.button(name || kind, () => zero.core.current.person.touch(thing,
			thing[kind], null, null, null, null, globo));
	},
	register: function(thing) {
		var zc = zero.core, vc = vu.clix, _ = vc._, other = [
			"SHIFT + click to approach"
		], zcc = zc.current, cam = zc.camera,
			target = thing.body || thing, oz = vc.opts,
			isYou = vu.core.ischar(thing.opts.livekey || thing.opts.key);
		if (thing.body) {
			if (thing.automaton)
				other.push(vu.live.autochatter(thing));
			else if (vu.core.ownz()) {
				other.push(CT.dom.button("dunk", function() {
					confirm("dunk this person?") && vu.live.emit("dunk", thing.opts.livekey);
				}));
			}
		} else if (thing.opts.kind == "book")
			other.push(thing.readbutt());
		else if (thing.opts.kind == "carpentry") {
			thing.opts.items.length && other.push(thing.perusebutt());
			thing.openable() && other.push(thing.openbutt());
			other.push(CT.dom.button("sit", () => zcc.person.sit(thing)));
		} else if (thing.opts.kind == "portal")
			other.push(vc.epobutt(thing));
		else if (thing.opts.name == "bed") { // meh
			other.push(CT.dom.button("sit", () => zcc.person.sit(thing)));
			other.push(CT.dom.button("lie", () => zcc.person.lie(thing)));
		} else if (thing.opts.kind == "horse")
			other.push(vc.ridebutt(thing));
		else {
			var messer, messers = ["open", "use"], ispan = thing.opts.kind == "panel";
			for (messer of messers)
				if (thing[messer])
					other.push(vc.touchbutt(thing, messer));
			if (thing.controls || ispan)
				other.push(vc.touchbutt(thing.controls || thing,
					"toggle", !ispan, "operate"));
		}
		zc.click.register(target, function() {
			vc.info(thing.name, isYou ? vc.yinfo() : other);
			cam.follow(target.looker || target);
			cam.toggleCaret(!isYou);
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