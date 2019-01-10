CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.dom");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");
CT.require("vu.storage");

if (!(core.config.ctvu.access.anon || user.core.get()))
	location = "/user/login.html";

CT.onload(function() {
	CT.initCore();
	vu.core.udata(function(data) {
		var P = data.people[0],
			raw = zero.core.util.person(vu.core.bgen(P.body), P.name, null, P, P.body);
		core.config.ctzero.room = CT.merge(data.rooms[0], core.config.ctzero.room);
		zero.core.util.init();
		zero.core.util.join(raw, zero.core.camera.unfollow);
	});
});