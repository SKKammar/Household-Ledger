import { createClient } from '@libsql/client';

if (process.env.NODE_ENV === 'production') {
    console.error('REFUSED: Do not run wipe.js against production.');
    process.exit(1);
}

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function main() {
    await client.execute('DROP TABLE IF EXISTS expense_splits');
    await client.execute('DROP TABLE IF EXISTS expenses');
    await client.execute('DROP TABLE IF EXISTS categories');
    await client.execute('DROP TABLE IF EXISTS sessions');
    await client.execute('DROP TABLE IF EXISTS magic_links');
    await client.execute('DROP TABLE IF EXISTS members');
    await client.execute('DROP TABLE IF EXISTS households');
    console.log('All tables dropped.');
}
main();
