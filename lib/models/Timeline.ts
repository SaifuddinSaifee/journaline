import { ObjectId, Collection } from 'mongodb';
import MongoDB from '../mongodb';
import { TimelineDocument, TimelineResponse, TimelineFormData } from '../types';

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

  static documentToResponse(doc: TimelineDocument): TimelineResponse {
    const { _id, ...rest } = doc;
    return {
      id: _id.toString(),
      ...rest,
    };
  }

  static async create(timelineData: TimelineFormData): Promise<TimelineResponse> {
    try {
      const collection = await this.getCollection();
      const now = new Date().toISOString();
      
      const document: Omit<TimelineDocument, '_id'> = {
        name: timelineData.name.trim(),
        description: timelineData.description?.trim() ?? '',
        groupPositions: {},
        groupOrder: [],
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
        .find({})
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
        updatedAt: new Date().toISOString(),
      };

      if (timelineData.name !== undefined) {
        updateData.name = timelineData.name.trim();
      }
      if (timelineData.description !== undefined) {
        updateData.description = timelineData.description.trim();
      }
      if (timelineData.groupPositions !== undefined) {
        updateData.groupPositions = timelineData.groupPositions;
      }
      if (timelineData.groupOrder !== undefined) {
        updateData.groupOrder = timelineData.groupOrder;
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
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting timeline:', error);
      throw new Error('Failed to delete timeline');
    }
  }
} 