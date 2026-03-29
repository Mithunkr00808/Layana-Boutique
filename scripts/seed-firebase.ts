// Load environment variables BEFORE any Firebase imports
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Verify env vars are loaded
console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`Client Email: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing'}`);
console.log(`Private Key: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`);

// Use dynamic imports so dotenv runs first
async function main() {
  const { adminDb } = await import('../src/lib/firebase/admin');
  const { newArrivals, readyToWearProducts, journalArticles, productDetailMock, relatedProducts, cartItemsMock } = await import('../src/data/mockData');

  console.log('\n🌱 Seeding Database...');

  const batch = adminDb.batch();

  console.log(`  → Pushing ${newArrivals.length} New Arrivals...`);
  for (const item of newArrivals) {
    const docRef = adminDb.collection('products').doc(`new-arrival-${item.id}`);
    batch.set(docRef, { ...item, category: 'new-arrivals' });
  }

  console.log(`  → Pushing ${readyToWearProducts.length} Ready-to-Wear Products...`);
  for (const item of readyToWearProducts) {
    const docRef = adminDb.collection('products').doc(`rtw-${item.id}`);
    batch.set(docRef, { ...item, category: 'ready-to-wear' });
  }

  console.log(`  → Pushing ${journalArticles.length} Journal Articles...`);
  for (const article of journalArticles) {
    const docRef = adminDb.collection('articles').doc(`article-${article.id}`);
    batch.set(docRef, { ...article });
  }

  console.log(`  → Pushing Product Detail (${productDetailMock.id})...`);
  const detailRef = adminDb.collection('productDetails').doc(productDetailMock.id);
  batch.set(detailRef, { ...productDetailMock });

  console.log(`  → Pushing ${relatedProducts.length} Related Products...`);
  for (const item of relatedProducts) {
    const docRef = adminDb.collection('products').doc(`related-${item.id}`);
    batch.set(docRef, { ...item, category: 'related' });
  }

  console.log(`  → Pushing ${cartItemsMock.length} Cart Items...`);
  for (const item of cartItemsMock) {
    const docRef = adminDb.collection('cartItems').doc(item.id);
    batch.set(docRef, { ...item });
  }

  try {
    await batch.commit();
    console.log('\n✅ Successfully seeded Firebase Firestore with all data!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
  }
}

main().then(() => process.exit(0));
