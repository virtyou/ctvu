vu.builders.current = {};

vu.builders.core = {
	init: function(noPerson, noRoom) {
		var _ = vu.builders[location.pathname.split("/").pop().split(".")[0]]._;
		if (!noRoom)
			core.config.ctzero.room = vu.core.room();
		zero.core.util.init();
		if (!noPerson) {
			zero.core.util.join(_.raw, _.joined);
			CT.dom.addContent("ctheader", vu.core.charlinx());
		}
	}
};