vu.menu.Hair = CT.Class({
	CLASSNAME: "vu.menu.Hair",
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
			min: 1,
			max: 8,
			step: 1,
			initial: 6
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
			min: 1,
			max: 8,
			initial: 6
		}],
		bones: {
			tail: 0,
			hair: 4,
			beard: 4
		},
		wild: function(opts, name) {
			var _ = this._, eoz = {
				opts: CT.merge(opts, {
					thing: this.opts.thing,
					name: name || this.opts.name,
					kind: this.opts.kind,
					bone: _.bones[this.opts.kind]
				})
			};
			if (this.target) {
				eoz.base = null;
				eoz.key = this.target.opts.key;
			} else {
				eoz.modelName = "part";
				eoz.parent = _.parent().opts.key;
			}
			vu.storage.edit(eoz, this.attach);
		},
		parent: function() {
			return this.person[(this.opts.kind == "tail") ? "body" : "head"];
		},
		compile: function(opts) {
			var coverage = [opts.coverage_x, opts.coverage_z],
				p, density = opts.density;
			opts.taper = [opts.taper_x, opts.taper_y, opts.taper_z];
			for (p of ["x", "y", "z"])
				delete opts["taper_" + p];
			for (p of ["coverage_x", "coverage_z", "density"])
				delete opts[p];
			this._.wild({
				strand: opts,
				density: density,
				coverage: coverage
			});
		},
		bald: function(isbald) {
			var _ = this._, oz = this.opts;
			_.bspot = _.bspot || CT.dom.button("add " + oz.kind,
				this.click, "abs mr5 mosthigh " + oz.buttpos);
			CT.dom.addContent("vnode", _.bspot);
			CT.dom[isbald ? "show" : "hide"](_.bspot);
		}
	},
	custom: function() {
		CT.modal.prompt({
			prompt: "tweak away!",
			style: "form",
			numbers: this._.tweakables,
			cb: vz => this._.compile(vz)
		});
	},
	attach: function(hnew) {
		var thaz = this, parent = this._.parent();
		this.target && parent.detach(this.opts.kind);
		parent.attach(hnew, function() {
			thaz.register();
			thaz.click();
		}, true);
	},
	bald: function() {
		this._.wild({ density: 0 }, "bald");
	},
	wild: function() {
		var zbbh = zero.base.body[this.opts.kind], thaz = this;
		CT.modal.choice({
			data: Object.keys(zbbh).concat("custom"),
			cb: function(hvar) {
				if (hvar == "custom")
					return thaz.custom();
				thaz._.wild(zbbh[hvar], hvar);
			}
		});
	},
	choice: function() {
		var thaz = this;
		CT.modal.choice({
			prompt: this.opts.prompt,
			data: this.opts.varieties,
			cb: function(hvar) {
				if (thaz[hvar])
					return thaz[hvar]();
				vu.media.prompt.thing(thaz.attach,
					thaz.opts.kind, thaz.target);
			}
		});
	},
	click: function() {
		this.target ? this.cb(this.target, this.choice) : this.choice();
	},
	register: function() {
		var _ = this._, parent = _.parent(), hitz = parent[this.opts.kind],
			t = this.target = hitz && Object.values(hitz)[0],
			bald = !t || t.name == "bald";
		_.bald(bald);
		bald || zero.core.click.register(t, this.click);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			kind: "hair",
			thing: "Hair",
			buttpos: "ctr",
			name: "wildhair",
			varieties: ["model", "wild", "bald"],
			prompt: "do you want to use a hair model or the experimental wild hair? or no hair at all?"
		});
		this.cb = opts.cb;
		this.person = opts.person;
		this.register();
	}
});