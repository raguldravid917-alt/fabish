import React from 'react';
// Ensure the path is correct for your project
import faceCreamImg from '../assets/Rectangle_3313_d425d0be-514e-4d22-abaa-975bd818f981.jpg';

const FaceCreamBanner = () => {
  return (
    // Changed h-[600px] to min-h-[600px] with py-10 on mobile to ensure content doesn't overflow when stacked
    <section className="relative w-full min-h-[600px] py-10 md:py-0 flex items-center overflow-hidden group cursor-pointer bg-[#f5f6ee]">

      {/* BACKGROUND IMAGE WITH SMOOTH HOVER ZOOM */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={faceCreamImg}
          alt="Natural Face Creams"
          className="w-full h-full object-cover object-center transition-transform duration-[1500ms] ease-in-out group-hover:scale-105"
        />
      </div>


      <div className="relative z-10 w-full md:w-[60%] px-8 md:px-20 lg:px-[120px]">
        <p className="text-[11px] font-bold tracking-[0.25em] text-[#333] uppercase mb-4">
          VITAMIN RICH
        </p>

        {/* Changed text size to 32px for mobile, added leading-[1.2] for line height, and replaced whitespace-nowrap with whitespace-normal on mobile */}
        <h2 className="text-[32px] md:text-[46px] leading-[1.2] md:leading-normal text-[#111] font-medium tracking-tight mb-5 whitespace-normal md:whitespace-nowrap">
          Luxurious Feeling Face Creams
        </h2>

        <p className="text-[15.5px] text-[#444] leading-[1.8] mb-8 max-w-[550px]">
          Cras bibendum lectus augue, vel fringilla leo conse. Praesent in nunc vel urna consequat mattis eget vel libero. Phasellus pellentesque Proin tempus tempor diam, non pellentesque quam ornare vel. Aenean laoreet mollis erat facilisis ac.
        </p>

        <button className="bg-[#3a4d23] text-white text-[12px] font-bold uppercase tracking-[0.15em] px-8 py-4 rounded-none hover:bg-black transition-colors duration-300">
          SHOP NOW
        </button>
      </div>

    </section>
  );
};

export default FaceCreamBanner;