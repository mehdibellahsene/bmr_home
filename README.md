# Portfolio Website with Dynamic Content Management

A modern, minimalist portfolio website built with Next.js 15, inspired by the design of ivov.dev. Features dynamic content management through JSON storage and a comprehensive admin console.

## Features

### Public Portfolio
- **Clean, minimalist design** inspired by ivov.dev
- **Dynamic content** loaded from JSON data store
- **Responsive sidebar navigation** with Home, Notes, and Learning sections
- **Markdown support** for notes with beautiful typography
- **Profile section** with skills, interests, location, and contact info
- **Work and social links** organized in sidebar sections

### Admin Console
- **Secure login system** with bcrypt password hashing
- **Dashboard overview** showing recent notes and learning items
- **Notes management**: Create, edit, delete notes with Markdown support
- **Learning management**: Track courses, books, projects, certifications
- **Profile & Links editor**: Update personal info, skills, and social links
- **Protected routes** with middleware authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Typography plugin
- **Authentication**: Cookie-based with bcrypt
- **Content**: JSON file storage
- **Markdown**: react-markdown for rendering

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Access

- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default credentials**:
  - Username: `admin`
  - Password: `password`

## Project Structure

```
src/
├── app/
│   ├── admin/                    # Admin console pages
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── login/               # Admin login
│   │   ├── profile/             # Edit profile & links
│   │   ├── notes/               # Notes management
│   │   └── learning/            # Learning management
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication
│   │   ├── data/                # General data
│   │   ├── notes/               # Notes CRUD
│   │   └── learning/            # Learning CRUD
│   ├── notes/                   # Public notes page
│   ├── learning/                # Public learning page
│   └── page.tsx                 # Home page
├── middleware.ts                # Route protection
└── globals.css                  # Global styles

data/
└── portfolio.json              # All content storage
```

## Content Management

### Notes
- Create and edit notes in Markdown format
- Set publication dates
- Full CRUD operations
- Beautiful typography rendering

### Learning Items
- Track different types of learning (projects, courses, books, etc.)
- Categorize with type badges
- Date tracking
- Full CRUD operations

### Profile & Links
- Update personal information
- Manage skills and interests
- Configure work and social links
- Custom icons for each link

## Data Storage

All content is stored in `data/portfolio.json`:

```json
{
  "profile": {
    "name": "Your Name",
    "title": "Your bio/description",
    "location": "City, Country",
    "email": "email@example.com",
    "skills": "Your skills",
    "interests": "Your interests"
  },
  "links": {
    "work": [/* work links */],
    "presence": [/* social links */]
  },
  "notes": [/* your notes */],
  "learning": [/* learning items */],
  "admin": {
    "username": "admin",
    "password": "$2b$12$..."
  }
}
```

## Customization

### Change Admin Password
1. Go to admin dashboard
2. Or manually update the bcrypt hash in `data/portfolio.json`

### Styling
- Edit `src/app/globals.css` for global styles
- Modify Tailwind classes in components
- Update color scheme in components

### Add New Content Types
1. Update JSON schema in `data/portfolio.json`
2. Create new API routes in `src/app/api/`
3. Add admin pages for management
4. Create public pages for display

## Security Features

- Bcrypt password hashing
- Cookie-based authentication
- Middleware route protection
- Admin-only API endpoints
