import React from 'react';

interface ShowcaseCardProps {
    title: string;
    description: string;
    imageUrl: string;
    logoUrl?: string;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ title, description, imageUrl, logoUrl }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 flex flex-col items-center p-6 text-center h-full">
        {logoUrl ? (
          <img src={logoUrl} alt={`${title} dental equipment brand logo`} className="h-16 mb-4" loading="lazy" width="128" height="64" />
        ) : (
          <img src={imageUrl} alt={`${title} dental equipment product`} className="w-40 h-40 object-contain mb-4" loading="lazy" width="160" height="160" />
        )}
        <div className="flex-grow flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 flex-grow">{description}</p>
        </div>
    </div>
);

const BrandShowcase: React.FC = () => {
    return (
        <section className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ShowcaseCard 
                    title="Consumables"
                    description="Australia’s widest range of dental consumables"
                    imageUrl="https://i.imgur.com/4zYgOJN.jpg"
                />
                <ShowcaseCard 
                    title="Equipment"
                    description="Tailored equipment solutions for all your practice needs"
                    imageUrl="https://i.imgur.com/6U9Tjqo.jpg"
                />
                <ShowcaseCard 
                    title="Medifocal Brand"
                    description="High quality products, at a competitive price"
                    imageUrl="https://i.imgur.com/Y3pG31M.jpg"
                    logoUrl="https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef"
                />
            </div>
        </section>
    );
};

export default BrandShowcase;