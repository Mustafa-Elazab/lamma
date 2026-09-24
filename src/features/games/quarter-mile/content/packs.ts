import type { QuarterMilePack } from '../../core/types';

function l(en: string, ar: string) {
  return { en, ar };
}

export const QUARTER_MILE_PACKS: QuarterMilePack[] = [
  {
    id: 'german-cars',
    name: l('German cars', 'عربيات ألماني'),
    items: [
      { id: 'passat-cc', name: l('Passat CC', 'باسات سي سي'), score: 62 },
      { id: 'golf-4', name: l('Golf 4', 'جولف 4'), score: 48 },
      { id: 'e30', name: l('BMW E30', 'بي إم دبليو E30'), score: 70 },
      { id: 'x6', name: l('BMW X6', 'بي إم دبليو X6'), score: 78 },
      { id: '911-turbo-s', name: l('911 Turbo S', '٩١١ توربو إس'), score: 98 },
      { id: 'g63', name: l('G63', 'جي ٦٣'), score: 92 },
      { id: 'm5-comp', name: l('M5 Competition', 'إم ٥ كومبيتيشن'), score: 94 },
      { id: 'mokka', name: l('Opel Mokka', 'أوبل موكا'), score: 35 },
      { id: 'q8', name: l('Audi Q8', 'أودي Q8'), score: 84 },
      { id: 'astra-turbo', name: l('Astra Turbo', 'أسترا توربو'), score: 44 },
      { id: 'taycan', name: l('Taycan', 'تايكان'), score: 90 },
      { id: 'amg-gt', name: l('AMG GT', 'إيه إم جي جي تي'), score: 93 },
      { id: 'gls-600', name: l('GLS 600', 'جي إل إس ٦٠٠'), score: 88 },
      { id: 'rsq8', name: l('RS Q8', 'آر إس كيو ٨'), score: 91 },
      { id: 'a3', name: l('Audi A3', 'أودي A3'), score: 52 },
      { id: 'panamera', name: l('Panamera', 'باناميرا'), score: 86 },
      { id: 'cla-300', name: l('CLA 300', 'سي إل إيه ٣٠٠'), score: 58 },
      { id: 'r8', name: l('Audi R8', 'أودي آر ٨'), score: 96 },
    ],
  },
];
