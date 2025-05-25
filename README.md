# FaceQuizz Next.js Migration

A modern quiz platform built with Next.js 15, TypeScript, and Prisma, migrated from the legacy PHP application.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up your environment:
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

3. Set up the database:
```bash
npm run db:push
npm run db:generate
```

4. (Optional) Migrate data from legacy PHP database:
```bash
npm run migrate:legacy
```

5. Start development server:
```bash
npm run dev
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:generate` - Generate Prisma client
- `npm run migrate:legacy` - Migrate data from PHP database

## 🏗️ Architecture

Built with:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Prisma** for database management
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication

## 📁 Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                  # Utilities and configurations
├── types/                # TypeScript types
├── prisma/               # Database schema
├── scripts/              # Utility scripts
└── public/               # Static assets
```

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL` - Your MySQL database connection
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js
- `CLOUDINARY_*` - Cloudinary credentials for image uploads

## 📄 License

MIT License - see LICENSE file for details.
