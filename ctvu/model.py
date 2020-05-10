from cantools import db

class Resource(db.TimeStampedBase):
	variety = db.String(choices=["image", "background", "audio", "video"])
	name = db.String()
	item = db.Binary(unique=True)

class Scene(db.TimeStampedBase):
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
			"room": self.room.json(),
			"actors": [a.json() for a in db.get_multi(self.actors)],
			"props": self.props,
			"scripts": self.scripts
		}

class Game(db.TimeStampedBase):
	name = db.String()
	description = db.Text()
	scenes = db.ForeignKey(kind=Scene, repeated=True)
	initial = db.JSON()
	victory = db.JSON()
	defeat = db.JSON()

class Adventure(db.TimeStampedBase):
	game = db.ForeignKey(kind=Game)
	players = db.ForeignKey(kind="Person", repeated=True)
	state = db.JSON() # start @ game.initial{}