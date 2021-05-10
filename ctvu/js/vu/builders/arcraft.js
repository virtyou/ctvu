vu.builders.arcraft = {
	_: {
		selectors: {},
		menus: {
			basic: "topleft",
			markers: "topright",
			lights: "bottomleft"
		},
		generators: {
			basic: function() {
				var alink, qn, n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.update = function() {
					alink = "/vu/ar.html#" + _.aug.key;
					qn = CT.dom.div();
					new QRCode(qn, alink);
					CT.dom.setContent(n, [ qn, CT.dom.link(_.aug.name, null, alink) ]);
				};
				return n;
			},
			markers: function() {
				var n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.update = function() {
					// hiro/kanji/0-7 -> thing/vswarm/primitive
				};
				return n;
			},
			lights: function() {
				var n = CT.dom.div(), _ = vu.builders.arcraft._;
				n.update = function() {
					// basic zone-like controls
				};
				return n;
			}
		},
		setup: function() {
			var _ = vu.builders.arcraft._, genz = _.generators, section;
			for (section in genz)
				_.selectors[section] = genz[section]();
		},
		load: function(aug) {
			var _ = vu.builders.arcraft._, selz = _.selectors;
			_.aug = aug;
			_.sharer.update(aug);
			CT.dom.setContent(_.curname, aug.name);
			selz.basic.update();
			selz.markers.update();
			selz.lights.update();
		},
		swap: function() {
			var _ = vu.builders.arcraft._;
			CT.modal.choice({
				prompt: "select augmentation",
				data: [{ name: "new augmentation" }].concat(_.augs),
				cb: function(aug) {
					if (aug.name == "new augmentation")
						return _.craft();
					_.load(aug);
				}
			});
		},
		craft: function() {
			var _ = vu.builders.arcraft._;
			CT.modal.prompt({
				prompt: "what's the new augmentation's name?",
				cb: function(name) {
					vu.core.v({
						action: "augmentation",
						owners: [user.core.get("key")],
						name: name
					}, function(item) {
						_.augs.push(item);
						_.load(item);
					});
				}
			});
		},
		getAugmentations: function() {
			var _ = vu.builders.arcraft._;
			CT.db.get("augmentation", function(augs) {
				_.augs = augs;
				if (augs.length)
					_.load(augs[0]);
				else
					_.craft();
			}, 1000, null, null, {
				owners: {
					comparator: "contains",
					value: user.core.get("key")
				}
			});
		},
		linx: function() {
			var _ = vu.builders.arcraft._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			_.getAugmentations();
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.swap),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		}
	},
	menus: function() {
		var section, _ = vu.builders.arcraft._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};