vu.menu.Map = CT.Class({
	CLASSNAME: "vu.menu.Map",
	_: {
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
		var zcc = zero.core.current, pz = zcc.people, p;
		if (zcc.room && zcc.room.isReady()) {
			for (p in pz)
				pz[p].body.moving && this.update(p);
			for (p in this._.movers)
				this.move(p);
		}
	},
	move: function(name) {
		var _ = this._, s = _.movers[name].style, r,
			rz = _.b2p(zero.core.current.room[name].bounds);
		for (r in rz)
			s[r] = rz[r];
	},
	update: function(name) {
		var _ = this._, zcc = zero.core.current, r,
			n = _.people[name] || this.person(zcc.people[name]),
			s = n.style, p = zcc.people[name], b = p.body,
			rz = _.r2p(b.radii, b.position());
		for (r in rz)
			s[r] = rz[r];
	},
	place: function(obj, kind, pos) {
		var _ = this._, n = CT.dom.div(null, 
			kind, null, null, _.b2p(obj.bounds, pos));
		CT.dom.addContent(_.frame, n);
		if (kind == "floor" && obj.opts.shift)
			_.movers[obj.name] = n;
		return n;
	},
	person: function(p) {
		this._.people[p.name] = this.place(p.body,
			p.name == zero.core.current.person.name
				? "person" : "people", p.body.position());
		return this._.people[p.name];
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
		_.people = {};
		_.movers = {};
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