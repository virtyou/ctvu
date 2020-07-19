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
		},
		r2p: function(r, p) {
			var _ = this._, s = _.scale, o = _.offsets;
			p = p || _.center;
			return {
				top: s * (o.z + p.z - r.z) + "px",
				left: s * (o.x + p.x - r.x) + "px",
				width: s * (r.x * 2) + "px",
				height: s * (r.z * 2) + "px"
			};
		}
	},
	tick: function() {
		var pz = zero.core.current.people, p;
		for (p in pz)
			pz[p].body.moving && this.update(p);
	},
	update: function(name) {
		var _ = this._, zcc = zero.core.current, r,
			n = _.people[name] || this.person(zcc.people[name]),
			s = n.style, p = n.person, b = p.body,
			rz = _.r2p(b.radii, b.position());
		for (r in rz)
			s[r] = rz[r];
	},
	place: function(obj, kind, pos) {
		var _ = this._, n = CT.dom.div(null, 
			kind, null, null, _.b2p(obj.bounds, pos));
		CT.dom.addContent(_.frame, n);
		return n;
	},
	person: function(p) {
		var b = p.body, n = this._.people[p.name] = this.place(b,
			p.name == zero.core.current.person.name
				? "person" : "people", b.position());
		n.person = p;
		return n;
	},
	unperson: function(name) {
		this._.people[name].remove();
		delete this._.people[name];
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
		var _ = this._, zcc = zero.core.current,
			r = zcc.room, k, o;
		this.frame(r.bounds);
		for (k of ["floor", "wall", "obstacle"])
			for (o in r[k])
				this.place(r[k][o], k);
		r.objects.forEach(o => this.place(o, "object"));
		Object.values(zcc.people).forEach(this.person);
		if (!this.ticking) {
			this.ticking = true;
			zero.core.util.ontick(this.tick);
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			node: document.body
		});
		opts.wait || this.refresh();
	}
});