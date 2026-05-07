import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  X, 
  Upload,
  CheckCircle2,
  FileText,
  Filter,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    stock: '',
    sku: '',
    category_id: '',
    material: '',
    finish: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      name: '', description: '', short_description: '', price: '',
      stock: '', sku: '', category_id: '', material: '', finish: '', status: 'active'
    });
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, product_images(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      material: product.material || '',
      finish: product.finish || '',
      status: product.status || 'active'
    });
    setExistingImages(product.product_images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setIsAddFormOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImagePreview = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      await supabase.from('product_images').delete().eq('id', imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Failed to remove image', error);
    }
  };

  const uploadImages = async (productId: string) => {
    if (imageFiles.length === 0) return;
    setIsUploading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}_${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) {
        console.error('Upload failed for', file.name, uploadError);
        continue;
      }
      
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;
      
      await supabase.from('product_images').insert({
        product_id: productId,
        image_url: imageUrl,
        alt_text: formData.name,
        display_order: i,
        is_primary: i === 0 && existingImages.length === 0
      });
    }
    
    setIsUploading(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      const payload = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
        await uploadImages(editingProduct.id);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        if (data) await uploadImages(data.id);
      }
      
      setIsAddFormOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this masterpiece?")) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div className="relative">
      {/* Page Header Area */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-[#06251B]"></div>
            <h1 className="font-serif text-3xl text-[#06251B]">Masterpiece Inventory</h1>
          </div>
          <p className="text-[#8A6B4A] text-sm uppercase tracking-widest font-medium">Manage and track your high-end jewelry assets</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-sm">
            <FileText size={16} /> Export PDF
          </button>
          <button 
            onClick={() => { resetForm(); setIsAddFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#06251B] text-[#F7F1E6] text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors shadow-lg"
          >
            <Plus size={18} /> Add Masterpiece
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#06251B] p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-full bg-[#C99A45]/10 skew-x-12 translate-x-16 transition-transform group-hover:translate-x-8"></div>
          <p className="text-[#C99A45] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Catalog Value</p>
          <h3 className="text-[#F7F1E6] font-serif text-3xl">₹{totalValue.toLocaleString('en-IN')}</h3>
          <p className="text-green-400 text-[10px] font-bold mt-2 uppercase tracking-widest">+12.5% This Month</p>
        </div>
        <div className="bg-white border border-[#E8E1D5] p-8">
          <p className="text-[#8A6B4A] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Active Listings</p>
          <h3 className="text-[#06251B] font-serif text-3xl">{products.length} Units</h3>
          <div className="w-full h-1 bg-[#E8E1D5] mt-4 overflow-hidden">
            <div className="w-[85%] h-full bg-[#06251B]"></div>
          </div>
        </div>
        <div className="bg-white border border-[#E8E1D5] p-8 flex items-center justify-between">
          <div>
            <p className="text-[#8A6B4A] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Integrity Status</p>
            <h3 className="text-[#06251B] font-serif text-3xl">98.4%</h3>
          </div>
          <CheckCircle2 size={40} className="text-green-600 opacity-20" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8E1D5] p-4 mb-6 flex gap-4 items-center shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6B4A]" />
          <input 
            type="text" 
            placeholder="Search by SKU, Name or Collection..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7]">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E8E1D5] shadow-sm">
        {isLoading ? (
          <div className="p-20 text-center text-[#8A6B4A] uppercase tracking-[0.2em] text-xs font-bold">Orchestrating Catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center text-[#8A6B4A]">No artifacts found in the collection.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D5] text-[10px] uppercase tracking-widest text-[#8A6B4A] font-bold">
                <th className="p-6">Masterpiece</th>
                <th className="p-6">Material</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Status</th>
                <th className="p-6">Valuation</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#F7F1E6] hover:bg-[#FDFBF7] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F7F1E6] rounded border border-[#E8E1D5] flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                        {product.product_images?.[0]?.image_url ? (
                          <img src={product.product_images[0].image_url} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                          <Package className="text-[#8A6B4A] opacity-30" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#06251B] uppercase tracking-wide">{product.name}</div>
                        <div className="text-[10px] text-[#8A6B4A] font-mono mt-0.5">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[#06251B] font-medium">{product.material || 'N/A'}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-[#06251B]'}`}>{product.stock} Units</span>
                      <div className="w-12 h-1 bg-[#E8E1D5] rounded-full overflow-hidden">
                        <div className={`h-full ${product.stock <= 5 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${Math.min(product.stock * 5, 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${
                      product.stock <= 5 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {product.stock <= 5 ? 'Low Stock' : 'Available'}
                    </span>
                  </td>
                  <td className="p-6 font-serif text-[#06251B] text-base">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white text-[#8A6B4A] hover:text-[#06251B] transition-colors shadow-sm border border-transparent hover:border-[#E8E1D5]">
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 text-[#8A6B4A] hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="p-2 hover:bg-white text-[#8A6B4A] transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over Form */}
      <AnimatePresence>
        {isAddFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFormOpen(false)}
              className="fixed inset-0 bg-[#06251B]/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-[#E8E1D5] flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="font-serif text-2xl text-[#06251B]">{editingProduct ? 'Edit Masterpiece' : 'Initialize Masterpiece'}</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A6B4A] mt-1 font-bold">{editingProduct ? 'Update artifact specifications' : 'Enter artifact specifications'}</p>
                </div>
                <button 
                  onClick={() => setIsAddFormOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#06251B] border-b border-[#E8E1D5] pb-2">Basic Identity</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Masterpiece Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">SKU Identifier</label>
                      <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Category</label>
                      <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm appearance-none">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#06251B] border-b border-[#E8E1D5] pb-2">Material & Finish</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Primary Material</label>
                      <input type="text" placeholder="e.g. 22K Gold" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Crafting Finish</label>
                      <input type="text" placeholder="e.g. Antique" value={formData.finish} onChange={e => setFormData({...formData, finish: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#06251B] border-b border-[#E8E1D5] pb-2">Valuation & Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Market Valuation (₹)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Initial Inventory</label>
                      <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#06251B] border-b border-[#E8E1D5] pb-2">Narrative & Assets</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Short Narration</label>
                    <input type="text" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Full Provenance Description</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm resize-none"></textarea>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#06251B] border-b border-[#E8E1D5] pb-2">Product Images</h3>
                  
                  {/* Existing Images (when editing) */}
                  {existingImages.length > 0 && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-2">Current Images</label>
                      <div className="grid grid-cols-4 gap-3">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square bg-[#F7F1E6] border border-[#E8E1D5] overflow-hidden">
                            <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
                            {img.is_primary && (
                              <span className="absolute top-1 left-1 bg-[#06251B] text-[#C99A45] text-[7px] px-1.5 py-0.5 uppercase tracking-widest font-bold">Primary</span>
                            )}
                            <button 
                              type="button"
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-2">New Images to Upload</label>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group aspect-square bg-[#F7F1E6] border border-[#E8E1D5] overflow-hidden">
                            <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeImagePreview(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#E8E1D5] bg-[#FDFBF7] cursor-pointer hover:border-[#C99A45] hover:bg-[#F7F1E6] transition-all group">
                    <ImagePlus size={28} className="text-[#8A6B4A] group-hover:text-[#C99A45] transition-colors mb-2" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] group-hover:text-[#06251B]">Click to add images</span>
                    <span className="text-[9px] text-[#8A6B4A] mt-1">JPG, PNG, WebP · Max 5MB each</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageSelect}
                      className="hidden" 
                    />
                  </label>
                </div>
              </form>

              <div className="p-8 border-t border-[#E8E1D5] bg-[#FDFBF7] flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setIsAddFormOpen(false); resetForm(); }}
                  className="flex-1 py-4 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct}
                  disabled={isSubmitting || isUploading}
                  className="flex-1 py-4 bg-[#06251B] text-[#F7F1E6] text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
                  {isUploading ? 'Uploading Images...' : isSubmitting ? 'Saving...' : (editingProduct ? 'Update Masterpiece' : 'Register Masterpiece')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
