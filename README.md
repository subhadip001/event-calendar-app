# Event Calendar App - API Documentation

## Setup Instructions

### Tech Stack

- Next.js
- Supabase
- Tailwind CSS
- TypeScript
- JWT Authentication

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/subhadip001/event-calendar-app
   cd event-calendar-app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your-secret-key
   ```

4. Create the required tables with required columns in your Supabase database.

5. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

## API Endpoints

### Authentication

#### 1. Sign Up

- **Endpoint:** `POST /api/auth/signup`
- **Description:** Sign up a new user
- **Request Body:**
  ```typescript
  {
    name?: string;
    email: string;
    password: string;
  }
  ```
- **Response:**
  - 200: User created successfully
  - 400: Invalid input
  - 409: User already exists

#### 2. Sign In

- **Endpoint:** `POST /api/auth/signin`
- **Description:** Sign in an existing user
- **Request Body:**
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response:**
  - 200: User signed in successfully
  - 400: Invalid input
  - 401: Invalid credentials

#### 3. Sign Out

- **Endpoint:** `POST /api/auth/signout`
- **Description:** Sign out the current user
- **Response:**
  - 200: User signed out successfully
  - 401: Not authenticated

#### 4. Fetch User

- **Endpoint:** `GET /api/auth/me`
- **Description:** Fetch the current user's details
- **Response:**
  - 200: User details
  - 401: Not authenticated
  - 404: User not found

### Events (⁠ /events ⁠)

#### GET /events

Retrieves all events.

_Headers:_
•⁠ ⁠Authorization: Bearer [token]

_Response:_
⁠ json
{
"events": [
{
"id": "event-id",
"title": "Event Title",
"description": "Event Description",
"date": "2024-12-09T21:47:12+05:30"
}
]
}
 ⁠

#### POST /events

Creates a new event.

_Headers:_
•⁠ ⁠Authorization: Bearer [token]

_Request Body:_
⁠ json
{
"title": "Event Title",
"description": "Event Description",
"date": "2024-12-09T21:47:12+05:30"
}
 ⁠

### User Events (⁠ /eventsByUserId ⁠)

#### GET /eventsByUserId/{userId}

Retrieves events for a specific user.

_Headers:_
•⁠ ⁠Authorization: Bearer [token]

_Response:_
⁠ json
{
"events": [
{
"id": "event-id",
"userId": "user-id",
"title": "Event Title",
"description": "Event Description",
"date": "2024-12-09T21:47:12+05:30"
}
]
}
 ⁠

### Users (⁠ /users ⁠)

#### GET /users/{userId}

Retrieves user information.

_Headers:_
•⁠ ⁠Authorization: Bearer [token]

_Response:_
⁠ json
{
"id": "user-id",
"email": "user@example.com",
"name": "John Doe"
}
 ⁠

## Error Handling

The API uses standard HTTP status codes for error responses:

•⁠ ⁠200: Success
•⁠ ⁠201: Created
•⁠ ⁠400: Bad Request
•⁠ ⁠401: Unauthorized
•⁠ ⁠403: Forbidden
•⁠ ⁠404: Not Found
•⁠ ⁠500: Internal Server Error

Error responses follow this format:
⁠ json
{
"error": {
"code": "ERROR_CODE",
"message": "Error description"
}
}
 ⁠

## Error Handling

- 400: Bad Request (Invalid input)
- 401: Unauthorized
- 404: Resource Not Found
- 500: Internal Server Error
