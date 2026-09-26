import type { LocalizedText } from '../core/localized';

export type ImposterWord = { id: string; word: LocalizedText };
export type ImposterCategory = {
  id: string;
  name: LocalizedText;
  words: ImposterWord[];
};

const w = (id: string, en: string, ar: string): ImposterWord => ({
  id,
  word: { en, ar },
});

/** Bilingual word bank. Every category has at least 8 words so the imposter's guess list works. */
export const IMPOSTER_CATEGORIES: ImposterCategory[] = [
  {
    id: 'food',
    name: { en: 'Egyptian food', ar: 'أكل مصري' },
    words: [
      w('koshari', 'Koshari', 'كشري'),
      w('foul', 'Foul', 'فول'),
      w('taameya', 'Taameya', 'طعمية'),
      w('molokhia', 'Molokhia', 'ملوخية'),
      w('mahshi', 'Mahshi', 'محشي'),
      w('fateer', 'Feteer', 'فطير'),
      w('hawawshi', 'Hawawshi', 'حواوشي'),
      w('om-ali', 'Om Ali', 'أم علي'),
      w('basbousa', 'Basbousa', 'بسبوسة'),
      w('shawarma', 'Shawarma', 'شاورما'),
    ],
  },
  {
    id: 'places',
    name: { en: 'Places in Egypt', ar: 'أماكن في مصر' },
    words: [
      w('pyramids', 'Pyramids', 'الأهرامات'),
      w('alex', 'Alexandria', 'إسكندرية'),
      w('sharm', 'Sharm El Sheikh', 'شرم الشيخ'),
      w('luxor', 'Luxor', 'الأقصر'),
      w('khan', 'Khan El Khalili', 'خان الخليلي'),
      w('siwa', 'Siwa', 'سيوة'),
      w('zamalek', 'Zamalek', 'الزمالك'),
      w('dahab', 'Dahab', 'دهب'),
      w('aswan', 'Aswan', 'أسوان'),
      w('sahel', 'North Coast', 'الساحل'),
    ],
  },
  {
    id: 'animals',
    name: { en: 'Animals', ar: 'حيوانات' },
    words: [
      w('camel', 'Camel', 'جمل'),
      w('cat', 'Cat', 'قطة'),
      w('lion', 'Lion', 'أسد'),
      w('donkey', 'Donkey', 'حمار'),
      w('crocodile', 'Crocodile', 'تمساح'),
      w('elephant', 'Elephant', 'فيل'),
      w('giraffe', 'Giraffe', 'زرافة'),
      w('dolphin', 'Dolphin', 'دولفين'),
      w('penguin', 'Penguin', 'بطريق'),
      w('monkey', 'Monkey', 'قرد'),
    ],
  },
  {
    id: 'jobs',
    name: { en: 'Jobs', ar: 'وظايف' },
    words: [
      w('doctor', 'Doctor', 'دكتور'),
      w('teacher', 'Teacher', 'مدرس'),
      w('pilot', 'Pilot', 'طيار'),
      w('chef', 'Chef', 'شيف'),
      w('police', 'Police officer', 'ظابط'),
      w('engineer', 'Engineer', 'مهندس'),
      w('barber', 'Barber', 'حلاق'),
      w('taxi', 'Taxi driver', 'سواق تاكسي'),
      w('footballer', 'Footballer', 'لاعب كورة'),
      w('dentist', 'Dentist', 'دكتور أسنان'),
    ],
  },
  {
    id: 'home',
    name: { en: 'Things at home', ar: 'حاجات في البيت' },
    words: [
      w('fridge', 'Fridge', 'تلاجة'),
      w('tv', 'TV', 'تليفزيون'),
      w('sofa', 'Sofa', 'كنبة'),
      w('mirror', 'Mirror', 'مراية'),
      w('fan', 'Fan', 'مروحة'),
      w('pillow', 'Pillow', 'مخدة'),
      w('washer', 'Washing machine', 'غسالة'),
      w('kettle', 'Kettle', 'كاتل'),
      w('carpet', 'Carpet', 'سجادة'),
      w('stove', 'Stove', 'بوتاجاز'),
    ],
  },
  {
    id: 'sports',
    name: { en: 'Sports', ar: 'رياضة' },
    words: [
      w('football', 'Football', 'كورة قدم'),
      w('tennis', 'Tennis', 'تنس'),
      w('swimming', 'Swimming', 'سباحة'),
      w('boxing', 'Boxing', 'ملاكمة'),
      w('basketball', 'Basketball', 'باسكت'),
      w('squash', 'Squash', 'اسكواش'),
      w('handball', 'Handball', 'كورة يد'),
      w('karate', 'Karate', 'كاراتيه'),
      w('padel', 'Padel', 'بادل'),
      w('cycling', 'Cycling', 'عجل'),
    ],
  },
  {
    id: 'occasions',
    name: { en: 'Occasions', ar: 'مناسبات' },
    words: [
      w('wedding', 'Wedding', 'فرح'),
      w('engagement', 'Engagement', 'خطوبة'),
      w('birthday', 'Birthday', 'عيد ميلاد'),
      w('ramadan', 'Ramadan iftar', 'فطار رمضان'),
      w('eid', 'Eid', 'العيد'),
      w('graduation', 'Graduation', 'تخرج'),
      w('sboo3', 'Sebou', 'سبوع'),
      w('sham-nessim', 'Sham El Nessim', 'شم النسيم'),
      w('new-year', 'New Year', 'راس السنة'),
      w('picnic', 'Picnic', 'رحلة'),
    ],
  },
];
