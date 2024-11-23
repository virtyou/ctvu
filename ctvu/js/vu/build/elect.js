vu.build.elect = {
	_: {
		up: function() {
			var ro = zero.core.current.room.opts;
			vu.storage.setOpts(ro.key, { electrical: ro.electrical });
		},
		circ: function(circs, canRemove) {
			var zc = zero.core, vb = vu.build, _ = vb.elect._, saveUp = function() {
				_.up();
				vb.core.getSel().circuits.update();
				zc.Appliance.initCircuits(zc.current.room.opts.electrical.circuits);
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
			var vb = vu.build, vbc = vb.core, _ = vb.elect._, cont = [
				vbc.name(app),
				vbc.circuit(app, _.up),
				vbc.level(app, function(yval) {
					app.position[1] = yval;
					_.up();
				})
			];
			if (app.thing == "Panel") {

			} else { // Gate, Elevator, Bulb...

			}
			return cont;
		}
	},
	circuits: function() {
		var vb = vu.build, sel = vb.core.getSel().circuits = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel,
				vb.elect._.circ(zero.core.current.room.opts.electrical.circuits));
		};
		return CT.dom.div([
			"circuits",
			sel
		], "topbordered padded margined");
	},
	appliances: function() {
		var vb = vu.build, sel = vb.core.getSel().appliances = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel,
				zero.core.current.room.opts.electrical.appliances.map(vb.elect._.app));
		};
		return CT.dom.div([
			"appliances",
			sel
		], "topbordered padded margined");
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