import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    sku: 'GLS-001',
    name: 'Ocean Premium Whisky Glass Set (6 Pcs)',
    category: 'Glassware',
    currentStock: 420,
    dateAdded: '2025-09-15', // ~280 days ago
    barcode: '8901234567890',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    price: 1450,
    location: 'Rack A1 - Main Display'
  },
  {
    sku: 'GLS-002',
    name: 'Crystal Tall Water Bottle 1L',
    category: 'Glassware',
    currentStock: 14,
    dateAdded: '2026-06-05', // ~21 days ago
    barcode: '8901234567891',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    price: 350,
    location: 'Shelf B2'
  },
  {
    sku: 'DIN-104',
    name: 'Royal Bone China Dinner Set (32 Pcs)',
    category: 'Dinnerware',
    currentStock: 310,
    dateAdded: '2025-10-10', // ~255 days ago
    barcode: '8901234567892',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    price: 8500,
    location: 'Center Showcase'
  },
  {
    sku: 'TEA-202',
    name: 'Moroccan Ceramic Tea Cup & Saucer Set',
    category: 'Tea & Coffee',
    currentStock: 185,
    dateAdded: '2026-01-15', // ~160 days ago
    barcode: '8901234567893',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80',
    price: 1200,
    location: 'Rack C4'
  },
  {
    sku: 'CUT-089',
    name: 'Gold Plated Stainless Steel Cutlery (24 Pcs)',
    category: 'Cutlery',
    currentStock: 45,
    dateAdded: '2026-05-10', // ~45 days ago
    barcode: '8901234567894',
    image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&w=600&q=80',
    price: 3200,
    location: 'Counter Drawer 1'
  },
  {
    sku: 'BWL-301',
    name: 'Handpainted Opal Serving Bowl Large',
    category: 'Serveware',
    currentStock: 340,
    dateAdded: '2025-11-01', // ~235 days ago
    barcode: '8901234567895',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    price: 950,
    location: 'Rack D2'
  },
  {
    sku: 'MUG-405',
    name: 'Matte Black Espresso Mugs (Set of 4)',
    category: 'Tea & Coffee',
    currentStock: 0,
    dateAdded: '2026-02-20', // ~125 days ago
    barcode: '8901234567896',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    price: 680,
    location: 'Out of Stock'
  },
  {
    sku: 'PLT-509',
    name: 'Nordic Minimalist Dinner Plates (6 Pcs)',
    category: 'Dinnerware',
    currentStock: 120,
    dateAdded: '2026-06-12', // ~14 days ago
    barcode: '8901234567897',
    image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=600&q=80',
    price: 2100,
    location: 'New Arrival Stand'
  },
  {
    sku: 'TRY-612',
    name: 'Acacia Wood Rectangular Serving Tray',
    category: 'Serveware',
    currentStock: 210,
    dateAdded: '2025-08-10', // ~318 days ago
    barcode: '8901234567898',
    image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=600&q=80',
    price: 1850,
    location: 'Rack E1 - Clearance'
  },
  {
    sku: 'CAS-701',
    name: 'Insulated Stainless Steel Casserole 2.5L',
    category: 'Kitchenware',
    currentStock: 8,
    dateAdded: '2026-04-01', // ~85 days ago
    barcode: '8901234567899',
    image: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=600&q=80',
    price: 1650,
    location: 'Shelf F3'
  },
  {
    sku: 'GLS-009',
    name: 'Bohemian Crystal Wine Glasses (Set of 6)',
    category: 'Glassware',
    currentStock: 380,
    dateAdded: '2025-07-20', // ~340 days ago
    barcode: '8901234567900',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    price: 4200,
    location: 'VIP Display Rack'
  },
  {
    sku: 'JAR-802',
    name: 'Airtight Glass Storage Jars with Wooden Lid',
    category: 'Storage',
    currentStock: 195,
    dateAdded: '2026-03-10', // ~107 days ago
    barcode: '8901234567901',
    image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
    price: 550,
    location: 'Rack G2'
  },
  {
    sku: 'DIN-209',
    name: 'Melamine Square Party Plates Set (12 Pcs)',
    category: 'Dinnerware',
    currentStock: 15,
    dateAdded: '2025-06-01', // ~390 days ago
    barcode: '8901234567902',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    price: 1100,
    location: 'Bottom Shelf B4'
  },
  {
    sku: 'TEA-881',
    name: 'Traditional Brass Chai Kettle 1.5L',
    category: 'Tea & Coffee',
    currentStock: 62,
    dateAdded: '2026-06-18', // ~8 days ago
    barcode: '8901234567903',
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80',
    price: 2400,
    location: 'Front Promo Table'
  },
  {
    sku: 'BWL-911',
    name: 'White Ceramic Soup Bowl with Spoon (Set of 6)',
    category: 'Serveware',
    currentStock: 305,
    dateAdded: '2025-12-10', // ~198 days ago
    barcode: '8901234567904',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    price: 1350,
    location: 'Rack D4'
  }
];
