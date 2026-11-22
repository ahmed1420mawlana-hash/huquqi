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
  home: { eyebrow: string; title: string; lead: string; cta: string; checkTitle: string; checkLead: string; pick: string; pickLead: string };
  check: {
    issues: string; exitDate: string; bank: string; stopped: string; empty: string;
    labourTitle: string; daysLeft: (n: string) => string; labourBody: (date: string) => string;
    labourLateTitle: string; labourLateBody: string;
    bankTitle: string; bankBody: string; insTitle: string; insBody: string;
    otherTitle: string; otherBody: string; transTitle: string; transBody: string; hajjTitle: string; hajjBody: string; comTitle: string; comBody: string; poaTitle: string; poaBody: string; invTitle: string; invBody: string; reTitle: string; reLead: string; reRules: { h: string; p: string }[]; reNote: string; genTitle: string; genBody: string; disclaimer: string;
  };
  bankStatus: Record<BankStatus, string>;
  caseType: Record<CaseType, string>;
  stage: Record<Stage, string>;
  auth: {
    title: string; email: string; emailHint: string; send: string; code: string; verify: string;
    name: string; badEmail: string; badCode: string; rate: string; codeSent: string; devCode: (c: string) => string;
    emailSubject: string; emailBody: (c: string) => string;
    phone: string; phoneHint: string; adminLogin: string; emailLogin: string; badPhone: string; sendFailed: string;
  };
  cases: {
    title: string; none: string; open: string; type: string; employer: string; exitDate: string;
    bank: string; description: string; descriptionHint: string; submit: string; created: string;
    whatsTitle: string; whatsLead: string; whatsBtn: string; whatsMsg: (ref: string) => string;
    timeline: string; updates: string; noUpdates: string; documents: string; upload: string;
    noDocs: string; lawyer: string; noLawyer: string; deadline: string; channel: string;
    message: string; send: string; uploadHint: string;
    requests: string; requestsHint: string; uploading: (a: string, b: string) => string; uploadFailed: string; uploadDone: string; loginToSend: string; reattach: string;
  };
  lawyer: {
    title: string; assigned: string; unassigned: string; take: string; moveTo: string; update: string;
    updateHint: string; post: string; notVerified: string; license: string; firm: string; saveProfile: string;
  };
  article: {
    title: string; num: (n: string) => string; note: string; manage: string; manageLead: string;
    law: string; number: string; textAr: string; textBn: string; textEn: string; add: string; publish: string; unpublish: string;
    published: string; draft: string; remove: string; starter: string; starterDone: string; today: string;
  };
  staff: {
    nav: string; clients: string; clientsLead: string; apps: string; appsLead: string; pending: (n: string) => string;
    cases: string; lastCase: string; joined: string; search: string; noCases: string; openInbox: string;
    approve: string; reject: string; approved: string; rejected: string; pendingLabel: string; history: string;
    city: string; years: string; about: string; phone: string;
    applyTitle: string; applyLead: string; applyLogin: string; applySend: string; applySent: string; applyError: string;
    applyStatus: string; alreadyLawyer: string;
  };
  admin: { title: string; lawyers: string; verify: string; verified: string; cases: string; assign: string; none: string; makeLawyer: string; phone: string; email: string; reviews: string };
  common: { save: string; back: string; required: string; forbidden: string; notFound: string };
  info: {
    menu: string; contact: string; contactLead: string; feedback: string; feedbackLead: string;
    suggestion: string; complaint: string; kind: string; partners: string; partnersLead: string; partnersBody: string[];
    about: string; aboutBody: string[]; name: string; email: string; message: string; send: string; sent: string;
    error: string; inbox: string; becomePartner: string;
    how: string; howSteps: { title: string; body: string }[]; faq: string; faqItems: { q: string; a: string }[];
    privacy: string; privacyBody: string[]; joinLawyer: string; joinLawyerBody: string[]; joinLawyerCta: string;
  };
  inbox: {
    title: string; open: string; search: string; allTypes: string; allStatus: string; anyLawyer: string;
    assigned: string; unassigned: string; awaiting: string; newReply: string; filter: string; clear: string;
    waiting: (n: string) => string; lastActivity: string; results: (n: string) => string; status: string; client: string;
    notes: string; notesHint: string; addNote: string; noNotes: string;
    notifySubject: (ref: string) => string; notifyBody: (ref: string, url: string) => string;
  };
  visits: { title: string; today: string; week: string; month: string; total: string; visitors: string; views: string; pages: string; daily: string };
  gallery: { title: string; lead: string; empty: string; add: string; caption: string; file: string; hint: string; upload: string; remove: string; done: string; failed: string };
  marks: { scales: string; gavel: string; flag: string };
  labour: { more: string };
  status: { open: string; closed: string; close: string };
  reviews: {
    title: string; lead: string; empty: string; average: (avg: string, n: string) => string; write: string;
    rating: string; comment: string; submit: string; thanks: string; pending: string; approve: string; hide: string;
    stars: (n: number) => string; yours: string;
  };
};

const bn: Msgs = {
  brand: "হুকুকি",
  nav: { home: "হোম", myCases: "আমার মামলা", newCase: "নতুন মামলা", lawyer: "উকিল প্যানেল", admin: "অ্যাডমিন", login: "লগইন", logout: "লগআউট" },
  home: {
    eyebrow: "সৌদিতে থাকা ও সৌদি থেকে ফেরা প্রবাসীদের জন্য",
    title: "সৌদিতে আপনার মামলা ও টাকা, যেখানেই থাকুন দেখুন",
    lead: "সাধারণ, আদালতের ও ব্যবসায়িক মামলা, বিনিয়োগ ও প্রিমিয়াম রেসিডেন্সি, জমি ও বাড়ির মালিকানা, ওকালা তৈরি, কাগজপত্র অনুবাদ ও সত্যায়ন, হজ ও উমরাহ ভিসা, বেতন ও খিদমার শ্রম মামলা, আর ব্যাংকের টাকা। লাইসেন্সপ্রাপ্ত উকিল, আইন পরামর্শক ও অভিজ্ঞ বিশেষজ্ঞরা আপনার হয়ে কাজ করবেন, আর আপনি বাংলায় প্রতিটি ধাপ দেখবেন।",
    cta: "মামলা শুরু করুন",
    checkTitle: "বিনামূল্যে আপনার অবস্থা যাচাই করুন",
    checkLead: "৩টি প্রশ্নের উত্তর দিন। আমরা জানাব কোন অধিকার এখনো আদায় করা যায় এবং কত সময় বাকি।", pick: "কোন বিষয়ে সাহায্য চান?", pickLead: "একটি বিষয় বেছে নিন, তারপর তিনটি ঘর পূরণ করুন: ঘটনা, দাবি ও কাগজপত্র।" },
  check: {
    issues: "সৌদিতে আপনার কী আটকে আছে?", exitDate: "সৌদি ছাড়ার তারিখ (ফাইনাল এক্সিট)", bank: "সৌদি ব্যাংকে টাকা আছে",
    stopped: "কোম্পানি বেতন দেওয়া বন্ধ করেছে বা বন্ধ হয়ে গেছে", empty: "অন্তত একটি সমস্যা বেছে নিন।",
    labourTitle: "শ্রম মামলা: সময় চলছে", daysLeft: (n) => `${n} দিন বাকি`,
    labourBody: (d) => `চাকরি শেষ হওয়ার ১২ মাসের মধ্যে কিওয়া (Qiwa)-তে আপোস মীমাংসার আবেদন করতে হবে। শেষ তারিখ: ${d}।`,
    labourLateTitle: "শ্রম মামলার সময় সম্ভবত শেষ", labourLateBody: "১২ মাস পার হয়ে গেছে। তবু একজন উকিল দেখবেন কোনো ব্যতিক্রম আছে কিনা।",
    bankTitle: "ব্যাংকের টাকা আপনারই", bankBody: "ইকামার মেয়াদ শেষের ৯০ দিন পর অ্যাকাউন্ট ফ্রিজ হয়, ১৮০ দিন পর টাকা আলাদা অ্যাকাউন্টে যায়। টাকা হারায় না। উকিল ওকালার মাধ্যমে বাংলাদেশে টাকা পাঠানোর ব্যবস্থা করতে পারেন।",
    insTitle: "বেতন বীমা দাবি করা যেতে পারে", insBody: "অক্টোবর ২০২৪ থেকে কোম্পানি বেতন না দিলে বকেয়া বেতন ও দেশে ফেরার টিকিট বীমা থেকে দেওয়া হয়। বিদেশ থেকে কীভাবে দাবি করবেন, উকিল যাচাই করবেন।",
    otherTitle: "উকিলের মূল্যায়ন দরকার", otherBody: "মামলা, দুর্ঘটনা বা সম্পত্তির জন্য ওকালা দিয়ে একজন সৌদি উকিল নাজিজ (Najiz)-এ কাজ করবেন।",
    transTitle: "কাগজপত্র অনুবাদ ও সত্যায়ন", transBody: "সৌদি আদালত ও দপ্তরের জন্য বাংলা বা ইংরেজি কাগজপত্রের প্রত্যয়িত আরবি অনুবাদ (এবং উল্টোটাও), আর প্রয়োজনীয় সত্যায়ন: নোটারি, বাংলাদেশ পররাষ্ট্র মন্ত্রণালয় ও সৌদি দূতাবাস।",
    hajjTitle: "হজ ও উমরাহ ভিসা", hajjBody: "নুসুক (Nusuk) ও লাইসেন্সপ্রাপ্ত এজেন্টের মাধ্যমে আবেদন, আর আগের ইকামা থেকে কোনো প্রবেশ নিষেধাজ্ঞা আছে কিনা তা যাচাই।",
    comTitle: "ব্যবসায়িক মামলা", comBody: "পাওনা টাকা, চুক্তি, ব্যবসা বা অংশীদারিত্বের বিরোধ। সৌদি উকিল বাণিজ্যিক আদালতে (নাজিজ) ওকালার মাধ্যমে কাজ করবেন।",
    poaTitle: "ওকালা তৈরি", poaBody: "সৌদিতে উকিল বা আত্মীয়কে আপনার হয়ে কাজ করার ক্ষমতা দিতে ওকালা লাগে। ঢাকার সৌদি দূতাবাসের মাধ্যমে, অথবা স্থানীয় ওকালা সত্যায়ন করে, আমরা ধাপে ধাপে সাহায্য করি।",
    reTitle: "বিদেশিদের সম্পত্তি মালিকানার নিয়ম", reLead: "জানুয়ারি ২০২৬ থেকে কার্যকর অ-সৌদিদের সম্পত্তি মালিকানা আইন ও তার বিধিমালার সারসংক্ষেপ:",
    reRules: [
      { h: "সাধারণ ইকামাধারী", p: "বৈধ ইকামাধারী নিজের থাকার জন্য একটি বাড়ি কিনতে পারেন। মন্ত্রিসভা নির্ধারিত ও রিয়েল এস্টেট কর্তৃপক্ষ ঘোষিত এলাকাতেও কিনতে পারেন, রিয়েল এস্টেট রেজিস্ট্রিতে নিবন্ধনসহ।" },
      { h: "প্রিমিয়াম রেসিডেন্সিধারী", p: "আবাসিক, বাণিজ্যিক ও শিল্প সম্পত্তির মালিক হতে পারেন, মক্কা, মদিনা ও সীমান্ত এলাকা ছাড়া। ওই দুই শহরে নির্দিষ্ট মেয়াদে ব্যবহারের অধিকার পান।" },
      { h: "সৌদিতে না থাকা বিদেশি", p: "শুধু অনুমোদিত এলাকায় কিনতে পারেন, আবশিরে ডিজিটাল পরিচয় চালু করার পর।" },
      { h: "মক্কা ও মদিনা", p: "শুধু মুসলিমরা, নির্দিষ্ট এলাকায় ও বিশেষ শর্তে মালিক হতে পারেন।" },
      { h: "ব্যতিক্রম", p: "পারস্পরিকতার শর্তে দূতাবাস ও আন্তর্জাতিক সংস্থা, বিদেশি অংশীদারসহ কোম্পানি ও ফান্ড, এবং বিশেষ শর্তে অলাভজনক সংস্থা। উপসাগরীয় দেশের নাগরিকদের আলাদা আইন আছে।" },
      { h: "ফি ও শাস্তি", p: "অ-সৌদির সম্পত্তি লেনদেনে মূল্যের সর্বোচ্চ ৫% ফি, সঙ্গে রিয়েল এস্টেট লেনদেন কর। নিয়ম ভাঙলে ১ কোটি রিয়াল পর্যন্ত জরিমানা, আর ভুল তথ্যে কেনা সম্পত্তি নিলামে বিক্রি হতে পারে।" },
    ],
    reNote: "এটি নির্দেশনার জন্য সারসংক্ষেপ। এলাকা ও বিস্তারিত রিয়েল এস্টেট কর্তৃপক্ষ প্রকাশ ও হালনাগাদ করে। কেনার আগে উকিল আপনার অবস্থা যাচাই করবেন।",
    invTitle: "বিনিয়োগ ও প্রিমিয়াম রেসিডেন্সি", invBody: "সৌদিতে ব্যবসা শুরু, বিনিয়োগ লাইসেন্স (MISA) এবং প্রিমিয়াম রেসিডেন্সির শর্ত ও আবেদন নিয়ে উকিলের পরামর্শ।",
    genTitle: "অন্যান্য বিষয়", genBody: "উপরের কোনোটির সঙ্গে না মিললে এখানে লিখুন। একজন উকিল দেখে জানাবেন কী করা যায়।",
    disclaimer: "এটি একটি প্রাথমিক নির্দেশিকা, আইনি পরামর্শ নয়। চূড়ান্ত মূল্যায়ন করবেন সৌদি আরবের লাইসেন্সপ্রাপ্ত উকিল।",
  },
  bankStatus: { active: "এখনো চালু থাকতে পারে", frozen: "সম্ভবত ফ্রিজ", holding: "টাকা আলাদা অ্যাকাউন্টে", unclaimed: "দাবিহীন, কিন্তু টাকা আপনারই" },
  caseType: { salary: "বকেয়া বেতন", eosb: "খিদমা (সার্ভিস বেনিফিট)", bank: "ব্যাংকের টাকা", court: "চলমান মামলা", accident: "দুর্ঘটনার ক্ষতিপূরণ", property: "গাড়ি বা সম্পত্তি", translation: "কাগজপত্র অনুবাদ ও সত্যায়ন", hajj: "হজ ও উমরাহ ভিসা", labour: "শ্রম মামলা (বেতন ও খিদমা)", commercial: "ব্যবসায়িক মামলা", general: "সাধারণ মামলা", poa: "ওকালা (পাওয়ার অব অ্যাটর্নি) তৈরি", invest: "সৌদিতে বিনিয়োগ ও প্রিমিয়াম রেসিডেন্সি", realestate: "জমি ও বাড়ির মালিকানা" },
  stage: { submitted: "জমা হয়েছে", review: "উকিল দেখছেন", poa: "ওকালা প্রস্তুত", filed: "আবেদন জমা", hearing: "বৈঠক / শুনানি", judgment: "রায় / উত্তর", payout: "টাকা পাঠানো", closed: "বন্ধ" },
  auth: {
    title: "ইমেইল দিয়ে লগইন", email: "ইমেইল", emailHint: "আমরা আপনার ইমেইলে একটি ৬ সংখ্যার কোড পাঠাব।", send: "কোড পাঠান",
    code: "৬ সংখ্যার কোড", verify: "লগইন", name: "আপনার নাম", badEmail: "সঠিক ইমেইল লিখুন।", badCode: "কোডটি ভুল বা মেয়াদোত্তীর্ণ।",
    rate: "অনেকবার চেষ্টা হয়েছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।", codeSent: "আপনার ইমেইলে কোড পাঠানো হয়েছে:", devCode: (c) => `ডেমো মোড: কোড ${c}`,
    emailSubject: "হুকুকি লগইন কোড", emailBody: (c) => `আপনার লগইন কোড: ${c}\nকোডটি ১০ মিনিট বৈধ। আপনি না চাইলে এই ইমেইল উপেক্ষা করুন।`,
    phone: "মোবাইল নম্বর", phoneHint: "শুধু অ্যাডমিনের জন্য।", adminLogin: "অ্যাডমিন লগইন (মোবাইল নম্বর)", emailLogin: "ইমেইল দিয়ে লগইন", badPhone: "এই নম্বর দিয়ে লগইন করা যাবে না।", sendFailed: "এখন কোড পাঠানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
  },
  cases: {
    title: "আমার মামলা", none: "এখনো কোনো মামলা নেই।", open: "নতুন মামলা খুলুন", type: "সমস্যার ধরন", employer: "কোম্পানি বা কফিলের নাম",
    exitDate: "সৌদি ছাড়ার তারিখ", bank: "ব্যাংকের নাম", description: "সংক্ষেপে ঘটনা", descriptionHint: "কী হয়েছে এবং কবে, সংক্ষেপে যেকোনো ভাষায় লিখুন।",
    submit: "মামলা জমা দিন", whatsTitle: "হোয়াটসঅ্যাপে যোগাযোগ", whatsLead: "দ্রুত যোগাযোগের জন্য আমাদের হোয়াটসঅ্যাপে মেসেজ দিন। মামলা নম্বর সাথে যাবে।", whatsBtn: "হোয়াটসঅ্যাপে মেসেজ দিন", whatsMsg: (ref: string) => `আসসালামু আলাইকুম, আমি হুকুকি-তে মামলা ${ref} জমা দিয়েছি।`, created: "মামলা জমা হয়েছে। ৪৮ ঘণ্টার মধ্যে একজন উকিল দেখবেন।", timeline: "অগ্রগতি", updates: "আপডেট",
    noUpdates: "এখনো কোনো আপডেট নেই।", documents: "কাগজপত্র", upload: "আপলোড", noDocs: "কোনো কাগজ আপলোড হয়নি।", lawyer: "উকিল",
    noLawyer: "উকিল নিয়োগের অপেক্ষায়", deadline: "শ্রম মামলার শেষ তারিখ", channel: "সরকারি মাধ্যম", message: "উকিলকে বার্তা", send: "পাঠান",
    uploadHint: "পাসপোর্ট, ইকামা, চুক্তি, বেতনের স্লিপ। PDF, ছবি বা Word, ১০০০ পৃষ্ঠা পর্যন্ত (প্রতি ফাইল ৫০০ MB পর্যন্ত), একসাথে কয়েকটি ফাইল দেওয়া যায়।",
    requests: "আপনার দাবি", requestsHint: "আপনি এখন কী চান? যেমন: বকেয়া বেতন আদায়, ব্যাংকের টাকা দেশে পাঠানো।",
    uploading: (a, b) => `ফাইল আপলোড হচ্ছে ${a} / ${b}…`, uploadFailed: "কিছু ফাইল আপলোড হয়নি। মামলার পাতা থেকে আবার চেষ্টা করুন।", uploadDone: "ফাইল আপলোড হয়েছে।",
    loginToSend: "লগইন করে জমা দিন", reattach: "আপনার লেখা রাখা আছে। লগইনের পর কাগজপত্র আবার বেছে নিন।",
  },
  lawyer: {
    title: "উকিল প্যানেল", assigned: "আমার মামলা", unassigned: "নতুন মামলা", take: "মামলা নিন", moveTo: "পরবর্তী ধাপ", update: "আপডেট লিখুন",
    updateHint: "ক্লায়েন্ট এটি নিজের ভাষায় দেখবেন।", post: "আপডেট দিন", notVerified: "আপনার লাইসেন্স এখনো যাচাই হয়নি।",
    license: "লাইসেন্স নম্বর", firm: "ল ফার্ম", saveProfile: "সংরক্ষণ",
  },
  article: {
    title: "আজকের আইনি ধারা", num: (n) => `ধারা ${n}`, note: "সংক্ষিপ্ত ব্যাখ্যা, আইনের হুবহু ভাষা নয়। আপনার মামলার জন্য উকিলের পরামর্শ নিন।",
    manage: "আজকের ধারা", manageLead: "প্রতিদিন হোম পেজে একটি প্রকাশিত ধারা দেখানো হয়, রিয়াদ সময় অনুযায়ী পালাক্রমে।",
    law: "আইনের নাম", number: "ধারা নম্বর", textAr: "ব্যাখ্যা (আরবি)", textBn: "ব্যাখ্যা (বাংলা)", textEn: "ব্যাখ্যা (ইংরেজি)", add: "ধারা যোগ করুন",
    publish: "প্রকাশ করুন", unpublish: "প্রকাশ বন্ধ", published: "প্রকাশিত", draft: "পর্যালোচনার অপেক্ষায়", remove: "মুছুন",
    starter: "শ্রম আইনের প্রাথমিক ধারাগুলো যোগ করুন", starterDone: "যোগ হয়েছে। প্রকাশের আগে প্রতিটি পর্যালোচনা করুন।", today: "আজ দেখানো হচ্ছে",
  },
  staff: {
    nav: "পরিচালনা", clients: "গ্রাহক ও তাদের মামলা", clientsLead: "প্রতিটি গ্রাহক, তাদের মামলা সংখ্যা ও সর্বশেষ মামলা।",
    apps: "উকিলদের আবেদন", appsLead: "যোগ দিতে চাওয়া উকিলদের আবেদন। গ্রহণ করলে তিনি যাচাইকৃত উকিল হবেন।", pending: (n) => `${n}টি অপেক্ষমাণ`,
    cases: "মামলা", lastCase: "সর্বশেষ মামলা", joined: "যোগদান", search: "নাম, ইমেইল, মোবাইল বা মামলা নম্বর দিয়ে খুঁজুন", noCases: "কোনো মামলা নেই", openInbox: "মামলার ইনবক্সে দেখুন",
    approve: "গ্রহণ করুন", reject: "প্রত্যাখ্যান", approved: "গৃহীত", rejected: "প্রত্যাখ্যাত", pendingLabel: "অপেক্ষমাণ", history: "আগের আবেদন",
    city: "শহর", years: "অভিজ্ঞতার বছর", about: "আপনার সম্পর্কে সংক্ষেপে", phone: "মোবাইল",
    applyTitle: "উকিল হিসেবে আবেদন", applyLead: "তথ্য দিন। অ্যাডমিন লাইসেন্স যাচাই করে আবেদন গ্রহণ করবেন।", applyLogin: "আবেদন করতে আগে ইমেইল দিয়ে লগইন করুন",
    applySend: "আবেদন পাঠান", applySent: "আপনার আবেদন পৌঁছেছে। যাচাইয়ের পর জানানো হবে।", applyError: "লাইসেন্স নম্বর ও মোবাইল দিন।",
    applyStatus: "আবেদনের অবস্থা", alreadyLawyer: "আপনি ইতিমধ্যে উকিল হিসেবে নিবন্ধিত।",
  },
  admin: { title: "অ্যাডমিন", lawyers: "উকিল", verify: "যাচাই করুন", verified: "যাচাইকৃত", cases: "সব মামলা", assign: "উকিল দিন", none: "কিছু নেই", makeLawyer: "উকিল হিসেবে যোগ করুন", phone: "মোবাইল", email: "ইমেইল", reviews: "মূল্যায়ন" },
  common: { save: "সংরক্ষণ", back: "পেছনে", required: "এই ঘরটি পূরণ করুন।", forbidden: "এই পাতায় আপনার প্রবেশাধিকার নেই।", notFound: "পাওয়া যায়নি।" },
  info: {
    menu: "মেনু", contact: "যোগাযোগ করুন", contactLead: "প্রশ্ন বা সাহায্যের জন্য লিখুন। আমরা ইমেইলে উত্তর দেব।",
    feedback: "পরামর্শ ও অভিযোগ", feedbackLead: "আমাদের আরও ভালো করতে আপনার পরামর্শ বা অভিযোগ জানান।",
    suggestion: "পরামর্শ", complaint: "অভিযোগ", kind: "ধরন",
    partners: "আমাদের অংশীদার", partnersLead: "যাঁদের সঙ্গে আমরা কাজ করি।",
    partnersBody: ["সৌদি আরবের লাইসেন্সপ্রাপ্ত আইনজীবী ও ল ফার্ম, যাঁরা ওকালার মাধ্যমে মামলা চালান।", "প্রত্যয়িত অনুবাদ অফিস, আদালত ও দপ্তরের কাগজপত্রের জন্য।", "বাংলাদেশে প্রবাসী ও ফেরত আসা কর্মীদের সেবা দেওয়া প্রতিষ্ঠান।"],
    about: "আমাদের সম্পর্কে",
    aboutBody: ["হুকুকি সৌদিতে থাকা ও সৌদি থেকে ফেরা বাংলাদেশি প্রবাসীদের সৌদি আরবে তাদের মামলা ও অধিকার আদায়ে সাহায্য করে: সাধারণ, আদালতের ও ব্যবসায়িক মামলা, বিনিয়োগ ও প্রিমিয়াম রেসিডেন্সি, ওকালা তৈরি, কাগজপত্র অনুবাদ ও সত্যায়ন, হজ ও উমরাহ ভিসা, বেতন ও খিদমার শ্রম মামলা, আর ব্যাংকের টাকা।", "সৌদি আরবের লাইসেন্সপ্রাপ্ত উকিল আপনার হয়ে কাজ করেন, আর আপনি যেখানেই থাকুন নিজের ভাষায় সব দেখতে পান।"],
    name: "নাম", email: "ইমেইল", message: "বার্তা", send: "পাঠান", sent: "ধন্যবাদ, আপনার বার্তা পৌঁছেছে।", error: "নাম, সঠিক ইমেইল ও বার্তা লিখুন।",
    inbox: "বার্তা, পরামর্শ ও অভিযোগ", becomePartner: "অংশীদার হতে চাইলে যোগাযোগ করুন",
    how: "কীভাবে কাজ করে",
    howSteps: [
      { title: "বিষয় বেছে নিন", body: "মামলার ধরন বেছে নিয়ে তিনটি ঘর পূরণ করুন: ঘটনা, দাবি ও কাগজপত্র।" },
      { title: "উকিল দেখবেন", body: "সৌদি আরবের একজন লাইসেন্সপ্রাপ্ত উকিল মামলাটি পর্যালোচনা করে নেবেন।" },
      { title: "ওকালা (পাওয়ার অব অ্যাটর্নি)", body: "প্রয়োজনে উকিল আপনার পক্ষে কাজ করার জন্য ওকালা প্রস্তুত করবেন।" },
      { title: "অগ্রগতি দেখুন", body: "উকিলের প্রতিটি আপডেট আপনি নিজের ভাষায় দেখবেন এবং বার্তা পাঠাতে পারবেন।" },
    ],
    faq: "সাধারণ প্রশ্ন",
    faqItems: [
      { q: "সৌদি ছেড়ে আসার পরও কি অধিকার আদায় সম্ভব?", a: "হ্যাঁ। একজন সৌদি উকিল ওকালার মাধ্যমে আপনার হয়ে কাজ করতে পারেন। আপনাকে সৌদিতে যেতে হবে না।" },
      { q: "ব্যাংকের টাকা কি হারিয়ে যায়?", a: "না। ইকামার মেয়াদ শেষ হলে অ্যাকাউন্ট ফ্রিজ হয়, কিন্তু টাকা আপনারই থাকে।" },
      { q: "শ্রম মামলার কি সময়সীমা আছে?", a: "হ্যাঁ, চাকরি শেষ হওয়ার ১২ মাসের মধ্যে মামলা করতে হয়। তাই দেরি করবেন না।" },
      { q: "আমার কাগজপত্র কি নিরাপদ?", a: "কাগজপত্র গোপনে রাখা হয়। শুধু আপনি, আপনার উকিল ও অ্যাডমিন দেখতে পারেন।" },
    ],
    privacy: "গোপনীয়তা",
    privacyBody: ["আমরা শুধু মামলার জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি: আপনার ইমেইল, নাম, মামলার বিবরণ ও কাগজপত্র।", "আপনার মামলা ও কাগজপত্র শুধু আপনি, নিযুক্ত উকিল ও অ্যাডমিন দেখতে পারেন। আমরা কারো কাছে তথ্য বিক্রি করি না।", "ভিজিটর গণনার জন্য আমরা একটি বেনামি কুকি ব্যবহার করি, যাতে আপনার পরিচয় থাকে না।", "আপনার তথ্য মুছে ফেলতে চাইলে ‘যোগাযোগ করুন’ থেকে আমাদের লিখুন।"],
    joinLawyer: "উকিল হিসেবে যোগ দিন",
    joinLawyerBody: ["আপনি যদি সৌদি আরবের লাইসেন্সপ্রাপ্ত উকিল হন, বিদেশি কর্মীদের মামলায় আমাদের সঙ্গে কাজ করুন।", "লাইসেন্স যাচাইয়ের পর আপনি নতুন মামলা নিতে পারবেন।"],
    joinLawyerCta: "আবেদন করতে যোগাযোগ করুন",
  },
  inbox: {
    title: "মামলার ইনবক্স", open: "মামলার ইনবক্স খুলুন", search: "মামলা নম্বর, নাম বা ইমেইল", allTypes: "সব ধরন", allStatus: "সব অবস্থা", anyLawyer: "সব উকিল",
    assigned: "উকিল আছে", unassigned: "উকিল নেই", awaiting: "উত্তরের অপেক্ষায়", newReply: "নতুন বার্তা", filter: "খুঁজুন", clear: "মুছুন",
    waiting: (n) => `${n}টি মামলা উত্তরের অপেক্ষায়`, lastActivity: "সর্বশেষ", status: "অবস্থা", client: "ক্লায়েন্ট", results: (n) => `${n}টি মামলা`,
    notes: "অভ্যন্তরীণ নোট", notesHint: "শুধু উকিল ও অ্যাডমিন দেখতে পান, ক্লায়েন্ট দেখেন না।", addNote: "নোট যোগ করুন", noNotes: "কোনো নোট নেই।",
    notifySubject: (ref) => `মামলা ${ref}: ক্লায়েন্টের নতুন বার্তা`, notifyBody: (ref, url) => `মামলা ${ref}-এ ক্লায়েন্ট নতুন বার্তা বা কাগজ পাঠিয়েছেন।\n${url}`,
  },
  visits: { title: "ভিজিটর", today: "আজ", week: "৭ দিন", month: "৩০ দিন", total: "মোট", visitors: "ভিজিটর", views: "পেজ ভিউ", pages: "সবচেয়ে দেখা পাতা (৩০ দিন)", daily: "গত ১৪ দিন" },
  gallery: { title: "ছবি ও ভিডিও", lead: "আমাদের কাজ ও খবর।", empty: "শিগগিরই ছবি ও ভিডিও আসছে।", add: "ছবি বা ভিডিও যোগ করুন", caption: "ক্যাপশন (ঐচ্ছিক)", file: "ফাইল", hint: "ছবি (JPG, PNG, WEBP) বা ভিডিও (MP4, WEBM), ভিডিও ৫০০ MB পর্যন্ত।", upload: "আপলোড", remove: "সরান", done: "যোগ হয়েছে।", failed: "আপলোড হয়নি।" },
  marks: { scales: "ন্যায়ের দাঁড়িপাল্লা", gavel: "বিচারকের হাতুড়ি", flag: "বাংলাদেশের পতাকা" },
  labour: { more: "শ্রম মামলার সময়সীমা ও বিস্তারিত" },
  status: { open: "চলমান", closed: "বন্ধ", close: "মামলা বন্ধ করুন" },
  reviews: {
    title: "গ্রাহকদের মতামত", lead: "যাঁরা হুকুকির মাধ্যমে মামলা চালিয়েছেন তাঁদের মূল্যায়ন।", empty: "এখনো কোনো মূল্যায়ন নেই।",
    average: (a, n) => `${a} / ৫ · ${n}টি মূল্যায়ন`, write: "উকিলকে মূল্যায়ন করুন", rating: "রেটিং", comment: "আপনার মতামত (ঐচ্ছিক)",
    submit: "মূল্যায়ন পাঠান", thanks: "ধন্যবাদ! আপনার মূল্যায়ন পর্যালোচনার পর প্রকাশিত হবে।", pending: "পর্যালোচনার অপেক্ষায়",
    approve: "প্রকাশ করুন", hide: "লুকান", stars: (n) => `${n} তারা`, yours: "আপনার মূল্যায়ন",
  },
};

const ar: Msgs = {
  brand: "حقوقي",
  nav: { home: "الرئيسية", myCases: "قضاياي", newCase: "قضية جديدة", lawyer: "لوحة المحامي", admin: "الإدارة", login: "دخول", logout: "خروج" },
  home: {
    eyebrow: "للعمالة الوافدة في السعودية والعائدة منها",
    title: "قضاياك وأموالك في السعودية، تتابعها أينما كنت",
    lead: "القضايا العامة والقضايا القائمة في المحاكم والقضايا التجارية، والاستثمار والإقامة المميزة، وتملك العقارات والمنازل، وإصدار الوكالات، وترجمة المستندات ومصادقتها، وتأشيرات الحج والعمرة، والقضايا العمالية من رواتب ومكافأة نهاية خدمة، والرصيد البنكي. مع محامين مرخّصين ومستشارين قانونيين وأصحاب خبرة يعملون نيابةً عنك، وأنت تتابع كل خطوة بلغتك.",
    cta: "ابدأ قضيتك",
    checkTitle: "افحص حالتك مجاناً",
    checkLead: "أجب عن 3 أسئلة، ونخبرك بما يمكن استرداده وكم بقي من الوقت.", pick: "بماذا نساعدك؟", pickLead: "اختر نوع القضية، ثم عبّئ الخانات الثلاث: الوقائع، والطلبات، والمستندات." },
  check: {
    issues: "ما الذي بقي لك في السعودية؟", exitDate: "تاريخ الخروج النهائي", bank: "لدي رصيد في بنك سعودي",
    stopped: "الشركة توقفت عن دفع الرواتب أو أغلقت", empty: "اختر مشكلة واحدة على الأقل.",
    labourTitle: "القضية العمالية: الوقت يمضي", daysLeft: (n) => `باقي ${n} يوماً`,
    labourBody: (d) => `يجب تقديم طلب التسوية الودية في منصة قوى خلال 12 شهراً من انتهاء العمل. آخر موعد: ${d}.`,
    labourLateTitle: "مهلة القضية العمالية انتهت على الأرجح", labourLateBody: "مرّت 12 شهراً. ومع ذلك يراجع المحامي إن كان هناك استثناء.",
    bankTitle: "رصيدك في البنك ما زال لك", bankBody: "يُجمّد الحساب بعد 90 يوماً من انتهاء الإقامة، ويُنقل الرصيد إلى حساب موحّد بعد 180 يوماً. المال لا يضيع، ويستطيع المحامي بالوكالة طلب تحويله إلى حسابك في بلدك.",
    insTitle: "قد تستحق تأمين حماية الأجور", insBody: "منذ أكتوبر 2024 يغطي التأمين الرواتب غير المدفوعة وتذكرة العودة عند تعثر المنشأة. يتحقق المحامي من طريقة المطالبة من الخارج.",
    otherTitle: "يحتاج تقييم محامٍ", otherBody: "للقضايا والحوادث والممتلكات، يتابع محامٍ سعودي بالوكالة عبر منصة ناجز.",
    transTitle: "ترجمة المستندات ومصادقتها", transBody: "ترجمة معتمدة إلى العربية لمستنداتك البنغالية أو الإنجليزية (وبالعكس)، مع المصادقات اللازمة لقبولها في السعودية: التوثيق، ووزارة الخارجية البنغلاديشية، والسفارة السعودية.",
    hajjTitle: "تأشيرات الحج والعمرة", hajjBody: "التقديم عبر منصة نُسُك والوكلاء المرخصين، والتحقق من عدم وجود منع دخول بسبب إقامتك السابقة.",
    comTitle: "القضايا التجارية", comBody: "المطالبات المالية والعقود وخلافات الشراكة والأعمال، يتابعها محامٍ سعودي بالوكالة أمام المحكمة التجارية عبر ناجز.",
    poaTitle: "إصدار الوكالات", poaBody: "لتوكيل محامٍ أو قريب في السعودية ليتابع عنك. نساعدك خطوة بخطوة: عبر السفارة السعودية في دكا، أو توثيق وكالة محلية وتصديقها.",
    reTitle: "ضوابط تملك غير السعوديين للعقار", reLead: "ملخص النظام المحدث لتملك غير السعوديين للعقار، النافذ من يناير 2026، ولائحته التنفيذية:",
    reRules: [
      { h: "المقيم إقامة عادية", p: "يحق للمقيم إقامة نظامية تملك عقار لسكنه الخاص، ويتملك كذلك في النطاقات الجغرافية التي يحددها مجلس الوزراء وتعلنها الهيئة العامة للعقار، مع التسجيل في السجل العقاري." },
      { h: "حامل الإقامة المميزة", p: "يتملك العقار السكني والتجاري والصناعي وفق نظام الإقامة المميزة، عدا مكة المكرمة والمدينة المنورة والمناطق الحدودية، وله فيهما حق الانتفاع لمدة محددة بحسب الأنظمة." },
      { h: "غير المقيم", p: "يتملك داخل النطاقات المعتمدة فقط، بعد تفعيل هويته الرقمية في أبشر." },
      { h: "مكة المكرمة والمدينة المنورة", p: "التملك فيهما للمسلمين فقط، داخل النطاقات المحددة وبضوابط خاصة." },
      { h: "الاستثناءات", p: "البعثات الدبلوماسية والمنظمات الدولية بشرط المعاملة بالمثل وموافقة وزارة الخارجية، والشركات والصناديق التي فيها شريك غير سعودي، والجهات غير الربحية بضوابط خاصة. ولمواطني دول الخليج نظام تملك مستقل." },
      { h: "الرسوم والعقوبات", p: "رسم على التصرف العقاري لغير السعودي لا يزيد على 5% من قيمته، إضافة إلى ضريبة التصرفات العقارية. والمخالفة غرامتها حتى 10 ملايين ريال، وقد يُباع العقار بالمزاد إذا تم تملكه بمعلومات مضللة." },
    ],
    reNote: "هذا ملخص للإرشاد، والنطاقات والتفاصيل تصدر وتتحدث من الهيئة العامة للعقار. يتحقق المحامي من وضعك قبل أي شراء.",
    invTitle: "الاستثمار والإقامة المميزة", invBody: "استشارة محامٍ في بدء نشاط تجاري بالسعودية، وتراخيص وزارة الاستثمار، وشروط الإقامة المميزة وطريقة التقديم.",
    genTitle: "قضايا عامة", genBody: "إذا لم تجد خياراً يناسب مشكلتك فاكتبها هنا، ويراجعها محامٍ ويخبرك بما يمكن عمله.",
    disclaimer: "هذا إرشاد أولي وليس استشارة قانونية. التقييم النهائي يقدمه محامٍ سعودي مرخّص.",
  },
  bankStatus: { active: "قد يكون نشطاً", frozen: "مجمّد غالباً", holding: "الرصيد في حساب موحّد", unclaimed: "غير مطالَب به، والمال ما زال لك" },
  caseType: { salary: "رواتب متأخرة", eosb: "مكافأة نهاية الخدمة", bank: "رصيد بنكي", court: "قضية قائمة", accident: "تعويض حادث", property: "سيارة أو ممتلكات", translation: "ترجمة المستندات ومصادقتها", hajj: "تأشيرات الحج والعمرة", labour: "قضية عمالية (رواتب ونهاية خدمة)", commercial: "قضايا تجارية", general: "قضايا عامة", poa: "إصدار الوكالات", invest: "الاستثمار في السعودية والإقامة المميزة", realestate: "تملك العقارات والمنازل" },
  stage: { submitted: "مُقدَّمة", review: "قيد المراجعة", poa: "إعداد الوكالة", filed: "تم التقديم", hearing: "جلسات", judgment: "الحكم / الرد", payout: "التحويل", closed: "مغلقة" },
  auth: {
    title: "الدخول بالبريد الإلكتروني", email: "البريد الإلكتروني", emailHint: "نرسل إلى بريدك رمزاً من 6 أرقام.", send: "أرسل الرمز",
    code: "الرمز المكوّن من 6 أرقام", verify: "دخول", name: "اسمك", badEmail: "اكتب بريداً إلكترونياً صحيحاً.", badCode: "الرمز غير صحيح أو منتهي.",
    rate: "محاولات كثيرة. حاول بعد ساعة.", codeSent: "أرسلنا الرمز إلى بريدك:", devCode: (c) => `الوضع التجريبي: الرمز ${c}`,
    emailSubject: "رمز الدخول إلى حقوقي", emailBody: (c) => `رمز الدخول: ${c}\nالرمز صالح لمدة 10 دقائق. إذا لم تطلبه فتجاهل هذه الرسالة.`,
    phone: "رقم الجوال", phoneHint: "للإدارة فقط.", adminLogin: "دخول الإدارة برقم الجوال", emailLogin: "الدخول بالبريد الإلكتروني", badPhone: "لا يمكن الدخول بهذا الرقم.", sendFailed: "تعذّر إرسال الرمز الآن. حاول بعد قليل.",
  },
  cases: {
    title: "قضاياي", none: "لا توجد قضايا بعد.", open: "افتح قضية جديدة", type: "نوع المشكلة", employer: "اسم الشركة أو الكفيل",
    exitDate: "تاريخ الخروج", bank: "اسم البنك", description: "الوقائع باختصار", descriptionHint: "ماذا حدث ومتى، باختصار وبأي لغة.",
    submit: "قدّم القضية", whatsTitle: "التواصل عبر واتساب", whatsLead: "للتواصل السريع راسلنا على واتساب، وسيُرسل رقم القضية مع رسالتك.", whatsBtn: "راسلنا على واتساب", whatsMsg: (ref: string) => `السلام عليكم، قدّمت طلبي في منصة حقوقي برقم ${ref}.`, created: "تم تقديم القضية. سيراجعها محامٍ خلال 48 ساعة.", timeline: "المراحل", updates: "التحديثات",
    noUpdates: "لا توجد تحديثات بعد.", documents: "المستندات", upload: "رفع", noDocs: "لم تُرفع مستندات.", lawyer: "المحامي",
    noLawyer: "بانتظار تعيين محامٍ", deadline: "آخر موعد للقضية العمالية", channel: "القناة الرسمية", message: "رسالة للمحامي", send: "إرسال",
    uploadHint: "الجواز، الإقامة، العقد، كشوف الراتب. PDF أو صور أو Word حتى 1000 صفحة (حتى 500 ميجابايت للملف)، ويمكن رفع عدة ملفات معاً.",
    requests: "الطلبات", requestsHint: "ماذا تطلب الآن؟ مثلاً: صرف الرواتب المتأخرة، تحويل رصيد البنك إلى بنغلاديش.",
    uploading: (a, b) => `جاري رفع الملفات ${a} من ${b}…`, uploadFailed: "تعذّر رفع بعض الملفات. حاول مرة أخرى من صفحة القضية.", uploadDone: "تم رفع الملفات.",
    loginToSend: "سجّل الدخول وأرسل", reattach: "حفظنا ما كتبته. اختر المستندات مرة أخرى بعد الدخول.",
  },
  lawyer: {
    title: "لوحة المحامي", assigned: "قضاياي", unassigned: "قضايا جديدة", take: "استلم القضية", moveTo: "المرحلة التالية", update: "اكتب تحديثاً",
    updateHint: "يراه العميل بلغته.", post: "انشر التحديث", notVerified: "لم يتم التحقق من ترخيصك بعد.",
    license: "رقم الترخيص", firm: "مكتب المحاماة", saveProfile: "حفظ",
  },
  article: {
    title: "مادة اليوم", num: (n) => `المادة ${n}`, note: "شرح مختصر وليس نص النظام حرفياً. استشر محامياً في قضيتك.",
    manage: "مادة اليوم", manageLead: "تظهر في الصفحة الرئيسية كل يوم مادة واحدة من المواد المنشورة، بالتناوب حسب توقيت الرياض.",
    law: "اسم النظام", number: "رقم المادة", textAr: "الشرح بالعربي", textBn: "الشرح بالبنغالي", textEn: "الشرح بالإنجليزي", add: "أضف المادة",
    publish: "نشر", unpublish: "إيقاف النشر", published: "منشورة", draft: "بانتظار المراجعة", remove: "حذف",
    starter: "أضف الدفعة الأولى من مواد نظام العمل", starterDone: "تمت الإضافة. راجع كل مادة قبل نشرها.", today: "معروضة اليوم",
  },
  staff: {
    nav: "الإدارة", clients: "العملاء وقضاياهم", clientsLead: "كل عميل مع عدد قضاياه وآخر قضية له.",
    apps: "طلبات المحامين", appsLead: "طلبات المحامين الراغبين بالانضمام. القبول يجعله محامياً موثّقاً.", pending: (n) => `${n} بانتظار القرار`,
    cases: "القضايا", lastCase: "آخر قضية", joined: "التسجيل", search: "ابحث بالاسم أو البريد أو الجوال أو رقم القضية", noCases: "لا توجد قضايا", openInbox: "عرضها في صندوق القضايا",
    approve: "قبول", reject: "رفض", approved: "مقبول", rejected: "مرفوض", pendingLabel: "بانتظار القرار", history: "طلبات سابقة",
    city: "المدينة", years: "سنوات الخبرة", about: "نبذة مختصرة عنك", phone: "الجوال",
    applyTitle: "طلب الانضمام كمحامٍ", applyLead: "عبّئ بياناتك، وتتحقق الإدارة من الترخيص ثم تقبل الطلب.", applyLogin: "سجّل الدخول بالبريد أولاً لتقديم الطلب",
    applySend: "أرسل الطلب", applySent: "وصلنا طلبك، وسنبلغك بعد التحقق.", applyError: "أدخل رقم الترخيص ورقم الجوال.",
    applyStatus: "حالة الطلب", alreadyLawyer: "أنت مسجّل محامياً بالفعل.",
  },
  admin: { title: "الإدارة", lawyers: "المحامون", verify: "توثيق", verified: "موثّق", cases: "كل القضايا", assign: "تعيين محامٍ", none: "لا شيء", makeLawyer: "إضافة كمحامٍ", phone: "الجوال", email: "البريد", reviews: "التقييمات" },
  common: { save: "حفظ", back: "رجوع", required: "هذا الحقل مطلوب.", forbidden: "ليست لديك صلاحية لهذه الصفحة.", notFound: "غير موجود." },
  info: {
    menu: "القائمة", contact: "تواصل معنا", contactLead: "اكتب لنا سؤالك أو طلبك، ونرد عليك على بريدك.",
    feedback: "المقترحات والشكاوى", feedbackLead: "شاركنا مقترحك أو شكواك لنحسّن خدمتنا.",
    suggestion: "مقترح", complaint: "شكوى", kind: "النوع",
    partners: "شركاؤنا", partnersLead: "الجهات التي نعمل معها.",
    partnersBody: ["محامون ومكاتب محاماة سعودية مرخصة، يتابعون القضايا بالوكالة.", "مكاتب ترجمة معتمدة لمستندات المحاكم والجهات الرسمية.", "جهات في بنغلاديش تخدم العمالة المغتربة والعائدة."],
    about: "التعريف بنا",
    aboutBody: ["حقوقي منصة تساعد العمالة البنغلاديشية الوافدة في السعودية والعائدة منها في قضاياها وحقوقها هناك: القضايا العامة والقائمة في المحاكم والتجارية، والاستثمار والإقامة المميزة، وإصدار الوكالات، وترجمة المستندات ومصادقتها، وتأشيرات الحج والعمرة، والقضايا العمالية من رواتب ومكافأة نهاية خدمة، والأرصدة البنكية.", "يعمل محامٍ سعودي مرخّص نيابةً عن العميل، والعميل يتابع كل شيء أينما كان وبلغته."],
    name: "الاسم", email: "البريد الإلكتروني", message: "الرسالة", send: "إرسال", sent: "شكراً، وصلتنا رسالتك.", error: "اكتب الاسم وبريداً صحيحاً والرسالة.",
    inbox: "الرسائل والمقترحات والشكاوى", becomePartner: "للانضمام كشريك تواصل معنا",
    how: "كيف تعمل المنصة",
    howSteps: [
      { title: "اختر نوع القضية", body: "اختر الخيار المناسب وعبّئ الخانات الثلاث: الوقائع، والطلبات، والمستندات." },
      { title: "مراجعة المحامي", body: "يراجع القضية محامٍ سعودي مرخّص ويستلمها." },
      { title: "الوكالة", body: "عند الحاجة يجهّز المحامي وكالة ليعمل نيابةً عنك." },
      { title: "تابع قضيتك", body: "تصلك تحديثات المحامي بلغتك، وتقدر تراسله من المنصة." },
    ],
    faq: "الأسئلة الشائعة",
    faqItems: [
      { q: "هل أقدر أطالب بحقوقي بعد ما غادرت السعودية؟", a: "نعم. يقدر محامٍ سعودي يتابع عنك بالوكالة، وما تحتاج ترجع للسعودية." },
      { q: "هل تضيع فلوسي في البنك؟", a: "لا. الحساب يُجمَّد بعد انتهاء الإقامة، لكن المال يبقى حقك." },
      { q: "هل للقضية العمالية مهلة؟", a: "نعم، تُرفع خلال 12 شهراً من انتهاء العلاقة العمالية، فلا تتأخر." },
      { q: "هل مستنداتي في أمان؟", a: "المستندات محفوظة بشكل خاص، ولا يطّلع عليها إلا أنت ومحاميك والإدارة." },
    ],
    privacy: "الخصوصية",
    privacyBody: ["نجمع فقط ما تحتاجه القضية: بريدك، واسمك، وتفاصيل القضية، والمستندات.", "قضيتك ومستنداتك لا يراها إلا أنت والمحامي المكلّف والإدارة، ولا نبيع بياناتك لأي جهة.", "نستخدم معرّفاً مجهولاً في المتصفح لعدّ الزيارات فقط، ولا يحمل أي معلومة عنك.", "لحذف بياناتك، راسلنا من صفحة «تواصل معنا»."],
    joinLawyer: "انضم كمحامٍ",
    joinLawyerBody: ["إذا كنت محامياً سعودياً مرخّصاً، انضم إلينا لمتابعة قضايا العمالة الوافدة.", "بعد التحقق من الترخيص تقدر تستلم القضايا الجديدة."],
    joinLawyerCta: "تواصل معنا للتقديم",
  },
  inbox: {
    title: "صندوق القضايا", open: "افتح صندوق القضايا", search: "رقم القضية أو الاسم أو البريد", allTypes: "كل الأنواع", allStatus: "كل الحالات", anyLawyer: "كل المحامين",
    assigned: "عندها محامٍ", unassigned: "بدون محامٍ", awaiting: "بانتظار الرد", newReply: "رد جديد", filter: "بحث", clear: "مسح",
    waiting: (n) => `${n} قضية بانتظار الرد`, lastActivity: "آخر نشاط", status: "الحالة", client: "العميل", results: (n) => `${n} قضية`,
    notes: "ملاحظات داخلية", notesHint: "يراها المحامي والإدارة فقط، ولا يراها العميل.", addNote: "أضف ملاحظة", noNotes: "لا توجد ملاحظات.",
    notifySubject: (ref) => `القضية ${ref}: رد جديد من العميل`, notifyBody: (ref, url) => `أرسل العميل رسالة أو مستنداً جديداً في القضية ${ref}.\n${url}`,
  },
  visits: { title: "الزوار", today: "اليوم", week: "7 أيام", month: "30 يوماً", total: "الإجمالي", visitors: "زائر", views: "مشاهدة", pages: "أكثر الصفحات زيارة (30 يوماً)", daily: "آخر 14 يوماً" },
  gallery: { title: "الصور والفيديوهات", lead: "من أعمالنا وأخبارنا.", empty: "قريباً نضيف الصور والفيديوهات.", add: "إضافة صور أو فيديو", caption: "وصف (اختياري)", file: "الملف", hint: "صور (JPG أو PNG أو WEBP) أو فيديو (MP4 أو WEBM) حتى 500 ميجابايت.", upload: "رفع", remove: "حذف", done: "تمت الإضافة.", failed: "تعذّر الرفع." },
  marks: { scales: "ميزان العدالة", gavel: "مطرقة القاضي", flag: "علم بنغلاديش" },
  labour: { more: "مهلة القضية العمالية وتفاصيلها" },
  status: { open: "قائمة", closed: "مغلقة", close: "إغلاق القضية" },
  reviews: {
    title: "آراء العملاء", lead: "تقييمات من تابعوا قضاياهم عبر حقوقي.", empty: "لا توجد تقييمات بعد.",
    average: (a, n) => `${a} من 5 · ${n} تقييم`, write: "قيّم المحامي", rating: "التقييم", comment: "رأيك (اختياري)",
    submit: "أرسل التقييم", thanks: "شكراً! يُنشر تقييمك بعد المراجعة.", pending: "بانتظار المراجعة",
    approve: "نشر", hide: "إخفاء", stars: (n) => `${n} نجوم`, yours: "تقييمك",
  },
};

const en: Msgs = {
  brand: "Huquqi",
  nav: { home: "Home", myCases: "My cases", newCase: "New case", lawyer: "Lawyer panel", admin: "Admin", login: "Log in", logout: "Log out" },
  home: {
    eyebrow: "For expatriate workers in Saudi Arabia and those who have returned",
    title: "Your cases and money in Saudi Arabia, followed wherever you are",
    lead: "General, court and commercial cases, investment and Premium Residency, owning property and a home, powers of attorney, document translation and attestation, Hajj and Umrah visas, labour claims for salary and end-of-service benefit, and bank balances. Licensed lawyers, legal advisers and experienced specialists act for you, and you follow every step in your language.",
    cta: "Start your case",
    checkTitle: "Check your situation for free",
    checkLead: "Answer 3 questions. We tell you what you can still recover and how much time is left.", pick: "What do you need help with?", pickLead: "Pick a type of case, then fill in the three boxes: the facts, your requests and the documents." },
  check: {
    issues: "What did you leave behind in Saudi Arabia?", exitDate: "Final exit date", bank: "I have money in a Saudi bank",
    stopped: "The company stopped paying salaries or closed down", empty: "Pick at least one issue.",
    labourTitle: "Labour claim: the clock is running", daysLeft: (n) => `${n} days left`,
    labourBody: (d) => `You must file for amicable settlement on Qiwa within 12 months of your job ending. Last day: ${d}.`,
    labourLateTitle: "The labour claim deadline has likely passed", labourLateBody: "More than 12 months have passed. A lawyer can still check for an exception.",
    bankTitle: "Your bank balance is still yours", bankBody: "Accounts are frozen 90 days after the iqama expires, and the balance moves to a holding account after 180 days. The money is not lost. A lawyer with your power of attorney can ask the bank to transfer it home.",
    insTitle: "You may qualify for wage insurance", insBody: "Since October 2024, insurance covers unpaid wages and a ticket home when an employer fails. A lawyer checks how to claim from abroad.",
    otherTitle: "Needs a lawyer's review", otherBody: "For court cases, accidents or property, a Saudi lawyer with your power of attorney works through Najiz.",
    transTitle: "Document translation & attestation", transBody: "Certified Arabic translation of your Bengali or English documents (and back), with the attestations Saudi offices require: notary, Bangladesh Ministry of Foreign Affairs and the Saudi Embassy.",
    hajjTitle: "Hajj & Umrah visas", hajjBody: "Applying through Nusuk and licensed agents, and checking that your old residency left no entry ban.",
    comTitle: "Commercial cases", comBody: "Money owed, contracts, business or partnership disputes. A Saudi lawyer acts for you in the Commercial Court through Najiz.",
    poaTitle: "Power of attorney", poaBody: "To let a lawyer or relative in Saudi Arabia act for you. We guide you step by step: through the Saudi Embassy in Dhaka, or by notarising and attesting a local power of attorney.",
    reTitle: "Rules for non-Saudis owning property", reLead: "Summary of the updated Law of Real Estate Ownership by Non-Saudis, in force from January 2026, and its regulation:",
    reRules: [
      { h: "Ordinary residents", p: "A legal resident may own a property for their own home, and may also own within the zones set by the Council of Ministers and published by the Real Estate General Authority, registered in the Real Estate Registry." },
      { h: "Premium Residency holders", p: "May own residential, commercial and industrial property under the Premium Residency Law, except in Makkah, Madinah and border areas, where they get a time-limited right of use." },
      { h: "Non-residents", p: "May own only within the approved zones, after activating a digital identity on Absher." },
      { h: "Makkah and Madinah", p: "Ownership there is for Muslims only, within the set zones and under special conditions." },
      { h: "Exceptions", p: "Diplomatic missions and international organisations on reciprocity with Foreign Ministry approval; companies and funds with non-Saudi shareholders; non-profits under special rules. GCC citizens have a separate law." },
      { h: "Fees and penalties", p: "A fee of up to 5% of the value on a non-Saudi's property transaction, plus the real estate transaction tax. Violations carry fines up to SAR 10 million, and property bought with misleading information can be sold at auction." },
    ],
    reNote: "This is a guide only; the zones and details are issued and updated by the Real Estate General Authority. A lawyer checks your situation before any purchase.",
    invTitle: "Investment & Premium Residency", invBody: "A lawyer advises on starting a business in Saudi Arabia, investment licences (MISA), and Premium Residency requirements and applications.",
    genTitle: "General", genBody: "If nothing above fits, describe it here. A lawyer reviews it and tells you what can be done.",
    disclaimer: "This is first guidance, not legal advice. A licensed Saudi lawyer gives the final review.",
  },
  bankStatus: { active: "May still be active", frozen: "Likely frozen", holding: "Balance in holding account", unclaimed: "Unclaimed, but still yours" },
  caseType: { salary: "Unpaid salary", eosb: "End-of-service benefit", bank: "Bank balance", court: "Open court case", accident: "Accident compensation", property: "Car or property", translation: "Document translation & attestation", hajj: "Hajj & Umrah visas", labour: "Labour claim (salary & end of service)", commercial: "Commercial cases", general: "General cases", poa: "Power of attorney", invest: "Investing in Saudi Arabia & Premium Residency", realestate: "Owning property & a home" },
  stage: { submitted: "Submitted", review: "Under review", poa: "Power of attorney", filed: "Filed", hearing: "Sessions", judgment: "Decision", payout: "Paid out", closed: "Closed" },
  auth: {
    title: "Log in with your email", email: "Email", emailHint: "We send a 6-digit code to your email.", send: "Send code",
    code: "6-digit code", verify: "Log in", name: "Your name", badEmail: "Enter a valid email address.", badCode: "The code is wrong or expired.",
    rate: "Too many attempts. Try again in an hour.", codeSent: "We sent a code to:", devCode: (c) => `Demo mode: code ${c}`,
    emailSubject: "Your Huquqi login code", emailBody: (c) => `Your login code: ${c}\nIt is valid for 10 minutes. If you did not ask for it, ignore this email.`,
    phone: "Mobile number", phoneHint: "For admins only.", adminLogin: "Admin login (mobile number)", emailLogin: "Log in with email", badPhone: "This number cannot log in.", sendFailed: "We could not send the code right now. Please try again shortly.",
  },
  cases: {
    title: "My cases", none: "No cases yet.", open: "Open a new case", type: "Type of problem", employer: "Company or sponsor name",
    exitDate: "Exit date", bank: "Bank name", description: "The facts, in brief", descriptionHint: "What happened and when, briefly, in any language.",
    submit: "Submit case", whatsTitle: "Contact us on WhatsApp", whatsLead: "For a quick reply, message us on WhatsApp. Your case number is included.", whatsBtn: "Message us on WhatsApp", whatsMsg: (ref: string) => `Hello, I submitted case ${ref} on Huquqi.`, created: "Case submitted. A lawyer will review it within 48 hours.", timeline: "Progress", updates: "Updates",
    noUpdates: "No updates yet.", documents: "Documents", upload: "Upload", noDocs: "No documents uploaded.", lawyer: "Lawyer",
    noLawyer: "Waiting for a lawyer", deadline: "Labour claim deadline", channel: "Official channel", message: "Message your lawyer", send: "Send",
    uploadHint: "Passport, iqama, contract, payslips. PDF, images or Word, up to 1,000 pages (500 MB per file); you can pick several files at once.",
    requests: "Your requests", requestsHint: "What do you want now? For example: unpaid salary paid, bank balance sent to Bangladesh.",
    uploading: (a, b) => `Uploading files ${a} of ${b}…`, uploadFailed: "Some files did not upload. Try again from the case page.", uploadDone: "Files uploaded.",
    loginToSend: "Log in and send", reattach: "We kept what you wrote. Pick the documents again after logging in.",
  },
  lawyer: {
    title: "Lawyer panel", assigned: "My cases", unassigned: "New cases", take: "Take case", moveTo: "Next stage", update: "Write an update",
    updateHint: "The client sees it in their language.", post: "Post update", notVerified: "Your licence has not been verified yet.",
    license: "Licence number", firm: "Law firm", saveProfile: "Save",
  },
  article: {
    title: "Article of the day", num: (n) => `Article ${n}`, note: "A short explanation, not the exact legal text. Ask a lawyer about your case.",
    manage: "Article of the day", manageLead: "Each day the home page shows one published article, in turn, by Riyadh time.",
    law: "Law", number: "Article number", textAr: "Explanation (Arabic)", textBn: "Explanation (Bengali)", textEn: "Explanation (English)", add: "Add article",
    publish: "Publish", unpublish: "Unpublish", published: "Published", draft: "Awaiting review", remove: "Delete",
    starter: "Add the starter Labour Law articles", starterDone: "Added. Review each article before publishing.", today: "Showing today",
  },
  staff: {
    nav: "Admin", clients: "Clients and their cases", clientsLead: "Each client with their case count and latest case.",
    apps: "Lawyer applications", appsLead: "Lawyers asking to join. Approving makes them a verified lawyer.", pending: (n) => `${n} pending`,
    cases: "Cases", lastCase: "Latest case", joined: "Joined", search: "Search by name, email, mobile or case number", noCases: "No cases", openInbox: "View in the case inbox",
    approve: "Approve", reject: "Reject", approved: "Approved", rejected: "Rejected", pendingLabel: "Pending", history: "Earlier applications",
    city: "City", years: "Years of experience", about: "A short note about you", phone: "Mobile",
    applyTitle: "Apply as a lawyer", applyLead: "Fill in your details. The admin checks your licence and approves.", applyLogin: "Log in with your email first to apply",
    applySend: "Send application", applySent: "We received your application and will tell you after checking.", applyError: "Enter your licence number and mobile.",
    applyStatus: "Application status", alreadyLawyer: "You are already registered as a lawyer.",
  },
  admin: { title: "Admin", lawyers: "Lawyers", verify: "Verify", verified: "Verified", cases: "All cases", assign: "Assign lawyer", none: "Nothing here", makeLawyer: "Add as lawyer", phone: "Mobile", email: "Email", reviews: "Reviews" },
  common: { save: "Save", back: "Back", required: "This field is required.", forbidden: "You don't have access to this page.", notFound: "Not found." },
  info: {
    menu: "Menu", contact: "Contact us", contactLead: "Write to us with a question or request. We reply by email.",
    feedback: "Suggestions & complaints", feedbackLead: "Tell us your suggestion or complaint so we can do better.",
    suggestion: "Suggestion", complaint: "Complaint", kind: "Type",
    partners: "Our partners", partnersLead: "Who we work with.",
    partnersBody: ["Licensed Saudi lawyers and law firms, who act under power of attorney.", "Certified translation offices, for court and government documents.", "Organisations in Bangladesh that serve migrant and returning workers."],
    about: "About us",
    aboutBody: ["Huquqi helps Bangladeshi workers in Saudi Arabia and those who have returned with their cases and rights there: general, court and commercial cases, investment and Premium Residency, powers of attorney, document translation and attestation, Hajj and Umrah visas, labour claims for salary and end-of-service benefit, and bank balances.", "A licensed Saudi lawyer acts on the client's behalf, and the client follows everything wherever they are, in their own language."],
    name: "Name", email: "Email", message: "Message", send: "Send", sent: "Thank you, we received your message.", error: "Enter your name, a valid email and a message.",
    inbox: "Messages, suggestions & complaints", becomePartner: "To become a partner, contact us",
    how: "How it works",
    howSteps: [
      { title: "Pick your case", body: "Choose the type of case and fill in the three boxes: the facts, your requests and the documents." },
      { title: "A lawyer reviews it", body: "A licensed Saudi lawyer reviews the case and takes it on." },
      { title: "Power of attorney", body: "When needed, the lawyer prepares a power of attorney to act for you." },
      { title: "Follow your case", body: "You see every update from the lawyer in your language, and can message them." },
    ],
    faq: "Questions",
    faqItems: [
      { q: "Can I still claim after leaving Saudi Arabia?", a: "Yes. A Saudi lawyer can act for you under a power of attorney. You do not need to travel back." },
      { q: "Is the money in my bank account lost?", a: "No. The account is frozen after the iqama expires, but the money is still yours." },
      { q: "Is there a deadline for labour claims?", a: "Yes, a claim must be filed within 12 months of the end of employment, so do not wait." },
      { q: "Are my documents safe?", a: "Documents are stored privately. Only you, your lawyer and the admins can see them." },
    ],
    privacy: "Privacy",
    privacyBody: ["We only collect what your case needs: your email, name, case details and documents.", "Only you, the assigned lawyer and the admins can see your case and documents. We never sell your data.", "We use an anonymous browser cookie only to count visits; it holds nothing about you.", "To have your data deleted, write to us from \"Contact us\"."],
    joinLawyer: "Join as a lawyer",
    joinLawyerBody: ["If you are a licensed Saudi lawyer, work with us on cases for migrant workers.", "Once your licence is verified you can take new cases."],
    joinLawyerCta: "Contact us to apply",
  },
  inbox: {
    title: "Case inbox", open: "Open the case inbox", search: "Case number, name or email", allTypes: "All types", allStatus: "Any status", anyLawyer: "Any lawyer",
    assigned: "Has a lawyer", unassigned: "No lawyer", awaiting: "Awaiting reply", newReply: "New reply", filter: "Search", clear: "Clear",
    waiting: (n) => `${n} cases awaiting a reply`, lastActivity: "Last activity", status: "Status", client: "Client", results: (n) => `${n} cases`,
    notes: "Internal notes", notesHint: "Only lawyers and admins see these, never the client.", addNote: "Add note", noNotes: "No notes yet.",
    notifySubject: (ref) => `Case ${ref}: new reply from the client`, notifyBody: (ref, url) => `The client sent a new message or document on case ${ref}.\n${url}`,
  },
  visits: { title: "Visitors", today: "Today", week: "7 days", month: "30 days", total: "All time", visitors: "visitors", views: "page views", pages: "Top pages (30 days)", daily: "Last 14 days" },
  gallery: { title: "Photos & videos", lead: "Our work and news.", empty: "Photos and videos are coming soon.", add: "Add photos or a video", caption: "Caption (optional)", file: "File", hint: "Images (JPG, PNG, WEBP) or video (MP4, WEBM), up to 500 MB.", upload: "Upload", remove: "Remove", done: "Added.", failed: "Upload failed." },
  marks: { scales: "Scales of justice", gavel: "Judge's gavel", flag: "Flag of Bangladesh" },
  labour: { more: "Labour claim deadline and details" },
  status: { open: "Open", closed: "Closed", close: "Close case" },
  reviews: {
    title: "What clients say", lead: "Ratings from people who followed their cases through Huquqi.", empty: "No reviews yet.",
    average: (a, n) => `${a} / 5 · ${n} reviews`, write: "Rate your lawyer", rating: "Rating", comment: "Your comment (optional)",
    submit: "Send review", thanks: "Thank you! Your review is published after a check.", pending: "Waiting for review",
    approve: "Publish", hide: "Hide", stars: (n) => `${n} stars`, yours: "Your review",
  },
};

export const messages: Record<Locale, Msgs> = { bn, ar, en };
export type Messages = Msgs;
