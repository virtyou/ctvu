vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	_: {
		regClick: function(target, cb) {
			zero.core.click.register(target.body || target, function() {
				cb(target);
			});
		},
		item: function(iopts, onbuild) {
			return new zero.core.Thing(CT.merge(iopts, {
				onbuild: onbuild
			}, vu.storage.get("held")[iopts.name]));
		}
	},
	refresh: function(altered) {
		this.log("refresh", altered.story, altered.state);
		if (altered.story || altered.state) {
			if (altered.story)
				this.menus.story();
			if (altered.state) {
				// ...
			}
			this.adventure.upstate();
		}
		// TODO:
		// - check victory/defeat conditions
		// - if multi, ws push
	},
	script: function(sname) {
		var oz = this.opts;
		vu.game.util.script(oz.scripts[sname],
			this.refresh, this.state, this.audio);
		if (sname != this.state.script) {
			this.state.script = sname;
			this.adventure.upstate();
		}
	},
	start: function() {
		var zcc = zero.core.current, pers, prop, item,
			men = this.menus, _ = this._, rc = _.regClick,
			state = this.state.scenes[this.opts.name],
			slz = state.lights, items = state.items;
		zcc.person = zcc.people[this.player.name];
		this.adventure.controls.setTarget(zcc.person);
		zcc.room.setBounds();
		slz && zcc.room.lights.forEach(function(l, i) {
			l.setIntensity(slz[i]);
		});
		for (pers in zcc.people)
			rc(zcc.people[pers], men.person);
		for (prop in this.opts.props)
			rc(zcc.room[prop], men.prop);
		for (item in items)
			_.item(items[item], i => rc(i, men.item));
		this.script(this.state.script);
	},
	unload: function() {
		// get rid of room / people!
	},
	load: function() {
		var oz = this.opts, cfg = core.config.ctzero, p;
		this.player.gear = this.state.inventory.gear;
		for (p of oz.actors) {
			p.grippy = false;
			p.positioners = this.state.actors[p.name].positioners;
		}
		cfg.room = oz.room;
		cfg.people = oz.actors.concat([this.player]);
		zero.core.util.init(null, this.start);
		zero.core.current.scene = this;
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