window.VU = {
	_: {
		people: {},
		bridges: {},
		actions: ["ping", "say", "respond", "responses", "triggers", "trigger", "listen"],
		queries: ["rooms", "people", "room", "person"],
		switchies: ["set", "ping"],
		sender: function(action, entity, onsend) {
			return function(data, cb) {
				if (["people", "rooms", "listen", "trigger"].indexOf(action) != -1) {
					if (action != "trigger") {
						cb = data;
						data = action;
					}
					entity.cbs[data] = cb;
				} else if (action != "ping" && action != "set")
					entity.cb = cb;
				entity.iframe.contentWindow.postMessage({
					action: action,
					data: data,
					cb: !!cb
				}, entity.iframe._targetOrigin);
				return onsend && onsend(action, entity, data, cb);
			};
		},
		puller: function(event) {
			var d = event.data, person, _ = VU._;
			if (d.person) {
				person = _.people[d.person];
				if (d.action == "cb")
					person.cb(d.data);
				else if (d.action == "trigger")
					person.cbs[d.data]();
				else if (d.action == "listen")
					person.cbs.listen(d.data);
				else if (d.action == "resolve")
					_.onresolved && _.onresolved();
			} else if (d.bridge)
				_.bridges[d.bridge].cbs[d.action](d.data);
			else if (d.switcheroo)
				_.switcheroo.cb(d.data);
		},
		person: function(ifr, key, onready, cb) {
			var p = VU._.people[key] = {
				cbs: {}, key: key, iframe: ifr, cb: cb || onready
			};
			VU._.actions.forEach(function(action) {
				p[action] = VU._.sender(action, p);
			});
			ifr.onload = onready && function() {
				p.ping(); // opens bidirectional stream
			};
			return p;
		},
		upbridge: function(action, entity, data, cb) {
			if (["room", "person"].indexOf(action) != -1) {
				entity[action] = data;
				if (action == "person")
					return VU._.person(entity.iframe,
						entity.person + "_" + entity.room, null, cb);
			}
		},
		bridge: function(ifr, key, onready) {
			var _ = VU._, b = _.bridges[key] = {
				cbs: {}, key: key, iframe: ifr,
			};
			ifr.onload = onready;
			_.queries.forEach(function(query) {
				b[query] = _.sender(query, b, _.upbridge);
			});
			return b;
		},
		switcher: function(ifr, onswitch) {
			var _ = VU._, s = _.switcheroo = {
				cbs: {}, key: "switcheroo", iframe: ifr, cb: onswitch
			};
			_.switchies.forEach(function(switchie) {
				s[switchie] = _.sender(switchie, s, _.upbridge);
			});
			ifr.onload = function() {
				s.ping(); // opens bidirectional stream
			};
			return s;
		},
		iframe: function(key, node) {
			var ifr = document.createElement("iframe"),
				loc = VU._.location();
			ifr._targetOrigin = loc;
			ifr.allow = "microphone";
			ifr.src = loc + "/vu/widget.html#" + key;
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
					return p.slice(0, -10);
			}
		}
	},
	switcher: function(node, onswitch) {
		VU.init();
		return VU._.switcher(VU._.iframe("switcheroo", node), onswitch);
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
	onresolved: function(cb) {
		VU._.onresolved = cb;
	},
	init: function() {
		if (!VU._.initialized) {
			VU._.initialized = true;
			window.addEventListener("message", VU._.puller);
		}
	}
};