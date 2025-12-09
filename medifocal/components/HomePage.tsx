
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
        
      </div>
    </div>
  );
};

export default HomePage;
