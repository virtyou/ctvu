window.VU = {
	_: {
		people: {},
		actions: ["say", "respond", "responses", "triggers"],
		pusher: function(action, person) {
			return function(data, cb) {
				person.cb = cb;
				person.iframe.contentWindow.postMessage({
					action: action,
					data: data,
					cb: cb && person.key
				});
			};
		},
		puller: function(event) {
			var d = event.data;
			if (d.action == "cb")
				VU._.people[d.person].cb(d.data);
			// else....
		},
		person: function(ifr, key) {
			var p = VU._.people[key] = { iframe: ifr, key: key };
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