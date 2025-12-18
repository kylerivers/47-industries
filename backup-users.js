const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const connection = await mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    port: 11561,
    user: 'root',
    password: 'IoOlsZtgeKEPyMcMVPcyAlASLinJYgTq',
    database: 'railway'
  });

  console.log('Backing up all user data...\n');

  const [users] = await connection.execute('SELECT * FROM User');

  console.log(`Found ${users.length} users to backup`);

  // Save as JSON
  fs.writeFileSync('user-backup.json', JSON.stringify(users, null, 2));
  console.log('✅ Saved to user-backup.json');

  // Create SQL INSERT statements
  let sqlBackup = '-- 47 Industries User Backup\n';
  sqlBackup += `-- Generated: ${new Date().toISOString()}\n`;
  sqlBackup += `-- Total users: ${users.length}\n\n`;

  for (const user of users) {
    const fields = Object.keys(user);
    const values = Object.values(user).map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
      if (v instanceof Date) return `'${v.toISOString()}'`;
      return v;
    });

    sqlBackup += `INSERT INTO User (${fields.join(', ')}) VALUES (${values.join(', ')});\n`;
  }

  fs.writeFileSync('user-backup.sql', sqlBackup);
  console.log('✅ Saved to user-backup.sql');

  console.log('\n=== BACKUP COMPLETE ===');
  console.log('Your user data is now backed up in:');
  console.log('  - user-backup.json (JSON format)');
  console.log('  - user-backup.sql (SQL INSERT statements)');
  console.log('\nThese can be used to restore users if needed.');

  await connection.end();
}

main().catch(console.error);
