const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Product image URLs from seed.js
const productImages = [
  { name: 'iphone15', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800' },
  { name: 's24ultra', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800' },
  { name: 'macbook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
  { name: 'sony-headphones', url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800' },
  { name: 'nike-airmax', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
  { name: 'adidas-ultraboost', url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800' },
  { name: 'levis-jeans', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800' },
  { name: 'rayban-aviator', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800' },
  { name: 'art-of-war', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800' },
  { name: 'atomic-habits', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800' },
  { name: 'samsung-tv', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800' },
  { name: 'apple-watch', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800' },
  { name: 'induction', url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800' },
  { name: 'air-fryer', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800' },
  { name: 'mixer', url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800' },
  { name: 'dyson', url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800' },
  { name: 'yoga-mat', url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800' },
  { name: 'football', url: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800' },
  { name: 'badminton', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800' },
  { name: 'lakme-set', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800' },
  { name: 'foundation', url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800' },
  { name: 'boat-headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
  { name: 'logitech-mouse', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800' },
  { name: 'ikea-shelf', url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800' },
  { name: 'sherlock', url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800' },
];

const downloadDir = path.join(__dirname, 'temp-images');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (res2) => {
          const fileStream = fs.createWriteStream(filepath);
          res2.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(filepath);
          });
        }).on('error', reject);
        return;
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
    }).on('error', reject);
  });
}

async function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      folder: 'ecommerce/products',
      public_id: publicId,
      width: 800,
      crop: 'scale',
      quality: 'auto',
      fetch_format: 'auto',
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function main() {
  console.log('Starting Cloudinary upload...\n');

  // Create temp directory
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const results = [];

  for (let i = 0; i < productImages.length; i++) {
    const { name, url } = productImages[i];
    const ext = '.jpg';
    const localPath = path.join(downloadDir, `${name}${ext}`);

    try {
      console.log(`[${i + 1}/${productImages.length}] Downloading ${name}...`);
      await downloadImage(url, localPath);

      console.log(`  Uploading ${name} to Cloudinary...`);
      const result = await uploadToCloudinary(localPath, name);

      results.push({ name, public_id: result.public_id, url: result.secure_url });
      console.log(`  ✓ Done: ${result.secure_url}\n`);

      // Clean up local file
      fs.unlinkSync(localPath);
    } catch (error) {
      console.error(`  ✗ Failed for ${name}: ${error.message}\n`);
    }
  }

  // Clean up temp directory
  if (fs.existsSync(downloadDir)) {
    fs.rmdirSync(downloadDir);
  }

  console.log('\n=== UPLOAD RESULTS ===\n');
  results.forEach(r => {
    console.log(`${r.name}: ${r.url}`);
  });

  console.log('\n\n=== SEED.JS IMAGES ARRAY ===\n');
  results.forEach(r => {
    console.log(`images: [{ public_id: '${r.public_id}', url: '${r.url}' }]`);
  });

  console.log(`\n\n${results.length}/${productImages.length} images uploaded successfully.`);
}

main().catch(console.error);
