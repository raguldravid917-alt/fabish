import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, X, Star, Eye, EyeOff } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { teamService } from '../../api/teamService';
import Loader from '../../components/ui/Loader';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { getLocalImageUrl } from '../../utils/imageMapper';

const INITIAL_FORM = {
  name: '', role: '', department: '', bio: '', order: 0, isFeatured: false, isActive: true,
  socialLinks: { linkedin: '', twitter: '', instagram: '', website: '' },
};

const AdminTeam = () => {
  useDocumentTitle('Admin - Our Team');
  const { showToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await teamService.adminGetAll();
      if (res.success) {
        setMembers(res.data?.members || []);
      } else {
        showToast(res.message || 'Failed to load team', 'error');
      }
    } catch {
      showToast('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview('');
    setEditingMember(null);
    setError('');
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name || '',
      role: member.role || '',
      department: member.department || '',
      bio: member.bio || '',
      order: member.order || 0,
      isFeatured: member.isFeatured || false,
      isActive: member.isActive !== false,
      socialLinks: { linkedin: member.socialLinks?.linkedin || '', twitter: member.socialLinks?.twitter || '', instagram: member.socialLinks?.instagram || '', website: member.socialLinks?.website || '' },
    });
    setImagePreview(member.image || '');
    setImageFile(null);
    setError('');
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      const res = await teamService.adminDelete(id);
      if (res.success) { showToast('Team member removed', 'success'); fetchMembers(); }
      else showToast(res.message || 'Delete failed', 'error');
    } catch { showToast('Connection failed', 'error'); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('social.')) {
      const key = name.replace('social.', '');
      setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.role.trim() || !form.department.trim()) {
      setError('Name, role, and department are required.');
      return;
    }

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('role', form.role.trim());
    fd.append('department', form.department.trim());
    fd.append('bio', form.bio.trim());
    fd.append('order', form.order);
    fd.append('isFeatured', form.isFeatured);
    fd.append('isActive', form.isActive);
    fd.append('socialLinks', JSON.stringify(form.socialLinks));
    if (imageFile) fd.append('image', imageFile);
    else if (!imagePreview && editingMember?.image) fd.append('image', ''); // Clear image

    setSubmitting(true);
    try {
      const res = editingMember
        ? await teamService.adminUpdate(editingMember._id, fd)
        : await teamService.adminCreate(fd);

      if (res.success) {
        showToast(editingMember ? 'Team member updated!' : 'Team member added!', 'success');
        resetForm();
        setView('list');
        fetchMembers();
      } else {
        setError(res.message || 'Action failed');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 select-none animate-fade-in text-left">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider">Our Team</h3>
            <p className="text-xs text-gray-400 mt-1">Manage team members displayed on the Our Team page</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }} className="bg-[#2f3e10] hover:bg-black text-white px-5 py-3 font-heading font-bold text-xs uppercase tracking-widest border-none cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae8d8]/40">
                {members.map((m) => {
                  const imgSrc = m.image ? (m.image.startsWith('http') ? m.image : getLocalImageUrl(m.image)) : null;
                  return (
                    <tr key={m._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f0ede0] flex-shrink-0">
                            {imgSrc ? <img src={imgSrc} alt={m.name} className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-gray-400 m-auto" />}
                          </div>
                          <div>
                            <p className="font-semibold text-black">{m.name}</p>
                            <p className="text-gray-400 text-[10px]">{m.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{m.department}</td>
                      <td className="p-4 text-gray-500 font-mono">{m.order}</td>
                      <td className="p-4">{m.isFeatured ? <Star className="w-4 h-4 text-[#8B5A2B] fill-[#8B5A2B]" /> : <span className="text-gray-300">—</span>}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(m)} className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(m._id)} className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {members.length === 0 && <tr><td colSpan="6" className="p-12 text-center italic text-gray-400">No team members yet. Add your first member.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Form View
  return (
    <div className="bg-white border border-[#eae8d8] p-8 md:p-14 max-w-3xl mx-auto shadow-sm text-left animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#eae8d8] pb-4 mb-8">
        <h3 className="text-2xl font-heading font-medium text-black uppercase tracking-wide">
          {editingMember ? `Edit: ${editingMember.name}` : 'Add Team Member'}
        </h3>
        <button onClick={() => { resetForm(); setView('list'); }} className="text-gray-500 hover:text-black font-heading text-[10px] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer">
          ← Cancel
        </button>
      </div>

      {error && <ErrorAlert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Role / Title *</label>
            <input name="role" value={form.role} onChange={handleChange} required placeholder="e.g., Head of Marketing" className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Department *</label>
            <input name="department" value={form.department} onChange={handleChange} required placeholder="e.g., Marketing" className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Display Order</label>
            <input type="number" name="order" value={form.order} onChange={handleChange} min={0} className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} maxLength={1000} placeholder="Brief description about this team member..." className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none resize-y" />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-[#eae8d8] px-3 py-2 text-xs text-black" />
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img src={imagePreview.startsWith('data:') ? imagePreview : (imagePreview.startsWith('http') ? imagePreview : getLocalImageUrl(imagePreview))} alt="Preview" className="w-20 h-20 object-cover rounded-full border border-[#eae8d8]" />
              <button type="button" onClick={() => { setImagePreview(''); setImageFile(null); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="pt-4 border-t border-[#eae8d8]">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-4">Social Links</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['linkedin', 'twitter', 'instagram', 'website'].map((s) => (
              <div key={s}>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2">{s}</label>
                <input name={`social.${s}`} value={form.socialLinks[s]} onChange={handleChange} placeholder={`https://`} className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-black">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-[#8B5A2B]" />
            <Star className="w-4 h-4 text-[#8B5A2B]" /> Leadership / Featured
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-black">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-[#729855]" />
            {form.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            {form.isActive ? 'Visible' : 'Hidden'}
          </label>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
          {submitting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {editingMember ? 'Save Changes' : 'Add Team Member'}
        </button>
      </form>
    </div>
  );
};

export default AdminTeam;
