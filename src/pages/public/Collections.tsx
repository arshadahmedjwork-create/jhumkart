import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import bridalImg from '@/assets/bridal.png';
import meenakshiImg from '@/assets/meenakshi.png';
import pearlImg from '@/assets/pearl.png';

export function Collections() {
  const collections = [
    { id: 'bridal', name: 'The Bridal Trousseau', desc: 'Opulent pieces for your most special day.', img: bridalImg, filter: 'bridal' },
    { id: 'antique', name: 'Antique Heritage', desc: 'Vintage-inspired designs with intricate detailing.', img: meenakshiImg, filter: 'antique' },
    { id: 'temple', name: 'Temple Jewelry', desc: 'Devotional motifs crafted in pure gold.', img: pearlImg, filter: 'temple' }
  ];

  return (
    <div className="bg-[#F7F1E6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#06251B] mb-6">Curated Collections</h1>
          <div className="w-16 h-[1px] bg-[#C99A45] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((c) => (
            <Link key={c.id} to={`/shop?filter=${c.filter}`} className="group block bg-white border border-[#C99A45]/20 overflow-hidden">
              <div className="h-[400px] overflow-hidden bg-[#E8E1D5]">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" />
              </div>
              <div className="p-8 text-center bg-[#06251B]">
                <h3 className="font-serif text-2xl text-[#C99A45] mb-2">{c.name}</h3>
                <p className="text-[#F7F1E6]/70 text-sm font-light mb-6">{c.desc}</p>
                <span className="inline-flex items-center gap-2 text-[#C99A45] text-xs font-bold uppercase tracking-widest group-hover:text-[#F7F1E6] transition-colors">
                  Explore <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
