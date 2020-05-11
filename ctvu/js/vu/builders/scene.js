vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			info: "top",
			scripts: "topleft",
			steps: "bottomleft",
			actors: "topright",
			props: "bottomright"
		},
		load: function(scene) {
			var _ = vu.builders.scene._, selz = _.selectors;
			CT.dom.setContent(selz.info, [
				CT.dom.div(scene.name, "bigger"),
				scene.description,
				"room: " + scene.room.name
			]);
		},
		setup: function() {
			var skey = location.hash.slice(1),
				_ = vu.builders.scene._, selz = _.selectors;
			if (!skey)
				return alert("no scene specified!");
			selz.info = CT.dom.div();
			selz.scripts = CT.dom.div();
			selz.steps = CT.dom.div();
			selz.actors = CT.dom.div();
			selz.props = CT.dom.div();
			CT.db.one(skey, _.load, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};