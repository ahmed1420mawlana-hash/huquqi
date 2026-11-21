import type { CaseType, Stage, } from "./cases";
import type { BankStatus } from "./deadlines";

export const LOCALES = ["bn", "ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "bn";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
export function dir(l: Locale): "rtl" | "ltr" {
  return l === "ar" ? "rtl" : "ltr";
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function localNum(n: number, l: Locale): string {
  const s = String(n);
  return l === "bn" ? s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : s;
}

export function formatDate(d: Date, l: Locale): string {
  const loc = { bn: "bn-BD", ar: "ar-SA-u-ca-gregory-nu-latn", en: "en-GB" }[l];
  return d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

type Msgs = {
  brand: string;
  nav: { home: string; myCases: string; newCase: string; lawyer: string; admin: string; login: string; logout: string };
  home: { eyebrow: string; title: string; lead: string; cta: string; checkTitle: string; checkLead: string };
  check: {
    issues: string; exitDate: string; bank: string; stopped: string; empty: string;
    labourTitle: string; daysLeft: (n: string) => string; labourBody: (date: string) => string;
    labourLateTitle: string; labourLateBody: string;
    bankTitle: string; bankBody: string; insTitle: string; insBody: string;
    otherTitle: string; otherBody: string; disclaimer: string;
  };
  bankStatus: Record<BankStatus, string>;
  caseType: Record<CaseType, string>;
  stage: Record<Stage, string>;
  auth: {
    title: string; phone: string; phoneHint: string; send: string; code: string; verify: string;
    name: string; badPhone: string; badCode: string; rate: string; codeSent: string; devCode: (c: string) => string;
  };
  cases: {
    title: string; none: string; open: string; type: string; employer: string; exitDate: string;
    bank: string; description: string; descriptionHint: string; submit: string; created: string;
    timeline: string; updates: string; noUpdates: string; documents: string; upload: string;
    noDocs: string; lawyer: string; noLawyer: string; deadline: string; channel: string;
    message: string; send: string; uploadHint: string;
  };
  lawyer: {
    title: string; assigned: string; unassigned: string; take: string; moveTo: string; update: string;
    updateHint: string; post: string; notVerified: string; license: string; firm: string; saveProfile: string;
  };
  admin: { title: string; lawyers: string; verify: string; verified: string; cases: string; assign: string; none: string; makeLawyer: string; phone: string };
  common: { save: string; back: string; required: string; forbidden: string; notFound: string };
};

const bn: Msgs = {
  brand: "হুকুকি",
  nav: { home: "হোম", myCases: "আমার মামলা", newCase: "নতুন মামলা", lawyer: "উকিল প্যানেল", admin: "অ্যাডমিন", login: "লগইন", logout: "লগআউট" },
  home: {
    eyebrow: "সৌদি থেকে ফেরা প্রবাসীদের জন্য",
    title: "সৌদিতে আটকে থাকা টাকা আর মামলা, এখন বাংলাদেশে বসেই",
    lead: "বেতন, খিদমা, ব্যাংকের টাকা বা আদালতের মামলা। সৌদি আরবের লাইসেন্সপ্রাপ্ত উকিল আপনার হয়ে কাজ করবেন, আর আপনি বাংলায় প্রতিটি ধাপ দেখবেন।",
    cta: "মামলা শুরু করুন",
    checkTitle: "বিনামূল্যে আপনার অবস্থা যাচাই করুন",
    checkLead: "৩টি প্রশ্নের উত্তর দিন। আমরা জানাব কোন অধিকার এখনো আদায় করা যায় এবং কত সময় বাকি।",
  },
  check: {
    issues: "সৌদিতে আপনার কী আটকে আছে?", exitDate: "সৌদি ছাড়ার তারিখ (ফাইনাল এক্সিট)", bank: "সৌদি ব্যাংকে টাকা আছে",
    stopped: "কোম্পানি বেতন দেওয়া বন্ধ করেছে বা বন্ধ হয়ে গেছে", empty: "অন্তত একটি সমস্যা বেছে নিন।",
    labourTitle: "শ্রম মামলা: সময় চলছে", daysLeft: (n) => `${n} দিন বাকি`,
    labourBody: (d) => `চাকরি শেষ হওয়ার ১২ মাসের মধ্যে কিওয়া (Qiwa)-তে আপোস মীমাংসার আবেদন করতে হবে। শেষ তারিখ: ${d}।`,
    labourLateTitle: "শ্রম মামলার সময় সম্ভবত শেষ", labourLateBody: "১২ মাস পার হয়ে গেছে। তবু একজন উকিল দেখবেন কোনো ব্যতিক্রম আছে কিনা।",
    bankTitle: "ব্যাংকের টাকা আপনারই", bankBody: "ইকামার মেয়াদ শেষের ৯০ দিন পর অ্যাকাউন্ট ফ্রিজ হয়, ১৮০ দিন পর টাকা আলাদা অ্যাকাউন্টে যায়। টাকা হারায় না। উকিল ওকালার মাধ্যমে বাংলাদেশে টাকা পাঠানোর ব্যবস্থা করতে পারেন।",
    insTitle: "বেতন বীমা দাবি করা যেতে পারে", insBody: "অক্টোবর ২০২৪ থেকে কোম্পানি বেতন না দিলে বকেয়া বেতন ও দেশে ফেরার টিকিট বীমা থেকে দেওয়া হয়। বিদেশ থেকে কীভাবে দাবি করবেন, উকিল যাচাই করবেন।",
    otherTitle: "উকিলের মূল্যায়ন দরকার", otherBody: "মামলা, দুর্ঘটনা বা সম্পত্তির জন্য ওকালা দিয়ে একজন সৌদি উকিল নাজিজ (Najiz)-এ কাজ করবেন।",
    disclaimer: "এটি একটি প্রাথমিক নির্দেশিকা, আইনি পরামর্শ নয়। চূড়ান্ত মূল্যায়ন করবেন সৌদি আরবের লাইসেন্সপ্রাপ্ত উকিল।",
  },
  bankStatus: { active: "এখনো চালু থাকতে পারে", frozen: "সম্ভবত ফ্রিজ", holding: "টাকা আলাদা অ্যাকাউন্টে", unclaimed: "দাবিহীন, কিন্তু টাকা আপনারই" },
  caseType: { salary: "বকেয়া বেতন", eosb: "খিদমা (সার্ভিস বেনিফিট)", bank: "ব্যাংকের টাকা", court: "চলমান মামলা", accident: "দুর্ঘটনার ক্ষতিপূরণ", property: "গাড়ি বা সম্পত্তি" },
  stage: { submitted: "জমা হয়েছে", review: "উকিল দেখছেন", poa: "ওকালা প্রস্তুত", filed: "আবেদন জমা", hearing: "বৈঠক / শুনানি", judgment: "রায় / উত্তর", payout: "টাকা পাঠানো", closed: "বন্ধ" },
  auth: {
    title: "মোবাইল নম্বর দিয়ে লগইন", phone: "মোবাইল নম্বর", phoneHint: "বাংলাদেশি নম্বর, যেমন 01712-345678", send: "কোড পাঠান",
    code: "৬ সংখ্যার কোড", verify: "লগইন", name: "আপনার নাম", badPhone: "সঠিক মোবাইল নম্বর লিখুন।", badCode: "কোডটি ভুল বা মেয়াদোত্তীর্ণ।", rate: "অনেকবার চেষ্টা হয়েছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।",
    codeSent: "আপনার মোবাইলে কোড পাঠানো হয়েছে।", devCode: (c) => `ডেভেলপমেন্ট মোড: কোড ${c}`,
  },
  cases: {
    title: "আমার মামলা", none: "এখনো কোনো মামলা নেই।", open: "নতুন মামলা খুলুন", type: "সমস্যার ধরন", employer: "কোম্পানি বা কফিলের নাম",
    exitDate: "সৌদি ছাড়ার তারিখ", bank: "ব্যাংকের নাম", description: "আপনার সমস্যা লিখুন", descriptionHint: "যত বিস্তারিত সম্ভব, বাংলায় লিখুন।",
    submit: "মামলা জমা দিন", created: "মামলা জমা হয়েছে। ৪৮ ঘণ্টার মধ্যে একজন উকিল দেখবেন।", timeline: "অগ্রগতি", updates: "আপডেট",
    noUpdates: "এখনো কোনো আপডেট নেই।", documents: "কাগজপত্র", upload: "আপলোড", noDocs: "কোনো কাগজ আপলোড হয়নি।", lawyer: "উকিল",
    noLawyer: "উকিল নিয়োগের অপেক্ষায়", deadline: "শ্রম মামলার শেষ তারিখ", channel: "সরকারি মাধ্যম", message: "উকিলকে বার্তা", send: "পাঠান",
    uploadHint: "পাসপোর্ট, ইকামা, চুক্তি, বেতনের স্লিপ (PDF বা ছবি, সর্বোচ্চ ১০ MB)",
  },
  lawyer: {
    title: "উকিল প্যানেল", assigned: "আমার মামলা", unassigned: "নতুন মামলা", take: "মামলা নিন", moveTo: "পরবর্তী ধাপ", update: "আপডেট লিখুন",
    updateHint: "ক্লায়েন্ট এটি নিজের ভাষায় দেখবেন।", post: "আপডেট দিন", notVerified: "আপনার লাইসেন্স এখনো যাচাই হয়নি।",
    license: "লাইসেন্স নম্বর", firm: "ল ফার্ম", saveProfile: "সংরক্ষণ",
  },
  admin: { title: "অ্যাডমিন", lawyers: "উকিল", verify: "যাচাই করুন", verified: "যাচাইকৃত", cases: "সব মামলা", assign: "উকিল দিন", none: "কিছু নেই", makeLawyer: "উকিল হিসেবে যোগ করুন", phone: "মোবাইল" },
  common: { save: "সংরক্ষণ", back: "পেছনে", required: "এই ঘরটি পূরণ করুন।", forbidden: "এই পাতায় আপনার প্রবেশাধিকার নেই।", notFound: "পাওয়া যায়নি।" },
};

const ar: Msgs = {
  brand: "حقوقي",
  nav: { home: "الرئيسية", myCases: "قضاياي", newCase: "قضية جديدة", lawyer: "لوحة المحامي", admin: "الإدارة", login: "دخول", logout: "خروج" },
  home: {
    eyebrow: "للعمالة العائدة من السعودية",
    title: "أموالك وقضاياك في السعودية، تتابعها وأنت في بلدك",
    lead: "رواتب، مكافأة نهاية خدمة، رصيد بنكي، أو قضية في المحكمة. محامٍ سعودي مرخّص يعمل نيابةً عنك، وأنت تتابع كل خطوة بلغتك.",
    cta: "ابدأ قضيتك",
    checkTitle: "افحص حالتك مجاناً",
    checkLead: "أجب عن 3 أسئلة، ونخبرك بما يمكن استرداده وكم بقي من الوقت.",
  },
  check: {
    issues: "ما الذي بقي لك في السعودية؟", exitDate: "تاريخ الخروج النهائي", bank: "لدي رصيد في بنك سعودي",
    stopped: "الشركة توقفت عن دفع الرواتب أو أغلقت", empty: "اختر مشكلة واحدة على الأقل.",
    labourTitle: "القضية العمالية: الوقت يمضي", daysLeft: (n) => `باقي ${n} يوماً`,
    labourBody: (d) => `يجب تقديم طلب التسوية الودية في منصة قوى خلال 12 شهراً من انتهاء العمل. آخر موعد: ${d}.`,
    labourLateTitle: "مهلة القضية العمالية انتهت على الأرجح", labourLateBody: "مرّت 12 شهراً. ومع ذلك يراجع المحامي إن كان هناك استثناء.",
    bankTitle: "رصيدك في البنك ما زال لك", bankBody: "يُجمّد الحساب بعد 90 يوماً من انتهاء الإقامة، ويُنقل الرصيد إلى حساب موحّد بعد 180 يوماً. المال لا يضيع، ويستطيع المحامي بالوكالة طلب تحويله إلى حسابك في بلدك.",
    insTitle: "قد تستحق تأمين حماية الأجور", insBody: "منذ أكتوبر 2024 يغطي التأمين الرواتب غير المدفوعة وتذكرة العودة عند تعثر المنشأة. يتحقق المحامي من طريقة المطالبة من الخارج.",
    otherTitle: "يحتاج تقييم محامٍ", otherBody: "للقضايا والحوادث والممتلكات، يتابع محامٍ سعودي بالوكالة عبر منصة ناجز.",
    disclaimer: "هذا إرشاد أولي وليس استشارة قانونية. التقييم النهائي يقدمه محامٍ سعودي مرخّص.",
  },
  bankStatus: { active: "قد يكون نشطاً", frozen: "مجمّد غالباً", holding: "الرصيد في حساب موحّد", unclaimed: "غير مطالَب به، والمال ما زال لك" },
  caseType: { salary: "رواتب متأخرة", eosb: "مكافأة نهاية الخدمة", bank: "رصيد بنكي", court: "قضية قائمة", accident: "تعويض حادث", property: "سيارة أو ممتلكات" },
  stage: { submitted: "مُقدَّمة", review: "قيد المراجعة", poa: "إعداد الوكالة", filed: "تم التقديم", hearing: "جلسات", judgment: "الحكم / الرد", payout: "التحويل", closed: "مغلقة" },
  auth: {
    title: "الدخول برقم الجوال", phone: "رقم الجوال", phoneHint: "رقم بنغلاديشي مثل 01712-345678، أو سعودي للمحامين", send: "أرسل الرمز",
    code: "الرمز المكوّن من 6 أرقام", verify: "دخول", name: "اسمك", badPhone: "اكتب رقم جوال صحيحاً.", badCode: "الرمز غير صحيح أو منتهي.", rate: "محاولات كثيرة. حاول بعد ساعة.",
    codeSent: "أرسلنا الرمز إلى جوالك.", devCode: (c) => `وضع التطوير: الرمز ${c}`,
  },
  cases: {
    title: "قضاياي", none: "لا توجد قضايا بعد.", open: "افتح قضية جديدة", type: "نوع المشكلة", employer: "اسم الشركة أو الكفيل",
    exitDate: "تاريخ الخروج", bank: "اسم البنك", description: "اشرح مشكلتك", descriptionHint: "اكتب بأكبر قدر من التفاصيل وبأي لغة.",
    submit: "قدّم القضية", created: "تم تقديم القضية. سيراجعها محامٍ خلال 48 ساعة.", timeline: "المراحل", updates: "التحديثات",
    noUpdates: "لا توجد تحديثات بعد.", documents: "المستندات", upload: "رفع", noDocs: "لم تُرفع مستندات.", lawyer: "المحامي",
    noLawyer: "بانتظار تعيين محامٍ", deadline: "آخر موعد للقضية العمالية", channel: "القناة الرسمية", message: "رسالة للمحامي", send: "إرسال",
    uploadHint: "الجواز، الإقامة، العقد، كشوف الراتب (PDF أو صورة، حتى 10 ميجابايت)",
  },
  lawyer: {
    title: "لوحة المحامي", assigned: "قضاياي", unassigned: "قضايا جديدة", take: "استلم القضية", moveTo: "المرحلة التالية", update: "اكتب تحديثاً",
    updateHint: "يراه العميل بلغته.", post: "انشر التحديث", notVerified: "لم يتم التحقق من ترخيصك بعد.",
    license: "رقم الترخيص", firm: "مكتب المحاماة", saveProfile: "حفظ",
  },
  admin: { title: "الإدارة", lawyers: "المحامون", verify: "توثيق", verified: "موثّق", cases: "كل القضايا", assign: "تعيين محامٍ", none: "لا شيء", makeLawyer: "إضافة كمحامٍ", phone: "الجوال" },
  common: { save: "حفظ", back: "رجوع", required: "هذا الحقل مطلوب.", forbidden: "ليست لديك صلاحية لهذه الصفحة.", notFound: "غير موجود." },
};

const en: Msgs = {
  brand: "Huquqi",
  nav: { home: "Home", myCases: "My cases", newCase: "New case", lawyer: "Lawyer panel", admin: "Admin", login: "Log in", logout: "Log out" },
  home: {
    eyebrow: "For workers who have returned from Saudi Arabia",
    title: "Your money and cases in Saudi Arabia, handled from home",
    lead: "Unpaid salary, end-of-service benefit, a bank balance or a court case. A licensed Saudi lawyer acts for you, and you follow every step in your language.",
    cta: "Start your case",
    checkTitle: "Check your situation for free",
    checkLead: "Answer 3 questions. We tell you what you can still recover and how much time is left.",
  },
  check: {
    issues: "What did you leave behind in Saudi Arabia?", exitDate: "Final exit date", bank: "I have money in a Saudi bank",
    stopped: "The company stopped paying salaries or closed down", empty: "Pick at least one issue.",
    labourTitle: "Labour claim: the clock is running", daysLeft: (n) => `${n} days left`,
    labourBody: (d) => `You must file for amicable settlement on Qiwa within 12 months of your job ending. Last day: ${d}.`,
    labourLateTitle: "The labour claim deadline has likely passed", labourLateBody: "More than 12 months have passed. A lawyer can still check for an exception.",
    bankTitle: "Your bank balance is still yours", bankBody: "Accounts are frozen 90 days after the iqama expires, and the balance moves to a holding account after 180 days. The money is not lost. A lawyer with your power of attorney can ask the bank to transfer it home.",
    insTitle: "You may qualify for wage insurance", insBody: "Since October 2024, insurance covers unpaid wages and a ticket home when an employer fails. A lawyer checks how to claim from abroad.",
    otherTitle: "Needs a lawyer's review", otherBody: "For court cases, accidents or property, a Saudi lawyer with your power of attorney works through Najiz.",
    disclaimer: "This is first guidance, not legal advice. A licensed Saudi lawyer gives the final review.",
  },
  bankStatus: { active: "May still be active", frozen: "Likely frozen", holding: "Balance in holding account", unclaimed: "Unclaimed, but still yours" },
  caseType: { salary: "Unpaid salary", eosb: "End-of-service benefit", bank: "Bank balance", court: "Open court case", accident: "Accident compensation", property: "Car or property" },
  stage: { submitted: "Submitted", review: "Under review", poa: "Power of attorney", filed: "Filed", hearing: "Sessions", judgment: "Decision", payout: "Paid out", closed: "Closed" },
  auth: {
    title: "Log in with your mobile number", phone: "Mobile number", phoneHint: "Bangladesh number like 01712-345678, or Saudi for lawyers", send: "Send code",
    code: "6-digit code", verify: "Log in", name: "Your name", badPhone: "Enter a valid mobile number.", badCode: "The code is wrong or expired.", rate: "Too many attempts. Try again in an hour.",
    codeSent: "We sent a code to your phone.", devCode: (c) => `Development mode: code ${c}`,
  },
  cases: {
    title: "My cases", none: "No cases yet.", open: "Open a new case", type: "Type of problem", employer: "Company or sponsor name",
    exitDate: "Exit date", bank: "Bank name", description: "Describe your problem", descriptionHint: "As much detail as you can, in any language.",
    submit: "Submit case", created: "Case submitted. A lawyer will review it within 48 hours.", timeline: "Progress", updates: "Updates",
    noUpdates: "No updates yet.", documents: "Documents", upload: "Upload", noDocs: "No documents uploaded.", lawyer: "Lawyer",
    noLawyer: "Waiting for a lawyer", deadline: "Labour claim deadline", channel: "Official channel", message: "Message your lawyer", send: "Send",
    uploadHint: "Passport, iqama, contract, payslips (PDF or image, up to 10 MB)",
  },
  lawyer: {
    title: "Lawyer panel", assigned: "My cases", unassigned: "New cases", take: "Take case", moveTo: "Next stage", update: "Write an update",
    updateHint: "The client sees it in their language.", post: "Post update", notVerified: "Your licence has not been verified yet.",
    license: "Licence number", firm: "Law firm", saveProfile: "Save",
  },
  admin: { title: "Admin", lawyers: "Lawyers", verify: "Verify", verified: "Verified", cases: "All cases", assign: "Assign lawyer", none: "Nothing here", makeLawyer: "Add as lawyer", phone: "Mobile" },
  common: { save: "Save", back: "Back", required: "This field is required.", forbidden: "You don't have access to this page.", notFound: "Not found." },
};

export const messages: Record<Locale, Msgs> = { bn, ar, en };
export type Messages = Msgs;
