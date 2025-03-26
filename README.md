# Shift Project

Shift Project is a full-stack Next.js application designed to allow users to search for universities, add them to favorites, and manage authentication. The project leverages Prisma for database operations, JWT-based authentication, and a responsive UI built with TailwindCSS. It provides an intuitive interface for users to search for universities by country and name, mark their favorites, and view/manage these favorites through paginated views.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technical Specifications](#technical-specifications)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [University Search](#university-search)
  - [Favorites](#favorites)
- [Project Structure](#project-structure)
- [License](#license)

## Introduction

The Shift Project is built to provide an efficient and user-friendly experience for browsing university data. Users can log in using their credentials, search for universities using filters (such as country and name), and mark specific universities as favorites. This project is ideal for users interested in exploring higher education opportunities while enjoying a modern, responsive design.

## Features

- **University Search:**
  - Search universities by country and/or name.
  - Paginated search results for an enhanced browsing experience.
- **Favorites Management:**
  - Add and remove universities from a personalized favorites list.
  - Paginated view for the list of favorite universities.
- **User Authentication:**
  - Secure login using JWT authentication.
  - Role-based content display with protected routes.
- **Responsive Design:**
  - Built with TailwindCSS for a clean and modern user interface.
  - Mobile-friendly navigation including a collapsible menu and user dropdown.
- **Robust Backend:**
  - Uses Prisma as the ORM for database operations.
  - RESTful API endpoints for handling authentication, university searches, and favorites.

## Technical Specifications

- **Framework:**
  - [Next.js](https://nextjs.org/) (React-based server-side rendering framework)
- **Languages & Tools:**
  - TypeScript for static type checking.
  - JavaScript (ES6+)
  - TailwindCSS for styling.
  - FontAwesome & Lineicons for icons.
- **Backend & Database:**
  - Prisma ORM for database access.
  - JWT (jsonwebtoken) for authentication.
  - Bcrypt for password hashing.
- **Testing & Linting:**
  - Jest for testing.
  - ESLint for linting.
- **Package Manager & Scripts:**
  - NPM scripts provided for development (`dev`), build (`build`), production start (`start`), seeding database (`seed`), testing (`test`), and linting (`lint`).

## Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ehsan-sotoodeh/shift-project
   cd shift-project
   ```

2. **Build the Docker image:**

   ```bash
   docker build -t my-university-app:latest .
   ```

3. **Run the Docker container:**

   ```bash
   docker run -p 3000:3000 my-university-app:latest
   ```

4. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

5. **Test Credentials:**

```bash
   Username: admin@admin.com
   Password: adminadmin
```

## API Endpoints

### Authentication

#### Login

- **Endpoint:** `/api/login`
- **Method:** `POST`
- **Description:** Authenticates the user by verifying the provided email and password. If valid, returns a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response (Success):**

```json
{
  "statusCode": 200,
  "token": "jwt-token-here"
}
```

**Response (Failure):**

```json
{
  "statusCode": 401,
  "error": "Invalid credentials"
}
```

### University Search

#### Get Universities

- **Endpoint:** `/api/university`
- **Method:** `GET`
- **Description:** Retrieves a list of universities based on provided search parameters. Supports pagination.

**Query Parameters:**

- `country` (optional): Filter by country.
- `name` (optional): Filter by university name.
- `page` (optional, default: 1): Page number.
- `pageSize` (optional, default: 10): Number of results per page.

**Response Example:**

```json
{
  "statusCode": 200,
  "responseTime": 120,
  "data": [
    {
      "id": 1,
      "name": "University of Example",
      "stateProvince": "Example State",
      "website": "http://www.example.edu"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10
}
```

### Favorites

#### Get Favorites

- **Endpoint:** `/api/favorite`
- **Method:** `GET`
- **Description:** Retrieves a paginated list of the user’s favorite universities along with related university data.

**Query Parameters:**

- `page` (optional, default: 1): Page number.
- `pageSize` (optional, default: 10): Number of results per page.

**Response Example:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "universityId": 1,
      "university": {
        "name": "University of Example",
        "stateProvince": "Example State",
        "website": "http://www.example.edu"
      }
    }
  ],
  "total": 20,
  "page": 1,
  "pageSize": 10
}
```

#### Add Favorite

- **Endpoint:** `/api/favorite`
- **Method:** `POST`
- **Description:** Adds a university to the user's favorites.

**Request Body:**

```json
{
  "universityId": 1
}
```

**Response Example (Success):**

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "universityId": 1
  }
}
```

**Error Response:**
If the `universityId` is missing, the API returns a 400 status code with an error message.

#### Remove Favorite

- **Endpoint:** `/api/favorite`
- **Method:** `DELETE`
- **Description:** Removes a favorite by its ID.

**Query Parameter:**

- `id`: The ID of the favorite to remove.

**Response Example (Success):**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "universityId": 1
  }
}
```

**Error Response:**
If the favorite does not exist, the API returns a 404 status code with an error message.

## Project Structure

Below is an overview of the project structure:

## Updated Project Structure

```bash
SHIFT-PROJECT/
├── tests
│   ├── api
│   │   ├── favorites.test.ts
│   │   ├── login.test.ts
│   │   └── universities.test.ts
│   └── app
│       ├── FavoritesPage.test.tsx
│       ├── Header.test.tsx
│       ├── LoginPage.test.tsx
│       ├── page.test.tsx
│       └── withAuth.test.tsx
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── favorites
│   │   │   │   └── route.ts
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   └── universities
│   │   │       └── route.ts
│   │   ├── components
│   │   │   └── Header.tsx
│   │   ├── context
│   │   │   └── AuthContext.tsx
│   │   ├── favorites
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── search
│   │   │   └── page.tsx
│   │   ├── utils
│   │   │   ├── authFetch.ts
│   │   │   └── authMiddleware.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── .env
│   ├── .env.local
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── jest.setup.ts
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .dockerignore
└── .gitignore
```

## License

This project is licensed under the MIT License.
