import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserDb } from '@/lib/user-db';
import { ObjectId } from 'mongodb';

// This endpoint is designed to be used by OpenAI's custom GPT integrations
// It allows CRUD operations on a user's database via a secure API
export async function POST(req: NextRequest) {
  try {
    // Basic API key auth - in production, use a more robust solution
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const providedKey = authHeader.substring(7);
    if (providedKey !== process.env.AI_API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validate the request
    if (!data.userId || !data.operation || !data.collection) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, operation, and collection are required' 
      }, { status: 400 });
    }
    
    const { userId, operation, collection, document, query, update } = data;
    
    // Get the user's database
    const userDb = await getUserDb(userId);
    if (!userDb) {
      return NextResponse.json({ error: 'User database not found' }, { status: 404 });
    }
    
    // Check if the requested collection exists
    const collections = await userDb.listCollections({ name: collection }).toArray();
    if (collections.length === 0) {
      return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });
    }
    
    const dbCollection = userDb.collection(collection);
    
    // Perform the requested operation
    switch (operation) {
      case 'create':
        if (!document) {
          return NextResponse.json({ error: 'Document is required for create operation' }, { status: 400 });
        }
        
        // Add metadata to the document
        const docWithMetadata = {
          ...document,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const insertResult = await dbCollection.insertOne(docWithMetadata);
        return NextResponse.json({ 
          success: true, 
          _id: insertResult.insertedId,
          document: docWithMetadata
        });
      
      case 'read':
        if (query && query._id) {
          // Convert string ID to ObjectId if needed
          if (typeof query._id === 'string') {
            query._id = new ObjectId(query._id);
          }
        }
        
        const documents = await dbCollection.find(query || {}).toArray();
        return NextResponse.json({ success: true, documents });
      
      case 'update':
        if (!query || !update) {
          return NextResponse.json({ 
            error: 'Query and update are required for update operation' 
          }, { status: 400 });
        }
        
        // Convert string ID to ObjectId if needed
        if (query._id && typeof query._id === 'string') {
          query._id = new ObjectId(query._id);
        }
        
        // Add updated timestamp
        const updateWithMetadata = {
          ...update,
          $set: {
            ...(update.$set || {}),
            updatedAt: new Date()
          }
        };
        
        const updateResult = await dbCollection.updateOne(query, updateWithMetadata);
        return NextResponse.json({ 
          success: true, 
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount
        });
      
      case 'delete':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query is required for delete operation' 
          }, { status: 400 });
        }
        
        // Convert string ID to ObjectId if needed
        if (query._id && typeof query._id === 'string') {
          query._id = new ObjectId(query._id);
        }
        
        const deleteResult = await dbCollection.deleteOne(query);
        return NextResponse.json({ 
          success: true, 
          deletedCount: deleteResult.deletedCount
        });
      
      default:
        return NextResponse.json({ 
          error: `Unsupported operation: ${operation}. Supported operations are: create, read, update, delete` 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in AI API:', error);
    return NextResponse.json({ 
      error: 'An error occurred processing your request',
      message: error.message
    }, { status: 500 });
  }
}