window.VU = {
	_: {
		people: {},
		bridges: {},
		actions: ["say", "respond", "responses", "triggers", "trigger", "listen"],
		queries: ["rooms", "people", "room", "person"],
		sender: function(action, entity, onsend) {
			return function(data, cb) {
				if (["trigger", "people", "rooms"].indexOf(action) != -1)
					entity.cbs[data] = cb;
				else
					entity.cb = cb;
				entity.iframe.contentWindow.postMessage({
					action: action,
					data: data,
					cb: !!cb
				});
				return onsend && onsend(action, entity, data);
			};
		},
		puller: function(event) {
			var d = event.data, person;
			if (d.person) {
				person = VU._.people[d.person];
				if (d.action == "cb")
					person.cb(d.data);
				else if (d.action == "trigger")
					person.cbs[d.data]();
			} else // bridge
				VU._.bridges[d.bridge].cbs[d.action](d.data);
		},
		person: function(ifr, key) {
			var p = VU._.people[key] = {
				cbs: {}, key: key, iframe: ifr
			};
			VU._.actions.forEach(function(action) {
				p[action] = VU._.sender(action, p);
			});
			return p;
		},
		upbridge: function(action, entity, data) {
			if (["room", "person"].indexOf(action) != -1) {
				entity[action] = data;
				if (action == "person")
					return VU._.person(entity.iframe,
						entity.person + "_" + entity.room);
			}
		},
		bridge: function(ifr, key) {
			var _ = VU._, b = _.bridges[key] = {
				cbs: {}, key: key, iframe: ifr
			};
			_.queries.forEach(function(query) {
				b[query] = _.sender(query, b, _.upbridge);
			});
			return p;
		},
		iframe: function(key, domain, protocol) {
			var ifr = document.createElement("iframe");
			ifr.src = (protocol || "https") + "://" + (domain || "virtyou.org") + "/vu/embed.html#" + key;
			ifr.style.width = ifr.style.height = "100%";
			return ifr;
		}
	},
	bridge: function(node, ukey, domain, protocol) { // useful for getting user data pre-select
		VU.init();
		var ifr = VU._.iframe(ukey, domain, protocol);
		node.appendChild(ifr);
		return VU._.bridge(ifr, ukey);
	},
	embed: function(node, pkey, rkey, domain, protocol) {
		VU.init();
		var key = pkey + "_" + rkey,
			ifr = VU._.iframe(key, domain, protocol);
		node.appendChild(ifr);
		return VU._.person(ifr, key);
	},
	init: function() {
		if (!VU._.initialized) {
			VU._.initialized = true;
			window.addEventListener("message", VU._.puller);
		}
	}
};