import React, { useContext, useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Settings, 
  CheckCircle2, 
  Truck, 
  ArrowLeft, 
  ChevronRight,
  Package,
  ClipboardList,
  Plus,
  Edit,
  Trash,
  Check,
  Home,
  Briefcase,
  Globe,
  Camera,
  XCircle,
  AlertCircle,
  Heart,
  Award,
  Tag,
  Copy,
  Calendar
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { orderService } from '../api/orderService';
import { addressService } from '../api/addressService';
import { getLocalImageUrl } from '../utils/imageMapper';
import { useToast } from '../context/ToastContext';
import GSTInvoice from '../components/invoice/GSTInvoice';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    
    const duration = 800; // 0.8 seconds
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 16));

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, uploadAvatar, removeAvatar } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { wishlistItems, toggleWishlist } = useContext(WishlistContext);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // API State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  // Profile Settings Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoadingAddresses(true);
      const res = await addressService.getAddresses();
      if (res.success) {
        setAddresses(res.data || []);
      } else {
        showToast(res.message || 'Failed to load addresses', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to address service', 'error');
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/account/login?redirect=/account/profile');
    } else {
      fetchAddresses();
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await orderService.getMyOrders();
        if (res.success) {
          setOrders(res.data || []);
        } else {
          showToast(res.message || 'Failed to load orders', 'error');
        }
      } catch (err) {
        showToast('Connection to server failed', 'error');
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, showToast]);

  // Address Form States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrCountry, setAddrCountry] = useState('India');
  const [addrType, setAddrType] = useState('Home');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  const resetAddressForm = () => {
    setAddrFullName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrLine1('');
    setAddrLine2('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('');
    setAddrPostalCode('');
    setAddrCountry('India');
    setAddrType('Home');
    setAddrIsDefault(false);
    setAddressError('');
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    resetAddressForm();
    setIsAddressModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setAddrFullName(addr.fullName || '');
    setAddrPhone(addr.phone || '');
    setAddrLine1(addr.addressLine1 || '');
    setAddrLine2(addr.addressLine2 || '');
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPostalCode(addr.postalCode || '');
    setAddrCountry(addr.country || 'India');
    setAddrType(addr.addressType || 'Home');
    setAddrIsDefault(addr.isDefault || false);
    setAddressError('');
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');

    // Validations
    if (!addrFullName.trim()) return setAddressError('Full name is required');
    if (!addrPhone.trim()) return setAddressError('Phone number is required');
    if (!addrPhone.trim().match(/^\+?[0-9\s-]{10,15}$/)) {
      return setAddressError('Please enter a valid phone number (at least 10 digits)');
    }
    if (!addrLine1.trim()) return setAddressError('Address Line 1 is required');
    if (!addrCity.trim()) return setAddressError('City is required');
    if (!addrState.trim()) return setAddressError('State is required');
    if (!addrPostalCode.trim()) return setAddressError('Postal Code is required');
    if (!addrPostalCode.trim().match(/^[a-zA-Z0-9\s-]{3,10}$/)) {
      return setAddressError('Please enter a valid Postal Code / PIN code (3-10 characters)');
    }

    const payload = {
      fullName: addrFullName.trim(),
      phone: addrPhone.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim(),
      landmark: addrLandmark.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      postalCode: addrPostalCode.trim(),
      country: addrCountry.trim(),
      addressType: addrType,
      isDefault: addrIsDefault,
    };

    setSubmittingAddress(true);
    try {
      let res;
      if (editingAddress) {
        res = await addressService.updateAddress(editingAddress._id, payload);
      } else {
        res = await addressService.createAddress(payload);
      }

      if (res.success) {
        showToast(editingAddress ? 'Address updated successfully!' : 'Address created successfully!', 'success');
        setIsAddressModalOpen(false);
        fetchAddresses();
      } else {
        setAddressError(res.message || 'Failed to save address');
      }
    } catch (err) {
      setAddressError('Connection to address service failed');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await addressService.deleteAddress(id);
      if (res.success) {
        showToast('Address deleted successfully!', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to delete address', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await addressService.setDefaultAddress(id);
      if (res.success) {
        showToast('Default address updated!', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to set default address', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, JPG, PNG, and WEBP formats are supported', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const res = await uploadAvatar(file);
      if (res.success) {
        showToast('Profile photo updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to upload photo', 'error');
      }
    } catch (err) {
      showToast('Photo upload failed', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setUploadingPhoto(true);
    try {
      const res = await removeAvatar();
      if (res.success) {
        showToast('Profile photo removed successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to remove photo', 'error');
      }
    } catch (err) {
      showToast('Failed to remove photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmittingSettings(true);
    try {
      const res = await updateProfile(name, email, phone, password || undefined);
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      showToast('Server update failed', 'error');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handleBuyAgain = (order) => {
    if (!order || !order.orderItems) return;
    try {
      order.orderItems.forEach(item => {
        const productObj = {
          _id: item.product,
          title: item.title,
          price: item.price,
          images: [item.image]
        };
        addToCart(productObj, item.qty || 1);
      });
      showToast('Items added to your bag!', 'success');
    } catch (err) {
      showToast('Failed to add items to bag', 'error');
    }
  };

  const handleCopyCoupon = (code) => {
    try {
      navigator.clipboard.writeText(code);
      showToast(`Coupon code "${code}" copied to clipboard!`, 'success');
    } catch (err) {
      showToast('Failed to copy code', 'error');
    }
  };

  // Invoice printing handled by GSTInvoice component internally

  // Define tracking timeline stages helper
  const getTimelineStages = (order) => {
    const isPaid = order.paymentStatus === 'Paid' || order.isPaid;
    const isCOD = order.paymentMethod === 'COD';
    const status = order.orderStatus;

    return [
      { label: 'Order Placed', desc: 'Your order was registered.', done: true, key: 'Placed' },
      { 
        label: 'Payment Verified', 
        desc: isPaid ? 'Payment received successfully.' : (isCOD ? 'COD order confirmed.' : 'Awaiting payment verification.'), 
        done: isPaid || isCOD, 
        key: 'Paid' 
      },
      { 
        label: 'Confirmed', 
        desc: 'Seller accepted your order.', 
        done: ['Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Confirmed' 
      },
      { 
        label: 'Packed', 
        desc: 'Items are packaged and ready.', 
        done: ['Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Packed' 
      },
      { 
        label: 'Shipped', 
        desc: 'In transit to distribution hub.', 
        done: ['Shipped', 'Out For Delivery', 'Delivered'].includes(status), 
        key: 'Shipped' 
      },
      { 
        label: 'Out For Delivery', 
        desc: 'Courier is delivering today.', 
        done: ['Out For Delivery', 'Delivered'].includes(status), 
        key: 'Out For Delivery' 
      },
      { 
        label: 'Delivered', 
        desc: 'Successfully received.', 
        done: status === 'Delivered', 
        key: 'Delivered' 
      }
    ];
  };

  if (!user) return null;

  return (
    <div className="bg-[#f7f6f0] min-h-screen py-12 font-body text-brand-charcoal select-none">
      


      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border pb-6 mb-10 gap-4 no-print">
          <div>
            <h1 className="serif-title text-3xl md:text-4xl uppercase tracking-wide">My Account</h1>
            <p className="text-brand-muted text-xs font-semibold tracking-wider font-heading uppercase mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <button 
            onClick={logout}
            className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-6 py-2.5 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* GST Tax Invoice Modal */}
        {viewInvoice && (
          <GSTInvoice
            order={viewInvoice}
            onClose={() => setViewInvoice(null)}
          />
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-brand-border mb-10 overflow-x-auto no-scrollbar no-print gap-1 select-none">
          <button 
            onClick={() => setSearchParams({ tab: 'dashboard' })}
            className={`py-4 px-6 font-heading font-bold text-[11px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 rounded-none ${
              activeTab === 'dashboard' ? 'border-[#729855] text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button 
            onClick={() => { setSearchParams({ tab: 'orders' }); setSelectedOrder(null); }}
            className={`py-4 px-6 font-heading font-bold text-[11px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 rounded-none ${
              activeTab === 'orders' ? 'border-[#729855] text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> My Orders
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'addresses' })}
            className={`py-4 px-6 font-heading font-bold text-[11px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 rounded-none ${
              activeTab === 'addresses' ? 'border-[#729855] text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Addresses
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`py-4 px-6 font-heading font-bold text-[11px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 rounded-none ${
              activeTab === 'wishlist' ? 'border-[#729855] text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Wishlist
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`py-4 px-6 font-heading font-bold text-[11px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 rounded-none ${
              activeTab === 'settings' ? 'border-[#729855] text-brand-charcoal' : 'border-transparent text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>

        {/* Content Panels */}
        <div className="no-print">
          <AnimatePresence mode="wait">
            
            {/* TABS 0: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Welcome Banner */}
                <div className="bg-[#faf9f5] border border-brand-border p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden rounded-none">
                  {/* Organic leaf vector SVG overlays background */}
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] pointer-events-none select-none text-brand-green z-0">
                    <svg width="280" height="280" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M10,90 Q30,60 70,80 T95,10 C80,30 40,30 10,90 Z" />
                      <path d="M5,80 Q25,50 65,70 T90,5 C75,25 35,25 5,80 Z" />
                    </svg>
                  </div>

                  <div className="space-y-2 z-10 text-left">
                    <span className="block font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-[#729855]">Member Space</span>
                    <h2 className="serif-title text-3xl text-brand-charcoal font-normal">Welcome back, {user.name}</h2>
                    <p className="text-[12px] font-body text-brand-muted max-w-md leading-relaxed mt-1">
                      Manage your orders, saved delivery coordinates, rewards tier details, and edit your profile settings.
                    </p>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-heading font-bold uppercase tracking-[0.2em]">
                      <Link to="/collections/all" className="text-brand-charcoal hover:text-[#729855] underline underline-offset-4 decoration-1 transition-colors">
                        Shop New Arrivals
                      </Link>
                      <span className="text-brand-border/60 select-none">•</span>
                      <button onClick={() => setSearchParams({ tab: 'orders' })} className="text-brand-charcoal hover:text-[#729855] underline underline-offset-4 decoration-1 transition-colors bg-transparent border-none cursor-pointer p-0">
                        View Orders
                      </button>
                      <span className="text-brand-border/60 select-none">•</span>
                      <button onClick={() => setSearchParams({ tab: 'settings' })} className="text-brand-charcoal hover:text-[#729855] underline underline-offset-4 decoration-1 transition-colors bg-transparent border-none cursor-pointer p-0">
                        Profile Settings
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-6 items-center shrink-0 border border-brand-border bg-white p-5 rounded-none z-10 w-full md:w-auto">
                    <div className="text-left space-y-1">
                      <span className="block font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted">Member Tier</span>
                      <span className="serif-title text-base text-brand-charcoal flex items-center gap-1.5 font-normal">
                        <Award className="w-4 h-4 text-[#729855]" /> Fabish Gold Circle
                      </span>
                      <span className="block text-[10px] font-semibold text-brand-muted font-body">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Recently'}</span>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                  
                  {/* Card 1: Orders */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: '#729855' }}
                    onClick={() => setSearchParams({ tab: 'orders' })}
                    className="bg-white border border-brand-border p-5 rounded-none flex flex-col justify-between cursor-pointer group transition-colors select-none text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted group-hover:text-brand-charcoal transition-colors">Orders Placed</span>
                      <ShoppingBag className="w-4 h-4 text-[#729855] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="serif-title text-3xl text-brand-charcoal font-normal">
                      <AnimatedCounter value={orders.length} />
                    </span>
                  </motion.div>

                  {/* Card 2: Addresses */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: '#729855' }}
                    onClick={() => setSearchParams({ tab: 'addresses' })}
                    className="bg-white border border-brand-border p-5 rounded-none flex flex-col justify-between cursor-pointer group transition-colors select-none text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted group-hover:text-brand-charcoal transition-colors">Addresses</span>
                      <MapPin className="w-4 h-4 text-[#729855] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="serif-title text-3xl text-brand-charcoal font-normal">
                      <AnimatedCounter value={addresses.length} />
                    </span>
                  </motion.div>

                  {/* Card 3: Wishlist */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: '#729855' }}
                    onClick={() => setSearchParams({ tab: 'wishlist' })}
                    className="bg-white border border-brand-border p-5 rounded-none flex flex-col justify-between cursor-pointer group transition-colors select-none text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted group-hover:text-brand-charcoal transition-colors">Wishlist Items</span>
                      <Heart className="w-4 h-4 text-[#729855] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="serif-title text-3xl text-brand-charcoal font-normal">
                      <AnimatedCounter value={wishlistItems.length} />
                    </span>
                  </motion.div>

                  {/* Card 4: Rewards */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: '#729855' }}
                    className="bg-white border border-brand-border p-5 rounded-none flex flex-col justify-between group transition-colors select-none text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted">Reward Points</span>
                      <Award className="w-4 h-4 text-[#729855] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="serif-title text-3xl text-brand-charcoal font-normal">
                      <AnimatedCounter value={120} />
                    </span>
                  </motion.div>

                  {/* Card 5: Coupons */}
                  <motion.div
                    whileHover={{ y: -4, borderColor: '#729855' }}
                    className="bg-white border border-brand-border p-5 rounded-none flex flex-col justify-between group transition-colors select-none text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-brand-muted">Active Coupons</span>
                      <Tag className="w-4 h-4 text-[#729855] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="serif-title text-3xl text-brand-charcoal font-normal">
                      <AnimatedCounter value={3} />
                    </span>
                  </motion.div>

                </div>

                {/* Main Dashboard Layout Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  
                  {/* Left Column: Recent Orders & Tier Rewards progress */}
                  <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    
                    {/* Recent Orders section */}
                    <div className="bg-white border border-brand-border p-6 rounded-none space-y-6">
                      <div className="flex justify-between items-center border-b border-brand-border pb-3">
                        <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-brand-charcoal">Recent Transactions</span>
                        <button onClick={() => setSearchParams({ tab: 'orders' })} className="text-[#729855] hover:text-[#2f3e10] font-heading font-bold text-[9px] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0">
                          View All Orders
                        </button>
                      </div>

                      {loadingOrders ? (
                        <Loader />
                      ) : orders.length === 0 ? (
                        <div className="py-12 text-center max-w-sm mx-auto space-y-4">
                          <ClipboardList className="w-10 h-10 text-brand-border mx-auto" />
                          <h4 className="serif-title text-base text-brand-charcoal font-normal">Your order history is empty</h4>
                          <p className="text-brand-muted text-xs leading-relaxed">No orders registered yet. Browse our collections to find your organic skincare routine.</p>
                          <Link to="/collections/all" className="inline-flex items-center justify-center bg-brand-charcoal hover:bg-[#729855] text-white font-heading text-[10px] font-bold tracking-widest uppercase transition-all px-6 py-2.5 rounded-none">
                            Browse Shop
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 2).map((order) => (
                            <div key={order._id} className="border border-brand-border p-4 rounded-none space-y-4 text-left">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border/40 pb-3">
                                <div>
                                  <span className="font-heading text-[8px] font-bold uppercase tracking-widest text-[#729855]">Order ID</span>
                                  <p className="font-mono font-bold text-xs text-brand-charcoal leading-snug">#{order.orderNumber}</p>
                                  <span className="text-[10px] text-brand-muted font-body mt-0.5 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className={`inline-block px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-widest ${
                                    order.paymentStatus === 'Paid' ? 'bg-green-50 border border-green-200 text-brand-green' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                                  }`}>{order.paymentStatus}</span>
                                  <span className={`inline-block px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-widest ${
                                    order.orderStatus === 'Delivered' ? 'bg-green-50 border border-green-200 text-brand-green' : 'bg-blue-50 border border-blue-200 text-blue-700'
                                  }`}>{order.orderStatus}</span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex gap-3 items-center">
                                  {order.orderItems.map((item, idx) => (
                                    <img
                                      key={idx}
                                      src={getLocalImageUrl(item.image)}
                                      alt={item.title}
                                      className="w-10 h-12 object-cover bg-brand-bg-cream border border-brand-border shrink-0"
                                      title={item.title}
                                    />
                                  ))}
                                  <div className="ml-1 text-xs">
                                    <p className="font-bold text-brand-charcoal">{order.orderItems.length} {order.orderItems.length === 1 ? 'Product' : 'Products'}</p>
                                    <p className="text-[10px] text-brand-muted truncate max-w-[200px]">
                                      {order.orderItems.map(item => item.title).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                  <div className="text-left sm:text-right mr-2">
                                    <span className="block font-heading text-[8px] font-bold uppercase tracking-widest text-brand-muted">Total Price</span>
                                    <span className="font-heading font-bold text-xs text-brand-charcoal">Rs. {order.totalPrice.toLocaleString('en-IN')}.00</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => { setSelectedOrder(order); setSearchParams({ tab: 'orders' }); }}
                                      className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer bg-transparent rounded-none"
                                    >
                                      Details
                                    </button>
                                    <button
                                      onClick={() => handleBuyAgain(order)}
                                      className="bg-brand-charcoal text-white hover:bg-[#729855] px-3 py-1.5 font-heading font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none rounded-none"
                                    >
                                      Re-order
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tier Rewards Progression Card */}
                    <div className="bg-[#faf9f5] border border-brand-border p-6 rounded-none space-y-5 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.25em] text-[#729855] block mb-1">Rewards Progress</span>
                          <h4 className="serif-title text-xl text-brand-charcoal font-normal">Fabish Gold Level milestone</h4>
                        </div>
                        <span className="serif-title text-2xl text-[#729855] font-normal">120 <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-muted">pts</span></span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-brand-border/60 h-1.5 rounded-none overflow-hidden">
                          <div className="bg-[#729855] h-full" style={{ width: '80%' }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-brand-muted font-semibold">
                          <span>120 points earned</span>
                          <span>30 points to next discount tier (150 pts)</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-brand-border/40 space-y-2 text-xs">
                        <span className="block font-heading text-[8px] font-bold uppercase tracking-widest text-brand-muted">Unlocked Perks</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-semibold text-brand-charcoal text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#729855]"></span>
                            <span>Free shipping on all order invoices</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#729855]"></span>
                            <span>Access to private product sales</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Default Address Preview & Active Coupons list */}
                  <div className="space-y-6 md:space-y-8">
                    
                    {/* Default Address preview card */}
                    <div className="bg-white border border-brand-border p-6 rounded-none space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-brand-border pb-3">
                        <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-brand-charcoal">Delivery Coordinates</span>
                        <button onClick={() => setSearchParams({ tab: 'addresses' })} className="text-[#729855] hover:text-[#2f3e10] font-heading font-bold text-[9px] uppercase tracking-widest bg-transparent border-none cursor-pointer p-0">
                          Manage
                        </button>
                      </div>

                      {loadingAddresses ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-200 w-1/3"></div>
                          <div className="h-3 bg-gray-200 w-2/3"></div>
                          <div className="h-3 bg-gray-200 w-1/2"></div>
                        </div>
                      ) : addresses.length === 0 ? (
                        <p className="text-xs text-brand-muted leading-relaxed font-body">No addresses registered to your name yet.</p>
                      ) : (
                        <div className="text-xs font-semibold text-brand-charcoal space-y-2">
                          {(() => {
                            const def = addresses.find(a => a.isDefault) || addresses[0];
                            return (
                              <>
                                <div className="flex justify-between items-center">
                                  <p className="font-bold text-sm font-heading">{def.fullName}</p>
                                  <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-[#faf9f5] border border-brand-border text-brand-charcoal px-2 py-0.5">
                                    {def.addressType || 'Home'}
                                  </span>
                                </div>
                                <p className="text-brand-muted font-mono">{def.phone}</p>
                                <p className="text-brand-charcoal/80 font-normal leading-relaxed">
                                  {def.addressLine1}
                                  {def.addressLine2 && `, ${def.addressLine2}`}
                                  <span className="block mt-0.5 font-semibold text-brand-charcoal">{def.city}, {def.state} — {def.postalCode}</span>
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Coupons Available Card */}
                    <div className="bg-white border border-brand-border p-6 rounded-none space-y-4 text-left">
                      <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-brand-charcoal block border-b border-brand-border pb-3">Available Promos</span>
                      
                      <div className="space-y-3.5">
                        
                        {/* Coupon 1: WELCOME10 */}
                        <div className="border border-dashed border-brand-border p-3 flex justify-between items-center rounded-none bg-[#faf9f5]/40 hover:bg-[#faf9f5]/80 transition-colors">
                          <div className="text-left">
                            <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-green-50 text-brand-green px-1.5 py-0.5 border border-green-200">10% OFF</span>
                            <p className="font-mono font-bold text-xs text-brand-charcoal mt-1">WELCOME10</p>
                            <span className="text-[9px] text-brand-muted font-semibold block">Expires in 30 days</span>
                          </div>
                          <button
                            onClick={() => handleCopyCoupon('WELCOME10')}
                            className="bg-brand-charcoal hover:bg-[#729855] text-white p-2 transition-all cursor-pointer border-none rounded-none flex items-center justify-center"
                            title="Copy Coupon"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Coupon 2: FABISH20 */}
                        <div className="border border-dashed border-brand-border p-3 flex justify-between items-center rounded-none bg-[#faf9f5]/40 hover:bg-[#faf9f5]/80 transition-colors">
                          <div className="text-left">
                            <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-green-50 text-brand-green px-1.5 py-0.5 border border-green-200">20% OFF</span>
                            <p className="font-mono font-bold text-xs text-brand-charcoal mt-1">FABISH20</p>
                            <span className="text-[9px] text-brand-muted font-semibold block">Expires in 15 days</span>
                          </div>
                          <button
                            onClick={() => handleCopyCoupon('FABISH20')}
                            className="bg-brand-charcoal hover:bg-[#729855] text-white p-2 transition-all cursor-pointer border-none rounded-none flex items-center justify-center"
                            title="Copy Coupon"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Coupon 3: FREESHIP */}
                        <div className="border border-dashed border-brand-border p-3 flex justify-between items-center rounded-none bg-[#faf9f5]/40 hover:bg-[#faf9f5]/80 transition-colors">
                          <div className="text-left">
                            <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-green-50 text-brand-green px-1.5 py-0.5 border border-green-200">FREE SHIP</span>
                            <p className="font-mono font-bold text-xs text-brand-charcoal mt-1">FREESHIP</p>
                            <span className="text-[9px] text-brand-muted font-semibold block">Member Exclusive</span>
                          </div>
                          <button
                            onClick={() => handleCopyCoupon('FREESHIP')}
                            className="bg-brand-charcoal hover:bg-[#729855] text-white p-2 transition-all cursor-pointer border-none rounded-none flex items-center justify-center"
                            title="Copy Coupon"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>

                {/* Full Width Card: Recent Activity */}
                <div className="bg-white border border-brand-border p-6 rounded-none text-left space-y-5">
                  <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-brand-charcoal block border-b border-brand-border pb-3">Recent Account Activity</span>
                  
                  <div className="relative border-l border-brand-border pl-5 space-y-4 text-xs font-semibold text-brand-charcoal">
                    <div className="relative">
                      <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-[#729855] border-2 border-white"></div>
                      <div>
                        <span className="text-[9px] text-brand-muted font-bold font-heading uppercase tracking-wider block">TODAY</span>
                        <p className="text-brand-charcoal mt-0.5 font-body font-normal">Accessed client dashboard portal session</p>
                      </div>
                    </div>

                    {orders.length > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-[#729855] border-2 border-white"></div>
                        <div>
                          <span className="text-[9px] text-brand-muted font-bold font-heading uppercase tracking-wider block">TRANSACTION HISTORY</span>
                          <p className="text-brand-charcoal mt-0.5 font-body font-normal">
                            Successfully placed order <span className="font-mono font-bold text-brand-green">#{orders[0].orderNumber}</span> worth Rs. {orders[0].totalPrice.toLocaleString('en-IN')}.00
                          </p>
                        </div>
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-[#729855] border-2 border-white"></div>
                        <div>
                          <span className="text-[9px] text-brand-muted font-bold font-heading uppercase tracking-wider block">SHIPPING COORDINATES</span>
                          <p className="text-brand-charcoal mt-0.5 font-body font-normal">Modified customer Address Book profiles</p>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-[#729855] border-2 border-white"></div>
                      <div>
                        <span className="text-[9px] text-brand-muted font-bold font-heading uppercase tracking-wider block">REGISTRATION</span>
                        <p className="text-brand-charcoal mt-0.5 font-body font-normal">Joined the Fabish store member circle</p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TABS 1: ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {selectedOrder ? (
                  /* Detailed Order View with Tracking Timeline */
                  <div className="bg-white border border-brand-border p-6 md:p-8 space-y-8 select-text text-left rounded-none">
                    
                    {/* Back to List */}
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center gap-2 border border-brand-charcoal hover:bg-brand-charcoal hover:text-white px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer bg-transparent rounded-none"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border pb-4 gap-4">
                      <div>
                        <h2 className="serif-title text-2xl text-brand-charcoal leading-snug font-normal">Order Number: #{selectedOrder.orderNumber}</h2>
                        <p className="text-brand-muted text-xs font-semibold font-heading uppercase tracking-wider mt-1">Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setViewInvoice(selectedOrder)}
                        className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-6 py-3.5 font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none rounded-none"
                      >
                        View & Print Invoice
                      </button>
                    </div>

                    {/* Order tracking timeline */}
                    <div className="p-6 bg-brand-bg-cream/45 border border-brand-border rounded-none">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-widest mb-6 text-brand-charcoal flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#729855]" /> Delivery Tracking
                      </h3>
                      
                      {selectedOrder.orderStatus === 'Cancelled' ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 font-semibold text-xs font-heading uppercase tracking-wider text-center rounded-none">
                          This order has been Cancelled and stock returned.
                        </div>
                      ) : (
                        <div className="relative pl-6 md:pl-0">
                          {/* Vertical line on small screens, horizontal on medium+ */}
                          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-brand-border md:hidden"></div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 relative">
                            {/* Horizontal line for medium+ screens */}
                            <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-brand-border hidden md:block z-0"></div>

                            {getTimelineStages(selectedOrder).map((stage, idx) => (
                              <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative z-10 gap-4 md:gap-2">
                                {/* Dot */}
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 font-bold font-mono text-[10px] shrink-0 ${
                                  stage.done 
                                    ? 'bg-[#729855] border-[#729855] text-white' 
                                    : 'bg-white border-brand-border text-brand-muted'
                                }`}>
                                  {stage.done ? '✓' : idx + 1}
                                </div>
                                {/* Label Content */}
                                <div>
                                  <h4 className={`font-heading text-[10px] font-bold uppercase tracking-wider leading-snug ${stage.done ? 'text-brand-charcoal' : 'text-brand-muted'}`}>
                                    {stage.label}
                                  </h4>
                                  <p className="text-[10px] text-brand-muted leading-tight mt-1 max-w-[120px] mx-auto hidden md:block font-medium">
                                    {stage.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left & center: Items list */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-2">Ordered Items</h3>
                        <div className="divide-y divide-brand-border/40">
                          {selectedOrder.orderItems.map((item, idx) => (
                            <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                              <img 
                                src={getLocalImageUrl(item.image)} 
                                alt={item.title} 
                                className="w-16 h-20 object-cover bg-brand-bg-cream border border-brand-border shrink-0 rounded-none" 
                              />
                              <div className="flex-grow flex flex-col justify-between">
                                <div>
                                  <h4 className="font-heading font-bold text-sm text-brand-charcoal leading-snug">{item.title}</h4>
                                  <span className="text-[10px] font-mono text-brand-muted mt-1 block">Qty: {item.qty}</span>
                                </div>
                                <span className="font-heading font-semibold text-xs text-brand-charcoal">Rs. {item.price.toLocaleString('en-IN')}.00 each</span>
                              </div>
                              <div className="text-right self-center font-heading font-bold text-sm">
                                Rs. {(item.price * item.qty).toLocaleString('en-IN')}.00
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right side: Shipping/summary info */}
                      <div className="bg-brand-bg-cream/40 border border-brand-border p-6 space-y-6 self-start rounded-none">
                        <div>
                          <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">Shipping Coordinate</h4>
                          <p className="text-xs font-semibold leading-relaxed">
                            {selectedOrder.customerDetails?.name || selectedOrder.user?.name}<br />
                            {selectedOrder.shippingAddress.address}<br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                            {selectedOrder.shippingAddress.country}
                          </p>
                        </div>

                        <hr className="border-brand-border" />

                        <div>
                          <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-3">Invoice Details</h4>
                          <div className="space-y-2 text-xs font-semibold text-brand-muted font-heading">
                            <div className="flex justify-between">
                              <span>Items Subtotal</span>
                              <span className="text-brand-charcoal">Rs. {selectedOrder.itemsPrice.toLocaleString('en-IN')}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping Fee</span>
                              <span className="text-brand-charcoal">
                                {selectedOrder.shippingPrice === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingPrice.toLocaleString('en-IN')}.00`}
                              </span>
                            </div>
                            <hr className="border-brand-border" />
                            <div className="flex justify-between text-brand-charcoal font-bold">
                              <span>Total Price</span>
                              <span className="text-sm text-[#729855]">Rs. {selectedOrder.totalPrice.toLocaleString('en-IN')}.00</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  /* Orders List View */
                  <div className="bg-white border border-brand-border p-6 md:p-8 rounded-none">
                    <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-3 mb-6 text-left">Your Transactions</h3>
                    
                    {loadingOrders ? (
                      <Loader />
                    ) : orders.length === 0 ? (
                      <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                        <ClipboardList className="w-12 h-12 text-brand-border mx-auto" />
                        <h3 className="serif-title text-xl text-brand-charcoal font-normal">No Orders Found</h3>
                        <p className="text-brand-muted text-xs leading-relaxed font-body">You haven't placed any orders yet. Visit our collections to get started!</p>
                        <Link to="/collections/all" className="bg-brand-charcoal hover:bg-[#729855] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all inline-block rounded-none">
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <motion.div
                            key={order._id}
                            whileHover={{ y: -3, borderColor: '#729855' }}
                            className="border border-brand-border p-6 rounded-none space-y-5 transition-colors text-left"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border/40 pb-4">
                              <div>
                                <span className="font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-[#729855]">Order Reference</span>
                                <h4 className="font-mono font-bold text-sm text-brand-charcoal">#{order.orderNumber}</h4>
                                <span className="text-[10px] text-brand-muted font-body mt-0.5 block flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <span className={`inline-block px-2 py-0.5 font-heading text-[8px] font-bold uppercase tracking-widest ${
                                  order.paymentStatus === 'Paid' ? 'bg-green-50 border border-green-200 text-brand-green' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                                }`}>{order.paymentStatus}</span>
                                <span className={`inline-block px-2 py-0.5 font-heading text-[8px] font-bold uppercase tracking-widest ${
                                  order.orderStatus === 'Delivered' ? 'bg-green-50 border border-green-200 text-brand-green' : 'bg-blue-50 border border-blue-200 text-blue-700'
                                }`}>{order.orderStatus}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="flex flex-wrap gap-3 items-center">
                                {order.orderItems.map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={getLocalImageUrl(item.image)}
                                    alt={item.title}
                                    className="w-12 h-16 object-cover bg-brand-bg-cream border border-brand-border rounded-none shrink-0"
                                    title={`${item.title} (x${item.qty})`}
                                  />
                                ))}
                                <div className="ml-2">
                                  <p className="text-xs font-bold text-brand-charcoal leading-snug">
                                    {order.orderItems.length} {order.orderItems.length === 1 ? 'Product' : 'Products'}
                                  </p>
                                  <p className="text-[10px] text-brand-muted truncate max-w-[280px]">
                                    {order.orderItems.map(item => item.title).join(', ')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                <div className="text-left md:text-right shrink-0 md:mr-4">
                                  <span className="block font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-brand-muted">Total Paid</span>
                                  <span className="font-heading font-bold text-sm text-brand-charcoal">Rs. {order.totalPrice.toLocaleString('en-IN')}.00</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-4 py-2 font-heading font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer bg-transparent rounded-none flex-1 sm:flex-none text-center"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => handleBuyAgain(order)}
                                    className="bg-brand-charcoal text-white hover:bg-[#729855] px-4 py-2 font-heading font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none rounded-none flex-1 sm:flex-none text-center"
                                  >
                                    Buy Again
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TABS 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-brand-border p-6 md:p-8 space-y-6 rounded-none text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border pb-3 gap-4">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal">Your Saved Delivery Addresses</h3>
                  <button
                    onClick={handleOpenAddModal}
                    className="bg-brand-charcoal text-white hover:bg-[#729855] px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none rounded-none"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="border border-brand-border p-5 space-y-3 animate-pulse rounded-none">
                        <div className="h-4 bg-gray-200 w-1/3"></div>
                        <div className="h-4 bg-gray-200 w-2/3"></div>
                        <div className="h-4 bg-gray-200 w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto text-brand-border flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-12 h-12 fill-current">
                        <path d="M50,10 C30,10 15,25 15,45 C15,65 50,90 50,90 C50,90 85,65 85,45 C85,25 70,10 50,10 Z M50,55 C44.5,55 40,50.5 40,45 C40,39.5 44.5,35 50,35 C55.5,35 60,39.5 60,45 C60,50.5 55.5,55 50,55 Z" />
                      </svg>
                    </div>
                    <h3 className="serif-title text-xl text-brand-charcoal font-normal">No Stored Addresses</h3>
                    <p className="text-brand-muted text-xs leading-relaxed font-body">No delivery addresses stored yet. Click 'Add New Address' to save a shipping profile.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="bg-brand-charcoal hover:bg-[#729855] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer border-none rounded-none"
                    >
                      Add Address Coordinates
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <motion.div
                        key={addr._id}
                        whileHover={{ y: -3, borderColor: '#729855' }}
                        className={`p-5 border transition-all relative rounded-none flex flex-col justify-between ${
                          addr.isDefault 
                            ? 'border-[#729855] bg-brand-bg-cream/10' 
                            : 'border-brand-border'
                        } font-semibold text-xs leading-relaxed space-y-4`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-heading uppercase tracking-wider text-brand-muted text-[9px] flex items-center gap-1.5">
                              {addr.addressType === 'Home' && <Home className="w-3.5 h-3.5 text-brand-green" />}
                              {addr.addressType === 'Office' && <Briefcase className="w-3.5 h-3.5 text-blue-600" />}
                              {addr.addressType === 'Other' && <Globe className="w-3.5 h-3.5 text-purple-600" />}
                              {addr.addressType || 'Home'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {addr.isDefault && (
                                <span className="font-heading text-[8px] font-bold uppercase tracking-widest bg-brand-green text-white px-2 py-0.5 rounded-none">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-brand-charcoal font-bold text-sm font-heading">{addr.fullName}</p>
                          <p className="text-brand-muted font-mono">{addr.phone}</p>
                          
                          <p className="text-brand-charcoal/80 font-normal font-body">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            {addr.landmark && <span className="block text-[11px] text-brand-muted mt-0.5 font-semibold">Landmark: {addr.landmark}</span>}
                            <span className="block mt-1 font-semibold text-brand-charcoal">
                              {addr.city}, {addr.state} — {addr.postalCode}
                            </span>
                            <span className="block font-semibold text-brand-charcoal">{addr.country}</span>
                          </p>
                        </div>

                        <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between gap-2 mt-auto">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditModal(addr)}
                              className="text-brand-charcoal hover:text-brand-green flex items-center gap-1 px-2.5 py-1.5 border border-brand-border bg-transparent cursor-pointer font-heading font-bold text-[9px] uppercase tracking-wider transition-all rounded-none"
                            >
                              <Edit className="w-2.5 h-2.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-1 px-2.5 py-1.5 border border-brand-border bg-transparent cursor-pointer font-heading font-bold text-[9px] uppercase tracking-wider transition-all rounded-none"
                            >
                              <Trash className="w-2.5 h-2.5" /> Delete
                            </button>
                          </div>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-[#729855] hover:bg-[#729855] hover:text-white px-3 py-1.5 border border-[#729855] bg-transparent cursor-pointer font-heading font-bold text-[9px] uppercase tracking-wider transition-all rounded-none"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TABS 4: WISHLIST */}
            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-brand-border p-6 md:p-8 rounded-none text-left"
              >
                <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-3 mb-6">Your Curated Wishlist</h3>

                {wishlistItems.length === 0 ? (
                  <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto text-brand-border flex items-center justify-center">
                      <Heart className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                    <h3 className="serif-title text-xl text-brand-charcoal font-normal">Your Wishlist is Empty</h3>
                    <p className="text-brand-muted text-xs leading-relaxed font-body">Save your favorite luxurious organic items here as you browse our collections.</p>
                    <Link to="/collections/all" className="bg-brand-charcoal hover:bg-[#729855] text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-colors inline-block rounded-none text-center">
                      Explore Collections
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                      <div
                        key={item._id}
                        className="group relative bg-white border border-brand-border rounded-none p-4 flex flex-col h-full hover:border-[#729855] transition-all duration-300 text-center justify-between"
                      >
                        <div className="relative overflow-hidden aspect-[4/5] bg-[#faf9f5] mb-4 flex items-center justify-center">
                          <Link to={`/products/${item.slug}`} className="block w-full h-full">
                            <img 
                              src={item.images?.[0] ? getLocalImageUrl(item.images[0]) : '/assets/6.jpg'} 
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                          </Link>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 hover:text-red-700 shadow-sm border-none cursor-pointer"
                            title="Remove from Wishlist"
                          >
                            <Heart className="w-4 h-4" fill="currentColor" />
                          </button>
                        </div>
                        <div className="text-center flex-grow flex flex-col justify-between space-y-2">
                          <h4 className="font-heading font-medium text-xs md:text-sm text-brand-charcoal hover:text-[#729855] truncate max-w-full block transition-colors leading-snug">
                            <Link to={`/products/${item.slug}`}>{item.title}</Link>
                          </h4>
                          <p className="font-body text-xs font-semibold text-brand-charcoal">
                            Rs. {item.price.toLocaleString('en-IN')}.00
                          </p>
                          <button
                            onClick={() => { addToCart(item, 1); showToast('Item added to your bag!', 'success'); }}
                            className="w-full py-2 bg-brand-charcoal hover:bg-[#729855] text-white font-heading text-[10px] font-bold tracking-widest uppercase cursor-pointer border-none rounded-none transition-colors"
                          >
                            ADD TO BAG
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TABS 5: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-brand-border p-6 md:p-8 rounded-none text-left"
              >
                <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-brand-border pb-3 mb-6">Profile Settings</h3>
                
                <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                  
                  {/* Profile Picture Upload Zone */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-brand-border/40 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border border-brand-border bg-[#faf9f5] flex items-center justify-center relative">
                        {user?.avatar ? (
                          <img
                            src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="serif-title text-4xl text-brand-muted select-none">
                            {user?.name?.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader size="small" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                      <label className="serif-title text-sm text-brand-charcoal">Profile Picture</label>
                      <div className="flex gap-2">
                        <label
                          className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer inline-block select-none rounded-none"
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={uploadingPhoto}
                          />
                          Replace Photo
                        </label>
                        {user?.avatar && (
                          <button
                            type="button"
                            onClick={handlePhotoRemove}
                            disabled={uploadingPhoto}
                            className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer bg-transparent rounded-none"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-muted font-semibold">
                        Supported formats: JPG, JPEG, PNG, WEBP. Max size: 5MB.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Email Address</label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Phone Number</label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/40">
                    <div>
                      <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">New Password (optional)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2 block">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-brand-border px-4 py-3 font-body text-base text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSettings}
                    className="bg-brand-charcoal hover:bg-[#729855] text-white px-8 py-3.5 font-heading font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer border-none rounded-none"
                  >
                    {submittingSettings ? <Loader size="small" /> : 'Save Settings'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Address Book Modal Dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in no-print">
          <div className="bg-white border border-brand-border w-full max-w-lg p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto rounded-none text-left">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-charcoal bg-transparent border-none cursor-pointer p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div>
              <h3 className="serif-title text-xl text-brand-charcoal font-normal">
                {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <p className="text-brand-muted text-xs font-body mt-0.5">Enter shipping coordinates for your order invoices.</p>
            </div>

            {addressError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-semibold flex items-center gap-2 rounded-none">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none bg-white"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, Building, Street Name"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, Colony, Area"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Landmark (optional)</label>
                  <input
                    type="text"
                    placeholder="Near Rose Pharmacy"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Chennai"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Tamil Nadu"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Postal Code / PIN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="600001"
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-green rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-heading text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Address Slot Type</label>
                  <select
                    value={addrType}
                    onChange={(e) => setAddrType(e.target.value)}
                    className="w-full border border-brand-border px-3 py-2 text-sm text-brand-charcoal bg-white focus:outline-none focus:border-brand-green rounded-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-brand-charcoal">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      disabled={editingAddress?.isDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="border-brand-border text-brand-green focus:ring-brand-green rounded-none w-4 h-4"
                    />
                    <span>Set as Default Address</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-muted hover:text-brand-charcoal font-heading font-bold text-[10px] uppercase tracking-wider transition-all bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAddress}
                  className="bg-brand-charcoal hover:bg-brand-button-hover text-white px-6 py-2 font-heading font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  {submittingAddress ? <Loader size="small" /> : (editingAddress ? 'Update' : 'Save Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
