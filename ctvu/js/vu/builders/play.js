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
				target: person,
				moveCb: vu.live.up
			});
		},
		chat: function() {

		},
		action: function() {
			var cur = zero.core.current, person = cur.person,
				pos = person.body.bone.position, hit = false;
			cur.room.objects.filter(function(obj) {
				var o = obj.opts, og = o.portals && o.portals.outgoing;
				return og && og.target;
			}).forEach(function(portal) {
				if (hit) return;
				var dist = portal.position().distanceTo(pos);
				CT.log(portal.name + " " + dist);
				if (dist < 100) {
					hit = true;
					CT.db.one(portal.opts.portals.outgoing.target, function(target) {
						if (target.owner) // room
							person.say("this door is locked");
						else {
							CT.pubsub.unsubscribe(cur.room.opts.key);
							zero.core.util.room(CT.data.get(target.parent));
							CT.pubsub.subscribe(cur.room.opts.key);
						}
					}, "json");
				}
			});
			if (!hit)
				vu.builders.play._.chat();
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