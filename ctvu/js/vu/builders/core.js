vu.builders.core = {
	init: function() {
		var pname = location.pathname.split("/").pop().split(".")[0],
			_ = vu.builders[pname]._;
		core.config.ctzero.room = vu.core.room();
		if (["item", "arcraft"].includes(pname)) {
			["texture", "objects", "obstacle", "floor", "wall", "ramp"].forEach(function(item) {
				delete core.config.ctzero.room[item];
			});
		}
		zero.core.util.init();
		if (pname == "item")
			zero.core.camera.move({ x: 0, y: 0, z: 200 });
		if (["zone", "item", "arcraft"].includes(pname))
			CT.dom.addContent("ctheader", _.linx());
		else {
			if (pname == "play")
				vu.live.init(_.cbs);
			else
				zero.core.util.join(_.raw, _.joined);
			CT.dom.addContent("ctheader", vu.core.charlinx());
		}
	}
};