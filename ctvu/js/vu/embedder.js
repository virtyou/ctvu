window.VU = {
	_: {
		people: {},
		actions: ["say", "respond", "responses", "triggers", "trigger", "listen"],
		pusher: function(action, person) {
			return function(data, cb) {
				if (action == "trigger")
					person.cbs[data] = cb;
				else
					person.cb = cb;
				person.iframe.contentWindow.postMessage({
					action: action,
					data: data,
					cb: !!cb
				});
			};
		},
		puller: function(event) {
			var d = event.data, person = VU._.people[d.person];
			if (d.action == "cb")
				person.cb(d.data);
			else if (d.action == "trigger")
				person.cbs[d.data]();
		},
		person: function(ifr, key) {
			var p = VU._.people[key] = {
				cbs: {}, key: key, iframe: ifr
			};
			VU._.actions.forEach(function(action) {
				p[action] = vu._.pusher(action, p);
			});
			return p;
		}
	},
	embed: function(node, pkey, rkey, domain, protocol) {
		VU.init();
		var ifr = document.createElement("iframe"), key = pkey + "_" + rkey;
		ifr.src = (protocol || "https") + "://" + (domain || "virtyou.org") + "/vu/embed.html#" + key;
		ifr.style.width = ifr.style.height = "100%";
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