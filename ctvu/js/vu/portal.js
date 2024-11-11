vu.portal = {
	_: {
		inject: function(troom, pkey) { // join
			zero.core.current.injector = pkey;
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
		zero.core.camera.cutifroom();
		person.watch(false, true);
	},
	depart: function() {
		var cur = zero.core.current;
		Object.values(cur.people).forEach(function(person) {
			if (person != cur.person)
				person.remove();
		});
		zero.core.camera.unPerNonCur();
		zero.core.click.trigger(cur.person.body);
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
	rand: function() {
		vu.portal.port(CT.data.choice(vu.storage.get("rooms")).key);
	},
	options: function() {
		var zcc = zero.core.current, scene = zcc.scene;
		return scene && scene.mystate("portals") || {};
	},
	check: function() {
		var zc = zero.core, cur = zc.current, person = cur.person, vp = vu.portal,
			pos = person.body.placer.position, _ = this._, hit = false;
		cur.room.objects.forEach(function(portal) {
			if (hit) return;
			var dist = portal.position().distanceTo(pos);
			CT.log(portal.name + " " + dist);
			if (dist < 100) {
				hit = true;
				if (!portal.isport)
					return zc.click.trigger(portal);
				if (!_.filter(portal))
					return person.sayone(["this door is locked", "it's locked", "i'm locked out"]);
				CT.db.one(portal.opts.portals.outgoing.target,
					target => vp.port(target.parent, portal.opts.key, target.key), "json");
			}
		});
	}
};