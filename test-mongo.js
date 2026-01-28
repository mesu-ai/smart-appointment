const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://smartqueue:rkjKD9HQw05Ki3DP@cluster0.b3b7vnr.mongodb.net/?appName=Cluster0';

async function testConnection() {
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    const db = client.db('smartqueue');
    console.log('Database:', db.databaseName);

    // Ping
    await db.admin().ping();
    console.log('✅ Ping successful\n');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.length);

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  • ${col.name}: ${count} documents`);
    }

    console.log('\n✅ MongoDB connection test PASSED');
  } catch (error) {
    console.log('\n❌ MongoDB connection test FAILED');
    console.log('Error:', error.message);
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n⚠️  SSL/TLS Error Detected');
      console.log('This is usually caused by:');
      console.log('  1. Firewall blocking MongoDB Atlas');
      console.log('  2. Corporate proxy intercepting SSL');
      console.log('  3. Antivirus software interfering');
      console.log('  4. VPN connection issues');
    }
  } finally {
    await client.close();
  }
}

testConnection();
