import React from 'react';
import {
  Package,
  Heart,
  MapPin,
  Award,
  ArrowRight,
  Truck,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  User,
  Shield,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';

const AccountDashboard = ({
  user,
  orders = [],
  wishlist = [],
  addresses = [],
  recommendedProducts = [],
  onTabChange,
  onQuickView
}) => {
  const latestOrders = orders.slice(0, 3);
  const rewardPoints = user?.rewardPoints || user?.points || 450;

  return (
    <div className="space-y-8 select-none">
      
      {/* ─────────────────────────────────────────────────────────────────
          1. REAL STAT SUMMARY CARDS (INTERACTIVE & CLICKABLE)
      ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Orders */}
        <div
          onClick={() => onTabChange('orders')}
          className="bg-white border border-[#E8E6D9] rounded-3xl p-5 shadow-xs hover:border-[#729855] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF3E8] border border-[#D2E2C5] flex items-center justify-center text-[#3A4D23]">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#729855] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
              My Orders
            </span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C2415]">
              {orders.length}
            </div>
            <span className="text-[11px] font-heading font-bold text-[#729855] block mt-1">
              View History &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Wishlist */}
        <div
          onClick={() => onTabChange('wishlist')}
          className="bg-white border border-[#E8E6D9] rounded-3xl p-5 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <Heart className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
              Saved Wishlist
            </span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C2415]">
              {wishlist.length}
            </div>
            <span className="text-[11px] font-heading font-bold text-rose-500 block mt-1">
              View Wishlist &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Addresses */}
        <div
          onClick={() => onTabChange('addresses')}
          className="bg-white border border-[#E8E6D9] rounded-3xl p-5 shadow-xs hover:border-[#729855] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF3E8] border border-[#D2E2C5] flex items-center justify-center text-[#3A4D23]">
              <MapPin className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#729855] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
              Saved Addresses
            </span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C2415]">
              {addresses.length}
            </div>
            <span className="text-[11px] font-heading font-bold text-[#729855] block mt-1">
              Manage Address Book &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Rewards */}
        <div
          onClick={() => onTabChange('rewards')}
          className="bg-white border border-[#E8E6D9] rounded-3xl p-5 shadow-xs hover:border-[#729855] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF3E8] border border-[#D2E2C5] flex items-center justify-center text-[#3A4D23]">
              <Award className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#729855] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
              Reward Points
            </span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C2415]">
              {rewardPoints}
            </div>
            <span className="text-[11px] font-heading font-bold text-[#729855] block mt-1">
              Redeem Rewards &rarr;
            </span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. QUICK ACTIONS SHORTCUTS STRIP
      ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs">
        <h3 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#1C2415] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#729855]" />
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Track Order', icon: Truck, tab: 'orders' },
            { label: 'Manage Address', icon: MapPin, tab: 'addresses' },
            { label: 'View Wishlist', icon: Heart, tab: 'wishlist' },
            { label: 'Edit Profile', icon: User, tab: 'settings' },
            { label: 'View Rewards', icon: Award, tab: 'rewards' },
            { label: 'Shop Botanicals', icon: ShoppingBag, link: '/collections/all' },
          ].map((item, idx) => (
            item.link ? (
              <Link
                key={idx}
                to={item.link}
                className="h-11 px-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] hover:bg-[#EEF3E8] text-[#1C2415] hover:text-[#3A4D23] text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all shadow-2xs no-underline text-center"
              >
                <item.icon className="w-4 h-4 text-[#729855] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ) : (
              <button
                key={idx}
                type="button"
                onClick={() => onTabChange(item.tab)}
                className="h-11 px-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] hover:bg-[#EEF3E8] text-[#1C2415] hover:text-[#3A4D23] text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer text-center"
              >
                <item.icon className="w-4 h-4 text-[#729855] shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          3. RECENT ORDERS SUMMARY WIDGET
      ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6D9] mb-5">
          <div>
            <h3 className="font-heading text-base font-extrabold uppercase tracking-wider text-[#1C2415]">
              Recent Orders
            </h3>
            <p className="text-xs text-gray-500 font-body">Your latest purchases and dispatch status</p>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('orders')}
            className="text-xs font-heading font-bold text-[#729855] hover:text-[#1C2415] transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1"
          >
            View All Orders &rarr;
          </button>
        </div>

        {latestOrders.length === 0 ? (
          <div className="py-12 text-center bg-[#FAF9F5] rounded-2xl border border-dashed border-[#E8E6D9]">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-sm text-[#1C2415] mb-1">No Orders Placed Yet</h4>
            <p className="text-xs text-gray-500 font-body max-w-sm mx-auto mb-4">
              Explore our organic Scandinavian skincare formulations and start your radiance journey.
            </p>
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider transition-all no-underline shadow-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {latestOrders.map((order) => {
              const orderId = order._id || order.id || 'N/A';
              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Recent';

              const statusColor =
                order.isDelivered || order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

              const totalPrice = order.totalPrice || order.grandTotal || order.amount || 0;

              return (
                <div
                  key={orderId}
                  className="bg-[#FAF9F5] border border-[#E8E6D9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#729855]"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#1C2415]">
                        Order #{orderId.substring(orderId.length - 8).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold uppercase border ${statusColor}`}>
                        {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-body">
                      Placed on {formattedDate} &bull; {order.orderItems?.length || 1} Item(s)
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-[#E8E6D9] pt-3 sm:pt-0">
                    <span className="font-heading font-extrabold text-base text-[#1C2415]">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onTabChange('orders')}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          4. RECOMMENDED FOR YOU (USING SHARED PRODUCTCARD)
      ───────────────────────────────────────────────────────────────── */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E6D9] mb-6">
            <div>
              <h3 className="font-heading text-base font-extrabold uppercase tracking-wider text-[#1C2415] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#729855]" />
                Recommended For You
              </h3>
              <p className="text-xs text-gray-500 font-body">Handpicked organic formulations based on your skincare style</p>
            </div>
            <Link
              to="/collections/all"
              className="text-xs font-heading font-bold text-[#729855] hover:text-[#1C2415] transition-colors no-underline flex items-center gap-1"
            >
              Shop All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDashboard;
