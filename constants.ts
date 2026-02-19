import { ServiceItem, WhyMeItem, NavItem } from './types';

export const APP_NAME = "Johanna Uroh";

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Why Me", href: "/why-me" },
  { label: "Success", href: "/success" },
  { label: "Contact", href: "/contact" },
];

export const ACCENT_COLORS = [
  { name: 'Gold', value: '#C9A24D', light: '#E5C579' },
  { name: 'Pink', value: '#FF0080', light: '#FF4DB2' },
  { name: 'Sea Green', value: '#20B2AA', light: '#48D1CC' },
  { name: 'Blush', value: '#E34234', light: '#F08080' },
  { name: 'Purple', value: '#9D00FF', light: '#B966FF' },
  { name: 'Red', value: '#DC143C', light: '#FF6B6B' },
  { name: 'Yellow', value: '#FFD700', light: '#FFE55C' },
];

export const HERO_CONTENT = {
  headline: "Growth and Impact.",
  subheadline: "I’m Johanna Uroh—a dedicated Virtual Assistant, Social Media Manager, and Stock Trading Coach. I help busy entrepreneurs save time, grow their brand, and achieve financial success.",
  cta: "Let's Collaborate",
  profileImage: "https://raw.githubusercontent.com/Joweb1/Jovibe-images/refs/heads/main/Generated%20Image%20February%2005%2C%202026%20-%2010_28AM.jpg"
};

export const SERVICES: ServiceItem[] = [
  {
    id: "va",
    title: "Virtual Assistance",
    description: "Freedom to Focus on What Matters.",
    details: [
      "Inbox & Calendar Management",
      "Administrative Support",
      "Client Communications",
      "Data Entry & Research"
    ],
    iconType: "clock",
    image: "https://raw.githubusercontent.com/Joweb1/Jovibe-images/refs/heads/main/Generated%20Image%20February%2005%2C%202026%20-%2010_47AM.png"
  },
  {
    id: "smm",
    title: "Social Media Management",
    description: "Build Your Brand, Engage Your Audience.",
    details: [
      "Content Strategy & Creation",
      "Community Engagement",
      "Analytics & Growth Tracking",
      "Platform Management (IG, FB, TikTok)"
    ],
    iconType: "network",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "trading",
    title: "Stock Trading Coaching",
    description: "Trade with Confidence.",
    details: [
      "Market Analysis Mentorship",
      "Risk Management Strategies",
      "Portfolio Building",
      "Decision Making Discipline"
    ],
    iconType: "chart",
    image: "https://raw.githubusercontent.com/Joweb1/Jovibe-images/refs/heads/main/Generated%20Image%20February%2005%2C%202026%20-%2011_00AM.jpg"
  }
];

export const WHY_ME_ITEMS: WhyMeItem[] = [
  {
    id: "01",
    title: "Client-Focused",
    description: "Your goals drive everything I do. I listen, understand, and tailor solutions to your needs.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "02",
    title: "Results-Oriented",
    description: "I deliver measurable outcomes that move your business or trading journey forward.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "03",
    title: "Reliable & Organized",
    description: "Deadlines are sacred, and communication is clear. You’ll always know where we stand.",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "04",
    title: "Adaptable & Strategic",
    description: "I thrive in dynamic environments and adjust strategies to ensure your success.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: "05",
    title: "Mentorship Mindset",
    description: "I don’t just manage tasks—I educate, guide, and empower you or your team to grow.",
    image: "https://raw.githubusercontent.com/Joweb1/Jovibe-images/refs/heads/main/Generated%20Image%20February%2005%2C%202026%20-%2011_00AM.jpg"
  }
];

export const SUCCESS_STORY = {
  title: "A Client Success Story",
  content: "One of my clients came to me overwhelmed by managing daily operations and growing their online brand. Within weeks, I streamlined their scheduling, created a content strategy, and coached them on stock investments. Today, they’ve reclaimed hours every week, doubled their social media engagement, and feel confident making trading decisions."
};