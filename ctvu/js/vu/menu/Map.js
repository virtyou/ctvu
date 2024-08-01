vu.menu.Map = CT.Class({
	CLASSNAME: "vu.menu.Map",
	_: {
		structurals: ["floor", "wall", "ramp", "obstacle"],
		center: { x: 0, z: 0 },
		styler: {},
		b2p: function(bz, p) {
			var _ = this._, s = _.scale, o = _.offsets,
				min = bz.min, max = bz.max, styler = _.styler;
			p = p || _.center;
			styler.top = s * (min.z + o.z + p.z) + "px";
			styler.left = s * (min.x + o.x + p.x) + "px";
			styler.width = s * (max.x - min.x) + "px";
			styler.height = s * (max.z - min.z) + "px";
			return styler;
		},
		r2p: function(r, p) {
			var _ = this._, s = _.scale, o = _.offsets, styler = _.styler;
			p = p || _.center;
			styler.top = s * (o.z + p.z - r.z) + "px";
			styler.left = s * (o.x + p.x - r.x) + "px";
			styler.width = s * (r.x * 2) + "px";
			styler.height = s * (r.z * 2) + "px";
			return styler;
		},
		upstyle: function(s, ups) {
			for (var up in ups)
				s[up] = ups[up];
		}
	},
	tick: function() {
		var zcc = zero.core.current, pz = zcc.people,
			p, mon, mons = this._.monsters;
		if (zcc.room && zcc.room.isReady()) {
			for (p in pz)
				pz[p].body.moving && this.update(p);
			for (p in this._.movers)
				this.move(p);
			for (mon in mons)
				this.creep(mons[mon]);
		}
	},
	creep: function(monblip) {
		var _ = this._, b = monblip.monster;
		_.upstyle(monblip.style, _.r2p(b.radii, b.position()));
	},
	move: function(name) {
		var _ = this._, b = zero.core.current.room[name];
		_.upstyle(_.movers[name].style, _.b2p(b.bounds));
	},
	update: function(name) {
		var _ = this._, p = zero.core.current.people[name],
			n = _.people[name] || this.person(p), b = p.body;
		_.upstyle(n.style, _.r2p(b.radii, b.position()));
	},
	place: function(obj, kind, pos) {
		var _ = this._, n = CT.dom.div(null, 
			kind, null, null, _.b2p(obj.bounds, pos));
		CT.dom.addContent(_.frame, n);
		if (kind == "object") {
			if (obj.opts.key == zero.core.current.injector)
				n.classList.add("entrance");
			else if (vu.portal && obj.name in vu.portal.options())
				n.classList.add("portal");
		} else if (kind == "floor" && obj.opts.shift)
			_.movers[obj.name] = n;
		return n;
	},
	help: function(p) {
		var per = this._.people[p.name];
		if (!per) return this.log("can't find " + p.name);
		per.style.background = p.helpMe ? "red" : "green";
	},
	monster: function(mon) {
		var mons = this._.monsters;
		mons[mon.name] = this.place(mon, "monster", mon.position());
		mons[mon.name].monster = mon;
	},
	person: function(p) {
		this._.people[p.name] = this.place(p.body,
			p.name == zero.core.current.person.name
				? "person" : "people", p.body.position());
		return this._.people[p.name];
	},
	unperson: function(name) {
		var pz = this._.people;
		if (pz[name]) {
			pz[name].remove();
			delete pz[name];
		}
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
		n.style.height = 4 + (wp / r) + "px";
	},
	buttons: function() {
		var oz = this.opts, bz = oz.buttons, bkeys = Object.keys(bz);
		oz.node.insertBefore(CT.dom.div(bkeys.map(b => CT.dom.button(b,
			bz[b])), "right up15"), this._.frame);
	},
	refresh: function() {
		var _ = this._, zcc = zero.core.current, r = zcc.room,
			k, o, oz = this.opts, onready = oz.onready;
		if (!r.bounds)
			return setTimeout(this.refresh, 500);
		_.people = {};
		_.monsters = {};
		_.movers = {};
		this.frame(r.bounds);
		for (k of _.structurals)
			for (o in r[k])
				this.place(r[k][o], k);
		r.objects.forEach(o => o.onReady(() => this.place(o, "object")));
		Object.values(zcc.people).forEach(this.person);
		if (!this.ticking) {
			this.ticking = true;
			zero.core.util.ontick(this.tick);
		}
		oz.buttons && this.buttons();
		onready && onready();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			node: document.body
		});
		opts.wait || this.refresh();
	}
});