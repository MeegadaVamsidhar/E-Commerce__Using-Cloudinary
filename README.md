# 🛍️ ShopNova - Premium Full-Stack E-Commerce

A modern, high-performance, and fully responsive MERN stack e-commerce platform built with React, Redux Toolkit, Tailwind CSS, Express, and MongoDB. Features secure JWT authentication, Razorpay integration, Cloudinary image hosting, and an advanced Admin Dashboard.

## ✨ Key Features
- **Modern UI/UX**: "Glassmorphism" design with Tailwind CSS and responsive layout.
- **Authentication**: JWT & bcrypt secure login/registration with Role-Based Access Control (Admin/User).
- **Product Management**: Full CRUD operations for admin, with Cloudinary image upload.
- **Shopping Experience**: Persistent cart & wishlist stored in MongoDB.
- **Checkout**: Seamless and secure integration via **Razorpay**.
- **Admin Dashboard**: Analytics, order management, and user controls.
- **Performance**: React `lazy()` and `Suspense` for code-splitting, resulting in fast load times.
- **Security**: Protected with Helmet, CORS, and comprehensive API validation.

---

## 🚀 Tech Stack
- **Frontend**: React (Vite), Redux Toolkit, React Router, Tailwind CSS, Axios, React-Hot-Toast.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt.
- **Third-Party**: Razorpay (Payments), Cloudinary (Images).

---

## ☁️ Cloudinary Integration

This project uses **Cloudinary** for scalable cloud-based image storage and optimization. All product images, user avatars, and uploaded files are hosted on Cloudinary.

### **What is Cloudinary?**
- ☁️ Cloud-based image and video management platform
- 🎯 Automatic image optimization (resizing, compression, format conversion)
- 🚀 Global CDN for fast image delivery
- 🔒 Secure storage with access control

### **Setup Cloudinary**

1. **Create a Free Account**: Visit [cloudinary.com](https://cloudinary.com/users/register/free) and sign up
2. **Get API Credentials**: From your dashboard, note these values:
   - **Cloud Name**: Your unique identifier
   - **API Key**: Public authentication key
   - **API Secret**: Private authentication key (never expose publicly)

3. **Add to `.env`**:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Integration Points**

**Backend Configuration** ([server/config/cloudinary.js](server/config/cloudinary.js)):
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

**Image Upload Endpoints**:
- `POST /api/upload` - Upload product images ([server/controllers/uploadController.js](server/controllers/uploadController.js))
- `POST /api/products/upload` - Seller product image upload
- Supports `image/jpeg`, `image/png`, `image/webp`

**Frontend Upload** ([client/src/components/common/FileUpload.jsx](client/src/components/common/FileUpload.jsx)):
- Drag-and-drop image upload with preview
- Auto-compression before server transmission
- Progress indicator during upload

### **Usage Examples**

**Upload a Product Image (Frontend)**:
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

const imageUrl = response.data.url; // Cloudinary URL
```

**Delete Image (Backend)**:
```javascript
// Automatically handled when product is deleted
cloudinary.uploader.destroy(publicId);
```

### **Best Practices**
✅ Use dynamic URLs for responsive images (Cloudinary auto-resizes)
✅ Enable image compression to reduce bandwidth
✅ Set expiration on temporary uploads
✅ Keep API Secret in server-side `.env` only
✅ Monitor Cloudinary usage in dashboard (free tier: 25 GB storage)

---

## 🛠️ Local Development Setup

### 1. Clone & Install Dependencies
First, clone the repository and install packages for both client and server:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` configurations to `.env` files in both directories.

**`server/.env`**:
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

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Servers
Open two terminals to run the system:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Browse the application at `http://localhost:5173`. 
To access the Admin features, change a user's `role` property from `'user'` to `'admin'` manually in your MongoDB database.

---

## 📦 Deployment Instructions
- **Frontend (Vercel/Netlify)**: Deploy the `client` directory. Build command: `npm run build`, Publish directory: `dist`. Uses `vercel.json` for SPA routing.
- **Backend (Render/Railway)**: Deploy the `server` directory. Build command: `npm install`, Start command: `npm start`. Set all environment variables securely.
- **Database**: Use MongoDB Atlas for a free, persistent cloud database and update the `MONGO_URI`.

---

## 🛡️ Security Implementations 
- Passwords mathematically hashed before resting in MongoDB.
- REST API securely shielded against XSS and sniffing via **Helmet**.
- Request origins validated via **CORS**.
- Non-logged-in users inherently blocked from Cart/Wishlist endpoints.
