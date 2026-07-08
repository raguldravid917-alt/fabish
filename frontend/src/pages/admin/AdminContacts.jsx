/**
 * AdminContacts — Customer inquiry management page.
 *
 * IMPROVEMENTS (Phase 6+7):
 * - Added AdminPageHeader with inquiry count
 * - Proper table layout with consistent styling matching other admin pages
 * - Message truncation with tooltip-style title attribute
 * - Formatted timestamps
 * - Avatar initials for sender
 */
import React from 'react';
import { Mail } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AdminPageHeader from '../../components/ui/AdminPageHeader';

const AdminContacts = ({ contacts = [] }) => {
  useDocumentTitle('Admin - Inquiries');

  return (
    <div className="space-y-6 select-none">
      <AdminPageHeader
        title="Customer Inquiries"
        subtitle={`${contacts.length} contact form submission${contacts.length !== 1 ? 's' : ''} received`}
      />

      <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
            <tr>
              <th className="p-4">Sender</th>
              <th className="p-4">Email</th>
              <th className="p-4">Message Preview</th>
              <th className="p-4">Received At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae8d8]/40">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center gap-3">
                    <Mail className="w-10 h-10 text-gray-200" />
                    <span>No customer inquiries received yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c._id} className="hover:bg-[#eae8d8]/20 transition-colors text-xs">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#eae8d8] flex items-center justify-center text-[10px] font-bold uppercase text-[#2f3e10] flex-shrink-0">
                        {c.name?.slice(0, 2) || '??'}
                      </div>
                      <span className="font-semibold text-black">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-gray-500 select-text">{c.email}</td>
                  <td className="p-4 text-gray-700 font-medium max-w-xs" title={c.message}>
                    <span className="block truncate">{c.message}</span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContacts;
