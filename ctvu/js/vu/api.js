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
		person: function(ifr, key, onready) {
			var p = VU._.people[key] = {
				cbs: {}, key: key, iframe: ifr, cb: onready
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
		bridge: function(ifr, key, onready) {
			var _ = VU._, b = _.bridges[key] = {
				cbs: {}, key: key, iframe: ifr, cb: onready
			};
			_.queries.forEach(function(query) {
				b[query] = _.sender(query, b, _.upbridge);
			});
			return b;
		},
		iframe: function(key, node) {
			var ifr = document.createElement("iframe");
			ifr.src = VU._.location() + "vu/widget.html#" + key;
			ifr.style.width = ifr.style.height = "100%";
			if (typeof node == "string")
				node = document.getElementById(node);
			node.appendChild(ifr);
			return ifr;
		},
		location: function() {
			var i, p, s = document.getElementsByTagName("script");
			for (i = 0; i < s.length; i++) {
				p = s[i].src;
				if (p.slice(-10) == "/vu/api.js")
					return p.slice(0, -12); // reduce to 6 for prod mode
			}
		}
	},
	bridge: function(node, ukey, onready) { // useful for getting user data pre-select
		VU.init();
		return VU._.bridge(VU._.iframe(ukey, node), ukey, onready);
	},
	embed: function(node, pkey, rkey, onready) {
		VU.init();
		var key = pkey + "_" + rkey;
		return VU._.person(VU._.iframe(key, node), key, onready);
	},
	init: function() {
		if (!VU._.initialized) {
			VU._.initialized = true;
			window.addEventListener("message", VU._.puller);
		}
	}
};