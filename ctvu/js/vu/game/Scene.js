vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	_: {
		regClick: function(target, cb) {
			zero.core.click.register(target.body || target, function() {
				cb(target);
			});
		},
		menu: function(name, info) {
			var _ = this._, zc = zero.core;
			if (_.infomenu)
				_.infomenu.set([name, info]);
			else {
				_.infomenu = vu.core.menu(name, "bottom", info, null, function() {
					_.infomenu.hide();
					zc.camera.follow(zc.current.person.body);
				});
			}
			return _.infomenu;
		},
		upper: function(variety, name) {
			this.log("upper():", variety, name);
			if (name in this.opts.scripts)
				this.script(name);
		},
		convo: function(person) {
			var n = CT.dom.div();
			vu.controls.setTriggers(n, this._.upper, person);
			return n;
		},
		item: function(iopts, onbuild) {
			return new zero.core.Thing(CT.merge(iopts, {
				onbuild: onbuild
			}, vu.storage.get("held")[iopts.name]));
		}
	},
	menus: {
		info: function(name, info, thing) {
			this._.menu(name, info).show();
			zero.core.camera.follow(thing);
		},
		item: function(item) {
			this.menus.info(item.name, item.opts.description, item);
		},
		prop: function(prop) {
			this.menus.info(prop.name,
				this.opts.props[prop.name].description, prop);
		},
		person: function(person) {
			var zcc = zero.core.current,
				aopts = this.state.actors[person.name];
			this.menus.info(person.name, person == zcc.person
				? "it's you!" : [
					aopts.description, this._.convo(person)
				], person.body);
		}
	},
	refresh: function(altered) {
		this.log("refresh", altered.story, altered.state);
		if (altered.story || altered.state) {
			if (altered.story) {
				// update story node
			}
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
		this.player = a.player;
		opts.actors.forEach(function(p) {
			osa[p.name] = osa[p.name] || {};
		});
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(close this window to start!)"
		], "centered kidvp"), this.load);
		this.audio = new vu.audio.Controller({
			fx: opts.fx,
			music: opts.music,
			ambient: opts.ambient
		});
	}
});