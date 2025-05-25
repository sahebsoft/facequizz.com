const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration from legacy PHP database...');

  const legacyConnection = await mysql.createConnection({
    host: process.env.LEGACY_DB_HOST || 'localhost',
    user: process.env.LEGACY_DB_USER || 'root',
    password: process.env.LEGACY_DB_PASSWORD || '',
    database: process.env.LEGACY_DB_NAME || 'facequiz_db'
  });

  try {
    console.log('Migrating users...');
    const [users] = await legacyConnection.execute('SELECT * FROM user');
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: {},
        create: {
          username: user.username,
          password: user.password,
          title: user.title,
          email: user.email,
          userType: user.user_type,
          divisionId: user.division_id,
          status: user.status,
          adSlot: BigInt(user.ad_slot)
        }
      });
    }
    console.log(`Migrated ${users.length} users`);

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await legacyConnection.end();
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
