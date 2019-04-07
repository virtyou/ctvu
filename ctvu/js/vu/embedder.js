window.vu = {
	_: {
		pusher: function(action) {
			return function(words, cb) {
				vu._.cb = cb;
				vu._.iframe.contentWindow.postMessage({
					action: action,
					data: words,
					cb: !!cb
				});
			};
		},
		puller: function(event) {
			var d = event.data;
			if (d.action == "cb")
				vu._.cb();
			// else....
		}
	},
	embed: function(node, pkey, rkey, domain, protocol) {
		var ifr = vu._.iframe = document.createElement("iframe");
		ifr.src = (protocol || "https") + "://" + (domain || "virtyou.org") + "/vu/embed.html#" + pkey + "_" + rkey;
		ifr.style.width = ifr.style.height = "100%";
		node.appendChild(ifr);
		vu.init();
	},
	init: function() {
		vu.say = vu._.pusher("say");
		vu.respond = vu._.pusher("respond");
		window.addEventListener("message", vu._.puller);
	}
};