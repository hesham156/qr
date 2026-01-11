import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, onSnapshot, deleteDoc, updateDoc, serverTimestamp, increment, setDoc, getDocs } from 'firebase/firestore';
import { Phone, Mail, Globe, MapPin, UserPlus, Trash2, Edit2, Share2, Plus, X, ExternalLink, QrCode, MessageCircle, ArrowRight, AlertCircle, LogOut, Lock, FileText, Image as ImageIcon, Palette, Grid, BarChart3, Activity, MousePointerClick, Users, Send, Map as MapIcon, Wallet, CreditCard, LayoutTemplate, Video, PlayCircle, Crown, Facebook, Twitter, Instagram, Linkedin, Youtube, Building2, User, Eye, Smartphone, Link as LinkIcon, Languages, Download, ShoppingBag, Package, ShoppingCart, CircleDashed, Clock, Eye as EyeIcon, ArrowLeft, Settings, LayoutDashboard, Monitor, PieChart } from 'lucide-react';

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
    editData: 'الإعدادات',
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
    manageCard: 'إدارة',
    back: 'عودة',
    storyStats: 'إحصائيات القصة',
    ctr: 'نسبة النقر (CTR)',
    devices: 'الأجهزة',
    mobileDevice: 'جوال',
    desktop: 'كمبيوتر',
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
    editData: 'Settings',
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
    alertTitle: 'Security Alert',
    alertMsg: 'Please check Firestore Rules permissions.',
    installApp: 'Install App',
    productsTitle: 'Products & Services',
    manageProducts: 'Products',
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
    manageStories: 'Stories',
    addStory: 'Add Story',
    storyUrl: 'Image/Video URL',
    storyType: 'Type',
    typeImage: 'Image',
    typeVideo: 'Video',
    noStories: 'No stories',
    linkProduct: 'Link Product (Optional)',
    selectProduct: 'Select a product...',
    viewProduct: 'View Product',
    manageCard: 'Manage',
    back: 'Back',
    storyStats: 'Story Stats',
    ctr: 'Click Rate (CTR)',
    devices: 'Devices',
    mobileDevice: 'Mobile',
    desktop: 'Desktop',
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
  const [managingEmployee, setManagingEmployee] = useState(null); // The employee currently being managed
  const [isFormOpen, setIsFormOpen] = useState(false); // Only for creating new
  const [previewEmployee, setPreviewEmployee] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'employees');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setEmployees(docs);
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

  // If we are managing an employee, show the Manager View
  if (managingEmployee) {
    return (
        <EmployeeManager 
            userId={user.uid} 
            employee={managingEmployee} 
            onBack={() => setManagingEmployee(null)} 
            t={t}
            lang={lang}
        />
    );
  }

  return (
    <div className="pb-20">
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
              onClick={() => setIsFormOpen(true)}
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
        {employees.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t.noCards}</h3>
            <p className="text-slate-500 mb-6">{t.noCardsSub}</p>
            <button onClick={() => setIsFormOpen(true)} className="text-blue-600 font-bold hover:underline">
              {t.addFirst}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                t={t}
                onDelete={() => handleDelete(emp)}
                onManage={() => setManagingEmployee(emp)}
                onPreview={() => setPreviewEmployee(emp)}
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <EmployeeForm 
          onClose={() => setIsFormOpen(false)} 
          initialData={null} 
          userId={user.uid} 
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
    </div>
  );
}

// --- بطاقة الموظف في القائمة ---
function EmployeeCard({ employee, onDelete, onManage, onPreview, t }) {
  const themeColor = employee.themeColor || '#2563eb';
  const isCompany = employee.profileType === 'company';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {employee.photoUrl ? (
            <img 
              src={employee.photoUrl} 
              alt={employee.name} 
              className={`w-12 h-12 object-cover border border-slate-200 ${isCompany ? 'rounded-lg' : 'rounded-full'}`}
              style={{ borderColor: themeColor }}
            />
          ) : (
            <div 
              className={`w-12 h-12 flex items-center justify-center text-xl font-bold text-white ${isCompany ? 'rounded-lg' : 'rounded-full'}`}
              style={{ backgroundColor: themeColor }}
            >
              {isCompany ? <Building2 size={20} /> : employee.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 line-clamp-1">{employee.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {isCompany ? (employee.jobTitle || t.company) : (employee.jobTitle || t.employee)}
            </p>
          </div>
        </div>
        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
      </div>
      
      <div className="flex gap-2 mt-4">
          <button onClick={onManage} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800">{t.manageCard}</button>
          <button onClick={onPreview} className="px-3 border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50"><Eye size={18}/></button>
      </div>
    </div>
  );
}

// --- صفحة إدارة الموظف (Tabs System) ---
function EmployeeManager({ userId, employee, onBack, t, lang }) {
    const [activeTab, setActiveTab] = useState('stats');
    
    // Tabs configuration
    const tabs = [
        { id: 'stats', label: t.stats, icon: BarChart3 },
        { id: 'settings', label: t.editData, icon: Settings },
        { id: 'products', label: t.manageProducts, icon: ShoppingBag },
        { id: 'stories', label: t.manageStories, icon: CircleDashed },
        { id: 'leads', label: t.leads, icon: Users },
        { id: 'qr', label: t.code, icon: QrCode },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'stats': return <AnalyticsTab userId={userId} employee={employee} t={t} />;
            case 'settings': return <EmployeeForm onClose={() => {}} initialData={employee} userId={userId} t={t} isEmbedded={true} />;
            case 'products': return <ProductsTab userId={userId} employee={employee} t={t} />;
            case 'stories': return <StoriesTab userId={userId} employee={employee} t={t} />;
            case 'leads': return <LeadsTab userId={userId} employee={employee} t={t} />;
            case 'qr': return <QRTab userId={userId} employee={employee} t={t} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-40 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg">{employee.name}</h2>
                    <p className="text-xs text-slate-500">{employee.jobTitle}</p>
                </div>
            </div>

            {/* Tabs Navigation (Scrollable) */}
            <div className="bg-white border-b border-slate-200 overflow-x-auto no-scrollbar">
                <div className="flex px-4 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
                {renderContent()}
            </div>
        </div>
    );
}

// --- التبويبات (Tabs Components) ---

function AnalyticsTab({ userId, employee, t }) {
    // Reusing logic from AnalyticsModal but adapted for tab view
    const stats = employee.stats || { views: 0, clicks: {}, countries: {}, heatmap: {} };
    const clicks = stats.clicks || {};
    const countries = stats.countries || {};
    const getFlag = (code) => { if(!code || code==='Unknown') return '🌍'; return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt())); };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center">
                    <div className="text-blue-500 mb-1 flex justify-center"><Activity size={24} /></div>
                    <div className="text-2xl font-bold text-slate-800">{stats.views}</div>
                    <div className="text-xs text-slate-500">{t.totalViews}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm text-center">
                    <div className="text-orange-500 mb-1 flex justify-center"><MousePointerClick size={24} /></div>
                    <div className="text-2xl font-bold text-slate-800">{Object.values(clicks).reduce((a, b) => a + b, 0)}</div>
                    <div className="text-xs text-slate-500">{t.totalClicks}</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-3">{t.interactions}</h3>
                <div className="space-y-3">
                    {Object.entries(clicks).sort(([,a],[,b])=>b-a).map(([k,v])=>(
                        <div key={k} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                            <span>{k}</span><span className="font-bold bg-slate-100 px-2 rounded">{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-3">{t.topCountries}</h3>
                <div className="space-y-2">
                    {Object.entries(countries).sort(([,a],[,b])=>b-a).map(([code, count]) => (
                        <div key={code} className="flex justify-between text-sm py-1">
                            <span>{getFlag(code)} {code}</span>
                            <span className="font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LeadsTab({ userId, employee, t }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'leads');
    return onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });
  }, [userId, employee.id]);

  if(loading) return <div className="text-center py-8">{t.loading}</div>;
  if(leads.length === 0) return <div className="text-center py-10 text-slate-400"><Users size={48} className="mx-auto mb-2 opacity-20" /><p>{t.noLeads}</p></div>;

  return (
    <div className="space-y-3 animate-in fade-in">
        {leads.map(l => (
            <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                <div>
                    <div className="font-bold text-slate-800">{l.name}</div>
                    <div className="text-sm text-slate-500 font-mono" dir="ltr">{l.phone}</div>
                    {l.interest && <div className="text-xs text-indigo-600 mt-2 font-bold bg-indigo-50 inline-block px-2 py-1 rounded">{l.interest}</div>}
                    <div className="text-xs text-slate-300 mt-1">{l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toLocaleDateString() : ''}</div>
                </div>
                <a href={`tel:${l.phone}`} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"><Phone size={18} /></a>
            </div>
        ))}
    </div>
  );
}

function QRTab({ userId, employee, t }) {
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
        <div className="flex flex-col items-center justify-center py-8 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-6">
                <img src={qrImageUrl} alt="QR" className="w-64 h-64" />
            </div>
            <button onClick={downloadQR} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                <Download size={18} /> {t.code}
            </button>
            <p className="text-sm text-slate-400 mt-4 font-mono">{getProfileUrl()}</p>
        </div>
    );
}

function ProductsTab({ userId, employee, t }) {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', imageUrl: '', link: '' });
    const [isAdding, setIsAdding] = useState(false);
  
    useEffect(() => {
      const q = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products');
      return onSnapshot(q, (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=> (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      });
    }, [userId, employee.id]);
  
    const handleAddProduct = async (e) => {
      e.preventDefault(); setIsAdding(true);
      try {
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products'), { ...newProduct, createdAt: serverTimestamp() });
        setNewProduct({ name: '', price: '', description: '', imageUrl: '', link: '' });
      } catch (error) { console.error(error); } finally { setIsAdding(false); }
    };

    const handleDeleteProduct = async (prodId) => {
        if(window.confirm('Delete?')) await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products', prodId));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
           <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Plus size={16}/> {t.addProduct}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" placeholder={t.prodName} />
                 <input value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" placeholder={t.prodPrice} />
                 <input value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="px-3 py-2 border rounded-lg text-sm dir-ltr" placeholder={t.prodImg} dir="ltr" />
                 <input value={newProduct.link} onChange={e => setNewProduct({...newProduct, link: e.target.value})} className="px-3 py-2 border rounded-lg text-sm dir-ltr" placeholder={t.prodLink} dir="ltr" />
                 <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="col-span-1 md:col-span-2 px-3 py-2 border rounded-lg text-sm" placeholder={t.prodDesc} rows="2"></textarea>
              </div>
              <button type="submit" disabled={isAdding} className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">{isAdding ? t.saving : t.save}</button>
           </form>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(prod => (
                  <div key={prod.id} className="bg-white p-3 rounded-xl border border-slate-200 flex gap-3 relative group">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 truncate">{prod.name}</div>
                          <div className="text-indigo-600 text-sm font-bold">{prod.price} {t.currency}</div>
                          <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
              ))}
              {products.length === 0 && <div className="col-span-full text-center text-slate-400 py-4">{t.noProducts}</div>}
           </div>
        </div>
    );
}

function StoriesTab({ userId, employee, t }) {
    const [stories, setStories] = useState([]);
    const [products, setProducts] = useState([]);
    const [newStory, setNewStory] = useState({ url: '', type: 'image', productId: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [storyStatsModal, setStoryStatsModal] = useState(null); // قصة محددة لعرض إحصائياتها
  
    useEffect(() => {
      const qStories = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories');
      const unsubStories = onSnapshot(qStories, (snapshot) => {
        setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=> (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      });
      const qProducts = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'products');
      const unsubProducts = onSnapshot(qProducts, (snapshot) => {
         setProducts(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      });
      return () => { unsubStories(); unsubProducts(); };
    }, [userId, employee.id]);

    const handleAdd = async (e) => {
        e.preventDefault(); setIsAdding(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories'), { ...newStory, createdAt: serverTimestamp(), stats: { views: 0, clicks: 0, countries: {}, devices: {} } });
            setNewStory({ url: '', type: 'image', productId: '' });
        } catch(e) { console.error(e); } finally { setIsAdding(false); }
    };
    
    const handleDelete = async (id) => { if(window.confirm('Delete?')) await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'stories', id)); };

    return (
        <div className="space-y-6 animate-in fade-in">
           <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Plus size={16}/> {t.addStory}</h3>
              <div className="flex gap-2 mb-3">
                  <input required value={newStory.url} onChange={e => setNewStory({...newStory, url: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm dir-ltr" placeholder={t.storyUrl} dir="ltr" />
                  <select value={newStory.type} onChange={e => setNewStory({...newStory, type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="image">{t.typeImage}</option><option value="video">{t.typeVideo}</option></select>
              </div>
              <div className="mb-3">
                  <select value={newStory.productId} onChange={e => setNewStory({...newStory, productId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="">{t.linkProduct}</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
              <button type="submit" disabled={isAdding} className="w-full bg-pink-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-pink-700 disabled:opacity-50">{isAdding ? t.saving : t.save}</button>
           </form>

           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stories.map(story => (
                  <div key={story.id} className="relative aspect-[9/16] rounded-xl overflow-hidden group border border-slate-200 bg-black">
                      {story.type === 'video' ? <video src={story.url} className="w-full h-full object-cover" /> : <img src={story.url} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                          <div className="flex items-center gap-1 mb-1"><Eye size={14}/> <span>{story.stats?.views || 0}</span></div>
                          <div className="flex items-center gap-1"><MousePointerClick size={14}/> <span>{story.stats?.clicks || 0}</span></div>
                          {story.productId && <div className="mt-2 text-xs bg-indigo-600 px-2 py-0.5 rounded">Product</div>}
                          <button onClick={() => setStoryStatsModal(story)} className="mt-2 text-xs border border-white px-2 py-1 rounded hover:bg-white hover:text-black transition-colors">{t.stats}</button>
                      </div>
                      <button onClick={() => handleDelete(story.id)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={14} /></button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md backdrop-blur-sm">{story.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}</div>
                  </div>
              ))}
              {stories.length === 0 && <div className="col-span-full text-center text-slate-400 py-8">{t.noStories}</div>}
           </div>

           {storyStatsModal && <StoryAnalyticsModal story={storyStatsModal} onClose={() => setStoryStatsModal(null)} t={t} />}
        </div>
    );
}

// --- نافذة تحليل القصة (جديد) ---
function StoryAnalyticsModal({ story, onClose, t }) {
    const stats = story.stats || { views: 0, clicks: 0, countries: {}, devices: {} };
    const ctr = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : 0;
    const countries = stats.countries || {};
    const devices = stats.devices || {};
    const getFlag = (code) => { if(!code || code==='Unknown') return '🌍'; return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt())); };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl p-6">
                <div className="flex justify-between mb-6 border-b pb-4"><h3 className="font-bold text-lg">{t.storyStats}</h3><button onClick={onClose}><X size={20}/></button></div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl text-center"><div className="text-2xl font-bold text-blue-600">{stats.views}</div><div className="text-xs text-slate-500">{t.views}</div></div>
                    <div className="bg-green-50 p-3 rounded-xl text-center"><div className="text-2xl font-bold text-green-600">{stats.clicks}</div><div className="text-xs text-slate-500">{t.clicks}</div></div>
                    <div className="col-span-2 bg-purple-50 p-3 rounded-xl text-center"><div className="text-xl font-bold text-purple-600">{ctr}%</div><div className="text-xs text-slate-500">{t.ctr}</div></div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t.devices}</h4>
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm"><span><Smartphone size={14} className="inline mr-1"/> {t.mobileDevice}</span><span>{devices.mobile || 0}</span></div>
                             <div className="flex justify-between text-sm"><span><Monitor size={14} className="inline mr-1"/> {t.desktop}</span><span>{devices.desktop || 0}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t.topCountries}</h4>
                        <div className="space-y-1">
                            {Object.entries(countries).sort(([,a],[,b])=>b-a).map(([code, count]) => (
                                <div key={code} className="flex justify-between text-sm border-b border-slate-50 py-1 last:border-0"><span>{getFlag(code)} {code}</span><span className="font-bold">{count}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- نموذج الموظف (تم استعادته) ---
function EmployeeForm({ onClose, initialData, userId, t, isEmbedded = false }) {
  const [formData, setFormData] = useState({
    profileType: 'employee', name: '', phone: '', email: '', jobTitle: '', company: '', website: '', whatsapp: '',
    photoUrl: '', cvUrl: '', slug: '', 
    themeColor: '#2563eb', qrColor: '#000000', qrBgColor: '#ffffff',
    template: 'classic', bgVideoUrl: '', profileVideoUrl: '', 
    facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '',
    stats: { views: 0, clicks: {}, countries: {}, heatmap: {} }
  });
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
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
         if (cleanSlug !== formData.slug) { setSlugError('Invalid Slug'); setLoading(false); return; }
         if (cleanSlug !== oldSlug) {
             const slugDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'slugs', cleanSlug);
             const slugDocSnap = await getDoc(slugDocRef);
             if (slugDocSnap.exists()) { setSlugError('Slug Taken'); setLoading(false); return; }
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

      if(!isEmbedded) onClose();
      else window.alert('Saved!');
    } catch (error) {
      console.error(error);
      window.alert("Error Saving");
    } finally {
      setLoading(false);
    }
  };

  const templates = [{id:'classic',name:t.classic},{id:'modern',name:t.modern},{id:'creative',name:t.creative},{id:'elegant',name:t.elegant},{id:'professional',name:t.professional},{id:'minimal',name:t.minimal}];
  const isCompany = formData.profileType === 'company';

  const Wrapper = isEmbedded ? 'div' : 'div';
  const wrapperClass = isEmbedded ? '' : 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm';
  const contentClass = isEmbedded ? '' : 'bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl';

  return (
    <Wrapper className={wrapperClass}>
      <div className={contentClass}>
        {!isEmbedded && (
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold">{initialData ? t.editData : t.createCard}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
        )}
        
        <form onSubmit={handleSubmit} className={isEmbedded ? "space-y-4" : "p-6 space-y-4"}>
           <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button type="button" onClick={() => setFormData({...formData, profileType: 'employee'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><User size={16} /> {t.profileTypeEmp}</button>
            <button type="button" onClick={() => setFormData({...formData, profileType: 'company'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'company' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Building2 size={16} /> {t.profileTypeComp}</button>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2"><LinkIcon size={16} /> {t.slugLabel}</label>
             <div className="flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden"><span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-3 font-mono border-l border-indigo-200">/ #</span><input type="text" dir="ltr" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-3 py-2 text-sm outline-none font-mono" placeholder="your-name" /></div>
             {slugError && <p className="text-xs text-red-500 mt-1 font-bold">{slugError}</p>}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
             <div className="flex items-center gap-2 border-b border-indigo-200 pb-2 mb-2"><LayoutTemplate size={18} className="text-indigo-600" /><h3 className="text-sm font-bold text-indigo-800">{t.design}</h3></div>
             <div className="grid grid-cols-3 gap-2">{templates.map(tmp => <button key={tmp.id} type="button" onClick={() => setFormData({...formData, template: tmp.id})} className={`py-3 px-2 text-xs font-bold rounded-xl border-2 ${formData.template === tmp.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>{tmp.name}</button>)}</div>
             <div className="grid grid-cols-2 gap-3 mt-3">
                 <input type="url" dir="ltr" value={formData.bgVideoUrl} onChange={e => setFormData({...formData, bgVideoUrl: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border text-sm" placeholder={t.bgVideo} />
                 <input type="url" dir="ltr" value={formData.profileVideoUrl} onChange={e => setFormData({...formData, profileVideoUrl: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border text-sm" placeholder={t.profileVideo} />
             </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="p-2 bg-white rounded-lg shadow-sm text-slate-600"><Palette size={20} /></div><div><label className="block text-sm font-bold text-slate-700">{t.cardColor}</label><p className="text-xs text-slate-400">{t.generalDesign}</p></div></div>
            <div className="flex items-center gap-2"><input type="color" value={formData.themeColor} onChange={e => setFormData({...formData, themeColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md" /></div>
          </div>

          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.compName : t.fullName} />
           <div className="grid grid-cols-2 gap-4">
            <input required type="tel" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder={t.mobile} />
            <input type="tel" dir="ltr" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder={t.whatsapp} />
          </div>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.email} />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.slogan : t.jobTitle} />
            {!isCompany && <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.company} />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <input type="url" dir="ltr" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.logoUrl : t.photoUrl} />
             <input type="url" dir="ltr" value={formData.cvUrl} onChange={e => setFormData({...formData, cvUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={isCompany ? t.profilePdf : t.cvPdf} />
          </div>
          <input type="url" dir="ltr" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder={t.website} />
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t.socials}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="url" dir="ltr" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Facebook URL" />
              <input type="url" dir="ltr" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Twitter / X URL" />
              <input type="url" dir="ltr" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Instagram URL" />
              <input type="url" dir="ltr" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="LinkedIn URL" />
              <input type="url" dir="ltr" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="YouTube URL" />
            </div>
          </div>
          
          <div className="pt-4"><button type="submit" disabled={loading} className="w-full text-white font-bold py-3 rounded-xl" style={{ backgroundColor: formData.themeColor }}>{loading ? t.saving : t.save}</button></div>
        </form>
      </div>
    </Wrapper>
  );
}

// --- عارض القصص (StoryViewer) ---
function StoryViewer({ stories, adminId, employeeId, onClose, products, trackLead, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const STORY_DURATION = 5000;
  const viewLogged = useRef(new Set()); 

  const logStoryView = async (index) => {
    const story = stories[index];
    if (!story || viewLogged.current.has(story.id)) return;
    
    viewLogged.current.add(story.id);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    try {
        const storyRef = doc(db, 'artifacts', appId, 'users', adminId, 'employees', employeeId, 'stories', story.id);
        const res = await fetch('https://ipwho.is/');
        const geo = await res.json();
        const countryCode = geo.success ? geo.country_code : 'Unknown';

        await setDoc(storyRef, {
            stats: {
                views: increment(1),
                countries: { [countryCode]: increment(1) },
                devices: { [deviceType]: increment(1) }
            }
        }, { merge: true });
    } catch (e) { console.warn("Analytics error", e); }
  };

  useEffect(() => {
    logStoryView(currentIndex);
    const timer = setInterval(() => {
        setProgress(old => {
            if (old >= 100) {
                if (currentIndex < stories.length - 1) { setCurrentIndex(prev => prev + 1); return 0; } 
                else { clearInterval(timer); onClose(); return 100; }
            }
            return old + (100 / (STORY_DURATION / 100));
        });
    }, 100);
    return () => clearInterval(timer);
  }, [currentIndex, stories.length, onClose]);

  useEffect(() => { setProgress(0); }, [currentIndex]);

  const handleNext = () => { if (currentIndex < stories.length - 1) setCurrentIndex(prev => prev + 1); else onClose(); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

  const currentStory = stories[currentIndex];
  const linkedProduct = currentStory.productId ? products.find(p => p.id === currentStory.productId) : null;

  const handleProductClick = async () => {
      try {
        const storyRef = doc(db, 'artifacts', appId, 'users', adminId, 'employees', employee.id, 'stories', currentStory.id);
        await setDoc(storyRef, { stats: { clicks: increment(1) } }, { merge: true });
      } catch(e) {}

      if (linkedProduct) {
          if (linkedProduct.link) window.open(linkedProduct.link, '_blank');
          else trackLead(linkedProduct.name);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
       <div className="relative w-full max-w-md h-full sm:h-[90vh] bg-black sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-0 right-0 z-20 flex gap-1 px-2">
              {stories.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}></div>
                  </div>
              ))}
          </div>
          <button onClick={onClose} className="absolute top-8 right-4 z-20 text-white opacity-80 hover:opacity-100"><X size={24} /></button>
          <div className="absolute inset-0 z-10 flex"><div className="flex-1 h-full" onClick={handlePrev}></div><div className="flex-1 h-full" onClick={handleNext}></div></div>
          {linkedProduct && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full px-6 pointer-events-none">
                  <button onClick={(e) => { e.stopPropagation(); handleProductClick(); }} className="pointer-events-auto w-full bg-white/90 backdrop-blur text-black py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 animate-bounce-slow">
                      <ShoppingBag size={18} /> {t.viewProduct}: {linkedProduct.name}
                  </button>
              </div>
          )}
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              {currentStory.type === 'video' ? <video src={currentStory.url} autoPlay className="w-full h-full object-contain" /> : <img src={currentStory.url} className="w-full h-full object-contain" />}
          </div>
       </div>
    </div>
  );
}

// --- Preview Modal ---
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

// --- QR Modal ---
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
