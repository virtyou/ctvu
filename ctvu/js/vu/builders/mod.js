vu.builders.mod = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		arms: [],
		legs: [],
		menus: {
			camera: "top",
			mods: "topleft",
			spine: "topright",
			left_leg: "right",
			right_leg: "left",
			left_arm: "right",
			right_arm: "left",
			left_hand: "bottomright",
			right_hand: "bottomleft"
		},
		joined: function(person) {
			var _ = vu.builders.mod._;
			zero.core.current.person = person;
			_.initCamera();
			if (!Object.keys(person.opts.mods).length)
				_.initMod();
			else
				_.loadMods();
		},
		swapLimbs: function(ons, offs) {
			var _ = vu.builders.mod._;
			_[ons].forEach(function(modal) {
				modal.show("ctmain");
			});
			_[offs].forEach(function(modal) {
				modal.hide();
			});
		},
		initCamera: function() {
			var _ = vu.builders.mod._;
			vu.controls.initCamera(_.selectors.camera, function(cname) {
				if (cname == "near")
					_.swapLimbs("legs", "arms");
				else // far
					_.swapLimbs("arms", "legs");
			});
		},
		initMod: function() {
			var _ = vu.builders.mod._,
				cur = zero.core.current;
			CT.modal.prompt({
				prompt: "what's the new mod?",
				cb: function(val) {
					val = vu.core.jlo(val);
					cur.person.opts.mods[val] = {};
					vu.builders.mod.persist({
						mods: cur.person.opts.mods
					});
					_.loadMods();
				}
			});
		},
		loadMods: function() {

		},
		setup: function() {
			var _ = vu.builders.mod._,
				selz = _.selectors;
			_.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(_.opts);
			selz.mods = CT.dom.div();
			selz.camera = CT.dom.div(null, "centered");
			["left", "right"].forEach(function(side) {
				["leg", "arm", "hand"].forEach(function(sub) {
					selz[side + "_" + sub] = CT.dom.div();
					selz[side + "_" + sub + "_button"] = CT.dom.div(null, "right");
				});
			});
		},
		header: function(section) {
			var selz = vu.builders.mod._.selectors;
			return [
				selz[section + "_button"],
				CT.dom.span(CT.parse.key2title(section))
			];
		}
	},
	menus: function() {
		var modal, section,
			_ = vu.builders.mod._,
			selz = _.selectors;
		_.setup();
		CT.dom.id("ctmain").className = "gpage"; // for gmenu 33% rule exclusion
		for (section in _.menus) {
			modal = vu.core.menu(section, _.menus[section], selz[section], _.header(section));
			if (section.endsWith("arm"))
				_.arms.push(modal);
			if (section.endsWith("leg"))
				_.legs.push(modal);
			else
				modal.show("ctmain");
		}
	}
};