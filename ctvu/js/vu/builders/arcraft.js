vu.builders.arcraft = {
	_: {
		selectors: {},
		menus: {
			basic: "topleft",
			markers: "topright",
			lights: "bottomleft"
		},
		setup: function() {
			var _ = vu.builders.arcraft._, selz = _.selectors, section;
			for (section in _.menus)
				selz[section] = CT.dom.div();
		},
		load: function(aug) {
			var _ = vu.builders.arcraft._, selz = _.selectors;
			_.sharer.update(aug);
			CT.dom.setContent(_.curname, aug.name);
		},
		swap: function() {

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
						_.swap(item);
					});
				}
			});
		},
		getAugmentations: function() {
			var _ = vu.builders.arcraft._;
			CT.db.get("augmentation", function(augs) {
				_.augs = augs;
				if (augs.length)
					_.swap(augs[0]);
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