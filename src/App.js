import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, onSnapshot, deleteDoc, updateDoc, serverTimestamp, increment, setDoc, getDocs } from 'firebase/firestore';
import { Phone, Mail, Globe, MapPin, UserPlus, Trash2, Edit2, Share2, Plus, X, ExternalLink, QrCode, MessageCircle, ArrowRight, AlertCircle, LogOut, Lock, FileText, Image as ImageIcon, Palette, Grid, BarChart3, Activity, MousePointerClick, Users, Send, Map as MapIcon, Wallet, CreditCard, LayoutTemplate, Video, PlayCircle, Crown, Facebook, Twitter, Instagram, Linkedin, Youtube, Building2, User, Eye, Smartphone, Link as LinkIcon, Languages, Download, ShoppingBag, Package, ShoppingCart, CircleDashed, Clock, Eye as EyeIcon, ChevronDown } from 'lucide-react';

// --- تهيئة Firebase ---
let firebaseConfig;
try {
  // eslint-disable-next-line no-undef
  if (typeof __firebase_config !== 'undefined') {
    // eslint-disable-next-line no-undef
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    throw new Error('Environment config not found');
  }
} catch (e) {
  console.log("Running in local mode.");
  firebaseConfig = {
    apiKey: "AIzaSyCWqSVKT-ezEuGZFxI0fztNEXqaBnixu50",
    authDomain: "wafarle-f16a0.firebaseapp.com",
    projectId: "wafarle-f16a0",
    storageBucket: "wafarle-f16a0.firebasestorage.app",
    messagingSenderId: "473633074583",
    appId: "1:473633074583:web:79d443fb4f2d188fe2a8d2",
    measurementId: "G-7WHS1K7TCQ"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// eslint-disable-next-line no-undef
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Helper: Get Localized Value ---
// يتعامل مع البيانات سواء كانت نص عادي (قديم) أو كائن متعدد اللغات (جديد)
const getLocalized = (val, lang) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val[lang] || val['ar'] || val['en'] || '';
  }
  return val; // Fallback for old string data
};

// --- قاموس الترجمة (Translations) ---
const translations = {
  ar: {
    loading: 'جاري التحميل...',
    loginTitle: 'تسجيل دخول المدير',
    registerTitle: 'إنشاء حساب مدير',
    loginSubtitle: 'قم بتسجيل الدخول لإدارة البطاقات',
    registerSubtitle: 'أدخل بياناتك لإنشاء حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginBtn: 'دخول',
    registerBtn: 'إنشاء حساب',
    haveAccount: 'لديك حساب بالفعل؟ سجل دخول',
    noAccount: 'ليس لديك حساب؟ إنشاء حساب جديد',
    dashboardTitle: 'إدارة البطاقات',
    addNew: 'إضافة جديد',
    logout: 'تسجيل خروج',
    noCards: 'لا يوجد بطاقات حالياً',
    noCardsSub: 'أضف بيانات الموظفين أو الشركات لإنشاء بطاقات رقمية لهم',
    addFirst: '+ إضافة أول بطاقة',
    employee: 'موظف',
    company: 'شركة',
    views: 'زيارة',
    clicks: 'نقرة',
    stats: 'الإحصائيات',
    leads: 'العملاء',
    code: 'الرمز',
    preview: 'معاينة',
    editData: 'تعديل بيانات',
    createCard: 'إنشاء بطاقة جديدة',
    profileType: 'نوع البروفايل',
    profileTypeEmp: 'بروفايل موظف',
    profileTypeComp: 'بروفايل شركة',
    slugLabel: 'رابط مميز (Custom Slug)',
    slugHint: 'اجعل رابط بطاقتك قصيراً (مثل: your-name)',
    template: 'القالب',
    design: 'تصميم البطاقة (Premium)',
    bgVideo: 'فيديو الخلفية (URL)',
    profileVideo: 'فيديو البروفايل (URL)',
    cardColor: 'لون البطاقة',
    generalDesign: 'للتصميم العام',
    fullName: 'الاسم الكامل',
    compName: 'اسم الشركة',
    mobile: 'الجوال',
    whatsapp: 'واتساب',
    jobTitle: 'المسمى الوظيفي',
    slogan: 'شعار نصي / المجال (Slogan)',
    logoUrl: 'رابط شعار الشركة (Logo URL)',
    photoUrl: 'رابط الصورة الشخصية',
    profilePdf: 'ملف تعريفي (PDF)',
    cvPdf: 'رابط الـ CV (PDF)',
    website: 'الموقع الإلكتروني',
    socials: 'وسائل التواصل الاجتماعي',
    save: 'حفظ البيانات',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    deleteConfirm: 'هل أنت متأكد من حذف هذا البروفايل؟',
    deleteError: 'حدث خطأ أثناء الحذف.',
    saveError: 'حدث خطأ أثناء الحفظ',
    permissionError: 'خطأ: ليس لديك صلاحية للكتابة في قاعدة البيانات.',
    contactMe: 'تواصل معي',
    saveContact: 'حفظ جهة الاتصال',
    exchangeContact: 'تبادل جهات الاتصال',
    downloadCv: 'تحميل السيرة الذاتية',
    downloadProfile: 'الملف التعريفي',
    call: 'اتصال',
    emailAction: 'إيميل',
    websiteAction: 'الموقع',
    leadsTitle: 'العملاء المهتمين',
    noLeads: 'لا يوجد عملاء مسجلين حتى الآن',
    leadName: 'الاسم الكريم',
    leadPhone: 'رقم الجوال',
    send: 'إرسال',
    sentSuccess: 'تم الإرسال بنجاح!',
    sentMsg: 'شكراً لك، سأقوم بالتواصل معك قريباً.',
    shareData: 'شارك بياناتك لنتواصل معك',
    walletNote: 'هذه معاينة فقط. يتطلب التفعيل خادماً خلفياً.',
    addToApple: 'إضافة إلى Apple Wallet',
    addToGoogle: 'إضافة إلى Google Wallet',
    overview: 'نظرة عامة',
    heatmap: 'الخريطة الحرارية',
    totalViews: 'إجمالي الزيارات',
    totalClicks: 'إجمالي النقرات',
    interactions: 'تفاعل الأزرار',
    topCountries: 'أهم الدول',
    scanLocations: 'أماكن المسح النشطة',
    mapNote: 'النقاط الحمراء تمثل التجمعات الجغرافية للمستخدمين الذين قاموا بمسح الرمز.',
    classic: 'كلاسيكي',
    modern: 'عصري',
    creative: 'إبداعي',
    elegant: 'أنيق',
    professional: 'احترافي',
    minimal: 'بسيط',
    gradient: 'متدرج',
    neon: 'نيون',
    luxury: 'فاخر',
    glassmorphism: 'زجاجي',
    cyberpunk: 'سايبر بانك',
    alertTitle: 'تنبيه أمني',
    alertMsg: 'يرجى التأكد من صلاحيات Firestore Rules.',
    installApp: 'تثبيت التطبيق',
    productsTitle: 'المنتجات والخدمات',
    manageProducts: 'إدارة المنتجات',
    addProduct: 'إضافة منتج',
    prodName: 'اسم المنتج',
    prodPrice: 'السعر',
    prodDesc: 'الوصف',
    prodImg: 'رابط الصورة',
    prodLink: 'رابط خارجي (اختياري)',
    buy: 'طلب / شراء',
    noProducts: 'لا يوجد منتجات مضافة حالياً',
    currency: 'ر.س',
    tabInfo: 'المعلومات',
    tabProducts: 'المنتجات',
    orderInterest: 'مهتم بمنتج: ',
    storiesTitle: 'القصص (Stories)',
    manageStories: 'إدارة القصص',
    addStory: 'إضافة قصة',
    storyUrl: 'رابط الصورة/الفيديو',
    storyType: 'النوع',
    typeImage: 'صورة',
    typeVideo: 'فيديو',
    noStories: 'لا توجد قصص',
    linkProduct: 'ربط بمنتج (اختياري)',
    selectProduct: 'اختر منتجاً...',
    viewProduct: 'عرض المنتج',
    langAr: 'عربي',
    langEn: 'English',
  },
  en: {
    loading: 'Loading...',
    loginTitle: 'Admin Login',
    registerTitle: 'Create Admin Account',
    loginSubtitle: 'Login to manage cards',
    registerSubtitle: 'Enter your details to create an account',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Login',
    registerBtn: 'Sign Up',
    haveAccount: 'Already have an account? Login',
    noAccount: 'No account? Create one',
    dashboardTitle: 'Cards Management',
    addNew: 'Add New',
    logout: 'Logout',
    noCards: 'No cards found',
    noCardsSub: 'Add employees or companies to create digital cards',
    addFirst: '+ Add First Card',
    employee: 'Employee',
    company: 'Company',
    views: 'Views',
    clicks: 'Clicks',
    stats: 'Stats',
    leads: 'Leads',
    code: 'Code',
    preview: 'Preview',
    editData: 'Edit Data',
    createCard: 'Create New Card',
    profileType: 'Profile Type',
    profileTypeEmp: 'Employee Profile',
    profileTypeComp: 'Company Profile',
    slugLabel: 'Custom Slug',
    slugHint: 'Make your link short (e.g. your-name)',
    template: 'Template',
    design: 'Card Design (Premium)',
    bgVideo: 'Background Video (URL)',
    profileVideo: 'Profile Video (URL)',
    cardColor: 'Card Color',
    generalDesign: 'General Design',
    fullName: 'Full Name',
    compName: 'Company Name',
    mobile: 'Mobile',
    whatsapp: 'WhatsApp',
    jobTitle: 'Job Title',
    slogan: 'Slogan / Industry',
    logoUrl: 'Logo URL',
    photoUrl: 'Profile Photo URL',
    profilePdf: 'Company Profile (PDF)',
    cvPdf: 'CV Link (PDF)',
    website: 'Website',
    socials: 'Social Media',
    save: 'Save Data',
    saving: 'Saving...',
    cancel: 'Cancel',
    deleteConfirm: 'Are you sure you want to delete this profile?',
    deleteError: 'Error occurred while deleting.',
    saveError: 'Error occurred while saving',
    permissionError: 'Error: You do not have permission to write to the database.',
    contactMe: 'Contact Me',
    saveContact: 'Save Contact',
    exchangeContact: 'Exchange Contact',
    downloadCv: 'Download CV',
    downloadProfile: 'Company Profile',
    call: 'Call',
    emailAction: 'Email',
    websiteAction: 'Website',
    leadsTitle: 'Interested Leads',
    noLeads: 'No leads registered yet',
    leadName: 'Your Name',
    leadPhone: 'Mobile Number',
    send: 'Send',
    sentSuccess: 'Sent Successfully!',
    sentMsg: 'Thank you, I will contact you soon.',
    shareData: 'Share your info to connect',
    walletNote: 'This is a preview. Actual implementation requires a backend.',
    addToApple: 'Add to Apple Wallet',
    addToGoogle: 'Add to Google Wallet',
    overview: 'Overview',
    heatmap: 'Heatmap',
    totalViews: 'Total Views',
    totalClicks: 'Total Clicks',
    interactions: 'Button Interactions',
    topCountries: 'Top Countries',
    scanLocations: 'Active Scan Locations',
    mapNote: 'Red dots represent geographic clusters of users who scanned the code.',
    classic: 'Classic',
    modern: 'Modern',
    creative: 'Creative',
    elegant: 'Elegant',
    professional: 'Professional',
    minimal: 'Minimal',
    gradient: 'Gradient',
    neon: 'Neon',
    luxury: 'Luxury',
    glassmorphism: 'Glassmorphism',
    cyberpunk: 'Cyberpunk',
    alertTitle: 'Security Alert',
    alertMsg: 'Please check Firestore Rules permissions.',
    installApp: 'Install App',
    productsTitle: 'Products & Services',
    manageProducts: 'Manage Products',
    addProduct: 'Add Product',
    prodName: 'Product Name',
    prodPrice: 'Price',
    prodDesc: 'Description',
    prodImg: 'Image URL',
    prodLink: 'Purchase Link (Optional)',
    buy: 'Order / Buy',
    noProducts: 'No products added yet',
    currency: 'SAR',
    tabInfo: 'Info',
    tabProducts: 'Products',
    orderInterest: 'Interested in: ',
    storiesTitle: 'Stories',
    manageStories: 'Manage Stories',
    addStory: 'Add Story',
    storyUrl: 'Image/Video URL',
    storyType: 'Type',
    typeImage: 'Image',
    typeVideo: 'Video',
    noStories: 'No stories',
    linkProduct: 'Link Product (Optional)',
    selectProduct: 'Select a product...',
    viewProduct: 'View Product',
    langAr: 'Arabic',
    langEn: 'English',
  }
};

// --- المكون الرئيسي ---
export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('loading'); // loading, login, dashboard, profile
  const [profileData, setProfileData] = useState({ id: null, adminId: null });
  const [lang, setLang] = useState('ar'); 
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const t = translations[lang]; 

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };
  
  // PWA Initialization
  useEffect(() => {
    // 1. Inject Manifest dynamically
    const manifest = {
      name: "Digital Cards",
      short_name: "DigiCard",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#2563eb",
      description: "Manage your digital business cards and share them easily.",
      scope: "/",
      icons: [
        {
          src: "https://cdn-icons-png.flaticon.com/512/3616/3616927.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "https://cdn-icons-png.flaticon.com/512/3616/3616927.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel*='manifest']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
    }
    link.href = manifestURL;

    // 2. Handle Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const checkRoute = (currentUser) => {
    const hashString = window.location.hash.substring(1); 
    
    // 1. الرابط الافتراضي
    if (hashString.includes('uid=') && hashString.includes('pid=')) {
      const params = new URLSearchParams(hashString);
      const pid = params.get('pid');
      const uid = params.get('uid');
      if (pid && uid) {
        setProfileData({ id: pid, adminId: uid });
        setViewMode('profile');
        if (!currentUser) signInAnonymously(auth).catch(console.error);
        return;
      }
    } 
    // 2. الرابط المختصر (Slug)
    else if (hashString && !hashString.includes('=')) {
        try {
            const slugRef = doc(db, 'artifacts', appId, 'public', 'data', 'slugs', hashString);
            getDoc(slugRef).then(slugSnap => {
                if (slugSnap.exists()) {
                    const data = slugSnap.data();
                    setProfileData({ id: data.targetEmpId, adminId: data.targetUid });
                    setViewMode('profile');
                    if (!currentUser) signInAnonymously(auth).catch(console.error);
                }
            });
            return;
        } catch (e) {
            console.error("Error fetching slug:", e);
        }
    }

    // 3. التوجيه الافتراضي
    if (currentUser && !currentUser.isAnonymous) {
      setViewMode('dashboard');
    } else {
      setViewMode('login');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    
    initAuth();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      checkRoute(currentUser);
    });

    const onHashChange = () => checkRoute(auth.currentUser);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewMode('login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (viewMode === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {viewMode === 'profile' ? (
        <ProfileView data={profileData} user={user} lang={lang} toggleLang={toggleLang} t={t} />
      ) : viewMode === 'login' ? (
        <LoginView lang={lang} toggleLang={toggleLang} t={t} />
      ) : (
        <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            lang={lang} 
            toggleLang={toggleLang} 
            t={t}
            installPrompt={deferredPrompt}
            onInstall={handleInstallClick} 
        />
      )}
    </div>
  );
}

// --- شاشة تسجيل الدخول ---
function LoginView({ lang, toggleLang, t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ: ' + err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 relative">
      <button onClick={toggleLang} className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm text-slate-600 hover:text-blue-600">
        <Languages size={18} />
        <span className="text-sm font-bold uppercase">{lang === 'ar' ? 'English' : 'عربي'}</span>
      </button>

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegistering ? t.registerTitle : t.loginTitle}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegistering ? t.registerSubtitle : t.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isRegistering ? t.registerBtn : t.loginBtn
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            {isRegistering ? t.haveAccount : t.noAccount}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- لوحة التحكم ---
function Dashboard({ user, onLogout, lang, toggleLang, t, installPrompt, onInstall }) {
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [analyticsEmployee, setAnalyticsEmployee] = useState(null);
  const [leadsEmployee, setLeadsEmployee] = useState(null); 
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [productManagerEmployee, setProductManagerEmployee] = useState(null);
  const [storiesManagerEmployee, setStoriesManagerEmployee] = useState(null); 

  useEffect(() => {
    if (!user) return;
    
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'employees');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPermissionError(false);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setEmployees(docs);
    }, (error) => {
      console.error("Error fetching employees:", error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (emp) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        if (emp.slug) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'slugs', emp.slug));
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', emp.id));
      } catch (e) {
        console.error("Error deleting:", e);
        window.alert(t.deleteError);
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{t.dashboardTitle}</h1>
            <h1 className="text-xl font-bold text-slate-800 sm:hidden">{t.dashboardTitle}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {installPrompt && (
                <button 
                    onClick={onInstall}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">{t.installApp}</span>
                </button>
            )}

            <button onClick={toggleLang} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors font-bold text-xs uppercase">
                {lang === 'ar' ? 'EN' : 'AR'}
            </button>
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t.addNew}</span>
            </button>
            <button 
              onClick={onLogout}
              className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg transition-colors border border-slate-200"
              title={t.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {permissionError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="text-red-500 mt-1">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-red-800 font-bold mb-1">{t.alertTitle}</h3>
              <p className="text-red-600 text-sm">
                {t.alertMsg}
              </p>
            </div>
          </div>
        )}

        {employees.length === 0 && !permissionError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t.noCards}</h3>
            <p className="text-slate-500 mb-6">{t.noCardsSub}</p>
            <button onClick={handleAddNew} className="text-blue-600 font-bold hover:underline">
              {t.addFirst}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                userId={user.uid}
                onDelete={() => handleDelete(emp)}
                onEdit={() => handleEdit(emp)}
                onShowQR={() => setSelectedEmployee(emp)}
                onShowAnalytics={() => setAnalyticsEmployee(emp)}
                onShowLeads={() => setLeadsEmployee(emp)}
                onPreview={() => setPreviewEmployee(emp)} 
                onManageProducts={() => setProductManagerEmployee(emp)}
                onManageStories={() => setStoriesManagerEmployee(emp)} 
                t={t}
                lang={lang} // Pass current app language
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <EmployeeForm 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingEmployee}
          userId={user.uid}
          t={t}
        />
      )}

      {selectedEmployee && (
        <QRModal 
          employee={selectedEmployee} 
          userId={user.uid}
          onClose={() => setSelectedEmployee(null)} 
          t={t}
        />
      )}

      {analyticsEmployee && (
        <AnalyticsModal 
          employee={analyticsEmployee}
          onClose={() => setAnalyticsEmployee(null)}
          t={t}
        />
      )}

      {leadsEmployee && (
        <LeadsListModal
          userId={user.uid}
          employee={leadsEmployee}
          onClose={() => setLeadsEmployee(null)}
          t={t}
        />
      )}

      {previewEmployee && (
        <PreviewModal
          employee={previewEmployee}
          userId={user.uid}
          onClose={() => setPreviewEmployee(null)}
          t={t}
        />
      )}

      {productManagerEmployee && (
        <ProductsManagerModal
          userId={user.uid}
          employee={productManagerEmployee}
          onClose={() => setProductManagerEmployee(null)}
          t={t}
        />
      )}

      {storiesManagerEmployee && (
        <StoriesManagerModal
          userId={user.uid}
          employee={storiesManagerEmployee}
          onClose={() => setStoriesManagerEmployee(null)}
          t={t}
        />
      )}
    </div>
  );
}

// --- بطاقة الموظف في القائمة ---
function EmployeeCard({ employee, onDelete, onEdit, onShowQR, onShowAnalytics, onShowLeads, onPreview, onManageProducts, onManageStories, userId, t, lang }) {
  const themeColor = employee.themeColor || '#2563eb';
  const views = employee.stats?.views || 0;
  const isCompany = employee.profileType === 'company';
  
  const templateName = {
      'classic': t.classic,
      'modern': t.modern,
      'creative': t.creative,
      'elegant': t.elegant,
      'professional': t.professional,
      'minimal': t.minimal,
      'gradient': t.gradient,
      'neon': t.neon,
      'luxury': t.luxury,
      'glassmorphism': t.glassmorphism,
      'cyberpunk': t.cyberpunk
  }[employee.template] || t.classic;

  const displayName = getLocalized(employee.name, lang);
  const displayJob = getLocalized(employee.jobTitle, lang);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {employee.photoUrl ? (
            <img 
              src={employee.photoUrl} 
              alt={displayName} 
              className={`w-12 h-12 object-cover border border-slate-200 ${isCompany ? 'rounded-lg' : 'rounded-full'}`}
              style={{ borderColor: themeColor }}
            />
          ) : (
            <div 
              className={`w-12 h-12 flex items-center justify-center text-xl font-bold text-white ${isCompany ? 'rounded-lg' : 'rounded-full'}`}
              style={{ backgroundColor: themeColor }}
            >
              {isCompany ? <Building2 size={20} /> : (displayName ? displayName.charAt(0) : '?')}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 line-clamp-1">{displayName}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {isCompany ? (displayJob || t.company) : (displayJob || t.employee)}
            </p>
            {employee.slug && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block font-mono">
                /{employee.slug}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${isCompany ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
            {isCompany ? <Building2 size={12} /> : <User size={12} />}
            {isCompany ? t.profileTypeComp : t.profileTypeEmp}
          </span>
          <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-medium">
            {templateName}
          </span>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
        <div className="flex items-center gap-1">
            <Activity size={14} className="text-blue-500" />
            <span>{views} {t.views}</span>
        </div>
        <div className="flex items-center gap-1">
            <MousePointerClick size={14} className="text-orange-500" />
            <span>{Object.values(employee.stats?.clicks || {}).reduce((a, b) => a + b, 0)} {t.clicks}</span>
        </div>
      </div>
      
      {/* أزرار الإدارة الإضافية */}
      <div className="flex gap-2 mb-2">
        <button 
          onClick={onManageProducts}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <ShoppingBag size={14} />
          {t.manageProducts}
        </button>
        <button 
          onClick={onManageStories}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border border-slate-200 text-pink-600 hover:bg-pink-50 transition-colors"
        >
          <CircleDashed size={14} />
          {t.manageStories}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={onShowAnalytics} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title={t.stats}><BarChart3 size={16} /></button>
        <button onClick={onShowLeads} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title={t.leads}><Users size={16} /></button>
        <button onClick={onShowQR} className="text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors opacity-90 hover:opacity-100" style={{ backgroundColor: themeColor }} title={t.code}><QrCode size={16} /></button>
        <button onClick={onPreview} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors" title={t.preview}><Eye size={16} /></button>
      </div>
    </div>
  );
}

// --- صفحة البروفايل (محدثة مع التبويبات والقصص واللغة) ---
function ProfileView({ data: profileData, user, lang, toggleLang, t }) {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // info, products
  const [error, setError] = useState(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadInterest, setLeadInterest] = useState(''); // المنتج المهتم به
  const [showWalletModal, setShowWalletModal] = useState(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false); // حالة القصة
  const isLogged = useRef(false);

  // جلب البيانات + المنتجات + القصص
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const empRef = doc(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id);
        const empSnap = await getDoc(empRef);
        
        if (empSnap.exists()) {
          setData(empSnap.data());
          
          // جلب المنتجات
          const prodRef = collection(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id, 'products');
          const prodSnap = await getDocs(prodRef);
          const prods = [];
          prodSnap.forEach(d => prods.push({id: d.id, ...d.data()}));
          setProducts(prods);

          // جلب القصص
          const storyRef = collection(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id, 'stories');
          const storySnap = await getDocs(storyRef);
          const storyList = [];
          storySnap.forEach(d => storyList.push({id: d.id, ...d.data()}));
          // ترتيب القصص
          storyList.sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
          setStories(storyList);

          // تسجيل التحليلات (مرة واحدة)
          if (!isLogged.current) {
            isLogged.current = true;
            try {
                const res = await fetch('https://ipwho.is/');
                const geo = await res.json();
                const countryCode = geo.success ? geo.country_code : 'Unknown';
                const lat = geo.success ? geo.latitude : 0;
                const lng = geo.success ? geo.longitude : 0;
                const locationKey = `${Math.round(lat * 10) / 10}_${Math.round(lng * 10) / 10}`;
                await setDoc(empRef, {
                    stats: { views: increment(1), countries: { [countryCode]: increment(1) }, heatmap: { [locationKey]: increment(1) } }
                }, { merge: true });
            } catch (e) { /* ignore */ }
          }
        } else {
          setError('لم يتم العثور على البطاقة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileData, user]);

  const trackClick = async (action) => {
    try {
        const docRef = doc(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id);
        await setDoc(docRef, { stats: { clicks: { [action]: increment(1) } } }, { merge: true });
    } catch (e) { /* ignore */ }
  };

  const handleBuyProduct = (prod) => {
      trackClick(`buy_${prod.name}`);
      if (prod.link) {
          window.open(prod.link, '_blank');
      } else {
          setLeadInterest(`${t.orderInterest} ${prod.name}`);
          setIsLeadFormOpen(true);
      }
  };

  const handleStoryAction = (productName) => {
      setIsStoryOpen(false); // إغلاق القصص
      setLeadInterest(`${t.orderInterest} ${productName}`);
      setIsLeadFormOpen(true); // فتح الفورم
  };

  const downloadVCard = () => {
    trackClick('save_contact');
    if (!data) return;
    const isCompany = data.profileType === 'company';
    const localizedName = getLocalized(data.name, lang);
    const localizedCompany = getLocalized(data.company, lang);
    const localizedTitle = getLocalized(data.jobTitle, lang);

    const org = isCompany ? localizedName : (localizedCompany || '');
    const title = isCompany ? '' : (localizedTitle || '');
    const note = isCompany ? (localizedTitle || '') : '';
    const companyField = isCompany ? 'X-ABShowAs:COMPANY\n' : '';
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN;CHARSET=UTF-8:${localizedName};;;;\nFN;CHARSET=UTF-8:${localizedName}\n${companyField}TEL;TYPE=CELL:${data.phone}\n${data.email ? `EMAIL:${data.email}\n` : ''}${title ? `TITLE;CHARSET=UTF-8:${title}\n` : ''}${org ? `ORG;CHARSET=UTF-8:${org}\n` : ''}${note ? `NOTE;CHARSET=UTF-8:${note}\n` : ''}${data.website ? `URL:${data.website}\n` : ''}END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${localizedName}.vcf`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-4 text-red-500">{error}</div>;

  const themeColor = data.themeColor || '#2563eb';
  const displayName = getLocalized(data.name, lang);
  const displayJob = getLocalized(data.jobTitle, lang);
  const displayCompany = getLocalized(data.company, lang);

  const renderInfoTab = () => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mt-16 text-center mb-8">
            <h1 className={`text-2xl font-bold ${themeStyles.textClass}`}>{displayName}</h1>
            <p className="font-medium" style={{ color: data.template === 'neon' ? '#00ff00' : data.template === 'cyberpunk' ? '#00ffff' : data.template === 'luxury' ? '#fbbf24' : themeColor }}>{displayJob} {displayCompany && `| ${displayCompany}`}</p>
            {/* Socials */}
            <div className="flex justify-center gap-3 mt-4 mb-4 flex-wrap">
                {data.facebook && <a href={data.facebook} target="_blank" onClick={() => trackClick('facebook')} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><Facebook size={20} /></a>}
                {data.twitter && <a href={data.twitter} target="_blank" onClick={() => trackClick('twitter')} className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><Twitter size={20} /></a>}
                {data.instagram && <a href={data.instagram} target="_blank" onClick={() => trackClick('instagram')} className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"><Instagram size={20} /></a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" onClick={() => trackClick('linkedin')} className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"><Linkedin size={20} /></a>}
                {data.youtube && <a href={data.youtube} target="_blank" onClick={() => trackClick('youtube')} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"><Youtube size={20} /></a>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><Phone size={20} style={{ color: themeColor }} /> <span className="font-bold">{t.call}</span></a>
            <a href={`https://wa.me/${data.whatsapp}`} target="_blank" onClick={() => trackClick('whatsapp')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><MessageCircle size={20} className="text-emerald-500" /> <span className="font-bold">{t.whatsapp}</span></a>
            {data.email && <a href={`mailto:${data.email}`} onClick={() => trackClick('email')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><Mail size={20} style={{ color: themeColor }} /> <span className="font-bold">{t.emailAction}</span></a>}
            {data.website && <a href={data.website} target="_blank" onClick={() => trackClick('website')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><Globe size={20} style={{ color: themeColor }} /> <span className="font-bold">{t.websiteAction}</span></a>}
            <button onClick={() => { setLeadInterest(''); setIsLeadFormOpen(true); }} className="col-span-2 flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"><UserPlus size={20} /> <span className="font-bold">{t.exchangeContact}</span></button>
            <button onClick={() => setShowWalletModal('apple')} className="col-span-1 flex items-center justify-center gap-2 bg-black text-white p-3 rounded-xl hover:bg-gray-800"><Wallet size={20} /><span className="font-bold text-xs">Apple</span></button>
            <button onClick={() => setShowWalletModal('google')} className="col-span-1 flex items-center justify-center gap-2 bg-white text-black border border-slate-200 p-3 rounded-xl hover:bg-slate-50"><CreditCard size={20} className="text-blue-500" /><span className="font-bold text-xs">Google</span></button>
            {data.cvUrl && <a href={data.cvUrl} target="_blank" onClick={() => trackClick('download_cv')} className="col-span-2 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><FileText size={20} className="text-orange-500" /> <span className="font-bold">{t.downloadCv}</span></a>}
          </div>

          <button onClick={downloadVCard} className="w-full text-white p-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-8 transform active:scale-95" style={{ backgroundColor: themeColor }}><UserPlus size={20} /> {t.saveContact}</button>
      </div>
  );

  const getProductCardClass = () => {
    switch(data.template) {
      case 'glassmorphism':
        return 'bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg';
      case 'luxury':
        return 'bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-600/30 shadow-lg';
      case 'neon':
        return 'bg-gray-800 border border-green-500/50 shadow-lg shadow-green-500/20';
      case 'cyberpunk':
        return 'bg-gray-900 border border-cyan-500/50 shadow-lg shadow-cyan-500/20';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200 shadow-md';
      default:
        return 'bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100';
    }
  };

  const renderProductsTab = () => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 pb-8">
          {products.length === 0 ? (
              <div className={`text-center py-10 ${themeStyles.accentClass}`}>
                  <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                  <p>{t.noProducts}</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {products.map(prod => (
                      <div key={prod.id} className={`rounded-xl overflow-hidden flex flex-col ${getProductCardClass()}`}>
                          <div className="h-40 w-full bg-slate-100 relative">
                              {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={32}/></div>}
                              {prod.price && <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm ${data.template === 'luxury' ? 'bg-amber-900/80 text-amber-100' : data.template === 'neon' ? 'bg-green-900/80 text-green-300' : data.template === 'cyberpunk' ? 'bg-cyan-900/80 text-cyan-300' : 'bg-black/70 text-white'}`}>{prod.price} {t.currency}</div>}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                              <h3 className={`font-bold text-lg mb-1 ${themeStyles.textClass}`}>{prod.name}</h3>
                              <p className={`text-sm line-clamp-2 mb-4 flex-1 ${themeStyles.accentClass}`}>{prod.description}</p>
                              <button
                                onClick={() => handleBuyProduct(prod)}
                                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${data.template === 'neon' ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/50' : data.template === 'cyberpunk' ? 'bg-cyan-600 text-black hover:bg-cyan-500 shadow-lg shadow-cyan-500/50' : data.template === 'luxury' ? 'bg-amber-700 text-yellow-50 hover:bg-amber-600' : data.template === 'glassmorphism' ? 'bg-blue-500/80 text-white hover:bg-blue-600 backdrop-blur' : 'text-white hover:opacity-90'}`}
                                style={!['neon', 'cyberpunk', 'luxury', 'glassmorphism'].includes(data.template) ? { backgroundColor: themeColor } : {}}
                              >
                                {prod.link ? <ExternalLink size={16}/> : <ShoppingCart size={16}/>}
                                {t.buy}
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const getThemeStyles = () => {
    const template = data.template || 'classic';
    const baseTheme = {
      headerBg: `linear-gradient(to right, ${themeColor}, #1e293b)`,
      headerClass: '',
      containerClass: 'bg-white',
      textClass: 'text-slate-800',
      accentClass: 'text-slate-500'
    };

    switch(template) {
      case 'gradient':
        return {
          ...baseTheme,
          headerBg: `linear-gradient(135deg, ${themeColor}, #9333ea, #ec4899)`,
          containerClass: 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'
        };
      case 'neon':
        return {
          ...baseTheme,
          headerBg: `linear-gradient(to right, #00ff00, #ff00ff, #00ffff)`,
          containerClass: 'bg-gray-900',
          textClass: 'text-white',
          accentClass: 'text-green-400'
        };
      case 'luxury':
        return {
          ...baseTheme,
          headerBg: `linear-gradient(to right, #1a1a2e, #16213e, #0f3460)`,
          containerClass: 'bg-gradient-to-b from-zinc-900 via-slate-800 to-zinc-900',
          textClass: 'text-yellow-50',
          accentClass: 'text-amber-300'
        };
      case 'glassmorphism':
        return {
          ...baseTheme,
          headerBg: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))`,
          containerClass: 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100',
          headerClass: 'backdrop-blur-md border-b border-white/20'
        };
      case 'cyberpunk':
        return {
          ...baseTheme,
          headerBg: `linear-gradient(to right, #ff006e, #00f5ff)`,
          containerClass: 'bg-gray-950',
          textClass: 'text-white',
          accentClass: 'text-cyan-400'
        };
      default:
        return baseTheme;
    }
  };

  const themeStyles = getThemeStyles();

  const renderHeader = () => (
    <div className={`h-32 relative ${themeStyles.headerClass}`} style={{ background: themeStyles.headerBg }}>
       <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
       {data.bgVideoUrl && <video src={data.bgVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />}
    </div>
  );

  const renderAvatar = () => {
    const hasStories = stories.length > 0;
    const ringClass = hasStories ? "p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : "border-4 border-white";
    
    return (
        <div 
            className={`top-[10px] absolute right-1/2 translate-x-1/2 -bottom-12 w-24 h-24 rounded-full shadow-md bg-white flex items-center justify-center text-3xl font-bold text-slate-500 cursor-pointer ${ringClass}`}
            onClick={() => { if(hasStories) setIsStoryOpen(true); }}
        >
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                {data.profileVideoUrl ? 
                    <video src={data.profileVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" /> : 
                    (data.photoUrl ? <img src={data.photoUrl} className="w-full h-full object-cover"/> : (displayName ? displayName.charAt(0) : '?'))
                }
            </div>
        </div>
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${themeStyles.containerClass}`} style={data.template === 'glassmorphism' || data.template === 'neon' || data.template === 'cyberpunk' || data.template === 'luxury' ? {} : { backgroundColor: '#f1f5f9' }}>
       <button onClick={toggleLang} className={`absolute top-4 right-4 z-50 px-3 py-2 rounded-full shadow-md font-bold text-xs transition-colors ${data.template === 'luxury' || data.template === 'cyberpunk' || data.template === 'neon' ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:text-blue-600'}`}><Globe size={16} /> {lang === 'ar' ? 'English' : 'عربي'}</button>

       <div className={`${themeStyles.containerClass} w-full max-w-md rounded-3xl overflow-hidden relative min-h-[80vh] flex flex-col ${data.template === 'glassmorphism' ? 'backdrop-blur-xl border border-white/30 shadow-2xl' : data.template === 'luxury' ? 'shadow-2xl border border-amber-600/20' : data.template === 'neon' ? 'border-2 border-green-500 shadow-neon' : 'shadow-xl'}`}>
          {renderHeader()}
          
          {products.length > 0 && (
              <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                  <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{t.tabInfo}</button>
                  <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{t.tabProducts}</button>
              </div>
          )}

          <div className="px-6 pt-[45px] relative flex-1">
             {activeTab === 'info' && renderAvatar()}
             {activeTab === 'info' ? renderInfoTab() : renderProductsTab()}
          </div>
          
          <div className="bg-slate-50 py-4 text-center text-slate-400 text-xs mt-auto">Digital Card System © 2024</div>
       </div>

      {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={themeColor} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} t={t} initialInterest={leadInterest} />}
      {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} t={t} />}
      {isStoryOpen && stories.length > 0 && <StoryViewer stories={stories} adminId={profileData.adminId} employeeId={profileData.id} onClose={() => setIsStoryOpen(false)} products={products} trackLead={handleStoryAction} t={t} />}
    </div>
  );
}

// --- مكون إدخال متعدد اللغات ---
function LanguageInput({ label, value, onChange, placeholder, t }) {
  const [currentLang, setCurrentLang] = useState('ar');

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    const oldObj = typeof value === 'object' ? value : { ar: value || '', en: '' }; // إذا كان نص عادي حوله لكائن
    onChange({ ...oldObj, [currentLang]: newValue });
  };

  const displayValue = () => {
    if (typeof value === 'object') {
      return value[currentLang] || '';
    }
    // Backward compatibility for string data: Assume it's Arabic if lang is ar, else empty or show it
    return value || '';
  };

  return (
    <div className="mb-0">
      <div className="flex justify-between items-end mb-1">
         <label className="block text-sm font-medium text-slate-700">{label}</label>
      </div>
      <div className="flex " dir="ltr">
        <input 
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg border border-r-0 border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
          value={displayValue()}
          onChange={handleValueChange}
          placeholder={placeholder}
          dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        />
        <select 
          value={currentLang} 
          onChange={e => setCurrentLang(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-r-lg px-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
          dir="ltr"
        >
          <option value="ar">AR</option>
          <option value="en">EN</option>
        </select>
      </div>
    </div>
  );
}

// --- نموذج إضافة/تعديل موظف ---
function EmployeeForm({ onClose, initialData, userId, t }) {
  const [formData, setFormData] = useState({
    profileType: 'employee',
    name: { ar: '', en: '' }, // Initialize as object
    phone: '', email: '', 
    jobTitle: { ar: '', en: '' }, 
    company: { ar: '', en: '' },
    website: '', whatsapp: '',
    photoUrl: '', cvUrl: '', slug: '', 
    themeColor: '#2563eb', qrColor: '#000000', qrBgColor: '#ffffff',
    template: 'classic', 
    bgVideoUrl: '', 
    profileVideoUrl: '', 
    facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '',
    stats: { views: 0, clicks: {}, countries: {}, heatmap: {} }
  });
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Normalize legacy string data to objects
      const normalize = (val) => typeof val === 'string' ? { ar: val, en: '' } : (val || { ar: '', en: '' });
      
      setFormData(prev => ({ 
        ...prev, 
        ...initialData,
        name: normalize(initialData.name),
        jobTitle: normalize(initialData.jobTitle),
        company: normalize(initialData.company)
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSlugError('');
    
    try {
      const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'employees');
      let empId = initialData?.id;
      let oldSlug = initialData?.slug;
      
      if (formData.slug) {
         const cleanSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
         if (cleanSlug !== formData.slug) {
            setSlugError('يجب أن يحتوي الاسم المميز على أحرف إنجليزية وأرقام وشرطة فقط.');
            setLoading(false); return;
         }
         if (cleanSlug !== oldSlug) {
             const slugDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'slugs', cleanSlug);
             const slugDocSnap = await getDoc(slugDocRef);
             if (slugDocSnap.exists()) {
                 setSlugError('هذا الاسم المميز مستخدم بالفعل.');
                 setLoading(false); return;
             }
         }
      }

      if (empId) {
        await updateDoc(doc(collectionRef, empId), { ...formData, slug: formData.slug || '', updatedAt: serverTimestamp() });
      } else {
        const docRef = await addDoc(collectionRef, { ...formData, createdAt: serverTimestamp() });
        empId = docRef.id;
      }

      if (formData.slug && formData.slug !== oldSlug) {
          if (oldSlug) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'slugs', oldSlug));
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'slugs', formData.slug), { targetUid: userId, targetEmpId: empId });
      } else if (!formData.slug && oldSlug) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'slugs', oldSlug));
      }

      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      if (error.code === 'permission-denied') {
          window.alert(t.permissionError);
      } else {
          window.alert(t.saveError);
      }
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { id: 'classic', name: t.classic },
    { id: 'modern', name: t.modern },
    { id: 'creative', name: t.creative },
    { id: 'elegant', name: t.elegant },
    { id: 'professional', name: t.professional },
    { id: 'minimal', name: t.minimal },
    { id: 'gradient', name: t.gradient, premium: true },
    { id: 'neon', name: t.neon, premium: true },
    { id: 'luxury', name: t.luxury, premium: true },
    { id: 'glassmorphism', name: t.glassmorphism, premium: true },
    { id: 'cyberpunk', name: t.cyberpunk, premium: true },
  ];

  const isCompany = formData.profileType === 'company';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{initialData ? t.editData : t.createCard}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button type="button" onClick={() => setFormData({...formData, profileType: 'employee'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><User size={16} /> {t.profileTypeEmp}</button>
            <button type="button" onClick={() => setFormData({...formData, profileType: 'company'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'company' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Building2 size={16} /> {t.profileTypeComp}</button>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2"><LinkIcon size={16} /> {t.slugLabel}</label>
             <p className="text-xs text-indigo-600 mb-2">{t.slugHint}</p>
             <div className="flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden"><span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-3 font-mono border-l border-indigo-200">/ #</span><input type="text" dir="ltr" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-3 py-2 text-sm outline-none font-mono" placeholder="your-name" /></div>
             {slugError && <p className="text-xs text-red-500 mt-1 font-bold">{slugError}</p>}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-200 pb-2 mb-2"><LayoutTemplate size={18} className="text-indigo-600" /><h3 className="text-sm font-bold text-indigo-800">{t.design}</h3></div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.template}</label>
                <div className="grid grid-cols-3 gap-2">
                    {templates.map(tmp => (
                        <button key={tmp.id} type="button" onClick={() => setFormData({...formData, template: tmp.id})} className={`py-3 px-2 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative ${formData.template === tmp.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200'}`}>
                            {tmp.id !== 'classic' && <Crown size={10} className="absolute top-1 right-1 text-amber-500" />}{tmp.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.bgVideo}</label><input type="url" dir="ltr" value={formData.bgVideoUrl} onChange={e => setFormData({...formData, bgVideoUrl: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-sm outline-none" placeholder="MP4 URL" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.profileVideo}</label><input type="url" dir="ltr" value={formData.profileVideoUrl} onChange={e => setFormData({...formData, profileVideoUrl: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-sm outline-none" placeholder="MP4 URL" /></div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="p-2 bg-white rounded-lg shadow-sm text-slate-600"><Palette size={20} /></div><div><label className="block text-sm font-bold text-slate-700">{t.cardColor}</label><p className="text-xs text-slate-400">{t.generalDesign}</p></div></div>
            <div className="flex items-center gap-2"><input type="color" value={formData.themeColor} onChange={e => setFormData({...formData, themeColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md" /></div>
          </div>

          {/* Multilingual Name Field */}
          <LanguageInput 
            label={isCompany ? t.compName : t.fullName}
            value={formData.name}
            onChange={val => setFormData({...formData, name: val})}
            placeholder={isCompany ? t.compName : t.fullName}
            t={t}
          />

          <div className="grid grid-cols-2 gap-4">
            <input required type="tel" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder={t.mobile} />
            <input type="tel" dir="ltr" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder={t.whatsapp} />
          </div>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.email} />
          
          <div className="flex flex-col grid-cols-1 md:grid-cols-2 gap-4">
             {/* Multilingual Job Title / Slogan */}
             <div className="col-span-1">
               <LanguageInput 
                  label={isCompany ? t.slogan : t.jobTitle}
                  value={formData.jobTitle}
                  onChange={val => setFormData({...formData, jobTitle: val})}
                  placeholder={isCompany ? t.slogan : t.jobTitle}
                  t={t}
                />
             </div>
             {/* Multilingual Company Field (only for employees) */}
             {!isCompany && (
               <div className="col-span-1">
                 <LanguageInput 
                    label={t.company}
                    value={formData.company}
                    onChange={val => setFormData({...formData, company: val})}
                    placeholder={t.company}
                    t={t}
                  />
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <input type="url" dir="ltr" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.logoUrl : t.photoUrl} />
             <input type="url" dir="ltr" value={formData.cvUrl} onChange={e => setFormData({...formData, cvUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.profilePdf : t.cvPdf} />
          </div>
          <input type="url" dir="ltr" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.website} />
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t.socials}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="url" dir="ltr" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Facebook URL" />
              <input type="url" dir="ltr" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Twitter / X URL" />
              <input type="url" dir="ltr" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Instagram URL" />
              <input type="url" dir="ltr" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="LinkedIn URL" />
              <input type="url" dir="ltr" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="YouTube URL" />
            </div>
          </div>
          
          <div className="pt-4"><button type="submit" disabled={loading} className="w-full text-white font-bold py-3 rounded-xl" style={{ backgroundColor: formData.themeColor }}>{loading ? t.saving : t.save}</button></div>
        </form>
      </div>
    </div>
  );
}

// --- المكونات المساعدة ---
function LeadCaptureModal({ adminId, employeeId, themeColor, onClose, onSuccess, t }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', adminId, 'employees', employeeId, 'leads'), {
        name,
        phone,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(onClose, 2000);
    } catch (error) {
      window.alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><UserPlus size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.sentSuccess}</h3>
            <p className="text-slate-500">{t.sentMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6"><h3 className="text-xl font-bold text-slate-800">{t.exchangeContact}</h3><p className="text-sm text-slate-500 mt-1">{t.shareData}</p></div>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.leadName} />
            <input type="tel" required dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder={t.leadPhone} />
            <button type="submit" disabled={loading} className="w-full text-white font-bold py-3 rounded-xl" style={{ backgroundColor: themeColor }}>{loading ? '...' : t.send}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function WalletPreviewModal({ type, data, onClose, t }) {
  const isApple = type === 'apple';
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: isApple ? 'black' : 'white', border: isApple ? 'none' : '1px solid #eee' }}>
            {isApple ? <Wallet size={32} className="text-white" /> : <CreditCard size={32} className="text-blue-500" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{isApple ? t.addToApple : t.addToGoogle}</h3>
          <p className="text-sm text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg">{t.walletNote}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">{t.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsListModal({ userId, employee, onClose, t }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'leads');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setLeads(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId, employee.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">{t.leadsTitle}: {employee.name}</h2><button onClick={onClose}><X size={20} /></button></div>
        {loading ? <div className="text-center py-4">{t.loading}</div> : leads.length === 0 ? <p className="text-center text-slate-500 py-4">{t.noLeads}</p> : 
        <div className="space-y-3">
            {leads.map(l => (
                <div key={l.id} className="bg-slate-50 p-3 rounded flex justify-between items-start">
                    <div>
                        <div className="font-bold">{l.name}</div>
                        <div className="text-sm text-slate-500" dir="ltr">{l.phone}</div>
                        {l.interest && <div className="text-xs text-indigo-600 mt-1 font-bold bg-indigo-50 inline-block px-1 rounded">{l.interest}</div>}
                    </div>
                    <a href={`tel:${l.phone}`} className="p-2 bg-white rounded-full text-green-600 shadow-sm"><Phone size={18} /></a>
                </div>
            ))}
        </div>}
      </div>
    </div>
  );
}

function AnalyticsModal({ employee, onClose, t }) {
    const [activeTab, setActiveTab] = useState('overview');
    const stats = employee.stats || { views: 0, clicks: {}, countries: {}, heatmap: {} };
    const clicks = stats.clicks || {};
    const countries = stats.countries || {};
    const heatmap = stats.heatmap || {};
    const getFlag = (code) => { if(!code || code==='Unknown') return '🌍'; return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt())); };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-5 border-b border-slate-100 flex justify-between"><h2 className="text-lg font-bold">{t.stats}: {employee.name}</h2><button onClick={onClose}><X size={20} /></button></div>
                <div className="flex border-b border-slate-100"><button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.overview}</button><button onClick={() => setActiveTab('map')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.heatmap}</button></div>
                <div className="p-6">
                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4"><div className="bg-blue-50 p-4 rounded text-center"><div className="text-2xl font-bold">{stats.views}</div><div className="text-xs">{t.totalViews}</div></div><div className="bg-orange-50 p-4 rounded text-center"><div className="text-2xl font-bold">{Object.values(clicks).reduce((a,b)=>a+b,0)}</div><div className="text-xs">{t.totalClicks}</div></div></div>
                            <div><h3 className="text-sm font-bold mb-2">{t.interactions}</h3>{Object.entries(clicks).sort(([,a],[,b])=>b-a).map(([k,v])=><div key={k} className="flex justify-between text-sm py-1 border-b border-slate-50"><span>{k}</span><span className="font-bold">{v}</span></div>)}</div>
                            <div><h3 className="text-sm font-bold mb-2">{t.topCountries}</h3>{Object.entries(countries).sort(([,a],[,b])=>b-a).map(([code, count]) => <div key={code} className="flex justify-between text-sm py-1"><span>{getFlag(code)} {code}</span><span>{count}</span></div>)}</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><MapIcon size={16} /> {t.scanLocations}</h3>
                            <div className="relative w-full aspect-[2/1] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                 <img src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Map" />
                                 {Object.entries(heatmap).map(([key, count]) => {
                                     const [lat, lng] = key.split('_').map(Number);
                                     const x = (lng + 180) * (100 / 360); const y = (90 - lat) * (100 / 180);
                                     return <div key={key} className="absolute rounded-full bg-red-500/60" style={{ left: `${x}%`, top: `${y}%`, width: `${Math.min(20, 6+(count*2))}px`, height: `${Math.min(20, 6+(count*2))}px`, transform: 'translate(-50%, -50%)' }} title={`${count} ${t.views}`}></div>;
                                 })}
                            </div>
                            <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">{t.mapNote}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function QRModal({ employee, userId, onClose, t }) {
  const getProfileUrl = () => {
    if (employee.slug) return `${window.location.href.split('#')[0]}#${employee.slug}`;
    return `${window.location.href.split('#')[0]}#uid=${userId}&pid=${employee.id}`;
  };

  const qrColor = employee.qrColor?.replace('#', '') || '000000';
  const qrBgColor = employee.qrBgColor?.replace('#', '') || 'ffffff';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getProfileUrl())}&color=${qrColor}&bgcolor=${qrBgColor}`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${employee.name}-qr.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error) { window.alert('Error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 flex flex-col items-center relative">
        <button onClick={onClose} className="absolute top-4 right-4"><X size={24} /></button>
        <img src={qrImageUrl} alt="QR" className="w-48 h-48 mb-4 border p-2 rounded" />
        <h3 className="font-bold mb-2">{employee.name}</h3>
        <button onClick={downloadQR} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Download</button>
      </div>
    </div>
  );
}

function PreviewModal({ employee, userId, onClose, t }) {
    const getProfileUrl = () => {
      if (employee.slug) return `${window.location.href.split('#')[0]}#${employee.slug}`;
      return `${window.location.href.split('#')[0]}#uid=${userId}&pid=${employee.id}`;
    };
   
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-[380px] h-[750px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
          <div className="h-8 bg-black w-full z-10 flex justify-between items-center px-6 pt-1"><span className="text-white text-[10px]">9:41</span><div className="flex gap-1"><span className="block w-3 h-3 bg-white/20 rounded-full"></span><span className="block w-3 h-3 bg-white/20 rounded-full"></span></div></div>
          <iframe src={getProfileUrl()} className="w-full h-full bg-white border-0" title="Card Preview" />
          <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm"><X size={20} /></button>
          <div className="h-6 bg-black w-full z-10 flex justify-center items-end pb-1"><div className="w-32 h-1 bg-white/30 rounded-full"></div></div>
        </div>
      </div>
    );
  }

function ProductsManagerModal({ userId, employee, onClose, t }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = [];
      snapshot.forEach(doc => productsList.push({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const productRef = doc(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products', editingProduct.id);
        await updateDoc(productRef, productData);
      } else {
        const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products');
        await addDoc(productsRef, { ...productData, createdAt: serverTimestamp() });
      }
      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t.confirmDelete || 'Are you sure?')) return;
    try {
      const productRef = doc(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products', productId);
      await deleteDoc(productRef);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.manageProducts || 'Manage Products'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">{t.loading}</div>
          ) : showForm ? (
            <ProductForm
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              t={t}
            />
          ) : (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> {t.addProduct || 'Add Product'}
              </button>

              {products.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-20" />
                  <p>{t.noProducts || 'No products yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-slate-50 rounded-xl p-4 flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                        {product.price && (
                          <p className="text-sm font-bold text-blue-600 mt-1">{product.price}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel, t }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    imageUrl: product?.imageUrl || '',
    link: product?.link || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.productName || 'Product Name'}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.productDescription || 'Description'}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.productPrice || 'Price'}</label>
        <input
          type="text"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="100 SAR"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.productImage || 'Image URL'}</label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.productLink || 'Purchase Link'}</label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {t.save || 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
        >
          {t.cancel || 'Cancel'}
        </button>
      </div>
    </form>
  );
}

function StoriesManagerModal({ userId, employee, onClose, t }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const storiesRef = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories');
      const snapshot = await getDocs(storiesRef);
      const storiesList = [];
      snapshot.forEach(doc => storiesList.push({ id: doc.id, ...doc.data() }));
      storiesList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setStories(storiesList);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = async (storyData) => {
    try {
      const storiesRef = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories');
      await addDoc(storiesRef, { ...storyData, createdAt: serverTimestamp() });
      await loadStories();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm(t.confirmDelete || 'Are you sure?')) return;
    try {
      const storyRef = doc(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories', storyId);
      await deleteDoc(storyRef);
      await loadStories();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CircleDashed size={24} className="text-pink-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.manageStories || 'Manage Stories'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">{t.loading}</div>
          ) : showForm ? (
            <StoryForm
              onSave={handleSaveStory}
              onCancel={() => setShowForm(false)}
              t={t}
            />
          ) : (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-4 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> {t.addStory || 'Add Story'}
              </button>

              {stories.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CircleDashed size={48} className="mx-auto mb-3 opacity-20" />
                  <p>{t.noStories || 'No stories yet'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {stories.map(story => (
                    <div key={story.id} className="relative aspect-[9/16] rounded-xl overflow-hidden group">
                      {story.type === 'video' ? (
                        <video src={story.mediaUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {story.type === 'video' && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full">
                          <PlayCircle size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryForm({ onSave, onCancel, t }) {
  const [formData, setFormData] = useState({
    type: 'image',
    mediaUrl: '',
    productId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{t.storyType || 'Story Type'}</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="image">{t.image || 'Image'}</option>
          <option value="video">{t.video || 'Video'}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {formData.type === 'video' ? (t.videoUrl || 'Video URL') : (t.imageUrl || 'Image URL')}
        </label>
        <input
          type="url"
          value={formData.mediaUrl}
          onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="https://..."
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors"
        >
          {t.save || 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
        >
          {t.cancel || 'Cancel'}
        </button>
      </div>
    </form>
  );
}

function StoryViewer({ stories, adminId, employeeId, onClose, products, trackLead, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const duration = currentStory?.type === 'video' ? 15000 : 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleProductClick = (productId) => {
    if (trackLead) {
      trackLead('product_interest', productId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-md relative">
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-full h-full" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 2) handlePrev();
          else handleNext();
        }}>
          {currentStory?.type === 'video' ? (
            <video
              key={currentStory.id}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              key={currentStory.id}
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {currentStory?.productId && products && (
          <div className="absolute bottom-20 left-4 right-4">
            {products
              .filter(p => p.id === currentStory.productId)
              .map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-4 flex gap-3 cursor-pointer hover:bg-white transition-colors"
                >
                  {product.imageUrl && (
                    <img src={product.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{product.name}</h3>
                    {product.price && (
                      <p className="text-sm font-bold text-blue-600">{product.price}</p>
                    )}
                  </div>
                  <ArrowRight className="text-slate-400" size={20} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
