/**
 * AdminUsers — Staff roles and user accounts management.
 *
 * IMPROVEMENTS (Phase 6+7):
 * - Added AdminPageHeader with user count
 * - Short ID display instead of full MongoDB _id
 * - Avatar initials placeholder
 * - Role badge with proper variants
 * - Registration date column
 * - Consistent delete with toast feedback
 */
import React from 'react';
import { Trash2 } from 'lucide-react';
import { userService } from '../../api/userService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import AdminPageHeader from '../../components/ui/AdminPageHeader';

const AdminUsers = ({ users = [], onRefresh }) => {
  useDocumentTitle('Admin - Users');
  const { showToast } = useToast();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete account for "${name}"? This action is irreversible.`)) return;
    const result = await userService.delete(id);
    if (result.success) {
      showToast(`Account for "${name}" deleted.`, 'success');
      onRefresh?.();
    } else {
      showToast(result.message || 'Deletion failed', 'error');
    }
  };

  const admins = users.filter(u => u.isAdmin).length;
  const customers = users.length - admins;

  return (
    <div className="space-y-6 select-none">
      <AdminPageHeader
        title="Staff & User Roles"
        subtitle={`${users.length} accounts — ${admins} admin, ${customers} customers`}
      />

      <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae8d8]/40">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-[#eae8d8]/20 transition-colors text-xs font-semibold">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#eae8d8] flex items-center justify-center text-[10px] font-bold uppercase text-[#2f3e10] flex-shrink-0">
                      {u.name?.slice(0, 2) || 'U?'}
                    </div>
                    <span className="font-semibold text-black">{u.name}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-gray-500 select-text">{u.email}</td>
                <td className="p-4 select-none">
                  <Badge variant={u.isAdmin ? 'purple' : 'neutral'}>
                    {u.isAdmin ? 'Admin' : 'Customer'}
                  </Badge>
                </td>
                <td className="p-4 text-gray-400 font-mono">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="p-4 text-center">
                  {!u.isAdmin && (
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                      aria-label={`Delete user ${u.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center italic text-gray-400">
                  No user accounts found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
