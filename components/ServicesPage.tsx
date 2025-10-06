import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Changed type from JSX.Element to React.ReactElement to resolve TypeScript namespace error.
interface ServiceDetailCardProps {
    icon: React.ReactElement;
    title: string;
    description: string;
    features: string[];
    featured?: boolean;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-jax-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const ServiceDetailCard: React.FC<ServiceDetailCardProps> = ({ icon, title, description, features, featured }) => (
    <div className={`rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${featured ? 'bg-jax-blue/5 border border-jax-blue' : 'bg-white'}`}>
        <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-jax-blue/10 text-jax-blue flex items-center justify-center">
                {icon}
            </div>
            <h3 className="font-heading text-xl font-bold text-jax-black">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
        <ul className="space-y-2 text-sm">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                    <CheckIcon />
                    <span className="ml-2 text-gray-700">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);


const ServicesPage: React.FC = () => {
    const featuredServices = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
            title: "Website Development + SEO",
            description: "Establish a powerful online presence with a professionally designed website optimized for search engines. We build fast, mobile-friendly sites that attract customers and rank higher on Google in Dumaguete.",
            features: ["Custom Website Design", "Mobile-Responsive Layout", "Local SEO Optimization", "Google Business Profile"],
            featured: true,
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            title: "Complete Branding Package",
            description: "Define your identity and make a lasting impression. Our branding package provides a cohesive visual identity, from a memorable logo to a complete style guide for consistency across all marketing materials.",
            features: ["Logo Design & Brand Identity", "Color Palette & Typography", "Business Card & Letterhead", "Social Media Kit"],
            featured: true,
        },
    ];

    const coreServices = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
            title: "Full Sublimation Jerseys",
            description: "Vibrant, durable, and fully customized jerseys for sports teams, events, and organizations. Our high-quality sublimation process ensures your designs will never fade, crack, or peel.",
            features: ["Unlimited Colors & Designs", "Breathable Performance Fabric", "Individual Names & Numbers", "Fast Turnaround"]
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>,
            title: "Tarpaulin Printing",
            description: "High-impact tarpaulins for birthdays, events, and business advertising. We use weatherproof materials and fade-resistant inks for maximum visibility and durability.",
            features: ["Various Sizes Available", "Weatherproof & Durable", "Vibrant, High-Resolution Prints", "Eyelets for Easy Installation"]
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            title: "Signage Solutions",
            description: "Professional signage to elevate your brand. We fabricate panaflex, acrylic, and sticker signs for storefronts, offices, and directional needs.",
            features: ["Panaflex & Acrylic", "Custom Shapes & Sizes", "LED Backlighting Options", "Installation Services"]
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5c0 .512.195 1.024.586 1.414l7 7a2 2 0 002.828 0l7-7a2 2 0 000-2.828l-7-7A2 2 0 0012 3H7a4 4 0 00-4 4v.01" /></svg>,
            title: "Stickers & Decals",
            description: "Custom-cut vinyl stickers and decals for branding, product labels, or personal expression. Available in various finishes like glossy, matte, and transparent.",
            features: ["Waterproof Vinyl Material", "Die-Cut & Kiss-Cut", "Glossy, Matte, or Transparent", "Perfect for Laptops & Products"]
        },
         {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
            title: "Graphic Design",
            description: "Don't have a design? Our creative team can help bring your vision to life. We create print-ready artwork for all our products, from logos to complex layouts.",
            features: ["Logo & Branding Design", "Layout for Print Materials", "Vectorization Services", "Expert Consultation"]
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
            title: "Corporate Giveaways",
            description: "Customized promotional items for your business. We print on mugs, keychains, pens, and other items perfect for marketing campaigns and corporate events.",
            features: ["Personalized Mugs", "Custom Keychains & Pens", "Bulk Order Discounts", "Great for Brand Awareness"]
        },
    ];

    const steps = [
        { num: '01', title: 'Get a Quote', description: 'Contact us with your project details and we will provide a comprehensive quote.' },
        { num: '02', title: 'Approve Design', description: 'We will send a digital mock-up for your approval to ensure every detail is perfect.' },
        { num: '03', title: 'Print & Deliver', description: 'Once approved, we begin production and notify you upon completion for pickup or delivery.' },
    ];

    return (
        <div className="space-y-16 md:space-y-24">
            <div className="text-center">
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-jax-black">Our Printing & Digital Services</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">From pixels to print, we are your one-stop shop for custom apparel, business branding, and marketing materials in Dumaguete.</p>
            </div>

            <section>
                <h2 className="font-heading text-3xl font-bold text-center mb-8">Digital & Branding Services</h2>
                 <div className="grid md:grid-cols-2 gap-8">
                    {featuredServices.map(service => (
                        <ServiceDetailCard key={service.title} {...service} />
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="font-heading text-3xl font-bold text-center mb-8">Core Print Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coreServices.map(service => (
                        <ServiceDetailCard key={service.title} {...service} />
                    ))}
                </div>
            </section>

            <section className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-jax-black">How It Works</h2>
                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto">A simple and streamlined process to bring your vision to life.</p>
                </div>
                <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 hidden md:block" />
                    <div className="absolute top-1/2 left-0 w-full flex justify-around hidden md:flex">
                        <div className="w-1/3 border-t-2 border-dashed border-gray-300"></div>
                        <div className="w-1/3 border-t-2 border-dashed border-gray-300"></div>
                    </div>
                     {steps.map((step) => (
                        <div key={step.num} className="text-center relative bg-white z-10 p-4">
                             <div className="mx-auto h-16 w-16 rounded-full bg-jax-blue text-white flex items-center justify-center font-bold text-2xl font-heading ring-8 ring-white">
                                {step.num}
                             </div>
                            <h3 className="mt-6 font-heading text-xl font-bold text-jax-black">{step.title}</h3>
                            <p className="mt-2 text-gray-600 text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

             <section className="text-center bg-jax-blue text-white py-12 px-6 rounded-2xl">
                <h2 className="font-heading text-3xl font-extrabold">Ready to Start Your Project?</h2>
                <p className="mt-3 max-w-2xl mx-auto">Let's bring your ideas to life. Get in touch with us today for a free, no-obligation quote.</p>
                 <div className="mt-8">
                    <Link to="/quote" className="inline-block px-10 py-4 text-lg font-bold text-jax-blue bg-white rounded-xl shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
                        Request a Quote
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ServicesPage;