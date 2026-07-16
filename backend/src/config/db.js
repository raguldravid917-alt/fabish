const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fabish';
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Optimize connection pooling for production
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default Badges
    const Badge = require('../models/Badge');
    const defaultBadges = [
      { name: 'Featured', slug: 'featured', description: 'Featured products showcase' },
      { name: 'Best Seller', slug: 'bestseller', description: 'Top selling items' },
      { name: 'New Arrival', slug: 'newarrival', description: 'Newly launched collection items' },
      { name: 'Trending', slug: 'trending', description: 'Popular or trending items' },
    ];
    for (const b of defaultBadges) {
      await Badge.updateOne({ slug: b.slug }, { $setOnInsert: b }, { upsert: true });
    }
    console.log('Default product badges verified/seeded successfully');

    // Run legacy variant migration automatically to prevent CastToObjectId errors
    const Variant = require('../models/Variant');
    try {
      const rawProducts = await mongoose.connection.db.collection('products').find({}).toArray();
      let migratedCount = 0;

      for (const prod of rawProducts) {
        if (!prod.variants || prod.variants.length === 0) continue;

        let hasChanges = false;
        const validVariantIds = [];

        for (const variantItem of prod.variants) {
          if (variantItem instanceof mongoose.Types.ObjectId || (mongoose.Types.ObjectId.isValid(variantItem) && /^[0-9a-fA-F]{24}$/.test(String(variantItem)))) {
            validVariantIds.push(new mongoose.Types.ObjectId(variantItem));
          } else if (typeof variantItem === 'string' && variantItem.trim() !== '') {
            let variantDoc = await Variant.findOne({ product: prod._id, name: variantItem.trim() });
            if (!variantDoc) {
              variantDoc = await Variant.create({
                product: prod._id,
                name: variantItem.trim(),
                sku: `${prod.title.substring(0, 5).toUpperCase().replace(/\s+/g, '')}-${variantItem.trim().toUpperCase().replace(/\s+/g, '')}`,
                price: prod.price || 0,
                stock: prod.stock || 0
              });
              console.log(`[MIGRATION] Created Variant document "${variantItem.trim()}" for Product "${prod.title}"`);
            }
            validVariantIds.push(variantDoc._id);
            hasChanges = true;
          } else {
            console.warn(`[MIGRATION WARNING] Skipping malformed variant item on product "${prod.title}":`, variantItem);
          }
        }

        if (hasChanges) {
          await mongoose.connection.db.collection('products').updateOne(
            { _id: prod._id },
            { $set: { variants: validVariantIds } }
          );
          migratedCount++;
        }
      }

      if (migratedCount > 0) {
        console.log(`[MIGRATION SUCCESS] Successfully migrated ${migratedCount} products with legacy string variants to Variant documents`);
      }
    } catch (migErr) {
      console.error('[MIGRATION ERROR] Failed to migrate legacy variants:', migErr);
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
