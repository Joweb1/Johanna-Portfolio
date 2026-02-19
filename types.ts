export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  details: string[];
  iconType: 'clock' | 'network' | 'chart';
  image: string;
}

export interface WhyMeItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface NavItem {
  label: string;
  href: string;
}