import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Calendar, BookOpen } from 'lucide-react';
import Loader from '../../components/ui/Loader';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminBlogs = () => {
  useDocumentTitle('Admin - Blogs');
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingBlog, setEditingBlog] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [tags, setTags] = useState('');

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blogs');
      if (res.success) {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setEditingBlog(null);
    setTitle('');
    setAuthor('');
    setContent('');
    setImagePreview('');
    setTags('');
    setError('');
  };

  const handleEditClick = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setAuthor(blog.author || '');
    setContent(blog.content);
    setImagePreview(blog.image || '');
    setTags(blog.tags?.join(', ') || '');
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await api.delete(`/blogs/${id}`);
      if (res.success) {
        showToast('Blog post deleted successfully!', 'success');
        fetchBlogs();
      } else {
        showToast(res.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      showToast('Please fill in title and content', 'error');
      return;
    }

    setIsSubmitLoading(true);
    const payload = {
      title,
      author: author || 'Admin Staff',
      content,
      image: imagePreview || '/assets/Blog03.jpg',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const res = editingBlog
        ? await api.put(`/blogs/${editingBlog._id}`, payload)
        : await api.post('/blogs', payload);
      
      setIsSubmitLoading(false);

      if (res.success) {
        showToast(editingBlog ? 'Blog updated successfully!' : 'Blog post published!', 'success');
        resetForm();
        setView('list');
        fetchBlogs();
      } else {
        setError(res.message || 'Action failed');
      }
    } catch (err) {
      setIsSubmitLoading(false);
      setError('Connection failed. Server error.');
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 select-none animate-fade-in text-left">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-black uppercase tracking-wider">Editorial Blog Posts</h3>
            <p className="text-xs text-gray-400 mt-1">Manage articles and promotions on storefront blog columns</p>
          </div>
          <button
            onClick={() => { resetForm(); setView('form'); }}
            className="bg-[#2f3e10] hover:bg-black text-white px-5 py-3 font-heading font-bold text-xs uppercase tracking-widest border-none cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Write Post
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white border border-[#eae8d8] overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#eae8d8]/50 border-b border-[#eae8d8] font-heading text-[10px] font-bold uppercase tracking-wider text-black select-none">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae8d8]/40">
                {blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-[#eae8d8]/20 transition-colors">
                    <td className="p-4 font-semibold text-black flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>{b.title}</span>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">{b.author || 'Admin'}</td>
                    <td className="p-4 text-gray-500">{b.tags?.join(', ') || 'General'}</td>
                    <td className="p-4 text-gray-400 font-mono">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-2 border border-[#eae8d8] text-black hover:bg-black hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer bg-[#fcfcfa] rounded-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center italic text-gray-400">No blog articles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#eae8d8] p-8 md:p-14 max-w-3xl mx-auto shadow-sm text-left animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#eae8d8] pb-4 mb-8">
        <h3 className="serif-title text-2xl text-black uppercase font-medium tracking-wide">
          {editingBlog ? `Edit Article: ${editingBlog.title}` : 'Write New Article'}
        </h3>
        <button
          onClick={() => { resetForm(); setView('list'); }}
          className="text-gray-500 hover:text-black font-heading text-[10px] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer"
        >
          ← Cancel
        </button>
      </div>

      {error && <ErrorAlert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Article Title *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Author Name</label>
            <input 
              type="text" 
              placeholder="Admin Staff"
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Featured Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-[#eae8d8] px-3 py-2 text-xs text-black"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover border border-[#eae8d8] mt-3" />
            )}
          </div>
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Tags (comma-separated)</label>
            <input 
              type="text" 
              placeholder="skincare, beauty, routine"
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none" 
            />
          </div>
        </div>

        <div>
          <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Article Content *</label>
          <textarea 
            required
            rows={10} 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3 font-body text-sm text-black focus:outline-none focus:border-[#729855] rounded-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitLoading}
          className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none shadow-sm flex items-center justify-center gap-1.5"
        >
          {isSubmitLoading ? <Loader size="small" /> : null}
          {editingBlog ? 'Save Article' : 'Publish Article'}
        </button>
      </form>
    </div>
  );
};

export default AdminBlogs;
