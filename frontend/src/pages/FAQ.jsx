import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Box,
  ArrowLeftRight,
  ClipboardList,
  Star,
  AlertCircle,
  Truck,
  Tag,
  User,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  // Exact 10 categories as per the reference image
  const faqs = [
    {
      title: "Payment",
      content: "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Cash on Delivery (COD). All online payments are securely processed and encrypted.",
      icon: <CheckSquare className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Order",
      content: "You can modify or cancel your order within 2 hours of placing it by emailing our customer support team.",
      icon: <Box className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Returns & Exchange",
      content: "If an item doesn't fit or you're not happy, you can return or swap it within 30 days of purchase. Items must be unopened and unused.",
      icon: <ArrowLeftRight className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Package",
      content: "All items are securely packaged to ensure they reach you in perfect condition. We use eco-friendly materials wherever possible.",
      icon: <ClipboardList className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Special Offers",
      content: "Sign up for our newsletter to receive updates on special offers, seasonal sales, and exclusive discounts for members.",
      icon: <Star className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Damage",
      content: "If you receive a damaged item, please contact us immediately with photos of the product and packaging for a fast replacement.",
      icon: <AlertCircle className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Shipment",
      content: "We ship orders worldwide. Domestic orders take 3-5 business days to arrive, while international shipping ranges between 7-14 business days.",
      icon: <Truck className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Purchase",
      content: "Once a purchase is confirmed, you will receive an email with your order details and a tracking link to monitor your delivery status.",
      icon: <Tag className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Customer Care Service",
      content: "You can submit an inquiry through our Contact form, write to us directly, or call our customer service hotline at 1-800-FABISH-SKIN.",
      icon: <User className="w-[22px] h-[22px] stroke-[1.5]" />
    },
    {
      title: "Refund",
      content: "Once we receive your return item in our warehouse, we process the inspection and issue refunds within 5-7 business days to your original payment method.",
      icon: <HelpCircle className="w-[22px] h-[22px] stroke-[1.5]" />
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24">

      <div
        // Note the change from 'bg-center' to 'bg-right'
        className="relative w-full h-[300px] md:h-[250px] flex items-center justify-center bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/assets/Rectangle_337.jpg')` }}
      >
        <div className="absolute inset-0 bg-[#faf9f5]/50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-[40px] md:text-[40px] font-heading font-semibold text-[#555] mb-2 tracking-tight">
            Faq
          </h1>
          <p className="text-[12px] font-bold text-[#666] tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-black">Home</Link> <span className="mx-2">|</span> Faq
          </p>
        </div>
      </div>

      {/* FAQ GRID SECTION */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {faqs.map((faq, index) => (
            <div
              key={index}
              // Hover bg color added, shadow removed for the flat clean look
              className="bg-white border border-gray-100 hover:bg-[#faf9f5] transition-colors duration-300 overflow-hidden"
            >
              {/* Clickable Header - Padding (py) increased to make the box larger */}
              <div
                className="flex items-center justify-between py-8 px-6 md:py-10 md:px-8 cursor-pointer select-none"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex items-center gap-5">
                  <div className="text-[#111]">
                    {faq.icon}
                  </div>
                  <h3 className="text-[18px] md:text-[20px] font-heading font-semibold text-[#111]">
                    {faq.title}
                  </h3>
                </div>

                {/* Plus / Minus Icon */}
                <div className="text-[#111]">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 stroke-[1.5]" />
                  ) : (
                    <Plus className="w-5 h-5 stroke-[1.5]" />
                  )}
                </div>
              </div>

              {/* Expanded Answer Content */}
              <div
                className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[300px] opacity-100 pb-8 md:pb-10' : 'max-h-0 opacity-0 pb-0'
                  }`}
              >
                <p className="text-[#555] text-[15px] leading-relaxed ml-[42px] border-t border-gray-200 pt-5">
                  {faq.content}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default FAQ;