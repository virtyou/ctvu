vu.live = {
	_: {
		people: {},
		events: {
			subscribe: function(data) {
				var spawn = vu.live._.spawn;
				data.presence.forEach(function(u, i) {
					spawn(u, data.metamap[u]);
				});
			},
			join: function(chan, user, meta) {
				vu.live._.spawn(user, meta);
			},
			leave: function(chan, user) {
				var peeps = vu.live._.people;
				peeps[user].remove();
				delete peeps[user];
			},
			meta: function(data) {
				if (data.user == zero.core.current.person.opts.key)
					return;
				var person = vu.live._.people[data.user];
				if (!person)
					return; // will handle meta when spawn is complete
				var s = person.body.springs, meta = data.meta;
				["weave", "slide", "orientation"].forEach(function(prop) { // bob?
					s[prop].target = meta[prop];
				});
				vu.live._.dance(person, meta);
			},
			message: function(msg) {
				vu.live._.people[msg.user].say(msg.message, null, true);
			}
		},
		dance: function(person, meta) {
			if (meta.gesture)
				(person.activeGesture == meta.gesture) || person.gesture(meta.gesture);
			else if (person.activeGesture)
				person.ungesture();
			if (meta.dance)
				person.dance(meta.dance);
			else if (person.activeDance)
				person.undance();
		},
		spawn: function(pkey, meta) {
			CT.db.one(pkey, function(pdata) {
				zero.core.util.join(vu.core.person(pdata), function(person) {
					var s = person.body.springs;
					vu.live._.people[pdata.key] = person;
					if (pdata.key == CT.storage.get("person"))
						vu.live._.joined(person);
					if (!meta) return;
					["weave", "slide", "orientation"].forEach(function(prop) {
						s[prop].target = s[prop].value = meta[prop];
					});
					vu.live._.dance(person, meta);
				});
			}, "json");
		}
	},
	up: function() {
		var person = zero.core.current.person, s = person.body.springs, targets = {
			dance: person.activeDance,
			gesture: person.activeGesture
		};
		["weave", "slide", "orientation"].forEach(function(prop) {
			targets[prop] = s[prop].target;
		});
		CT.pubsub.meta(zero.core.current.room.opts.key, targets);
	},
	init: function(joined) {
		var _ = vu.live._, person = zero.core.current.person;
		_.joined = joined;
		["subscribe", "join", "leave", "meta", "message"].forEach(function(ename) {
			CT.pubsub.set_cb(ename, _.events[ename]);
		});
		CT.pubsub.connect(location.hostname, 8888, CT.storage.get("person"));
		CT.pubsub.subscribe(zero.core.current.room.opts.key);
	}
};