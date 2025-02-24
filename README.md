# Anonymous Messaging API Documentation

## Introduction
This API enables users to register, log in, generate a unique link for receiving anonymous messages, submit anonymous messages, and retrieve their messages. It is secure, easy to use, and designed for seamless integration with frontend applications.

- **Base URL**: `https://api.example.com`
- **Authentication**: Most endpoints require a Bearer token obtained from the login endpoint, included in the Authorization header as `Authorization: Bearer <token>`.
- **HTTPS**: All requests must use HTTPS for security.

## Authentication
To access protected endpoints, include the JWT token in the Authorization header:

```text
Authorization: Bearer <token>
```

The token is obtained from the `/api/login` endpoint after successful authentication.

## Endpoints

### 1. User Registration

- **Method**: `POST`
- **URL**: `/api/register`
- **Description**: Registers a new user with an email and password.

#### Request Body
```json
{
    "email": "string",  // Must be a valid email address
    "password": "string"  // Minimum 8 characters
}
```

#### Response

**201 Created:**
```json
{
    "message": "Registered successfully. Please verify your email."
}
```

**Errors:**
- `400 Bad Request`: Invalid or missing email/password.
- `409 Conflict`: Email is already registered.
- `500 Internal Server Error`: Server-side error.

### 2. User Login

- **Method**: `POST`
- **URL**: `/api/login`
- **Description**: Authenticates a user and returns a JWT token for accessing protected endpoints.

#### Request Body
```json
{
    "email": "string",
    "password": "string"
}
```

#### Response

**200 OK:**
```json
{
    "token": "string"  // JWT token
}
```

**Errors:**
- `400 Bad Request`: Missing email or password.
- `401 Unauthorized`: Invalid credentials.
- `403 Forbidden`: Email not verified.
- `500 Internal Server Error`: Server-side error.

### 3. Get User Link

- **Method**: `GET`
- **URL**: `/api/get-link`
- **Authentication**: Required (Bearer token in Authorization header)
- **Description**: Retrieves the user's unique `link_id`, which can be shared to receive anonymous messages.

#### Response

**200 OK:**
```json
{
    "link_id": "string",  // Unique identifier for receiving anonymous messages
    "user_id": integer    // User ID associated with the link
}
```

**Example:**
```json
{
    "link_id": "5QXMA_wp9ReC",
    "user_id": 3
}
```

**Errors:**
- `401 Unauthorized`: Missing or invalid token.
- `500 Internal Server Error`: Server-side error.

### 4. Submit Anonymous Message

- **Method**: `POST`
- **URL**: `/api/messages/:link_id`
- **Description**: Submits an anonymous message to the user associated with the `link_id`.
- **Path Parameter**:
  - `link_id`: `string` (the unique link ID obtained from `/api/get-link`).

#### Request Body
```json
{
    "content": "string",  // Message content, max 1000 characters
    "category": "string", // Must be "Feedback", "Question", or "Compliment"
    "captcha": "string"   // CAPTCHA response
}
```

#### Example
```json
{
    "content": "Hello, this is an anonymous message.",
    "category": "Feedback",
    "captcha": "captcha_response"
}
```

#### Response

**201 Created:**
```json
{
    "message": "Message submitted successfully"
}
```

**Errors:**
- `400 Bad Request`: Missing content, invalid category, or invalid CAPTCHA.
- `404 Not Found`: Invalid `link_id`.
- `500 Internal Server Error`: Server-side error.

### 5. Get User Messages

- **Method**: `GET`
- **URL**: `/api/messages`
- **Authentication**: Required (Bearer token in Authorization header)
- **Description**: Retrieves all anonymous messages sent to the authenticated user.

#### Response

**200 OK:**
```json
[
    {
        "message_id": integer,
        "content": "string",
        "category": "string",
        "created_at": "string",  // ISO 8601 format (e.g., "2023-10-01T12:00:00Z")
        "is_read": boolean,
        "is_flagged": boolean
    }
]
```

**Example:**
```json
[
    {
        "message_id": 1,
        "content": "Hello, this is a message.",
        "category": "Feedback",
        "created_at": "2023-10-01T12:00:00Z",
        "is_read": false,
        "is_flagged": false
    }
]
```

**Errors:**
- `401 Unauthorized`: Missing or invalid token.
- `500 Internal Server Error`: Server-side error.

## Additional Notes
- **CAPTCHA**: Required for `/api/messages/:link_id`.
- **Rate Limiting**: Implement rate limits to prevent spam.
- **Pagination**: Consider adding pagination to `/api/messages`.
- **Validation Rules**: Email format, password security, and message length restrictions apply.

