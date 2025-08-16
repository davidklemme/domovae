# Q&A Feature Documentation

## Overview

The Q&A feature allows viewers to ask questions about properties, which property owners can answer. Property owners have control over which questions and answers are published for public viewing.

## Features

### For Viewers (Buyers)

- **Ask Questions**: Authenticated buyers can ask questions about properties
- **View Published Q&As**: See questions and answers that property owners have chosen to publish
- **Track Own Questions**: View the status of questions they've asked (pending, answered, published, rejected)
- **Delete Own Questions**: Remove questions they've asked (before they're answered)

### For Property Owners

- **View All Questions**: See all questions asked about their properties
- **Answer Questions**: Provide answers to pending questions
- **Manage Publication**: Choose which answers to publish publicly
- **Status Management**: Update question status (pending, answered, published, rejected)
- **Delete Answers**: Remove answers they've provided

## Database Schema

### Tables

#### `property_questions`

- `id`: Primary key
- `property_id`: Reference to the property
- `asked_by`: Reference to the user who asked the question
- `question`: The question text (max 1000 characters)
- `status`: Question status (pending, answered, published, rejected)
- `created_at`, `updated_at`: Timestamps

#### `property_answers`

- `id`: Primary key
- `question_id`: Reference to the question
- `answered_by`: Reference to the user who answered
- `answer`: The answer text (max 2000 characters)
- `is_published`: Whether the answer is published publicly
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Questions

- `GET /api/properties/[id]/questions` - Get questions for a property
- `POST /api/properties/[id]/questions` - Create a new question
- `PATCH /api/properties/[id]/questions/[questionId]` - Update question status
- `DELETE /api/properties/[id]/questions/[questionId]` - Delete a question

### Answers

- `POST /api/properties/[id]/questions/[questionId]/answers` - Create an answer
- `PATCH /api/properties/[id]/questions/[questionId]/answers/[answerId]` - Update answer publication status
- `DELETE /api/properties/[id]/questions/[questionId]/answers/[answerId]` - Delete an answer

## Permissions

### Question Permissions

- **Create**: Authenticated users with 'buyer' role
- **View**:
  - Property owners can see all questions for their properties
  - Buyers can see their own questions and published Q&As
  - Non-authenticated users can only see published Q&As
- **Update Status**: Only property owners
- **Delete**: Only the user who asked the question

### Answer Permissions

- **Create**: Only property owners
- **View**: Based on question visibility rules
- **Update Publication**: Only property owners
- **Delete**: Only property owners

## User Interface

### Property View Page

The Q&A component is integrated into the property view page and shows:

1. **Ask Question Button**: For authenticated buyers
2. **Question Form**: When asking a question
3. **Published Q&As**: Publicly visible questions and answers
4. **Owner Management Interface**: For property owners to manage questions and answers

### Component Features

- **Real-time Updates**: Questions and answers update automatically
- **Status Indicators**: Clear visual indicators for question status
- **Character Limits**: Input validation with character counters
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

## Workflow

### Typical Q&A Flow

1. **Buyer asks question** → Status: `pending`
2. **Owner receives notification** (via dashboard)
3. **Owner answers question** → Status: `answered`
4. **Owner decides to publish** → Status: `published`
5. **Public can view** the Q&A

### Alternative Flows

- **Owner rejects question** → Status: `rejected`
- **Buyer deletes question** → Question removed entirely
- **Owner deletes answer** → Status reverts to `pending`

## Security Features

- **Input Validation**: All inputs are validated for length and content
- **Permission Checks**: Server-side validation of all operations
- **Cascade Deletion**: Deleting a question removes all associated answers
- **Audit Trail**: All operations are timestamped

## Testing

The Q&A system includes comprehensive tests covering:

- Question creation and validation
- Answer creation and validation
- Permission checks
- Publication management
- Deletion operations
- Error handling

Run tests with: `pnpm test qa-system.spec.ts`

## Future Enhancements

Potential improvements for the Q&A system:

- **Email Notifications**: Notify owners of new questions
- **Question Categories**: Organize questions by topic
- **Answer Templates**: Pre-written answers for common questions
- **Moderation Tools**: Admin tools for managing inappropriate content
- **Search and Filter**: Find specific questions or answers
- **Rich Text Support**: Formatting in questions and answers
- **File Attachments**: Images or documents in Q&As
