# The Story Teller: Service Deployment Guide

This guide provides detailed instructions for deploying The Story Teller application to production using Vercel for hosting the Next.js application and MongoDB Atlas for the database.

## Deployment Architecture

The Story Teller uses the following deployment architecture:

1. **Next.js Application**: Deployed on Vercel
2. **Database**: MongoDB Atlas (user-specific databases)
3. **Authentication**: OAuth via Google and GitHub
4. **AI Integration**: OpenAI API

```
[Client Browser] ←→ [Vercel (Next.js App)] ←→ [MongoDB Atlas]
                      ↑                         ↑
                      ↓                         ↓
            [OAuth Providers]          [OpenAI API]
```

## Prerequisites

Before deployment, ensure you have:

1. A Vercel account (https://vercel.com)
2. A MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
3. Google OAuth credentials (https://console.cloud.google.com)
4. GitHub OAuth application credentials (https://github.com/settings/developers)
5. OpenAI API key (https://platform.openai.com)

## MongoDB Atlas Setup

### 1. Create a MongoDB Atlas Cluster

1. Log in to MongoDB Atlas
2. Click "Build a Cluster" (or use an existing one)
3. Choose your cloud provider and region
4. Select your preferred tier (M0 Free tier is sufficient for starting)
5. Name your cluster (e.g., "story-teller-cluster")
6. Click "Create Cluster"

### 2. Configure Database Access

1. Navigate to "Database Access" under Security
2. Click "Add New Database User"
3. Create a user with password authentication
4. Grant appropriate permissions:
   - For development: `atlasAdmin@admin`
   - For production: Custom role with read/write access to specific databases
5. Click "Add User"

### 3. Configure Network Access

1. Navigate to "Network Access" under Security
2. Click "Add IP Address"
3. For development: Add your IP address
4. For production: Add Vercel IP addresses (see Vercel documentation for current ranges) or allow access from anywhere (0.0.0.0/0) with appropriate security measures
5. Click "Confirm"

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Select "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Save this string for use in environment variables

## Vercel Deployment Setup

### 1. Connect to GitHub Repository

1. Log in to Vercel
2. Click "New Project"
3. Import your GitHub repository
4. Select the "the-story-teller" repository
5. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2. Configure Environment Variables

Add the following environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database?retryWrites=true&w=majority
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
AI_API_KEY=your-custom-api-key-for-openai-integration
```

For `NEXTAUTH_SECRET`, generate a secure random string:

```bash
openssl rand -base64 32
```

### 3. Deploy the Application

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Once deployed, Vercel will provide a URL for your application

### 4. Configure Custom Domain (Optional)

1. In Vercel, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## OAuth Provider Configuration

### Google OAuth Setup

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External
   - Application Name: The Story Teller
   - Support Email: Your email
   - Authorized domains: Your vercel app domain
6. Create OAuth client ID:
   - Application Type: Web application
   - Name: The Story Teller
   - Authorized JavaScript origins: `https://your-domain.vercel.app`
   - Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`
7. Save the Client ID and Client Secret for environment variables

### GitHub OAuth Setup

1. Go to GitHub Developer Settings (https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application Name: The Story Teller
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
4. Click "Register application"
5. Generate a new client secret
6. Save the Client ID and Client Secret for environment variables

## OpenAI API Configuration

1. Create or login to your OpenAI account (https://platform.openai.com)
2. Navigate to API keys
3. Create a new API key
4. Save this key for your custom AI integration

## Custom AI Integration Setup

To configure OpenAI's Custom GPT to interact with your application:

1. Create a Custom GPT in OpenAI
2. Add a new Action with the following configuration:
   - Auth Type: "API Key"
   - API Key: Your `AI_API_KEY` value
   - Base URL: `https://your-domain.vercel.app/api/ai`
   - Schema:
   ```json
   {
     "openapi": "3.1.0",
     "info": {
       "title": "The Story Teller API",
       "description": "API for managing narrative content in The Story Teller application",
       "version": "v1"
     },
     "servers": [
       {
         "url": "https://your-domain.vercel.app"
       }
     ],
     "paths": {
       "/api/ai": {
         "post": {
           "description": "Perform database operations on The Story Teller",
           "operationId": "performOperation",
           "requestBody": {
             "required": true,
             "content": {
               "application/json": {
                 "schema": {
                   "type": "object",
                   "required": ["userId", "operation", "collection"],
                   "properties": {
                     "userId": {
                       "type": "string",
                       "description": "The user ID for the database operation"
                     },
                     "operation": {
                       "type": "string",
                       "enum": ["create", "read", "update", "delete"],
                       "description": "The operation to perform"
                     },
                     "collection": {
                       "type": "string",
                       "description": "The database collection to operate on"
                     },
                     "document": {
                       "type": "object",
                       "description": "The document to create (for create operation)"
                     },
                     "query": {
                       "type": "object",
                       "description": "The query to find documents (for read, update, delete operations)"
                     },
                     "update": {
                       "type": "object",
                       "description": "The update to apply (for update operation)"
                     }
                   }
                 }
               }
             }
           },
           "responses": {
             "200": {
               "description": "Successful operation",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "success": {
                         "type": "boolean"
                       },
                       "documents": {
                         "type": "array",
                         "items": {
                           "type": "object"
                         }
                       }
                     }
                   }
                 }
               }
             },
             "400": {
               "description": "Invalid request",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "error": {
                         "type": "string"
                       }
                     }
                   }
                 }
               }
             },
             "401": {
               "description": "Unauthorized",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "error": {
                         "type": "string"
                       }
                     }
                   }
                 }
               }
             },
             "500": {
               "description": "Server error",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "error": {
                         "type": "string"
                       },
                       "message": {
                         "type": "string"
                       }
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

## Setting Up User-Specific Databases

The Story Teller creates a separate MongoDB database for each user. This setup requires:

1. **Database Provisioning**: When a user signs in for the first time, the application creates a new database for that user
2. **Collection Creation**: Standard collections are created for stories, characters, locations, etc.
3. **Initial Metadata**: User metadata is stored in the database

This is handled automatically by the `createUserDb` function in `lib/user-db.ts`.

## Monitoring and Logging

For production deployment, set up monitoring and logging:

### Vercel Analytics

1. In Vercel dashboard, navigate to your project
2. Go to "Analytics"
3. Enable Vercel Analytics

### MongoDB Atlas Monitoring

1. In MongoDB Atlas, select your cluster
2. Go to "Monitoring"
3. Set up alerts for important metrics:
   - CPU Usage
   - Memory Usage
   - Operation Time
   - Connection Count

### Application Logging

Implement structured logging in your application:

1. Use a logging library like Winston or Pino
2. Log important events:
   - User sign-ins
   - Database operations
   - Errors and exceptions
   - API calls
3. Include relevant context in logs:
   - User ID (anonymized if needed)
   - Operation type
   - Timestamp
   - Resource identifiers

## Security Considerations

Ensure your deployment follows security best practices:

1. **Environment Variables**: Never commit secrets to the repository
2. **HTTPS**: Enforce HTTPS for all connections
3. **Authentication**: Implement proper session management
4. **Authorization**: Verify user permissions for each operation
5. **Input Validation**: Validate all user input
6. **Rate Limiting**: Implement rate limiting for API endpoints
7. **CORS**: Configure proper CORS headers
8. **Security Headers**: Set appropriate security headers:
   - Content-Security-Policy
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection

## Backup and Recovery

Implement a backup strategy for production:

1. **MongoDB Atlas Backups**:
   - Enable automated backups in MongoDB Atlas
   - Configure backup schedule (daily for production)
   - Test restore procedures regularly

2. **Application Data Backups**:
   - Implement export functionality for users' stories
   - Create periodic snapshots of critical data
   - Store backups securely with encryption

## Scaling Considerations

As your user base grows, consider these scaling strategies:

1. **MongoDB Atlas Scaling**:
   - Monitor database performance
   - Upgrade cluster tier as needed
   - Implement sharding for larger datasets
   - Configure appropriate indexes for common queries

2. **Vercel Scaling**:
   - Use serverless functions for better scaling
   - Implement edge caching for static assets
   - Optimize API routes for performance
   - Consider using edge functions for global performance

## Continuous Deployment

Set up continuous deployment for ongoing development:

1. **GitHub Integration**:
   - Connect Vercel to your GitHub repository
   - Configure automatic deployments for main branch
   - Set up preview deployments for pull requests

2. **Environment Branches**:
   - Create separate branches for development, staging, and production
   - Configure environment-specific variables
   - Implement deployment gates between environments

## Troubleshooting

Common deployment issues and solutions:

1. **MongoDB Connection Issues**:
   - Verify network access settings
   - Check authentication credentials
   - Ensure proper connection string format
   - Check for connection pooling issues

2. **Authentication Problems**:
   - Verify OAuth configuration
   - Check redirect URIs
   - Ensure NEXTAUTH_URL is set correctly
   - Validate session handling

3. **API Errors**:
   - Check server logs
   - Verify environment variables
   - Test endpoints manually
   - Check for CORS issues

4. **Performance Issues**:
   - Monitor database query performance
   - Check for N+1 query problems
   - Optimize API response sizes
   - Implement caching where appropriate

## Post-Deployment Checklist

After deployment, verify:

1. Authentication flows work correctly
2. User-specific databases are created
3. All API endpoints function properly
4. Story creation and management works
5. AI integration functions as expected
6. UI renders correctly on different devices
7. Error handling functions properly
8. Performance meets expectations

## Conclusion

Following this deployment guide will help you successfully deploy The Story Teller application to production. Remember to monitor your application regularly, implement security updates promptly, and maintain backups to ensure the best experience for your users.
