vu.builders.game = {
	_: {
		selectors: {},
		menus: {},
		setup: function() {

		}
	},
	menus: function() {
		var section, _ = vu.builders.game._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};
//modelName, cb, limit, offset, order, filters, sync, count, exporter