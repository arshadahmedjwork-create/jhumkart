import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="bg-[#F7F1E6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl text-[#06251B] mb-6">Our Story</h1>
          <div className="w-16 h-[1px] bg-[#C99A45] mx-auto"></div>
        </motion.div>

        <div className="space-y-12 text-[#1A1510] text-lg leading-relaxed font-light">
          <p>
            Jhumkart was born from a deep reverence for India's rich heritage of adornment. For centuries, 
            jewelry in the subcontinent has been more than mere decoration—it is a language of identity, 
            a talisman of protection, and an heirloom of love.
          </p>
          <p>
            We curate and create pieces that honor this timeless artistry while seamlessly integrating into 
            the modern woman's wardrobe. Our artisans, whose skills have been passed down through generations, 
            breathe life into every intricate motif, from the grandeur of Temple jewelry to the delicate filigree 
            of Antique styles.
          </p>
          <p>
            Every Jhumkart piece is hallmarked for purity and handcrafted with unwavering attention to detail. 
            We invite you to explore our collections and discover adornments rooted in culture, designed for you.
          </p>
        </div>
      </div>
    </div>
  );
}
