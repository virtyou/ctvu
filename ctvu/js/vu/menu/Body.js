vu.menu.Body = CT.Class({
	CLASSNAME: "vu.menu.Body",
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		arms: [],
		legs: [],
		menus: {
			camera: "top",
			body: "topleft",
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
			selz.body = CT.dom.div();
			selz.spine = CT.dom.div();
			selz.body_button = CT.dom.div(null, "right");
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
		sing: function(prop) {
			return prop.endsWith("s") ? prop.slice(0, -1) : prop;
		},
		peritem: function(k, v) {
			var pobj = {};
			pobj[k] = v;
			this.persist(pobj);
		}
	},
	initMain: function() {
		var _ = this._, per = _.peritem, lm = this.loadMain,
			cur = zero.core.current, mprop = this.opts.main,
			sing = _.sing(mprop);
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
	setJoints: function(sname, sitem, side, sub) {

		/// ?????

	},
	setItem: function(sname, sitem) {
		var jset = this.setJoints, selz = this._.selectors;
		["left", "right"].forEach(function(side) {
			["leg", "arm", "hand"].forEach(function(sub) {
				jset(sname, sitem, side, sub);
			});
		});
		jset(sname, sitem, "spine");
		jset(sname, sitem, "body");
		CT.dom.setContent(selz[sname + "_button"], sitem);
	},
	selector: function(sname, onfocus) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			gopts = person.opts[sname],
			sing = _.sing(sname),
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