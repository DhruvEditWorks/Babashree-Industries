import { prisma } from '@/lib/prisma';

export const defaultSite = {
  companyName: 'Baba Shree Industries',
  logoUrl: '', logoWidth: 40, logoHeight: 40, logoOffsetX: 0,
  tagline: 'Metal hooks & industrial fasteners',
  headerCtaText: 'Request a quote', headerCtaHref: '/contact', showPhone: true, stickyHeader: true,
  socialLinks: { linkedin: '', facebook: '', instagram: '' },
  description: 'A manufacturer of metal hooks, roofing nails, galvanized link chains and customized fasteners for industrial, construction and solar mounting applications.',
  address: '337/3, Tigariya Badshah, Sector-A, Sanwer Road, Indore, Madhya Pradesh, India',
  phone1: '+91 9617999539', phone2: '+91 9340999539', whatsapp: '919617999539', email: '', mapUrl: '',
  heroTitle: 'Precision-made metal hooks & industrial fasteners',
  heroDescription: 'Metal fastening solutions for industrial, construction and solar mounting applications. Explore our product range or tell us what you need.',
  heroImage: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1600&q=85',
  heroPrimaryText: 'Explore products', heroPrimaryHref: '/products', heroSecondaryText: 'Request a quote', heroSecondaryHref: '/contact',
  navItems: [{label:'Home',href:'/'},{label:'About us',href:'/about'},{label:'Products',href:'/products'},{label:'Industries served',href:'/industries'},{label:'Contact',href:'/contact'}],
  footerDescription: 'Metal hooks, industrial fasteners and customized components from Indore, Madhya Pradesh.',
  footerLinks: [{label:'About us',href:'/about'},{label:'Products',href:'/products'},{label:'Industries served',href:'/industries'},{label:'Contact us',href:'/contact'}], privacyLabel: 'Privacy policy', termsLabel: 'Terms & conditions',
  featuredSectionTitle: 'Fastening solutions for demanding work',
  customizationTitle: 'Need a customized size?',
  customizationText: 'Share your dimensions and requirements with our team. We welcome enquiries for customized hooks and metal components.',
  industries: ['Solar mounting & installation','Construction & roofing','Industrial fabrication','Hardware distribution'],
  homepageOrder: ['hero','categories','featured','why','customization','industries','contact'],
  showCategories: true, showFeatured: true, showWhy: true, showIndustries: true,
};

export async function getSite() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
    return { ...defaultSite, ...(row?.value as Partial<typeof defaultSite> ?? {}) };
  } catch { return defaultSite; }
}
export async function getPublicProducts(where: object = {}) {
  try { return await prisma.product.findMany({ where: { status: 'PUBLISHED', ...where }, include: { category: true, images: { orderBy: { sortOrder: 'asc' } }, specs: { orderBy: { sortOrder: 'asc' } } }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }); } catch { return []; }
}
