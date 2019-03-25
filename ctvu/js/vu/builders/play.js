vu.builders.play = {
	_: {
		opts: core.config.ctvu.builders.person,
		selectors: {},
		menus: {
			cameras: "top",
			triggers: "bottomleft",
			gestures: "bottomright"
		},
		joined: function(person) {
			var _ = vu.builders.play._;
			vu.builders.current.person = zero.core.current.person = person;
			vu.controls.initCamera(_.selectors.cameras);
			vu.controls.setTriggers(_.selectors.triggers);
			vu.controls.setGestures(_.selectors.gestures);
			person.body.setBounds();
			_.controls = new zero.core.Controls({
				cb: _.action,
				target: person
			});
		},
		action: function() {
			var person = zero.core.current.person,
				pos = person.body.bone.position;
			zero.core.current.room.objects.filter(function(obj) {
				var o = obj.opts, og = o.portals && o.portals.outgoing;
				return og && og.target;
			}).forEach(function(portal) {
				var dist = portal.position().distanceTo(pos);
				CT.log(portal.name + " " + dist);
				if (dist < 100) {
					CT.db.one(portal.opts.portals.outgoing.target, function(target) {
						if (target.owner) // room
							person.say("this door is locked");
						else
							zero.core.util.room(CT.data.get(target.parent));
					}, "json");
				}
			});
		},
		setup: function() {
			var _ = vu.builders.play._, selz = _.selectors,
				popts = _.opts = vu.storage.get("person") || _.opts;
			_.raw = vu.core.person(popts);
			selz.cameras = CT.dom.div(null, "centered");
			selz.triggers = CT.dom.div();
			selz.gestures = CT.dom.div();
		}
	},
	menus: function() {
		var section, _ = vu.builders.play._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};