import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  List,
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  PhoneCall,
  MessageSquare,
  User,
  Phone,
  Send,
  Star,
  UtensilsCrossed,
  Sparkles,
  DollarSign,
  MapPin,
  CheckCircle2,
  Armchair,
  Users,
  Calendar,
  Clock,
  Heart,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FolderOpen,
  Info,
  Check,
  UploadCloud
} from 'lucide-react';
import { db, tableTranslations } from './data';
import { Language, MenuItem, Category, SubCategoryKey } from './types';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db as firestoreDb, auth } from './firebase';
import FirebaseSync from './FirebaseSync';
import MediaUploader from './MediaUploader';

// Multi-lingual Admin panel translations
const adminTranslations = {
  en: {
    panelTitle: "Admin Panel",
    dashboard: "Dashboard",
    loginTitle: "Owner Passcode Auth",
    loginSub: "Enter your secure admin passcode to access control customizers",
    placeholderPass: "Enter passcode (Default: 1234)",
    wrongPass: "Access Denied: Invalid Passcode!",
    logout: "Log Out",
    saveSuccess: "Saved successfully!",
    saved: "Saved",
    add: "Add New",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this?",
    save: "Save Changes",
    cancel: "Cancel",
    totalItems: "Total Items",
    totalCats: "Categories",
    settings: "Settings",
    revertDefault: "Revert to Factory Defaults",
    revertConfirm: "WARNING: This will wipe out all custom added items, categories, and settings. Are you absolutely sure?",
    passcodeLabel: "Admin Passcode",
    whatsappLabel: "WhatsApp Booking Phone Number",
    telegramBotLabel: "Telegram Bot Token",
    telegramChatLabel: "Telegram Chat ID",
    addressUrlLabel: "Maps Location Link",
    addressNameLabel: "Location Label",
    phoneLabel: "Contact Phone Number",
    activeAdmin: "Active Session",
    
    // Category form
    catTab: "Categories Manager",
    catKey: "Category Identifier (alphanumeric, lowercase)",
    catNameEn: "Category Name (English)",
    catNameAr: "Category Name (Arabic)",
    catNameKu: "Category Name (Kurdish)",
    catImage: "Category Cover Image URL",
    addCat: "Create New Category",
    editCat: "Edit Category Details",

    // Item form
    itemTab: "Food Items Manager",
    itemNameEn: "Food Name (English)",
    itemNameAr: "Food Name (Arabic)",
    itemNameKu: "Food Name (Kurdish)",
    itemDescEn: "Description (English)",
    itemDescAr: "Description (Arabic)",
    itemDescKu: "Description (Kurdish)",
    itemPrice: "Price (e.g. 15,000)",
    itemImage: "Food Image URL",
    itemSubCat: "Sub-category Drink Group (Optional)",
    addItem: "Create New Food Item",
    editItem: "Edit Food Item",
    searchPlaceholder: "Search dishes...",
    categoryFilter: "Category Filter",
    all: "All Categories",
    noSub: "No Subcategory / Standard"
  },
  ar: {
    panelTitle: "لوحة التحكم",
    dashboard: "الإحصائيات",
    loginTitle: "بوابة المالك",
    loginSub: "يرجى إدخال رمز المرور للوصول إلى لوحة الإدارة",
    placeholderPass: "أدخل رمز المرور (الافتراضي: 1234)",
    wrongPass: "عذراً: رمز المرور غير صحيح!",
    logout: "تسجيل الخروج",
    saveSuccess: "تم الحفظ بنجاح!",
    saved: "محفوظ",
    add: "إضافة جديد",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من رغبتك في الحذف؟",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    totalItems: "إجمالي الأطباق",
    totalCats: "الأقسام",
    settings: "الإعدادات العامة",
    revertDefault: "إعادة ضبط المصنع",
    revertConfirm: "تحذير: سيؤدي هذا إلى حذف جميع الأطباق والأقسام المخصصة التي قمت بإضافتها وإعادتها للافتراضية. هل أنت متأكد؟",
    passcodeLabel: "رمز مرور الإدارة",
    whatsappLabel: "رقم الوتساب لتلقي الحجوزات",
    telegramBotLabel: "توكن بوت تليجرام للتقييمات",
    telegramChatLabel: "معرف الدردشة لتليجرام Chat ID",
    addressUrlLabel: "رابط موقع الخريطة",
    addressNameLabel: "اسم الموقع المكتوب",
    phoneLabel: "رقم هاتف الاتصال",
    activeAdmin: "جلسة نشطة",

    // Category form
    catTab: "إدارة الأقسام",
    catKey: "رمز القسم المميز (صغير، بدون مسافات)",
    catNameEn: "اسم القسم (إنجليزي)",
    catNameAr: "اسم القسم (العربية)",
    catNameKu: "اسم القسم (الكوردية)",
    catImage: "رابط صورة القسم",
    addCat: "إنشاء قسم جديد",
    editCat: "تعديل بيانات القسم",

    // Item form
    itemTab: "إدارة الأطباق والوجبات",
    itemNameEn: "اسم الطبق (إنجليزي)",
    itemNameAr: "اسم الطبق (العربية)",
    itemNameKu: "اسم الطبق (الكوردية)",
    itemDescEn: "الوصف (إنجليزي)",
    itemDescAr: "الوصف (العربية)",
    itemDescKu: "الوصف (الكوردية)",
    itemPrice: "السعر (مثلاً: 15,000)",
    itemImage: "رابط صورة الوجبة",
    itemSubCat: "تصنيف المشروبات الفرعي (اختياري)",
    addItem: "إضافة طبق جديد",
    editItem: "تعديل بيانات الطبق",
    searchPlaceholder: "ابحث عن طبق...",
    categoryFilter: "تصفية الأقسام",
    all: "جميع الأقسام",
    noSub: "بدون تصنيف فرعي"
  },
  ku: {
    panelTitle: "پانێڵی ئەدمین",
    dashboard: "داشبۆرد",
    loginTitle: "چوونەژوورەوەی خاوەن مینیو",
    loginSub: "تکایە کۆدی نهێنی داخڵ بکە بۆ چوونە ناو پانێڵی ئەدمین",
    placeholderPass: "کۆدی نهێنی بنووسە (باو: 1234)",
    wrongPass: "هەڵەیە: کۆدی ئەدمین دەستنیشاننەکراوە یاخود هەڵەیە!",
    logout: "چوونە دەرەوە",
    saveSuccess: "بەسەرکەوتوویی پاشەکەوت کرا!",
    saved: "پاشەکەوت کرا",
    add: "زیادکردنی نوێ",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    confirmDelete: "ئایا دڵنیایت لە سڕینەوەی ئەم بابەتە؟",
    save: "پاشەکەوتکردنی گۆڕانکارییەکان",
    cancel: "پاشگەزبوونەوە",
    totalItems: "سەرجەم خواردنەکان",
    totalCats: "کەتەگۆرییەکان",
    settings: "ڕێکخستنی گشتی",
    revertDefault: "گێڕانەوە بۆ باری سەرەتایی",
    revertConfirm: "ئاگاداری: ئەم کارە هەموو خواردن و کەتەگۆرییە زیادکراوەکانت دەسڕێتەوە و دەگەڕێتەوە مینیوی سەرەتایی. دڵنیایت؟",
    passcodeLabel: "کۆدی نهێنی ئەدمین",
    whatsappLabel: "ژمارەی واتیئەپ بۆ حجزکردن",
    telegramBotLabel: "تۆکنی بۆتی تێلێگرام (Telegram Bot Token)",
    telegramChatLabel: "کۆدی چاتی تێلێگرام (Chat ID)",
    addressUrlLabel: "لینکی نەخشە (Maps Location)",
    addressNameLabel: "ناوی شوێن لەسەر نەخشە",
    phoneLabel: "ژمارەی تەلەفۆن بۆ پەیوەندی",
    activeAdmin: "سێشنی چالاک",

    // Category form
    catTab: "ئیدارەی کەتەگۆرییەکان",
    catKey: "ناوی ناسێنەری کەتەگۆری (پیتە بچووکەکان بەبێ بۆشایی)",
    catNameEn: "ناوی کەتەگۆری (ئینگلیزی)",
    catNameAr: "ناوی کەتەگۆری (عەرەبی)",
    catNameKu: "ناوی کەتەگۆری (کوردی)",
    catImage: "لینکی وێنەی کەتەگۆری",
    addCat: "زیادکردنی کەتەگۆری نوێ",
    editCat: "دەستکاریکردنی زانیاری کەتەگۆری",

    // Item form
    itemTab: "ئیدارەی لیست و خواردنەکان",
    itemNameEn: "ناوی خواردن (ئینگلیزی)",
    itemNameAr: "ناوی خواردن (عەرەبی)",
    itemNameKu: "ناوی خواردن (کوردی)",
    itemDescEn: "وەسف / ڕوونکردنەوە (ئینگلیزی)",
    itemDescAr: "وەسف / ڕوونکردنەوە (عەرەبی)",
    itemDescKu: "وەسف / ڕوونکردنەوە (کوردی)",
    itemPrice: "نرخ (بۆ نموونە: 15,000)",
    itemImage: "لینکی وێنەی خواردنەکە",
    itemSubCat: "کەتەگۆری لاوەکی بۆ خواردنەوەکان (ئارەزوومەندانە)",
    addItem: "زیادکردنی خواردنی نوێ",
    editItem: "دەستکاریکردنی زانیاری خواردنەکە",
    searchPlaceholder: "بگەڕێ بەدوای خواردندا...",
    categoryFilter: "فلتەری کەتەگۆرییەکان",
    all: "هەموو کەتەگۆرییەکان",
    noSub: "بێ گروپکردنی لاوەکی"
  }
};

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<'welcome' | 'menu' | 'admin'>('welcome');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('shingelbana_admin_auth') === 'true';
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Dynamic custom database state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('shingelbana_menu_items');
    return saved ? JSON.parse(saved) : db.menu;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('shingelbana_categories');
    if (saved) return JSON.parse(saved);
    
    // Convert default translations category keys to dynamic models
    return Object.keys(db.translations.en.categories).map(key => ({
      key,
      image: db.categoryImages[key as any] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
      name: {
        en: db.translations.en.categories[key as any] || key,
        ar: db.translations.ar.categories[key as any] || key,
        ku: db.translations.ku.categories[key as any] || key,
      }
    }));
  });

  const [currentCategory, setCurrentCategory] = useState<string>(() => {
    const savedCats = localStorage.getItem('shingelbana_categories');
    if (savedCats) {
      const parsed = JSON.parse(savedCats);
      if (parsed && parsed.length > 0) return parsed[0].key;
    }
    return 'grilledMeats';
  });

  const [adminPasscode, setAdminPasscode] = useState(() => {
    return localStorage.getItem('shingelbana_admin_passcode') || '1234';
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('shingelbana_settings');
    return saved ? JSON.parse(saved) : {
      whatsappNumber: '9647503719345',
      telegramBotToken: '8726172373:AAE87LELwSbKfL6Q2yQ86379DfWUmJg4YGE',
      telegramChatId: '-5016411046',
      addressUrl: 'https://maps.app.goo.gl/aoxR5LsUymrfWxux8',
      addressName: 'Rawanduz, Erbil Governorate',
      phoneNumber: '+964 750 371 9345',
      backgroundVideoUrl: ''
    };
  });

  // Modal forms
  const [activeFormType, setActiveFormType] = useState<'reservation' | 'feedback' | 'contact' | 'login' | null>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Form states
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Fetch from Firebase
  useEffect(() => {
    let unsubscribeMenu: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    
    async function fetchFirebaseData() {
      try {
        unsubscribeMenu = onSnapshot(collection(firestoreDb, 'menuItems'), (snapshot) => {
          if (!snapshot.empty) {
            const fetchedMenu: MenuItem[] = [];
            snapshot.forEach(doc => {
              fetchedMenu.push(doc.data() as MenuItem);
            });
            setMenuItems(fetchedMenu);
            localStorage.setItem('shingelbana_menu_items', JSON.stringify(fetchedMenu));
          }
        }, (error) => {
          console.error("Firebase menuItems snapshot error:", error);
        });

        unsubscribeSettings = onSnapshot(collection(firestoreDb, 'settings'), (snapshot) => {
          if (!snapshot.empty) {
            snapshot.forEach(doc => {
              if (doc.id === 'categories') {
                const cats = doc.data().data;
                if (cats) {
                  setCategories(cats);
                  localStorage.setItem('shingelbana_categories', JSON.stringify(cats));
                }
              }
              if (doc.id === 'globalSettings') {
                const globalSettings = doc.data().data;
                if (globalSettings) {
                  setSettings(globalSettings);
                  localStorage.setItem('shingelbana_settings', JSON.stringify(globalSettings));
                }
              }
              if (doc.id === 'passcode') {
                const pass = doc.data().data;
                if (pass) {
                  setAdminPasscode(pass);
                  localStorage.setItem('shingelbana_admin_passcode', pass);
                }
              }
            });
          }
        }, (error) => {
          console.error("Firebase settings snapshot error:", error);
        });
      } catch (err) {
        console.log("Firebase not initialized or empty yet. Using local data.", err);
      } finally {
        setIsFirebaseLoading(false);
      }
    }
    fetchFirebaseData();

    return () => {
      if (unsubscribeMenu) unsubscribeMenu();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [resGuests, setResGuests] = useState('1');
  const [resArea, setResArea] = useState('Indoor');
  const [resOccasion, setResOccasion] = useState('');

  const [feedName, setFeedName] = useState('');
  const [feedComments, setFeedComments] = useState('');
  const [feedRatings, setFeedRatings] = useState({
    food: 5,
    service: 5,
    clean: 5,
    value: 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email/Password login state
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPass, setEnteredPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Admin section states
  const [adminActiveTab, setAdminActiveTab] = useState<'items' | 'categories' | 'settings' | 'firebase-sync'>('items');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('all');

  // New/Edit Item & Category Modal Dialog States
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Modal item input values
  const [inputItemNameEn, setInputItemNameEn] = useState('');
  const [inputItemNameAr, setInputItemNameAr] = useState('');
  const [inputItemNameKu, setInputItemNameKu] = useState('');
  const [inputItemDescEn, setInputItemDescEn] = useState('');
  const [inputItemDescAr, setInputItemDescAr] = useState('');
  const [inputItemDescKu, setInputItemDescKu] = useState('');
  const [inputItemPrice, setInputItemPrice] = useState('');
  const [inputItemImage, setInputItemImage] = useState('');
  const [inputItemCategory, setInputItemCategory] = useState('');
  const [inputItemSubCategory, setInputItemSubCategory] = useState<SubCategoryKey | 'none'>('none');

  // Modal category input values
  const [inputCatKey, setInputCatKey] = useState('');
  const [inputCatNameEn, setInputCatNameEn] = useState('');
  const [inputCatNameAr, setInputCatNameAr] = useState('');
  const [inputCatNameKu, setInputCatNameKu] = useState('');
  const [inputCatImage, setInputCatImage] = useState('');

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('shingelbana_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('shingelbana_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shingelbana_admin_passcode', adminPasscode);
  }, [adminPasscode]);

  useEffect(() => {
    localStorage.setItem('shingelbana_settings', JSON.stringify(settings));
  }, [settings]);

  // Read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) {
      setTableNumber(table);
    }
  }, []);

  // Professional URL Router (Client-side routing fallback)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      
      if (path === '/admin' || hash === '#admin' || params.has('admin')) {
        setCurrentView('admin');
      } else if (path === '/menu' || hash === '#menu' || params.has('menu')) {
        setCurrentView('menu');
      } else if (path === '/' || hash === '#welcome' || hash === '') {
        setCurrentView('welcome');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);
    
    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, []);

  // Sync current view with URL address bar state
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (currentView === 'admin') {
      if (path !== '/admin' && hash !== '#admin') {
        window.history.pushState(null, '', '/admin' + search);
      }
    } else if (currentView === 'menu') {
      if (path !== '/menu' && hash !== '#menu') {
        window.history.pushState(null, '', '/menu' + search);
      }
    } else if (currentView === 'welcome') {
      if (path !== '/' && hash !== '') {
        window.history.pushState(null, '', '/' + search);
      }
    }
  }, [currentView]);

  useEffect(() => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLang]);

  const t = db.translations[currentLang];
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const adm = adminTranslations[currentLang];

  // Submission handles
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tableRef = tableNumber ? `🪑 *Table Reference:* Table-${tableNumber}` : '🪑 *Table Reference:* Not Specified';
    
    const msg = `🏨 *SHINGELBANA RESORT - NEW BOOKING*\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 *Guest:* ${resName}\n` +
                `📞 *Phone:* ${resPhone}\n` +
                `🗓️ *Date:* ${resDate} | ⏰ ${resTime}\n` +
                `👥 *Guests:* ${resGuests} Persons\n` +
                `🎈 *Occasion:* ${resOccasion || 'Standard Visit'}\n` +
                `📍 *Area:* ${resArea}\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `${tableRef}\n` +
                `🌐 _Sent via Digital Menu System_`;

    const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tableRef = tableNumber ? `🪑 *Table Reference:* Table-${tableNumber}` : '🪑 *Table Reference:* Not Specified';
    const getStars = (n: number) => "⭐".repeat(n);
    
    const msg = `🌟 *NEW CUSTOMER FEEDBACK*\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 *From:* ${feedName || 'Anonymous Guest'}\n\n` +
                `🍽️ *Food Quality:* ${getStars(feedRatings.food)}\n` +
                `🤵 *Service:* ${getStars(feedRatings.service)}\n` +
                `✨ *Cleanliness:* ${getStars(feedRatings.clean)}\n` +
                `💰 *Value:* ${getStars(feedRatings.value)}\n\n` +
                `💬 *Comments:*\n"${feedComments}"\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `${tableRef}\n` +
                `🌐 _Sent via Digital Menu System_`;

    fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: settings.telegramChatId, text: msg, parse_mode: 'Markdown' })
    })
    .then((res) => {
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert(currentLang === 'ku' ? "هەڵەیەک ڕوویدا. تکایە دووبارە تاقیبکەرەوە." : "Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      alert(currentLang === 'ku' ? "تکایە هێڵی ئینتەرنێتەکەت بپشکنە" : "Error submitting feedback. Please check your internet connection.");
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const openForm = (type: 'reservation' | 'feedback' | 'contact' | 'login') => {
    setIsSuccess(false);
    setIsSubmitting(false);
    setEnteredPass('');
    setLoginError(false);

    if (type === 'reservation') {
      setResName('');
      setResPhone('');
      setResDate('');
      setResTime('');
      setResGuests('1');
      setResArea('Indoor');
      setResOccasion('');
    } else if (type === 'feedback') {
      setFeedName('');
      setFeedComments('');
      setFeedRatings({ food: 5, service: 5, clean: 5, value: 5 });
    }
    setActiveFormType(type);
  };

  const closeForm = () => {
    setActiveFormType(null);
  };

  const startMenu = () => {
    setCurrentView('menu');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('shingelbana_admin_auth');
    setEnteredPass('');
    setCurrentView('menu');
  };

  const showWelcome = () => {
    setCurrentView('welcome');
  };

  const toggleLangDropdown = () => {
    setLangDropdownOpen(!langDropdownOpen);
  };

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    setLangDropdownOpen(false);
  };

  // Revert all customized menu settings and data to default database values
  const handleRevertDefaults = () => {
    if (window.confirm(adm.revertConfirm)) {
      localStorage.removeItem('shingelbana_menu_items');
      localStorage.removeItem('shingelbana_categories');
      localStorage.removeItem('shingelbana_settings');
      localStorage.removeItem('shingelbana_admin_passcode');
      
      setMenuItems(db.menu);
      setCategories(
        Object.keys(db.translations.en.categories).map(key => ({
          key,
          image: db.categoryImages[key as any] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
          name: {
            en: db.translations.en.categories[key as any] || key,
            ar: db.translations.ar.categories[key as any] || key,
            ku: db.translations.ku.categories[key as any] || key,
          }
        }))
      );
      setSettings({
        whatsappNumber: '9647503719345',
        telegramBotToken: '8726172373:AAE87LELwSbKfL6Q2yQ86379DfWUmJg4YGE',
        telegramChatId: '-5016411046',
        addressUrl: 'https://maps.app.goo.gl/aoxR5LsUymrfWxux8',
        addressName: 'Rawanduz, Erbil Governorate',
        phoneNumber: '+964 750 371 9345',
        backgroundVideoUrl: ''
      });
      setAdminPasscode('1234');
      alert(currentLang === 'ku' ? 'پاککرایەوە بە سەرکەوتوویی' : 'Reverted to defaults successfully!');
    }
  };

  // Category selection handler helper
  const getCategoryName = (key: string, lang: Language) => {
    const c = categories.find(item => item.key === key);
    return c ? c.name[lang] : key;
  };

  // 1. FOOD ITEMS CRUD HANDLERS
  const openAddItemModal = () => {
    setEditingItem(null);
    setInputItemNameEn('');
    setInputItemNameAr('');
    setInputItemNameKu('');
    setInputItemDescEn('');
    setInputItemDescAr('');
    setInputItemDescKu('');
    setInputItemPrice('');
    setInputItemImage('');
    setInputItemCategory(categories[0]?.key || '');
    setInputItemSubCategory('none');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setInputItemNameEn(item.name.en);
    setInputItemNameAr(item.name.ar);
    setInputItemNameKu(item.name.ku);
    setInputItemDescEn(item.desc.en);
    setInputItemDescAr(item.desc.ar);
    setInputItemDescKu(item.desc.ku);
    setInputItemPrice(item.price);
    setInputItemImage(item.image);
    setInputItemCategory(item.category);
    setInputItemSubCategory(item.subCategory || 'none');
    setIsItemModalOpen(true);
  };

  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSub = inputItemSubCategory !== 'none' ? inputItemSubCategory : null;

    if (editingItem) {
      // Edit
      const updatedItem = {
        ...editingItem,
        category: inputItemCategory,
        subCategory: isSub,
        price: inputItemPrice,
        image: inputItemImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        name: { en: inputItemNameEn, ar: inputItemNameAr, ku: inputItemNameKu },
        desc: { en: inputItemDescEn, ar: inputItemDescAr, ku: inputItemDescKu }
      };

      setMenuItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return updatedItem;
        }
        return item;
      }));
      
      try {
        await setDoc(doc(firestoreDb, 'menuItems', updatedItem.id.toString()), updatedItem);
      } catch (err) {
        console.error('Error saving item to Firebase:', err);
      }
    } else {
      // Add
      const newItem: MenuItem = {
        id: Date.now(),
        category: inputItemCategory,
        subCategory: isSub,
        price: inputItemPrice,
        image: inputItemImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        name: { en: inputItemNameEn, ar: inputItemNameAr, ku: inputItemNameKu },
        desc: { en: inputItemDescEn, ar: inputItemDescAr, ku: inputItemDescKu }
      };
      setMenuItems(prev => [...prev, newItem]);
      
      try {
        await setDoc(doc(firestoreDb, 'menuItems', newItem.id.toString()), newItem);
      } catch (err) {
        console.error('Error saving item to Firebase:', err);
      }
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm(adm.confirmDelete)) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      
      try {
        await deleteDoc(doc(firestoreDb, 'menuItems', id.toString()));
      } catch (err) {
        console.error('Error deleting item from Firebase:', err);
      }
    }
  };

  // 2. CATEGORY CRUD HANDLERS
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setInputCatKey('');
    setInputCatNameEn('');
    setInputCatNameAr('');
    setInputCatNameKu('');
    setInputCatImage('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setInputCatKey(cat.key);
    setInputCatNameEn(cat.name.en);
    setInputCatNameAr(cat.name.ar);
    setInputCatNameKu(cat.name.ku);
    setInputCatImage(cat.image);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalKey = inputCatKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!finalKey) return;

    let updatedCategories = [...categories];

    if (editingCategory) {
      // Edit
      updatedCategories = updatedCategories.map(c => {
        if (c.key === editingCategory.key) {
          return {
            key: finalKey,
            image: inputCatImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            name: { en: inputCatNameEn, ar: inputCatNameAr, ku: inputCatNameKu }
          };
        }
        return c;
      });
      setCategories(updatedCategories);

      // Update menu items category references
      if (editingCategory.key !== finalKey) {
        const batch = writeBatch(firestoreDb);
        const updatedItems = menuItems.map(item => {
          if (item.category === editingCategory.key) {
            const upItem = { ...item, category: finalKey };
            batch.set(doc(firestoreDb, 'menuItems', upItem.id.toString()), upItem);
            return upItem;
          }
          return item;
        });
        setMenuItems(updatedItems);
        try { await batch.commit(); } catch (err) { console.error(err); }
      }
    } else {
      // Add
      const newCat: Category = {
        key: finalKey,
        image: inputCatImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        name: { en: inputCatNameEn, ar: inputCatNameAr, ku: inputCatNameKu }
      };
      updatedCategories.push(newCat);
      setCategories(updatedCategories);
    }
    
    try {
      await setDoc(doc(firestoreDb, 'settings', 'categories'), { data: updatedCategories });
    } catch (err) {
      console.error(err);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (key: string) => {
    if (window.confirm(adm.confirmDelete)) {
      const updatedCategories = categories.filter(c => c.key !== key);
      setCategories(updatedCategories);
      // Clean up menu items associated with this category
      const batch = writeBatch(firestoreDb);
      const itemsToDelete = menuItems.filter(item => item.category === key);
      itemsToDelete.forEach(item => {
        batch.delete(doc(firestoreDb, 'menuItems', item.id.toString()));
      });
      
      setMenuItems(prev => prev.filter(item => item.category !== key));
      if (currentCategory === key) {
        if (updatedCategories.length > 0) setCurrentCategory(updatedCategories[0].key);
      }
      
      try {
        await batch.commit();
        await setDoc(doc(firestoreDb, 'settings', 'categories'), { data: updatedCategories });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter Items
  const filteredItems = menuItems.filter(item => item.category === currentCategory);
  const hasSubCats = filteredItems.some(item => item.subCategory);
  const subCatOrder: SubCategoryKey[] = ['juice', 'energy', 'soft', 'other'];

  // Admin filter & search items
  const adminFilteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.en.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.name.ar.includes(itemSearchQuery) ||
      item.name.ku.includes(itemSearchQuery) ||
      item.price.includes(itemSearchQuery);
    
    if (itemCategoryFilter === 'all') return matchesSearch;
    return item.category === itemCategoryFilter && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-offwhite text-deepblue flex flex-col selection:bg-deepblue-light selection:text-purewhite ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      
      <AnimatePresence mode="wait">
        {currentView === 'welcome' ? (
          /* ================= WELCOME PAGE ================= */
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            id="welcome-page"
          >
            {/* Background Video / Solid Fallback */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 w-full h-full bg-deepblue"></div>
              {settings.backgroundVideoUrl && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  src={settings.backgroundVideoUrl}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-deepblue-dark/60 via-deepblue/40 to-deepblue-dark/60 z-10"></div>
            </div>

            <div className="w-full max-w-lg relative z-10 flex flex-col gap-8 px-4 py-8">
              {/* Logo & Table Badge */}
              <div className="text-center mt-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4"
                >
                  <img
                    src="https://special-copper-xytsg3zzok.edgeone.app/Untitled%20design%20-%202026-02-25T031040.798.png"
                    alt="Shingelbana Logo"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
                
                <h1 className="text-4xl font-bold text-purewhite mb-2 drop-shadow-lg tracking-wide font-sans">
                  Shingelbana
                </h1>
                <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-purewhite/70 drop-shadow-md font-sans">
                  Resort &amp; Restaurant
                </h2>

                {/* Table Number Badge */}
                {tableNumber && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-purewhite/10 backdrop-blur-md rounded-full text-purewhite shadow-lg border border-purewhite/20 mx-auto"
                  >
                    <Armchair className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold tracking-widest uppercase">
                      {tableTranslations[currentLang]} {tableNumber}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Language Selection Grid */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setCurrentLang('en')}
                    className={`lang-btn backdrop-blur-md border rounded-2xl py-3 px-2 transition-all font-sans font-bold shadow-lg flex flex-col items-center justify-center gap-2.5 focus:outline-none ${
                      currentLang === 'en'
                        ? 'bg-purewhite/40 border-purewhite text-purewhite scale-105'
                        : 'bg-purewhite/10 border-purewhite/20 text-purewhite/90 hover:bg-purewhite/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-[1.5px] border-white/30 shrink-0">
                      <img src="https://flagcdn.com/w160/gb.png" alt="English" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs uppercase tracking-wider">English</span>
                  </button>

                  <button
                    onClick={() => setCurrentLang('ar')}
                    className={`lang-btn backdrop-blur-md border rounded-2xl py-3 px-2 transition-all font-arabic font-bold shadow-lg flex flex-col items-center justify-center gap-2.5 focus:outline-none ${
                      currentLang === 'ar'
                        ? 'bg-purewhite/40 border-purewhite text-purewhite scale-105'
                        : 'bg-purewhite/10 border-purewhite/20 text-purewhite/90 hover:bg-purewhite/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-[1.5px] border-white/30 shrink-0 bg-white">
                      <img src="https://flagcdn.com/w160/iq.png" alt="العربية" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs tracking-wide">عربي</span>
                  </button>

                  <button
                    onClick={() => setCurrentLang('ku')}
                    className={`lang-btn backdrop-blur-md border rounded-2xl py-3 px-2 transition-all font-kurdish font-bold shadow-lg flex flex-col items-center justify-center gap-2.5 focus:outline-none ${
                      currentLang === 'ku'
                        ? 'bg-purewhite/40 border-purewhite text-purewhite scale-105'
                        : 'bg-purewhite/10 border-purewhite/20 text-purewhite/90 hover:bg-purewhite/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-[1.5px] border-white/30 shrink-0 bg-white">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Kurdistan.svg"
                        alt="کوردی"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs tracking-wide">کوردی</span>
                  </button>
                </div>
              </div>

              {/* View Menu Primary Button */}
              <button
                onClick={startMenu}
                className="group relative w-full flex items-center justify-center gap-3 bg-purewhite text-deepblue py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 font-bold text-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] mt-2 focus:outline-none"
              >
                <span>{t.viewMenu}</span>
                {isRTL ? (
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* Auxiliary Option Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => openForm('reservation')}
                  className="bg-purewhite/10 hover:bg-purewhite/20 backdrop-blur-md border border-purewhite/20 text-purewhite rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg focus:outline-none"
                >
                  <CalendarCheck className="w-6 h-6 mb-1 text-white/90" />
                  <span className="text-[11px] font-bold tracking-wider">{t.reserve}</span>
                </button>

                <button
                  onClick={() => openForm('contact')}
                  className="bg-purewhite/10 hover:bg-purewhite/20 backdrop-blur-md border border-purewhite/20 text-purewhite rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg focus:outline-none"
                >
                  <PhoneCall className="w-6 h-6 mb-1 text-white/90" />
                  <span className="text-[11px] font-bold tracking-wider">{t.contact}</span>
                </button>

                <button
                  onClick={() => openForm('feedback')}
                  className="bg-purewhite/10 hover:bg-purewhite/20 backdrop-blur-md border border-purewhite/20 text-purewhite rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg focus:outline-none"
                >
                  <MessageSquare className="w-6 h-6 mb-1 text-white/90" />
                  <span className="text-[11px] font-bold tracking-wider">{t.feedback}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : currentView === 'menu' ? (
          /* ================= MENU FEED PAGE ================= */
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen pb-20 flex flex-col"
            id="menu-page"
          >
            {/* Header */}
            <header className="bg-deepblue text-purewhite sticky top-0 z-50 shadow-lg">
              <div className="px-4 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-2">
                  <button
                    onClick={showWelcome}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-deepblue-light transition-colors focus:outline-none shrink-0"
                  >
                    {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                  </button>

                  {/* Header Table Badge */}
                  {tableNumber && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-purewhite text-[10px] font-bold py-1.5 px-2.5 rounded-xl shadow-sm border border-white/20">
                      <Armchair className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="tracking-wider uppercase">
                        {tableTranslations[currentLang]} {tableNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <h1 className="text-base sm:text-lg font-bold tracking-wide font-sans">
                    Shingelbana
                  </h1>
                </div>

                {/* Header Action Buttons Group */}
                <div className="flex items-center gap-1.5 relative z-50">
                  <button
                    onClick={toggleLangDropdown}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-purewhite text-sm font-bold py-1.5 px-3 rounded-xl shadow-sm border border-white/20 focus:outline-none"
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/20 bg-white">
                      {currentLang === 'en' && (
                        <img src="https://flagcdn.com/w160/gb.png" className="w-full h-full object-cover" alt="EN" />
                      )}
                      {currentLang === 'ar' && (
                        <img src="https://flagcdn.com/w160/iq.png" className="w-full h-full object-cover" alt="AR" />
                      )}
                      {currentLang === 'ku' && (
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Kurdistan.svg" className="w-full h-full object-cover" alt="KU" />
                      )}
                    </div>
                    <span className="uppercase tracking-wider text-[11px] hidden sm:block">
                      {currentLang}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </button>

                  <AnimatePresence>
                    {langDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute top-full mt-2 bg-purewhite border border-gray-100 shadow-xl rounded-2xl w-36 overflow-hidden z-50 flex flex-col text-deepblue ${
                            isRTL ? 'left-0' : 'right-0'
                          }`}
                        >
                          <button
                            onClick={() => changeLanguage('en')}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 focus:outline-none"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-gray-100">
                              <img src="https://flagcdn.com/w160/gb.png" className="w-full h-full object-cover" alt="EN" />
                            </div>
                            <span>English</span>
                          </button>
                          
                          <button
                            onClick={() => changeLanguage('ar')}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 border-t border-gray-100 focus:outline-none"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-white">
                              <img src="https://flagcdn.com/w160/iq.png" className="w-full h-full object-cover" alt="AR" />
                            </div>
                            <span>عربي</span>
                          </button>

                          <button
                            onClick={() => changeLanguage('ku')}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 border-t border-gray-100 focus:outline-none"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-white">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Kurdistan.svg" className="w-full h-full object-cover" alt="KU" />
                            </div>
                            <span>کوردی</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Category Sub-Navbar */}
            <div className="bg-purewhite shadow-sm border-b border-gray-200 sticky top-[72px] z-40 overflow-x-auto no-scrollbar">
              <div className="flex px-4 py-3 gap-4 max-w-3xl mx-auto w-full">
                {categories.map((catObj) => {
                  const isActive = catObj.key === currentCategory;
                  return (
                    <button
                      key={catObj.key}
                      onClick={() => setCurrentCategory(catObj.key)}
                      className={`group flex flex-col items-center justify-start p-3 w-[105px] min-h-[110px] rounded-2xl transition-all duration-350 shrink-0 border border-b-4 focus:outline-none ${
                        isActive
                          ? 'bg-deepblue border-deepblue shadow-lg -translate-y-1'
                          : 'bg-purewhite border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 transition-all ${
                          isActive
                            ? 'ring-2 ring-purewhite/40 ring-offset-1 ring-offset-deepblue'
                            : 'border border-gray-100'
                        }`}
                      >
                        <img src={catObj.image} alt={catObj.name[currentLang]} className="w-full h-full object-cover" />
                      </div>
                      <span
                        className={`text-[11px] font-bold text-center leading-snug line-clamp-2 px-1 mt-2 ${
                          isActive ? 'text-purewhite' : 'text-gray-600'
                        }`}
                      >
                        {catObj.name[currentLang]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Menu Feed Container */}
            <main className="flex-grow p-4 max-w-3xl mx-auto w-full">
              
              {/* Category Page Header Title */}
              <div className="flex justify-between items-center mb-6 mt-2">
                <h2 className="text-2xl font-bold text-deepblue">
                  {getCategoryName(currentCategory, currentLang)}
                </h2>
                
                {/* View Switch Layout Buttons */}
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors focus:outline-none ${
                      viewMode === 'list' ? 'text-deepblue bg-gray-100 shadow-inner' : 'text-gray-400'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors focus:outline-none ${
                      viewMode === 'grid' ? 'text-deepblue bg-gray-100 shadow-inner' : 'text-gray-400'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items Render Arena */}
              <div id="items-container" className="fade-in">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-6 text-gray-400 font-medium">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50 text-deepblue/40" />
                    <p className="text-sm">
                      {currentLang === 'ku' ? 'خواردن نییە لەم کەتەگۆرییەدا' : currentLang === 'ar' ? 'لا توجد وجبات في هذا الصنف حالياً' : 'No items found in this category'}
                    </p>
                  </div>
                ) : hasSubCats ? (
                  <div className="flex flex-col gap-6">
                    {subCatOrder.map((subKey) => {
                      const itemsInSub = filteredItems.filter(item => item.subCategory === subKey);
                      if (itemsInSub.length === 0) return null;

                      return (
                        <div key={subKey}>
                          <h3 className="text-[15px] font-bold text-deepblue/80 mb-3 border-b-2 border-gray-100 pb-1 inline-block">
                            {t.subCategories[subKey]}
                          </h3>
                          
                          <div
                            className={
                              viewMode === 'grid'
                                ? 'grid grid-cols-2 sm:grid-cols-3 gap-4'
                                : 'space-y-4'
                            }
                          >
                            {itemsInSub.map((item, index) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                index={index}
                                viewMode={viewMode}
                                currentLang={currentLang}
                                currency={t.currency}
                                onClick={() => setSelectedItem(item)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 gap-4'
                        : 'space-y-4'
                    }
                  >
                    {filteredItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        viewMode={viewMode}
                        currentLang={currentLang}
                        currency={t.currency}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        ) : (
          /* ================= PROFESSIONAL ADMIN CONSOLE ================= */
          !isAdminAuthenticated ? (
            <motion.div
              key="admin-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-deepblue flex flex-col items-center justify-center p-6 relative overflow-hidden text-purewhite selection:bg-amber-500 selection:text-deepblue"
            >
              {/* Background gradient layout */}
              <div className="absolute inset-0 bg-gradient-to-b from-deepblue-dark via-deepblue to-deepblue-dark z-0" />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-purewhite/10 backdrop-blur-xl border border-purewhite/25 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6"
              >
                {/* Logo / Header */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-purewhite/5 rounded-2xl p-2.5 border border-purewhite/15 flex items-center justify-center">
                    <img
                      src="https://special-copper-xytsg3zzok.edgeone.app/Untitled%20design%20-%202026-02-25T031040.798.png"
                      alt="Shingelbana"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-2xl font-black tracking-wide font-sans">SHINGELBANA</h2>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-purewhite/60 font-sans mt-1">Restaurant Resort</p>
                  
                  <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 text-[10px] font-bold tracking-widest uppercase font-sans">
                    <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>{adm.panelTitle}</span>
                  </div>
                </div>

                <div className="h-px bg-purewhite/10 my-1" />

                {/* Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoginError(false);
                    try {
                      try {
                        await signInWithEmailAndPassword(auth, enteredEmail, enteredPass);
                      } catch (signInErr: any) {
                        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-login-credentials') {
                          // For development, if they don't exist, we just create the user. 
                          // In a real production app we'd handle this differently or not allow open registration for admins.
                          await createUserWithEmailAndPassword(auth, enteredEmail, enteredPass);
                        } else {
                          throw signInErr;
                        }
                      }
                      setLoginError(false);
                      setIsAdminAuthenticated(true);
                      sessionStorage.setItem('shingelbana_admin_auth', 'true');
                    } catch (err) {
                      console.error('Firebase auth error:', err);
                      setLoginError(true);
                    }
                  }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-purewhite/70">
                      {currentLang === 'ku' ? 'تکایە ئیمەیل و پاسۆرد بنووسە' : currentLang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Secure Admin Login'}
                    </label>
                    
                    {/* Language switches in Login */}
                    <div className="flex gap-2 text-[10px] font-bold font-sans">
                      <button type="button" onClick={() => setCurrentLang('ku')} className={`hover:text-amber-400 ${currentLang === 'ku' ? 'text-amber-400' : 'text-purewhite/50'}`}>KU</button>
                      <button type="button" onClick={() => setCurrentLang('ar')} className={`hover:text-amber-400 ${currentLang === 'ar' ? 'text-amber-400' : 'text-purewhite/50'}`}>AR</button>
                      <button type="button" onClick={() => setCurrentLang('en')} className={`hover:text-amber-400 ${currentLang === 'en' ? 'text-amber-400' : 'text-purewhite/50'}`}>EN</button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="admin@shingelbana.com"
                        value={enteredEmail}
                        onChange={(e) => {
                          setEnteredEmail(e.target.value);
                          setLoginError(false);
                        }}
                        className="w-full bg-purewhite/10 border border-purewhite/15 rounded-2xl px-4 py-3.5 text-left text-sm font-sans font-bold text-purewhite placeholder:text-purewhite/40 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                        autoFocus
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={enteredPass}
                        onChange={(e) => {
                          setEnteredPass(e.target.value);
                          setLoginError(false);
                        }}
                        className="w-full bg-purewhite/10 border border-purewhite/15 rounded-2xl px-4 py-3.5 text-left text-sm font-sans font-bold text-purewhite placeholder:text-purewhite/40 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purewhite/30">
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 font-bold text-center"
                    >
                      {currentLang === 'ku' ? 'ئیمەیل یان پاسۆرد هەڵەیە' : currentLang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password'}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-deepblue py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/10 focus:outline-none border-b-4 border-amber-700 font-sans mt-2"
                  >
                    <span>{currentLang === 'ku' ? 'چوونەژوورەوە' : currentLang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <Check className="w-4 h-4" />
                  </button>
                </form>

                {/* Return home link */}
                <button
                  onClick={() => setCurrentView('menu')}
                  className="text-xs text-purewhite/50 hover:text-purewhite/95 transition-all font-bold tracking-wider uppercase mt-2 flex items-center justify-center gap-1.5 focus:outline-none font-sans"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentLang === 'ku' ? 'گەڕانەوە بۆ مینیو' : currentLang === 'ar' ? 'العودة للقائمة' : 'Back to Menu'}</span>
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen pb-20 bg-gray-50 flex flex-col text-deepblue"
            >
            {/* Admin Header */}
            <header className="bg-deepblue text-purewhite sticky top-0 z-50 shadow-md border-b border-white/5">
              <div className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 text-deepblue p-2 rounded-xl flex items-center justify-center font-bold font-sans text-xs gap-1.5 shadow-md">
                    <Settings className="w-4 h-4 animate-spin-slow" />
                    <span>{adm.activeAdmin}</span>
                  </div>
                </div>

                <div className="text-center absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
                  <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase font-sans">
                    {adm.panelTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language choice within Admin controls */}
                  <div className="flex bg-white/10 rounded-lg p-0.5 border border-white/10">
                    <button
                      onClick={() => changeLanguage('ku')}
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${currentLang === 'ku' ? 'bg-purewhite text-deepblue' : 'text-white/75 hover:bg-white/5'}`}
                    >
                      KU
                    </button>
                    <button
                      onClick={() => changeLanguage('ar')}
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${currentLang === 'ar' ? 'bg-purewhite text-deepblue' : 'text-white/75 hover:bg-white/5'}`}
                    >
                      AR
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${currentLang === 'en' ? 'bg-purewhite text-deepblue' : 'text-white/75 hover:bg-white/5'}`}
                    >
                      EN
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-purewhite text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-md focus:outline-none"
                  >
                    {adm.logout}
                  </button>
                </div>
              </div>
            </header>

            <div className="p-4 max-w-5xl mx-auto w-full flex-grow flex flex-col md:flex-row gap-6">
              
              {/* Sidebar Tabs Controls */}
              <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
                <div className="bg-purewhite p-4 rounded-3xl shadow-sm border border-gray-200/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                    {adm.dashboard}
                  </p>
                  
                  {/* Quickstats card inside sidebar */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">{adm.totalItems}</span>
                      <span className="text-xl font-black text-deepblue mt-1 block">{menuItems.length}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">{adm.totalCats}</span>
                      <span className="text-xl font-black text-deepblue mt-1 block">{categories.length}</span>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1">
                    <button
                      onClick={() => setAdminActiveTab('items')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                        adminActiveTab === 'items'
                          ? 'bg-deepblue text-purewhite shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 shrink-0" />
                      <span>{adm.itemTab}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('categories')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                        adminActiveTab === 'categories'
                          ? 'bg-deepblue text-purewhite shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 shrink-0" />
                      <span>{adm.catTab}</span>
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('settings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                        adminActiveTab === 'settings'
                          ? 'bg-deepblue text-purewhite shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>{adm.settings}</span>
                    </button>
                    
                    <button
                      onClick={() => setAdminActiveTab('firebase-sync')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left mt-2 border border-amber-100 ${
                        adminActiveTab === 'firebase-sync'
                          ? 'bg-amber-500 text-deepblue shadow-md'
                          : 'text-amber-700 bg-amber-50/50 hover:bg-amber-100'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4 shrink-0" />
                      <span>Firebase Sync</span>
                    </button>
                  </nav>
                </div>

                {/* Back to Live View link */}
                <button
                  onClick={() => setCurrentView('menu')}
                  className="w-full bg-purewhite hover:bg-gray-50 text-deepblue font-bold text-xs py-3.5 px-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentLang === 'ku' ? 'گەڕانەوە بۆ مینیوی سەرەکی' : 'Go to Front Menu'}</span>
                </button>
              </div>

              {/* Main Tab Content Panel */}
              <div className="flex-grow flex flex-col min-w-0">
                
                {/* 1. MANAGE MENU ITEMS TAB */}
                {adminActiveTab === 'items' && (
                  <div className="bg-purewhite rounded-3xl p-6 shadow-sm border border-gray-200/50 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-left">
                        <h3 className="text-xl font-extrabold text-deepblue">{adm.itemTab}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Add, Edit or Delete restaurant dishes listed in the menu</p>
                      </div>

                      <button
                        onClick={openAddItemModal}
                        className="bg-green-500 hover:bg-green-600 text-purewhite font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto transition-all active:scale-95 shadow-md border-b-4 border-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{adm.add}</span>
                      </button>
                    </div>

                    {/* Filter & Live Search Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 text-left">
                          {adm.searchPlaceholder}
                        </label>
                        <input
                          type="text"
                          placeholder={currentLang === 'ku' ? "بگەڕێ..." : "Search items..."}
                          value={itemSearchQuery}
                          onChange={(e) => setItemSearchQuery(e.target.value)}
                          className="w-full text-xs font-bold text-deepblue bg-purewhite border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-deepblue focus:ring-1 focus:ring-deepblue"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 text-left">
                          {adm.categoryFilter}
                        </label>
                        <select
                          value={itemCategoryFilter}
                          onChange={(e) => setItemCategoryFilter(e.target.value)}
                          className="w-full text-xs font-bold text-deepblue bg-purewhite border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none"
                        >
                          <option value="all">{adm.all}</option>
                          {categories.map(c => (
                            <option key={c.key} value={c.key}>{c.name[currentLang]}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* List Items Grid */}
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar text-left font-sans">
                      {adminFilteredItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-gray-100">
                          No dishes found.
                        </div>
                      ) : (
                        adminFilteredItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-purewhite hover:bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center gap-4 transition-all hover:shadow-xs group"
                          >
                            <img
                              src={item.image}
                              alt={item.name.en}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                            
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-deepblue text-xs sm:text-sm truncate">
                                  {item.name[currentLang]}
                                </h4>
                                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border border-green-100">
                                  {getCategoryName(item.category, currentLang)}
                                </span>
                              </div>
                              <p className="text-gray-400 text-[10px] truncate mt-0.5 max-w-sm">
                                {item.desc[currentLang] || 'No description provided.'}
                              </p>
                              <div className="text-[11px] font-bold text-deepblue mt-1">
                                {item.price} {t.currency}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditItemModal(item)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-deepblue transition-colors outline-none"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors outline-none"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 2. MANAGE CATEGORIES TAB */}
                {adminActiveTab === 'categories' && (
                  <div className="bg-purewhite rounded-3xl p-6 shadow-sm border border-gray-200/50 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-left">
                        <h3 className="text-xl font-extrabold text-deepblue">{adm.catTab}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Create, edit translation names, cover layouts, and delete food groups</p>
                      </div>

                      <button
                        onClick={openAddCategoryModal}
                        className="bg-green-500 hover:bg-green-600 text-purewhite font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto transition-all active:scale-95 shadow-md border-b-4 border-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{adm.add}</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar text-left font-sans">
                      {categories.map((cat) => (
                        <div
                          key={cat.key}
                          className="bg-purewhite hover:bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <img
                              src={cat.image}
                              alt={cat.key}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                            
                            <div className="min-w-0">
                              <h4 className="font-bold text-deepblue text-xs sm:text-sm">
                                {cat.name[currentLang]}
                              </h4>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 items-center mt-0.5">
                                <span className="text-[10px] text-gray-400 font-mono">ID: {cat.key}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] text-gray-500">EN: {cat.name.en}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] text-gray-500">AR: {cat.name.ar}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] text-gray-500">KU: {cat.name.ku}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => openEditCategoryModal(cat)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-deepblue transition-colors outline-none"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.key)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors outline-none"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SYSTEM CONFIGS & SETTINGS */}
                {adminActiveTab === 'settings' && (
                  <div className="bg-purewhite rounded-3xl p-6 shadow-sm border border-gray-200/50 flex flex-col gap-6 text-left">
                    <div>
                      <h3 className="text-xl font-extrabold text-deepblue">{adm.settings}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Configure system-level parameters, WhatsApp targets, and Telegram bot connections</p>
                    </div>

                    <div className="space-y-4">
                      {/* Passcode changer */}
                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-2">
                          {adm.passcodeLabel}
                        </label>
                        <input
                          type="text"
                          value={adminPasscode}
                          onChange={(e) => setAdminPasscode(e.target.value)}
                          className="w-full bg-purewhite text-sm font-bold text-deepblue px-4 py-2.5 border border-gray-200 rounded-xl focus:border-deepblue focus:outline-none"
                        />
                      </div>

                      {/* WhatsApp number */}
                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-2">
                          {adm.whatsappLabel}
                        </label>
                        <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="w-full bg-purewhite text-sm font-bold text-deepblue px-4 py-2.5 border border-gray-200 rounded-xl focus:border-deepblue focus:outline-none"
                          dir="ltr"
                        />
                      </div>

                      {/* Telegram integration details */}
                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">
                            {adm.telegramBotLabel}
                          </label>
                          <input
                            type="text"
                            value={settings.telegramBotToken}
                            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                            className="w-full bg-purewhite text-xs font-mono text-gray-600 px-3 py-2.5 border border-gray-200 rounded-xl focus:border-deepblue focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">
                            {adm.telegramChatLabel}
                          </label>
                          <input
                            type="text"
                            value={settings.telegramChatId}
                            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                            className="w-full bg-purewhite text-xs font-mono text-gray-600 px-3 py-2.5 border border-gray-200 rounded-xl focus:border-deepblue focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Phone target and Location URLs */}
                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">
                            {adm.phoneLabel}
                          </label>
                          <input
                            type="text"
                            value={settings.phoneNumber}
                            onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                            className="w-full bg-purewhite text-sm font-bold text-deepblue px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">
                            {adm.addressNameLabel}
                          </label>
                          <input
                            type="text"
                            value={settings.addressName}
                            onChange={(e) => setSettings({ ...settings, addressName: e.target.value })}
                            className="w-full bg-purewhite text-sm font-bold text-deepblue px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 mb-2">
                            {adm.addressUrlLabel}
                          </label>
                          <input
                            type="text"
                            value={settings.addressUrl}
                            onChange={(e) => setSettings({ ...settings, addressUrl: e.target.value })}
                            className="w-full bg-purewhite text-xs text-deepblue px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Welcome Page Background Video */}
                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <MediaUploader
                          label={currentLang === 'ku' ? 'ڤیدیۆی باکگراوەندی پێشوازی بڵاو بکەرەوە' : currentLang === 'ar' ? 'قم بتحميل فيديو خلفية الترحيب' : 'Upload Welcome Background Video'}
                          currentUrl={settings.backgroundVideoUrl}
                          onUploadSuccess={(url) => setSettings({ ...settings, backgroundVideoUrl: url })}
                        />
                      </div>

                      {/* Safe Recovery Buttons */}
                      <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                        <button
                          onClick={handleRevertDefaults}
                          className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 font-bold text-xs py-3.5 px-5 rounded-2xl flex items-center gap-2.5 transition-all outline-none"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{adm.revertDefault}</span>
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              await setDoc(doc(firestoreDb, 'settings', 'globalSettings'), { data: settings });
                              await setDoc(doc(firestoreDb, 'settings', 'passcode'), { data: adminPasscode });
                              alert(currentLang === 'ku' ? 'ڕێکخستنەکان پاشەکەوت کران بۆ هەور' : currentLang === 'ar' ? 'تم حفظ الإعدادات في السحابة' : 'Settings saved to cloud successfully!');
                            } catch (error) {
                              console.error(error);
                              alert('Error saving settings');
                            }
                          }}
                          className="ml-auto bg-green-50 text-green-700 px-4 py-2.5 rounded-xl border border-green-100 text-xs font-bold flex items-center gap-2 hover:bg-green-100 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{currentLang === 'ku' ? 'پاشەکەوتکردنی ڕێکخستنەکان' : currentLang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings to Cloud'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FIREBASE SYNC TAB */}
                {adminActiveTab === 'firebase-sync' && (
                  <FirebaseSync menuItems={menuItems} categories={categories} />
                )}

              </div>
            </div>
          </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ================= MODAL DIALOGS ================= */}
      
      {/* B. RESERVATION OR FEEDBACK OR CONTACTS INFORMATION MODAL */}
      <AnimatePresence>
        {(activeFormType === 'reservation' || activeFormType === 'feedback' || activeFormType === 'contact') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-deepblue/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-purewhite w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 max-h-[95vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-purewhite z-20 pb-2 border-b border-gray-100">
                <h3 className="text-xl font-bold text-deepblue">
                  {activeFormType === 'reservation' && t.formReserveTitle}
                  {activeFormType === 'feedback' && t.formFeedbackTitle}
                  {activeFormType === 'contact' && t.contact}
                </h3>
                <button
                  onClick={closeForm}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5 font-bold" />
                </button>
              </div>

              {isSuccess ? (
                /* Success screen */
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5 border border-green-100">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-deepblue mb-1">
                    {t.successMsg}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {t.successSub}
                  </p>
                  
                  <button
                    onClick={closeForm}
                    className="w-full mt-8 bg-gray-100 text-deepblue hover:bg-gray-200 py-3.5 rounded-xl font-bold transition-all focus:outline-none"
                  >
                    {t.close}
                  </button>
                </div>
              ) : (
                /* Interactive Forms */
                <>
                  {activeFormType === 'reservation' && (
                    <form onSubmit={handleReservationSubmit} className="space-y-4">
                      <p className="text-xs text-gray-400 font-medium mb-2 -mt-2">
                        {t.formReserveSubtitle}
                      </p>

                      <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 flex items-center gap-3 transition-all focus-within:border-deepblue">
                        <User className="w-5 h-5 text-deepblue/50 shrink-0" />
                        <div className="flex-grow text-left">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                            {t.name}
                          </label>
                          <input
                            type="text"
                            required
                            value={resName}
                            onChange={(e) => setResName(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-deepblue focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 flex items-center gap-3 transition-all focus-within:border-deepblue">
                        <Phone className="w-5 h-5 text-deepblue/50 shrink-0" />
                        <div className="flex-grow text-left">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                            {t.phone}
                          </label>
                          <input
                            type="tel"
                            required
                            value={resPhone}
                            onChange={(e) => setResPhone(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-deepblue focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                            {t.date}
                          </label>
                          <input
                            type="date"
                            required
                            value={resDate}
                            onChange={(e) => setResDate(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-deepblue focus:outline-none"
                          />
                        </div>
                        <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                            {t.time}
                          </label>
                          <input
                            type="time"
                            required
                            value={resTime}
                            onChange={(e) => setResTime(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-deepblue focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                            {t.guests}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={resGuests}
                            onChange={(e) => setResGuests(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-deepblue focus:outline-none"
                          />
                        </div>
                        <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                          <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                            {t.area}
                          </label>
                          <select
                            value={resArea}
                            onChange={(e) => setResArea(e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-deepblue focus:outline-none cursor-pointer"
                          >
                            <option value="Indoor">{t.indoor}</option>
                            <option value="Outdoor">{t.outdoor}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                          {t.occasion} <span className="text-gray-300">({currentLang === 'en' ? 'optional' : currentLang === 'ar' ? 'اختياري' : 'ئارەزوومەندانە'})</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Birthday, Anniversary..."
                          value={resOccasion}
                          onChange={(e) => setResOccasion(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-deepblue focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-deepblue text-purewhite hover:bg-deepblue-light py-4 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg focus:outline-none"
                      >
                        <span>{isSubmitting ? '...' : t.submit}</span>
                        <Send className="w-5 h-5 shrink-0" />
                      </button>
                    </form>
                  )}

                  {activeFormType === 'feedback' && (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                      <p className="text-xs text-gray-400 font-medium mb-3 -mt-2">
                        {t.formFeedbackSubtitle}
                      </p>

                      <div className="grid grid-cols-1 gap-3.5">
                        {/* Rating Metric Rows */}
                        {[
                          { id: 'food', label: t.qFood, icon: <UtensilsCrossed className="w-5 h-5 text-deepblue/60" /> },
                          { id: 'service', label: t.qService, icon: <Users className="w-5 h-5 text-deepblue/60" /> },
                          { id: 'clean', label: t.qClean, icon: <Sparkles className="w-5 h-5 text-deepblue/60" /> },
                          { id: 'value', label: t.qValue, icon: <DollarSign className="w-5 h-5 text-deepblue/60" /> }
                        ].map((m) => {
                          const ratingValue = feedRatings[m.id as keyof typeof feedRatings];
                          return (
                            <div key={m.id} className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                  {m.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-600">{m.label}</span>
                              </div>
                              <div className="flex gap-1" dir="ltr">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedRatings({ ...feedRatings, [m.id]: star })}
                                    className={`text-xl transition-all hover:scale-110 focus:outline-none ${
                                      star <= ratingValue ? 'text-amber-400' : 'text-gray-300'
                                    }`}
                                  >
                                    <Star className="w-5 h-5 fill-current" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                          {t.name} <span className="text-gray-300">({currentLang === 'en' ? 'optional' : currentLang === 'ar' ? 'اختياري' : 'ئارەزوومەندانە'})</span>
                        </label>
                        <input
                          type="text"
                          value={feedName}
                          onChange={(e) => setFeedName(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-deepblue focus:outline-none"
                        />
                      </div>

                      <div className="form-input-group border border-gray-200 bg-gray-50/50 rounded-2xl p-3 text-left transition-all focus-within:border-deepblue">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                          {t.comments}
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={feedComments}
                          onChange={(e) => setFeedComments(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-deepblue resize-none focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#24A1DE] hover:bg-[#1E8BBF] text-purewhite py-4 rounded-2xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg focus:outline-none"
                      >
                        <span>{isSubmitting ? '...' : t.submitFeedback}</span>
                        <Send className="w-5 h-5 shrink-0" />
                      </button>
                    </form>
                  )}

                  {activeFormType === 'contact' && (
                    <div className="space-y-4">
                      {/* Interactive Deep-link cards */}
                      <a
                        href={settings.addressUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all cursor-pointer block text-left"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400">
                            {currentLang === 'en' ? 'Location' : currentLang === 'ar' ? 'الموقع' : 'شوێن'}
                          </h4>
                          <p className="font-bold text-deepblue text-xs leading-tight mt-0.5">
                            {settings.addressName}
                          </p>
                        </div>
                      </a>

                      <a
                        href={`tel:${settings.phoneNumber.replace(/[^0-9+]/g, '')}`}
                        className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all cursor-pointer block text-left"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm shrink-0">
                          <PhoneCall className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400">
                            {currentLang === 'en' ? 'Call Us' : currentLang === 'ar' ? 'اتصل بنا' : 'پەیوەندی بکە'}
                          </h4>
                          <p className="font-bold text-deepblue text-xs leading-tight mt-0.5" dir="ltr">
                            {settings.phoneNumber}
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. INDIVIDUAL FOOD ITEM DETAILS PREVIEW DIALOG */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-deepblue/90 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="bg-purewhite w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className={`absolute top-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-purewhite backdrop-blur-md focus:outline-none hover:bg-black/60 transition-colors ${
                  isRTL ? 'left-4' : 'right-4'
                }`}
              >
                <X className="w-5 h-5 font-bold" />
              </button>
              
              <div className="w-full h-64 sm:h-72 shrink-0 relative">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name[currentLang]}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 overflow-y-auto no-scrollbar flex-grow bg-purewhite text-left">
                <h3 className="text-2xl font-bold text-deepblue mb-2">
                  {selectedItem.name[currentLang]}
                </h3>
                
                <div className="inline-block bg-offwhite text-deepblue font-bold px-4 py-1.5 rounded-xl border border-gray-200 mb-4 text-sm shadow-sm">
                  {isRTL
                    ? `${t.currency} ${selectedItem.price}`
                    : `${selectedItem.price} ${t.currency}`}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-gray-600 text-base leading-relaxed">
                    {selectedItem.desc[currentLang]}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. ADMIN ADD/EDIT FOOD ITEM DIALOG */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItemModalOpen(false)}
              className="absolute inset-0 bg-deepblue/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-purewhite w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 text-left"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-[17px] font-black text-deepblue">
                  {editingItem ? adm.editItem : adm.addItem}
                </h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveItemSubmit} className="space-y-4 text-xs font-bold text-gray-500">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">{adm.itemNameEn}</label>
                    <input
                      type="text"
                      required
                      value={inputItemNameEn}
                      onChange={(e) => setInputItemNameEn(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-deepblue"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.itemNameAr}</label>
                    <input
                      type="text"
                      required
                      value={inputItemNameAr}
                      onChange={(e) => setInputItemNameAr(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 lg:text-right focus:outline-none focus:border-deepblue"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.itemNameKu}</label>
                    <input
                      type="text"
                      required
                      value={inputItemNameKu}
                      onChange={(e) => setInputItemNameKu(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 lg:text-right focus:outline-none focus:border-deepblue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">{adm.itemDescEn}</label>
                    <textarea
                      rows={2}
                      value={inputItemDescEn}
                      onChange={(e) => setInputItemDescEn(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.itemDescAr}</label>
                    <textarea
                      rows={2}
                      value={inputItemDescAr}
                      onChange={(e) => setInputItemDescAr(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.itemDescKu}</label>
                    <textarea
                      rows={2}
                      value={inputItemDescKu}
                      onChange={(e) => setInputItemDescKu(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">{adm.itemPrice}</label>
                    <input
                      type="text"
                      required
                      value={inputItemPrice}
                      onChange={(e) => setInputItemPrice(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">{adm.categoryFilter}</label>
                    <select
                      value={inputItemCategory}
                      onChange={(e) => setInputItemCategory(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.name[currentLang]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">{adm.itemSubCat}</label>
                  <select
                    value={inputItemSubCategory}
                    onChange={(e) => setInputItemSubCategory(e.target.value as any)}
                    className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                  >
                    <option value="none">{adm.noSub}</option>
                    <option value="juice">Juice / شەربەت</option>
                    <option value="energy">Energy Drink / خواردنەوە وزەبەخشەکان</option>
                    <option value="soft">Soft Drink / خواردنەوە گازییەکان</option>
                    <option value="other">Other - Water / ئاو و هی تر</option>
                  </select>
                </div>

                <div className="mb-4">
                  <MediaUploader 
                    label={adm.itemImage}
                    currentUrl={inputItemImage}
                    onUploadSuccess={(url) => setInputItemImage(url)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-deepblue px-5 py-2.5 rounded-xl transition-all"
                  >
                    {adm.cancel}
                  </button>

                  <button
                    type="submit"
                    className="bg-deepblue hover:bg-deepblue-light text-purewhite px-5 py-2.5 rounded-xl transition-all font-black"
                  >
                    {adm.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. ADMIN ADD/EDIT CATEGORY DIALOG */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-deepblue/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-purewhite w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 text-left shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-[17px] font-black text-deepblue">
                  {editingCategory ? adm.editCat : adm.addCat}
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs font-bold text-gray-500">
                
                <div>
                  <label className="block mb-1">{adm.catKey}</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    placeholder="e.g. burgers"
                    value={inputCatKey}
                    onChange={(e) => setInputCatKey(e.target.value)}
                    className="w-full text-xs text-deepblue bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">{adm.catNameEn}</label>
                    <input
                      type="text"
                      required
                      value={inputCatNameEn}
                      onChange={(e) => setInputCatNameEn(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.catNameAr}</label>
                    <input
                      type="text"
                      required
                      value={inputCatNameAr}
                      onChange={(e) => setInputCatNameAr(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{adm.catNameKu}</label>
                    <input
                      type="text"
                      required
                      value={inputCatNameKu}
                      onChange={(e) => setInputCatNameKu(e.target.value)}
                      className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <MediaUploader
                    label={adm.catImage}
                    currentUrl={inputCatImage}
                    onUploadSuccess={(url) => setInputCatImage(url)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-deepblue px-5 py-2.5 rounded-xl transition-all"
                  >
                    {adm.cancel}
                  </button>

                  <button
                    type="submit"
                    className="bg-deepblue hover:bg-deepblue-light text-purewhite px-5 py-2.5 rounded-xl transition-all font-black"
                  >
                    {adm.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= FOOTER ================= */}
      <div className="fixed bottom-0 left-0 w-full z-[90]" dir="ltr">
        <div className="w-full flex items-center justify-center gap-1.5 bg-deepblue/95 backdrop-blur-md border-t border-white/10 py-2 shadow-lg">
          <span className="text-[9px] font-medium text-white/50 uppercase tracking-[0.15em] font-sans">
            Powered by
          </span>
          <a
            href="https://masmenu.masmenu.workers.dev/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-white/90 tracking-widest font-sans hover:underline hover:text-white transition-all active:scale-95"
          >
            MAS MENU
          </a>
        </div>
      </div>

    </div>
  );
}

// Subcomponent: Menu Item Card
interface MenuItemCardProps {
  key?: React.Key;
  item: MenuItem;
  index: number;
  viewMode: 'list' | 'grid';
  currentLang: Language;
  currency: string;
  onClick: () => void;
}

function MenuItemCard({ item, index, viewMode, currentLang, currency, onClick }: MenuItemCardProps) {
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const priceLabel = isRTL ? `${currency} ${item.price}` : `${item.price} ${currency}`;

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04, duration: 0.25 }}
        onClick={onClick}
        className="bg-purewhite rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md active:scale-[0.98] transition-all cursor-pointer text-left"
      >
        <div className="w-full h-32 relative">
          <img src={item.image} alt={item.name[currentLang]} className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex-grow flex flex-col justify-between gap-2">
          <h3 className="font-bold text-deepblue text-[13px] leading-tight line-clamp-2">
            {item.name[currentLang]}
          </h3>
          <span className="text-deepblue font-bold text-[12px] bg-offwhite px-2 py-0.5 rounded-md inline-block w-fit shadow-xs">
            {priceLabel}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      className="bg-purewhite rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md active:scale-[0.98] transition-all items-center cursor-pointer text-left"
    >
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden shadow-xs">
        <img src={item.image} alt={item.name[currentLang]} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-deepblue truncate">
            {item.name[currentLang]}
          </h3>
          <span className="bg-offwhite text-deepblue font-bold px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap shadow-xs">
            {priceLabel}
          </span>
        </div>
        <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">
          {item.desc[currentLang]}
        </p>
      </div>
    </motion.div>
  );
}
