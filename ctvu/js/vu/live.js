vu.live = {
	_: {
		people: {},
		springs: ["weave", "bob", "slide", "orientation"],
		actions: { // message types
			chat: function(person, msg) {
				vu.live._.chat(person, msg);
			},
			inject: function(person, pkey) { // join
				zero.core.current.room.inject(person, pkey && zero.core.Thing.get(pkey));
				person.body.show();
			},
			eject: function(person, pkey) { // leave
				zero.core.current.room.eject(person, pkey && zero.core.Thing.get(pkey));
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
				var person = vu.live._.people[data.user];
				if (!person)
					return; // will handle meta when spawn is complete
				var s = person.body.springs, meta = data.meta;
				vu.live._.springs.forEach(function(prop) {
					s[prop].target = meta[prop];
				});
				vu.live._.dance(person, meta);
			},
			message: function(msg) {
				var data = msg.message;
				vu.live._.actions[data.action](vu.live._.people[msg.user], data.data);
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
			var isYou = vu.core.ischar(pkey);
			CT.db.one(pkey, function(pdata) {
				if (meta && !invis)
					pdata.body.position = [meta.weave, meta.bob, meta.slide];
				zero.core.util.join(vu.core.person(pdata, invis), function(person) {
					var s = person.body.springs;
					vu.live._.people[pdata.key] = person;
					if (isYou)
						vu.live._.joined(person);
					if (!meta) return;
					invis || vu.live._.springs.forEach(function(prop) {
						s[prop].target = s[prop].value = meta[prop];
					});
					vu.live._.dance(person, meta);
				}, !isYou);
			}, "json");
		}
	},
	emit: function() {
		var person = zero.core.current.person, s = person.body.springs, targets = {
			vibe: person.vibe.current,
			dance: person.activeDance,
			gesture: person.activeGesture
		};
		vu.live._.springs.forEach(function(prop) {
			targets[prop] = s[prop].target;
		});
		CT.pubsub.meta(zero.core.current.room.opts.key, targets);
	},
	init: function(joined, chat) {
		var _ = vu.live._, person = zero.core.current.person;
		_.joined = joined;
		_.chat = chat;
		["subscribe", "join", "leave", "meta", "message"].forEach(function(ename) {
			CT.pubsub.set_cb(ename, _.events[ename]);
		});
		CT.pubsub.connect(location.hostname, 8888, CT.storage.get("person"));
		CT.pubsub.subscribe(zero.core.current.room.opts.key);
	}
};