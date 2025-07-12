import { ObjectId, Collection } from 'mongodb';
import MongoDB from '../mongodb';
import { EventDocument, EventResponse, EventFormData } from '../types';

export class EventModel {
  private static collection: Collection<EventDocument> | null = null;

  static async getCollection(): Promise<Collection<EventDocument>> {
    if (!this.collection) {
      const mongodb = MongoDB.getInstance();
      await mongodb.connect();
      const db = mongodb.getDb();
      this.collection = db.collection<EventDocument>('events');

      // Useful indexes
      await this.collection.createIndex({ date: 1 });
      await this.collection.createIndex({ timelineIds: 1 });
      await this.collection.createIndex({ createdAt: -1 });
    }
    return this.collection;
  }

  /* -----------------------------------------------------------------
   * Helpers
   * -----------------------------------------------------------------*/
  static documentToResponse(doc: EventDocument): EventResponse {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      date: doc.date.toISOString(),

      timelineIds: doc.timelineIds.map(id => id.toString()),

      tags: doc.tags,
      location: doc.location,
      metadata: doc.metadata,

      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : undefined,

      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
    };
  }

  /* -----------------------------------------------------------------
   * CRUD
   * -----------------------------------------------------------------*/
  static async create(eventData: EventFormData & { date: string }): Promise<EventResponse> {
    try {
      const collection = await this.getCollection();
      const now = new Date();

      const document: Omit<EventDocument, '_id'> = {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        date: new Date(eventData.date),

        timelineIds: eventData.timelineIds.map(id => new ObjectId(id)),

        tags: eventData.tags,
        location: eventData.location,
        metadata: eventData.metadata,

        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(document as EventDocument);
      const created = await collection.findOne({ _id: result.insertedId });

      if (!created) {
        throw new Error('Failed to retrieve created event');
      }

      return this.documentToResponse(created);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  static async findById(id: string): Promise<EventResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const document = await collection.findOne({ _id: new ObjectId(id) });

      return document ? this.documentToResponse(document) : null;
    } catch (error) {
      console.error('Error finding event by ID:', error);
      throw new Error('Failed to find event');
    }
  }

  static async findAll(): Promise<EventResponse[]> {
    try {
      const collection = await this.getCollection();
      const documents = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return documents.map(doc => this.documentToResponse(doc));
    } catch (error) {
      console.error('Error finding all events:', error);
      throw new Error('Failed to retrieve events');
    }
  }

  static async findEventsByTimelineId(timelineId: string): Promise<EventResponse[]> {
    try {
      if (!ObjectId.isValid(timelineId)) {
        return [];
      }
      const collection = await this.getCollection();
      const documents = await collection
        .find({ timelineIds: new ObjectId(timelineId) })
        .sort({ date: -1 })
        .toArray();

      return documents.map(doc => this.documentToResponse(doc));
    } catch (error) {
      console.error('Error finding events by timeline ID:', error);
      throw new Error('Failed to retrieve events by timeline ID');
    }
  }

  static async update(id: string, eventData: Partial<EventFormData>): Promise<EventResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const updateData: Partial<EventDocument> = {
        updatedAt: new Date(),
      };

      if (eventData.title !== undefined) {
        updateData.title = eventData.title.trim();
      }
      if (eventData.description !== undefined) {
        updateData.description = eventData.description.trim();
      }
      if (eventData.timelineIds !== undefined) {
        updateData.timelineIds = eventData.timelineIds.map(id => new ObjectId(id));
      }
      if (eventData.date !== undefined) {
        updateData.date = new Date(eventData.date);
      }
      if (eventData.tags !== undefined) {
        updateData.tags = eventData.tags;
      }
      if (eventData.location !== undefined) {
        updateData.location = eventData.location;
      }
      if (eventData.metadata !== undefined) {
        updateData.metadata = eventData.metadata;
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result ? this.documentToResponse(result) : null;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  static async findByDateRange(startDate: string, endDate: string): Promise<EventResponse[]> {
    try {
      const collection = await this.getCollection();
      const start = new Date(startDate);
      const end = new Date(endDate);

      const documents = await collection
        .find({
          date: {
            $gte: start,
            $lte: end,
          },
        })
        .sort({ date: -1 })
        .toArray();

      return documents.map(doc => this.documentToResponse(doc));
    } catch (error) {
      console.error('Error finding events by date range:', error);
      throw new Error('Failed to retrieve events by date range');
    }
  }
} 