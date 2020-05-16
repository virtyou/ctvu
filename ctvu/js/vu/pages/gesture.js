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
CT.require("vu.controls");
CT.require("vu.storage");
CT.require("vu.menu.Body");
CT.require("vu.builders.core");
CT.require("vu.builders.gesture");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(function() {
		// menu
		vu.builders.gesture.menus();
		// virtual world
		vu.builders.core.init();
	});
});