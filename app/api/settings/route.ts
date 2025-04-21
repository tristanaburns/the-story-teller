import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { getUserDb } from '@/lib/user-db';
import { authOptions } from '@/lib/auth';
import { Logger } from '@/lib/logging/logger';

// Create a logger instance
const logger = new Logger('api:settings');

// Settings schema validation
const settingsSchema = z.object({
  displayName: z.string().min(1).max(100),
  theme: z.enum(['light', 'dark', 'system']),
  editorFontSize: z.number().int().min(12).max(24),
  enableAIFeatures: z.boolean(),
  enableEmailNotifications: z.boolean(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  mcpServers: z.object({
    memory: z.boolean(),
    art: z.boolean(),
    thinking: z.boolean(),
    database: z.boolean(),
  }),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      logger.warn('Unauthorized settings access attempt', { 
        path: req.nextUrl.pathname,
        method: 'GET' 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.email;
    logger.info('Fetching user settings', { userId });
    
    const db = await getUserDb(userId);
    const settings = await db.collection('settings').findOne({ userId });
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        userId,
        displayName: session.user.name || '',
        email: session.user.email,
        theme: 'system',
        editorFontSize: 16,
        enableAIFeatures: true,
        enableEmailNotifications: false,
        logLevel: 'info',
        mcpServers: {
          memory: true,
          art: true,
          thinking: true,
          database: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create default settings in database
      await db.collection('settings').insertOne(defaultSettings);
      logger.info('Created default user settings', { userId });
      
      return NextResponse.json(defaultSettings);
    }
    
    logger.info('User settings retrieved successfully', { userId });
    return NextResponse.json(settings);
  } catch (error) {
    logger.error('Error fetching user settings', { error });
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      logger.warn('Unauthorized settings update attempt', { 
        path: req.nextUrl.pathname,
        method: 'PUT' 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.email;
    const body = await req.json();
    
    // Validate the input data
    try {
      settingsSchema.parse(body);
    } catch (validationError) {
      logger.warn('Invalid settings data', { validationError, userId });
      return NextResponse.json(
        { error: 'Invalid settings data', details: validationError },
        { status: 400 }
      );
    }
    
    // Update only the fields that can be changed by users
    const updatedSettings = {
      displayName: body.displayName,
      theme: body.theme,
      editorFontSize: body.editorFontSize,
      enableAIFeatures: body.enableAIFeatures,
      enableEmailNotifications: body.enableEmailNotifications,
      logLevel: body.logLevel,
      mcpServers: body.mcpServers,
      updatedAt: new Date(),
    };
    
    logger.info('Updating user settings', { userId });
    
    const db = await getUserDb(userId);
    const result = await db.collection('settings').updateOne(
      { userId },
      { $set: updatedSettings },
      { upsert: true }
    );
    
    logger.info('User settings updated successfully', { 
      userId, 
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user settings', { error });
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
