vu.menu.Map = CT.Class({
	CLASSNAME: "vu.menu.Map",
	_: {
		people: {},
		center: { x: 0, z: 0 },
		b2p: function(bz, p) {
			var _ = this._, s = _.scale, o = _.offsets,
				min = bz.min, max = bz.max;
			p = p || _.center;
			return {
				top: s * (min.z + o.z + p.z) + "px",
				left: s * (min.x + o.x + p.x) + "px",
				width: s * (max.x - min.x) + "px",
				height: s * (max.z - min.z) + "px"
			};
		}
	},
	update: function(name) {
		var _ = this._, n = _.people[name],
			s = n.style, p = n.person, r,
			rules = _.b2p(p.body.bounds, p.body.position());
		for (r in rules)
			s[r] = rules[r];
	},
	place: function(obj, kind, pos) {
		var _ = this._, n = CT.dom.div(null, 
			kind, null, null, _.b2p(obj.bounds, pos));
		CT.dom.addContent(_.frame, n);
		return n;
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
		var zcc = zero.core.current, _ = this._,
			r = zcc.room, pz = zcc.people,
			zccpn = zcc.person.name, k, o, p;
		this.frame(r.bounds);
		for (k of ["floor", "wall", "obstacle"])
			for (o in r[k])
				this.place(r[k][o], k);
		r.objects.forEach(o => this.place(o, "object"));
		for (k in pz) {
			p = pz[k];
			_.people[p.name] = this.place(p.body,
				p.name == zccpn ? "person" : "people", p.body.position());
			_.people[p.name].person = p;
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			node: document.body
		});
		this.refresh();
	}
});