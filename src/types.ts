export type Language = 'en' | 'ar' | 'ku';

export type CategoryKey = string;

export type SubCategoryKey = 'juice' | 'energy' | 'soft' | 'other';

export interface MultilingualText {
  en: string;
  ar: string;
  ku: string;
}

export interface MenuItem {
  id: number;
  category: string;
  subCategory?: SubCategoryKey;
  price: string;
  image: string;
  name: MultilingualText;
  desc: MultilingualText;
}

export interface Category {
  key: string;
  image: string;
  name: MultilingualText;
}

export interface TranslationSet {
  title: string;
  viewMenu: string;
  reserve: string;
  contact: string;
  feedback: string;
  close: string;
  formReserveTitle: string;
  formReserveSubtitle: string;
  formFeedbackTitle: string;
  formFeedbackSubtitle: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
  area: string;
  indoor: string;
  outdoor: string;
  qFood: string;
  qService: string;
  qClean: string;
  qValue: string;
  specialRequests?: string;
  comments: string;
  submit: string;
  submitFeedback: string;
  successMsg: string;
  successSub: string;
  categories: Record<string, string>;
  subCategories: Record<SubCategoryKey, string>;
  currency: string;
}

export type Database = {
  translations: Record<Language, TranslationSet>;
  categoryImages: Record<string, string>;
  menu: MenuItem[];
};
