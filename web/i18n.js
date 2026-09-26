/*
 * Lamma site: shared EN/AR strings + language switching. Plain JS, no build.
 *
 * How it works
 * - Elements carry data-i18n="key" (text) and optionally
 *   data-i18n-content / data-i18n-aria-label / data-i18n-alt (attributes).
 *   The English text also stays in the HTML so the page works without JS.
 * - The tiny inline script in every page's <head> already picked the language
 *   before first paint (and set <html lang dir>) in this order:
 *     ?lang=ar|en  ->  localStorage "lamma-lang"  ->  navigator.language (ar*)  ->  en
 *   This file only fills in the strings and wires the EN / عربي toggle.
 * - Dynamic text (app.js) sets data-i18n keys and calls LammaI18n.apply().
 * Strings are static and trusted; they are only ever set with textContent.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lamma-lang';
  var SUPPORTED = { en: true, ar: true };

  var STRINGS = {
    en: {
      // Shared chrome
      'brand': 'Lamma',
      'a11y.language': 'Language',
      'a11y.theme': 'Switch light or dark theme',
      'a11y.home': 'Lamma home',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.terms': 'Terms',
      'nav.privacy': 'Privacy',
      'footer.copy': '© 2026 Lamma',
      'store.android': 'Download for Android',
      'store.ios': 'Download for iOS',
      'legal.lastUpdated': 'Last updated: September 2026',

      // index.html
      'index.docTitle': 'Lamma',
      'index.metaDesc': 'Lamma: plan gatherings and play party games with friends.',
      'index.title': 'Gather your people',
      'index.subtitle': 'Plan events and play games together with Lamma.',

      // event.html (/e/{eventId} and /g/{code})
      'event.docTitle': "You're invited · Lamma",
      'event.metaDesc': 'Open this invite in the Lamma app.',
      'event.title': "You're invited 🎉",
      'event.subtitle': 'Open this event in the Lamma app to see the details.',
      'event.open': 'Open in Lamma',
      'event.invalid': 'This invite link looks broken. Ask your friend to send it again.',
      'event.idLabel': 'Event ID',
      'game.docTitle': 'Join a game · Lamma',
      'game.title': "You're invited to play 🎲",
      'game.subtitle': 'Open Lamma to join this game room.',
      'game.idLabel': 'Room code',

      // about.html
      'about.docTitle': 'About Lamma · Lamma',
      'about.metaDesc': 'About Lamma: plan gatherings and play party games with friends.',
      'about.title': 'About Lamma',
      'about.lead': 'Lamma (لمّة, “a gathering”) helps you plan events and bring friends and family together, from birthdays and weddings to dinners, trips and Iftar.',
      'about.s1Title': 'Plan events',
      'about.s1Body': 'Create an event in a few steps, pick a theme or your own cover photo, and share a beautiful invite link on WhatsApp or anywhere else.',
      'about.s2Title': 'Know who is coming',
      'about.s2Body': 'Guests answer Going, Maybe or Can’t go, and hosts see the whole guest list in one place.',
      'about.s3Title': 'Play together',
      'about.s3Body': 'Start a party game such as Trivia, Imposter, Icebreakers or Quarter Mile, and everyone plays on their own phone.',
      'about.s4Title': 'Made in Egypt',
      'about.s4Body': 'Lamma is built in Egypt, in Arabic and English, for the way we celebrate.',
      'about.questions': 'Questions?',
      'about.contactLink': 'Contact us',

      // contact.html
      'contact.docTitle': 'Contact us · Lamma',
      'contact.metaDesc': 'Contact the Lamma team.',
      'contact.title': 'Contact us',
      'contact.lead': 'We would love to hear from you. Send us your questions, ideas or problems and we will reply as soon as we can.',
      'contact.emailBtn': 'Email',
      'contact.responseTime': 'We usually reply within 2 to 3 business days.',
      'contact.reportTitle': 'Reporting a problem',
      'contact.reportBody': 'Tell us what happened, which screen you were on and your phone model. Screenshots help a lot.',
      'contact.deleteTitle': 'Account and data deletion',
      'contact.deleteBefore': 'To delete your Lamma account and data, email us from the app’s Contact screen or at',
      'contact.deleteAfter': 'and we will take care of it.',

      // terms.html
      'terms.docTitle': 'Terms of Service · Lamma',
      'terms.metaDesc': 'Lamma Terms of Service.',
      'terms.title': 'Terms of Service',
      'terms.lead': 'By using Lamma you agree to these terms. Please read them carefully.',
      'terms.s1Title': '1. Using Lamma',
      'terms.s1Body': 'You can use Lamma as a guest or with a Google or Apple account. You are responsible for the activity on your account and for keeping your device secure.',
      'terms.s2Title': '2. Your content',
      'terms.s2Body': 'You own the events, photos, names and messages you add. You allow Lamma to store them and show them to the people you share them with, only to run the service.',
      'terms.s3Title': '3. Acceptable use',
      'terms.s3Body': 'Do not use Lamma for anything illegal, hateful, harassing or misleading, and do not upload content you do not have the right to share. We may remove content or suspend accounts that break these rules.',
      'terms.s4Title': '4. Events and invites',
      'terms.s4Body': 'Hosts are responsible for their events. Anyone with an invite link can view that event, so only share links with people you trust. Lamma does not organise and is not responsible for events created in the app.',
      'terms.s5Title': '5. Games',
      'terms.s5Body': 'Party games are for fun. Any prize mentioned in a game is arranged by the host, not by Lamma.',
      'terms.s6Title': '6. Availability',
      'terms.s6Body': 'Lamma is provided “as is”. We work to keep it running, but we cannot promise it will always be available or error-free. Events are deleted automatically after they end.',
      'terms.s7Title': '7. Changes',
      'terms.s7Body': 'We may update these terms. If a change is important we will tell you in the app. Using Lamma after a change means you accept the updated terms.',
      'terms.s8Title': '8. Contact',
      'terms.s8Body': 'Questions about these terms? Email',

      // privacy.html
      'privacy.docTitle': 'Privacy Policy · Lamma',
      'privacy.metaDesc': 'Lamma Privacy Policy.',
      'privacy.title': 'Privacy Policy',
      'privacy.lead': 'Your privacy matters to us. This policy explains what Lamma collects, why, and the choices you have.',
      'privacy.s1Title': 'What we collect',
      'privacy.s1Body': 'Account data (an anonymous ID for guests, or your name, email and photo from Google or Apple), the profile name and photo you choose, the events you create and your RSVPs, game activity, and basic device data such as the notification token, app version and crash reports.',
      'privacy.s2Title': 'How we use it',
      'privacy.s2Body': 'Only to run the app: show your events and invites, sync RSVPs and games, send the reminders and notifications you enabled, fix crashes and improve Lamma. We do not sell your data and we do not show ads.',
      'privacy.s3Title': 'Who can see it',
      'privacy.s3Body': 'Event details are visible to people who have the invite link. Your name and RSVP are visible to the event host and guests. Your profile photo stays in your account.',
      'privacy.s4Title': 'Service providers',
      'privacy.s4Body': 'Lamma uses Google Firebase (sign-in, database, notifications, analytics and crash reports) to store and process data for us.',
      'privacy.s5Title': 'Security',
      'privacy.s5Body': 'Data is sent over encrypted connections. On your phone, the guest session token is kept in encrypted storage protected by the device keychain.',
      'privacy.s6Title': 'Your choices',
      'privacy.s6Body': 'You can change your name, turn notifications off in Settings, delete your events or sign out at any time. To delete your account and data, email us and we will do it.',
      'privacy.s7Title': 'Children',
      'privacy.s7Body': 'Lamma is not meant for children under 13.',
      'privacy.s8Title': 'Contact',
      'privacy.s8Body': 'Questions about privacy? Email'
    },

    ar: {
      'brand': 'لمّة',
      'a11y.language': 'اللغة',
      'a11y.theme': 'التبديل بين الوضع الفاتح والداكن',
      'a11y.home': 'الصفحة الرئيسية للمّة',
      'nav.home': 'الرئيسية',
      'nav.about': 'عن لمّة',
      'nav.contact': 'تواصل معنا',
      'nav.terms': 'الشروط',
      'nav.privacy': 'الخصوصية',
      'footer.copy': '© 2026 لمّة',
      'store.android': 'حمّل التطبيق لأندرويد',
      'store.ios': 'حمّل التطبيق لآيفون',
      'legal.lastUpdated': 'آخر تحديث: سبتمبر 2026',

      'index.docTitle': 'لمّة',
      'index.metaDesc': 'لمّة: نظّم تجمعاتك والعب ألعاباً جماعية مع أصدقائك.',
      'index.title': 'لمّ ناسك',
      'index.subtitle': 'نظّم مناسباتك والعبوا مع بعض على لمّة.',

      'event.docTitle': 'أنت مدعو · لمّة',
      'event.metaDesc': 'افتح هذه الدعوة في تطبيق لمّة.',
      'event.title': 'أنت مدعو 🎉',
      'event.subtitle': 'افتح هذه المناسبة في تطبيق لمّة لتشاهد تفاصيلها.',
      'event.open': 'افتح في لمّة',
      'event.invalid': 'يبدو أن رابط الدعوة هذا غير صحيح. اطلب من صديقك أن يرسله مرة أخرى.',
      'event.idLabel': 'رقم المناسبة',
      'game.docTitle': 'انضم إلى لعبة · لمّة',
      'game.title': 'أنت مدعو للعب 🎲',
      'game.subtitle': 'افتح لمّة لتنضم إلى غرفة اللعب هذه.',
      'game.idLabel': 'رمز الغرفة',

      'about.docTitle': 'عن لمّة · لمّة',
      'about.metaDesc': 'عن لمّة: نظّم تجمعاتك والعب ألعاباً جماعية مع أصدقائك.',
      'about.title': 'عن لمّة',
      'about.lead': 'لمّة تساعدك على تنظيم المناسبات وجمع الأهل والأصدقاء، من أعياد الميلاد والأفراح إلى العزومات والرحلات والإفطار.',
      'about.s1Title': 'نظّم مناسباتك',
      'about.s1Body': 'أنشئ مناسبة في خطوات قليلة، واختر تصميماً أو صورة غلاف خاصة بك، وشارك رابط دعوة جميلاً على واتساب أو أي مكان آخر.',
      'about.s2Title': 'اعرف مين جاي',
      'about.s2Body': 'يرد الضيوف بـ "حاضر" أو "ربما" أو "لا أستطيع"، ويرى المضيف قائمة الضيوف كاملة في مكان واحد.',
      'about.s3Title': 'العبوا مع بعض',
      'about.s3Body': 'ابدأ لعبة جماعية مثل الأسئلة أو المحتال أو كسر الجليد أو ربع ميل، وكل واحد يلعب من موبايله.',
      'about.s4Title': 'صُنعت في مصر',
      'about.s4Body': 'لمّة مصنوعة في مصر، بالعربية والإنجليزية، على طريقتنا في الاحتفال.',
      'about.questions': 'لديك أسئلة؟',
      'about.contactLink': 'تواصل معنا',

      'contact.docTitle': 'تواصل معنا · لمّة',
      'contact.metaDesc': 'تواصل مع فريق لمّة.',
      'contact.title': 'تواصل معنا',
      'contact.lead': 'يسعدنا أن نسمع منك. أرسل لنا أسئلتك أو أفكارك أو أي مشكلة وسنرد عليك في أقرب وقت.',
      'contact.emailBtn': 'راسلنا على',
      'contact.responseTime': 'نرد عادة خلال يومين إلى ثلاثة أيام عمل.',
      'contact.reportTitle': 'الإبلاغ عن مشكلة',
      'contact.reportBody': 'أخبرنا بما حدث، وفي أي شاشة كنت، ونوع هاتفك. لقطات الشاشة تساعدنا كثيراً.',
      'contact.deleteTitle': 'حذف الحساب والبيانات',
      'contact.deleteBefore': 'لحذف حسابك وبياناتك على لمّة، راسلنا من شاشة «تواصل معنا» في التطبيق أو على',
      'contact.deleteAfter': 'وسنتولى الأمر.',

      'terms.docTitle': 'شروط الخدمة · لمّة',
      'terms.metaDesc': 'شروط خدمة لمّة.',
      'terms.title': 'شروط الخدمة',
      'terms.lead': 'باستخدامك لمّة فأنت توافق على هذه الشروط. يُرجى قراءتها بعناية.',
      'terms.s1Title': '1. استخدام لمّة',
      'terms.s1Body': 'يمكنك استخدام لمّة كضيف أو بحساب Google أو Apple. أنت مسؤول عن النشاط على حسابك وعن تأمين جهازك.',
      'terms.s2Title': '2. المحتوى الخاص بك',
      'terms.s2Body': 'المناسبات والصور والأسماء والرسائل التي تضيفها ملك لك. وتسمح للمّة بحفظها وعرضها لمن تشاركها معهم، فقط لتشغيل الخدمة.',
      'terms.s3Title': '3. الاستخدام المقبول',
      'terms.s3Body': 'لا تستخدم لمّة في أي شيء غير قانوني أو يحرّض على الكراهية أو يتضمن مضايقة أو تضليلاً، ولا ترفع محتوى لا تملك حق مشاركته. قد نحذف المحتوى أو نوقف الحسابات التي تخالف هذه القواعد.',
      'terms.s4Title': '4. المناسبات والدعوات',
      'terms.s4Body': 'المضيف مسؤول عن مناسبته. أي شخص لديه رابط الدعوة يمكنه رؤية المناسبة، فشارك الروابط مع من تثق بهم فقط. لمّة لا تنظم المناسبات المنشأة في التطبيق وليست مسؤولة عنها.',
      'terms.s5Title': '5. الألعاب',
      'terms.s5Body': 'الألعاب للتسلية. أي جائزة تُذكر في لعبة يرتبها المضيف وليس لمّة.',
      'terms.s6Title': '6. توفر الخدمة',
      'terms.s6Body': 'تُقدَّم لمّة "كما هي". نعمل على استمرار عملها لكن لا نضمن أن تكون متاحة دائماً أو خالية من الأخطاء. تُحذف المناسبات تلقائياً بعد انتهائها.',
      'terms.s7Title': '7. التغييرات',
      'terms.s7Body': 'قد نحدّث هذه الشروط، وإذا كان التغيير مهماً سنخبرك داخل التطبيق. استمرارك في استخدام لمّة يعني موافقتك على الشروط المحدثة.',
      'terms.s8Title': '8. التواصل',
      'terms.s8Body': 'لديك سؤال عن هذه الشروط؟ راسلنا على',

      'privacy.docTitle': 'سياسة الخصوصية · لمّة',
      'privacy.metaDesc': 'سياسة الخصوصية في لمّة.',
      'privacy.title': 'سياسة الخصوصية',
      'privacy.lead': 'خصوصيتك تهمنا. توضح هذه السياسة ما تجمعه لمّة ولماذا والخيارات المتاحة لك.',
      'privacy.s1Title': 'ما نجمعه',
      'privacy.s1Body': 'بيانات الحساب (معرّف مجهول للضيوف، أو اسمك وبريدك وصورتك من Google أو Apple)، والاسم والصورة التي تختارها لملفك، والمناسبات التي تنشئها وردودك عليها، ونشاط الألعاب، وبيانات أساسية عن الجهاز مثل رمز الإشعارات وإصدار التطبيق وتقارير الأعطال.',
      'privacy.s2Title': 'كيف نستخدمها',
      'privacy.s2Body': 'لتشغيل التطبيق فقط: عرض مناسباتك ودعواتك، ومزامنة الردود والألعاب، وإرسال التذكيرات والإشعارات التي فعّلتها، وإصلاح الأعطال وتحسين لمّة. لا نبيع بياناتك ولا نعرض إعلانات.',
      'privacy.s3Title': 'من يمكنه رؤيتها',
      'privacy.s3Body': 'تفاصيل المناسبة ظاهرة لمن لديه رابط الدعوة. اسمك وردك ظاهران لمضيف المناسبة وضيوفها. صورة ملفك تبقى في حسابك.',
      'privacy.s4Title': 'مزودو الخدمة',
      'privacy.s4Body': 'تستخدم لمّة خدمات Google Firebase (تسجيل الدخول وقاعدة البيانات والإشعارات والتحليلات وتقارير الأعطال) لحفظ البيانات ومعالجتها نيابة عنا.',
      'privacy.s5Title': 'الأمان',
      'privacy.s5Body': 'تُرسل البيانات عبر اتصالات مشفرة. وعلى هاتفك يُحفظ رمز جلسة الضيف في تخزين مشفر محمي بسلسلة مفاتيح الجهاز.',
      'privacy.s6Title': 'خياراتك',
      'privacy.s6Body': 'يمكنك تغيير اسمك، وإيقاف الإشعارات من الإعدادات، وحذف مناسباتك، وتسجيل الخروج في أي وقت. لحذف حسابك وبياناتك راسلنا وسنقوم بذلك.',
      'privacy.s7Title': 'الأطفال',
      'privacy.s7Body': 'لمّة غير موجهة للأطفال دون 13 عاماً.',
      'privacy.s8Title': 'التواصل',
      'privacy.s8Body': 'لديك سؤال عن الخصوصية؟ راسلنا على'
    }
  };

  var ATTRS = ['content', 'aria-label', 'alt'];
  var root = document.documentElement;

  function normalize(lang) {
    return SUPPORTED[lang] ? lang : 'en';
  }

  var current = normalize(root.getAttribute('lang'));

  function t(key, lang) {
    var table = STRINGS[normalize(lang || current)];
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (Object.prototype.hasOwnProperty.call(STRINGS.en, key)) return STRINGS.en[key];
    return null;
  }

  function apply(scope) {
    var base = scope || document;
    var nodes = base.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var text = t(nodes[i].getAttribute('data-i18n'));
      if (text !== null) nodes[i].textContent = text;
    }
    for (var a = 0; a < ATTRS.length; a++) {
      var attr = ATTRS[a];
      var withAttr = base.querySelectorAll('[data-i18n-' + attr + ']');
      for (var j = 0; j < withAttr.length; j++) {
        var value = t(withAttr[j].getAttribute('data-i18n-' + attr));
        if (value !== null) withAttr[j].setAttribute(attr, value);
      }
    }
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].setAttribute('aria-pressed', String(buttons[b].getAttribute('data-set-lang') === current));
    }
  }

  function setLang(lang, persist) {
    current = normalize(lang);
    root.setAttribute('lang', current);
    root.setAttribute('dir', current === 'ar' ? 'rtl' : 'ltr');
    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* private mode */ }
      // A ?lang= param would win on reload, so keep it in sync with the choice.
      try {
        var url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.set('lang', current);
          window.history.replaceState(null, '', url.toString());
        }
      } catch (e2) { /* old browser */ }
    }
    apply();
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest('[data-set-lang]') : null;
    if (!button) return;
    event.preventDefault();
    setLang(button.getAttribute('data-set-lang'), true);
  });

  window.LammaI18n = {
    t: t,
    apply: apply,
    setLang: setLang,
    lang: function () { return current; }
  };

  apply();

  function reveal() {
    root.classList.remove('i18n-pending');
  }
  // Wait for later deferred scripts (app.js) to set their own keys first.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
  }
})();
