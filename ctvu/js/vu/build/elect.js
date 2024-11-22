vu.build.elect = {
	_: {
		circ: function(circs, canRemove) {
			var zc = zero.core, vb = vu.build, saveUp = function() {
				// TODO : save!
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
					CT.dom.div(vb.elect._.circ(circs[c], true), "tabbed")
				]);
			}), "bordered");
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
		var sel = vu.build.core.getSel().appliances = CT.dom.div();
		sel.update = function() {
			// TODO : something real...
			CT.dom.setContent(sel,
				zero.core.current.room.opts.electrical.appliances.map(a => a.name));
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