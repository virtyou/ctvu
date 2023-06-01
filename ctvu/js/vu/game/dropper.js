vu.game.dropper = {
	_: {
		ops: {},
		drops: {},
		droptex: ["what have we here?", "what's this?", "any takers?", "give it a try!"],
		click: function(target, cb) {
			zero.core.click.register(target, () => cb(target));
		},
		drop: function(item) {
			var zc = zero.core;
			item.drop();
			zc.audio.ux("confetti");
			zc.current.sploder.confettize(item.position());
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
		names: function(kind) {
			var _ = vu.game.dropper._;
			return Object.keys(_.options(kind)).filter(_.filt);
		}
	},
	log: function(msg) {
		CT.log("dropper: " + msg);
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
	drop: function(position, kind) {
		kind = kind || "held";
		var d = vu.game.dropper, _ = d._, name = CT.data.choice(_.names(kind));
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