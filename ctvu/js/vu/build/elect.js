vu.build.elect = {
	_: {
		up: function() {
			var ro = vu.build.elect._.opts();
			vu.storage.setOpts(ro.key, { electrical: ro.electrical });
		},
		prup: function(tar, prop) {
			var _ = vu.build.elect._, toz = tar.opts;
			_.aopts(toz.kind).parts[toz.index][prop] = toz[prop];
			_.up();
		},
		opts: function(sub) {
			var opts = zero.core.current.room.opts;
			return sub ? opts[sub] : opts;
		},
		eopts: function(sub) {
			var opts = vu.build.elect._.opts("electrical");
			return sub ? opts[sub] : opts;
		},
		aopts: function(sub) {
			var opts = vu.build.elect._.eopts("appliances");
			return sub ? opts[sub] : opts;
		},
		circ: function(circs, canRemove) {
			var zc = zero.core, vb = vu.build, _ = vb.elect._, saveUp = function() {
				_.up();
				vb.core.getSel().circuits.update();
				zc.Appliance.initCircuits(_.eopts("circuits"));
			};
			return CT.dom.div(Object.keys(circs).map(function(c) {
				return CT.dom.div([
					canRemove && CT.dom.link("-", function() {
						if (!confirm("really remove this circuit?")) return;
						delete circs[c];
						saveUp();
					}, null, "right red"),
					CT.dom.link("+", function() {
						CT.modal.prompt({
							prompt: "what's the new circuit called?",
							cb: function(cname) {
								circs[c][cname] = {};
								saveUp();
							}
						});
					}, null, "right green"),
					c,
					CT.dom.div(_.circ(circs[c], true), "tabbed")
				]);
			}), "bordered");
		},
		app: function(app) {
			var vb = vu.build, lec = vb.elect, _ = lec._, saveUp = function(prop) {
				_.prup(app, prop);
			}, vbc = vb.core, aoz = app.opts, k = aoz.kind, isbulb = k == "bulb",
				isgate = k == "gate", rdim = isbulb ? "x" : "y", cont;
			cont = [
				CT.dom.br(),
				vbc.name(app),
				vbc.level(app, function(yval) {
					aoz.position[1] = yval;
					saveUp("position");
				}),
				vbc.rot(app, rdim, function(rval) {
					aoz.rotation[isbulb ? 0 : 1] = rval;
					saveUp("rotation");
				}, isgate),
				vbc.circuit(app, function(circ) {
					saveUp("circuit");
					app.plug(circ);
				})
			];
			// TODO : bulb color ; elevator targets[]
			if (isgate) // TODO: width/height ; door{}
				cont.push(vbc.opener(app, () => saveUp("opener")));
			else if (k == "panel")
				cont.push(lec.controls.panel(app, saveUp));
			return cont;
		},
		apps: function(cat) {
			var r = zero.core.current.room, anames = Object.keys(r[cat] || {}), athing,
				_ = vu.build.elect._, cont = CT.dom.div(anames.map(a => _.app(r[a])));
			return CT.dom.div([
				CT.dom.button("add", function() {
					athing = r.attach(r.elecPart(cat));
					athing.onReady(() => CT.dom.addContent(cont, _.app(athing)));
					r.elecBase(cat).parts.push({});
					_.up();
				}, "right"),
				cat,
				cont
			], "topbordered pv10");
		}
	},
	controls: {
		butter: function(cb) {
			var r = zero.core.current.room, odata,
				appkinds = ["bulb", "gate", "elevator"].filter(k=>r[k]);
			CT.modal.choice({
				prompt: "what kind of appliance?",
				data: appkinds,
				cb: function(akind) {
					CT.modal.choice({
						prompt: "which one?",
						data: Object.keys(r[akind]),
						cb: function(aname) {
							if (akind == "gate")
								odata = ["swing", "slide", "squish"];
							else if (akind == "elevator")
								odata = r[aname].opts.targets;
							else // TODO : bulb color!
								return alert("sorry, unimplemented!");
							CT.modal.choice({
								prompt: "what's the order?",
								data: odata,
								cb: order => cb(aname, order)
							});
						}
					});
				}
			});
		},
		button: function(butt, cb) { // [{appliance,order}]
			var swapper = CT.dom.link(null, function() {
				vu.build.elect.controls.butter(function(appliance, order) {
					butt.appliance = appliance;
					butt.order = order;
					swapper.refresh();
					cb();
				});
			}, "centered block");
			swapper.refresh = function() {
				CT.dom.setContent(swapper, butt.appliance + " : " + butt.order);
			};
			swapper.refresh();
			return swapper;
		},
		flipper: function(item, cb) { // [{circuit}]
			return vu.build.core.circuit(item, cb, true);
		},
		strip: function(pan, kind, cb) {
			var cons = vu.build.elect.controls, cber = () => cb(kind), adder = function(item) {
				pan.opts[kind].push(item);
				cber();
			}, kinder = cons[kind] || cons.flipper,
				toggler = item => kinder(item, cber);
			return CT.dom.div([
				CT.dom.button("add", function() {
					if (kind == "button") {
						cons.butter(function(appliance, order) {
							adder({ appliance: appliance, order: order });
						});
					} else { // switch/lever
						CT.modal.choice({
							prompt: "what circuit?",
							data: Object.keys(zero.core.Appliance.circuitry),
							cb: function(circ) {
								adder({ circuit: circ });
							}
						});
					}
				}, "right"),
				kind,
				pan.opts[kind].map(toggler)
			], "clearnode");
		},
		panel: function(pan, cb) {
			var n = CT.dom.div(), fullCb = function(kind) {
				// TODO: refresh pan itself!
				n.refresh();
				cb(kind);
			}, strip = vu.build.elect.controls.strip;
			n.refresh = function() {
				CT.dom.setContent(n, pan.kinds.map(k => strip(pan, k, fullCb)));
			};
			n.refresh();
			return n;
		}
	},
	varieties: ["panel", "bulb", "gate", "elevator"],
	posup: function(target) {
		vu.build.elect._.prup(target, "position");
	},
	circuits: function() {
		var vb = vu.build, _ = vb.elect._,
			sel = vb.core.getSel().circuits = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel, _.circ(_.eopts("circuits")));
		};
		return CT.dom.div([
			"circuits",
			sel
		], "topbordered pv10");
	},
	appliances: function() {
		var vb = vu.build, lec = vb.elect,
			sel = vb.core.getSel().appliances = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel, lec.varieties.map(lec._.apps));
		};
		return CT.dom.div([
			"appliances",
			sel
		], "topbordered pv10");
	},
	electrical: function() {
		var vb = vu.build, lec = vb.elect, sel = CT.dom.div([
			"Electrical",
			lec.circuits(),
			lec.appliances()
		]), selz = vb.core.getSel();
		selz.electrical = sel;
		sel.update = function() {
			selz.circuits.update();
			selz.appliances.update();
		};
	}
};