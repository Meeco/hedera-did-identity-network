import { getMongoose } from "src/db/connection.service";
import { CreateEventDto } from "../dto/create.event.dto";

class EventsSDao {
  Schema = getMongoose().Schema;

  eventsSchema = new this.Schema(
    {
      _id: String,
      name: String,
    },
    { id: false }
  );

  event = getMongoose().model("Events", this.eventsSchema);

  constructor() {
    console.log("Created new instance of EventsDao");
  }

  async addEvent(EventFields: CreateEventDto) {
    const EventId = 1;
    const Event = new this.event({
      _id: EventId,
      ...EventFields,
    });
    await Event.save();
    return EventId;
  }

  async getEvents(limit = 25, page = 0) {
    return this.event
      .find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
}

export default new EventsSDao();
