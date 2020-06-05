vu.portal = {
	_: {},
	on: function(emission, cb) {
		vu.portal._[emission] = cb;
	},
	portin: function(target, portinkey) {
		var _ = vu.portal._, cur = zero.core.current;
		Object.values(cur.people).forEach(function(person) {
			if (!vu.core.ischar(person.opts.key))
				person.remove();
		});
		zero.core.util.room(CT.merge({
			onbuild: function(room) {
				_.inject && _.inject(portinkey);
				room.cut();
				room.objects.forEach(_.clickreg);
			} // hm revisit below...
		}, CT.data.get(target || CT.storage.get("room"))));
		_.portin && _.portin();
	},
	port: function(target, portout, portin) {
		var vp = vu.portal, _ = vp._;
		_.eject && _.eject(portout);
		setTimeout(vp.portin, 500, target, portin);
	},
	check: function() {
		var cur = zero.core.current, person = cur.person,
			pos = person.body.group.position, hit = false;
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
					if (target.kind != "portal")
						person.say("this door is locked");
					else
						vu.portal.port(target.parent, portal.opts.key, target.key);
				}, "json");
			}
		});
	}
};