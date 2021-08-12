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
			_.set(zero.core.current.room);
			new zero.core.Controls({
				cams: true,
				target: person
			});
		},
		set: function(room) {
			var _ = vu.builders.pop._, selz = _.selectors, item;
			_.sharer.update(room.opts);
			vu.core.setroom(room);
			CT.dom.setContent(_.curname, room.name || room.environment);
			for (item of ["people", "activities", "cameras", "minimap"])
				selz[item].update();
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
		mima: function() {
			var _ = vu.builders.pop._, selz = _.selectors,
				sel = selz.minimap = CT.dom.div();
			_.minimap = new vu.menu.Map({ node: sel, wait: true });
			sel.update = _.minimap.refresh;
		},
		people: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.people = CT.dom.div();
			selz.people.update = function() {

			};
		},
		activities: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.activities = CT.dom.div();
			selz.activities.update = function() {

			};
		},
		setup: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.cameras = CT.dom.div(null, "centered");
			vu.controls.initCamera(selz.cameras);
			_.people();
			_.activities();
			_.mima();
		}
	},
	menus: function() {
		var section, _ = vu.builders.pop._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};