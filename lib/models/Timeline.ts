import { ObjectId, Collection } from 'mongodb';
import MongoDB from '../mongodb';
import { TimelineDocument, TimelineResponse, TimelineFormData } from '../types';
import { EventModel } from './Event';

export class TimelineModel {
  private static collection: Collection<TimelineDocument> | null = null;

  static async getCollection(): Promise<Collection<TimelineDocument>> {
    if (!this.collection) {
      const mongodb = MongoDB.getInstance();
      await mongodb.connect();
      const db = mongodb.getDb();
      this.collection = db.collection<TimelineDocument>('timelines');

      await this.collection.createIndex({ name: 1 });
      await this.collection.createIndex({ createdAt: -1 });
    }
    return this.collection;
  }

  /* -----------------------------------------------------------------
   * Helpers
   * -----------------------------------------------------------------*/
  static documentToResponse(doc: TimelineDocument): TimelineResponse {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      groupOrder: doc.groupOrder,
      sortPreference: doc.sortPreference,
      origin: doc.origin?.map(o => ({
        timelineId: o.timelineId.toString(),
        date: o.date.toISOString(),
      })),
      color: doc.color,
      isArchived: doc.isArchived,
      publish: doc.publish,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      createdBy: doc.createdBy?.toString(),
      updatedBy: doc.updatedBy?.toString(),
    };
  }

  /* -----------------------------------------------------------------
   * CRUD
   * -----------------------------------------------------------------*/
  static async create(timelineData: TimelineFormData): Promise<TimelineResponse> {
    try {
      const collection = await this.getCollection();
      const now = new Date();

      const document: Omit<TimelineDocument, '_id'> = {
        name: (timelineData.name ?? '').trim(),
        description: timelineData.description?.trim(),
        groupOrder: timelineData.groupOrder ?? [],
        sortPreference: timelineData.sortPreference ?? { field: 'date', order: 'desc' },
        color: timelineData.color,
        isArchived: timelineData.isArchived ?? false,
        publish: timelineData.publish ?? true,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(document as TimelineDocument);
      const created = await collection.findOne({ _id: result.insertedId });

      if (!created) {
        throw new Error('Failed to retrieve created timeline');
      }

      return this.documentToResponse(created);
    } catch (error) {
      console.error('Error creating timeline:', error);
      throw new Error('Failed to create timeline');
    }
  }

  static async findById(id: string): Promise<TimelineResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const document = await collection.findOne({ _id: new ObjectId(id) });

      return document ? this.documentToResponse(document) : null;
    } catch (error) {
      console.error('Error finding timeline by ID:', error);
      throw new Error('Failed to find timeline');
    }
  }

  static async findAll(): Promise<TimelineResponse[]> {
    try {
      const collection = await this.getCollection();
      const documents = await collection
        // Only return timelines that are not archived by default
        .find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .toArray();

      return documents.map(doc => this.documentToResponse(doc));
    } catch (error) {
      console.error('Error finding all timelines:', error);
      throw new Error('Failed to retrieve timelines');
    }
  }

  static async update(id: string, timelineData: Partial<TimelineFormData>): Promise<TimelineResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const updateData: Partial<TimelineDocument> = {
        updatedAt: new Date(),
      };

      if (timelineData.name !== undefined) {
        updateData.name = timelineData.name.trim();
      }
      if (timelineData.description !== undefined) {
        updateData.description = timelineData.description.trim();
      }
      if (timelineData.groupOrder !== undefined) {
        updateData.groupOrder = timelineData.groupOrder;
      }
      if (timelineData.sortPreference !== undefined) {
        updateData.sortPreference = timelineData.sortPreference;
      }
      if (timelineData.color !== undefined) {
        updateData.color = timelineData.color;
      }
      if (timelineData.isArchived !== undefined) {
        updateData.isArchived = timelineData.isArchived;
      }
      if (timelineData.publish !== undefined) {
        updateData.publish = timelineData.publish;
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result ? this.documentToResponse(result) : null;
    } catch (error) {
      console.error('Error updating timeline:', error);
      throw new Error('Failed to update timeline');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const collection = await this.getCollection();
      // Soft-delete (archive) the timeline instead of permanently removing it
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isArchived: true, updatedAt: new Date() } }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error deleting timeline:', error);
      throw new Error('Failed to delete timeline');
    }
  }

  static async fork(id: string): Promise<TimelineResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const originalTimeline = await collection.findOne({ _id: new ObjectId(id) });

      if (!originalTimeline) {
        return null;
      }

      const now = new Date();

      const newTimelineDocument: Omit<TimelineDocument, '_id'> = {
        name: `Copy of ${originalTimeline.name}`,
        description: originalTimeline.description,
        groupOrder: originalTimeline.groupOrder,
        sortPreference: originalTimeline.sortPreference,
        color: originalTimeline.color,
        isArchived: false,
        publish: false,
        createdAt: now,
        updatedAt: now,
        origin: [
          { timelineId: originalTimeline._id, date: now },
          ...(originalTimeline.origin || []),
        ],
      };

      const result = await collection.insertOne(newTimelineDocument as TimelineDocument);
      const newTimelineId = result.insertedId;

      const eventCollection = await EventModel.getCollection();
      await eventCollection.updateMany(
        { timelineIds: originalTimeline._id },
        { $addToSet: { timelineIds: newTimelineId } }
      );

      const created = await collection.findOne({ _id: newTimelineId });
      if (!created) {
        throw new Error('Failed to retrieve forked timeline');
      }

      return this.documentToResponse(created);
    } catch (error) {
      console.error('Error forking timeline:', error);
      throw new Error('Failed to fork timeline');
    }
  }
} 