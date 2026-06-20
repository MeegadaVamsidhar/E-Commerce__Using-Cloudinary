# ShopNova - Premium Full-Stack E-Commerce

A modern, high-performance MERN stack e-commerce platform built with React, Redux Toolkit, Tailwind CSS, Express, and MongoDB. It includes secure JWT authentication, Razorpay payments, Cloudinary image hosting, and an admin dashboard.

Cloudinary is fully integrated for product image upload, optimization, and delivery.

## Key Features
- Modern UI and responsive layout built with Tailwind CSS.
- Secure authentication with JWT, bcrypt, and role-based access control for admin and user accounts.
- Product management with Cloudinary image upload and optimization.
- Persistent cart and wishlist data stored in MongoDB.
- Secure checkout flow with Razorpay.
- Admin dashboard for analytics, order management, and user controls.
- Fast page loading with React lazy loading and Suspense.
- Security protections with Helmet, CORS, and API validation.

### Cloudinary Implementation Highlights
- Cloud-based image storage for product images, user avatars, and media files.
- Automatic compression, resizing, and format conversion for better performance.
- Upload support for admin and seller product forms.
- Secure delivery through Cloudinary's global CDN.
- Responsive image URLs for different screen sizes and devices.
- Error handling and fallback behavior included in the upload flow.

---

## Tech Stack
- Frontend: React (Vite), Redux Toolkit, React Router, Tailwind CSS, Axios, React Hot Toast.
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt.
- Third-party services: Razorpay for payments and Cloudinary for images.

---

## Cloudinary Integration

This project uses Cloudinary for scalable image storage and optimization. All product images, user avatars, and uploaded files are served through Cloudinary for better performance and simpler management.

### Where Cloudinary is Used

| Feature | Implementation | File |
|---------|----------------|------|
| Product Images | Admin and seller product photo uploads | [uploadController.js](server/controllers/uploadController.js) |
| User Avatars | Profile picture upload support | [userController.js](server/controllers/userController.js) |
| Admin Dashboard | Image management and optimization | [AdminProductForm.jsx](client/src/pages/admin/AdminProductForm.jsx) |
| Seller Products | Seller product image uploads | [SellerProductForm.jsx](client/src/pages/SellerProductForm.jsx) |
| Frontend Upload | Upload interface with preview | [FileUpload.jsx](client/src/components/common/FileUpload.jsx) |
| Image Deletion | Cleanup when products or users are deleted | [productController.js](server/controllers/productController.js) |

### What Cloudinary Provides
- Enterprise-grade cloud-based image and video management platform
- Automatic image optimization (resizing, compression, format conversion)
- Global CDN for fast image delivery across all regions
- Secure storage with access control and API authentication
- Free tier: 25 GB storage (more than enough for small-medium projects)

### Setup Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com/users/register/free).
2. Copy the following values from your Cloudinary dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Add them to your server environment file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Integration Points

Backend configuration is handled in [server/config/cloudinary.js](server/config/cloudinary.js):
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

Image upload endpoints:
- `POST /api/upload` uploads product images through [server/controllers/uploadController.js](server/controllers/uploadController.js)
- `POST /api/products/upload` handles seller product image uploads
- Supports `image/jpeg`, `image/png`, `image/webp`

Frontend upload is handled in [client/src/components/common/FileUpload.jsx](client/src/components/common/FileUpload.jsx):
- Drag-and-drop image upload with preview
- Auto-compression before server transmission
- Progress indicator during upload

### Usage Examples

Upload a product image from the frontend:
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

const imageUrl = response.data.url; // Cloudinary URL
```

Delete an image from the backend:
```javascript
// Automatically handled when product is deleted
cloudinary.uploader.destroy(publicId);
```

### Best Practices
- Use dynamic URLs for responsive images.
- Enable image compression to reduce bandwidth.
- Set expiration on temporary uploads where needed.
- Keep the API Secret in the server-side environment file only.
- Monitor Cloudinary usage in the dashboard.

---

## Local Development Setup

### 1. Clone and Install Dependencies
Clone the repository and install packages for both client and server:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` values into `.env` files in both directories.

Server environment file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopnova
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
```

Client environment file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Servers
Open two terminals to run the application:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Browse the application at `http://localhost:5173`.
To access admin features, change a user's role from user to admin in MongoDB.

---

## Deployment Instructions
- Frontend deployment: deploy the client directory to Vercel or Netlify using `npm run build` and publish `dist`.
- Backend deployment: deploy the server directory to Render or Railway using `npm install` and `npm start`.
- Database: use MongoDB Atlas and update `MONGO_URI`.

---

## Security Implementations
- Passwords are hashed before being stored in MongoDB.
- The REST API is protected against XSS and sniffing with Helmet.
- Request origins are validated with CORS.
- Non-logged-in users are blocked from cart and wishlist endpoints.
