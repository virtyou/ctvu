vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	_: {
		regClick: function(target, cb) {
			zero.core.click.register(target.body || target, function() {
				cb(target);
			});
		},
		item: function(iopts, onbuild) {
			return zero.core.current.room.attach(CT.merge(iopts, {
				onbuild: function(item) {
					item.setBounds();
					onbuild(item);
				}
			}, vu.storage.get("held")[iopts.name]));
		},
		action: function() { // TODO: other actions...
			vu.portal.check();
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
		var _ = this._, zcc = zero.core.current,
			rc = _.regClick, pers, prop, item, portal,
			men = this.menus, tsa = this.state.actors,
			state = this.state.scenes[this.name],
			slz = state.lights, items = state.items,
			portals = state.portals, adv = this.adventure;
		zcc.person = zcc.people[this.player.name];
		adv.controls.setCb(_.action);
		adv.controls.setTarget(zcc.person, true);
		vu.portal.on("filter", function(obj) {
			return obj.name in portals;
		});
		vu.portal.on("inject", function(troom, pkey) {
			zcc.injector = pkey;
			adv.scene(portals[vu.portal.ejector.name].target);
		});
		zcc.room.setBounds();
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
			_.item(items[item], i => rc(i, men.item));
		this.comp();
		this.script(this.state.script);
	},
	comp: function() {
		var zcc = zero.core.current, pers,
			cz = zcc.room.components();
		for (pers in zcc.people)
			cz = cz.concat(zcc.people[pers].components());
		CT.cc.views(cz);
		// TODO: music etc as it happens
	},
	unload: function() {
		// people removed by vu.portal.portin()
		// everything else is on the room right...?
		var zcc = zero.core.current;
		zcc.room.remove();
		delete zcc.room;
	},
	load: function() {
		var oz = this.opts, cfg = core.config.ctzero, p,
			zc = zero.core, zcc = zc.current, start = this.start;
		this.player.gear = this.state.inventory.gear;
		for (p of oz.actors) {
			p.grippy = false;
			p.positioners = this.state.actors[p.name].positioners;
		}
		cfg.room = oz.room;
		cfg.people = oz.actors.slice();

		if (zcc.scene) {
			zc.util.refresh(function(lastp, room) {
				zcc.people[zcc.person.name] = zcc.person;
				vu.portal.arrive(zcc.injector &&
					zero.core.Thing.get(zcc.injector));
				start();
			});
		} else {
			cfg.people.push(this.player);
			zc.util.init(null, start);
		}
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