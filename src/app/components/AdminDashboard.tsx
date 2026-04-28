import React, { useEffect, useState } from "react";
import { supabase } from "../context";
import { 
  Bell, CheckCircle, Clock, TrendingUp, BarChart3, 
  Database, ShieldAlert, LayoutDashboard, ShoppingCart, 
  Layers, Menu, X, Package, Edit, Trash2, Plus, Save, Upload, LogOut
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- INVENTORY CRUD STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "",
    volume: "",
    alcohol_content: ""
  });

  // Helper to format Safaricom's YYYYMMDDHHMMSS string
  const formatMpesaDate = (dateStr: string) => {
    if (!dateStr) return null;
    const y = dateStr.slice(0, 4), m = dateStr.slice(4, 6), d = dateStr.slice(6, 8);
    const h = dateStr.slice(8, 10), min = dateStr.slice(10, 12);
    return `${d}/${m} ${h}:${min}`;
  };

  // 1. Fetch Data & Set up Real-time
  useEffect(() => {
    fetchAllData();

    const orderChannel = supabase
      .channel('admin-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mpesa_payments' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchAllData())
      .subscribe();

    return () => { supabase.removeChannel(orderChannel); };
  }, []);

  const fetchAllData = async () => {
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('*, mpesa_payments(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('name', { ascending: true })
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    setLoading(false);
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // --- INVENTORY CRUD OPERATIONS ---
  const openModal = (product: any = null) => {
    setImageFile(null);
    
    if (product) {
      setProductForm({
        id: product.id,
        name: product.name || "",
        category: product.category || "",
        price: String(product.price || ""),
        stock: String(product.stock || "0"),
        description: product.description || "",
        image: product.image || "",
        volume: product.volume || "",
        alcohol_content: product.alcohol_content || ""
      });
    } else {
      setProductForm({ id: "", name: "", category: "", price: "", stock: "10", description: "", image: "", volume: "", alcohol_content: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalImageUrl = productForm.image;

    // UPLOAD IMAGE TO SUPABASE STORAGE
    if (imageFile) {
      setIsUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Error uploading image. Make sure you created a 'product-images' public bucket. " + uploadError.message);
        setIsSubmitting(false);
        setIsUploadingImage(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
      setIsUploadingImage(false);
    }

    const payload = {
      name: productForm.name,
      category: productForm.category || null,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock, 10),
      description: productForm.description || null,
      image: finalImageUrl || null,
      volume: productForm.volume || null,
      alcohol_content: productForm.alcohol_content || null
    };

    let error;
    if (productForm.id) {
      const res = await supabase.from('products').update(payload).eq('id', productForm.id);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }

    setIsSubmitting(false);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      setIsModalOpen(false);
      setImageFile(null);
      fetchAllData(); 
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`CRITICAL ACTION: Are you sure you want to delete ${name} from the inventory?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert("Error deleting product: " + error.message);
      else fetchAllData();
    }
  };

  // 2. Business Logic Calculations
  const stats = {
    revenue: orders.filter(o => o.status === 'Paid' || o.status === 'Delivered').reduce((acc, curr) => acc + curr.total_price, 0),
    totalOrders: orders.length,
    lowStockCount: products.filter(p => p.stock <= 5).length,
  };

  // Prepare Chart Data: 7-Day Revenue Trend
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Go back 6 days up to today
    return {
      dateKey: d.toLocaleDateString(), 
      time: d.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon", "Tue", etc.
      amount: 0
    };
  });

  // Populate the last 7 days with actual PAID revenue
  orders.forEach(o => {
    if (o.status === 'Paid' || o.status === 'Delivered') {
      const orderDate = new Date(o.created_at).toLocaleDateString();
      const dayMatch = chartData.find(d => d.dateKey === orderDate);
      if (dayMatch) {
        dayMatch.amount += o.total_price;
      }
    }
  });

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
        ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
        : "text-[#888] hover:bg-[#1A1A1A] hover:text-[#ECECEC]"
      }`}
    >
      <Icon size={20} />
      <span className="text-sm tracking-wide uppercase">{label}</span>
      {id === 'inventory' && stats.lowStockCount > 0 && (
        <span className="ml-auto bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
          {stats.lowStockCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#ECECEC] flex flex-col md:flex-row font-['Inter'] relative">
      
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden bg-[#0D0D0D] border-b border-[#2A2A2A] p-4 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <Database className="text-[#D4AF37]" size={20} />
          <span className="font-['Playfair_Display'] font-bold text-lg uppercase tracking-wider">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-[#888]" />
            {stats.lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full border border-[#0D0D0D]">!</span>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#D4AF37]">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- SIDE NAVIGATION --- */}
      <nav className={`fixed inset-y-0 left-0 z-[90] bg-[#0D0D0D] p-6 border-r border-[#2A2A2A] w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="hidden md:flex items-center gap-3 mb-10 px-2 shrink-0">
          <Database className="text-[#D4AF37]" size={28} />
          <div>
            <h1 className="text-xl font-['Playfair_Display'] font-bold uppercase tracking-widest">Admin Panel</h1>
            <div className="text-[9px] text-[#666] uppercase tracking-[0.2em] font-mono flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Secure Session
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Analytics" />
          <NavItem id="orders" icon={ShoppingCart} label="Live Feed" />
          <NavItem id="inventory" icon={Layers} label="Inventory" />

          {/* --- LOGOUT BUTTON --- */}
          <div className="pt-6 mt-4 border-t border-[#2A2A2A]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[#888] hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span className="text-sm tracking-wide uppercase font-bold">Log Out</span>
            </button>
          </div>
        </div>

        <div className="hidden md:block shrink-0 mt-8">
          <div className="p-4 bg-[#111] border border-[#222] rounded-2xl">
            <div className="text-[10px] text-[#666] uppercase mb-2">System Status</div>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              LIVE & ENCRYPTED
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        
        {/* VIEW: DASHBOARD / ANALYTICS */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2 text-[#888] mb-4 text-xs uppercase tracking-widest">
                  <TrendingUp size={14} className="text-[#D4AF37]" /> Verified Revenue
                </div>
                <div className="text-5xl md:text-6xl font-['Playfair_Display'] text-[#D4AF37] font-bold drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  KES {stats.revenue.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-8 grid grid-cols-2 gap-4">
                <div className="border-r border-[#222]">
                  <div className="text-[#666] text-xs uppercase mb-2 tracking-tighter">Total Volume</div>
                  <div className="text-3xl font-['Playfair_Display']">{stats.totalOrders}</div>
                </div>
                <div className="pl-4">
                  <div className="text-[#666] text-xs uppercase mb-2 tracking-tighter">Inventory Alerts</div>
                  <div className={`text-3xl font-['Playfair_Display'] ${stats.lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                    {stats.lowStockCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#888]">
                  <BarChart3 size={18} className="text-[#D4AF37]" /> 7-Day Revenue Trend
                </div>
                <span className="text-[10px] text-[#444] font-mono uppercase">Trailing 7 Days</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="time" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `K${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #2A2A2A', borderRadius: '8px' }} itemStyle={{ color: '#D4AF37' }} />
                  <Area type="monotone" dataKey="amount" stroke="#D4AF37" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* VIEW: LIVE ORDERS */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#666] flex items-center gap-2 font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Live Transaction Stream
              </h3>
            </div>
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {orders.map((order) => {
                  const payment = order.mpesa_payments?.[0];
                  return (
                    <motion.div key={order.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="p-5 bg-[#0D0D0D] border border-[#222] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#D4AF37]/50 transition-all">
                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex items-center justify-between md:justify-start gap-4">
                          <div className="text-[10px] font-mono text-[#D4AF37]">#{order.id.slice(0, 8)}</div>
                          <div className="text-[10px] text-[#666] font-mono">{payment?.phone_number || "GUEST"}</div>
                        </div>
                        <div className="text-lg font-bold uppercase tracking-tight">KES {order.total_price.toLocaleString()}</div>
                        <div className="flex flex-wrap items-center gap-3">
                          {payment?.receipt_number && <div className="text-[10px] text-[#444] font-mono uppercase bg-[#111] px-2 py-0.5 rounded">{payment.receipt_number}</div>}
                          {payment?.transaction_date ? (
                            <div className="text-[10px] text-[#D4AF37]/70 font-mono">{formatMpesaDate(payment.transaction_date)}</div>
                          ) : (
                            <div className="text-[10px] text-[#444] font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          )}
                        </div>
                      </div>
                      <div className={`px-4 py-2 w-full md:w-auto rounded-full text-xs uppercase font-bold flex items-center justify-center gap-2 min-w-[120px] ${order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                        {order.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} className="animate-spin-slow" />}
                        {order.status}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* VIEW: INVENTORY CRUD */}
        {activeTab === "inventory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#666] font-bold flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#D4AF37]" /> Inventory Control
              </h3>
              <button 
                onClick={() => openModal()}
                className="bg-[#D4AF37] hover:bg-[#C29B2E] text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <Plus size={16} /> Add Bottle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const stockPercentage = Math.min((product.stock / 50) * 100, 100);
                return (
                  <div key={product.id} className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 group flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {/* Image display logic */}
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-[#222]" />
                          ) : (
                            <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center text-[#D4AF37] border border-[#222]">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-[#ECECEC] truncate max-w-[140px]" title={product.name}>{product.name}</h4>
                            <p className="text-[9px] text-[#888] uppercase tracking-widest mt-1">
                              {product.category || "Uncategorized"} 
                              {product.volume ? ` • ${product.volume}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${product.stock <= 5 ? "text-red-500 animate-pulse bg-red-500/10 px-2 py-1 rounded" : "text-[#D4AF37]"}`}>
                          {product.stock} Left
                        </span>
                      </div>

                      <div className="flex justify-between items-end mb-3 mt-4">
                        <span className="text-sm font-mono font-bold text-[#ECECEC]">KES {product.price.toLocaleString()}</span>
                        {product.alcohol_content && (
                          <span className="text-[10px] text-[#666] bg-[#111] px-2 py-0.5 rounded border border-[#222]">ABV: {product.alcohol_content}</span>
                        )}
                      </div>

                      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden mb-6">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${stockPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${product.stock <= 5 ? 'bg-red-500' : 'bg-[#D4AF37]'}`}
                        />
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 pt-4 border-t border-[#222]">
                      <button onClick={() => openModal(product)} className="flex-1 bg-[#111] hover:bg-[#222] border border-[#333] text-[#ECECEC] py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-colors">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id, product.name)} className="px-4 bg-[#111] hover:bg-red-900/50 border border-[#333] hover:border-red-500/50 text-red-500 py-2 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && !loading && (
                <div className="col-span-full text-center py-10 text-sm text-[#444] italic">
                  Inventory is currently empty. Add your first bottle.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* --- INVENTORY MODAL (SCHEMA-ALIGNED WITH FILE UPLOAD) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#666] hover:text-[#ECECEC] transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-[#D4AF37]" size={24} />
                <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#ECECEC]">
                  {productForm.id ? "Edit Inventory Item" : "Register New Bottle"}
                </h2>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                
                {/* --- FILE UPLOADER UI --- */}
                <div className="mb-4">
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    {/* Live Preview */}
                    <div className="w-16 h-16 bg-[#111] border border-[#222] rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {(imageFile || productForm.image) ? (
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : productForm.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={20} className="text-[#444]" />
                      )}
                    </div>
                    {/* Input */}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20 transition-all cursor-pointer"
                      />
                      <p className="text-[9px] text-[#666] mt-2">Max size 2MB. Leave empty to keep current image.</p>
                    </div>
                  </div>
                </div>

                {/* Row 1: Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Item Name *</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors font-medium text-sm" placeholder="e.g. Singleton 12YO" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Category</label>
                    <input type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors font-medium text-sm" placeholder="e.g. Single Malt Scotch" />
                  </div>
                </div>

                {/* Row 2: Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Price (KES) *</label>
                    <input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#D4AF37] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono font-bold text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Stock QTY *</label>
                    <input required type="number" min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono font-bold text-sm" placeholder="10" />
                  </div>
                </div>

                {/* Row 3: Volume & Alcohol Content */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Volume</label>
                    <input type="text" value={productForm.volume} onChange={e => setProductForm({...productForm, volume: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm" placeholder="e.g. 750ml" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">ABV (%)</label>
                    <input type="text" value={productForm.alcohol_content} onChange={e => setProductForm({...productForm, alcohol_content: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm" placeholder="e.g. 40%" />
                  </div>
                </div>

                {/* Row 4: Description */}
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-1">Description</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm resize-none" placeholder="Tasting notes, origin, etc." />
                </div>

                <button disabled={isSubmitting || isUploadingImage} type="submit" className="w-full bg-[#D4AF37] hover:bg-[#C29B2E] text-black font-bold uppercase tracking-widest py-3 rounded-lg mt-6 flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                  {(isSubmitting || isUploadingImage) ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                  {isUploadingImage ? "Uploading Image..." : isSubmitting ? "Syncing..." : "Save to Database"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0D0D0D; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D4AF37; }
      `}</style>
    </div>
  );
}