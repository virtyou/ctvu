vu.menu = {};

vu.menu.Body = CT.Class({
	CLASSNAME: "vu.menu.Body",
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		arms: [],
		legs: [],
		menus: {
			camera: "top",
			spine: "topright",
			left_leg: "right",
			right_leg: "left",
			left_arm: "right",
			right_arm: "left",
			left_hand: "bottomright",
			right_hand: "bottomleft"
		},
		joined: function(person) {
			var _ = this._, mprop = this.opts.main;
			zero.core.current.person = person;
			_.initCamera();
			if (!Object.keys(person.opts[mprop]).length)
				this.initMain();
			else
				this.loadMain();
		},
		swapLimbs: function(ons, offs) {
			var _ = this._;
			_[ons].forEach(function(modal) {
				modal.show("ctmain");
			});
			_[offs].forEach(function(modal) {
				modal.hide();
			});
		},
		initCamera: function() {
			var _ = this._, oz = this.opts;
			vu.controls.initCamera(_.selectors.camera, function(cname) {
				if (cname == "near")
					_.swapLimbs("legs", "arms");
				else // far
					_.swapLimbs("arms", "legs");
			});
		},
		setup: function() {
			var _ = this._, selz = _.selectors; oz = this.opts,
			_.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(_.opts);
			selz.spine = CT.dom.div();
			selz.spine_button = CT.dom.div(null, "right");
			selz.camera = CT.dom.div(null, "centered");
			for (var s in oz.subs)
				selz[s] = oz.subs[s];
			["left", "right"].forEach(function(side) {
				selz[oz["top" + side]] = CT.dom.div();
				selz[oz["top" + side] + "_button"] = CT.dom.div(null, "right");
				["leg", "arm", "hand"].forEach(function(sub) {
					selz[side + "_" + sub] = CT.dom.div();
					selz[side + "_" + sub + "_button"] = CT.dom.div(null, "right");
				});
			});
		},
		header: function(section) {
			var _ = this._, selz = _.selectors, content = [
				selz[section + "_button"],
				CT.dom.span(CT.parse.key2title(section))
			], per = _.peritem;
			if (this.opts.impex.includes(section)) {
				content.push(CT.dom.pad());
				content.push(CT.dom.link("import/export", function() {
					vu.core.impex(zero.core.current.person.opts[section], function(val) {
						per(section, val);
					});
				}));
			}
			return content;
		},
		peritem: function(k, v) {
			var pobj = {};
			pobj[k] = v;
			this.persist(pobj);
		}
	},
	initMain: function() {
		var _ = this._, mprop = this.opts.main,
			per = _.peritem, cur = zero.core.current,
			sing = mprop.slice(0, -1), lm = this.loadMain;
		CT.modal.prompt({
			prompt: "what's the new " + sing + "?",
			cb: function(val) {
				val = vu.core.jlo(val);
				cur.person.opts[mprop][val] = {};
				per(mprop, cur.person.opts[mprop]);
				lm();
			}
		});
	},
	loadExtras: function() {

	},
	loadMain: function() {
		this.selector(this.opts.main);
		this.loadExtras();
	},
	constraints: function(side, sub, part, axis) {
		return {
			min: 0.1,
			max: 2.0
		};
	},
	jointRange: function(sname, sitem, val, side, sub, part, axis, modpart) {
		var constraints = this.constraints(side, sub, part, axis),
			person = zero.core.current.person,
			gopts = person.opts[sname],
			per = this._.peritem;
		return CT.dom.div([
			axis ? CT.parse.toCaps([part, axis]).join(" ") : CT.parse.capitalize(part),
			CT.dom.range(function(val) {
				CT.log([side, sub, part, axis, ":", val].join(" "));
				modpart[part][axis] = val / 100;
				person[sname.slice(0, -1)](sitem);
				per(sname, gopts);
			}, constraints.min * 100, constraints.max * 100, 100 * (val || 0), 1, "w1")
		], "w1 pr10");
	},
	setJoints: function(sname, sitem, side, sub) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			gopts = person.opts[sname],
			sing = sname.slice(0, -1),
			item_opts = gopts[sitem],
			val, modpart, partnames,
			jrange = this.jointRange, jset = this.setJoints;
		if (!item_opts)
			item_opts = gopts[sitem] = {};
		if (!item_opts[side])
			item_opts[side] = {};
		if (!item_opts[side][sub])
			item_opts[side][sub] = {};
		modpart = item_opts[side][sub]; // such as hand or arm
		partnames = Object.keys(modpart);
		CT.dom.setContent(selz[side + "_" + sub], partnames.length ? partnames.map(function(part) {
			val = modpart[part];
			return CT.dom.div([
				Object.keys(val).map(function(axis) {
					return jrange(sname, sitem, val[axis], side, sub, part, axis, modpart);
				})
			], "jblock pr10");
		}) : "");
		CT.dom.setContent(selz[side + "_" + sub + "_button"], partnames.length ? CT.dom.button("clear", function() {
			if (!confirm("really?"))
				return;
			person["un" + sing](null, side, sub);
			delete item_opts[side][sub];
			if (!Object.keys(item_opts[side]).length)
				delete item_opts[side];
			jset(sname, sitem, side, sub);
		}) : CT.dom.button("add", function() {
			zero.core[CT.parse.capitalize(sub)].parts.forEach(function(part) {
				modpart[part] = {};
				Object.keys(zero.base.aspects[sub][part]).forEach(function(dim) {
					modpart[part][dim] = 0;
				});
			});
			jset(sname, sitem, side, sub);
		}));
	},
	setItem: function(sname, sitem) {
		var jset = this.setJoints, selz = this._.selectors;
		["left", "right"].forEach(function(side) {
			["leg", "arm", "hand"].forEach(function(sub) {
				jset(sname, sitem, side, sub);
			});
		});
		CT.dom.setContent(selz[sname + "_button"], sitem);
	},
	selector: function(sname, onfocus) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			gopts = person.opts[sname],
			sing = sname.slice(0, -1),
			capd = CT.parse.capitalize(sing),
			apro = "active" + capd,
			setr = this["set" + capd],
			seti = this.setItem;
		vu.core.fieldList(selz[sname], Object.keys(gopts), null, function(v, i) {
			// generator
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					if (person[apro])
						person["un" + sing]();
					setr ? setr(f.value) : seti(sname, f.value);
					(onfocus || person[sing])(f.value);
				};
				f.onkeyup = function() {
					if (f.value) {
						gopts[f.value] = gopts[f._trigger];
						delete gopts[f._trigger];
						person[apro] = f._trigger = f.value;
						_.peritem(sname, gopts);
					} else
						f.value = f._trigger; // meh
				};
				!i && setTimeout(f.onfocus); // select 1st
			}
			return f;
		}, function(iput) {
			// onadd
			var key = iput.value;
			if (key in gopts) return; // already exists...
			gopts[key] = {};
			setTimeout(function() {
				iput.focus();
			});
		}, function(val) {
			// onremove
			delete gopts[val];
			_.peritem(sname, gopts);
		});
	},
	persist: function(updates, sub) {
		var popts = this._.opts;
		if (sub)
			popts[sub] = CT.merge(updates, popts[sub]);
		else
			popts = CT.merge(updates, popts);
		vu.storage.save(popts, null, "person", updates, sub);
	},
	init: function(opts) {
		var modal, section, _ = this._, selz = _.selectors;
		this.opts = opts = CT.merge(opts, {
			main: null, // required! -> becomes top-left
			secondary: null,
			subs: {} // node map
		});
		opts.impex = [opts.main];
		if (opts.secondary) {
			opts.topright = opts.secondary;
			opts.impex.push(opts.secondary);
			_.menus[opts.secondary] = "topright";
		}
		opts.topleft = opts.main;
		_.menus[opts.main] = "topleft";
		_.setup();
		CT.dom.id("ctmain").className = "gpage"; // 33% gmenu exclusion
		for (section in _.menus) {
			modal = vu.core.menu(section, _.menus[section],
				selz[section], _.header(section));
			if (opts.secondary) {
				if (section == opts.secondary)
					_.legs.push(modal);
				else if (section == "spine")
					_.arms.push(modal);
			}
			if (section.endsWith("arm"))
				_.arms.push(modal);
			if (section.endsWith("leg"))
				_.legs.push(modal);
			else if (section != opts.secondary)
				modal.show("ctmain");
		}
	}
});