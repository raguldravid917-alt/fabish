import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import faceCreamImg from '../assets/Rectangle_3313_d425d0be-514e-4d22-abaa-975bd818f981.jpg';

const FaceCreamBanner = () => {
  return (
    <section className="relative w-full min-h-[520px] lg:min-h-[600px] py-16 md:py-24 flex items-center overflow-hidden group bg-[#f5f6ee] my-8 select-none">

      {/* BACKGROUND IMAGE WITH SMOOTH HOVER ZOOM */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src={faceCreamImg}
          alt="Luxurious Feeling Face Creams"
          className="w-full h-full object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent lg:hidden" />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-xl glass-panel p-8 md:p-12 rounded-3xl shadow-2xl border border-white/60 backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef3e8] border border-[#d2e2c5] mb-4">
            <Sparkles size={14} className="text-[#3a4d23]" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#3a4d23] uppercase font-heading">
              VITAMIN RICH FORMULA
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl leading-tight text-[#1c2415] font-heading font-medium tracking-tight mb-4">
            Luxurious Feeling Face Creams
          </h2>

          <p className="text-sm md:text-base text-[#4a4a4a] leading-relaxed font-body mb-8">
            Enriched with cold-pressed botanical oils and natural antioxidants to restore youthful elasticity and deeply hydrate every layer of your skin.
          </p>

          <Link
            to="/collections/face-cream"
            className="inline-flex items-center justify-center gap-3 bg-[#3a4d23] hover:bg-[#1c2415] text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group/btn"
          >
            <span>DISCOVER COLLECTION</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

    </section>
  );
};

export default FaceCreamBanner;