import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Flame, 
  Plus, 
  Clock, 
  X, 
  PlusCircle,
  Trash2,
  Play,
  Square,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDrops() {
  const [drops, setDrops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_active: true,
    selected_products: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dropsRes, productsRes] = await Promise.all([
        supabase.from('drops').select('*, drop_items(product_id)').order('start_time', { ascending: false }),
        supabase.from('products').select('*')
      ]);

      if (dropsRes.data) setDrops(dropsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create Drop
      const { data: drop, error: dropError } = await supabase
        .from('drops')
        .insert({
          title: formData.title,
          description: formData.description,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          is_active: formData.is_active
        })
        .select()
        .single();

      if (dropError) throw dropError;

      // 2. Add Drop Items
      if (formData.selected_products.length > 0) {
        const dropItems = formData.selected_products.map((pid, idx) => ({
          drop_id: drop.id,
          product_id: pid,
          display_order: idx
        }));
        await supabase.from('drop_items').insert(dropItems);
      }

      setIsFormOpen(false);
      fetchData();
      setFormData({
        title: '', description: '', start_time: '', end_time: '', 
        is_active: true, selected_products: []
      });
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to create drop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProduct = (pid: string) => {
    setFormData(prev => ({
      ...prev,
      selected_products: prev.selected_products.includes(pid)
        ? prev.selected_products.filter(id => id !== pid)
        : [...prev.selected_products, pid]
    }));
  };

  return (
    <div>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-orange-600"></div>
            <h1 className="font-serif text-3xl text-[#06251B]">Drop Management</h1>
          </div>
          <p className="text-[#8A6B4A] text-sm uppercase tracking-widest font-medium">Orchestrate exclusive launches and time-limited collections</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors shadow-lg"
        >
          <Plus size={18} /> Schedule New Drop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="lg:col-span-2 p-20 text-center text-[#8A6B4A]">Loading Drop Sequences...</div>
        ) : drops.length === 0 ? (
          <div className="lg:col-span-2 p-20 text-center bg-white border border-[#E8E1D5]">
            <Flame size={48} className="mx-auto mb-4 text-orange-600 opacity-20" />
            <p className="font-serif text-xl text-[#06251B]">No drops scheduled.</p>
            <button onClick={() => setIsFormOpen(true)} className="text-orange-600 text-xs font-bold uppercase tracking-widest mt-4 hover:underline">Launch your first drop</button>
          </div>
        ) : (
          drops.map(drop => {
            const isLive = new Date(drop.start_time) <= new Date() && (!drop.end_time || new Date(drop.end_time) > new Date());
            const isUpcoming = new Date(drop.start_time) > new Date();
            
            return (
              <div key={drop.id} className="bg-white border border-[#E8E1D5] shadow-sm flex flex-col group overflow-hidden">
                <div className={`p-1 text-center text-[8px] font-bold uppercase tracking-[0.3em] ${
                  isLive ? 'bg-green-600 text-white' : isUpcoming ? 'bg-orange-500 text-white' : 'bg-[#8A6B4A] text-white'
                }`}>
                  {isLive ? 'Live Now' : isUpcoming ? 'Upcoming Sequence' : 'Concluded'}
                </div>
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-serif text-2xl text-[#06251B] mb-2">{drop.title}</h3>
                      <p className="text-sm text-[#8A6B4A] line-clamp-2">{drop.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-xs font-bold text-[#06251B]">
                        <Clock size={14} className="text-orange-600" />
                        {new Date(drop.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-[#8A6B4A] uppercase mt-1">Start Time</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-[#F7F1E6]">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F7F1E6] flex items-center justify-center">
                          <Package size={14} className="text-[#8A6B4A]" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#06251B] flex items-center justify-center text-[#C99A45] text-[10px] font-bold">
                        +{drop.drop_items?.length || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-[#8A6B4A] font-bold">Assigned Items</p>
                      <p className="text-sm font-bold text-[#06251B]">{drop.drop_items?.length || 0} Masterpieces</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#FDFBF7] p-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity border-t border-[#E8E1D5]">
                  <button className="flex-1 py-2.5 bg-white border border-[#E8E1D5] text-[#06251B] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F7F1E6]">
                    {isLive ? <Square size={12} /> : <Play size={12} />} {isLive ? 'Halt Drop' : 'Launch Preview'}
                  </button>
                  <button className="p-2.5 bg-white border border-[#E8E1D5] text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-[#06251B]/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-[#E8E1D5] flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="font-serif text-2xl text-[#06251B]">Initialize Drop Sequence</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A6B4A] mt-1 font-bold">Schedule launch parameters</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateDrop} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-orange-600 border-b border-[#E8E1D5] pb-2">Launch Identity</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Drop Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-orange-600 text-sm font-serif" placeholder="e.g. The Emerald Ascent" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Narrative</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-orange-600 text-sm resize-none"></textarea>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-orange-600 border-b border-[#E8E1D5] pb-2">Timeline Control</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Starting Timestamp</label>
                      <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-orange-600 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Concluding Timestamp (Optional)</label>
                      <input type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-orange-600 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-orange-600 border-b border-[#E8E1D5] pb-2">Assign Masterpieces</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {products.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                          formData.selected_products.includes(product.id)
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-[#FDFBF7] border-[#E8E1D5] hover:border-orange-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-[#E8E1D5] flex items-center justify-center">
                            <Package size={16} className="text-[#8A6B4A]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#06251B] uppercase">{product.name}</p>
                            <p className="text-[10px] text-[#8A6B4A]">SKU: {product.sku}</p>
                          </div>
                        </div>
                        {formData.selected_products.includes(product.id) ? (
                          <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white">
                            <PlusCircle size={14} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#E8E1D5]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-[#E8E1D5] bg-[#FDFBF7] flex gap-4">
                <button onClick={() => setIsFormOpen(false)} className="flex-1 py-4 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest hover:bg-white">Cancel</button>
                <button 
                  onClick={handleCreateDrop}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-orange-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Initializing...' : 'Authorize Sequence'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
