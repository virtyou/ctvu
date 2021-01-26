vu.live = {
	_: {
		people: {},
		pending: {},
		springs: ["weave", "slide", "orientation"],
		bsprops: ["target", "value", "boost", "floored", "hard"], // overkill?
		actions: { // message types
			chat: function(person, msg) {
				vu.live._.cbs.chat(person, msg);
			},
			inject: function(person, pkey) { // join
				zero.core.current.room.inject(person, pkey && zero.core.Thing.get(pkey));
//				person.body.show();
			},
			eject: function(person, pkey) { // leave
				zero.core.current.room.eject(person, pkey && zero.core.Thing.get(pkey));
			},
			trigger: function(person, tname) {
				person.respond(tname);
			},
			environment: function(person, data) { // extend/genericize.....
				var zcc = zero.core.current;
				if (person == zcc.person) return;
				if ("light" in data) {
					var lig = zcc.room.lights[data.light];
					data.color && lig.setColor(data.color);
					data.position && lig.position(data.position);
					("intensity" in data) && lig.setIntensity(data.intensity);
				} else {
					var flo = zcc.room[data.name], fos = flo.opts.shift;
					fos.speed = data.speed;
					flo.placer.position[fos.axis] = data.position;
					flo.bounds.min[fos.axis] = data.min;
					flo.bounds.max[fos.axis] = data.max;
				}
			}
		},
		events: {
			subscribe: function(data) {
				var _ = vu.live._, spawn = _.spawn;
				data.presence.forEach(function(u, i) {
					spawn(u, data.metamap[u], !vu.core.ischar(u));
				});
				if (data.presence.length == 1)
					CT.event.subscribe("environment", _.esync);
				else
					CT.event.unsubscribe("environment", _.esync);
			},
			join: function(chan, user, meta) {
				vu.live._.spawn(user, meta);//, null, true);
			},
			leave: function(chan, user) {
				var _ = vu.live._, peeps = _.people;
				setTimeout(function() {
					vu.builders.play.minimap.unperson(peeps[user].name);
					peeps[user].remove();
					delete peeps[user];
					if (Object.keys(peeps).length == 1)
						CT.event.subscribe("environment", _.esync);
				}, 500); // leave time for ejection
			},
			meta: function(data) {
				if (data.user == zero.core.current.person.opts.key)
					return;
				var _ = vu.live._, person = _.people[data.user];
				if (!(person && person.body))
					return; // will handle meta when spawn is complete
				var s = person.body.springs, meta = data.meta;
				_.springs.forEach(function(prop) {
					s[prop].target = meta[prop].target;
				});
				_.bsprops.forEach(function(bsp) {
					s.bob[bsp] = meta.bob[bsp];
				});
				_.dance(person, meta);
			},
			message: function(msg) {
				var data = msg.message,
					person = vu.live._.people[msg.user];
				if (person && person.body)
					vu.live._.actions[data.action](person, data.data);
				else // probs still building
					vu.live._.pending[msg.user] = msg;
			}
		},
		esync: function(data) {
			vu.live.emit("environment", data);
		},
		dance: function(person, meta) {
			if (meta.vibe != person.vibe.current)
				person.vibe.update(meta.vibe);
			if (meta.gesture)
				(person.activeGesture == meta.gesture) || person.gesture(meta.gesture);
			else if (person.activeGesture)
				person.ungesture();
			if (meta.dance)
				person.dance(meta.dance);
			else if (person.activeDance)
				person.undance();
		},
		spawn: function(pkey, meta, unfric, invis) {
			var _ = vu.live._, isYou = vu.core.ischar(pkey);
			if (isYou && pkey in _.people) return; // you switching rooms
			CT.db.one(pkey, function(pdata) {
				if (meta && !invis)
					pdata.body.position = [meta.weave.target, meta.bob.target, meta.slide.target];
				zero.core.util.join(vu.core.person(pdata, invis), function(person) {
					_.people[pdata.key] = person;
					_.cbs.enter(person);
					if (isYou)
						_.cbs.joined(person);
					else if (unfric)
						person.body.setFriction(false, true);
					if (_.pending[pdata.key]) {
						_.events.message(_.pending[pdata.key]);
						delete _.pending[pdata.key];
					}
					meta && _.events.meta(meta);
				}, !isYou);
			}, "json");
		}
	},
	emit: function(action, val) {
		CT.pubsub.publish(zero.core.current.room.opts.key, {
			action: action,
			data: val
		});
	},
	meta: function() {
		var zcc = zero.core.current, person = zcc.person, targets = {
			mod: person.activeMod,
			vibe: person.vibe.current,
			dance: person.activeDance,
			gesture: person.activeGesture
		}, s = person.body.springs, _ = vu.live._;
		_.springs.forEach(function(prop) {
			targets[prop] = { target: s[prop].target };
		});
		targets.bob = {};
		_.bsprops.forEach(function(bsp) {
			targets.bob[bsp] = s.bob[bsp];
		});
		CT.pubsub.meta(zcc.room.opts.key, targets);
	},
	init: function(cbs) {
		var _ = vu.live._;
		_.cbs = cbs;
		["subscribe", "join", "leave", "meta", "message"].forEach(function(ename) {
			CT.pubsub.set_cb(ename, _.events[ename]);
		});
		CT.pubsub.connect(location.hostname, 8888, CT.storage.get("person"));
		CT.pubsub.subscribe(zero.core.current.room.opts.key);
	}
};