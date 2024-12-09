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

### Events API

#### 1. Create Event

- **Endpoint:** `POST /api/events`
- **Description:** Create a new event
- **Request Body:**
  ```typescript
  {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    userId: string;
  }
  ```
- **Response:**
  - 201: Event created successfully
  - 400: Invalid input
  - 401: Unauthorized

#### 2. Get Events

- **Endpoint:** `GET /api/events`
- **Description:** Retrieve events (supports filtering and pagination)
- **Query Parameters:**
  - `userId`: Filter events by user
  - `startDate`: Filter events from a specific date
  - `endDate`: Filter events up to a specific date
  - `page`: Pagination page number
  - `limit`: Number of events per page

#### 3. Get Single Event

- **Endpoint:** `GET /api/events/:id`
- **Description:** Retrieve a specific event by ID
- **Response:**
  - 200: Event details
  - 404: Event not found

#### 4. Update Event

- **Endpoint:** `PUT /api/events/:id`
- **Description:** Update an existing event
- **Request Body:** Same as Create Event
- **Response:**
  - 200: Event updated successfully
  - 400: Invalid input
  - 401: Unauthorized
  - 404: Event not found

#### 5. Delete Event

- **Endpoint:** `DELETE /api/events/:id`
- **Description:** Delete a specific event
- **Response:**
  - 200: Event deleted successfully
  - 401: Unauthorized
  - 404: Event not found

## Authentication

The API uses NextAuth for authentication. Ensure you have the proper authentication middleware in place when making requests.

## Error Handling

- 400: Bad Request (Invalid input)
- 401: Unauthorized
- 404: Resource Not Found
- 500: Internal Server Error

## Development Notes

- Use TypeScript for type safety
- Prisma ORM for database interactions
- NextAuth for authentication
- Validate and sanitize all input data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
