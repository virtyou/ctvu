vu.menu.Map = CT.Class({
	CLASSNAME: "vu.menu.Map",
	_: {
		b2p: function(bz) {
			var _ = this._, s = _.scale, o = _.offsets,
				min = bz.min, max = bz.max;
			return {
				top: s * (min.z + o.z) + "px",
				left: s * (min.x + o.x) + "px",
				width: s * (max.x - min.x) + "px",
				height: s * (max.z - min.z) + "px"
			};
		}
	},
	update: function(opts) {

	},
	place: function(obj, kind) {
		var _ = this._;
		CT.dom.addContent(_.frame, CT.dom.div(null,
			kind, null, null, _.b2p(obj.bounds)));
	},
	frame: function(bounds) {
		var _ = this._, min = bounds.min, max = bounds.max,
			w = max.x - min.x, h = max.z - min.z, r = w / h,
			n = _.frame = CT.dom.div(null, "frame"), wp;
		CT.dom.setContent(this.opts.node, n);
		wp = n.clientWidth;
		_.scale = wp / w;
		_.offsets = {
			x: -min.x,
			z: -min.z
		};
		n.style.height = (wp / r) + "px";
	},
	refresh: function() {
		var zcc = zero.core.current, k, o,
			r = zcc.room, pz = zcc.people;
		this.frame(r.bounds);
		for (k of ["floor", "wall", "obstacle"])
			for (o in r[k])
				this.place(r[k][o], k);
		r.objects.forEach(o => this.place(o, "object"));
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			node: document.body
		});
		this.refresh();
	}
});