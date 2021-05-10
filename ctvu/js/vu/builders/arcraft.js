vu.builders.arcraft = {
	_: {
		selectors: {},
		menus: {
			basic: "topleft",
			anchors: "topright",
			lights: "bottomleft"
		},
		setup: function() {
			var _ = vu.builders.arcraft._, selz = _.selectors, section;
			for (section in _.menus)
				selz[section] = CT.dom.div();
		},
		swap: function() {

		},
		linx: function() {
			var _ = vu.builders.arcraft._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
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