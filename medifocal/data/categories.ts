
export interface SubCategoryGroup {
    title: string;
    items: string[];
}

export const medifocalCategories: Record<string, SubCategoryGroup[]> = {
    '3D Printing': [
        { title: '3D Printers', items: [] },
        { title: '3D Printing Accessories', items: [] }
    ],
    'Anaesthetic': [
        { title: 'Delivery Systems', items: [] },
        { title: 'Dental Needles', items: [] },
        { title: 'Hypodermic Needles', items: [] },
        { title: 'Local Anaesthetic', items: [] },
        { title: 'Pharmaceuticals', items: [] },
        { title: 'Sharps Disposal & Protection', items: [] },
        { title: 'Syringes', items: [] },
        { title: 'Topical Anaesthetic', items: [] }
    ],
    'Articulating': [
        { title: 'Articulators & Facebows', items: [] },
        { title: 'Foil', items: [] },
        { title: 'Forceps', items: [] },
        { title: 'Occlusal Indicators', items: [] },
        { title: 'Paper', items: [] },
        { title: 'Silk', items: [] },
        { title: 'Sprays', items: [] }
    ],
    'Burs': [
        { title: 'Dental Burs', items: ['Accessories', 'Bur Kits', 'Carbide Highspeed Burs', 'Carbide Slowspeed Burs', 'Caries Excavation', 'Ceramic Highspeed Burs', 'Ceramic Slowspeed Burs', 'Crown Cutters', 'Diamond Highspeed Burs', 'Diamond Slowspeed Burs', 'Endodontics', 'Filling Remover', 'Finishing & Polishing', 'Implantology', 'Oral Surgery Burs', 'Orthodontics', 'Polishers', 'Preparation', 'Root Planing', 'Single Use Sterile Burs', 'Sonic Tips', 'Speciality Endodontics', 'Speciality Surgical'] },
        { title: 'Laboratory Burs', items: ['Carbide Burs', 'Cutters', 'Diamond Burs', 'Discs', 'Grinding, Finishing & Polishing', 'Lab Bur Kits', 'Milling Burs', 'Polishers', 'Separating & Contouring', 'Steel Burs', 'Twist Drills & Mandrels'] }
    ],
    'CAD/CAM': [
        { title: 'Blocks', items: ['Composite Blocks', 'Feldspathic Blocks', 'Glass Ceramic Blocks', 'Hybrid Blocks', 'Lithium Disilicate Blocks', 'PMMA Blocks', 'Temporary Blocks', 'Zirconia Blocks'] },
        { title: 'Discs', items: ['Acetal Discs', 'Hybrid Discs', 'Resin PMMA Discs', 'Wax Discs', 'Zirconia Discs'] },
        { title: 'Finishing & Polishing', items: [] },
        { title: 'Ingots', items: ['GC Initial LiSi Press'] },
        { title: 'Milling Unit Accessories', items: ['Calibration', 'Cutters & Burs', 'Filters', 'Liquids & Sprays'] },
        { title: 'Sprays, Etchants & Primers', items: [] },
        { title: 'Stain, Glaze & Firing Accessories', items: [] }
    ],
    'Crown & Bridge': [
        { title: 'Accessories', items: ['Applicator Tips & Brushes', 'Mixing Pads & Wells', 'Orange Solvent'] },
        { title: 'Cements', items: ['Bioactive Cements', 'Glass Ionomer Cements', 'Resin Cements', 'Temporary Cements', 'Temporary Filling Materials', 'Zinc Phosphate Cements'] },
        { title: 'Cleaners', items: [] },
        { title: 'Core Material', items: [] },
        { title: 'Crown Forms', items: ['Co-forms', 'Pella Clear Crown Forms', 'Polycarbonate Crowns', 'Scissors, Shapers and Removers', 'Stainless Steel Crowns', 'Strip Off Crown Forms', 'Tin Crowns', 'Zirconia Crowns'] },
        { title: 'Liners & Base', items: ['Bioactive Cements', 'Calcium Hydroxide', 'Glass Ionomers', 'ZOE'] },
        { title: 'Temporary Crown & Bridge', items: [] },
        { title: 'Varnish, Sealants, Conditioners', items: [] }
    ],
    'Disposables': [
        { title: 'Bags & Bin Liners', items: [] },
        { title: 'Barrier Products', items: [] },
        { title: 'Bibs', items: [] },
        { title: 'Cotton', items: ['Cotton Applicators', 'Cotton Pellets & Dispensers', 'Cotton Rolls & Dispensers'] },
        { title: 'Cups', items: [] },
        { title: 'Dispensers Towels & Tissues', items: [] },
        { title: 'Dry Tips', items: [] },
        { title: 'Evacuation', items: ['Air Water Syringe Tips', 'Disposable Traps', 'Evacuation Tips', 'Isolite', 'Saliva Ejectors', 'Surgical Aspirator Tips'] },
        { title: 'Gauze', items: [] },
        { title: 'Gloves', items: ['Glove Dispensers', 'Latex Gloves', 'Nitrile & Synthetic Gloves', 'Sterile Gloves', 'Utility & Vinyl Gloves'] },
        { title: 'Gowns & Caps', items: [] },
        { title: 'Masks', items: ['Cone & Respirator Masks', 'Earloop Masks', 'Face Shields', 'Tie On Masks'] },
        { title: 'Tissues', items: ['Facial', 'Toilet'] },
        { title: 'Towels', items: [] }
    ],
    'Education & Toys': [
        { title: 'Books', items: ['Multidisciplinary', 'Paediatrics'] },
        { title: 'Office Supplies', items: [] },
        { title: 'Patient Education', items: [] },
        { title: 'Toys & Stickers', items: [] }
    ],
    'Endodontics': [
        { title: 'Access', items: ['Burs & Kits', 'Gates Glidden'] },
        { title: 'Apex Locators', items: [] },
        { title: 'Calcium Hydroxide', items: [] },
        { title: 'Endo Motors', items: [] },
        { title: 'Hand Files', items: ['Broaches', 'Flex Files', 'Hedstrom Files', 'K Files', 'NiTi', 'Pathfinders', 'Reamers'] },
        { title: 'Irrigation', items: ['Irrigation Syringes & Needles', 'Medicaments & Solutions'] },
        { title: 'Obturation', items: ['Obturation Material', 'Obturation Units', 'Paper Points', 'Gutta Percha Points'] },
        { title: 'Rotary Files', items: [] },
        { title: 'Ultrasonic Tips', items: [] }
    ],
    'Equipment': [
        { title: 'Dental Chairs', items: [] },
        { title: 'Digital Dentistry', items: ['3D Printers', 'Laboratory', 'Mills', 'Scanners', 'Software'] },
        { title: 'Imaging', items: ['Cameras and Caries Detection', 'Cone Beam', 'Intra Oral Xray', 'OPG', 'PSP', 'Sensors'] },
        { title: 'Plant', items: ['Amalgam Separation', 'Compressors', 'Suction'] },
        { title: 'Sterilisation', items: ['Autoclaves', 'Disinfectors'] }
    ],
    'Equipment Consumables': [
        { title: 'Suction System Accessories', items: [] },
        { title: 'Treatment Unit Accessories', items: [] }
    ],
    'Finishing & Polishing': [
        { title: 'Direct', items: ['Abrasives', 'Brushes', 'Discs & Wheels', 'Mandrels', 'Polishers', 'Polishing Materials', 'Strips'] },
        { title: 'Indirect', items: ['Acrylic Trimmers', 'Arbor Bands', 'Brushes', 'Buffs & Mops', 'Discs & Wheels', 'Felt', 'Lathe Brushes', 'Lathe Wheels', 'Mandrels', 'Polishers', 'Polishing Materials'] }
    ],
    'Handpieces': [
        { title: 'Air Motors', items: [] },
        { title: 'Cleaners, Lubricants & Accessories', items: [] },
        { title: 'Electric Micromotors', items: [] },
        { title: 'Endo Handpieces & Accessories', items: [] },
        { title: 'High Speed', items: [] },
        { title: 'Lab Handpieces', items: [] },
        { title: 'Low Speed', items: ['Contra Angles', 'Prophy Angles & Accessories', 'Straight'] },
        { title: 'Motor Adaptors & Couplings', items: [] },
        { title: 'Perio Handpieces & Tips', items: [] },
        { title: 'Surgical Handpieces', items: [] }
    ],
    'Impression': [
        { title: 'Accessories', items: [] },
        { title: 'Alginate', items: [] },
        { title: 'Bite Registration', items: [] },
        { title: 'Compound', items: [] },
        { title: 'Impression Disinfectant', items: [] },
        { title: 'Laboratory Putty', items: [] },
        { title: 'Mixers & Mixing Bowls', items: [] },
        { title: 'Mixing Tips', items: [] },
        { title: 'Polyether', items: [] },
        { title: 'Polyvinylsiloxane', items: [] },
        { title: 'Rubber Base', items: [] },
        { title: 'Silicone', items: [] },
        { title: 'Syringes & Dispensers', items: [] },
        { title: 'Trays', items: ['Adhesive', 'Bite', 'Cleaners', 'Disposable', 'Metal'] }
    ],
    'Infection Control': [
        { title: 'Air Purification', items: [] },
        { title: 'Barrier', items: [] },
        { title: 'Disinfectants & Detergents', items: ['Deodorisers', 'Instrument', 'Suction', 'Surface', 'Waterline'] },
        { title: 'Gloves', items: ['Latex', 'Nitrile', 'Sterile', 'Utility'] },
        { title: 'Hand Hygiene', items: [] },
        { title: 'Masks', items: ['Cone & Respirator', 'Earloop', 'Face Shields', 'Tie On'] },
        { title: 'Protective Apparel', items: ['Safety Glasses'] },
        { title: 'Steri Room', items: ['Autoclaves & Sterilisers', 'Disinfectors & Washers', 'Distillers', 'Pouches & Wraps', 'Sterilisation Trays', 'Monitoring Systems'] },
        { title: 'Ultrasonic Cleaning', items: ['Cleaners', 'Solutions'] },
        { title: 'Waste Management', items: [] },
        { title: 'Wipes', items: ['Disinfection Wipes', 'Dry Wipes', 'Neutral Detergent Wipes'] },
        { title: 'Zany Jackets', items: [] }
    ],
    'Instruments': [
        { title: 'Accessories', items: ['Clinical', 'Sharpening', 'Utility Forceps'] },
        { title: 'Bundles', items: [] },
        { title: 'Calipers & Gauges', items: [] },
        { title: 'Diagnostic', items: ['Explorers', 'Mirrors', 'Probes', 'Tweezers'] },
        { title: 'Endodontics', items: ['Mouth Props', 'Pluggers & Spreaders'] },
        { title: 'Instrument Maintenance', items: [] },
        { title: 'Laboratory', items: ['Chisels', 'Knives', 'Plaster Cutters', 'Saws & Blades', 'Spatulas', 'Waxing'] },
        { title: 'Orthodontics', items: ['Pliers', 'Wire Cutters'] },
        { title: 'Periodontics', items: ['Curettes', 'Scalers'] },
        { title: 'Restorative', items: ['Amalgam Carriers', 'Burnishers', 'Carvers', 'Composite', 'Excavators', 'Plastic Filling', 'Spatulas'] },
        { title: 'Surgical', items: ['Bone Files', 'Chisels', 'Curettes', 'Extraction Forceps', 'Hemostats', 'Knives', 'Luxators & Elevators', 'Needle Holders', 'Retractors', 'Rongeurs', 'Scalpels', 'Scissors', 'Tissue Forceps'] },
        { title: 'Trays & Cassettes', items: ['Cassettes', 'Instrument ID', 'Tray, Tubs & Drawer Setup'] }
    ],
    'Laboratory': [
        { title: 'Abrasives', items: [] },
        { title: 'Acrylics', items: ['Acrylic Stains', 'Bonds, Glaze, Sealants', 'Custom Tray Material', 'Denture Base', 'Mixing Bowls', 'Orthodontic Acrylic', 'Pattern Resin', 'Reline', 'Self Curing'] },
        { title: 'Alloy', items: ['Solder'] },
        { title: 'Articulation', items: ['Accessories', 'Foil', 'Paper', 'Articulators', 'Indicators'] },
        { title: 'Brushes & Buffs', items: [] },
        { title: 'Burners & Torches', items: [] },
        { title: 'Casting', items: ['Rings, Liners & Bases', 'Crucibles'] },
        { title: 'Ceramics / Porcelain', items: ['All Ceramics', 'Metal Ceramics', 'Liquids & Accessories', 'Pressable Ceramics', 'Resin/Composite'] },
        { title: 'Denture Accessories', items: ['Base Plates', 'Denture Care', 'Flasks & Presses', 'Reline Jigs', 'Separating', 'Wires & Clasps'] },
        { title: 'Duplicating Material', items: ['Flasks', 'Material'] },
        { title: 'Furniture', items: [] },
        { title: 'Instruments', items: [] },
        { title: 'Investment', items: [] },
        { title: 'Lab Equipment', items: ['Air Turbines', 'Alloy Grinders', 'Boil Out', 'Dust Collectors', 'Furnaces', 'Lathes', 'Light Cure', 'Micromotors', 'Model Trimmers', 'Pin Drilling', 'Plaster Traps', 'Sandblasters', 'Steam Cleaners', 'Thermoforming', 'Ultrasonic', 'Vacuum Mixers', 'Vibrators', 'Waxing'] },
        { title: 'Model Preparation', items: [] },
        { title: 'Polishing', items: [] },
        { title: 'Shade Taking', items: [] },
        { title: 'Stone & Plaster', items: [] },
        { title: 'Storage', items: [] },
        { title: 'Teeth', items: [] },
        { title: 'Waxes', items: [] }
    ],
    'Oral Surgery': [
        { title: 'Electrosurgery', items: [] },
        { title: 'Grafting Materials', items: [] },
        { title: 'Implant Dentistry', items: ['Restorative', 'Surgical'] },
        { title: 'Implant Stability', items: [] },
        { title: 'Interproximal Reduction', items: [] },
        { title: 'Lasers', items: [] },
        { title: 'Oral Cancer Detection', items: [] },
        { title: 'Piezo Surgery', items: [] },
        { title: 'Post Operative Care', items: [] },
        { title: 'Sterile Gloves', items: [] },
        { title: 'Surgical Accessories', items: [] },
        { title: 'Surgical Drapes', items: [] },
        { title: 'Surgical Instruments', items: [] },
        { title: 'Surgical Irrigation', items: [] },
        { title: 'Sutures', items: ['Absorbable', 'Non Absorbable'] },
        { title: 'Wound Management', items: [] }
    ],
    'Orthodontics': [
        { title: 'Adhesives & Cements', items: [] },
        { title: 'Archwires', items: [] },
        { title: 'Bands', items: [] },
        { title: 'Brackets', items: ['Self Ligating Brackets', 'Twin-Wing Brackets'] },
        { title: 'Buccal Tubes', items: [] },
        { title: 'Carriere Motion', items: [] },
        { title: 'Elastomerics', items: [] },
        { title: 'Fixed Appliance Accessories', items: [] },
        { title: 'Interproximal Reduction', items: [] },
        { title: 'Laboratory', items: [] },
        { title: 'Lingual Arches & Bars', items: [] },
        { title: 'Lingual Attachments', items: [] },
        { title: 'Mini-Molds', items: [] },
        { title: 'Mouthguard Cases', items: [] },
        { title: 'Nitanium Molar Rotator', items: [] },
        { title: 'Nitanium Palatal Expander', items: [] },
        { title: 'Orthodontic Instruments', items: [] },
        { title: 'Photographic Mirrors', items: [] },
        { title: 'Springs', items: [] },
        { title: 'Stops & Hooks', items: [] },
        { title: 'Storage & Dispensers', items: [] },
        { title: 'TransForce', items: [] }
    ],
    'Preventive': [
        { title: 'Appliance Care', items: [] },
        { title: 'Caries Detection', items: [] },
        { title: 'Disclosing', items: [] },
        { title: 'Flossing', items: ['Floss & Ribbon', 'Power Flossing'] },
        { title: 'Fluoride Treatments', items: ['Home', 'Office', 'Trays'] },
        { title: 'Interdental Brushes', items: [] },
        { title: 'Pit & Fissure', items: [] },
        { title: 'Prophy', items: ['Dappen Dishes', 'Handpieces', 'Prophy Angles', 'Prophy Cups & Brushes', 'Prophy Paste'] },
        { title: 'Rinses', items: ['Anti-Inflammatory', 'Home', 'Office'] },
        { title: 'Speciality', items: ['Dry Mouth', 'Gums & Mints', 'Remineralisation', 'Saliva Indicators'] },
        { title: 'Tongue Cleaners', items: [] },
        { title: 'Toothbrushes', items: ['Manual', 'Personalised', 'Power'] },
        { title: 'Toothpaste', items: [] },
        { title: 'Ultrasonic Prophylaxis', items: ['Powders', 'Tips', 'Handpieces', 'Units'] }
    ],
    'Restorative & Cosmetic': [
        { title: 'Accessories', items: [] },
        { title: 'Amalgam & Alloys', items: ['Capsules', 'Carriers & Pluggers', 'Mixers', 'Wells, Liners & Accessories'] },
        { title: 'Bonds & Etch', items: ['Bond Self Etch', 'Bond Total', 'Bond Universal', 'Etch & Primer'] },
        { title: 'Brushes & Applicators', items: [] },
        { title: 'Compomer', items: [] },
        { title: 'Composite', items: ['Veneer Systems', 'Flowable', 'Universal Caps', 'Universal Syringes', 'Uveneer'] },
        { title: 'Curing Lights', items: ['Accessories', 'Units'] },
        { title: 'Dentin Conditioners', items: [] },
        { title: 'Glass Ionomers', items: ['Auto Cure', 'Light Cure'] },
        { title: 'Jewellery', items: [] },
        { title: 'Matrix Bands & Retainers', items: ['Bands', 'Retainers', 'Strips & Foils', 'Wedges'] },
        { title: 'Pins & Posts', items: ['Drills', 'Pins', 'Posts'] },
        { title: 'Shade Taking', items: ['Digital', 'Guides'] },
        { title: 'Staining & Reinforcement', items: [] },
        { title: 'Teeth Whitening', items: ['In-Office', 'Marketing Material', 'Pre-loaded', 'Specialty', 'Take-Home', 'Tray Fabrication'] }
    ],
    'Retraction': [
        { title: 'Cords, Twists & Braids', items: [] },
        { title: 'Hemostatic Gels & Solutions', items: [] },
        { title: 'Pellets & Cotton', items: [] },
        { title: 'Retraction Systems', items: [] }
    ],
    'Rubber Dam': [
        { title: 'Clamps', items: [] },
        { title: 'Frames', items: [] },
        { title: 'Latex Dam', items: [] },
        { title: 'Napkins', items: [] },
        { title: 'Non-Latex Dam', items: [] },
        { title: 'Punches & Forceps', items: [] },
        { title: 'Stabilising Cord', items: [] },
        { title: 'Stamps & Templates', items: [] }
    ],
    'X-Ray': [
        { title: 'Aprons', items: [] },
        { title: 'Bite Blocks', items: [] },
        { title: 'Bite Wings, Tabs & Hangers', items: [] },
        { title: 'Film', items: ['Intra-oral'] },
        { title: 'Film Position Holders', items: [] },
        { title: 'Film Storage', items: [] },
        { title: 'Fixers & Developers', items: [] },
        { title: 'Intra-Oral X-ray', items: [] },
        { title: 'Sensors & Plates', items: [] }
    ]
};
