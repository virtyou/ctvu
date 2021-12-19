vu.builders.core = {
	init: function() {
		var pname = location.pathname.split("/").pop().split(".")[0],
			_ = vu.builders[pname]._, isiora = ["item", "arcraft"].includes(pname);
		core.config.ctzero.room = vu.core.room();
		isiora && ["environment", "texture", "objects", "obstacle", "floor", "wall", "ramp"].forEach(function(item) {
			delete core.config.ctzero.room[item];
		});
		if (pname == "arcraft") {
			delete core.config.ctzero.room.scale;
			delete core.config.ctzero.room.lights;
			core.config.ctzero.gravity = false;
		}
		zero.core.util.init();
		isiora && zero.core.camera.move({
			x: 0, y: 0, z: pname == "item" && 200 || 10
		});
		if (isiora || pname == "zone" || pname == "pop")
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