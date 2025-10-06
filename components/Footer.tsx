import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-jax-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-heading font-bold">JAX Printing Shop</h3>
            <p className="text-sm text-gray-400 mt-2">Your trusted printing partner in Dumaguete City.</p>
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold">Contact Us</h3>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li><a href="https://m.me/JAXPrintingShop" target="_blank" rel="noopener noreferrer" className="hover:text-jax-blue">Message on Messenger</a></li>
              <li><a href="mailto:quotes@jaxprint.ph" className="hover:text-jax-blue">quotes@jaxprint.ph</a></li>
              <li><p>Dumaguete City, Negros Oriental</p></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold">Follow Us</h3>
             <div className="flex justify-center md:justify-start space-x-4 mt-2">
                <a href="#" className="text-gray-400 hover:text-jax-blue">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
             </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} JAX Printing Shop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;