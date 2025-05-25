#!/bin/bash

echo "🚀 Setting up FaceQuizz development environment..."

# Generate Prisma client
echo "📊 Generating Prisma client..."
npx prisma generate

# Push schema to database (for development)
echo "🗄️  Pushing schema to database..."
npx prisma db push

echo "✅ Development setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure your .env.local file"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:3000"
