import React, { useState } from 'react';
import Loader from '../components/ui/Loader';
import { Link } from 'react-router-dom'; // Added for Breadcrumbs
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { contactService } from '../api/contactService';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await contactService.submit({ name, email, message });

      if (res.success) {
        setSuccess('Thank you! Your message was submitted. We will contact you soon.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(res.message || 'Failed to submit contact form');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white font-body">

      {/* 1. TOP BANNER */}
      <div
        // Note the change from 'bg-center' to 'bg-right'
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[40px] md:text-[40px] font-heading font-medium text-[#555] mb-2 tracking-tight">
            Contact
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black">Home</Link> <span className="mx-2">|</span> Contact
          </p>
        </div>
      </div>

      {/* 2. SECTION HEADING (Matched with 1st Reference Image) */}
      <div className="max-w-[1440px] mx-auto px-10 lg:px-16 py-16">
        {/* Added 'items-start' to ensure both columns align at the top perfectly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">

          {/* Left: Contact Info */}
          <div >
            <span className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase mb-4 block">
              Contact Us
            </span>
            <h2 className="text-[35px] md:text-[36px] font-heading font-medium text-[#111] leading-[1.1] mb-12">
              Our Branch Office -
            </h2>

            <h3 className="text-[22px] font-heading font-semibold text-[#111] mb-10">
              USA Head Office
            </h3>

            <div className="space-y-10">
              {/* Visit */}
              <div className="flex items-start gap-6">
                <div className="text-[#111]">
                  {/* Made icons slightly larger and thinner stroke to match reference */}
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2v2" /><path d="M14 4a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2v4" /><path d="M10 4a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2v7" /><path d="M8 14H6a2 2 0 0 0-2 2v0a8 8 0 0 0 8 8h1a8 8 0 0 0 8-8v-5a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2h-0a2 2 0 0 0-2 2v3" /></svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-[17px] font-medium text-[#111] mb-2">Visit our office branch</h4>
                  <a href="mailto:Info@example.com" className="text-[#666] text-[15px] hover:text-black transition-colors">Info@example.com</a>
                </div>
              </div>

              {/* Chat */}
              <div className="flex items-start gap-6">
                <div className="text-[#111]">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-[17px] font-medium text-[#111] mb-2">Chat to us</h4>
                  <p className="text-[#666] text-[15px] leading-relaxed">No: 58 A, East Madison Street, Baltimore, MD, USA 4508</p>
                </div>
              </div>

              {/* Call */}
              <div className="flex items-start gap-6">
                <div className="text-[#111]">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /><path d="M14.05 2a9 9 0 0 1 8 7.94" /><path d="M14.05 6A5 5 0 0 1 18 10" /></svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-[17px] font-medium text-[#111] mb-2">Call us</h4>
                  <p className="text-[#666] text-[15px]">+1 00-123-456-789</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div >
            <h2 className="text-[28px] md:text-[36px] font-heading font-medium text-[#111] leading-[1.2] mb-6">
              Get In Touch For Enquires<br className="hidden lg:block" /> & Offers
            </h2>

            <p className="text-[#666] text-[15px] leading-[1.8] mb-10 pr-4">
              Do You Need Assistance Placing Your Order Or Making A Purchase? Have Questions Before Making A Purchase?
            </p>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-[13px] font-medium mb-6 text-center">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[13px] font-medium mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#eee] bg-transparent px-5 py-4 font-body text-[15px] text-[#111] placeholder-[#aaa] focus:outline-none focus:border-black rounded-none"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 font-medium text-[16px]">*</span>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#eee] bg-transparent px-5 py-4 font-body text-[15px] text-[#111] placeholder-[#aaa] focus:outline-none focus:border-black rounded-none"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 font-medium text-[16px]">*</span>
              </div>

              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Comment"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-[#eee] bg-transparent px-5 py-4 font-body text-[15px] text-[#111] placeholder-[#aaa] focus:outline-none focus:border-black rounded-none resize-none"
                ></textarea>
                <span className="absolute right-5 top-5 text-red-500 font-medium text-[16px]">*</span>
              </div>

              <div className="flex items-center gap-3 pt-2 pb-4">
                <input type="checkbox" id="save-info" className="w-4 h-4 cursor-pointer accent-black" />
                <label htmlFor="save-info" className="text-[#666] text-[14px] cursor-pointer select-none">
                  Save my name, email, and website in this browser.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#3B4D1E] text-white hover:bg-black px-14 py-6 font-heading font-bold text-[13px] uppercase tracking-[0.2em] disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
              >
                {loading ? <Loader size="small" /> : 'SEND'}
              </button>
            </form>
          </div>

        </div>
      </div>


      {/* FULL WIDTH MAP SECTION */}
      {/* 'mt-24 md:mt-32' mela space-kum, 'mb-24 md:mb-32' keela space-kum add panniruken */}
      <div className="w-full h-[400px] md:h-[550px] bg-gray-100 mt-32 md:mt-40 mb-32 md:mb-40">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d155354.23419917535!2d-2.033649514742807!3d52.47752146959966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870942d1b417173%3A0x1a870eb132c85b18!2sBirmingham%2C%20UK!5e0!3m2!1sen!2sin!4v1719730000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale contrast-[0.9] opacity-90"
          title="Birmingham Office Map"
        ></iframe>
      </div>

      {/* 3. INSTAGRAM GALLERY */}
      <section className="w-full bg-white pb-[80px] select-none">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 md:gap-[15px] lg:gap-[30px]">
            {/* Image 1 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/insta-img-6.jpg" alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 2 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/insta-img-3.jpg" alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Video (Middle) */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-black">
              <video src="/assets/73b7434b832e4989a63b1d48f8e21ccf.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/20">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 4 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/insta-img-5.jpg" alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
            {/* Image 5 */}
            <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-[#f6f5ea]">
              <img src="/assets/insta-img-4.jpg" alt="Gallery 4" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 bg-black/10">
                <div className="w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;