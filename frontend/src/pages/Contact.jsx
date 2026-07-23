import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  Clock,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Headphones,
  ShoppingBag,
  HelpCircle,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Award,
  Leaf
} from 'lucide-react';
import Loader from '../components/ui/Loader';
import { contactService } from '../api/contactService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductsQuery } from '../hooks/queries/useProductsQuery';
import ProductCard from '../components/ProductCard';

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const Contact = () => {
  useDocumentTitle('Contact Us — Fabish Support & Enquiries');

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Recommended products query
  const { data: recommendedProducts = [], isLoading: productsLoading } = useProductsQuery({ limit: 4 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setSuccess('');
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMsg = message.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cleanMsg) {
      setError('Please enter your message.');
      return;
    }

    setLoading(true);

    try {
      const res = await contactService.submit({ name: cleanName, email: cleanEmail, message: cleanMsg });

      if (res.success) {
        setSuccess('Thank you! Your message was submitted successfully. Our skincare specialists will contact you within 15 minutes.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(res.message || 'Failed to submit contact form');
      }
    } catch (err) {
      setError('Connection failed. Please try again or reach out via Live Chat.');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const quickContactCards = [
    { title: 'Call Us Directly', detail: '+1 (800) 123-4567', sub: 'Toll-Free 24x7 Hotline', icon: Phone, color: 'bg-emerald-50 text-emerald-600', action: 'tel:+18001234567', actionText: 'Call Now' },
    { title: 'Email Support', detail: 'support@fabish.com', sub: '< 15-min Average Response', icon: Mail, color: 'bg-blue-50 text-blue-600', action: 'mailto:support@fabish.com', actionText: 'Send Email' },
    { title: 'Live Chat', detail: 'Instant Specialist Chat', sub: 'Available 9 AM - 9 PM IST', icon: MessageSquare, color: 'bg-purple-50 text-purple-600', action: '#form', actionText: 'Start Chat' },
    { title: 'Store Location', detail: 'Madison Ave, Baltimore', sub: 'Visit Experience Center', icon: MapPin, color: 'bg-amber-50 text-amber-600', action: '#map', actionText: 'View Map' },
  ];

  const supportCategories = [
    { title: 'Order & Delivery Support', desc: 'Assistance with live shipment tracking, address changes, and express delivery status.' },
    { title: 'Product & Formulation Guidance', desc: 'Dermatologist advice on choosing bio-active serums tailored for your skin type.' },
    { title: 'Returns & Refund Status', desc: 'Help with initiating 30-day hassle-free returns or checking refund processing.' },
    { title: 'Wholesale & B2B Partnerships', desc: 'Inquire about stocking Fabish organic formulations in retail spas & boutiques.' },
  ];

  const whyContactPoints = [
    { title: 'Expert Skincare Guidance', desc: 'Certified dermatological formulators on standby.', icon: Sparkles },
    { title: 'Fast 15-Min Response', desc: 'Rapid resolution for all customer inquiries.', icon: Clock },
    { title: '256-Bit Encrypted Privacy', desc: 'Your contact details are strictly confidential.', icon: ShieldCheck },
    { title: '100% Organic Experts', desc: 'Natural ingredient specialists trained in India & Europe.', icon: Leaf }
  ];

  const faqPreviews = [
    { title: 'Shipping & Delivery Timelines', desc: 'Domestic orders arrive in 3-5 business days; express shipping in 48h.', cat: 'Shipping' },
    { title: '30-Day Money Back Returns', desc: 'Return any unopened product within 30 days for a full refund.', cat: 'Returns' },
    { title: 'Accepted Payment Methods', desc: 'Visa, Mastercard, Amex, Apple Pay, UPI, and Cash on Delivery.', cat: 'Payment' },
    { title: 'Tracking Your Live Order', desc: 'Use your tracking code sent via email/SMS to monitor real-time location.', cat: 'Orders' }
  ];

  return (
    <div className="w-full bg-[#faf9f5] font-body text-[#1c2415] selection:bg-[#729855] selection:text-white min-h-screen overflow-x-hidden">

      {/* =========================================================
         1. HERO CONTACT BANNER
         ========================================================= */}
      <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#f4f2e6] via-[#edebe0] to-[#faf9f5] border-b border-[#e2dfce] px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Ambient Botanical Glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#729855]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#d2e2c5]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="max-w-[1340px] w-full mx-auto relative z-10 text-center">

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] mb-4">
            <Link to="/" className="hover:text-[#3a4d23] transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#1c2415]">Contact Us</span>
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e2dfce] text-[10px] font-heading font-bold uppercase tracking-widest text-[#3a4d23] shadow-sm mb-4">
            <Headphones size={12} className="text-[#729855]" />
            Enterprise Customer Support
          </span>

          <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1c2415] leading-tight tracking-tight mb-4 max-w-4xl mx-auto">
            We're Here To Help
          </h1>
          <p className="text-gray-600 font-body font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Have questions about organic formulations, order tracking, or personalized routine selection? Our skincare specialists are ready to assist you.
          </p>

          {/* Support Stats Header Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23]">
            <span className="flex items-center gap-1.5 bg-white/80 px-4 py-2 rounded-full border border-[#e2dfce] shadow-sm">
              <Clock size={14} className="text-[#729855]" /> Support Hours: 24x7 Global Assistance
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 px-4 py-2 rounded-full border border-[#e2dfce] shadow-sm">
              <Sparkles size={14} className="text-[#729855]" /> Average Response: &lt; 15 Mins
            </span>
          </div>

        </div>
      </section>


      {/* =========================================================
         2. QUICK CONTACT CARDS
         ========================================================= */}
      <section className="py-12 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickContactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-[#e2dfce] rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-[#1c2415] mb-1">{card.title}</h3>
                  <p className="font-heading font-bold text-sm text-[#3a4d23] mb-1">{card.detail}</p>
                  <p className="text-xs text-gray-400 font-body">{card.sub}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                  <a
                    href={card.action}
                    className="text-xs font-heading font-bold uppercase tracking-wider text-[#729855] hover:text-[#3a4d23] flex items-center gap-1 transition-colors"
                  >
                    {card.actionText} <ArrowRight size={13} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* =========================================================
         3 & 4. BRANCH OFFICE INFO + GLASS CONTACT FORM
         ========================================================= */}
      <section id="form" className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: USA & India Head Office Cards */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-2">
                GLOBAL HEADQUARTERS
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415] leading-tight mb-4">
                Our Experience Centers
              </h2>
              <p className="text-sm text-gray-600 font-body font-light leading-relaxed">
                Visit our physical skincare consultation suites or reach out directly to our administration team.
              </p>
            </div>

            {/* USA Office Card */}
            <div className="bg-white border border-[#e2dfce] rounded-[28px] p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#1c2415]">USA Head Office</h3>
                  <p className="text-xs text-gray-400 font-body">Baltimore Experience Suite</p>
                </div>
                <span className="bg-[#eef4ea] text-[#3a4d23] px-3 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider">
                  HEADQUARTERS
                </span>
              </div>

              <div className="space-y-4 text-xs text-gray-600 font-body">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#729855] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1c2415] block mb-0.5">Address:</strong>
                    <span>No. 58 A, East Madison Street, Baltimore, MD, USA 4508</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#729855] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1c2415] block mb-0.5">Email Support:</strong>
                    <a href="mailto:info@fabish.com" className="text-[#3a4d23] hover:underline">info@fabish.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-[#729855] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1c2415] block mb-0.5">Toll-Free Phone:</strong>
                    <span>+1 (800) 123-4567</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => copyAddress('No. 58 A, East Madison Street, Baltimore, MD, USA 4508')}
                  className="text-xs font-heading font-bold uppercase tracking-wider text-gray-600 hover:text-black flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                >
                  {copiedAddr ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedAddr ? 'COPIED' : 'COPY ADDRESS'}
                </button>

                <a
                  href="#map"
                  className="text-xs font-heading font-bold uppercase tracking-wider text-[#729855] hover:text-[#3a4d23] flex items-center gap-1"
                >
                  DIRECTIONS <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Support Working Hours Card */}
            <div className="bg-gradient-to-br from-[#3a4d23] to-[#1c2415] rounded-[28px] p-8 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[#d2e2c5]" />
                <h3 className="font-heading font-bold text-lg">Support Working Hours</h3>
              </div>
              <div className="space-y-2 text-xs text-white/80 font-body border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span>Monday — Friday:</span>
                  <span className="font-bold text-white">9:00 AM — 9:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday — Sunday:</span>
                  <span className="font-bold text-white">10:00 AM — 6:00 PM IST</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-[#d2e2c5]">
                  <span>24x7 Live Chat:</span>
                  <span className="font-bold">Always Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Modern Glass Contact Form */}
          <div className="lg:col-span-7 bg-white border border-[#e2dfce] rounded-[32px] p-8 sm:p-12 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-[#1c2415] mb-2">
              Send Us a Message
            </h2>
            <p className="text-sm text-gray-500 font-body font-light mb-8">
              Fill out your details below and our formulation team will respond promptly.
            </p>

            {/* Alert Messages */}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold mb-6">
                {error}
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#1c2415]">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#faf9f5] border border-[#e8e6d9] rounded-2xl px-5 py-4 text-xs text-[#1c2415] focus:outline-none focus:border-[#729855] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#1c2415]">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf9f5] border border-[#e8e6d9] rounded-2xl px-5 py-4 text-xs text-[#1c2415] focus:outline-none focus:border-[#729855] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#1c2415]">
                    Message / Inquiry <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-body">{message.length}/500 chars</span>
                </div>
                <textarea
                  required
                  rows={5}
                  maxLength={500}
                  placeholder="Tell us about your order, skin concern, or product query..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#faf9f5] border border-[#e8e6d9] rounded-2xl p-5 text-xs text-[#1c2415] focus:outline-none focus:border-[#729855] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="save-info"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3a4d23] focus:ring-[#729855] cursor-pointer"
                />
                <label htmlFor="save-info" className="text-xs text-gray-600 font-body cursor-pointer select-none">
                  Save my details securely in this browser for future inquiries.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-[#3a4d23] hover:bg-[#1c2415] text-white font-heading text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer border-none"
              >
                {loading ? <Loader size="small" /> : (
                  <>
                    <span>SUBMIT MESSAGE</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>


      {/* =========================================================
         5. INTERACTIVE MAP SECTION
         ========================================================= */}
      <section id="map" className="py-12 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="bg-white border border-[#e2dfce] rounded-[36px] overflow-hidden shadow-xl p-4 relative">
          <div className="w-full h-[400px] sm:h-[480px] rounded-[28px] overflow-hidden relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d155354.23419917535!2d-2.033649514742807!3d52.47752146959966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870942d1b417173%3A0x1a870eb132c85b18!2sBirmingham%2C%20UK!5e0!3m2!1sen!2sin!4v1719730000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-[0.95]"
              title="Fabish Experience Center Location Map"
            />
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-2xl max-w-xs hidden sm:block">
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#729855] block mb-1">
                FLAGSHIP STORE
              </span>
              <p className="font-heading font-bold text-sm text-[#1c2415] mb-1">Fabish Botanical Lounge</p>
              <p className="text-xs text-gray-500 font-body mb-3">Open Daily for Skincare Consultations</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3a4d23] text-white font-heading text-[10px] font-bold uppercase tracking-wider rounded-full"
              >
                OPEN IN GOOGLE MAPS <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
         6. CUSTOMER SUPPORT CATEGORIES
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/60 border-y border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
              SUPPORT DOMAINS
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              How Can We Help You Today?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((cat, idx) => (
              <div key={idx} className="bg-white border border-[#e2dfce] rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-[#1c2415] group-hover:text-[#729855] transition-colors mb-2">{cat.title}</h3>
                  <p className="text-xs text-gray-600 font-body font-light leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                  <a href="#form" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
                    GET HELP <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         7. AMAZON STYLE RECOMMENDED PRODUCTS SECTION
         ========================================================= */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-[1340px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-1">
              DISCOVER BOTANICALS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#1c2415]">
              Top Rated Formulations
            </h2>
          </div>
          <Link to="/collections/all" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
            EXPLORE ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </section>


      {/* =========================================================
         8. WHY CONTACT FABISH (Feature Grid)
         ========================================================= */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[12px] font-bold text-[#729855] tracking-[0.25em] uppercase mb-2 block font-heading">
              OUR SERVICE COMMITMENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-[#1c2415]">
              Why Contact Fabish Customer Support
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyContactPoints.map((pt, idx) => {
              const Icon = pt.icon;
              return (
                <div key={idx} className="bg-[#faf9f5] border border-[#e2dfce] rounded-[24px] p-6 text-center space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#3a4d23] flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#1c2415]">{pt.title}</h3>
                  <p className="text-xs text-gray-500 font-body font-light leading-relaxed">{pt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================
         9. FAQ PREVIEW SECTION
         ========================================================= */}
      <section className="py-16 lg:py-20 px-4 sm:px-8 lg:px-16 bg-[#f4f2e6]/50 border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-[#729855] block mb-1">
                KNOWLEDGE BASE
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#1c2415]">
                Quick Answers to Top Inquiries
              </h2>
            </div>
            <Link to="/pages/faq" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
              VIEW ALL FAQS <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqPreviews.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#e2dfce] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#729855] block mb-2">{faq.cat}</span>
                  <h3 className="font-heading font-semibold text-base text-[#1c2415] mb-2 leading-snug">{faq.title}</h3>
                  <p className="text-xs text-gray-500 font-body font-light leading-relaxed">{faq.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                  <Link to="/pages/faq" className="text-xs font-heading font-bold uppercase tracking-wider text-[#3a4d23] hover:text-[#729855] flex items-center gap-1">
                    READ FAQ <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================
         10. INSTAGRAM MEDIA GALLERY STRIP
         ========================================================= */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-white border-t border-[#e2dfce]">
        <div className="max-w-[1340px] mx-auto text-center mb-8">
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#729855] block mb-1">
            INSTAGRAM @FABISHBEAUTY
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-medium text-[#1c2415]">
            Join Our Botanical Community
          </h2>
        </div>

        <div className="max-w-[1340px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {['/assets/insta-img-6.jpg', '/assets/insta-img-3.jpg', '/assets/insta-img-5.jpg', '/assets/insta-img-4.jpg'].map((img, idx) => (
            <div key={idx} className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer bg-[#f4f2e6]">
              <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 text-[#1c2415] flex items-center justify-center shadow-lg">
                  <Instagram size={18} />
                </div>
              </div>
            </div>
          ))}

          {/* Video Tile */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer bg-black">
            <video src="/assets/73b7434b832e4989a63b1d48f8e21ccf.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 text-[#1c2415] flex items-center justify-center shadow-lg">
                <Instagram size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
         11 & 12. LUXURY NEWSLETTER & CTA BANNER
         ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-r from-[#3a4d23] via-[#2a3818] to-[#1c2415] text-white relative overflow-hidden">
        <div className="max-w-[900px] mx-auto text-center space-y-6 relative z-10">
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#d2e2c5]">
            DIRECT ASSISTANCE
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-medium leading-tight">
            Need Personalized Skincare Advice?
          </h2>
          <p className="text-white/80 font-body font-light text-sm sm:text-base max-w-xl mx-auto">
            Subscribe to our weekly dispatch or connect directly with our beauty experts today.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="w-full bg-white/90 backdrop-blur-md border-none rounded-full px-6 py-3.5 text-xs text-[#1c2415] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#729855]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#729855] hover:bg-white hover:text-[#1c2415] font-heading text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer border-none shadow-lg flex-shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>

          {subscribed && (
            <p className="text-xs text-[#d2e2c5] font-bold uppercase tracking-wider animate-bounce">
              ✓ Thank you for subscribing to Fabish updates!
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default Contact;