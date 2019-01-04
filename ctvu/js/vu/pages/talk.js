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
CT.require("vu.storage");
CT.require("vu.builders");
CT.require("custom.earring");
CT.require("custom.pony");
CT.require("templates.torso");

CT.onload(function() {
	CT.initCore();
	vu.storage.init(function() {
		// menu
		CT.dom.setContent("menu", vu.builders.person.menu());
		// virtual world
		vu.builders.init();
	});
});