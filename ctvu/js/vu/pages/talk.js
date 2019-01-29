CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.dom");
CT.require("CT.file");
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
CT.require("vu.builders.core");
CT.require("vu.builders.talk");
CT.setVal("mapkey", CT.data.choice(core.config.geo.keys));
CT.require("CT.map", true);

CT.onload(function() {
	CT.initCore();
	vu.storage.init(function() {
		// menu
		CT.dom.setContent("menu", vu.builders.talk.menu());
		// virtual world
		vu.builders.core.init(true);
	});
});