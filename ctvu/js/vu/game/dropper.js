vu.game.dropper = {
	_: {
		drops: {},
		droptex: ["what have we here?", "what's this?", "any takers?", "give it a try!"],
		regClick: function(target, cb) {
			zero.core.click.register(target, () => cb(target));
		},
		idrop: function(item) {
			var zc = zero.core;
			item.drop();
			zc.audio.ux("confetti");
			zc.current.sploder.confettize(item.position());
		},
		dfilt: function(iname) {
			var zc = zero.core, ph = zc.current.person.opts.gear.held;
			if (ph) {
				if (ph.left && zc.Thing.get(ph.left).name == iname)
					return false;
				if (ph.right && zc.Thing.get(ph.right).name == iname)
					return false;
			}
			return !(iname in vu.game.dropper._.drops);
		}
	},
	log: function(msg) {
		CT.log("dropper: " + msg);
	},
	itemize: function(item, dropper, postbuild) {
		var d = vu.game.dropper, _ = d._, scene = zero.core.current.scene;
		d.item(item, i => _.regClick(i, scene.menus.item), postbuild);
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
		}, vu.storage.get(iopts.kind)[iopts.name])); // || {key:token}?
	},
	drop: function(position, kind) { // item{name,kind,description,position[]}
		kind = kind || "held";
		var d = vu.game.dropper, _ = d._, items = vu.storage.get(kind),
			options = Object.keys(items).concat(zero.base.clothes.procedurals(kind)).filter(_.dfilt),
			name = CT.data.choice(options);
		if (!name)
			return d.log("aborting drop - no undropped items");
		d.log("dropping " + name);
		d.itemize({
			name: name,
			kind: kind,
			description: CT.data.choice(_.droptex),
			position: [position.x, position.y, position.z]
		}, true, _.idrop);
	}
};