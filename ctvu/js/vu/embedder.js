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
			return p;
		},
		iframe: function(key) {
			var loc = VU._.location(), ifr = document.createElement("iframe");
			ifr.src = loc.protocol + "://" + loc.domain + "/vu/embed.html#" + key;
			ifr.style.width = ifr.style.height = "100%";
			return ifr;
		},
		location: function() {
			if (VU._.loc)
				return VU._.loc;
			var s = document.getElementsByTagName("script"),
				i, p, parts, loc = VU._.loc = {};
			for (i = 0; i < s.length; i++) {
				p = s[i].src;
				if (p.slice(-15) == "/vu/embedder.js") {
					loc.full = p;
					parts = p.split("://");
					loc.protocol = parts[0];
					loc.domain = parts[1].split("/").shift();
					return loc;
				}
			}
		}
	},
	bridge: function(node, ukey, onready) { // useful for getting user data pre-select
		VU.init();
		var ifr = VU._.iframe(ukey);
		node.appendChild(ifr);
		return VU._.bridge(ifr, ukey, onready);
	},
	embed: function(node, pkey, rkey, onready) {
		VU.init();
		var key = pkey + "_" + rkey,
			ifr = VU._.iframe(key);
		node.appendChild(ifr);
		return VU._.person(ifr, key, onready);
	},
	init: function() {
		if (!VU._.initialized) {
			VU._.initialized = true;
			window.addEventListener("message", VU._.puller);
		}
	}
};