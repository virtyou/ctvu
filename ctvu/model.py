from cantools import db

# add Resource.owner right??

class Resource(db.TimeStampedBase):
	variety = db.String(choices=["image", "background", "audio", "video"])
	name = db.String()
	item = db.Binary(unique=True)

class Scene(db.TimeStampedBase):
	owners = db.ForeignKey(kind="member", repeated=True)
	name = db.String()
	description = db.Text()
	room = db.ForeignKey(kind="room")
	actors = db.ForeignKey(kind="person", repeated=True)
	props = db.JSON() # state/interactivity map - room items
	scripts = db.JSON() # trigger "start" on load

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
	portals = db.JSON() # { portalA: { doorX: portalB } }
	initial = db.JSON()
	victory = db.JSON()
	defeat = db.JSON()
	live = db.Boolean(default=False) # games page list

class Adventure(db.TimeStampedBase):
	owner = db.ForeignKey(kind="member")
	player = db.ForeignKey(kind="person")
	game = db.ForeignKey(kind=Game)
	state = db.JSON()

	def oncreate(self):
		self.state = self.game.get().initial

	def json(self):
		return {
			"key": self.id(),
			"state": self.state,
			"game": self.game.get().data(),
			"player": self.player.get().json()
		}