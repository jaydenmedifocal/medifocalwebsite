import React from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface BuyingGuidePageProps {
  guideSlug: string;
  setCurrentView: (view: View) => void;
}

const buyingGuides: Record<string, {
  title: string;
  description: string;
  content: string;
  category: string;
  keywords: string;
}> = {
  'dental-chairs': {
    title: 'How to Choose the Right Dental Chair for Your Practice | Buying Guide | Medifocal',
    description: 'Complete guide to choosing the perfect dental chair for your practice. Learn about features, specifications, and what to consider when purchasing dental chairs in Australia.',
    category: 'Dental Chairs',
    keywords: 'dental chair buying guide, how to choose dental chair, dental chair features, dental chair Australia, dental practice setup',
    content: `
# How to Choose the Right Dental Chair for Your Practice

Choosing the right dental chair is one of the most important decisions you'll make when setting up or upgrading your dental practice. This comprehensive guide will help you make an informed decision.

## Understanding Your Practice Needs

Before diving into specific features, it's essential to understand your practice's unique requirements.

### Practice Type Considerations
- **General Dentistry**: Requires versatility and comfort for various procedures
- **Specialist Practice**: May need specialized features for specific treatments
- **High-Volume Practice**: Needs durability and reliability for continuous use

### Budget Planning
Dental chairs range from $20,000 to $50,000+. Determine your budget early, but remember that quality is an investment in your practice's future.

## Key Features to Consider

### 1. Chair Movement and Control
- **Remote Control Systems**: Modern chairs offer wireless remote controls for easy positioning
- **Electric vs Hydraulic**: Electric chairs provide smoother operation and more precise control
- **Memory Positions**: Programmable positions save time and improve workflow efficiency

### 2. Patient Comfort
- **Ergonomic Design**: Ensures patient comfort during long procedures
- **High-Quality Cushioning**: Reduces patient fatigue and improves experience
- **Adjustable Headrest**: Accommodates different patient sizes and positions

### 3. Practitioner Access
- **Accessibility**: Easy access to all areas of the patient's mouth
- **Height Adjustment**: Allows optimal working position for practitioners
- **Range of Motion**: Smooth transitions between positions

### 4. Integrated Features
- **LED Lighting**: Modern LED lights provide excellent illumination without heat
- **Control Panel**: In-chair controls for patient comfort and convenience
- **Cuspidor Integration**: Built-in spittoon for hygienic patient care

## Australian Standards Compliance

When purchasing a dental chair in Australia, ensure it meets:
- **TGA (Therapeutic Goods Administration) Standards**
- **Australian Safety Standards (AS/NZS)**
- **Electrical Safety Standards**

All Medifocal dental chairs are fully compliant with Australian standards and come with comprehensive warranties.

## Installation and Training

Professional installation is crucial for optimal performance. Medifocal provides:
- Expert installation by qualified technicians
- Comprehensive training for your team
- Ongoing support and maintenance
- Documentation and compliance records

## Maintenance and Service

Regular maintenance ensures your dental chair operates at peak performance. Consider:
- Service contracts for peace of mind
- Availability of spare parts
- Local service support
- Response times for repairs

## Making Your Decision

When choosing a dental chair, prioritize:
1. **Quality and Reliability**: Invest in a chair that will last
2. **Patient Comfort**: Happy patients are returning patients
3. **Practitioner Ergonomics**: Protect your health and productivity
4. **Australian Standards**: Ensure compliance and safety
5. **Support**: Choose a supplier with excellent service

## Why Choose Medifocal?

Medifocal has been serving Australian dental practices for over 60 years. We offer:
- Premium dental chairs from trusted manufacturers
- Expert installation and training
- Comprehensive warranties (up to 10 years available)
- Ongoing support and maintenance
- Competitive pricing without compromising quality

## Next Steps

Ready to choose your dental chair? Browse our selection of premium dental chairs or contact our experts for personalized advice.

[View Dental Chairs](/dental-chairs) | [Contact Us](/contact)
    `
  },
  'sterilization-equipment': {
    title: 'Dental Sterilization Equipment Buying Guide | Autoclaves & Infection Control | Medifocal',
    description: 'Complete guide to choosing dental sterilization equipment. Learn about autoclaves, infection control, and compliance requirements for Australian dental practices.',
    category: 'Equipment',
    keywords: 'autoclave buying guide, dental sterilization, infection control equipment, autoclave Australia, dental practice compliance',
    content: `
# Dental Sterilization Equipment Buying Guide

Proper sterilization is essential for patient safety and compliance. This guide helps you choose the right sterilization equipment for your practice.

## Types of Sterilization Equipment

### Autoclaves (Steam Sterilization)
The most common and effective method:
- **Class B Autoclaves**: Most effective, suitable for all instrument types including wrapped instruments
- **Class N Autoclaves**: For unwrapped, solid instruments
- **Class S Autoclaves**: For specific instrument types

### Ultrasonic Cleaners
Essential for pre-cleaning:
- Removes debris before sterilization
- Improves sterilization effectiveness
- Extends instrument life

## Autoclave Selection Guide

### Size Considerations
- **Small Practices**: 8-10 liter capacity (1-2 operators)
- **Medium Practices**: 18-23 liter capacity (3-4 operators)
- **Large Practices**: 30+ liter capacity (5+ operators)

### Key Features to Look For
- **Class B Certification**: Essential for wrapped instruments
- **Drying Function**: Reduces moisture and contamination risk
- **Printers**: For compliance documentation
- **Water Quality System**: Distilled or demineralized water required
- **Cycle Options**: Multiple cycle types for different instruments

## Compliance Requirements

Australian dental practices must:
- Maintain sterilization logs
- Document all cycles
- Keep records for minimum 7 years
- Conduct regular testing (Bowie-Dick, Helix tests)
- Follow ADA infection control guidelines

## Maintenance and Service

Regular maintenance ensures:
- Optimal performance
- Compliance with standards
- Extended equipment life
- Patient safety

Medifocal provides comprehensive autoclave service and maintenance programs.

## Cost Considerations

Autoclave prices range from:
- **Small (8-10L)**: $5,000-$10,000
- **Medium (18-23L)**: $10,000-$15,000
- **Large (30L+)**: $15,000-$25,000

Consider total cost of ownership including maintenance and service.

## Medifocal Sterilization Solutions

Medifocal offers:
- Complete range of autoclaves
- Sterilization accessories
- Maintenance and service
- Training and support
- Compliance documentation

[View Sterilization Equipment](/category/equipment) | [Contact Us](/contact)
    `
  },
  'handpieces': {
    title: 'Dental Handpieces Buying Guide | High Speed vs Low Speed | Medifocal',
    description: 'Complete guide to choosing dental handpieces. Learn about high-speed vs low-speed handpieces, features, and what to consider when purchasing.',
    category: 'Handpieces',
    keywords: 'dental handpiece buying guide, high speed handpiece, low speed handpiece, dental handpiece Australia',
    content: `
# Dental Handpieces Buying Guide

Dental handpieces are essential tools in every dental practice. This guide helps you choose the right handpieces for your needs.

## High-Speed Handpieces

High-speed handpieces operate at 300,000-400,000 RPM and are used for:
- Tooth preparation
- Crown and bridge work
- Cavity preparation
- Cutting and shaping

### Key Features
- **Speed**: 300,000-400,000 RPM
- **Cooling**: Built-in water spray
- **Precision**: Excellent for detailed work
- **Versatility**: Multiple bur options

## Low-Speed Handpieces

Low-speed handpieces operate at 1,000-40,000 RPM and are used for:
- Finishing and polishing
- Prophylaxis
- Endodontic procedures
- Implant procedures

### Key Features
- **Speed**: 1,000-40,000 RPM
- **Torque**: Higher torque for heavy work
- **Versatility**: Multiple attachments
- **Precision**: Controlled speed

## Choosing the Right Handpiece

### For General Dentistry
- High-speed turbine handpiece (primary)
- Low-speed contra-angle (secondary)
- Prophy angle for cleaning

### For Specialists
- **Endodontics**: Specialized endo handpieces
- **Oral Surgery**: Surgical handpieces
- **Prosthodontics**: Precision handpieces

## Maintenance and Care

### Daily Maintenance
- Clean after each use
- Lubricate regularly
- Check for damage
- Store properly

### Regular Service
- Professional servicing every 6-12 months
- Bearing replacement
- Seal replacement
- Performance testing

## Cost Considerations

Handpiece prices range from:
- **High-Speed**: $500-$2,000+
- **Low-Speed**: $300-$1,500+
- **Specialized**: $1,000-$3,000+

[View Handpieces](/category/handpieces) | [Contact Us](/contact)
    `
  }
};

const BuyingGuidePage: React.FC<BuyingGuidePageProps> = ({ guideSlug, setCurrentView }) => {
  const guide = buyingGuides[guideSlug];

  if (!guide) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Buying Guide Not Found</h1>
          <p className="text-gray-600 mb-6">The requested buying guide could not be found.</p>
          <button
            onClick={() => setCurrentView({ page: 'home' })}
            className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue-dark"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const pageUrl = viewToUrl({ page: 'buyingGuide', guideSlug });

  // Parse markdown content into structured sections
  const parseContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'link'; content: string; items?: string[] }> = [];
    let currentList: string[] = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        if (currentList.length > 0) {
          sections.push({ type: 'ul', content: '', items: [...currentList] });
          currentList = [];
        }
        sections.push({ type: 'h1', content: trimmed.substring(2) });
      } else if (trimmed.startsWith('## ')) {
        if (currentList.length > 0) {
          sections.push({ type: 'ul', content: '', items: [...currentList] });
          currentList = [];
        }
        sections.push({ type: 'h2', content: trimmed.substring(3) });
      } else if (trimmed.startsWith('### ')) {
        if (currentList.length > 0) {
          sections.push({ type: 'ul', content: '', items: [...currentList] });
          currentList = [];
        }
        sections.push({ type: 'h3', content: trimmed.substring(4) });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentList.push(trimmed.substring(2));
      } else if (trimmed.match(/^\[(.*?)\]\((.*?)\)/)) {
        if (currentList.length > 0) {
          sections.push({ type: 'ul', content: '', items: [...currentList] });
          currentList = [];
        }
        const match = trimmed.match(/^\[(.*?)\]\((.*?)\)/);
        if (match) {
          sections.push({ type: 'link', content: match[1], items: [match[2]] });
        }
      } else if (trimmed) {
        if (currentList.length > 0) {
          sections.push({ type: 'ul', content: '', items: [...currentList] });
          currentList = [];
        }
        sections.push({ type: 'p', content: trimmed });
      }
    });
    
    if (currentList.length > 0) {
      sections.push({ type: 'ul', content: '', items: [...currentList] });
    }
    
    return sections;
  };

  const contentSections = parseContent(guide.content);
  const h2Sections = contentSections.filter(s => s.type === 'h2').map(s => s.content);

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <SEOHead
        title={guide.title}
        description={guide.description}
        keywords={guide.keywords}
        url={`https://medifocal.com${pageUrl}`}
        type="article"
        article={{
          publishedTime: new Date().toISOString(),
          section: guide.category,
          tags: guide.keywords.split(', ')
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {h2Sections.map((section, index) => (
                    <a
                      key={index}
                      href={`#section-${index}`}
                      className="block text-sm text-gray-600 hover:text-brand-blue hover:font-semibold transition-colors py-1 border-l-2 border-transparent hover:border-brand-blue pl-3"
                    >
                      {section}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-3">
              {/* Hero Header */}
              <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {guide.category}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                    {contentSections.find(s => s.type === 'h1')?.content || guide.title}
                  </h1>
                  <p className="text-xl opacity-95 max-w-3xl">
                    {guide.description}
                  </p>
                </div>
              </div>

              {/* Content Sections */}
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                {contentSections.map((section, index) => {
                  if (section.type === 'h1') return null; // Already shown in hero
                  
                  if (section.type === 'h2') {
                    const sectionIndex = h2Sections.indexOf(section.content);
                    return (
                      <div key={index} id={`section-${sectionIndex}`} className="scroll-mt-24">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-12 mb-6 pb-4 border-b-2 border-brand-blue flex items-center">
                          <span className="bg-brand-blue text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
                            {sectionIndex + 1}
                          </span>
                          {section.content}
                        </h2>
                      </div>
                    );
                  }
                  
                  if (section.type === 'h3') {
                    return (
                      <h3 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4 flex items-start">
                        <svg className="w-6 h-6 text-brand-blue mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {section.content}
                      </h3>
                    );
                  }
                  
                  if (section.type === 'ul' && section.items) {
                    return (
                      <ul key={index} className="space-y-3 mb-6 ml-4">
                        {section.items.map((item, itemIndex) => {
                          const isBold = item.includes('**');
                          const cleanItem = item.replace(/\*\*/g, '');
                          return (
                            <li key={itemIndex} className="flex items-start text-gray-700 leading-relaxed">
                              <svg className="w-5 h-5 text-brand-blue mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className={isBold ? 'font-semibold text-gray-900' : ''}>
                                {cleanItem.split('**').map((part, partIndex) => 
                                  partIndex % 2 === 1 ? <strong key={partIndex} className="font-bold text-gray-900">{part}</strong> : part
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  
                  if (section.type === 'link' && section.items) {
                    return (
                      <div key={index} className="flex flex-wrap gap-4 my-6">
                        {section.items.map((link, linkIndex) => {
                          const isInternal = link.startsWith('/');
                          return (
                            <a
                              key={linkIndex}
                              href={link}
                              onClick={(e) => {
                                if (isInternal) {
                                  e.preventDefault();
                                  const path = link.replace(/^\//, '');
                                  if (path === 'dental-chairs') {
                                    setCurrentView({ page: 'dentalChairs' });
                                  } else if (path === 'contact') {
                                    setCurrentView({ page: 'contact' });
                                  } else if (path.startsWith('category/')) {
                                    setCurrentView({ page: 'categoryLanding', categoryName: path.split('/')[1] });
                                  }
                                }
                              }}
                              className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              {section.content}
                              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  if (section.type === 'p') {
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
                        {section.content.split('**').map((part, partIndex) => 
                          partIndex % 2 === 1 ? <strong key={partIndex} className="font-bold text-gray-900">{part}</strong> : part
                        )}
                      </p>
                    );
                  }
                  
                  return null;
                })}

                {/* Enhanced CTA Section */}
                <div className="mt-16 pt-8 border-t-2 border-gray-200">
                  <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative">
                      <div className="flex items-center mb-4">
                        <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h3 className="text-3xl font-bold">Need Expert Advice?</h3>
                      </div>
                      <p className="text-xl mb-8 opacity-95 max-w-2xl">
                        Our team of dental equipment experts can help you choose the perfect equipment for your practice. With 60+ years of experience, we're here to guide you every step of the way.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => setCurrentView({ page: 'contact' })}
                          className="bg-white text-brand-blue px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Contact Our Experts
                        </button>
                        <button
                          onClick={() => setCurrentView({ page: 'buyingGuides' })}
                          className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all font-semibold text-lg"
                        >
                          View All Guides
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyingGuidePage;

