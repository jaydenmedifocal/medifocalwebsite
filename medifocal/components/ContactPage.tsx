import React, { useState } from 'react';
import { View } from '../App';
import { sendContactEmail } from '../services/contact';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { viewToUrl } from '../utils/routing';

interface ContactPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const ContactPage: React.FC<ContactPageProps> = ({ setCurrentView }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        try {
            if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
                setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
                setIsSubmitting(false);
                return;
            }
            
            await sendContactEmail(formData);
            setSubmitStatus({ type: 'success', message: 'Thank you! Your message has been sent.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            console.error('Contact form submission error:', error);
            const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
            setSubmitStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const contactUrl = viewToUrl({ page: 'contact' });
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Contact Us | Medifocal Dental Equipment"
                description="Get in touch with Medifocal, Australia's leading dental equipment supplier. Contact us for product inquiries, support, or sales assistance. Expert team ready to help."
                url={`https://medifocal.com${contactUrl}`}
            />
            <Breadcrumbs items={[
                { label: 'Home', view: { page: 'home' } },
                { label: 'Contact Us' }
            ]} setCurrentView={setCurrentView} />
            <div className="container mx-auto px-4 py-8">

                {/* Hero Banner */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">We'd Love to Hear From You</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Whether you have a question, a comment, or just want to say hello, we're here to help.</p>
                        </div>
                        
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Form Panel */}
                        <div className="p-8 md:p-12">
                             <h2 className="text-3xl font-bold text-gray-900 mb-6">Send a Direct Message</h2>
                             
                             {submitStatus.type && (
                                <div className={`mb-6 p-4 rounded-md border ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                    <p className="font-semibold text-sm">{submitStatus.message}</p>
                                </div>
                             )}

                             <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue focus:ring-opacity-50 transition-colors" 
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue focus:ring-opacity-50 transition-colors" 
                                        placeholder="you@example.com"
                                    />
                                </div>
                                 <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input 
                                        type="text" 
                                        id="subject" 
                                        name="subject" 
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue focus:ring-opacity-50 transition-colors" 
                                        placeholder="Inquiry about an order"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows={5} 
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue focus:ring-opacity-50 transition-colors resize-vertical"
                                        placeholder="Your message here..."
                                    ></textarea>
                                </div>
                                <div>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-brand-blue text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : 'Send Message'}
                                    </button>
                                </div>
                             </form>
                        </div>

                         {/* Info Panel */}
                        <div className="bg-gray-100 p-8 md:p-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <PhoneIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">Call Us</h3>
                                        <a href="tel:0240561419" className="text-gray-600 hover:text-brand-blue transition-colors">(02) 4056 1419</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                     <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <MailIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">Email Us</h3>
                                        <a href="mailto:admin@medifocal.com" className="text-gray-600 hover:text-brand-blue transition-colors break-all">admin@medifocal.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                     <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <LocationIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">Our Address</h3>
                                        <p className="text-gray-600">Site 2, 7 Friesian Close, Sandgate NSW 2304, Australia</p>
                                    </div>
                                </div>
                                 <div className="flex items-start space-x-4">
                                     <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <InfoIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">Business Info</h3>
                                        <p className="text-gray-600">Medifocal Pty Ltd</p>
                                        <p className="text-gray-600">ABN: 13 674 191 649</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
