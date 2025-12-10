
import React from 'react';
import Hero from './Hero';
import EverydayEssentials from './EverydayEssentials';
import HomeCategoryTiles from './HomeCategoryTiles';
import TopSearches from './TopSearches';
import FeaturedProducts from './FeaturedProducts';
import ExploreBrands from './ExploreBrands';
import EducationSection from './EducationSection';
import LatestNews from './LatestNews';
import InfoHelp from './InfoHelp';
import BeSocial from './BeSocial';
import TrustSignals from './TrustSignals';
import SEOHead from './SEOHead';
import { View } from '../App';

interface HomePageProps {
  setCurrentView: (view: View) => void;
  handleSearch: (query: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentView, handleSearch }) => {
  return (
    <div className="bg-gray-50 min-h-screen -mt-20 lg:-mt-[128px] pt-20 lg:pt-[128px]">
      <SEOHead
        title="Medifocal | Australian Dental Equipment Supplier | Dental Chairs Australia"
        description="Australia's leading dental equipment supplier. Shop premium dental supplies, autoclaves, dental chairs Australia, imaging equipment, sterilization equipment, and consumables. Fast shipping, expert support, 60+ years experience serving Australian dental practices."
        url="https://medifocal.com"
        keywords="dental equipment supplier, dental supplies Australia, dental chairs Australia, dental treatment units, dental surgery equipment, autoclaves, dental imaging, sterilization equipment, dental consumables, dental instruments, dental practice supplies, dental X-ray, dental compressors, dental suction units, intraoral scanner, dental lasers, electro surgical, dental equipment repair, dental equipment service, Australian dental supplier, dental equipment wholesale, affordable dental chairs, dental chair suppliers Australia"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 md:pt-16 lg:pt-16 pb-12 space-y-12">
        <h1 className="sr-only">Medifocal - Australia's Leading Dental Equipment Supplier | Dental Supplies, Autoclaves, Chairs & More</h1>
        
        <Hero setCurrentView={setCurrentView} />
        
        {/* Trust Signals Banner */}
        <TrustSignals />
        
        <EverydayEssentials setCurrentView={setCurrentView} />
        
        <HomeCategoryTiles setCurrentView={setCurrentView} />

        <FeaturedProducts setCurrentView={setCurrentView} />

        <ExploreBrands />

        <EducationSection setCurrentView={setCurrentView} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                 <LatestNews setCurrentView={setCurrentView} />
            </div>
            <div className="space-y-12">
                <TopSearches setCurrentView={setCurrentView} handleSearch={handleSearch} />
                <BeSocial />
            </div>
        </div>
        
        <InfoHelp setCurrentView={setCurrentView} />
        
        {/* SEO Content Sections - Hidden visually but accessible to crawlers - Split into 12 smaller sections */}
        <div className="sr-only" aria-label="SEO Content" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
            <section><h2>Australia's Leading Dental Equipment Supplier</h2><p>Medifocal is Australia's premier dental equipment supplier, serving healthcare professionals across the country for over 60 years. We specialize in providing high-quality dental supplies, autoclaves, dental chairs, imaging equipment, sterilization systems, and consumables to dental practices nationwide.</p></section>
            <section><h3>Comprehensive Product Range</h3><p>Our comprehensive product range includes everything from essential dental instruments and handpieces to advanced treatment units and digital imaging systems. We work with leading manufacturers worldwide to ensure Australian dental practices have access to the latest technology and equipment.</p></section>
            <section><h3>Expert Support and Service</h3><p>With fast shipping across Australia, expert technical support, and professional installation services, Medifocal is your trusted partner for all dental equipment needs. Our team of experienced professionals understands the unique requirements of Australian dental practices and is committed to providing exceptional service and support.</p></section>
            <section><h3>Competitive Pricing and Support</h3><p>Whether you're setting up a new practice, upgrading existing equipment, or need routine supplies, Medifocal offers competitive pricing, reliable products, and comprehensive after-sales support. Browse our extensive catalog to find the perfect dental equipment solutions for your practice.</p></section>
            <section><h3>Flexible Financing Options</h3><p>At Medifocal, we understand that dental equipment is a significant investment for your practice. That's why we offer flexible financing options, comprehensive warranties, and dedicated customer service. Our extensive inventory ensures you can find everything you need in one place.</p></section>
            <section><h3>Quality Product Categories</h3><p>Our product categories include dental chairs, autoclaves and sterilization equipment, dental imaging systems, handpieces and instruments, dental supplies and consumables, infection control products, and much more. Each product in our catalog is carefully selected to meet the highest standards of quality, safety, and performance.</p></section>
            <section><h3>Dental Chairs and Treatment Units</h3><p>We offer a wide selection of dental chairs and treatment units from leading manufacturers, designed to provide comfort for patients and efficiency for dental professionals. All equipment meets Australian TGA standards and comes with comprehensive warranties.</p></section>
            <section><h3>Sterilization and Infection Control</h3><p>Our sterilization equipment range includes autoclaves, sterilizers, and infection control products essential for maintaining the highest standards of hygiene in dental practices. We provide expert guidance on selecting the right equipment for your practice needs.</p></section>
            <section><h3>Dental Imaging Equipment</h3><p>From digital X-ray systems to intraoral cameras and 3D imaging solutions, we provide cutting-edge dental imaging equipment that helps Australian dental practices deliver accurate diagnoses and superior patient care.</p></section>
            <section><h3>Dental Instruments and Handpieces</h3><p>Our extensive range of dental instruments and handpieces includes everything from basic hand instruments to advanced rotary systems. All products are sourced from trusted manufacturers and meet strict quality standards.</p></section>
            <section><h3>Dental Supplies and Consumables</h3><p>We stock a comprehensive range of dental supplies and consumables, including restorative materials, impression materials, disposables, and infection control products. Fast shipping ensures you always have what you need when you need it.</p></section>
            <section><h3>Customer Service Excellence</h3><p>Our dedicated customer service team is available to assist with product selection, technical support, and order tracking. We're committed to ensuring your complete satisfaction with every purchase and providing ongoing support for your practice.</p></section>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;
