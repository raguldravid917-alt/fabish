import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="bg-[#f7f6f0] min-h-screen py-20 font-body flex items-center justify-center px-6 select-none">
      <div className="bg-white border border-brand-border p-8 md:p-12 w-full max-w-md shadow-md text-center">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="w-16 h-16 text-red-500 animate-bounce" strokeWidth={1.5} />
        </div>
        
        <span className="text-xs font-heading font-semibold text-red-500 uppercase tracking-widest block mb-2">
          Access Denied
        </span>
        <h1 className="serif-title text-2xl text-brand-charcoal uppercase mb-4">
          403 - Unauthorized
        </h1>
        
        <p className="text-xs text-brand-muted leading-relaxed mb-8">
          You do not have the required administrative permissions to access this page. If you believe this is an error, please contact management or log in with an administrator account.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            to="/account/login?redirect=/admin/dashboard" 
            className="w-full bg-[#729855] text-white hover:bg-black py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all text-center"
          >
            Log In as Admin
          </Link>
          <Link 
            to="/" 
            className="w-full bg-brand-charcoal text-white hover:bg-brand-button-hover py-4 font-heading font-bold text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
