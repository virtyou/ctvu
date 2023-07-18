vu.game.dropper = {
	_: {
		ops: {},
		drops: {},
		defaults: {
			held: {
				variety: "knocker"
			}
		},
		droptex: ["what have we here?", "what's this?", "any takers?", "give it a try!"],
		click: function(target, cb) {
			zero.core.click.register(target, () => cb(target));
		},
		drop: function(item) {
			var zc = zero.core, sp = zc.current.sploder;
			item.drop();
			sp.glow(item);
			zc.audio.ux("confetti");
			sp.confettize(item.position());
		},
		filt: function(iname) {
			var zc = zero.core, ph = zc.current.person.opts.gear.held;
			if (ph) {
				if (ph.left && zc.Thing.get(ph.left).name == iname)
					return false;
				if (ph.right && zc.Thing.get(ph.right).name == iname)
					return false;
			}
			return !(iname in vu.game.dropper._.drops);
		},
		pfilt: function(item, prop, val) {
			return val == (item.variety || vu.game.dropper._.defaults[item.kind][prop]);
		},
		vfilt: function(name, kind, variety) {
			var _ = vu.game.dropper._;
			return _.pfilt(_.ops[kind][name], "variety", variety);
		},
		options: function(kind) {
			kind = kind || "held";
			var d = vu.game.dropper, _ = d._;
			if (!_.ops[kind]) {
				_.ops[kind] = CT.merge(vu.storage.get(kind),
					zero.base.clothes.procedurals(kind, true, true));
			}
			return _.ops[kind];
		},
		item: function(name, kind) { // ad-hoc keys?
			return vu.game.dropper._.options(kind)[name];
		},
		names: function(kind, variety) {
			var _ = vu.game.dropper._, onames = Object.keys(_.options(kind));
			if (variety)
				onames = onames.filter(name => _.vfilt(name, kind, variety));
			return onames.filter(_.filt);
		}
	},
	log: function(msg) {
		CT.log("dropper: " + msg);
	},
	check: function() {
		var zc = zero.core, zcc = zc.current,
			pbod = zcc.person.body, iname, item;
		for (iname in vu.game.dropper._.drops) {
			item = zcc.room[iname];
			if (item && zc.util.touching(pbod, item, 100))
				return item;
		}
	},
	get: function(item) {
		var zc = zero.core, zcc = zc.current, per = zcc.person,
			cam = zc.camera, cangle = cam.current,
			state = zcc.adventure.state, msg = "you get a " + item.name;
		per.get(item, function() {
			cam.angle(cangle);
			vu.game.util.text(msg);
			state.story.push(msg);
			if (item.opts.kind == "held")
				state.inventory.gear.held = per.opts.gear.held;
			else
				state.inventory.gear.worn = per.opts.gear.worn;
			delete state.scenes[zcc.scene.name].items[item.name];
			zcc.adventure.upstate();
		});
	},
	itemize: function(item, dropper, postbuild) {
		var d = vu.game.dropper, _ = d._, scene = zero.core.current.scene;
		d.item(item, i => _.click(i, scene.menus.item), postbuild);
		if (dropper) {
			scene.state.scenes[scene.name].items[item.name] = item;
			_.drops[item.name] = item;
		}
	},
	item: function(iopts, onbuild, postbuild) {
		return zero.core.current.room.attach(CT.merge(iopts, {
			onbuild: function(item) {
				item.setBounds();
				onbuild(item);
				postbuild && postbuild(item);
			}
		}, vu.game.dropper._.item(iopts.name, iopts.kind)));
	},
	drop: function(position, kind, variety) {
		kind = kind || "held";
		var d = vu.game.dropper, _ = d._, name = CT.data.choice(_.names(kind, variety));
		if (!name)
			return d.log("aborting drop - no undropped items");
		d.log("dropping " + name);
		d.itemize({
			name: name,
			kind: kind,
			description: CT.data.choice(_.droptex),
			position: [position.x, position.y, position.z]
		}, true, _.drop);
	}
};