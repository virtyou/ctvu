vu.embed = {
	_: {
		receive: function(event) {
			var d = event.data;
			zero.core.current.person[d.action](d.data, function() {
				d.cb && vu.embed._.done(d.cb);
			});
		},
		done: function(cbkey) {
			window.parent.postMessage({
				action: "cb",
				data: cbkey
			});
		}
	},
	init: function() {
		var h = document.location.hash.slice(1),
			pkey, rkey, keys = [pkey, rkey] = h.split("_");
		CT.db.multi(keys, function(data) {
			data[1].people.push(data[0]);
			core.config.ctzero.room = data[1];
			zero.core.util.init();
		}, "json");
		window.addEventListener("message", vu.embed._.receive);
	}
};