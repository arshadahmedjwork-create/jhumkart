export function Contact() {
  return (
    <div className="bg-[#F7F1E6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl text-[#06251B] mb-6">Contact Us</h1>
          <div className="w-16 h-[1px] bg-[#C99A45] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="font-serif text-2xl text-[#06251B] mb-6">Get in Touch</h2>
            <p className="text-[#8A6B4A] mb-8">
              Whether you are looking to book a styling call, have a question about an order, 
              or wish to learn more about our artisans, we are here for you.
            </p>
            
            <div className="space-y-6 text-[#1A1510]">
              <div>
                <strong className="block text-[#06251B] font-serif mb-1">Customer Care</strong>
                <a href="mailto:care@jhumkart.com" className="hover:text-[#C99A45] transition-colors">care@jhumkart.com</a>
              </div>
              <div>
                <strong className="block text-[#06251B] font-serif mb-1">Phone</strong>
                <p>+91 98765 43210 <br/><span className="text-sm text-[#8A6B4A]">(Mon-Sat, 10am to 7pm IST)</span></p>
              </div>
              <div>
                <strong className="block text-[#06251B] font-serif mb-1">Studio</strong>
                <p>12 Heritage Lane, <br/>Jubilee Hills, Hyderabad 500033</p>
              </div>
            </div>
          </div>

          <form className="bg-white p-8 border border-[#C99A45]/30 flex flex-col space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-2">Name</label>
              <input type="text" className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45]" required />
            </div>
            <div>
              <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-2">Email</label>
              <input type="email" className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45]" required />
            </div>
            <div>
              <label className="block text-[#8A6B4A] text-xs uppercase tracking-widest font-semibold mb-2">Message</label>
              <textarea rows={4} className="w-full bg-[#F7F1E6] border border-[#C99A45]/30 px-4 py-3 focus:outline-none focus:border-[#C99A45]" required></textarea>
            </div>
            <button className="bg-[#0F3D2E] text-[#C99A45] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#C99A45] hover:text-[#06251B] transition-colors w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
