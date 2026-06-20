const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const ProductGroup = require('./models/ProductGroup');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await ProductGroup.deleteMany({});
    console.log('Cleared existing data...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'meegadavamsi6@gmail.com',
      password: 'Vamsi@7670',
      role: 'admin',
      phone: '9010384319'
    });
    console.log('Admin user created...');

    // Create a sample seller
    const sellerUser = await User.create({
      name: 'TechStore',
      email: 'techstore@example.com',
      password: 'Seller@123',
      role: 'seller',
      phone: '9876543210',
      isSeller: true,
      sellerInfo: {
        storeName: 'TechStore',
        storeDescription: 'Premium electronics seller',
        status: 'approved',
        approvedAt: new Date(),
        commissionRate: 10
      }
    });
    console.log('Seller user created...');

    // Create another seller for price comparison
    const sellerUser2 = await User.create({
      name: 'GadgetWorld',
      email: 'gadgetworld@example.com',
      password: 'Seller@123',
      role: 'seller',
      phone: '9876543211',
      isSeller: true,
      sellerInfo: {
        storeName: 'GadgetWorld',
        storeDescription: 'Affordable gadgets and gadgets',
        status: 'approved',
        approvedAt: new Date(),
        commissionRate: 12
      }
    });
    console.log('Second seller user created...');

    // Product groups with shared info (name, images, description, category)
    const productGroups = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, and advanced camera system. Features a 6.7-inch Super Retina XDR display with ProMotion technology.',
        category: 'Electronics',
        brand: 'Apple',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/iphone15', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=iPhone+15' }]
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung Galaxy S24 Ultra with built-in S Pen, 200MP camera, and AI features. Titanium frame with 6.8-inch Dynamic AMOLED display.',
        category: 'Electronics',
        brand: 'Samsung',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/s24ultra', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=S24+Ultra' }]
      },
      {
        name: 'MacBook Air M3',
        description: 'Ultra-thin laptop with M3 chip, 15.3-inch Liquid Retina display, 18-hour battery life, and fanless design. Perfect for professionals.',
        category: 'Electronics',
        brand: 'Apple',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/macbook', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=MacBook' }]
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. 30-hour battery life.',
        category: 'Electronics',
        brand: 'Sony',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/sony-headphones', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Nike Air Max 270',
        description: 'Lightweight and comfortable running shoes with Max Air unit for all-day cushioning. Breathable mesh upper with synthetic overlays.',
        category: 'Fashion',
        brand: 'Nike',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/nike-airmax', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Adidas Ultraboost 23',
        description: 'Premium running shoes with BOOST midsole for incredible energy return. Primeknit upper adapts to the changing shape of your foot.',
        category: 'Fashion',
        brand: 'Adidas',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/adidas-ultraboost', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: "Levi's 501 Original Jeans",
        description: 'The iconic straight fit jeans that started it all. Original fit with button fly. Sits at waist with a straight leg from hip to ankle.',
        category: 'Fashion',
        brand: "Levi's",
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/levis-jeans', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Ray-Ban Aviator Sunglasses',
        description: 'Classic aviator sunglasses with polarized lenses. Gold-tone metal frame with green G-15 lenses. 100% UV protection.',
        category: 'Fashion',
        brand: 'Ray-Ban',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/rayban-aviator', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'The Art of War - Sun Tzu',
        description: 'Ancient Chinese military treatise attributed to Sun Tzu. A timeless classic on strategy and tactics applicable to business and life.',
        category: 'Books',
        brand: 'Penguin',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/art-of-war', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Atomic Habits - James Clear',
        description: 'An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results. #1 New York Times bestseller.',
        category: 'Books',
        brand: 'Penguin',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/atomic-habits', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Samsung 55" Crystal 4K TV',
        description: '55-inch Crystal Processor 4K with HDR. PurColor technology for millions of shades of color. Smart TV powered by Tizen.',
        category: 'Electronics',
        brand: 'Samsung',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/samsung-tv', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Apple Watch Series 9',
        description: 'Advanced health features including blood oxygen and ECG. Always-On Retina display. Water resistant and crack resistant.',
        category: 'Electronics',
        brand: 'Apple',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/apple-watch', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Prestige Induction Cooktop',
        description: '1600 watts induction cooktop with Indian menu options. Anti-magnetic wall and push button controls. 1-year warranty.',
        category: 'Home',
        brand: 'Prestige',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/induction', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Philips Air Fryer HD9252',
        description: '4.1L capacity air fryer with Rapid Air technology. Cook with up to 90% less fat. Digital touchscreen with 7 presets.',
        category: 'Home',
        brand: 'Philips',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/air-fryer', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Pigeon Stainless Steel Mixer Grinder',
        description: '750W mixer grinder with 3 jars. Stainless steel blades for efficient grinding. 2-year warranty on product.',
        category: 'Home',
        brand: 'Pigeon',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/mixer', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Dyson V15 Detect Vacuum',
        description: 'Cordless vacuum with laser dust detection. Piezo sensor counts and sizes particles. Up to 60 minutes runtime.',
        category: 'Home',
        brand: 'Dyson',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/dyson', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Yoga Mat - Boldfit Premium',
        description: '6mm thick anti-skid yoga mat with carrying strap. NBR material for comfort and durability. Perfect for yoga, pilates, and exercise.',
        category: 'Sports',
        brand: 'Boldfit',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/yoga-mat', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Cosco Football Size 5',
        description: 'FIFA quality pro football. Machine stitched for durability. Butyl bladder for better air retention.',
        category: 'Sports',
        brand: 'Cosco',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/football', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Yonex Badminton Racket',
        description: 'Lightweight graphite badminton racket. Isometric head shape for larger sweet spot. Pre-strung with durable nylon string.',
        category: 'Sports',
        brand: 'Yonex',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/badminton', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Lakme Absolute Skin Set',
        description: 'Complete skincare kit with face wash, moisturizer, and serum. Enriched with vitamin C and niacinamide for glowing skin.',
        category: 'Beauty',
        brand: 'Lakme',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/lakme-set', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Maybelline Fit Me Foundation',
        description: 'Oil-free liquid foundation that matches skin tone and texture. Provides natural medium coverage with a matte finish.',
        category: 'Beauty',
        brand: 'Maybelline',
        isFeatured: true,
        images: [{ public_id: 'ecommerce/products/foundation', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'boAt Rockerz 450',
        description: 'Wireless Bluetooth headphones with 40mm drivers. Up to 15 hours playback. Dual mode with padded ear cushions.',
        category: 'Electronics',
        brand: 'boAt',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/boat-headphones', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'Logitech MX Master 3S',
        description: 'Wireless performance mouse with 8K DPI tracking. Quiet clicks and electromagnetic scrolling. Works on any surface.',
        category: 'Electronics',
        brand: 'Logitech',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/logitech-mouse', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'IKEA KALLAX Shelf Unit',
        description: 'Versatile 4-cube shelf unit. Can be wall-mounted or freestanding. Perfect for books, decor, or storage boxes.',
        category: 'Home',
        brand: 'IKEA',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/ikea-shelf', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      },
      {
        name: 'The Complete Sherlock Holmes',
        description: 'All 4 novels and 56 short stories in one volume. Arthur Conan Doyle\'s masterful detective stories in a collector\'s edition.',
        category: 'Books',
        brand: 'Wordsworth',
        isFeatured: false,
        images: [{ public_id: 'ecommerce/products/sherlock', url: 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product' }]
      }
    ];

    // Create product groups
    const createdGroups = await ProductGroup.insertMany(productGroups);
    console.log(`${createdGroups.length} product groups created...`);

    // Create seller listings with different prices for some products
    const sellerListings = [];

    // Admin listings (original prices)
    const adminListings = [
      { productGroup: createdGroups[0]._id, name: 'iPhone 15 Pro Max', category: 'Electronics', brand: 'Apple', price: 134900, originalPrice: 159900, stock: 25, seller: adminUser._id },
      { productGroup: createdGroups[1]._id, name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', brand: 'Samsung', price: 129999, originalPrice: 144999, stock: 30, seller: adminUser._id },
      { productGroup: createdGroups[2]._id, name: 'MacBook Air M3', category: 'Electronics', brand: 'Apple', price: 114900, originalPrice: 134900, stock: 15, seller: adminUser._id },
      { productGroup: createdGroups[3]._id, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', brand: 'Sony', price: 26990, originalPrice: 34990, stock: 50, seller: adminUser._id },
      { productGroup: createdGroups[4]._id, name: 'Nike Air Max 270', category: 'Fashion', brand: 'Nike', price: 11995, originalPrice: 14995, stock: 75, seller: adminUser._id },
      { productGroup: createdGroups[5]._id, name: 'Adidas Ultraboost 23', category: 'Fashion', brand: 'Adidas', price: 16999, originalPrice: 19999, stock: 60, seller: adminUser._id },
      { productGroup: createdGroups[6]._id, name: "Levi's 501 Original Jeans", category: 'Fashion', brand: "Levi's", price: 3499, originalPrice: 4999, stock: 100, seller: adminUser._id },
      { productGroup: createdGroups[7]._id, name: 'Ray-Ban Aviator Sunglasses', category: 'Fashion', brand: 'Ray-Ban', price: 8990, originalPrice: 11990, stock: 45, seller: adminUser._id },
      { productGroup: createdGroups[8]._id, name: 'The Art of War - Sun Tzu', category: 'Books', brand: 'Penguin', price: 299, originalPrice: 499, stock: 200, seller: adminUser._id },
      { productGroup: createdGroups[9]._id, name: 'Atomic Habits - James Clear', category: 'Books', brand: 'Penguin', price: 499, originalPrice: 799, stock: 150, seller: adminUser._id },
      { productGroup: createdGroups[10]._id, name: 'Samsung 55" Crystal 4K TV', category: 'Electronics', brand: 'Samsung', price: 39990, originalPrice: 54990, stock: 20, seller: adminUser._id },
      { productGroup: createdGroups[11]._id, name: 'Apple Watch Series 9', category: 'Electronics', brand: 'Apple', price: 41900, originalPrice: 49900, stock: 35, seller: adminUser._id },
      { productGroup: createdGroups[12]._id, name: 'Prestige Induction Cooktop', category: 'Home', brand: 'Prestige', price: 2499, originalPrice: 3499, stock: 80, seller: adminUser._id },
      { productGroup: createdGroups[13]._id, name: 'Philips Air Fryer HD9252', category: 'Home', brand: 'Philips', price: 7999, originalPrice: 10995, stock: 40, seller: adminUser._id },
      { productGroup: createdGroups[14]._id, name: 'Pigeon Stainless Steel Mixer Grinder', category: 'Home', brand: 'Pigeon', price: 2999, originalPrice: 4499, stock: 65, seller: adminUser._id },
      { productGroup: createdGroups[15]._id, name: 'Dyson V15 Detect Vacuum', category: 'Home', brand: 'Dyson', price: 62900, originalPrice: 72900, stock: 15, seller: adminUser._id },
      { productGroup: createdGroups[16]._id, name: 'Yoga Mat - Boldfit Premium', category: 'Sports', brand: 'Boldfit', price: 799, originalPrice: 1499, stock: 120, seller: adminUser._id },
      { productGroup: createdGroups[17]._id, name: 'Cosco Football Size 5', category: 'Sports', brand: 'Cosco', price: 1299, originalPrice: 1999, stock: 90, seller: adminUser._id },
      { productGroup: createdGroups[18]._id, name: 'Yonex Badminton Racket', category: 'Sports', brand: 'Yonex', price: 2499, originalPrice: 3999, stock: 55, seller: adminUser._id },
      { productGroup: createdGroups[19]._id, name: 'Lakme Absolute Skin Set', category: 'Beauty', brand: 'Lakme', price: 1499, originalPrice: 2499, stock: 70, seller: adminUser._id },
      { productGroup: createdGroups[20]._id, name: 'Maybelline Fit Me Foundation', category: 'Beauty', brand: 'Maybelline', price: 399, originalPrice: 599, stock: 100, seller: adminUser._id },
      { productGroup: createdGroups[21]._id, name: 'boAt Rockerz 450', category: 'Electronics', brand: 'boAt', price: 1299, originalPrice: 2990, stock: 150, seller: adminUser._id },
      { productGroup: createdGroups[22]._id, name: 'Logitech MX Master 3S', category: 'Electronics', brand: 'Logitech', price: 8995, originalPrice: 10995, stock: 40, seller: adminUser._id },
      { productGroup: createdGroups[23]._id, name: 'IKEA KALLAX Shelf Unit', category: 'Home', brand: 'IKEA', price: 5999, originalPrice: 7999, stock: 25, seller: adminUser._id },
      { productGroup: createdGroups[24]._id, name: 'The Complete Sherlock Holmes', category: 'Books', brand: 'Wordsworth', price: 599, originalPrice: 999, stock: 180, seller: adminUser._id },
    ];

    // TechStore listings - some same products with different prices
    const techStoreListings = [
      { productGroup: createdGroups[0]._id, name: 'iPhone 15 Pro Max', category: 'Electronics', brand: 'Apple', price: 132900, originalPrice: 159900, stock: 10, seller: sellerUser._id, ratings: 4.5, numReviews: 28 },
      { productGroup: createdGroups[1]._id, name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', brand: 'Samsung', price: 127999, originalPrice: 144999, stock: 15, seller: sellerUser._id, ratings: 4.6, numReviews: 15 },
      { productGroup: createdGroups[2]._id, name: 'MacBook Air M3', category: 'Electronics', brand: 'Apple', price: 112900, originalPrice: 134900, stock: 8, seller: sellerUser._id, ratings: 4.8, numReviews: 12 },
      { productGroup: createdGroups[3]._id, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', brand: 'Sony', price: 25990, originalPrice: 34990, stock: 20, seller: sellerUser._id, ratings: 4.7, numReviews: 45 },
      { productGroup: createdGroups[11]._id, name: 'Apple Watch Series 9', category: 'Electronics', brand: 'Apple', price: 40900, originalPrice: 49900, stock: 18, seller: sellerUser._id, ratings: 4.6, numReviews: 22 },
      { productGroup: createdGroups[21]._id, name: 'boAt Rockerz 450', category: 'Electronics', brand: 'boAt', price: 1199, originalPrice: 2990, stock: 50, seller: sellerUser._id, ratings: 4.3, numReviews: 89 },
      { productGroup: createdGroups[22]._id, name: 'Logitech MX Master 3S', category: 'Electronics', brand: 'Logitech', price: 8795, originalPrice: 10995, stock: 15, seller: sellerUser._id, ratings: 4.7, numReviews: 33 },
    ];

    // GadgetWorld listings - same products with yet different prices
    const gadgetWorldListings = [
      { productGroup: createdGroups[0]._id, name: 'iPhone 15 Pro Max', category: 'Electronics', brand: 'Apple', price: 136900, originalPrice: 159900, stock: 5, seller: sellerUser2._id, ratings: 4.3, numReviews: 18 },
      { productGroup: createdGroups[1]._id, name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', brand: 'Samsung', price: 131999, originalPrice: 144999, stock: 12, seller: sellerUser2._id, ratings: 4.4, numReviews: 10 },
      { productGroup: createdGroups[3]._id, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', brand: 'Sony', price: 27990, originalPrice: 34990, stock: 25, seller: sellerUser2._id, ratings: 4.5, numReviews: 30 },
      { productGroup: createdGroups[21]._id, name: 'boAt Rockerz 450', category: 'Electronics', brand: 'boAt', price: 1249, originalPrice: 2990, stock: 60, seller: sellerUser2._id, ratings: 4.1, numReviews: 56 },
    ];

    sellerListings.push(...adminListings, ...techStoreListings, ...gadgetWorldListings);

    await Product.insertMany(sellerListings);
    console.log(`${sellerListings.length} seller listings created...`);

    // Update group stats
    for (const group of createdGroups) {
      const sellers = await Product.find({ productGroup: group._id, approvalStatus: 'approved' });
      const prices = sellers.map(s => s.price);
      const totalReviews = sellers.reduce((sum, s) => sum + s.numReviews, 0);
      const avgRating = totalReviews > 0
        ? sellers.reduce((sum, s) => sum + (s.ratings * s.numReviews), 0) / totalReviews
        : 0;

      await ProductGroup.findByIdAndUpdate(group._id, {
        sellerCount: sellers.length,
        lowestPrice: prices.length ? Math.min(...prices) : 0,
        highestPrice: prices.length ? Math.max(...prices) : 0,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
      });
    }
    console.log('Updated group stats...');

    console.log('\nSeed completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email: meegadavamsi6@gmail.com');
    console.log('Password: Vamsi@7670');
    console.log('\nSeller Credentials (TechStore):');
    console.log('Email: techstore@example.com');
    console.log('Password: Seller@123');
    console.log('\nSeller Credentials (GadgetWorld):');
    console.log('Email: gadgetworld@example.com');
    console.log('Password: Seller@123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
