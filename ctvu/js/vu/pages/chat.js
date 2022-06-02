CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.pubsub");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");
CT.require("vu.storage");
CT.require("vu.lang");
CT.require("vu.live");
CT.require("vu.builders.core");
CT.require("vu.builders.chat");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(function() {
		vu.builders.chat.menus();
		vu.builders.core.init();
	}, true);
});