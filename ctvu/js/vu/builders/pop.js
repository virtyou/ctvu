vu.builders.pop = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			people: "topleft",
			activities: "topright",
			minimap: "bottom"
		},
		joined: function(person) {
			var _ = vu.builders.pop._;
			zero.core.util.setCurPer(person);
			vu.controls.initCamera(_.selectors.cameras);
			new vu.menu.Map({ node: _.selectors.minimap });
			new zero.core.Controls({
				cams: true,
				target: person
			});
		},
		set: function(zone) {

		},
		select: function() {
			var _ = vu.builders.pop._,
				zones = vu.storage.get("rooms");
			CT.modal.choice({
				prompt: "select zone",
				data: [{ name: "new zone" }].concat(zones),
				cb: function(zone) {
					if (zone.name == "new zone")
						location = "/vu/zone.html";
					else
						_.set(zone);
				}
			});
		},
		linx: function() {
			var _ = vu.builders.pop._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			zero.core.util.join(vu.core.person(vu.storage.get("person")), _.joined);
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.select),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		},
		setup: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.cameras = CT.dom.div(null, "centered");
			selz.minimap = CT.dom.div();
			selz.people = CT.dom.div();
			selz.activities = CT.dom.div();
		}
	},
	menus: function() {
		var section, _ = vu.builders.pop._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};