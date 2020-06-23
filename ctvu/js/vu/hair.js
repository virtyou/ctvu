vu.hair = {
	_: {
		tweakables: [{
			name: "flex",
			min: 0,
			max: 2,
			step: 0.1,
			initial: 2
		}, {
			name: "kink",
			min: 0,
			max: 2,
			step: 0.1,
			initial: 0
		}, {
			name: "girth", // use defaults
			initial: 3
		}, {
			name: "length",
			min: 2,
			max: 10,
			step: 0.5,
			initial: 6
		}, {
			name: "segments",
			min: 3,
			max: 10,
			step: 1,
			initial: 8
		}, {
			name: "taper_x",
			min: 0.5,
			max: 1.5,
			step: 0.1,
			initial: 0.8
		}, {
			name: "taper_y",
			min: 0.5,
			max: 1.5,
			step: 0.1,
			initial: 0.8
		}, {
			name: "taper_z",
			min: 0.5,
			max: 1.5,
			step: 0.1,
			initial: 0.8
		}, {
			name: "coverage_x",
			min: 0.1,
			max: 1,
			step: 0.1,
			initial: 1
		}, {
			name: "coverage_z",
			min: 0.1,
			max: 1,
			step: 0.1,
			initial: 1
		}, {
			name: "density",
			min: 2,
			max: 9,
			initial: 7
		}],
		wild: function(opts, name) {
			var oz = CT.merge(opts, {
				thing: "Hair",
				name: name || "wild",
				kind: "hair",
				bone: 4
			});
			vu.storage.edit({
				key: vu.hair.target.opts.key,
				base: null,
				opts: oz
			});
			return oz;
		},
		compile: function(opts) {
			var coverage = [opts.coverage_x, opts.coverage_z],
				p, density = opts.density;
			opts.taper = [opts.taper_x, opts.taper_y, opts.taper_z];
			for (p of ["x", "y", "z"])
				delete opts["taper_" + p];
			for (p of ["coverage_x", "coverage_z", "density"])
				delete opts[p];
			return vu.hair._.wild({
				strand: opts,
				density: density,
				coverage: coverage
			});
		}
	},
	custom: function() {
		CT.modal.prompt({
			prompt: "tweak away!",
			style: "form",
			numbers: vu.hair._.tweakables,
			cb: vz => vu.hair.attach(vu.hair._.compile(vz))
		});
	},
	attach: function(hnew) {
		var head = vu.hair.person.head;
		head.detach("hair");
		head.attach(hnew, function() {
			vu.hair.register();
			vu.hair.click();
		}, true);
	},
	wild: function() {
		var zbbh = zero.base.body.hair;
		CT.modal.choice({
			data: Object.keys(zbbh).concat("custom"),
			cb: function(hvar) {
				if (hvar == "custom")
					return vu.hair.custom();
				vu.hair.attach(vu.hair._.wild(zbbh[hvar], hvar));
			}
		});
	},
	choice: function() {
		var h = vu.hair;
		CT.modal.choice({
			prompt: "do you want to use a hair model or the experimental wild hair?",
			data: ["model", "wild"],
			cb: function(hvar) {
				if (hvar == "wild")
					return h.wild();
				vu.media.prompt.thing(h.attach, "hair", h.target);
			}
		});
	},
	click: function() {
		vu.hair.cb(vu.hair.target, vu.hair.choice);
	},
	register: function() {
		var h = vu.hair;
		h.target = Object.values(h.person.head.hair)[0];
		zero.core.click.register(h.target, h.click);
	},
	setup: function(person, cb) {
		vu.hair.cb = cb;
		vu.hair.person = person;
		vu.hair.register();
	}
};