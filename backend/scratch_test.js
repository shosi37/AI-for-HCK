const admin = require('./config/firebase');

async function run() {
  try {
    console.log('Firebase Admin Initialized successfully.');
    
    // List users
    console.log('Fetching users from Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers(10);
    console.log(`Successfully fetched ${listUsersResult.users.length} users:`);
    listUsersResult.users.forEach(user => {
      console.log(`- UID: ${user.uid}, Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error in scratch test:', error);
  }
}

run();
