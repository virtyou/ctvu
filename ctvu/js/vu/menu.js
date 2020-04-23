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
			var _ = this._;
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
			var selz = this._.selectors, content = [
				selz[section + "_button"],
				CT.dom.span(CT.parse.key2title(section))
			], per = this.persist;
			if (this.opts.impex.includes(section)) {
				content.push(CT.dom.pad());
				content.push(CT.dom.link("import/export", function() {
					vu.core.impex(zero.core.current.person.opts[section], function(val) {
						var upobj = {};
						upobj[section] = val;
						per(upobj);
					});
				}));
			}
		}
	},
	initMain: function() {
		var _ = this._, mprop = this.opts.main,
			per = this.persist, cur = zero.core.current,
			sing = mprop.slice(0, -1);
		CT.modal.prompt({
			prompt: "what's the new " + sing + "?",
			cb: function(val) {
				val = vu.core.jlo(val);
				cur.person.opts[mprop][val] = {};
				var d = {};
				d[mprop] = cur.person.opts[mprop];
				per(d);
				_.loadMain();
			}
		});
	},
	loadMain: function() {

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
			subs: {}, // node map
			impex: [],
			topleft: null,
			topright: null
		});
		opts.topleft = opts.topleft || opts.main;
		_.menus[opts.topleft] = "topleft";
		_.menus[opts.topright] = "topright";
		_.setup();
		CT.dom.id("ctmain").className = "gpage"; // 33% gmenu exclusion
		for (section in _.menus) {
			modal = vu.core.menu(section, _.menus[section],
				selz[section], _.header(section));
			if (section.endsWith("arm"))
				_.arms.push(modal);
			if (section.endsWith("leg"))
				_.legs.push(modal);
			else
				modal.show("ctmain");
		}
	}
});