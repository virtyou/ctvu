CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("CT.cc");
CT.require("user.core");
CT.require("zero.core");
var zcar = zero.core.ar;
zcar.init();

CT.onload(function() {
	CT.initCore();
	var h = location.hash.slice(1);
	if (h)
		CT.db.one(h, zcar.start);
	else {
		CT.require("templates.one.ar", true);
		zcar.start(templates.one.ar);
	}
});