/**
 * Starter set: short explanations of Saudi Labour Law articles that matter most to workers
 * who have left the Kingdom. They are added unpublished; the admin or a lawyer reviews each
 * one before it goes on the home page.
 */
export type StarterArticle = { key: string; law: string; number: string; ar: string; bn: string; en: string };

const LABOUR = "نظام العمل";

export const STARTER_ARTICLES: StarterArticle[] = [
  {
    key: "labour-84", law: LABOUR, number: "84",
    ar: "عند انتهاء العقد يستحق العامل مكافأة نهاية الخدمة: أجر نصف شهر عن كل سنة من السنوات الخمس الأولى، وأجر شهر عن كل سنة بعدها.",
    bn: "চুক্তি শেষ হলে শ্রমিক সার্ভিস বেনিফিট পান: প্রথম পাঁচ বছরের প্রতি বছরের জন্য অর্ধ মাসের বেতন, তারপর প্রতি বছরের জন্য এক মাসের বেতন।",
    en: "When the contract ends, the worker gets an end-of-service award: half a month's wage for each of the first five years, and a full month's wage for each year after.",
  },
  {
    key: "labour-85", law: LABOUR, number: "85",
    ar: "إذا استقال العامل يستحق ثلث المكافأة بعد سنتين إلى خمس سنوات، وثلثيها بعد خمس إلى عشر سنوات، وكاملها بعد عشر سنوات.",
    bn: "শ্রমিক নিজে চাকরি ছাড়লে দুই থেকে পাঁচ বছরে বেনিফিটের এক-তৃতীয়াংশ, পাঁচ থেকে দশ বছরে দুই-তৃতীয়াংশ, আর দশ বছরের বেশি হলে পুরোটা পান।",
    en: "If the worker resigns, they get one third of the award after 2 to 5 years, two thirds after 5 to 10 years, and the full award after 10 years.",
  },
  {
    key: "labour-88", law: LABOUR, number: "88",
    ar: "عند انتهاء العلاقة يدفع صاحب العمل الأجور والمستحقات خلال أسبوع إذا أنهاها هو، وخلال أسبوعين إذا أنهاها العامل.",
    bn: "চাকরি শেষ হলে নিয়োগকর্তা শেষ করলে এক সপ্তাহের মধ্যে, আর শ্রমিক শেষ করলে দুই সপ্তাহের মধ্যে বেতন ও পাওনা দিতে হবে।",
    en: "When employment ends, the employer pays wages and dues within one week if the employer ended it, or within two weeks if the worker did.",
  },
  {
    key: "labour-90", law: LABOUR, number: "90",
    ar: "يُدفع الأجر بالعملة الرسمية في موعده، ولصاحب الأجر الشهري مرة في الشهر على الأقل.",
    bn: "বেতন সৌদি মুদ্রায় সময়মতো দিতে হবে। মাসিক বেতনভোগীকে অন্তত মাসে একবার।",
    en: "Wages are paid in Saudi currency on time; monthly-paid workers are paid at least once a month.",
  },
  {
    key: "labour-98", law: LABOUR, number: "98",
    ar: "لا تزيد ساعات العمل الفعلية على ثماني ساعات في اليوم أو ثمانٍ وأربعين ساعة في الأسبوع، وتنقص في رمضان للمسلمين.",
    bn: "দৈনিক ৮ ঘণ্টা বা সাপ্তাহিক ৪৮ ঘণ্টার বেশি কাজ নয়। রমজানে মুসলিমদের জন্য সময় কম।",
    en: "Working time is at most 8 hours a day or 48 hours a week, and shorter for Muslims in Ramadan.",
  },
  {
    key: "labour-107", law: LABOUR, number: "107",
    ar: "ساعات العمل الإضافية يُدفع عنها الأجر مع زيادة خمسين في المئة من الأجر الأساسي.",
    bn: "ওভারটাইমের জন্য বেতনের সঙ্গে মূল বেতনের ৫০% অতিরিক্ত দিতে হবে।",
    en: "Overtime is paid at the wage plus 50% of the basic wage.",
  },
  {
    key: "labour-109", law: LABOUR, number: "109",
    ar: "للعامل إجازة سنوية مدفوعة الأجر لا تقل عن واحد وعشرين يوماً، وتصبح ثلاثين يوماً بعد خمس سنوات متصلة.",
    bn: "শ্রমিক বছরে কমপক্ষে ২১ দিনের বেতনসহ ছুটি পান। একটানা পাঁচ বছর পর ৩০ দিন।",
    en: "The worker gets at least 21 days of paid annual leave, rising to 30 days after five continuous years.",
  },
  {
    key: "labour-40", law: LABOUR, number: "40",
    ar: "يتحمل صاحب العمل رسوم الاستقدام والإقامة ورخصة العمل وتجديدهما، والخروج والعودة، وتذكرة عودة العامل لبلده بعد انتهاء العلاقة.",
    bn: "রিক্রুটমেন্ট, ইকামা, ওয়ার্ক পারমিট ও নবায়নের খরচ, এক্সিট-রি-এন্ট্রি এবং চাকরি শেষে দেশে ফেরার টিকিট নিয়োগকর্তা বহন করবেন।",
    en: "The employer pays recruitment, iqama and work permit fees and renewals, exit/re-entry, and the worker's ticket home when employment ends.",
  },
  {
    key: "labour-77", law: LABOUR, number: "77",
    ar: "إذا أُنهي العقد لسبب غير مشروع يستحق المتضرر تعويضاً يحدده العقد، وإلا فأجر خمسة عشر يوماً عن كل سنة في العقد غير المحدد المدة، وأجر المدة الباقية في المحدد المدة، وبحد أدنى أجر شهرين.",
    bn: "অন্যায়ভাবে চুক্তি বাতিল হলে ক্ষতিপূরণ পাওয়া যায়: চুক্তিতে না থাকলে অনির্দিষ্ট মেয়াদে প্রতি বছরে ১৫ দিনের বেতন, নির্দিষ্ট মেয়াদে বাকি সময়ের বেতন, তবে কমপক্ষে দুই মাসের বেতন।",
    en: "If a contract is ended without a valid reason, the other party gets compensation: unless the contract says otherwise, 15 days' wage per year for an open-ended contract, or the wage for the remaining term of a fixed one, and never less than two months' wage.",
  },
  {
    key: "labour-81", law: LABOUR, number: "81",
    ar: "يحق للعامل ترك العمل دون إشعار مع حفظ حقوقه إذا لم يفِ صاحب العمل بالتزاماته، أو اعتدى عليه، أو عامله معاملة غير مشروعة.",
    bn: "নিয়োগকর্তা দায়িত্ব পালন না করলে, শ্রমিকের ওপর হামলা বা অন্যায় আচরণ করলে শ্রমিক নোটিশ ছাড়াই সব অধিকার রেখে চাকরি ছাড়তে পারেন।",
    en: "The worker may leave without notice and keep all rights if the employer breaks their obligations, assaults them or treats them unlawfully.",
  },
  {
    key: "labour-222", law: LABOUR, number: "222",
    ar: "لا تُسمع دعوى الحقوق العمالية بعد مضي اثني عشر شهراً من انتهاء علاقة العمل، فلا تتأخر في المطالبة.",
    bn: "চাকরি শেষ হওয়ার ১২ মাস পর শ্রম অধিকারের মামলা শোনা হয় না। তাই দেরি করবেন না।",
    en: "Labour claims are not heard after 12 months from the end of employment, so do not wait to claim.",
  },
];
