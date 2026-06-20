import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0820] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>SN</div>
              <span className="font-display font-bold text-lg text-white">Shop<span className="gradient-text">Nova</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Your ultimate destination for premium curated products. Shop quality items with fast delivery and secure payments.
            </p>
            <div className="flex gap-3">
              <SocialLink icon={<FiFacebook />} href="#" title="Facebook" />
              <SocialLink icon={<FiTwitter />} href="#" title="Twitter" />
              <SocialLink icon={<FiInstagram />} href="#" title="Instagram" />
              <SocialLink icon={<FiLinkedin />} href="#" title="LinkedIn" />
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">Shopping</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/products">All Products</FooterLink>
              <FooterLink to="/products?category=electronics">Electronics</FooterLink>
              <FooterLink to="/products?category=fashion">Fashion</FooterLink>
              <FooterLink to="/products?category=home-living">Home & Living</FooterLink>
              <FooterLink to="/cart">Shopping Cart</FooterLink>
              <FooterLink to="/wishlist">Wishlist</FooterLink>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">Account</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/login">Sign In</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
              <FooterLink to="/dashboard">My Account</FooterLink>
              <FooterLink to="/dashboard?tab=orders">Order History</FooterLink>
              <FooterLink to="/wishlist">My Wishlist</FooterLink>
              <FooterLink to="/dashboard?tab=settings">Settings</FooterLink>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">Help & Support</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/">Help Center</FooterLink>
              <FooterLink to="/">Track Order</FooterLink>
              <FooterLink to="/">Shipping Info</FooterLink>
              <FooterLink to="/">Return Policy</FooterLink>
              <FooterLink to="/">FAQ</FooterLink>
              <FooterLink to="/">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">Contact</h4>
            <div className="space-y-4 text-sm text-slate-500">
              <div className="flex items-start gap-3 hover:text-white transition-colors">
                <FiMapPin className="text-primary-400 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold text-white mb-1">Address</p>
                  <p>Sector-V, Salt Lake<br />Kolkata, WB 700091</p>
                </div>
              </div>
              <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <FiPhone className="text-primary-400 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold text-white mb-1">Phone</p>
                  <p>+91 (123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3 hover:text-white transition-colors">
                <FiMail className="text-primary-400 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <p className="text-blue-400 hover:underline">hello@shopnova.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm text-center md:text-left">
            &copy; {currentYear} ShopNova. All rights reserved. Built with <FiHeart className="inline text-red-500 mx-1" size={16} /> for modern shoppers
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-slate-600">
            <FooterLink to="/" className="hover:text-white">Privacy Policy</FooterLink>
            <FooterLink to="/" className="hover:text-white">Terms of Service</FooterLink>
            <FooterLink to="/" className="hover:text-white">Cookie Policy</FooterLink>
            <FooterLink to="/" className="hover:text-white">Sitemap</FooterLink>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-500 text-xs mb-3">🔒 Secure Checkout Powered by Razorpay & Stripe</p>
          <p className="text-slate-600 text-xs">
            Your payment information is encrypted and never stored on our servers
          </p>
        </div>
      </div>
    </footer>
  )
}

const SocialLink = ({ icon, href, title }) => (
  <a 
    href={href}
    title={title}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
  >
    {icon}
  </a>
)

const FooterLink = ({ to, children, className = '' }) => (
  <li>
    <Link 
      to={to}
      className={`text-slate-500 hover:text-primary-400 transition-colors duration-200 ${className}`}
    >
      {children}
    </Link>
  </li>
)

export default Footer
