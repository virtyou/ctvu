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
				person.body.show();
			},
			eject: function(person, pkey) { // leave
				zero.core.current.room.eject(person, pkey && zero.core.Thing.get(pkey));
				vu.builders.play.minimap.unperson(person.name);
			},
			trigger: function(person, tname) {
				person.respond(tname);
			}
		},
		events: {
			subscribe: function(data) {
				var spawn = vu.live._.spawn;
				data.presence.forEach(function(u, i) {
					spawn(u, data.metamap[u]);
				});
			},
			join: function(chan, user, meta) {
				vu.live._.spawn(user, meta, true);
			},
			leave: function(chan, user) {
				var peeps = vu.live._.people;
				setTimeout(function() {
					peeps[user].remove();
					delete peeps[user];
				}, 500); // leave time for ejection
			},
			meta: function(data) {
				if (data.user == zero.core.current.person.opts.key)
					return;
				var _ = vu.live._, person = _.people[data.user];
				if (!person)
					return; // will handle meta when spawn is complete
				var s = person.body.springs, meta = data.meta;
				_.springs.forEach(function(prop) {
					s[prop].target = meta[prop].target;
				});
				_.bsprops.forEach(function(bsp) {
					s.bob[bsp] = meta.bob[bsp];
				});
				_.dance(person, meta);
				person.body.setBob();
				setTimeout(function() {
					vu.builders.play.minimap.update(person.name);
				}, 100); // tick for upped vals
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
		spawn: function(pkey, meta, invis) {
			if (pkey in vu.live._.people) return; // you switching rooms for instance
			var _ = vu.live._, isYou = vu.core.ischar(pkey);
			CT.db.one(pkey, function(pdata) {
				if (meta && !invis)
					pdata.body.position = [meta.weave.target, meta.bob.target, meta.slide.target];
				zero.core.util.join(vu.core.person(pdata, invis), function(person) {
					var s = person.body.springs;
					_.people[pdata.key] = person;
					_.cbs.enter(person);
					isYou && vu.live._.cbs.joined(person);
					if (_.pending[pdata.key]) {
						_.events.message(_.pending[pdata.key]);
						delete _.pending[pdata.key];
					}
					if (!meta) return;
					invis || _.springs.forEach(function(prop) {
						s[prop].target = s[prop].value = meta[prop];
					});
					_.dance(person, meta);
				}, !isYou);
			}, "json");
		}
	},
	emit: function() {
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