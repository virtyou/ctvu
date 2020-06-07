vu.portal = {
	_: {
		inject: function(troom, pkey) { // join
			zero.core.util.room(CT.merge({
				onbuild: function(room) {
					vu.portal.arrive(pkey &&
						zero.core.Thing.get(pkey));
				}
			}, CT.data.get(troom || CT.storage.get("room"))));
		},
		eject: function(pkey) { // leave
			var zcc = zero.core.current, person = zcc.person;
			vu.portal.ejector = pkey && zero.core.Thing.get(pkey);
			zcc.room.eject(person, vu.portal.ejector);
		},
		filter: function(obj) {
			var o = obj.opts, og = o.portals && o.portals.outgoing;
			return og && og.target;
		}
	},
	on: function(emission, cb) {
		vu.portal._[emission] = cb;
	},
	arrive: function(portal) {
		var zcc = zero.core.current, person = zcc.person;
		zcc.room.inject(person, portal);
		zcc.room.cut();
		person.watch(false, true);
	},
	depart: function() {
		var cur = zero.core.current;
		Object.values(cur.people).forEach(function(person) {
			if (person != cur.person)
				person.remove();
		});
	},
	portin: function(target, portin) {
		var _ = vu.portal._;
		vu.portal.depart();
		_.inject(target, portin);
	},
	port: function(target, portout, portin) {
		var vp = vu.portal, _ = vp._;
		_.eject(portout);
		setTimeout(vp.portin, 500, target, portin);
	},
	check: function() {
		var cur = zero.core.current, person = cur.person,
			pos = person.body.group.position, _ = this._, hit = false;
		cur.room.objects.filter(_.filter).forEach(function(portal) {
			if (hit) return;
			var dist = portal.position().distanceTo(pos);
			CT.log(portal.name + " " + dist);
			if (dist < 100) {
				hit = true;
				CT.db.one(portal.opts.portals.outgoing.target, function(target) {
					if (target.kind != "portal")
						person.say("this door is locked");
					else
						vu.portal.port(target.parent, portal.opts.key, target.key);
				}, "json");
			}
		});
	}
};