from cantools.web import respond, succeed, fail, cgi_get, read_file
from ctone.spawners import person, thing, asset, room
from model import db, Member, Person, Room, Resource

def response():
	action = cgi_get("action", choices=["person", "import", "thing", "resource", "asset", "room", "ready", "share"])
	if action == "resource":
		url = cgi_get("url")
		r = Resource.query(Resource.url == url).get()
		if not r:
			r = Resource(variety=cgi_get("variety"), url=url,
				kind=cgi_get("kind"), name=cgi_get("name"))
			r.put()
		succeed(r.json())
	if action == "asset":
		succeed(asset(cgi_get("name"),
			variety=cgi_get("variety"),
			owner=cgi_get("owner"),
			data=read_file(cgi_get("data")),
			kind=cgi_get("kind"),
			exalt=Resource).get().json())
	if action == "room":
		succeed(room(cgi_get("name"), cgi_get("owner"),
			cgi_get("environment", required=False),
			cgi_get("cameras", default=[]),
			cgi_get("opts", default={})).json())
	if action == "thing": # should thing/person return json() as well?
		succeed(thing(cgi_get("data"), cgi_get("owner")).data())
	if action == "person":
		succeed(person(cgi_get("name"), cgi_get("owner"), cgi_get("responses", default={})).data())
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
		for item in ["vibe", "gestures", "dances", "responses"]:
			setattr(pto, item, getattr(pfrom, item))
		ptbod.morphs = pfbod.morphs
		db.put_multi([pto, ptbod])
	if action == "share":
		p = Member.query(Member.email == cgi_get("email")).get()
		if not p:
			fail("no member with that email :(")
		c = db.get(cgi_get("content"))
		if p.key in c.owners:
			fail("already sharing with that person!")
		c.owners = c.owners + [p.key]
		c.put()

respond(response)