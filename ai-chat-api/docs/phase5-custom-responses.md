# Phase 5: Custom Organization Responses

## Overview

Phase 5 implements a comprehensive custom response system that allows organizations to personalize AI chat responses based on different scenarios. This system provides flexibility for organizations to maintain their brand voice and handle various chat situations with customized messages.

## Features Implemented

### 1. Database Schema

Added new models to support custom responses:

- **CustomResponse**: Stores organization-level response templates
- **WidgetCustomResponse**: Associates responses with specific widgets and allows overrides
- **ResponseType** enum: Defines different response scenarios

### 2. Response Types

The system supports the following response types:

- `GREETING`: Welcome messages when users start a conversation
- `FALLBACK`: Used when the AI doesn't have a good answer
- `ERROR`: System error messages
- `MAINTENANCE`: Maintenance mode messages
- `RATE_LIMIT`: Rate limiting messages
- `UNAUTHORIZED`: Unauthorized access messages
- `KNOWLEDGE_NOT_FOUND`: When no knowledge base matches are found
- `CLARIFICATION`: Asking users to clarify their question
- `CONFIRMATION`: Confirming user actions
- `CUSTOM`: Custom response types

### 3. API Endpoints

#### Custom Response Management

- `GET /api/custom-responses` - List all custom responses
- `GET /api/custom-responses/:id` - Get a single custom response
- `POST /api/custom-responses` - Create a new custom response
- `PUT /api/custom-responses/:id` - Update a custom response
- `DELETE /api/custom-responses/:id` - Delete a custom response

#### Widget Association

- `POST /api/custom-responses/:id/widgets` - Associate response with widget
- `PUT /api/custom-responses/:id/widgets/:widgetId` - Update widget override
- `DELETE /api/custom-responses/:id/widgets/:widgetId` - Remove from widget

#### Utilities

- `POST /api/custom-responses/defaults/create` - Create default responses

### 4. Variable Interpolation

Custom responses support variable interpolation using `{{variableName}}` syntax:

- `{{widgetName}}` - Widget name
- `{{time}}` - Current time
- `{{organizationName}}` - Organization name
- Custom context variables

### 5. Priority System

Responses have a priority field (0-1000) to determine which response to use when multiple matches exist. Higher priority responses are selected first.

### 6. Conditions

Responses can have conditions (stored as JSON) that determine when they should be used. The system evaluates these conditions against the current context.

## Integration with Chat Flow

### Greeting Detection

The chat endpoint now detects greeting patterns and returns custom greeting responses:

```typescript
const greetingPatterns = [
  /^(hello|hi|hey|こんにちは|はじめまして|よろしく)/i,
  /^(good\s*(morning|afternoon|evening))/i,
  /^(おはよう|こんばんは)/i,
];
```

### Error Handling

Custom error responses are used when chat processing fails:

```typescript
const customError = await customResponseService.getResponseForContext(
  req.widget.id,
  ResponseType.ERROR,
  { widgetName: req.widget.name }
);
```

### Rate Limiting

When rate limits are exceeded, custom rate limit messages are returned instead of generic errors.

## Service Architecture

### CustomResponseService

The service provides methods for:

- CRUD operations on custom responses
- Widget association management
- Context-based response retrieval
- Variable interpolation
- Default response creation

### Key Methods

- `getResponseForContext()`: Retrieves the appropriate response based on widget, type, and context
- `interpolateVariables()`: Replaces variables in response content
- `evaluateConditions()`: Checks if response conditions match the context
- `createDefaultResponses()`: Creates a set of default responses for new organizations

## Default Responses

When an organization is created, the following default responses are automatically generated:

1. Default Greeting: "Hello! How can I assist you today?"
2. Default Fallback: "I'm sorry, I don't have information about that..."
3. Default Error: "I apologize, but I'm experiencing technical difficulties..."
4. Default Rate Limit: "You've reached the maximum number of messages..."
5. Default Maintenance: "We're currently performing maintenance..."

## Usage Example

```typescript
// Create a custom greeting
const response = await customResponseService.createCustomResponse({
  organizationId: 'org123',
  name: 'Friendly Greeting',
  type: ResponseType.GREETING,
  content: 'Welcome to {{organizationName}}! How can I help you today?',
  priority: 10,
  conditions: { timeOfDay: 'morning' },
});

// Get response for context
const greeting = await customResponseService.getResponseForContext(
  'widget123',
  ResponseType.GREETING,
  {
    organizationName: 'Acme Corp',
    timeOfDay: 'morning',
  }
);
// Returns: "Welcome to Acme Corp! How can I help you today?"
```

## Migration Guide

To enable custom responses for existing organizations:

1. Run the API endpoint to create default responses: `POST /api/custom-responses/defaults/create`
2. Customize responses through the API or admin interface
3. Associate responses with specific widgets as needed

## Security Considerations

- All custom response operations require authentication
- Organization-level isolation ensures responses are only accessible by authorized users
- Responses are scoped to organizations and require appropriate permissions (WIDGET_READ/WIDGET_WRITE)

## Future Enhancements

1. **Response Analytics**: Track which responses are used most frequently
2. **A/B Testing**: Test different response variations
3. **Language Support**: Multi-language response templates
4. **Response Chains**: Link responses together for multi-turn conversations
5. **Dynamic Content**: Fetch dynamic content from external sources
6. **Response Preview**: Preview responses with sample data before saving

## Testing

Comprehensive test coverage includes:

- CRUD operations for custom responses
- Widget association management
- Response filtering and retrieval
- Variable interpolation
- Default response creation

Run tests with: `yarn test tests/routes/customResponses.test.ts`
