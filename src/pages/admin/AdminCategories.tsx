import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', image_url: '' });
    setEditingCategory(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ ...formData, slug })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({ ...formData, slug });
        if (error) throw error;
      }
      
      setIsFormOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete category");
    }
  };

  return (
    <div>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-[#06251B]"></div>
            <h1 className="font-serif text-3xl text-[#06251B]">Collection Categories</h1>
          </div>
          <p className="text-[#8A6B4A] text-sm uppercase tracking-widest font-medium">Categorize and organize your jewelry masterpieces</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#06251B] text-[#F7F1E6] text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors shadow-lg"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-20 text-center text-[#8A6B4A]">Retrieving Taxonomy...</div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="bg-white border border-[#E8E1D5] p-6 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F7F1E6] flex items-center justify-center text-[#06251B]">
                  <Layers size={24} strokeWidth={1.5} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(category)} className="p-2 text-[#8A6B4A] hover:text-[#06251B]"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-[#8A6B4A] hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-serif text-xl text-[#06251B] mb-2">{category.name}</h3>
              <p className="text-sm text-[#8A6B4A] line-clamp-2 mb-4">{category.description || 'No description provided.'}</p>
              <div className="pt-4 border-t border-[#F7F1E6] flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A]">Slug</span>
                <span className="text-xs font-mono text-[#06251B]">{category.slug}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsFormOpen(false); resetForm(); }}
              className="fixed inset-0 bg-[#06251B]/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-[#E8E1D5] flex justify-between items-center bg-[#FDFBF7]">
                <h2 className="font-serif text-2xl text-[#06251B]">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => { setIsFormOpen(false); resetForm(); }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Category Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Description</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#8A6B4A] mb-1.5">Cover Image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="flex-1 px-4 py-3 bg-[#FDFBF7] border border-[#E8E1D5] outline-none focus:border-[#06251B] text-sm" placeholder="https://..." />
                    <button type="button" className="p-3 border border-[#E8E1D5] text-[#8A6B4A]"><ImageIcon size={18} /></button>
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="flex-1 py-3 border border-[#E8E1D5] text-[#06251B] text-xs font-bold uppercase tracking-widest">Cancel</button>
                  <button 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#06251B] text-[#F7F1E6] text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
