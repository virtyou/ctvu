vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	_: {
		regClick: function(target, cb) {
			zero.core.click.register(target.body || target, () => cb(target));
		},
		satisfies: function(condsec) {
			var zcc = zero.core.current, a = zcc.adventure,
				astate = a.state.actors, target = a.game[condsec],
				aname, actor, prop;
			if (!Object.keys(target).length) return false;
			for (aname in target.actors) {
				actor = target.actors[aname];
				for (prop in actor)
					if (actor[prop] != astate[aname][prop])
						return false;
			}
			return true;
		}
	},
	personalize: function(person) {
		vu.clix.register(person);
		vu.core.comp(person);
	},
	envMod: function(emod, oname) {
		var iname;
		if (emod == "receive") {
			iname = oname.item;
			oname = oname.actor;
		}
		this.log("envMod", emod, oname, iname);
		var tz = this.opts.triggers, t = tz[emod] && tz[emod][oname];
		if (iname)
			t = t[iname];
		t && this.script(t);
	},
	refresh: function(altered) {
		this.log("refresh", altered.story, altered.state);
		if (altered.story || altered.state) {
			altered.story && this.menus.story();
			this.adventure.upstate();
			if (altered.state) {
				for (var cond of ["victory", "defeat"])
					if (this._.satisfies(cond))
						return vu.game.util.text(cond);
			}
		}
	},
	script: function(sname) {
		var oz = this.opts;
		if (!(sname in oz.scripts))
			return this.log("script() - no match:", sname);
		vu.game.util.script(oz.scripts[sname],
			this.refresh, this.state, this.audio);
		if (sname != this.state.script) {
			this.state.script = sname;
			this.adventure.upstate();
		}
	},
	start: function() {
		var zc = zero.core, zcc = zc.current,
			state = this.state.scenes[this.name], slz = state.lights;
		vu.game.dropper.clear();
		zcc.room.setBounds();
		CT.pubsub.subscribe(zcc.room.opts.key);
		if (zcc.person) {
			zcc.people[zcc.person.name] = zcc.person;
			vu.live.emit("inject", zcc.injector);
		}
		slz && zcc.room.lights.forEach((l, i) => l.setIntensity(slz[i]));
		this.comp();
		zcc.unlocker = this.unlock;
		zcc.receiver = this.receive;
		zc.util.onCurPer(this.playerReady);
	},
	clix: function() {
		var zc = zero.core, zcc = zc.current, rc = this._.regClick,
			men = this.menus, tsa = this.state.actors,
			pers, book, carp, prop, item, portal,
			state = this.state.scenes[this.name], items = state.items,
			portals = state.portals, dropper = vu.game.dropper;
		vu.clix.room();
		for (pers in zcc.people) {
			rc(zcc.people[pers], men.person);
			if (tsa[pers] && tsa[pers].vibe)
				zcc.people[pers].vibe.update(tsa[pers].vibe);
		}
		for (prop in this.opts.props)
			rc(zcc.room[prop], men.prop);
		for (portal in portals)
			rc(zcc.room[portal], men.portal);
		for (item in items)
			dropper.itemize(items[item]);
		for (item in zcc.room.book) {
			book = zcc.room[item];
			rc(book, men.book);
		}
		for (item in zcc.room.carpentry) {
			carp = zcc.room[item];
			if (carp.opts.variety == "chest")
				rc(carp, men.chest);
			else if (carp.opts.items.length)
				rc(carp, men.shelf);
		}
	},
	playerReady: function() {
		this.clix();
		vu.game.util.prestart(this.run);
	},
	run: function() {
		zero.core.camera.angle("preferred");
		this.script(this.state.script);
		this.menus.minimap();
		this.showCredits();
	},
	receive: function(item, targets) {
		var person = zero.core.current.room.getPerson(item, targets || this.state.actors);
		if (!person) return;
		var rtz = this.opts.triggers.receive, recip = rtz && rtz[person.name];
		if (person.isYou() || (recip && recip[item.name])) {
			if (person.freeHand()) {
				person.sayone([
					"thanks!", "why thank you", "oh, you shouldn't have!",
					"oh, for me?", "you're too kind!", "you shouldn't have"
				]);
				setTimeout(vu.game.dropper.upstate, 100, "held");
				return person;
			}
			return person.sayone(["i can't hold that", "i don't have any free hands"]);
		}
		person.sayone([
			"no thank you", "i don't want that", "nah", "i'm good",
			"i don't need that", "what's that?", "no thanks"
		]);
	},
	unlock: function(key) {
		var zcc = zero.core.current, per = zcc.person, doit = function(locker) {
			per.sayone(["all right, we're in!", "lock unlocked!", "the key fits!"]);
			setTimeout(vu.game.dropper.upstate, 100, "held");
			delete locker.locked;
			return tar;
		}, state = this.state.scenes[this.name], ports = state.portals, port, chest,
			tar = zcc.room.getSolid(key.position(null, true), key.radii, true, true);
		if (!tar)
			return per.sayone(["there's nothing here", "nothing to unlock", "unlock what?"]);
		if (tar.opts.kind == "portal") {
			port = ports[tar.name];
			if (port && port.locked)
				return doit(port);
		} else if (tar.opts.variety == "chest") {
			chest = this.props[tar.name];
			if (chest && chest.locked)
				return doit(chest);
		}
		per.sayone([
			"unlock what?", "what's locked?", "nothing to unlock",
			"that's not a lock", "i don't see a lock",
			"that's not locked", "that isn't locked"
		]);
	},
	comp: function() {
		var zcc = zero.core.current, oz = this.opts,
			g = zcc.adventure.game, rt = zcc.room.opts.texture;
		vu.core.comp(null, [{
			identifier: "Game: " + g.name,
			owners: g.owners
		}, {
			identifier: "Scene: " + oz.name,
			owners: oz.owners
		}]);
		rt.startsWith("http") && this.menus.attribution("seeing", "wallpaper",
			null, rt.split("/")[2].split(".").slice(-2).join("."));
	},
	showCredits: function() {
		var creds = this.credits, names = Object.keys(creds), c;
		names.length && this.menus.attribution("seeing", "models", names.map(function(name) {
			c = creds[name];
			return CT.dom.div([
				CT.dom.span(name, "big bold"),
				CT.dom.pad(),
				CT.dom.span("(x" + c.count + ") -"),
				CT.dom.pad(),
				CT.dom.link(c.url.split("//")[1].split("/")[0],
					null, c.url, null, null, null, true)
			]);
		}));
	},
	credit: function(name, url) {
		name = CT.parse.stripNums(name);
		if (!this.credits[name]) {
			this.credits[name] = {
				count: 0,
				url: url
			}
		}
		this.credits[name].count += 1;
	},
	load: function() {
		var oz = this.opts, cfg = core.config.ctzero, start = this.start,
			zc = zero.core, zcc = zc.current, zcu = zc.util, p;
		zcc.inventory = this.state.inventory;
		for (p of oz.actors) {
//			p.grippy = false;
			p.positioners = vu.game.util.positioners(p.name, this.name, true);
//			p.positioners = this.state.actors[p.name].positioners;
		}
		cfg.room = oz.room;
		cfg.people = oz.actors.slice();

		zcc.creditor = this.credit;
		zcc.scene ? zcu.refresh(start) : zcu.init(null, start);
		zcc.scene = this;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			name: "scene title",
			description: "scene description",
			room: null,
			props: {}, // TODO
			actors: [],
			scripts: {},
			triggers: {},
			fx: [],
			music: [],
			ambient: []
		});
		var a = this.adventure = opts.adventure,
			s = this.state = a.state, osa = s.actors;
		if (!s.scenes)
			s.scenes = {};
		if (!s.scenes[opts.name]) // scene w/ no initial state
			s.scenes[opts.name] = {};
		if (!s.scenes[opts.name].items)
			s.scenes[opts.name].items = {};
		this.name = opts.name;
		this.menus = a.menus;
		this.credits = {};
		opts.actors.forEach(function(p) {
			osa[p.name] = osa[p.name] || {};
		});
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(click this window or press TAB or ESCAPE to start!)"
		], "centered kidvp"), this.load, {
			noClose: true,
			transition: "fade"
		}, true);
		this.audio = new vu.audio.Controller({
			fx: opts.fx,
			music: opts.music,
			ambient: opts.ambient
		});
	}
});