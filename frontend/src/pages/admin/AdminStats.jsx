import React, { useMemo } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users as UsersIcon, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  TrendingUp 
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/formatPrice';

const AdminStats = ({ products = [], orders = [], users = [] }) => {
  useDocumentTitle('Admin Stats Overview');

  // Key KPI Calculations
  const metrics = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => o.isPaid ? sum + o.totalPrice : sum, 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const lowStockItems = products.filter(p => p.stock <= 5);
    const customerCount = users.filter(u => u.role === 'Customer').length;

    // Today's Sales (mocked/calculated based on today's dates)
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Monthly Sales
    const currentMonth = new Date().getMonth();
    const monthlyOrders = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth);
    const monthlySalesVal = monthlyOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    return {
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      lowStock: lowStockItems.length,
      lowStockList: lowStockItems.slice(0, 5),
      customers: customerCount,
      todaySales,
      monthlySalesVal,
    };
  }, [products, orders, users]);

  // Sales Trends Data (Pre-computing last 6 months for SVG Chart)
  const chartData = useMemo(() => {
    // Generate mock coordinate points for drawing a smooth SVG bezier spline
    const values = [45000, 68000, 52000, 95000, 81000, metrics.monthlySalesVal || 120000];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const maxVal = Math.max(...values, 100000);
    const points = values.map((val, idx) => {
      const x = 50 + idx * 80;
      const y = 170 - (val / maxVal) * 120;
      return { x, y, val, label: labels[idx] };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

    return { points, pathD, areaD, labels };
  }, [metrics.monthlySalesVal]);

  // Category sales share
  const categoryStats = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const catName = p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : 'Uncategorized';
      counts[catName] = (counts[catName] || 0) + 1;
    });
    const total = products.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a,b) => b.count - a.count).slice(0, 4);
  }, [products]);

  return (
    <div className="space-y-8 select-none">
      
      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Card */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Total Revenue</span>
            <h3 className="text-2xl font-semibold text-black tracking-tight">{formatPrice(metrics.totalSales)}</h3>
            <span className="text-[11px] text-brand-green font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% Monthly
            </span>
          </div>
          <div className="p-4 bg-green-50 text-[#729855]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">All Orders</span>
            <h3 className="text-2xl font-semibold text-black tracking-tight">{metrics.totalOrders}</h3>
            <span className="text-[11px] text-gray-500 font-medium">
              {metrics.pendingOrders} Pending Deliveries
            </span>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Catalog Items */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Active Catalog</span>
            <h3 className="text-2xl font-semibold text-black tracking-tight">{products.length}</h3>
            {metrics.lowStock > 0 ? (
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {metrics.lowStock} Low Stock Alert
              </span>
            ) : (
              <span className="text-[11px] text-brand-green font-bold">Stock levels optimal</span>
            )}
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-gray-400 block">Registered Customers</span>
            <h3 className="text-2xl font-semibold text-black tracking-tight">{metrics.customers}</h3>
            <span className="text-[11px] text-gray-500 font-medium">
              {users.length - metrics.customers} Admin Staff accounts
            </span>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Chart Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom SVG Line Chart */}
        <div className="bg-white border border-[#eae8d8] p-6 lg:col-span-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-black uppercase tracking-wider">Revenue Analytics</h3>
              <p className="text-xs text-gray-400 mt-1">Monthly business sales trends</p>
            </div>
            <span className="text-xs font-bold bg-[#eae8d8]/50 text-black px-3 py-1">2026 YTD</span>
          </div>

          <div className="w-full flex justify-center">
            {/* SVG Plot */}
            <svg viewBox="0 0 500 200" className="w-full max-w-xl h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#729855" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#729855" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="30" y1="50" x2="470" y2="50" stroke="#eae8d8" strokeWidth="0.5" strokeDasharray="3"/>
              <line x1="30" y1="110" x2="470" y2="110" stroke="#eae8d8" strokeWidth="0.5" strokeDasharray="3"/>
              <line x1="30" y1="170" x2="470" y2="170" stroke="#eae8d8" strokeWidth="0.5"/>

              {/* Area path */}
              <path d={chartData.areaD} fill="url(#chartGradient)"/>

              {/* Line path */}
              <path d={chartData.pathD} fill="none" stroke="#729855" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

              {/* Points */}
              {chartData.points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2f3e10" strokeWidth="2" className="hover:r-6 transition-all"/>
                  <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[8px] font-semibold fill-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(p.val)}
                  </text>
                  <text x={p.x} y="192" textAnchor="middle" className="text-[9px] font-bold fill-gray-400 uppercase tracking-wider">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Categories Bar share */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider mb-1">Top Categories</h3>
            <p className="text-xs text-gray-400 mb-6">Inventory concentration share</p>
            
            <div className="space-y-5">
              {categoryStats.map(cat => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-black uppercase tracking-wider">{cat.name}</span>
                    <span className="text-gray-400">{cat.count} items ({cat.percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 w-full rounded-none overflow-hidden">
                    <div className="h-full bg-[#729855]" style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-[#eae8d8] pt-4 mt-6 flex justify-between text-xs text-gray-400 select-none">
            <span>Uncategorized items</span>
            <span className="font-bold text-black">0</span>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts and Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Orders Lists */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-black uppercase tracking-wider mb-1">Pending Deliveries</h3>
          <p className="text-xs text-gray-400 mb-6">Orders waiting processing and dispatch</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#eae8d8] font-heading font-bold text-gray-400 uppercase tracking-widest">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae8d8]/50">
                {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').slice(0, 4).map(o => (
                  <tr key={o._id} className="text-gray-600 hover:text-black">
                    <td className="py-3 font-mono">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 font-semibold">{o.shippingAddress?.name || 'Customer'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${o.isPaid ? 'bg-green-50 text-[#729855]' : 'bg-red-50 text-red-600'}`}>
                        {o.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{formatPrice(o.totalPrice)}</td>
                  </tr>
                ))}
                {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center italic text-gray-400">All orders fully processed!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory low stock warnings */}
        <div className="bg-white border border-[#eae8d8] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-black uppercase tracking-wider mb-1">Low Stock Warning</h3>
          <p className="text-xs text-gray-400 mb-6">Catalog items with stock level $\le$ 5 units</p>

          <div className="space-y-4">
            {metrics.lowStockList.map(prod => (
              <div key={prod._id} className="flex justify-between items-center py-2.5 border-b border-[#eae8d8]/50 last:border-0">
                <div>
                  <h4 className="text-xs font-semibold text-black uppercase tracking-wider">{prod.title}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{typeof prod.category === 'object' ? prod.category?.name : (prod.category || 'Uncategorized')}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1">
                    {prod.stock} Left
                  </span>
                </div>
              </div>
            ))}
            {metrics.lowStockList.length === 0 && (
              <p className="text-center italic py-8 text-gray-400 text-xs">All inventory stock levels optimal.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminStats;
