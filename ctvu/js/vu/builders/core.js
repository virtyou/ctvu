vu.builders.current = {};

vu.builders.core = {
	init: function() {
		var _ = vu.builders[location.pathname.split("/").pop().split(".")[0]]._;
		core.config.ctzero.room = vu.core.room();
		zero.core.util.init();
		zero.core.util.join(_.raw, _.joined);
	}
};