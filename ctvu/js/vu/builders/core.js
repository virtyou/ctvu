vu.builders.current = {};

vu.builders.core = {
	init: function() {
		var pname = location.pathname.split("/").pop().split(".")[0],
			_ = vu.builders[pname]._;
		core.config.ctzero.room = vu.core.room();
		zero.core.util.init();
		if (pname == "zone") {
			// load up zone selector!!!!
		} else if (pname == "item")
			CT.dom.addContent("ctheader", _.linx());
		else {
			zero.core.util.join(_.raw, _.joined);
			CT.dom.addContent("ctheader", vu.core.charlinx());
		}
	}
};