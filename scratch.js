const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); // Assuming there's some service account OR default credentials work

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

async function check() {
    const snap = await db.collection("products").limit(5).get();
    snap.docs.forEach(d => {
        console.log(d.id, "=> quantity:", d.data().quantity, "type:", typeof d.data().quantity);
    });
}
check().catch(console.error);
