const admin = require('firebase-admin');
const { Clerk } = require('@clerk/clerk-sdk-node');

admin.initializeApp({
  credential: admin.credential.cert('path/to/serviceAccountKey.json'),
});

const clerk = new Clerk({ secretKey: 'pk_test_cmVsYXRlZC1zdGFyZmlzaC01LmNsZXJrLmFjY291bnRzLmRldiQ' });
const db = admin.firestore();

async function updatePosts() {
  const postsRef = db.collection('UserPost');
  const snapshot = await postsRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.userId && data.userEmail) {
      const users = await clerk.users.getUserList({ emailAddress: [data.userEmail] });
      if (users.length > 0) {
        const userId = users[0].id;
        await postsRef.doc(doc.id).update({ userId });
        console.log(`Updated post ${doc.id} with userId ${userId}`);
      }
    }
  }
  console.log('Update complete');
}

updatePosts().catch(console.error);