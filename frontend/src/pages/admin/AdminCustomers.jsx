import React, { useMemo } from 'react';
import { Mail, Calendar, User, ShoppingBag } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminCustomers = ({ users = [], orders = [] }) => {
  useDocumentTitle('Admin - Customers');

  const customers = useMemo(() => {
    return users.filter(u => u.role === 'Customer').map(u => {
      // Find orders placed by this user
      const customerOrders = orders.filter(o => o.user === u._id || o.user?._id === u._id);
      const totalSpend = customerOrders.reduce((sum, o) => o.isPaid ? sum + o.totalPrice : sum, 0);
      return {
        ...u,
        ordersCount: customerOrders.length,
        totalSpend
      };
    });
  }, [users, orders]);

  return (
    <div className="space-y-6 select-none animate-fade-in text-left">
      <div>
        <h3 className="text-base font-bold text-black uppercase tracking-wider">Registered Store Customers</h3>
        <p className="text-xs text-gray-400 mt-1">Direct listing of active shopping profiles and customer metrics</p>
      </div>

      <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4">Orders Placed</th>
              <th className="p-4">Total Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae8d8]/40">
            {customers.map((c) => (
              <tr key={c._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                <td className="p-4 font-semibold text-black flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#eae8d8]/40 flex items-center justify-center text-gray-500 font-bold uppercase text-[10px]">
                    {c.name.slice(0, 2)}
                  </div>
                  <span>{c.name}</span>
                </td>
                <td className="p-4 font-mono text-gray-500">{c.email}</td>
                <td className="p-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600 font-semibold">{c.ordersCount} Orders</td>
                <td className="p-4 font-bold text-[#729855]">Rs. {c.totalSpend.toLocaleString('en-IN')}.00</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center italic text-gray-400">No registered customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
