/**
 * SEO Content Generator for Categories
 * Based on Adam Dental's SEO strategy
 */

export interface CategorySEOContent {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  introText: string;
  features: string[];
  applications: string[];
  whyChoose: string[];
}

const categorySEOData: Record<string, CategorySEOContent> = {
  'Dental Chairs': {
    title: 'Dental Chairs Australia | Premium Treatment Units | Medifocal',
    description: 'Shop premium dental chairs and treatment units at Medifocal. Remote control, electric, and hydraulic options. Fast shipping Australia-wide. Expert installation and 60+ years experience.',
    keywords: 'dental chairs, dental chairs Australia, dental treatment units, remote control dental chairs, electric dental chairs, dental chair suppliers Australia',
    h1: 'Premium Dental Chairs for Australian Practices',
    introText: 'Medifocal offers a comprehensive range of high-quality dental chairs and treatment units designed for modern Australian dental practices. From state-of-the-art remote control systems to reliable traditional units, we have the perfect solution for your practice.',
    features: [
      'Remote Control Systems',
      'Electric & Hydraulic Options',
      'Programmable Memory Positions',
      'Integrated LED Lighting',
      'Ergonomic Design',
      'Australian Standards Compliant'
    ],
    applications: [
      'General Dentistry',
      'Orthodontics',
      'Oral Surgery',
      'Endodontics',
      'Periodontics',
      'Prosthodontics'
    ],
    whyChoose: [
      '60+ Years Experience serving Australian dental practices',
      'Expert Installation and Training',
      'Premium Brands from Trusted Manufacturers',
      'TGA and Australian Safety Standards Compliant',
      'Fast Shipping Nationwide',
      'Competitive Pricing without Compromising Quality'
    ]
  },
  'Anaesthetic': {
    title: 'Dental Anaesthetic Supplies | Local & Topical | Medifocal',
    description: 'Shop dental anaesthetic supplies including local anaesthetic, topical anaesthetic, and pharmaceuticals. Fast shipping, expert support, 60+ years experience.',
    keywords: 'dental anaesthetic, local anaesthetic, topical anaesthetic, dental needles, anaesthetic supplies Australia',
    h1: 'Dental Anaesthetic Supplies',
    introText: 'Medifocal supplies a comprehensive range of dental anaesthetic products including local anaesthetics, topical anaesthetics, and related pharmaceuticals. All products meet Australian standards and are suitable for dental practices nationwide.',
    features: [
      'Local Anaesthetic Solutions',
      'Topical Anaesthetic Products',
      'Dental Needles',
      'Pharmaceutical Products',
      'Quality Assured',
      'Australian Standards Compliant'
    ],
    applications: [
      'Routine Dental Procedures',
      'Oral Surgery',
      'Endodontic Treatment',
      'Periodontal Procedures',
      'Restorative Dentistry'
    ],
    whyChoose: [
      'Wide Range of Products',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  },
  'Dental Burs': {
    title: 'Dental Burs | High Speed & Carbide Burs | Medifocal',
    description: 'Shop dental burs including high speed diamond burs, carbide burs, and polishing burs. Fast shipping Australia-wide. Expert support available.',
    keywords: 'dental burs, high speed burs, diamond burs, carbide burs, polishing burs, bur blocks',
    h1: 'Dental Burs & Accessories',
    introText: 'Medifocal offers an extensive range of dental burs including high speed diamond burs, carbide burs, polishing burs, and bur accessories. All products are from trusted manufacturers and meet Australian quality standards.',
    features: [
      'High Speed Diamond Burs',
      'High Speed Polishing Burs',
      'Carbide Burs',
      'Bur Blocks & Organizers',
      'Cutting Discs',
      'Quality Brands'
    ],
    applications: [
      'Restorative Dentistry',
      'Crown & Bridge Work',
      'Orthodontics',
      'Prosthodontics',
      'General Dentistry'
    ],
    whyChoose: [
      'Extensive Product Range',
      'Premium Quality Brands',
      'Competitive Pricing',
      'Fast Shipping',
      'Expert Support'
    ]
  },
  'Handpieces': {
    title: 'Dental Handpieces | High Speed & Low Speed | Medifocal',
    description: 'Shop dental handpieces including high speed, low speed, and surgical handpieces. Fast shipping, expert support, 60+ years experience.',
    keywords: 'dental handpieces, high speed handpieces, low speed handpieces, surgical handpieces, handpiece accessories',
    h1: 'Dental Handpieces & Accessories',
    introText: 'Medifocal supplies a comprehensive range of dental handpieces including high speed, low speed, and surgical options. All handpieces are from trusted manufacturers and include accessories and maintenance supplies.',
    features: [
      'High Speed Handpieces',
      'Low Speed Handpieces',
      'Surgical Handpieces',
      'Handpiece Accessories',
      'Maintenance Supplies',
      'Quality Brands'
    ],
    applications: [
      'Restorative Dentistry',
      'Oral Surgery',
      'Endodontics',
      'Prosthodontics',
      'General Dentistry'
    ],
    whyChoose: [
      'Wide Selection',
      'Premium Brands',
      'Expert Support',
      'Fast Delivery',
      'Competitive Pricing'
    ]
  },
  'Infection Control': {
    title: 'Infection Control Supplies | PPE & Sterilisation | Medifocal',
    description: 'Shop infection control supplies including gloves, face masks, protective apparel, and sterilisation equipment. Fast shipping Australia-wide.',
    keywords: 'infection control, dental gloves, face masks, protective apparel, sterilisation, PPE dental supplies',
    h1: 'Infection Control Supplies',
    introText: 'Medifocal provides comprehensive infection control solutions for dental practices including gloves, face masks, protective apparel, and sterilisation equipment. All products meet Australian safety standards.',
    features: [
      'Latex & Nitrile Gloves',
      'Face Masks & Shields',
      'Protective Apparel',
      'Sterilisation Equipment',
      'Disinfectants & Cleaners',
      'Australian Standards Compliant'
    ],
    applications: [
      'Clinical Procedures',
      'Surgical Procedures',
      'Sterilisation Room',
      'General Practice',
      'Hospital Settings'
    ],
    whyChoose: [
      'Comprehensive Range',
      'Quality Assured',
      'Australian Standards',
      'Fast Delivery',
      'Expert Support'
    ]
  },
  'Equipment': {
    title: 'Dental Equipment | Autoclaves, Scalers & More | Medifocal',
    description: 'Shop dental equipment including autoclaves, ultrasonic scalers, curing lights, and air compressors. Fast shipping, expert installation, 60+ years experience.',
    keywords: 'dental equipment, autoclaves, ultrasonic scalers, curing lights, air compressors, dental equipment Australia',
    h1: 'Dental Equipment & Instruments',
    introText: 'Medifocal supplies a comprehensive range of dental equipment including autoclaves, ultrasonic scalers, curing lights, air compressors, and more. All equipment meets Australian standards and includes expert installation and support.',
    features: [
      'Autoclaves & Sterilisation',
      'Ultrasonic Scalers',
      'Curing Lights',
      'Air Compressors',
      'Suction Units',
      'X-Ray Equipment'
    ],
    applications: [
      'General Practice',
      'Specialist Practices',
      'Hospitals',
      'Educational Institutions',
      'Laboratories'
    ],
    whyChoose: [
      '60+ Years Experience',
      'Expert Installation',
      'Quality Brands',
      'Australian Standards',
      'Fast Delivery',
      'Ongoing Support'
    ]
  },
  'Dental Instruments': {
    title: 'Dental Instruments | Forceps, Scalers, Mirrors & More | Medifocal',
    description: 'Shop dental instruments including forceps, scalers, mirrors, probes, curettes, and more. Fast shipping Australia-wide. Expert support, 60+ years experience.',
    keywords: 'dental instruments, forceps, scalers, dental mirrors, probes, curettes, dental tools, dental instruments Australia',
    h1: 'Dental Instruments & Tools',
    introText: 'Medifocal supplies a comprehensive range of dental instruments including forceps, scalers, mirrors, probes, curettes, and surgical instruments. All instruments are from trusted manufacturers and meet Australian quality standards.',
    features: [
      'Forceps & Extractors',
      'Scalers & Curettes',
      'Dental Mirrors',
      'Probes & Explorers',
      'Surgical Instruments',
      'Quality Brands'
    ],
    applications: [
      'General Dentistry',
      'Oral Surgery',
      'Periodontics',
      'Endodontics',
      'Restorative Dentistry'
    ],
    whyChoose: [
      '60+ Years Experience',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  },
  'Impression': {
    title: 'Impression Materials | VPS, Alginate, Polyether | Medifocal',
    description: 'Shop dental impression materials including VPS vinyl polysiloxane, alginate, polyether, and impression trays. Fast shipping, expert support, 60+ years experience.',
    keywords: 'impression materials, VPS, alginate, polyether, impression trays, dental impressions, impression material Australia',
    h1: 'Dental Impression Materials',
    introText: 'Medifocal offers a comprehensive range of dental impression materials including VPS vinyl polysiloxane, alginate, polyether, and silicone. All materials are from trusted manufacturers and suitable for Australian dental practices.',
    features: [
      'VPS Vinyl Polysiloxane',
      'Alginate Materials',
      'Polyether',
      'Impression Trays',
      'Bite Registration',
      'Quality Brands'
    ],
    applications: [
      'Crown & Bridge',
      'Dentures',
      'Orthodontics',
      'Restorative Dentistry',
      'Prosthodontics'
    ],
    whyChoose: [
      'Wide Range of Materials',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  },
  'Endodontics': {
    title: 'Endodontic Supplies | Files, Gutta Percha, Endo Equipment | Medifocal',
    description: 'Shop endodontic supplies including hand files, rotary files, gutta percha points, and endo equipment. Fast shipping Australia-wide. Expert support available.',
    keywords: 'endodontics, endodontic files, gutta percha, rotary files, endo equipment, endodontic supplies Australia',
    h1: 'Endodontic Supplies & Equipment',
    introText: 'Medifocal supplies a comprehensive range of endodontic products including hand files, rotary files, gutta percha points, and endodontic equipment. All products meet Australian standards and are from trusted manufacturers.',
    features: [
      'Hand & Rotary Files',
      'Gutta Percha Points',
      'Endo Equipment',
      'Irrigation Solutions',
      'Obturation Materials',
      'Quality Brands'
    ],
    applications: [
      'Root Canal Treatment',
      'Endodontic Procedures',
      'Retreatment',
      'Apical Surgery'
    ],
    whyChoose: [
      'Comprehensive Range',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  },
  'Orthodontics': {
    title: 'Orthodontic Supplies | Brackets, Wires, Elastomerics | Medifocal',
    description: 'Shop orthodontic supplies including brackets, archwires, elastomerics, and orthodontic instruments. Fast shipping Australia-wide. Expert support, 60+ years experience.',
    keywords: 'orthodontics, brackets, archwires, elastomerics, orthodontic supplies, orthodontic products Australia',
    h1: 'Orthodontic Supplies & Products',
    introText: 'Medifocal offers a comprehensive range of orthodontic products including brackets, archwires, elastomerics, and orthodontic instruments. All products are from trusted manufacturers and suitable for Australian orthodontic practices.',
    features: [
      'Brackets (Ceramic, Metal)',
      'Archwires (NiTi, Stainless Steel)',
      'Elastomerics',
      'Orthodontic Instruments',
      'Retainers & Accessories',
      'Quality Brands'
    ],
    applications: [
      'Fixed Orthodontics',
      'Clear Aligners',
      'Retention',
      'Orthodontic Treatment'
    ],
    whyChoose: [
      'Comprehensive Range',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  },
  'X-Ray': {
    title: 'Dental X-Ray Equipment & Supplies | Medifocal',
    description: 'Shop dental X-ray equipment, phosphor plates, film products, and X-ray accessories. Fast shipping Australia-wide. Expert support, 60+ years experience.',
    keywords: 'dental x-ray, x-ray equipment, phosphor plates, dental film, x-ray supplies, dental imaging Australia',
    h1: 'Dental X-Ray Equipment & Supplies',
    introText: 'Medifocal supplies a comprehensive range of dental X-ray equipment and supplies including digital sensors, phosphor plates, film products, and X-ray accessories. All products meet Australian radiation safety standards.',
    features: [
      'Digital X-Ray Equipment',
      'Phosphor Plates',
      'X-Ray Film',
      'Positioning Aids',
      'Radiation Protection',
      'Quality Brands'
    ],
    applications: [
      'Diagnostic Imaging',
      'Treatment Planning',
      'Monitoring',
      'General Practice'
    ],
    whyChoose: [
      '60+ Years Experience',
      'Quality Brands',
      'Australian Standards',
      'Expert Support',
      'Fast Delivery'
    ]
  }
};

/**
 * Get SEO content for a category
 */
export function getCategorySEO(categoryName: string): CategorySEOContent {
  const normalizedName = categoryName.trim();
  
  // Try exact match first
  if (categorySEOData[normalizedName]) {
    return categorySEOData[normalizedName];
  }
  
  // Try case-insensitive match
  const lowerName = normalizedName.toLowerCase();
  for (const [key, value] of Object.entries(categorySEOData)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(categorySEOData)) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedName.toLowerCase())) {
      return value;
    }
  }
  
  // Default/fallback SEO content
  return {
    title: `${categoryName} | Dental Supplies Australia | Medifocal`,
    description: `Shop ${categoryName} from Medifocal. Australia's leading dental equipment supplier with 60+ years of experience. Fast shipping, expert support, competitive pricing.`,
    keywords: `${categoryName.toLowerCase()}, dental supplies, dental equipment, ${categoryName.toLowerCase()} Australia, dental supplies Australia`,
    h1: categoryName,
    introText: `Medifocal offers a comprehensive range of ${categoryName.toLowerCase()} for Australian dental practices. All products meet Australian standards and are available with fast shipping and expert support.`,
    features: [
      'Quality Assured Products',
      'Australian Standards Compliant',
      'Fast Shipping',
      'Expert Support',
      'Competitive Pricing'
    ],
    applications: [
      'General Dentistry',
      'Specialist Practices',
      'Hospitals',
      'Educational Institutions'
    ],
    whyChoose: [
      '60+ Years Experience',
      'Quality Brands',
      'Fast Delivery',
      'Expert Support',
      'Competitive Pricing'
    ]
  };
}

/**
 * Generate product page SEO title
 */
export function getProductSEOTitle(productName: string, category?: string, brand?: string): string {
  const parts: string[] = [productName];
  if (brand) parts.push(brand);
  if (category) parts.push(category);
  parts.push('Medifocal');
  return parts.join(' | ');
}

/**
 * Generate product page SEO description
 */
export function getProductSEODescription(
  productName: string, 
  category?: string, 
  brand?: string, 
  price?: string,
  features?: string[]
): string {
  const parts: string[] = [];
  
  if (brand) {
    parts.push(`${productName} by ${brand}`);
  } else {
    parts.push(productName);
  }
  
  if (category) {
    parts.push(`for ${category.toLowerCase()}`);
  }
  
  if (features && features.length > 0) {
    parts.push(`Features: ${features.slice(0, 2).join(', ')}`);
  }
  
  if (price) {
    parts.push(`Price: ${price}`);
  }
  
  parts.push('Fast shipping Australia-wide. Expert support available.');
  
  return parts.join('. ');
}

