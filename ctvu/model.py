from cantools import db

# change all owners, CTUser->Member asap!
# add Resource.owner right??

class Resource(db.TimeStampedBase):
	variety = db.String(choices=["image", "background", "audio", "video"])
	name = db.String()
	item = db.Binary(unique=True)

class Scene(db.TimeStampedBase):
	owners = db.ForeignKey(kind="CTUser", repeated=True)
	name = db.String()
	description = db.Text()
	room = db.ForeignKey(kind="Room")
	actors = db.ForeignKey(kind="Person", repeated=True)
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
	owners = db.ForeignKey(kind="CTUser", repeated=True)
	name = db.String()
	description = db.Text()
	scenes = db.ForeignKey(kind=Scene, repeated=True)
	players = db.ForeignKey(kind="Person", repeated=True)
	initial = db.JSON()
	victory = db.JSON()
	defeat = db.JSON()
	live = db.Boolean(default=False) # games page list

class Adventure(db.TimeStampedBase):
	owner = db.ForeignKey(kind="CTUser")
	game = db.ForeignKey(kind=Game)
	state = db.JSON() # start @ game.initial{}

	def json(self):
		gd = self.game.get().data()
		gd['players'] = [p.json() for p in db.get_multi(gd['players'])]
		return {
			"key": self.id(),
			"game": gd,
			"state": self.state
		}