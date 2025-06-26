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

## Deployment

### Vercel (Recommended)

This project is optimized for deployment on Vercel and other serverless platforms. The data system automatically detects serverless environments and uses static data instead of file system operations.

**Key Features for Serverless:**
- Automatic serverless environment detection
- Static data fallback for production builds
- No file system dependencies in production
- Seamless development-to-production workflow

**To deploy:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

**Important Notes:**
- In serverless environments (Vercel, Netlify), data updates through the admin panel are temporary (session-only)
- For persistent data updates in production, consider integrating with:
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL) 
  - MongoDB Atlas
  - Airtable API
  - Any other database service

### Local Development vs Production

- **Development**: Uses `data/portfolio.json` file system operations
- **Production (Serverless)**: Uses static data embedded in the build
- **Data Updates**: 
  - Development: Persistent to JSON file
  - Production: Session-only (lost on function restart)

### Updating Static Data for Production

When you update content and want it reflected in the deployed version:

1. Update `data/portfolio.json` locally
2. Update the `STATIC_PORTFOLIO_DATA` constant in `src/lib/database.ts`
3. Commit and push changes
4. Redeploy to Vercel

## MongoDB Integration

This portfolio now supports MongoDB as an alternative to JSON file storage. MongoDB integration allows for persistent data storage in production environments and better scalability.

### Setup MongoDB

1. **Create a MongoDB Atlas account** at [mongodb.com](https://www.mongodb.com/)

2. **Create a new cluster** and get your connection string

3. **Update your `.env.local` file**:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bmr-portfolio?retryWrites=true&w=majority
   # Replace username, password, and cluster with your actual values
   ```

4. **Test the connection**:
   ```bash
   npm run db:test
   ```

5. **Migrate existing data** (if you have data in `data/portfolio.json`):
   ```bash
   npm run db:migrate
   ```

6. **Verify migration**:
   ```bash
   npm run db:verify
   ```

### Database Management Scripts

- `npm run db:test` - Test MongoDB connection
- `npm run db:migrate` - Migrate data from JSON to MongoDB
- `npm run db:verify` - Verify data in MongoDB

### Admin Dashboard Integration

The admin dashboard now includes a **Database Management** section where you can:
- View current database mode (MongoDB or filesystem)
- Check MongoDB configuration status
- Migrate data from filesystem to MongoDB
- Switch between database modes

### Automatic Fallback

The system automatically detects:
- **Local development**: Prefers MongoDB if configured, falls back to JSON files
- **Production**: Uses MongoDB if configured, otherwise static data
- **Serverless**: Automatically handles connection pooling and performance

### Production Deployment

For production with MongoDB:

1. Set the `MONGODB_URI` environment variable in your deployment platform
2. The system will automatically use MongoDB for data storage
3. Data updates through the admin panel will be persistent

### Data Models

The MongoDB integration includes these collections:
- **profiles** - User profile information
- **links** - Work and social media links
- **notes** - Blog posts and notes
- **learnings** - Learning items and progress

## Environment Variables

Create a `.env.local` file for local development:

```env
NODE_ENV=development
```

For production, Vercel automatically sets appropriate environment variables.
