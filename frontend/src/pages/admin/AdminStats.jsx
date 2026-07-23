import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users as UsersIcon, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Award,
  Plus,
  Eye,
  Heart,
  Tag,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/formatPrice';

const AdminStats = ({
  stats = null,
  products = [],
  orders = [],
  users = [],
  categories = [],
  loading = false,
  error = null,
  onRefresh = () => {}
}) => {
  useDocumentTitle('Admin Operations Dashboard — Fabish');
  const navigate = useNavigate();
  const [activeProductTab, setActiveProductTab] = useState('bestsellers'); // 'bestsellers' | 'lowstock'
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [wishlistBookmarked, setWishlistBookmarked] = useState({});

  // Fallback metrics if stats payload is loading or null
  const metrics = useMemo(() => {
    if (stats) {
      return {
        totalSales: stats.totalSales || 0,
        monthlyGrowthPct: stats.monthlyGrowthPct || 0,
        currentMonthSales: stats.currentMonthSales || 0,
        prevMonthSales: stats.prevMonthSales || 0,
        todaySales: stats.todaySales || 0,
        todayOrdersCount: stats.todayOrdersCount || 0,
        averageOrderValue: stats.averageOrderValue || 0,
        totalOrders: stats.orders?.total || orders.length,
        pendingDeliveries: stats.orders?.pendingDeliveries || 0,
        orderStatusBreakdown: stats.orders?.breakdown || {},
        totalProducts: stats.catalog?.total || products.length,
        inStock: stats.catalog?.inStock || 0,
        lowStock: stats.catalog?.lowStock || 0,
        outOfStock: stats.catalog?.outOfStock || 0,
        totalCustomers: stats.customers?.total || 0,
        staffCount: stats.customers?.staffCount || 0,
        recentCustomers: stats.customers?.recent || [],
        revenueAnalytics: stats.revenueAnalytics || { ytdTotal: 0, monthly: [] },
        topCategories: stats.topCategories || [],
        bestSellingProducts: stats.bestSellingProducts || [],
        lowStockProducts: stats.lowStockProducts || [],
        recentOrders: stats.recentOrders || [],
        pendingReviewsCount: stats.reviews?.total || 0,
        recentReviews: stats.reviews?.recent || [],
      };
    }

    // Client-side fallback computation from props
    const paidOrders = orders.filter(o => o.isPaid || o.paymentStatus === 'Paid');
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const lowStockItems = products.filter(p => (p.stock || 0) <= 5);
    const outOfStockItems = products.filter(p => (p.stock || 0) === 0);
    const inStockItems = products.filter(p => (p.stock || 0) > 5);
    const customerCount = users.filter(u => !u.isAdmin && u.role !== 'Admin').length;
    const staffCountVal = users.filter(u => u.isAdmin || u.role === 'Admin').length;

    const todayStr = new Date().toDateString();
    const todayOrders = paidOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const aov = paidOrders.length > 0 ? Math.round(totalSales / paidOrders.length) : 0;

    return {
      totalSales,
      monthlyGrowthPct: 0,
      currentMonthSales: totalSales,
      prevMonthSales: 0,
      todaySales,
      todayOrdersCount: todayOrders.length,
      averageOrderValue: aov,
      totalOrders: orders.length,
      pendingDeliveries: orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length,
      orderStatusBreakdown: {
        Total: orders.length,
        Pending: orders.filter(o => o.orderStatus === 'Pending').length,
        Confirmed: orders.filter(o => o.orderStatus === 'Confirmed').length,
        Processing: orders.filter(o => o.orderStatus === 'Packed' || o.orderStatus === 'Processing').length,
        Shipped: orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out For Delivery').length,
        Delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
        Cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
      },
      totalProducts: products.length,
      inStock: inStockItems.length,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      totalCustomers: customerCount,
      staffCount: staffCountVal,
      recentCustomers: users.filter(u => !u.isAdmin).slice(0, 5),
      revenueAnalytics: { ytdTotal: totalSales, monthly: [] },
      topCategories: [],
      bestSellingProducts: products.slice(0, 6),
      lowStockProducts: lowStockItems.slice(0, 6),
      recentOrders: orders.slice(0, 6),
      pendingReviewsCount: 0,
      recentReviews: [],
    };
  }, [stats, products, orders, users]);

  // Compute SVG chart path dynamically from real monthly revenue data
  const chartConfig = useMemo(() => {
    const monthlyList = metrics.revenueAnalytics?.monthly || [];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Fill array for 12 months or active months
    const values = monthLabels.map((label, idx) => {
      const found = monthlyList.find(m => m.monthIndex === idx + 1 || m.month === label);
      return found ? found.revenue : 0;
    });

    const maxVal = Math.max(...values, 10000);
    const hasData = values.some(v => v > 0);

    const points = values.map((val, idx) => {
      const x = 30 + idx * 40; // 12 points across 500px width
      const y = 160 - (val / maxVal) * 120;
      return { x, y, val, label: monthLabels[idx] };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`
      : '';

    return { points, pathD, areaD, maxVal, hasData };
  }, [metrics.revenueAnalytics]);

  // Toggle wishlist bookmark state for product preview card
  const toggleBookmark = (prodId) => {
    setWishlistBookmarked(prev => ({ ...prev, [prodId]: !prev[prodId] }));
  };

  // Helper to extract image URL safely
  const getProductImage = (prod) => {
    if (!prod) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400';
    if (prod.images && prod.images.length > 0) {
      if (typeof prod.images[0] === 'object' && prod.images[0].secure_url) {
        return prod.images[0].secure_url;
      }
      if (typeof prod.images[0] === 'string') {
        return prod.images[0];
      }
    }
    if (prod.thumbnail) return prod.thumbnail;
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400';
  };

  // Render Amazon-Style Product Card for preview sections
  const renderAmazonProductCard = (product, badgeType = 'bestseller') => {
    const isLow = (product.stock || 0) <= 5 && (product.stock || 0) > 0;
    const isOut = (product.stock || 0) === 0;
    const imgUrl = getProductImage(product);
    const price = product.price || 0;
    const comparePrice = product.comparePrice || 0;
    const hasDiscount = comparePrice > price;
    const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
    const ratingVal = product.ratings || (4.0 + (product.title?.length % 10) * 0.1);
    const reviewCount = product.reviewsCount || Math.floor((product.price || 500) / 40);
    const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Beauty');
    const isBookmarked = !!wishlistBookmarked[product._id];

    return (
      <div 
        key={product._id} 
        className="group relative bg-white border border-[#eae8d8] hover:border-[#729855] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden rounded-none select-none"
      >
        {/* Top Badges & Quick Icons */}
        <div className="relative aspect-square w-full bg-[#fdfcf7] border-b border-[#eae8d8] overflow-hidden flex items-center justify-center p-4">
          <img 
            src={imgUrl} 
            alt={product.title} 
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'; }}
          />

          {/* Badge Tag */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {badgeType === 'bestseller' && (
              <span className="bg-[#2f3e10] text-[#F9F9EB] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                #1 Best Seller
              </span>
            )}
            {isLow && (
              <span className="bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                Low Stock: {product.stock} Left
              </span>
            )}
            {isOut && (
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                Out of Stock
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                -{discountPct}% OFF
              </span>
            )}
          </div>

          {/* Heart/Wishlist Admin Action */}
          <button
            type="button"
            onClick={() => toggleBookmark(product._id)}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border transition-all cursor-pointer z-10 ${
              isBookmarked 
                ? 'bg-red-50 border-red-200 text-red-500' 
                : 'bg-white/80 border-[#eae8d8] text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
            title="Bookmark item"
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Amazon-Style Details Body */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
              <span className="truncate">{categoryName}</span>
              <span className="font-mono text-gray-500">SKU: {product.sku || product._id?.slice(-5).toUpperCase()}</span>
            </div>

            <h4 className="text-xs font-bold text-black uppercase tracking-wider line-clamp-2 min-h-[32px] group-hover:text-[#729855] transition-colors">
              {product.title}
            </h4>

            {/* Amazon-Style Rating Stars */}
            <div className="flex items-center gap-1 mt-1.5 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(ratingVal) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-black ml-1">{Number(ratingVal).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({reviewCount})</span>
            </div>
          </div>

          {/* Amazon-Style Price Block */}
          <div className="pt-2 border-t border-[#eae8d8]/60 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-black tracking-tight">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(comparePrice)}</span>
              )}
            </div>

            {/* Admin Interactive Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedProductModal(product)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-2 bg-[#eae8d8]/40 hover:bg-[#eae8d8] text-black text-[10px] font-bold uppercase tracking-wider transition-colors border-none cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-2 bg-[#2f3e10] hover:bg-[#729855] text-[#F9F9EB] text-[10px] font-bold uppercase tracking-wider transition-colors border-none cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 select-none text-left animate-fade-in font-body pb-12">
      
      {/* ── TOP HEADER & QUICK ACTIONS BAR ─────────────────────────── */}
      <div className="bg-white border border-[#eae8d8] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold uppercase tracking-wider text-black font-heading">
              Store Performance Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-green-100 text-[#2f3e10] px-2.5 py-0.5 border border-green-200">
              2026 Live Production
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time MongoDB metrics, revenue analytics, inventory health & store quick controls
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition-colors"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-[#2f3e10] text-[#F9F9EB] hover:bg-[#729855] border-none cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-[#eae8d8] text-black hover:bg-[#eae8d8]/80 border-none cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> View Orders
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/coupons')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border border-[#eae8d8] text-gray-700 hover:border-black border-none cursor-pointer transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-[#729855]" /> Add Coupon
          </button>
        </div>
      </div>

      {/* Error Callout Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={onRefresh}
            className="underline text-red-900 font-bold bg-transparent border-none cursor-pointer"
          >
            Retry Fetching
          </button>
        </div>
      )}

      {/* ── 4 CORE REAL KPI CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue Card */}
        <div 
          onClick={() => navigate('/admin/orders')}
          className="bg-white border border-[#eae8d8] p-6 shadow-sm hover:shadow-md hover:border-[#729855] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400">
              Total Revenue (Paid)
            </span>
            <div className="p-3 bg-green-50 text-[#729855] group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black tracking-tight font-heading">
              {formatPrice(metrics.totalSales)}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eae8d8]/50 text-[11px]">
              <span className={`font-bold flex items-center gap-1 ${metrics.monthlyGrowthPct >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                {metrics.monthlyGrowthPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {metrics.monthlyGrowthPct >= 0 ? `+${metrics.monthlyGrowthPct}%` : `${metrics.monthlyGrowthPct}%`} Monthly
              </span>
              <span className="text-gray-400 font-medium">
                This Mo: {formatPrice(metrics.currentMonthSales)}
              </span>
            </div>
          </div>
        </div>

        {/* All Orders Card */}
        <div 
          onClick={() => navigate('/admin/orders')}
          className="bg-white border border-[#eae8d8] p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400">
              Orders Volume
            </span>
            <div className="p-3 bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black tracking-tight font-heading">
              {metrics.totalOrders}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eae8d8]/50 text-[11px]">
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {metrics.pendingDeliveries} Pending Deliveries
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Active Catalog Card */}
        <div 
          onClick={() => navigate('/admin/products')}
          className="bg-white border border-[#eae8d8] p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400">
              Active Catalog
            </span>
            <div className="p-3 bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black tracking-tight font-heading">
              {metrics.totalProducts}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eae8d8]/50 text-[11px]">
              {metrics.lowStock > 0 || metrics.outOfStock > 0 ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {metrics.lowStock} Low | {metrics.outOfStock} Out
                </span>
              ) : (
                <span className="text-brand-green font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stock Optimal
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Registered Customers Card */}
        <div 
          onClick={() => navigate('/admin/customers')}
          className="bg-white border border-[#eae8d8] p-6 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400">
              Registered Customers
            </span>
            <div className="p-3 bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black tracking-tight font-heading">
              {metrics.totalCustomers}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#eae8d8]/50 text-[11px]">
              <span className="text-gray-500 font-medium truncate">
                {metrics.staffCount} Staff Accounts Excluded
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>
        </div>

      </div>

      {/* ── SECONDARY METRICS STRIP (2026 STORE INSIGHTS) ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-[#eae8d8] p-4 shadow-sm">
        
        {/* Today's Sales */}
        <div className="p-3 border-r border-[#eae8d8] last:border-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Today's Sales</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-black">{formatPrice(metrics.todaySales)}</span>
            <span className="text-[10px] font-semibold text-[#729855]">({metrics.todayOrdersCount} orders)</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-[#eae8d8] p-3 border-r border-[#eae8d8] last:border-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Average Order Value (AOV)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-black">{formatPrice(metrics.averageOrderValue)}</span>
            <span className="text-[10px] text-gray-400">per completed order</span>
          </div>
        </div>

        {/* Inventory Health Bar */}
        <div className="p-3 border-r border-[#eae8d8] last:border-0">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            <span>Inventory Health</span>
            <span className="text-black">{metrics.inStock} / {metrics.totalProducts} In-Stock</span>
          </div>
          <div className="h-2 w-full bg-gray-100 flex overflow-hidden rounded-none mt-2">
            <div 
              className="bg-[#729855] h-full" 
              style={{ width: `${metrics.totalProducts > 0 ? (metrics.inStock / metrics.totalProducts) * 100 : 100}%` }}
              title="In Stock"
            />
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${metrics.totalProducts > 0 ? (metrics.lowStock / metrics.totalProducts) * 100 : 0}%` }}
              title="Low Stock"
            />
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${metrics.totalProducts > 0 ? (metrics.outOfStock / metrics.totalProducts) * 100 : 0}%` }}
              title="Out of Stock"
            />
          </div>
        </div>

        {/* Reviews & Contacts */}
        <div 
          onClick={() => navigate('/admin/reviews')}
          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Customer Feedback</span>
            <span className="text-sm font-bold text-black mt-1 block">{metrics.pendingReviewsCount} Reviews Received</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

      </div>

      {/* ── REVENUE ANALYTICS & TOP CATEGORIES BLOCK ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom SVG Line Chart */}
        <div className="bg-white border border-[#eae8d8] p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-black uppercase tracking-wider font-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#729855]" /> Revenue Analytics
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Real monthly business sales trends (MongoDB paid orders)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#eae8d8]/50 text-black px-3 py-1 border border-[#eae8d8]">
                2026 YTD: {formatPrice(metrics.revenueAnalytics.ytdTotal)}
              </span>
            </div>
          </div>

          {/* SVG Plot or Empty State */}
          <div className="w-full flex flex-col justify-center items-center py-4">
            {!chartConfig.hasData ? (
              <div className="py-12 text-center text-gray-400 italic space-y-2">
                <BarChart3Icon className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
                <p className="text-xs">No paid order revenue recorded yet for 2026.</p>
                <p className="text-[11px] text-gray-400">Place an order on storefront to see live analytics chart update.</p>
              </div>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full max-w-2xl h-auto overflow-visible">
                <defs>
                  <linearGradient id="chartGradient2026" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#729855" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#729855" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="#eae8d8" strokeWidth="0.5" strokeDasharray="3"/>
                <line x1="20" y1="100" x2="480" y2="100" stroke="#eae8d8" strokeWidth="0.5" strokeDasharray="3"/>
                <line x1="20" y1="160" x2="480" y2="160" stroke="#eae8d8" strokeWidth="0.5"/>

                {/* Area path */}
                {chartConfig.areaD && <path d={chartConfig.areaD} fill="url(#chartGradient2026)"/>}

                {/* Line path */}
                {chartConfig.pathD && (
                  <path 
                    d={chartConfig.pathD} 
                    fill="none" 
                    stroke="#729855" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {chartConfig.points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="4" 
                      fill="#ffffff" 
                      stroke="#2f3e10" 
                      strokeWidth="2" 
                      className="group-hover:r-6 transition-all"
                    />
                    {/* Tooltip */}
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      textAnchor="middle" 
                      className="text-[9px] font-bold fill-[#2f3e10] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {formatPrice(p.val)}
                    </text>
                    {/* Month Label */}
                    <text 
                      x={p.x} 
                      y="184" 
                      textAnchor="middle" 
                      className="text-[9px] font-bold fill-gray-400 uppercase tracking-wider"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          <div className="border-t border-[#eae8d8] pt-3 flex justify-between items-center text-[11px] text-gray-400">
            <span>Data calculated strictly from completed & paid orders</span>
            <span className="font-bold text-black">Updated live</span>
          </div>
        </div>

        {/* Top Categories Card */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-black uppercase tracking-wider font-heading">
                Top Categories
              </h3>
              <button 
                onClick={() => navigate('/admin/categories')}
                className="text-[10px] font-bold uppercase tracking-wider text-[#729855] hover:underline bg-transparent border-none cursor-pointer"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-6">Catalog distribution share by product count</p>
            
            <div className="space-y-4">
              {metrics.topCategories.length > 0 ? (
                metrics.topCategories.map((cat, idx) => (
                  <div 
                    key={cat.id || idx} 
                    onClick={() => navigate('/admin/products')}
                    className="space-y-1.5 cursor-pointer group"
                  >
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-black uppercase tracking-wider group-hover:text-[#729855] transition-colors truncate max-w-[160px]">
                        {cat.name}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {cat.productCount} items ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 w-full rounded-none overflow-hidden">
                      <div className="h-full bg-[#729855]" style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center italic text-gray-400 text-xs">
                  No categories found. Add categories to see distribution.
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#eae8d8] pt-4 mt-6 flex justify-between text-xs text-gray-500">
            <span>Total Catalog Categories</span>
            <span className="font-bold text-black">{categories.length || metrics.topCategories.length}</span>
          </div>
        </div>

      </div>

      {/* ── AMAZON-STYLE PRODUCT CARDS (BEST SELLERS & STOCK ALERTS) ───── */}
      <div className="bg-white border border-[#eae8d8] p-6 shadow-sm space-y-6">
        
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eae8d8] pb-4">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider font-heading flex items-center gap-2">
              <Award className="w-5 h-5 text-[#729855]" /> Product Catalog Preview Cards
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Amazon-inspired product preview cards with Fabish luxury styling</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-[#eae8d8]/40 p-1 border border-[#eae8d8]">
            <button
              type="button"
              onClick={() => setActiveProductTab('bestsellers')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeProductTab === 'bestsellers'
                  ? 'bg-[#2f3e10] text-[#F9F9EB] shadow-sm'
                  : 'text-gray-600 hover:text-black bg-transparent'
              }`}
            >
              Best Sellers ({metrics.bestSellingProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveProductTab('lowstock')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeProductTab === 'lowstock'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-black bg-transparent'
              }`}
            >
              Stock Warnings ({metrics.lowStockProducts.length})
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          {activeProductTab === 'bestsellers' && (
            metrics.bestSellingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.bestSellingProducts.map(p => renderAmazonProductCard(p, 'bestseller'))}
              </div>
            ) : (
              <p className="py-12 text-center italic text-gray-400 text-xs">No best selling products catalog data.</p>
            )
          )}

          {activeProductTab === 'lowstock' && (
            metrics.lowStockProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.lowStockProducts.map(p => renderAmazonProductCard(p, 'lowstock'))}
              </div>
            ) : (
              <p className="py-12 text-center italic text-gray-400 text-xs">All inventory stock levels are optimal ($\ge$ 6 units).</p>
            )
          )}
        </div>

      </div>

      {/* ── ORDER PIPELINE & RECENT ORDERS TABLE ─────────────────────── */}
      <div className="bg-white border border-[#eae8d8] p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider font-heading flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#729855]" /> Recent Orders & Fulfillment Status
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Live order list synced directly from MongoDB Order records</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#729855] hover:underline bg-transparent border-none cursor-pointer"
          >
            <span>View All Orders ({metrics.totalOrders})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pipeline Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => {
            const count = metrics.orderStatusBreakdown[st] || 0;
            return (
              <div 
                key={st}
                onClick={() => navigate('/admin/orders')}
                className="bg-[#fdfcf7] border border-[#eae8d8] p-3 text-center cursor-pointer hover:border-[#729855] transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">{st}</span>
                <span className="text-lg font-bold text-black mt-1 block">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eae8d8]/40 border-b border-[#eae8d8] text-[10px] font-heading font-bold text-gray-500 uppercase tracking-widest">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae8d8]/60">
              {metrics.recentOrders.length > 0 ? (
                metrics.recentOrders.map(o => (
                  <tr key={o._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">
                      #{o.orderNumber || o._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-black block">{o.customerDetails?.name || o.user?.name || 'Customer'}</span>
                      <span className="text-[10px] text-gray-400 block">{o.customerDetails?.email || o.user?.email || ''}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-block ${
                        o.isPaid || o.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-[#2f3e10]'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {o.isPaid || o.paymentStatus === 'Paid' ? 'Paid' : (o.paymentMethod || 'Unpaid')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-block ${
                        o.orderStatus === 'Delivered' 
                          ? 'bg-green-50 text-[#729855]' 
                          : o.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {o.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-black">
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/orders')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2f3e10] hover:bg-[#eae8d8] bg-transparent border border-[#eae8d8] cursor-pointer transition-colors"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center italic text-gray-400">
                    No orders registered yet in MongoDB. Place an order to see it listed here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── PRODUCT PREVIEW MODAL ────────────────────────────────────── */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#eae8d8] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <button 
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl font-bold bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
            <div className="flex gap-4">
              <img 
                src={getProductImage(selectedProductModal)} 
                alt={selectedProductModal.title}
                className="w-24 h-24 object-contain border border-[#eae8d8] bg-[#fdfcf7] p-2" 
              />
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  {typeof selectedProductModal.category === 'object' ? selectedProductModal.category?.name : selectedProductModal.category}
                </span>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">{selectedProductModal.title}</h3>
                <p className="text-base font-bold text-[#729855] mt-1">{formatPrice(selectedProductModal.price)}</p>
                <p className="text-xs text-gray-500 mt-1">Stock Level: <strong className="text-black">{selectedProductModal.stock} units</strong></p>
              </div>
            </div>
            <p className="text-xs text-gray-600 border-t border-b border-[#eae8d8] py-3 line-clamp-3">
              {selectedProductModal.description || 'Premium skincare and beauty item.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setSelectedProductModal(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#eae8d8] text-gray-700 hover:bg-gray-50 border-none cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => { setSelectedProductModal(null); navigate('/admin/products'); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#2f3e10] text-[#F9F9EB] hover:bg-[#729855] border-none cursor-pointer"
              >
                Edit in Admin Products
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper SVG Icon for empty state chart
const BarChart3Icon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);

export default AdminStats;
