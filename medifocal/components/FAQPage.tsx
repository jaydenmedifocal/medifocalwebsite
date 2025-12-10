import React, { useState } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface FAQPageProps {
  category?: string;
  setCurrentView: (view: View) => void;
}

const faqData: Record<string, Array<{ question: string; answer: string }>> = {
  general: [
    {
      question: 'What is Medifocal?',
      answer: 'Medifocal is Australia\'s leading dental equipment supplier with over 60 years of experience serving Australian dental practices. We provide premium dental supplies, equipment, and consumables with fast shipping and expert support.'
    },
    {
      question: 'Do you ship Australia-wide?',
      answer: 'Yes, Medifocal ships to all states and territories across Australia. We offer Free Delivery Store Wide on all orders with no minimum purchase required. Delivery times vary by location, typically 3-7 business days.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard, American Express, and PayPal. We also offer account terms for established customers. Contact us for more information about payment options.'
    },
    {
      question: 'Do you offer installation services?',
      answer: 'Yes, Medifocal provides professional installation services for all major equipment including dental chairs, autoclaves, and imaging equipment. Our qualified technicians ensure proper setup and provide comprehensive training.'
    },
    {
      question: 'What warranties do you offer?',
      answer: 'All equipment comes with manufacturer warranties. Many dental chairs include standard 5-year warranties with options to extend to 10 years. Consumables and smaller items have standard warranties. Contact us for specific warranty information.'
    }
  ],
  'dental-chairs': [
    {
      question: 'What types of dental chairs do you offer?',
      answer: 'Medifocal offers a comprehensive range of dental chairs including remote control systems, electric chairs, hydraulic chairs, and traditional units. We have options for every practice size and budget.'
    },
    {
      question: 'Do dental chairs come with installation?',
      answer: 'Yes, all dental chairs purchased from Medifocal include professional installation by qualified technicians. We also provide comprehensive training for your team to ensure optimal operation.'
    },
    {
      question: 'What warranty do dental chairs come with?',
      answer: 'Our dental chairs typically come with 5-year standard warranties, with options to extend to 10 years. Warranty coverage includes parts and labor. Contact us for specific warranty details.'
    },
    {
      question: 'How long does installation take?',
      answer: 'Dental chair installation typically takes 4-6 hours depending on the model and complexity. Our technicians will coordinate with your schedule to minimize practice disruption.'
    },
    {
      question: 'Do you offer financing options?',
      answer: 'Yes, Medifocal offers flexible financing options for dental equipment purchases. Contact us to discuss financing solutions that work for your practice.'
    }
  ],
  'handpieces': [
    {
      question: 'What is the difference between high-speed and low-speed handpieces?',
      answer: 'High-speed handpieces operate at 300,000-400,000 RPM and are used for cutting and preparation. Low-speed handpieces operate at 1,000-40,000 RPM and are used for finishing, polishing, and specialized procedures.'
    },
    {
      question: 'How often should handpieces be serviced?',
      answer: 'Handpieces should be professionally serviced every 6-12 months depending on usage. Regular maintenance includes bearing replacement, seal replacement, and performance testing to ensure optimal operation.'
    },
    {
      question: 'Do you offer handpiece repair services?',
      answer: 'Yes, Medifocal provides comprehensive handpiece repair and maintenance services. We service all major brands and offer quick turnaround times to minimize practice disruption.'
    },
    {
      question: 'What handpieces do I need for my practice?',
      answer: 'For general dentistry, you\'ll need at least one high-speed handpiece and one low-speed contra-angle. Additional handpieces provide backup and allow for different procedures. Our experts can help you determine your specific needs.'
    }
  ],
  'sterilization': [
    {
      question: 'What type of autoclave do I need?',
      answer: 'For Australian dental practices, Class B autoclaves are recommended as they can sterilize wrapped instruments. Size depends on your practice volume - small practices typically need 8-10L capacity, while larger practices may need 18-30L capacity.'
    },
    {
      question: 'How often should autoclaves be serviced?',
      answer: 'Autoclaves should be serviced every 6-12 months and tested regularly with Bowie-Dick and Helix tests. Regular maintenance ensures compliance and optimal performance.'
    },
    {
      question: 'What water should I use in my autoclave?',
      answer: 'Autoclaves require distilled or demineralized water to prevent mineral buildup and ensure proper operation. Using tap water can damage the autoclave and void warranties.'
    },
    {
      question: 'Do you provide sterilization training?',
      answer: 'Yes, Medifocal provides comprehensive training on proper sterilization procedures, compliance requirements, and documentation. We ensure your team understands all protocols.'
    }
  ]
};

const FAQPage: React.FC<FAQPageProps> = ({ category = 'general', setCurrentView }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = faqData[category] || faqData.general;

  const categoryTitles: Record<string, string> = {
    general: 'Frequently Asked Questions',
    'dental-chairs': 'Dental Chairs FAQs',
    'handpieces': 'Handpieces FAQs',
    'sterilization': 'Sterilization & Infection Control FAQs'
  };

  const pageUrl = viewToUrl({ page: 'faq', category });
  const pageTitle = categoryTitles[category] || 'Frequently Asked Questions';

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <SEOHead
        title={`${pageTitle} | Medifocal`}
        description={`Frequently asked questions about ${category === 'general' ? 'Medifocal and our services' : category.replace('-', ' ')}. Get answers to common questions about dental equipment, shipping, warranties, and more.`}
        keywords={`${category} FAQ, dental equipment questions, ${category} Australia, Medifocal FAQ`}
        url={`https://medifocal.com${pageUrl}`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              {pageTitle}
            </h1>
            <p className="text-xl opacity-95">
              Get answers to common questions about {category === 'general' ? 'Medifocal and our services' : category.replace('-', ' ')}
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-brand-blue flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-lg text-gray-700 mb-6">
            Our expert team is here to help. Contact us for personalized advice and support.
          </p>
          <button
            onClick={() => setCurrentView({ page: 'contact' })}
            className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

