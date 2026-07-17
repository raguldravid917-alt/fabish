import { memo } from 'react';
import { Truck, RotateCcw, Shield, Leaf, Award, Heart, Phone } from 'lucide-react';

/**
 * FallbackContentSection
 *
 * Rendered when a product has no admin-managed dynamic content blocks yet.
 * Displays Fabish-branded static information: delivery, returns, trust badges,
 * sustainability note, and contact info.
 *
 * Matches the Fabish theme (colors, fonts, spacing) without copying any external brand.
 */
const FallbackContentSection = memo(() => {
  const trustBadges = [
    { icon: Truck, label: 'Free Delivery', sub: 'Orders over ₹1,000' },
    { icon: RotateCcw, label: 'Easy Returns', sub: '7-day return policy' },
    { icon: Shield, label: '100% Authentic', sub: 'Genuine Fabish products' },
    { icon: Award, label: 'Quality Assured', sub: 'Dermatologically tested' },
    { icon: Leaf, label: 'Natural Ingredients', sub: 'Clean beauty formula' },
    { icon: Heart, label: 'Cruelty-Free', sub: 'Not tested on animals' },
  ];

  const deliveryInfo = [
    { label: 'Standard Delivery', value: '3–5 business days' },
    { label: 'Express Delivery', value: '1–2 business days (select cities)' },
    { label: 'Free Shipping', value: 'On all orders above ₹1,000' },
    { label: 'Packaging', value: 'Eco-friendly, tamper-proof packaging' },
    { label: 'Order Tracking', value: 'Real-time tracking via email & SMS' },
  ];

  const returnPolicy = [
    'Return within 7 days of delivery in original, unopened condition.',
    'Damaged or defective products are eligible for immediate replacement.',
    'Once a return is approved, refund is processed within 5–7 business days.',
    'Opened or used products are not eligible for return (hygiene reasons).',
    'Contact our support team with your order ID to initiate a return.',
  ];

  return (
    <>
      {/* Trust Badges Strip */}
      <section className="bg-[#f9f9eb] border border-[#eae8d8] py-5 px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 text-[#2f3e10]">
                <Icon className="w-5 h-5 text-[#729855] shrink-0" strokeWidth={1.5} />
                <div>
                  <span className="font-heading font-bold text-[10px] uppercase tracking-wider block leading-none">
                    {badge.label}
                  </span>
                  <span className="text-[9px] text-gray-400 font-body">{badge.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delivery & Shipping Information */}
      <section className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
        <div className="flex items-center gap-3 border-b border-[#eae8d8] pb-4 mb-6">
          <Truck className="w-5 h-5 text-[#729855]" strokeWidth={1.5} />
          <h2 className="serif-title text-2xl text-black font-medium">Delivery Information</h2>
        </div>
        <div className="border border-[#eae8d8] divide-y divide-[#eae8d8]">
          {deliveryInfo.map((item, i) => (
            <div
              key={i}
              className={`flex justify-between items-center p-4 text-sm hover:bg-[#fcfcfa] transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfa]/50'
              }`}
            >
              <span className="font-semibold text-black uppercase text-xs tracking-wider font-heading">
                {item.label}
              </span>
              <span className="text-gray-500 text-right max-w-[55%] font-body">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Return Policy */}
      <section className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
        <div className="flex items-center gap-3 border-b border-[#eae8d8] pb-4 mb-6">
          <RotateCcw className="w-5 h-5 text-[#729855]" strokeWidth={1.5} />
          <h2 className="serif-title text-2xl text-black font-medium">Return Policy</h2>
        </div>
        <ul className="space-y-3">
          {returnPolicy.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#333] leading-relaxed font-body">
              <span className="w-5 h-5 rounded-full bg-[#eae8d8] text-[#729855] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-heading">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Why Choose Fabish */}
      <section className="bg-white border-t border-[#eae8d8] pt-10 pb-6 mb-12">
        <div className="flex items-center gap-3 border-b border-[#eae8d8] pb-4 mb-6">
          <Leaf className="w-5 h-5 text-[#729855]" strokeWidth={1.5} />
          <h2 className="serif-title text-2xl text-black font-medium">Why Choose Fabish?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Leaf,
              title: 'Natural & Clean',
              desc: 'Our formulas are crafted with carefully sourced natural ingredients, free from harmful parabens and sulphates.',
            },
            {
              icon: Award,
              title: 'Dermatologist Tested',
              desc: 'Every Fabish product is tested and approved by certified dermatologists for safety and efficacy.',
            },
            {
              icon: Heart,
              title: 'Cruelty-Free Always',
              desc: 'We are committed to being 100% cruelty-free. Our products are never tested on animals.',
            },
            {
              icon: Shield,
              title: 'Clinically Proven',
              desc: 'Science-backed formulations that deliver visible results you can see and feel.',
            },
            {
              icon: Truck,
              title: 'Fast & Reliable',
              desc: 'Pan-India delivery with real-time tracking so your order always arrives safely.',
            },
            {
              icon: RotateCcw,
              title: 'Hassle-Free Returns',
              desc: 'Not satisfied? Our easy 7-day return policy ensures you shop with complete confidence.',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-[#fcfcfa] border border-[#eae8d8] p-5 hover:border-black transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#eae8d8]/40 p-2 text-[#729855] group-hover:bg-[#729855] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-black uppercase tracking-wider">
                    {item.title}
                  </h4>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed font-body">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Need Help? */}
      <section className="bg-[#f9f9eb] border border-[#eae8d8] p-6 md:p-8 mb-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#eae8d8] p-3">
              <Phone className="w-6 h-6 text-[#2f3e10]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-black uppercase tracking-wider mb-1">
                Need Help With This Product?
              </h3>
              <p className="text-gray-500 text-xs font-body leading-relaxed">
                Our skincare experts are here to help. Reach out anytime.
              </p>
            </div>
          </div>
          <a
            href="/contact"
            className="bg-[#2f3e10] hover:bg-[#729855] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap no-underline inline-block"
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
});

FallbackContentSection.displayName = 'FallbackContentSection';

export default FallbackContentSection;
