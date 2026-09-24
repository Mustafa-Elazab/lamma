const l = (en, ar) => ({ en, ar });

/** Auto-expanded hard trivia bank for seed-games-content.js */
const triviaCategories = [
  { id: 'general', name: l('General Knowledge', 'معلومات عامة') },
  { id: 'movies', name: l('Movies & TV', 'أفلام ومسلسلات') },
  { id: 'sports', name: l('Sports', 'رياضة') },
  { id: 'egypt', name: l('Egypt & the Arab World', 'مصر والعالم العربي') },
  { id: 'science', name: l('Science & Nature', 'علوم وطبيعة') },
  { id: 'history', name: l('World History', 'تاريخ العالم') },
  { id: 'geography', name: l('Geography', 'جغرافيا') },
  { id: 'tech', name: l('Technology', 'تكنولوجيا') },
  { id: 'music', name: l('Music', 'موسيقى') },
  { id: 'food', name: l('Food & Culture', 'طعام وثقافة') }
];

/** [id, categoryId, question, options, correctIndex] */
const triviaQuestions = [
  [
    'science-1',
    'science',
    l('What particle mediates the electromagnetic force?', 'ما الجسيم الحامل للقوة الكهرومغناطيسية؟'),
    [
      l('Gluon', 'الغلوون'),
      l('Photon', 'الفوتون'),
      l('Graviton', 'الغرافيتون'),
      l('Neutrino', 'النيوترينو')
    ],
    1,
  ],
  [
    'science-2',
    'science',
    l('Approximate speed of light in vacuum?', 'ما السرعة التقريبية للضوء في الفراغ؟'),
    [
      l('3×10^5 km/s', '٣×١٠^٥ كم/ث'),
      l('3×10^8 m/s', '٣×١٠^٨ م/ث'),
      l('3×10^6 m/s', '٣×١٠^٦ م/ث'),
      l('300 km/s', '٣٠٠ كم/ث')
    ],
    1,
  ],
  [
    'science-3',
    'science',
    l('Which organelle is the primary site of ATP synthesis in eukaryotes?', 'أين يحدث تصنيع ATP الأساسي في حقيقيات النوى؟'),
    [
      l('Ribosome', 'الريبوسوم'),
      l('Golgi apparatus', 'جهاز غولجي'),
      l('Mitochondrion', 'الميتوكوندريا'),
      l('Lysosome', 'الليسوسوم')
    ],
    2,
  ],
  [
    'science-4',
    'science',
    l('What is Avogadro’s number approximately?', 'ما قيمة عدد أفوجادرو تقريباً؟'),
    [
      l('6.02×10^23', '٦.٠٢×١٠^٢٣'),
      l('3.14×10^8', '٣.١٤×١٠^٨'),
      l('1.6×10^-19', '١.٦×١٠^-١٩'),
      l('9.8×10^9', '٩.٨×١٠^٩')
    ],
    0,
  ],
  [
    'science-5',
    'science',
    l('CRISPR-Cas9 is primarily used for what?', 'يُستخدم CRISPR-Cas9 أساساً لـ؟'),
    [
      l('DNA sequencing only', 'تسلسل الحمض النووي فقط'),
      l('Gene editing', 'تحرير الجينات'),
      l('Protein folding prediction', 'توقع طي البروتين'),
      l('Vaccine storage', 'تخزين اللقاحات')
    ],
    1,
  ],
  [
    'science-6',
    'science',
    l('Which gas makes up most of Earth’s atmosphere by volume?', 'ما الغاز الأكثر في غلاف الأرض حجماً؟'),
    [
      l('Oxygen', 'الأكسجين'),
      l('Carbon dioxide', 'ثاني أكسيد الكربون'),
      l('Nitrogen', 'النيتروجين'),
      l('Argon', 'الأرجون')
    ],
    2,
  ],
  [
    'science-7',
    'science',
    l('What does a pH of 2 indicate compared to pH 5?', 'ماذا يعني الرقم الهيدروجيني 2 مقارنة بـ 5؟'),
    [
      l('1000× more acidic', 'أكثر حموضة بألف مرة'),
      l('3× more acidic', 'أكثر حموضة بثلاث مرات'),
      l('More basic', 'أكثر قاعدية'),
      l('Neutral', 'متعادل')
    ],
    0,
  ],
  [
    'science-8',
    'science',
    l('Which planet has the Great Red Spot?', 'أي كوكب فيه البقعة الحمراء العظمى؟'),
    [
      l('Saturn', 'زحل'),
      l('Jupiter', 'المشتري'),
      l('Neptune', 'نبتون'),
      l('Mars', 'المريخ')
    ],
    1,
  ],
  [
    'science-9',
    'science',
    l('DNA base pairing: adenine pairs with?', 'في الحمض النووي يقترن الأدينين مع؟'),
    [
      l('Guanine', 'الغوانين'),
      l('Cytosine', 'السيتوزين'),
      l('Thymine', 'الثايمين'),
      l('Uracil', 'اليوراسيل')
    ],
    2,
  ],
  [
    'science-10',
    'science',
    l('What is the SI unit of electric resistance?', 'ما وحدة مقاومة الكهرباء في النظام الدولي؟'),
    [
      l('Volt', 'فولت'),
      l('Ampere', 'أمبير'),
      l('Ohm', 'أوم'),
      l('Watt', 'واط')
    ],
    2,
  ],
  [
    'science-11',
    'science',
    l('Photosynthesis’s light-dependent reactions occur mainly in the?', 'تحدث تفاعلات البناء الضوئي المعتمدة على الضوء أساساً في؟'),
    [
      l('Stroma', 'الستروما'),
      l('Thylakoid membrane', 'غشاء الثايلاكويد'),
      l('Cell wall', 'جدار الخلية'),
      l('Cytoplasm', 'السيتوبلازم')
    ],
    1,
  ],
  [
    'science-12',
    'science',
    l('Half-life refers to?', 'يشير عمر النصف إلى؟'),
    [
      l('Time for half a sample to decay', 'الزمن لنصف العينة حتى تتحلل'),
      l('Half the boiling point', 'نصف درجة الغليان'),
      l('Orbit period/2', 'نصف فترة المدار'),
      l('Time to double mass', 'زمن مضاعفة الكتلة')
    ],
    0,
  ],
  [
    'history-1',
    'history',
    l('In which year did World War I begin?', 'في أي سنة بدأت الحرب العالمية الأولى؟'),
    [
      l('1914', '١٩١٤'),
      l('1918', '١٩١٨'),
      l('1939', '١٩٣٩'),
      l('1905', '١٩٠٥')
    ],
    0,
  ],
  [
    'history-2',
    'history',
    l('Who was the first emperor of a unified China (Qin dynasty)?', 'من أول إمبراطور للصين الموحدة (تشين)؟'),
    [
      l('Confucius', 'كونفوشيوس'),
      l('Qin Shi Huang', 'تشين شي هوانغ'),
      l('Sun Yat-sen', 'سون يات سن'),
      l('Kublai Khan', 'قوبلاي خان')
    ],
    1,
  ],
  [
    'history-3',
    'history',
    l('The Magna Carta was sealed in which century?', 'في أي قرن وُقّعت الماغنا كارتا؟'),
    [
      l('10th', 'العاشر'),
      l('12th', 'الثاني عشر'),
      l('13th', 'الثالث عشر'),
      l('15th', 'الخامس عشر')
    ],
    2,
  ],
  [
    'history-4',
    'history',
    l('Which empire built Machu Picchu?', 'أي إمبراطورية بنت ماتشو بيتشو؟'),
    [
      l('Aztec', 'الأزتك'),
      l('Maya', 'المايا'),
      l('Inca', 'الإنكا'),
      l('Olmec', 'الأولمك')
    ],
    2,
  ],
  [
    'history-5',
    'history',
    l('The fall of Constantinople to the Ottomans was in?', 'سقطت القسطنطينية بيد العثمانيين عام؟'),
    [
      l('1299', '١٢٩٩'),
      l('1453', '١٤٥٣'),
      l('1520', '١٥٢٠'),
      l('1683', '١٦٨٣')
    ],
    1,
  ],
  [
    'history-6',
    'history',
    l('Who wrote \'The Communist Manifesto\' with Engels?', 'من كتب البيان الشيوعي مع إنجلز؟'),
    [
      l('Lenin', 'لينين'),
      l('Marx', 'ماركس'),
      l('Trotsky', 'تروتسكي'),
      l('Stalin', 'ستالين')
    ],
    1,
  ],
  [
    'history-7',
    'history',
    l('The Rosetta Stone enabled deciphering of?', 'ساعد حجر رشيد في فك رموز؟'),
    [
      l('Cuneiform', 'المسمارية'),
      l('Linear B', 'الخطية ب'),
      l('Egyptian hieroglyphs', 'الهيروغليفية المصرية'),
      l('Sanskrit', 'السنسكريتية')
    ],
    2,
  ],
  [
    'history-8',
    'history',
    l('Which conference redrew much of Europe after WWII?', 'أي مؤتمر أعاد رسم أوروبا بعد الحرب العالمية الثانية؟'),
    [
      l('Yalta / Potsdam', 'يالطا / بوتسدام'),
      l('Versailles only', 'فرساي فقط'),
      l('Congress of Vienna', 'مؤتمر فيينا'),
      l('Treaty of Trianon alone', 'تريانون وحده')
    ],
    0,
  ],
  [
    'history-9',
    'history',
    l('The Meiji Restoration modernized which country?', 'حدثت استعادة ميجي في أي بلد؟'),
    [
      l('China', 'الصين'),
      l('Korea', 'كوريا'),
      l('Japan', 'اليابان'),
      l('Thailand', 'تايلاند')
    ],
    2,
  ],
  [
    'history-10',
    'history',
    l('Who led the Haitian Revolution to independence?', 'من قاد الثورة الهايتية نحو الاستقلال؟'),
    [
      l('Toussaint Louverture / Dessalines', 'توسان لوفرتور / ديسالين'),
      l('Simón Bolívar', 'سيمون بوليفار'),
      l('José de San Martín', 'خوسيه دي سان مارتين'),
      l('Miguel Hidalgo', 'ميغيل هيدالغو')
    ],
    0,
  ],
  [
    'history-11',
    'history',
    l('The Berlin Wall fell in which year?', 'سقط جدار برلين في أي سنة؟'),
    [
      l('1985', '١٩٨٥'),
      l('1989', '١٩٨٩'),
      l('1991', '١٩٩١'),
      l('1979', '١٩٧٩')
    ],
    1,
  ],
  [
    'history-12',
    'history',
    l('Which ancient library was associated with Alexandria?', 'أي مكتبة قديمة ارتبطت بالإسكندرية؟'),
    [
      l('Library of Pergamum', 'مكتبة برغامون'),
      l('Library of Alexandria', 'مكتبة الإسكندرية'),
      l('House of Wisdom only', 'بيت الحكمة فقط'),
      l('Nalanda', 'نالاندا')
    ],
    1,
  ],
  [
    'geo-1',
    'geography',
    l('Which river has the largest discharge by volume?', 'أي نهر أكبر تصريفاً حجماً؟'),
    [
      l('Nile', 'النيل'),
      l('Amazon', 'الأمازون'),
      l('Yangtze', 'اليانغتسي'),
      l('Congo', 'الكونغو')
    ],
    1,
  ],
  [
    'geo-2',
    'geography',
    l('What is the capital of Kazakhstan (current)?', 'ما عاصمة كازاخستان الحالية؟'),
    [
      l('Almaty', 'ألماتي'),
      l('Astana (Nur-Sultan)', 'أستانا'),
      l('Tashkent', 'طشقند'),
      l('Bishkek', 'بيشكيك')
    ],
    1,
  ],
  [
    'geo-3',
    'geography',
    l('The Strait of Hormuz connects the Persian Gulf to the?', 'يربط مضيق هرمز الخليج العربي بـ؟'),
    [
      l('Red Sea', 'البحر الأحمر'),
      l('Gulf of Oman / Arabian Sea', 'خليج عمان / بحر العرب'),
      l('Mediterranean', 'البحر المتوسط'),
      l('Black Sea', 'البحر الأسود')
    ],
    1,
  ],
  [
    'geo-4',
    'geography',
    l('Which desert is the largest hot desert?', 'ما أكبر صحراء حارة؟'),
    [
      l('Gobi', 'غوبي'),
      l('Arabian', 'العربية'),
      l('Sahara', 'الصحراء الكبرى'),
      l('Kalahari', 'كالاهاري')
    ],
    2,
  ],
  [
    'geo-5',
    'geography',
    l('Mount Kilimanjaro is located in?', 'يقع جبل كليمنجارو في؟'),
    [
      l('Kenya', 'كينيا'),
      l('Tanzania', 'تنزانيا'),
      l('Ethiopia', 'إثيوبيا'),
      l('Uganda', 'أوغندا')
    ],
    1,
  ],
  [
    'geo-6',
    'geography',
    l('Which country has the most time zones (including territories)?', 'أي دولة لديها أكبر عدد من المناطق الزمنية (مع الأقاليم)؟'),
    [
      l('USA', 'الولايات المتحدة'),
      l('Russia', 'روسيا'),
      l('France', 'فرنسا'),
      l('China', 'الصين')
    ],
    2,
  ],
  [
    'geo-7',
    'geography',
    l('Lake Baikal is famous for being the world’s?', 'بحيرة بايكال مشهورة بأنها؟'),
    [
      l('Largest by area', 'الأكبر مساحة'),
      l('Deepest freshwater lake', 'أعمق بحيرة عذبة'),
      l('Saltiest lake', 'الأكثر ملوحة'),
      l('Highest lake', 'الأعلى ارتفاعاً')
    ],
    1,
  ],
  [
    'geo-8',
    'geography',
    l('The Tropic of Cancer is at approximately?', 'مدار السرطان تقريباً عند؟'),
    [
      l('0°', '٠°'),
      l('23.5° N', '٢٣.٥° شمالاً'),
      l('23.5° S', '٢٣.٥° جنوباً'),
      l('66.5° N', '٦٦.٥° شمالاً')
    ],
    1,
  ],
  [
    'geo-9',
    'geography',
    l('Which African capital sits at the highest elevation among major ones?', 'أي عاصمة أفريقية من الأعلى ارتفاعاً؟'),
    [
      l('Nairobi', 'نيروبي'),
      l('Addis Ababa', 'أديس أبابا'),
      l('Cairo', 'القاهرة'),
      l('Lagos', 'لاغوس')
    ],
    1,
  ],
  [
    'geo-10',
    'geography',
    l('The Andes are primarily on which continent?', 'جبال الأنديز أساساً في أي قارة؟'),
    [
      l('Africa', 'أفريقيا'),
      l('Asia', 'آسيا'),
      l('South America', 'أمريكا الجنوبية'),
      l('Europe', 'أوروبا')
    ],
    2,
  ],
  [
    'tech-1',
    'tech',
    l('What does HTTP stand for?', 'ماذا تعني HTTP؟'),
    [
      l('HyperText Transfer Protocol', 'بروتوكول نقل النص التشعبي'),
      l('High Transfer Text Protocol', 'بروتوكول نقل نص عالي'),
      l('Host Tunnel Transport Protocol', 'بروتوكول نفق المضيف'),
      l('Hyperlink Text Transmission Process', 'عملية إرسال نص الروابط')
    ],
    0,
  ],
  [
    'tech-2',
    'tech',
    l('Which company created the TypeScript language?', 'أي شركة طوّرت لغة TypeScript؟'),
    [
      l('Google', 'جوجل'),
      l('Facebook', 'فيسبوك'),
      l('Microsoft', 'مايكروسوفت'),
      l('Apple', 'أبل')
    ],
    2,
  ],
  [
    'tech-3',
    'tech',
    l('In Big-O, binary search on a sorted array is typically?', 'في Big-O، البحث الثنائي على مصفوفة مرتبة عادة؟'),
    [
      l('O(n)', 'O(n)'),
      l('O(log n)', 'O(log n)'),
      l('O(n²)', 'O(n²)'),
      l('O(1)', 'O(1)')
    ],
    1,
  ],
  [
    'tech-4',
    'tech',
    l('IPv6 addresses are how many bits long?', 'كم بت طول عنوان IPv6؟'),
    [
      l('32', '٣٢'),
      l('64', '٦٤'),
      l('128', '١٢٨'),
      l('256', '٢٥٦')
    ],
    2,
  ],
  [
    'tech-5',
    'tech',
    l('Git command to create a new branch and switch to it?', 'أمر Git لإنشاء فرع جديد والانتقال إليه؟'),
    [
      l('git branch -m', 'git branch -m'),
      l('git checkout -b / git switch -c', 'git checkout -b / git switch -c'),
      l('git merge', 'git merge'),
      l('git rebase', 'git rebase')
    ],
    1,
  ],
  [
    'tech-6',
    'tech',
    l('Which protocol is connection-oriented and reliable by design?', 'أي بروتوكول موجه للاتصال وموثوق بالتصميم؟'),
    [
      l('UDP', 'UDP'),
      l('TCP', 'TCP'),
      l('ICMP', 'ICMP'),
      l('ARP', 'ARP')
    ],
    1,
  ],
  [
    'tech-7',
    'tech',
    l('React Native’s New Architecture uses which system for native modules?', 'تستخدم بنية React Native الجديدة أي نظام للوحدات الأصلية؟'),
    [
      l('Bridge only', 'الجسر فقط'),
      l('JSI / TurboModules', 'JSI / TurboModules'),
      l('WebSockets', 'WebSockets'),
      l('SOAP', 'SOAP')
    ],
    1,
  ],
  [
    'tech-8',
    'tech',
    l('SHA-256 produces a digest of how many bits?', 'ينتج SHA-256 ملخصاً بطول كم بت؟'),
    [
      l('128', '١٢٨'),
      l('160', '١٦٠'),
      l('256', '٢٥٦'),
      l('512', '٥١٢')
    ],
    2,
  ],
  [
    'tech-9',
    'tech',
    l('Kubernetes is primarily used for?', 'يُستخدم Kubernetes أساساً لـ؟'),
    [
      l('Container orchestration', 'إدارة الحاويات'),
      l('Relational databases', 'قواعد بيانات علائقية'),
      l('Image editing', 'تحرير الصور'),
      l('Email servers only', 'خوادم البريد فقط')
    ],
    0,
  ],
  [
    'tech-10',
    'tech',
    l('What does ACID stand for in databases?', 'ماذا تعني ACID في قواعد البيانات؟'),
    [
      l('Atomicity, Consistency, Isolation, Durability', 'الذرية والاتساق والعزل والمتانة'),
      l('Access, Control, Index, Data', 'الوصول والتحكم والفهرس والبيانات'),
      l('Array, Cache, Index, Disk', 'مصفوفة وذاكرة وفهرس وقرص'),
      l('Async, Concurrent, Idempotent, Distributed', 'غير متزامن ومتزامن وعديم الأثر وموزع')
    ],
    0,
  ],
  [
    'music-1',
    'music',
    l('How many symphonies did Beethoven complete?', 'كم سيمفونية أكمل بيتهوفن؟'),
    [
      l('5', '٥'),
      l('7', '٧'),
      l('9', '٩'),
      l('12', '١٢')
    ],
    2,
  ],
  [
    'music-2',
    'music',
    l('A standard guitar (standard tuning) has how many strings?', 'كم وتراً للجيتار القياسي؟'),
    [
      l('4', '٤'),
      l('5', '٥'),
      l('6', '٦'),
      l('7', '٧')
    ],
    2,
  ],
  [
    'music-3',
    'music',
    l('Which scale has no sharps or flats in its key signature?', 'أي سلم بلا علامات رفع أو خفض في مفتاحه؟'),
    [
      l('G major', 'صول الكبير'),
      l('C major', 'دو الكبير'),
      l('D major', 'ري الكبير'),
      l('F major', 'فا الكبير')
    ],
    1,
  ],
  [
    'music-4',
    'music',
    l('The oud is most closely associated with music of?', 'يرتبط العود أكثر بموسيقى؟'),
    [
      l('The Middle East / Arab world', 'الشرق الأوسط / العالم العربي'),
      l('Scotland only', 'اسكتلندا فقط'),
      l('Japan only', 'اليابان فقط'),
      l('Brazil only', 'البرازيل فقط')
    ],
    0,
  ],
  [
    'music-5',
    'music',
    l('Tempo marking \'Allegro\' generally means?', 'تشير Allegro عادة إلى؟'),
    [
      l('Very slow', 'بطيء جداً'),
      l('Fast / lively', 'سريع / مفعم'),
      l('Soft dynamics', 'ديناميكية خافتة'),
      l('Repeat section', 'إعادة مقطع')
    ],
    1,
  ],
  [
    'music-6',
    'music',
    l('Which Beatles album features \'A Day in the Life\'?', 'أي ألبوم لفرقة البيتلز يضم A Day in the Life؟'),
    [
      l('Abbey Road', 'آبي رود'),
      l('Sgt. Pepper’s Lonely Hearts Club Band', 'سرجنت بيبر'),
      l('Let It Be', 'ليت إت بي'),
      l('Help!', 'هيلب')
    ],
    1,
  ],
  [
    'music-7',
    'music',
    l('A perfect fifth spans how many semitones?', 'كم نصف درجة في الخامسة التامة؟'),
    [
      l('5', '٥'),
      l('6', '٦'),
      l('7', '٧'),
      l('8', '٨')
    ],
    2,
  ],
  [
    'music-8',
    'music',
    l('Umm Kulthum is most famous as a?', 'أم كلثوم أشهر ما عُرفت به؟'),
    [
      l('Egyptian singer', 'مغنية مصرية'),
      l('Spanish guitarist', 'عازفة جيتار إسبانية'),
      l('French pianist', 'عازفة بيانو فرنسية'),
      l('Turkish poet only', 'شاعرة تركية فقط')
    ],
    0,
  ],
  [
    'food-1',
    'food',
    l('Umami is often associated with which compound?', 'يرتبط طعم أومامي غالباً بأي مركب؟'),
    [
      l('Sucrose', 'السكروز'),
      l('Glutamate', 'الغلوتامات'),
      l('Caffeine', 'الكافيين'),
      l('Ethanol', 'الإيثانول')
    ],
    1,
  ],
  [
    'food-2',
    'food',
    l('Sourdough rises primarily because of?', 'يرتفع خبز العجين المخمر أساساً بسبب؟'),
    [
      l('Baking powder only', 'البيكنج باودر فقط'),
      l('Wild yeast and lactic bacteria', 'خميرة برية وبكتيريا لبنية'),
      l('Eggs alone', 'البيض وحده'),
      l('Oil fermentation', 'تخمر الزيت')
    ],
    1,
  ],
  [
    'food-3',
    'food',
    l('Which spice comes from the stigma of Crocus sativus?', 'أي توابل تأتي من مياسم زعفران Crocus sativus؟'),
    [
      l('Turmeric', 'الكركم'),
      l('Saffron', 'الزعفران'),
      l('Paprika', 'البابريكا'),
      l('Cardamom', 'الهيل')
    ],
    1,
  ],
  [
    'food-4',
    'food',
    l('Kimchi is most traditionally associated with?', 'يرتبط الكيمتشي تقليدياً بـ؟'),
    [
      l('Japan', 'اليابان'),
      l('Korea', 'كوريا'),
      l('Thailand', 'تايلاند'),
      l('Vietnam', 'فيتنام')
    ],
    1,
  ],
  [
    'food-5',
    'food',
    l('What is the main grain in traditional risotto?', 'ما الحبوب الأساسية في الريزوتو التقليدي؟'),
    [
      l('Basmati', 'بسمتي'),
      l('Arborio / carnaroil-type rice', 'أربوريو / أرز مناسب'),
      l('Quinoa', 'الكينوا'),
      l('Bulgur', 'البرغل')
    ],
    1,
  ],
  [
    'food-6',
    'food',
    l('Pasteurization was named after?', 'سُميت البسترة نسبة إلى؟'),
    [
      l('Pasteur', 'باستير'),
      l('Newton', 'نيوتن'),
      l('Curie', 'كوري'),
      l('Darwin', 'داروين')
    ],
    0,
  ],
  [
    'food-7',
    'food',
    l('Dark chocolate’s bitterness partly comes from?', 'مرارة الشوكولاتة الداكنة تعود جزئياً إلى؟'),
    [
      l('Theobromine / cocoa solids', 'الثيوبرومين / مواد الكاكاو'),
      l('Vitamin C only', 'فيتامين سي فقط'),
      l('Lactose only', 'اللاكتوز فقط'),
      l('Salt crystals', 'بلورات الملح')
    ],
    0,
  ],
  [
    'food-8',
    'food',
    l('Espresso is extracted under approximately?', 'يُستخرج الإسبريسو تقريباً تحت؟'),
    [
      l('1 bar', 'بار واحد'),
      l('9 bars', '٩ بار'),
      l('50 bars', '٥٠ بار'),
      l('Atmospheric pressure only', 'الضغط الجوي فقط')
    ],
    1,
  ],
  [
    'general-h1',
    'general',
    l('What is the only even prime number?', 'ما العدد الأولي الزوجي الوحيد؟'),
    [
      l('0', '٠'),
      l('1', '١'),
      l('2', '٢'),
      l('4', '٤')
    ],
    2,
  ],
  [
    'general-h2',
    'general',
    l('How many degrees are in the interior angles of a triangle combined?', 'كم مجموع زوايا المثلث الداخلية؟'),
    [
      l('90', '٩٠'),
      l('180', '١٨٠'),
      l('270', '٢٧٠'),
      l('360', '٣٦٠')
    ],
    1,
  ],
  [
    'general-h3',
    'general',
    l('Which blood type is often called the universal donor (red cells)?', 'أي فصيلة دم تُدعى المتبرع العام (كريات حمراء)؟'),
    [
      l('AB+', 'AB+'),
      l('O-', 'O-'),
      l('A+', 'A+'),
      l('B-', 'B-')
    ],
    1,
  ],
  [
    'general-h4',
    'general',
    l('The Nobel Prizes were established by the will of?', 'أُنشئت جوائز نوبل بوصية؟'),
    [
      l('Alfred Nobel', 'ألفريد نوبل'),
      l('Andrew Carnegie', 'أندرو كارنيغي'),
      l('John Rockefeller', 'جون روكفلر'),
      l('Marie Curie', 'ماري كوري')
    ],
    0,
  ],
  [
    'general-h5',
    'general',
    l('What language family does Arabic belong to?', 'إلى أي أسرة لغوية تنتمي العربية؟'),
    [
      l('Indo-European', 'هندوأوروبية'),
      l('Sino-Tibetan', 'صينية تبتية'),
      l('Afro-Asiatic (Semitic)', 'أفروآسيوية (سامية)'),
      l('Turkic', 'تركية')
    ],
    2,
  ],
  [
    'general-h6',
    'general',
    l('Pi (π) is approximately?', 'باي (π) تقريباً؟'),
    [
      l('2.72', '٢.٧٢'),
      l('3.14', '٣.١٤'),
      l('1.62', '١.٦٢'),
      l('0.577', '٠.٥٧٧')
    ],
    1,
  ],
  [
    'general-h7',
    'general',
    l('Which vitamin is synthesized in skin with sunlight?', 'أي فيتامين يُصنع في الجلد بالشمس؟'),
    [
      l('Vitamin A', 'فيتامين أ'),
      l('Vitamin C', 'فيتامين ج'),
      l('Vitamin D', 'فيتامين د'),
      l('Vitamin K', 'فيتامين ك')
    ],
    2,
  ],
  [
    'general-h8',
    'general',
    l('Chess: how many squares are on a standard board?', 'الشطرنج: كم مربعاً على الرقعة القياسية؟'),
    [
      l('32', '٣٢'),
      l('64', '٦٤'),
      l('81', '٨١'),
      l('100', '١٠٠')
    ],
    1,
  ],
  [
    'general-h9',
    'general',
    l('The currency of Japan is the?', 'عملة اليابان هي؟'),
    [
      l('Yuan', 'يوان'),
      l('Won', 'وون'),
      l('Yen', 'ين'),
      l('Dong', 'دونغ')
    ],
    2,
  ],
  [
    'general-h10',
    'general',
    l('Which element has atomic number 1?', 'أي عنصر رقمه الذري 1؟'),
    [
      l('Helium', 'هيليوم'),
      l('Hydrogen', 'هيدروجين'),
      l('Lithium', 'ليثيوم'),
      l('Carbon', 'كربون')
    ],
    1,
  ],
  [
    'general-h11',
    'general',
    l('A heptagon has how many sides?', 'كم ضلعاً للمضلع السباعي؟'),
    [
      l('5', '٥'),
      l('6', '٦'),
      l('7', '٧'),
      l('8', '٨')
    ],
    2,
  ],
  [
    'general-h12',
    'general',
    l('Who proposed the theory of general relativity?', 'من اقترح النسبية العامة؟'),
    [
      l('Newton', 'نيوتن'),
      l('Einstein', 'آينشتاين'),
      l('Maxwell', 'ماكسويل'),
      l('Bohr', 'بور')
    ],
    1,
  ],
  [
    'movies-h1',
    'movies',
    l('Who directed \'Parasite\' (2019)?', 'من أخرج فيلم Parasite (2019)؟'),
    [
      l('Bong Joon-ho', 'بونغ جون-هو'),
      l('Park Chan-wook', 'بارك تشان-ووك'),
      l('Hirokazu Kore-eda', 'هيروكازو كوري-إيدا'),
      l('Wong Kar-wai', 'وونغ كار-واي')
    ],
    0,
  ],
  [
    'movies-h2',
    'movies',
    l('In \'Inception\', what object is Cobb’s totem?', 'في Inception، ما توتم كوب؟'),
    [
      l('A loaded die', 'نرد محشو'),
      l('A spinning top', 'بلبل دوار'),
      l('A poker chip', 'رقاقة بوكر'),
      l('A wedding ring only', 'خاتم زواج فقط')
    ],
    1,
  ],
  [
    'movies-h3',
    'movies',
    l('Which film won Best Picture at the 2020 Oscars (for 2019 films)?', 'أي فيلم فاز بأفضل فيلم في أوسكار 2020؟'),
    [
      l('1917', '١٩١٧'),
      l('Joker', 'جوكر'),
      l('Parasite', 'باراسايت'),
      l('Ford v Ferrari', 'فورد ضد فيراري')
    ],
    2,
  ],
  [
    'movies-h4',
    'movies',
    l('\'The Godfather\' is primarily based on a novel by?', 'فيلم العراب مبني أساساً على رواية؟'),
    [
      l('Mario Puzo', 'ماريو بوزو'),
      l('Stephen King', 'ستيفن كينغ'),
      l('Tom Clancy', 'توم كلانسي'),
      l('John Grisham', 'جون غريشام')
    ],
    0,
  ],
  [
    'movies-h5',
    'movies',
    l('Studio Ghibli co-founded by Miyazaki and?', 'استوديو جيبلي أسسه ميازاكي مع؟'),
    [
      l('Isao Takahata', 'إيساو تاكاهاتا'),
      l('Hayao only alone', 'ميازاكي وحده'),
      l('Satoshi Kon', 'ساتوشي كون'),
      l('Mamoru Hosoda', 'مامورو هوسودا')
    ],
    0,
  ],
  [
    'movies-h6',
    'movies',
    l('Which actor played Joker in \'The Dark Knight\'?', 'من أدى الجوكر في The Dark Knight؟'),
    [
      l('Jared Leto', 'جاريد ليتو'),
      l('Heath Ledger', 'هيث ليدجر'),
      l('Joaquin Phoenix', 'خواكين فينيكس'),
      l('Jack Nicholson only', 'جاك نيكلسون فقط')
    ],
    1,
  ],
  [
    'movies-h7',
    'movies',
    l('\'Citizen Kane\' is often linked to which publishing tycoon’s life?', 'يرتبط Citizen Kane غالباً بحياة أي ناشر؟'),
    [
      l('William Randolph Hearst', 'ويليام راندولف هيرست'),
      l('Rupert Murdoch', 'روبرت مردوخ'),
      l('Joseph Pulitzer', 'جوزيف بوليتزر'),
      l('Henry Luce', 'هنري لوس')
    ],
    0,
  ],
  [
    'movies-h8',
    'movies',
    l('The first feature-length Pixar film was?', 'أول فيلم طويل لبيكسار كان؟'),
    [
      l('Monsters, Inc.', 'مونسترز إنك'),
      l('Toy Story', 'توي ستوري'),
      l('A Bug’s Life', 'حياة حشرة'),
      l('Finding Nemo', 'البحث عن نيمو')
    ],
    1,
  ],
  [
    'movies-h9',
    'movies',
    l('Which Middle Eastern series \'The Promise\' (Al-Wa\'d) style — wait: Who directed Egyptian classic \'Cairo Station\'?', 'من أخرج الفيلم المصري الكلاسيكي باب الحديد؟'),
    [
      l('Youssef Chahine', 'يوسف شاهين'),
      l('Henri Barakat', 'هنري بركات'),
      l('Salah Abu Seif', 'صلاح أبو سيف'),
      l('Atef El Tayeb', 'عاطف الطيب')
    ],
    0,
  ],
  [
    'movies-h10',
    'movies',
    l('In cinema, a MacGuffin is?', 'في السينما، ماكغافين هو؟'),
    [
      l('A plot device that motivates characters', 'أداة حبكة تحرك الشخصيات'),
      l('A camera lens type', 'نوع عدسة'),
      l('A lighting kit', 'طقم إضاءة'),
      l('A union contract', 'عقد نقابة')
    ],
    0,
  ],
  [
    'sports-h1',
    'sports',
    l('How long is an Olympic swimming pool?', 'كم طول مسبح الأولمبياد؟'),
    [
      l('25 m', '٢٥ م'),
      l('50 m', '٥٠ م'),
      l('100 m', '١٠٠ م'),
      l('33 m', '٣٣ م')
    ],
    1,
  ],
  [
    'sports-h2',
    'sports',
    l('In football (soccer), an offside offence is judged at the moment of?', 'في كرة القدم يُحتسب التسلل لحظة؟'),
    [
      l('The shot on goal only', 'التسديدة فقط'),
      l('The pass/play of the ball', 'تمريرة/لعب الكرة'),
      l('Entering the box', 'دخول المنطقة'),
      l('The whistle', 'الصافرة')
    ],
    1,
  ],
  [
    'sports-h3',
    'sports',
    l('A basketball shot from beyond the arc is worth?', 'تسديدة السلة من خلف القوس تساوي؟'),
    [
      l('1 point', 'نقطة'),
      l('2 points', 'نقطتين'),
      l('3 points', '٣ نقاط'),
      l('4 points', '٤ نقاط')
    ],
    2,
  ],
  [
    'sports-h4',
    'sports',
    l('Tour de France is primarily which sport?', 'طواف فرنسا أساساً رياضة؟'),
    [
      l('Running', 'الجري'),
      l('Cycling', 'الدراجات'),
      l('Skiing', 'التزلج'),
      l('Rowing', 'التجديف')
    ],
    1,
  ],
  [
    'sports-h5',
    'sports',
    l('Which nation has won the most FIFA World Cups (men’s)?', 'أي منتخب الأكثر تتويجاً بكأس العالم (رجال)؟'),
    [
      l('Germany', 'ألمانيا'),
      l('Italy', 'إيطاليا'),
      l('Brazil', 'البرازيل'),
      l('Argentina', 'الأرجنتين')
    ],
    2,
  ],
  [
    'sports-h6',
    'sports',
    l('In tennis, what comes after deuce if a player wins a point?', 'في التنس بعد التعادل، فوز نقطة يعطي؟'),
    [
      l('Game', 'شوط'),
      l('Advantage', 'أفضلية'),
      l('Match', 'مباراة'),
      l('Set ball always', 'كرة مجموعة دائماً')
    ],
    1,
  ],
  [
    'sports-h7',
    'sports',
    l('The marathon distance is approximately?', 'مسافة الماراثون تقريباً؟'),
    [
      l('21.1 km', '٢١.١ كم'),
      l('42.195 km', '٤٢.١٩٥ كم'),
      l('50 km', '٥٠ كم'),
      l('10 km', '١٠ كم')
    ],
    1,
  ],
  [
    'sports-h8',
    'sports',
    l('Formula 1 tires are supplied (as of mid-2020s) primarily by?', 'إطارات الفورمولا 1 (منتصف العشرينيات) يوردها أساساً؟'),
    [
      l('Michelin only', 'ميشلان فقط'),
      l('Pirelli', 'بيريللي'),
      l('Goodyear only', 'غوديير فقط'),
      l('Bridgestone only', 'بريدجستون فقط')
    ],
    1,
  ],
  [
    'sports-h9',
    'sports',
    l('In cricket, a hat-trick means?', 'في الكريكيت، هاتريك تعني؟'),
    [
      l('Three wickets in three consecutive balls', '٣ ويكيت في ٣ كرات متتالية'),
      l('Three sixes in an over', '٣ ستات في أوفر'),
      l('Scoring 100 runs', 'تسجيل ١٠٠'),
      l('Taking five catches', '٥ لقطات')
    ],
    0,
  ],
  [
    'sports-h10',
    'sports',
    l('Which city hosted the 2016 Summer Olympics?', 'أي مدينة استضافت أولمبياد 2016 الصيفي؟'),
    [
      l('Tokyo', 'طوكيو'),
      l('Rio de Janeiro', 'ريو دي جانيرو'),
      l('London', 'لندن'),
      l('Beijing', 'بكين')
    ],
    1,
  ],
  [
    'egypt-h1',
    'egypt',
    l('The Aswan High Dam primarily dams which river?', 'السد العالي في أسوان يحجز أي نهر؟'),
    [
      l('Euphrates', 'الفرات'),
      l('Nile', 'النيل'),
      l('Tigris', 'دجلة'),
      l('Jordan', 'الأردن')
    ],
    1,
  ],
  [
    'egypt-h2',
    'egypt',
    l('Ancient Egyptian writing using pictorial signs is called?', 'الكتابة المصرية القديمة بالرموز تُدعى؟'),
    [
      l('Cuneiform', 'مسمارية'),
      l('Hieroglyphs', 'هيروغليفية'),
      l('Hangul', 'هانغول'),
      l('Runes', 'رونية')
    ],
    1,
  ],
  [
    'egypt-h3',
    'egypt',
    l('Who nationalized the Suez Canal in 1956?', 'من أمّم قناة السويس عام 1956؟'),
    [
      l('King Farouk', 'الملك فاروق'),
      l('Gamal Abdel Nasser', 'جمال عبد الناصر'),
      l('Anwar Sadat', 'أنور السادات'),
      l('Saad Zaghloul', 'سعد زغلول')
    ],
    1,
  ],
  [
    'egypt-h4',
    'egypt',
    l('The Great Pyramid is attributed mainly to which pharaoh?', 'الهرم الأكبر يُنسب أساساً لأي فرعون؟'),
    [
      l('Khufu (Cheops)', 'خوفو'),
      l('Tutankhamun', 'توت عنخ آمون'),
      l('Ramses II', 'رمسيس الثاني'),
      l('Akhenaten', 'أخناتون')
    ],
    0,
  ],
  [
    'egypt-h5',
    'egypt',
    l('Modern Standard Arabic is broadly based on the grammar of?', 'العربية الفصحى الحديثة تستند عموماً إلى نحو؟'),
    [
      l('Classical Arabic', 'العربية الفصحى الكلاسيكية'),
      l('Only Egyptian colloquial', 'العامية المصرية فقط'),
      l('Only Levantine', 'الشامية فقط'),
      l('Persian', 'الفارسية')
    ],
    0,
  ],
  [
    'egypt-h6',
    'egypt',
    l('Petra is an ancient city primarily in modern-day?', 'البتراء مدينة قديمة أساساً في؟'),
    [
      l('Egypt', 'مصر'),
      l('Jordan', 'الأردن'),
      l('Syria', 'سوريا'),
      l('Lebanon', 'لبنان')
    ],
    1,
  ],
  [
    'egypt-h7',
    'egypt',
    l('The League of Arab States was founded in?', 'تأسست جامعة الدول العربية عام؟'),
    [
      l('1945', '١٩٤٥'),
      l('1952', '١٩٥٢'),
      l('1967', '١٩٦٧'),
      l('1973', '١٩٧٣')
    ],
    0,
  ],
  [
    'egypt-h8',
    'egypt',
    l('Which Egyptian novelist won the Nobel Prize in Literature?', 'أي روائي مصري فاز بنوبل للأدب؟'),
    [
      l('Naguib Mahfouz', 'نجيب محفوظ'),
      l('Taha Hussein', 'طه حسين'),
      l('Youssef Idris', 'يوسف إدريس'),
      l('Alaa Al Aswany', 'علاء الأسواني')
    ],
    0,
  ],
  [
    'egypt-h9',
    'egypt',
    l('The Coptic calendar is closely related to the ancient?', 'التقويم القبطي وثيق الصلة بتقويم؟'),
    [
      l('Roman only', 'الروماني فقط'),
      l('Egyptian civil calendar', 'التقويم المصري المدني'),
      l('Chinese lunar only', 'الصيني القمري فقط'),
      l('Mayan', 'المايا')
    ],
    1,
  ],
  [
    'egypt-h10',
    'egypt',
    l('Tahrir Square is located in which city?', 'ميدان التحرير يقع في أي مدينة؟'),
    [
      l('Alexandria', 'الإسكندرية'),
      l('Cairo', 'القاهرة'),
      l('Giza only as a separate capital', 'الجيزة كعاصمة'),
      l('Luxor', 'الأقصر')
    ],
    1,
  ],
];

module.exports = { triviaCategories, triviaQuestions };
