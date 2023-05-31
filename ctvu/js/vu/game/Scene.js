vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	_: {
		regClick: function(target, cb) {
			zero.core.click.register(target.body || target, function() {
				cb(target);
			});
		},
		item: function(iopts, onbuild, postbuild) {
			return zero.core.current.room.attach(CT.merge(iopts, {
				onbuild: function(item) {
					item.setBounds();
					onbuild(item);
					postbuild && postbuild(item);
				}
			}, vu.storage.get(iopts.kind)[iopts.name]));
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
		},
		drops: {},
		droptex: ["what have we here?", "what's this?", "any takers?", "give it a try!"]
	},
	personalize: function(person) {
		vu.clix.register(person);
		vu.core.comp(person);
	},
	itemize: function(item, dropper, postbuild) {
		var _ = this._;
		_.item(item, i => _.regClick(i, this.menus.item), postbuild);
		if (dropper) {
			this.state.scenes[this.name].items[item.name] = item;
			_.drops[item.name] = item;
		}
	},
	drop: function(position, kind) { // item{name,kind,description,position[]}
		kind = kind || "held";
		var _ = this._, items = vu.storage.get(kind),
			options = Object.keys(items).filter(i => !(i in _.drops)),
			name = CT.data.choice(options);
		if (!name) // also check for non-dropped items?
			return this.log("aborting drop - no undropped items");
		if (!Array.isArray(position))
			position = [position.x, position.y, position.z];
		this.log("dropping", name, "at", position);
		this.itemize({
			name: name,
			kind: kind,
			position: position,
			description: CT.data.choice(_.droptex)
		}, true, i => i.drop());
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
		var _ = this._, zc = zero.core, zcc = zc.current, book, carp,
			rc = _.regClick, pers, prop, item, portal,
			men = this.menus, tsa = this.state.actors,
			state = this.state.scenes[this.name],
			slz = state.lights, items = state.items,
			portals = state.portals, adv = this.adventure;
		vu.clix.room();
		zcc.room.setBounds();
		CT.pubsub.subscribe(zcc.room.opts.key);
		if (zcc.person) {
			zcc.people[zcc.person.name] = zcc.person;
			vu.live.emit("inject", zcc.injector);
		}
		slz && zcc.room.lights.forEach(function(l, i) {
			l.setIntensity(slz[i]);
		});
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
			this.itemize(items[item]);
		for (item in zcc.room.book) {
			book = zcc.room[item];
			rc(book, men.book);
		}
		for (item in zcc.room.carpentry) {
			carp = zcc.room[item];
			carp.opts.items.length && rc(carp, men.shelf);
		}
		this.comp();
		this.script(this.state.script);
		zc.util.onCurPer(this.menus.minimap);
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
	load: function() {
		var oz = this.opts, cfg = core.config.ctzero, start = this.start,
			zc = zero.core, zcc = zc.current, zcu = zc.util, p;
		zcc.inventory = this.state.inventory;
//		this.player.gear = this.state.inventory.gear;
		for (p of oz.actors) {
//			p.grippy = false;
			p.positioners = this.state.actors[p.name].positioners;
		}
		cfg.room = oz.room;
		cfg.people = oz.actors.slice();

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
		this.player = a.player;
		opts.actors.forEach(function(p) {
			osa[p.name] = osa[p.name] || {};
		});
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(click this window to start!)"
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