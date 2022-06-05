from cantools.web import respond, succeed, fail, cgi_get, read_file
from ctone.spawners import person, thing, asset, room, exists
from model import db, Member, Person, Room, Resource, Augmentation
from cantools import config

CALLMSG = '%s is calling! Click <a href="https://%s/vu/chat.html#%s">here</a> to talk.'

def response():
	action = cgi_get("action", choices=["person", "import", "thing", "resource", "asset", "augmentation", "room", "ready", "share", "call"])
	if action == "resource":
		key = cgi_get("key", required=False)
		dkey = cgi_get("data", required=False)
		data = dkey and read_file(dkey)
		r = data and exists(data, Resource)
		r and succeed(r.json())
		if key:
			r = db.get(key)
			if r.item: # preserve original...
				r = Resource(name=r.name + "_", kind=r.kind,
					variety=r.variety, owners=r.owners)
			r.item = data
			r.put()
			succeed(r.json())
		name = cgi_get("name")
		variety = cgi_get("variety")
		kind = cgi_get("kind", required=False)
		if data:
			owners = cgi_get("owners", required=False) or [cgi_get("owner")]
			r = Resource(variety=variety, owners=owners,
				name=name, kind=kind, item=data)
			r.put()
		else:
			url = cgi_get("url")
			r = Resource.query(Resource.url == url).get()
			if not r:
				r = Resource(variety=variety,
					name=name, kind=kind, url=url)
				r.put()
		succeed(r.json())
	if action == "asset":
		succeed(asset(cgi_get("name"),
			variety=cgi_get("variety"),
			owner=cgi_get("owner"),
			data=read_file(cgi_get("data")),
			kind=cgi_get("kind"),
			exalt=Resource).get().json())
	if action == "augmentation":
		aug = Augmentation(owners=cgi_get("owners"), name=cgi_get("name"))
		aug.put()
		succeed(aug.data())
	if action == "room":
		succeed(room(cgi_get("name"), cgi_get("owner"),
			cgi_get("environment", required=False),
			cgi_get("cameras", default=[]),
			cgi_get("opts", default={})).json())
	if action == "thing": # should thing/person return json() as well?
		succeed(thing(cgi_get("data"), cgi_get("owner")).data())
	if action == "person":
		succeed(person(cgi_get("name"), cgi_get("owner"), cgi_get("responses", default={})).json())
	if action == "ready":
		user = cgi_get("user")
		succeed({
			"person": not not Person.query(Person.owners.contains(user)).count(),
			"room": not not Room.query(Room.owners.contains(user)).count()
		})
	if action == "import":
		pfrom = db.get(cgi_get("from"))
		pto = db.get(cgi_get("to"))
		pfbod = pfrom.body.get()
		ptbod = pto.body.get()
		for item in ["mood", "vibe", "mods", "gear", "dances", "gestures", "responses"]:
			setattr(pto, item, getattr(pfrom, item))
		ptbod.morphs = pfbod.morphs
		db.put_multi([pto, ptbod])
	# below for share/call only!!
	p = Member.query(Member.email == cgi_get("email")).get()
	if not p:
		fail("no member with that email :(")
	if action == "share":
		c = db.get(cgi_get("content"))
		if p.key in c.owners:
			fail("already sharing with that person!")
		c.owners = c.owners + [p.key]
		c.put()
	if action == "call":
		caller = db.get(cgi_get("caller"))
		p.notify("call from %s"%(caller.firstName,),
			CALLMSG%(caller.firstName, config.web.domain, caller.key.urlsafe()))

respond(response)