from cantools import db

class Resource(db.TimeStampedBase):
	owners = db.ForeignKey(kind="member", repeated=True)
	variety = db.String(choices=["image", "background", "audio", "video"])
	kind = db.String() # audio[music,ambient,fx] or tx
	name = db.String()
	url = db.String()
	item = db.Binary(unique=True)

	def json(self):
		d = self.data()
		d['item'] = self.path()
		return d

	def path(self):
		return self.url or self.item.urlsafe()

class Scene(db.TimeStampedBase):
	owners = db.ForeignKey(kind="member", repeated=True)
	name = db.String()
	description = db.Text()
	room = db.ForeignKey(kind="room")
	actors = db.ForeignKey(kind="person", repeated=True)
	props = db.JSON(default={}) # state/interactivity map - room items
	scripts = db.JSON(default={}) # trigger "start" on load

	def json(self):
		return {
			"key": self.id(),
			"name": self.name,
			"description": self.description,
			"room": self.room.get().json(),
			"actors": [a.json() for a in db.get_multi(self.actors)],
			"props": self.props,
			"scripts": self.scripts
		}

class Game(db.TimeStampedBase):
	owners = db.ForeignKey(kind="member", repeated=True)
	name = db.String()
	description = db.Text()
	scenes = db.ForeignKey(kind=Scene, repeated=True)
	players = db.ForeignKey(kind="person", repeated=True)
	portals = db.JSON(default={}) # { portalA: { doorX: portalB } }
	initial = db.JSON(default={})
	victory = db.JSON(default={})
	defeat = db.JSON(default={})
	live = db.Boolean(default=False) # games page list

	def json(self):
		return self.data()

# TODO: support multi (owners[] etc)
class Adventure(db.TimeStampedBase):
	owner = db.ForeignKey(kind="member")
	player = db.ForeignKey(kind="person")
	game = db.ForeignKey(kind=Game)
	state = db.JSON(default={})

	def oncreate(self):
		self.state = self.game.get().initial

	def json(self):
		return {
			"key": self.id(),
			"state": self.state,
			"game": self.game.get().data(),
			"player": self.player.get().json()
		}