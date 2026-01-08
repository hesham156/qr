import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, onSnapshot, deleteDoc, updateDoc, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { Phone, Mail, Globe, MapPin, UserPlus, Trash2, Edit2, Share2, Plus, X, ExternalLink, QrCode, MessageCircle, ArrowRight, AlertCircle, LogOut, Lock, FileText, Image as ImageIcon, Palette, Grid, BarChart3, Activity, MousePointerClick, Users, Send, Map as MapIcon, Wallet, CreditCard, LayoutTemplate, Video, PlayCircle, Crown, Facebook, Twitter, Instagram, Linkedin, Youtube, Building2, User, Eye, Smartphone } from 'lucide-react';

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

// --- المكون الرئيسي ---
export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('loading'); // loading, login, dashboard, profile
  const [profileData, setProfileData] = useState({ id: null, adminId: null });
  
  const checkRoute = (currentUser) => {
    const hashString = window.location.hash.substring(1); 
    const params = new URLSearchParams(hashString);
    const pid = params.get('pid');
    const uid = params.get('uid');
    
    if (pid && uid) {
      setProfileData({ id: pid, adminId: uid });
      setViewMode('profile');
      if (!currentUser) {
        signInAnonymously(auth).catch((err) => console.error("Anonymous Auth Error:", err));
      }
      return;
    }

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

    const handleHashChange = () => checkRoute(auth.currentUser);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('hashchange', handleHashChange);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {viewMode === 'profile' ? (
        <ProfileView data={profileData} user={user} />
      ) : viewMode === 'login' ? (
        <LoginView />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

// --- شاشة تسجيل الدخول ---
function LoginView() {
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
      setError('حدث خطأ في المصادقة: ' + err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegistering ? 'إنشاء حساب مدير' : 'تسجيل دخول المدير'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegistering ? 'أدخل بياناتك لإنشاء حساب جديد' : 'قم بتسجيل الدخول لإدارة الموظفين الخاصين بك'}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
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
              isRegistering ? 'إنشاء حساب' : 'دخول'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            {isRegistering 
              ? 'لديك حساب بالفعل؟ سجل دخول' 
              : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- لوحة التحكم ---
function Dashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [analyticsEmployee, setAnalyticsEmployee] = useState(null);
  const [leadsEmployee, setLeadsEmployee] = useState(null); 
  const [previewEmployee, setPreviewEmployee] = useState(null); // للمعاينة
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

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

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البروفايل؟')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', id));
      } catch (e) {
        console.error("Error deleting:", e);
        window.alert("حدث خطأ أثناء الحذف.");
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
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">إدارة البطاقات</h1>
            <h1 className="text-xl font-bold text-slate-800 sm:hidden">الإدارة</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">إضافة جديد</span>
            </button>
            <button 
              onClick={onLogout}
              className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg transition-colors border border-slate-200"
              title="تسجيل خروج"
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
              <h3 className="text-red-800 font-bold mb-1">تنبيه أمني</h3>
              <p className="text-red-600 text-sm">
                يرجى التأكد من صلاحيات Firestore Rules.
              </p>
            </div>
          </div>
        )}

        {employees.length === 0 && !permissionError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">لا يوجد بطاقات حالياً</h3>
            <p className="text-slate-500 mb-6">أضف بيانات الموظفين أو الشركات لإنشاء بطاقات رقمية لهم</p>
            <button onClick={handleAddNew} className="text-blue-600 font-bold hover:underline">
              + إضافة أول بطاقة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                userId={user.uid}
                onDelete={() => handleDelete(emp.id)}
                onEdit={() => handleEdit(emp)}
                onShowQR={() => setSelectedEmployee(emp)}
                onShowAnalytics={() => setAnalyticsEmployee(emp)}
                onShowLeads={() => setLeadsEmployee(emp)}
                onPreview={() => setPreviewEmployee(emp)} // تمرير وظيفة المعاينة
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isFormOpen && (
        <EmployeeForm 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingEmployee}
          userId={user.uid}
        />
      )}

      {selectedEmployee && (
        <QRModal 
          employee={selectedEmployee} 
          userId={user.uid}
          onClose={() => setSelectedEmployee(null)} 
        />
      )}

      {analyticsEmployee && (
        <AnalyticsModal 
          employee={analyticsEmployee}
          onClose={() => setAnalyticsEmployee(null)}
        />
      )}

      {leadsEmployee && (
        <LeadsListModal
          userId={user.uid}
          employee={leadsEmployee}
          onClose={() => setLeadsEmployee(null)}
        />
      )}

      {previewEmployee && (
        <PreviewModal
          employee={previewEmployee}
          userId={user.uid}
          onClose={() => setPreviewEmployee(null)}
        />
      )}
    </div>
  );
}

// --- بطاقة الموظف في القائمة ---
function EmployeeCard({ employee, onDelete, onEdit, onShowQR, onShowAnalytics, onShowLeads, onPreview, userId }) {
  const themeColor = employee.themeColor || '#2563eb';
  const views = employee.stats?.views || 0;
  const isCompany = employee.profileType === 'company';
  
  const templateName = {
      'classic': 'كلاسيكي',
      'modern': 'عصري',
      'creative': 'إبداعي',
      'elegant': 'أنيق',
      'professional': 'احترافي',
      'minimal': 'بسيط'
  }[employee.template] || 'كلاسيكي';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      <div className="flex items-start justify-between mb-4">
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
              {isCompany ? (employee.jobTitle || 'شركة') : (employee.jobTitle || 'موظف')}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${isCompany ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
            {isCompany ? <Building2 size={12} /> : <User size={12} />}
            {isCompany ? 'شركة' : 'موظف'}
          </span>
          <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-medium">
            {templateName}
          </span>
          {employee.bgVideoUrl && <Video size={14} className="text-blue-500" title="فيديو خلفية" />}
          {employee.profileVideoUrl && <PlayCircle size={14} className="text-purple-500" title="فيديو بروفايل" />}
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
        <div className="flex items-center gap-1">
            <Activity size={14} className="text-blue-500" />
            <span>{views} زيارة</span>
        </div>
        <div className="flex items-center gap-1">
            <MousePointerClick size={14} className="text-orange-500" />
            <span>{Object.values(employee.stats?.clicks || {}).reduce((a, b) => a + b, 0)} نقرة</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button 
            onClick={onShowAnalytics}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="الإحصائيات"
        >
            <BarChart3 size={16} />
        </button>
        <button 
            onClick={onShowLeads}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="العملاء المهتمين"
        >
            <Users size={16} />
        </button>
        <button 
            onClick={onShowQR}
            className="text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors opacity-90 hover:opacity-100"
            style={{ backgroundColor: themeColor }}
            title="الرمز"
        >
            <QrCode size={16} />
        </button>
        <button 
            onClick={onPreview}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
            title="معاينة"
        >
            <Eye size={16} />
        </button>
      </div>
    </div>
  );
}

// --- نافذة المعاينة (جديد) ---
function PreviewModal({ employee, userId, onClose }) {
  const getProfileUrl = () => {
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#uid=${userId}&pid=${employee.id}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[380px] h-[750px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
        
        {/* Header Bar */}
        <div className="h-8 bg-black w-full z-10 flex justify-between items-center px-6 pt-1">
            <span className="text-white text-[10px]">9:41</span>
            <div className="flex gap-1">
                <span className="block w-3 h-3 bg-white/20 rounded-full"></span>
                <span className="block w-3 h-3 bg-white/20 rounded-full"></span>
            </div>
        </div>

        {/* Iframe Content */}
        <iframe 
            src={getProfileUrl()} 
            className="w-full h-full bg-white border-0"
            title="Card Preview"
        />

        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
            <X size={20} />
        </button>

        {/* Bottom Bar */}
        <div className="h-6 bg-black w-full z-10 flex justify-center items-end pb-1">
            <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// ... (باقي المكونات: EmployeeForm, ProfileView, LeadsListModal, AnalyticsModal, WalletPreviewModal, QRModal, LeadCaptureModal كما هي بدون تغيير، تأكد من وجودها) ...

// --- نموذج إضافة/تعديل موظف ---
function EmployeeForm({ onClose, initialData, userId }) {
  const [formData, setFormData] = useState({
    profileType: 'employee', // employee, company
    name: '', phone: '', email: '', jobTitle: '', company: '', website: '', whatsapp: '',
    photoUrl: '', cvUrl: '', 
    themeColor: '#2563eb', qrColor: '#000000', qrBgColor: '#ffffff',
    template: 'classic', 
    bgVideoUrl: '', 
    profileVideoUrl: '', 
    facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '',
    stats: { views: 0, clicks: {}, countries: {}, heatmap: {} }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        profileType: initialData.profileType || 'employee',
        themeColor: initialData.themeColor || '#2563eb',
        qrColor: initialData.qrColor || '#000000',
        qrBgColor: initialData.qrBgColor || '#ffffff',
        template: initialData.template || 'classic',
        bgVideoUrl: initialData.bgVideoUrl || '',
        profileVideoUrl: initialData.profileVideoUrl || '',
        facebook: initialData.facebook || '',
        twitter: initialData.twitter || '',
        instagram: initialData.instagram || '',
        linkedin: initialData.linkedin || '',
        youtube: initialData.youtube || '',
        stats: initialData.stats || { views: 0, clicks: {}, countries: {}, heatmap: {} }
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'employees');
      
      if (initialData?.id) {
        await updateDoc(doc(collectionRef, initialData.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collectionRef, {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      window.alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { id: 'classic', name: 'كلاسيكي' },
    { id: 'modern', name: 'عصري' },
    { id: 'creative', name: 'إبداعي' },
    { id: 'elegant', name: 'أنيق' },
    { id: 'professional', name: 'احترافي' },
    { id: 'minimal', name: 'بسيط' },
  ];

  const isCompany = formData.profileType === 'company';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{initialData ? 'تعديل بيانات' : 'إنشاء بطاقة جديدة'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* اختيار نوع البروفايل */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
                type="button"
                onClick={() => setFormData({...formData, profileType: 'employee'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <User size={16} />
                بروفايل موظف
            </button>
            <button
                type="button"
                onClick={() => setFormData({...formData, profileType: 'company'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.profileType === 'company' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Building2 size={16} />
                بروفايل شركة
            </button>
          </div>

          {/* قسم التصميم */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-indigo-200 pb-2 mb-2">
              <LayoutTemplate size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-800">تصميم البطاقة (Premium)</h3>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اختر القالب</label>
                <div className="grid grid-cols-3 gap-2">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData({...formData, template: t.id})}
                            className={`py-3 px-2 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative ${
                                formData.template === t.id 
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                                : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200'
                            }`}
                        >
                            {t.id !== 'classic' && <Crown size={10} className="absolute top-1 right-1 text-amber-500" />}
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">فيديو الخلفية (URL)</label>
                    <input 
                        type="url" 
                        dir="ltr"
                        value={formData.bgVideoUrl}
                        onChange={e => setFormData({...formData, bgVideoUrl: e.target.value})}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="رابط فيديو MP4"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">فيديو البروفايل (URL)</label>
                    <input 
                        type="url" 
                        dir="ltr"
                        value={formData.profileVideoUrl}
                        onChange={e => setFormData({...formData, profileVideoUrl: e.target.value})}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="رابط فيديو MP4"
                    />
                </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Palette size={20} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700">لون البطاقة</label>
                <p className="text-xs text-slate-400">للتصميم العام</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <input 
                type="color" 
                value={formData.themeColor}
                onChange={e => setFormData({...formData, themeColor: e.target.value})}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {isCompany ? 'اسم الشركة' : 'الاسم الكامل'} <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رقم الجوال <span className="text-red-500">*</span></label>
              <input 
                required
                type="tel" 
                dir="ltr"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رقم الواتساب</label>
              <input 
                type="tel" 
                dir="ltr"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isCompany ? 'شعار نصي / المجال (Slogan)' : 'المسمى الوظيفي'}
              </label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {!isCompany && (
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الشركة</label>
                <input 
                    type="text" 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="col-span-2 text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <ImageIcon size={14}/>
                الروابط والمرفقات
             </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isCompany ? 'رابط شعار الشركة (Logo URL)' : 'رابط الصورة الشخصية'}
              </label>
              <input 
                type="url" 
                dir="ltr"
                value={formData.photoUrl}
                onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isCompany ? 'ملف تعريفي (PDF)' : 'رابط الـ CV (PDF)'}
              </label>
              <input 
                type="url" 
                dir="ltr"
                value={formData.cvUrl}
                onChange={e => setFormData({...formData, cvUrl: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رابط الموقع</label>
            <input 
              type="url" 
              dir="ltr"
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">وسائل التواصل الاجتماعي</h3>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="url" 
                dir="ltr"
                value={formData.facebook}
                onChange={e => setFormData({...formData, facebook: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="رابط فيسبوك"
              />
              <input 
                type="url" 
                dir="ltr"
                value={formData.twitter}
                onChange={e => setFormData({...formData, twitter: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="رابط تويتر / X"
              />
              <input 
                type="url" 
                dir="ltr"
                value={formData.instagram}
                onChange={e => setFormData({...formData, instagram: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="رابط انستجرام"
              />
              <input 
                type="url" 
                dir="ltr"
                value={formData.linkedin}
                onChange={e => setFormData({...formData, linkedin: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="رابط لينكد إن"
              />
              <input 
                type="url" 
                dir="ltr"
                value={formData.youtube}
                onChange={e => setFormData({...formData, youtube: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="رابط يوتيوب"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: formData.themeColor }}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- صفحة البروفايل ---
function ProfileView({ data: profileData, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(null);
  const isLogged = useRef(false);

  const trackClick = async (action) => {
    try {
        const docRef = doc(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id);
        await setDoc(docRef, { stats: { clicks: { [action]: increment(1) } } }, { merge: true });
    } catch (e) {
        if(e.code !== 'permission-denied') console.warn("Analytics update failed: Check Firestore Rules");
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
          if (!isLogged.current) {
            isLogged.current = true;
            try {
                const res = await fetch('https://ipwho.is/');
                const geo = await res.json();
                const countryCode = geo.success ? geo.country_code : 'Unknown';
                const lat = geo.success ? geo.latitude : 0;
                const lng = geo.success ? geo.longitude : 0;
                const locationKey = `${Math.round(lat * 10) / 10}_${Math.round(lng * 10) / 10}`;
                await setDoc(docRef, {
                    stats: { views: increment(1), countries: { [countryCode]: increment(1) }, heatmap: { [locationKey]: increment(1) } }
                }, { merge: true });
            } catch (analyticsError) { /* ignore */ }
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
    fetchProfile();
  }, [profileData, user]);

  const downloadVCard = () => {
    trackClick('save_contact');
    if (!data) return;
    
    // تعديل vCard حسب نوع البروفايل
    const isCompany = data.profileType === 'company';
    const org = isCompany ? data.name : (data.company || '');
    const title = isCompany ? '' : (data.jobTitle || '');
    const note = isCompany ? (data.jobTitle || '') : ''; // Slogan as note
    
    // إضافة حقل X-ABShowAs:COMPANY لجعل الهواتف تتعرف عليها كشركة
    const companyField = isCompany ? 'X-ABShowAs:COMPANY\n' : '';

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN;CHARSET=UTF-8:${data.name};;;;\nFN;CHARSET=UTF-8:${data.name}\n${companyField}TEL;TYPE=CELL:${data.phone}\n${data.email ? `EMAIL:${data.email}\n` : ''}${title ? `TITLE;CHARSET=UTF-8:${title}\n` : ''}${org ? `ORG;CHARSET=UTF-8:${org}\n` : ''}${note ? `NOTE;CHARSET=UTF-8:${note}\n` : ''}${data.website ? `URL:${data.website}\n` : ''}${data.facebook ? `X-SOCIALPROFILE;type=facebook:${data.facebook}\n` : ''}${data.twitter ? `X-SOCIALPROFILE;type=twitter:${data.twitter}\n` : ''}${data.instagram ? `X-SOCIALPROFILE;type=instagram:${data.instagram}\n` : ''}${data.linkedin ? `X-SOCIALPROFILE;type=linkedin:${data.linkedin}\n` : ''}END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.name}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-4 text-red-500">{error}</div>;

  const themeColor = data.themeColor || '#2563eb';
  const template = data.template || 'classic';
  const isCompany = data.profileType === 'company';

  const renderHeader = (customClass) => {
    if (data.bgVideoUrl) {
        return (
            <div className={`relative overflow-hidden ${customClass || (template === 'creative' ? 'h-48 rounded-b-[3rem]' : 'h-32')}`}>
                <video src={data.bgVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
        );
    }
    return (
        <div 
          className={`relative ${customClass || (template === 'creative' ? 'h-48 rounded-b-[3rem]' : 'h-32')}`}
          style={{ background: `linear-gradient(to right, ${themeColor}, #1e293b)` }}
        >
           <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
    );
  };

  const renderAvatar = (customClass, customStyle) => {
    let defaultClass = "w-24 h-24 rounded-full border-4 border-white shadow-md bg-white";
    if (isCompany) defaultClass = "w-24 h-24 rounded-xl border-4 border-white shadow-md bg-white"; // مربع للشركات
    
    if (template === 'creative') defaultClass = isCompany ? "w-28 h-28 rounded-xl rotate-3 border-4 border-white shadow-xl bg-white" : "w-28 h-28 rounded-2xl rotate-3 border-4 border-white shadow-xl bg-white";
    if (template === 'minimal') defaultClass = isCompany ? "w-32 h-32 rounded-xl shadow-lg bg-white border-2 border-slate-100" : "w-32 h-32 rounded-full shadow-lg bg-white border-2 border-slate-100";
    if (template === 'elegant') defaultClass = isCompany ? "w-24 h-24 rounded-lg border-4 border-white shadow-2xl bg-white" : "w-24 h-24 rounded-full border-4 border-white shadow-2xl bg-white";

    const content = data.profileVideoUrl ? (
        <video src={data.profileVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ borderRadius: isCompany || template === 'creative' ? '0.5rem' : '50%' }} />
    ) : data.photoUrl ? (
        <img src={data.photoUrl} alt={data.name} className={`w-full h-full ${isCompany ? 'object-contain p-1' : 'object-cover'}`} style={{ borderRadius: isCompany || template === 'creative' ? '0.5rem' : '50%' }} />
    ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500" style={{ borderRadius: isCompany || template === 'creative' ? '0.5rem' : '50%' }}>
            {isCompany ? <Building2 size={32} /> : data.name.charAt(0)}
        </div>
    );

    return (
        <div className={`absolute right-1/2 translate-x-1/2 ${customClass || (template === 'creative' ? '-bottom-14' : '-bottom-12')} ${defaultClass}`} style={customStyle}>
            {content}
        </div>
    );
  };

  const renderSocials = () => (
    <div className="flex justify-center gap-3 mt-4 mb-4 flex-wrap">
      {data.facebook && <a href={data.facebook} target="_blank" onClick={() => trackClick('facebook')} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><Facebook size={20} /></a>}
      {data.twitter && <a href={data.twitter} target="_blank" onClick={() => trackClick('twitter')} className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><Twitter size={20} /></a>}
      {data.instagram && <a href={data.instagram} target="_blank" onClick={() => trackClick('instagram')} className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"><Instagram size={20} /></a>}
      {data.linkedin && <a href={data.linkedin} target="_blank" onClick={() => trackClick('linkedin')} className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"><Linkedin size={20} /></a>}
      {data.youtube && <a href={data.youtube} target="_blank" onClick={() => trackClick('youtube')} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"><Youtube size={20} /></a>}
    </div>
  );

  if (template === 'modern') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative backdrop-blur-md border border-slate-700 text-white">
                {renderHeader()}
                <div className="px-6 relative mb-12">{renderAvatar(null, { borderColor: 'rgba(255,255,255,0.1)' })}</div>
                <div className="mt-8 text-center mb-8 px-6">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <p className="opacity-80 mt-1">{data.jobTitle} {data.company && `| ${data.company}`}</p>
                    {renderSocials()}
                </div>
                <div className="px-6 pb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">
                            <Phone size={24} style={{ color: themeColor }} className="mb-2"/> <span className="text-xs font-bold">اتصال</span>
                        </a>
                        <a href={`https://wa.me/${data.whatsapp}`} target="_blank" onClick={() => trackClick('whatsapp')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">
                            <MessageCircle size={24} className="text-emerald-400 mb-2"/> <span className="text-xs font-bold">واتساب</span>
                        </a>
                        {data.email && <a href={`mailto:${data.email}`} onClick={() => trackClick('email')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"><Mail size={24} className="text-blue-400 mb-2"/><span className="text-xs font-bold">إيميل</span></a>}
                        {data.website && <a href={data.website} target="_blank" onClick={() => trackClick('website')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"><Globe size={24} className="text-purple-400 mb-2"/><span className="text-xs font-bold">الموقع</span></a>}
                    </div>
                    <button onClick={() => setIsLeadFormOpen(true)} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 border border-slate-600"><UserPlus size={20} /> <span className="font-bold">تبادل جهات الاتصال</span></button>
                    <div className="flex gap-2"><button onClick={() => setShowWalletModal('apple')} className="flex-1 bg-black p-3 rounded-xl flex justify-center"><Wallet size={20} /></button><button onClick={() => setShowWalletModal('google')} className="flex-1 bg-white text-black p-3 rounded-xl flex justify-center"><CreditCard size={20} /></button></div>
                    <button onClick={downloadVCard} className="w-full p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mt-4" style={{ backgroundColor: themeColor }}><UserPlus size={20} /> حفظ جهة الاتصال</button>
                </div>
            </div>
            {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={themeColor} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
            {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
        </div>
      );
  } 
  
  if (template === 'creative') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden relative border-8 border-white">
                {renderHeader()}
                <div className="px-6 relative mb-16">{renderAvatar()}</div>
                <div className="text-center mb-8 px-6">
                    <h1 className="text-3xl font-black text-slate-800">{data.name}</h1>
                    <p className="text-lg font-medium opacity-80 mt-1" style={{ color: themeColor }}>{data.jobTitle}</p>
                    {data.company && <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-2">{data.company}</p>}
                    {renderSocials()}
                </div>
                <div className="px-6 pb-8 space-y-4">
                    <div className="space-y-3">
                        <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"><div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform"><Phone size={20} style={{ color: themeColor }} /></div><span className="font-bold text-slate-700">اتصل بي</span></a>
                        <a href={`https://wa.me/${data.whatsapp}`} target="_blank" onClick={() => trackClick('whatsapp')} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"><div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform"><MessageCircle size={20} className="text-emerald-500" /></div><span className="font-bold text-slate-700">واتساب</span></a>
                    </div>
                    <div className="flex gap-2 pt-4"><button onClick={() => setIsLeadFormOpen(true)} className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">تبادل البيانات</button><button onClick={downloadVCard} className="flex-1 text-white p-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: themeColor }}>حفظ</button></div>
                    <div className="flex justify-center gap-4 pt-4 opacity-70"><button onClick={() => setShowWalletModal('apple')}><Wallet size={24} /></button><button onClick={() => setShowWalletModal('google')}><CreditCard size={24} /></button></div>
                </div>
            </div>
            {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={themeColor} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
            {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
        </div>
      );
  }

  if (template === 'minimal') {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 text-center">
                <div className="mb-8 relative flex justify-center">
                    {renderAvatar("relative translate-x-0 bottom-0", { borderColor: themeColor })}
                </div>
                <h1 className="text-3xl font-light text-slate-900 mb-2">{data.name}</h1>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8">{data.jobTitle} | {data.company}</p>
                {renderSocials()}
                
                <div className="space-y-4 max-w-xs mx-auto">
                    <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="block w-full py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">اتصال هاتفي</a>
                    <a href={`https://wa.me/${data.whatsapp}`} target="_blank" onClick={() => trackClick('whatsapp')} className="block w-full py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">واتساب</a>
                    <div className="flex gap-2">
                        <button onClick={() => setIsLeadFormOpen(true)} className="flex-1 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium hover:bg-slate-200">تواصل معي</button>
                        <button onClick={downloadVCard} className="flex-1 py-3 text-white rounded-lg font-medium shadow-md" style={{ backgroundColor: themeColor }}>حفظ</button>
                    </div>
                </div>
                <div className="mt-8 flex justify-center gap-6 text-slate-400">
                    <button onClick={() => setShowWalletModal('apple')}><Wallet size={20} /></button>
                    <button onClick={() => setShowWalletModal('google')}><CreditCard size={20} /></button>
                    {data.email && <a href={`mailto:${data.email}`}><Mail size={20} /></a>}
                    {data.website && <a href={data.website} target="_blank"><Globe size={20} /></a>}
                </div>
            </div>
            {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={themeColor} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
            {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
        </div>
      );
  }

  if (template === 'elegant') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f5f2]">
            <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden relative border border-[#e5e0d8]">
                <div className="h-48 bg-[#1c1c1c] relative flex items-center justify-center">
                    {data.bgVideoUrl && <video src={data.bgVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                    <div className="text-center relative z-10 p-6 border-b-4 border-[#d4af37]">
                        <h1 className="text-2xl font-serif text-white tracking-widest uppercase">{data.company}</h1>
                    </div>
                </div>
                <div className="px-8 py-10 text-center">
                    <div className="mb-6 flex justify-center">
                        {renderAvatar("relative translate-x-0 bottom-0", { borderColor: '#d4af37', width: '100px', height: '100px' })}
                    </div>
                    <h2 className="text-3xl font-serif text-slate-900 mb-2">{data.name}</h2>
                    <p className="text-[#d4af37] font-medium uppercase tracking-widest text-xs mb-8">{data.jobTitle}</p>
                    {renderSocials()}
                    
                    <div className="space-y-4 font-serif">
                        <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex items-center justify-center gap-3 py-3 border-b border-slate-100 hover:bg-[#fcfbf9] transition-colors text-slate-600">
                            <Phone size={16} className="text-[#d4af37]" /> {data.phone}
                        </a>
                        <a href={`mailto:${data.email}`} onClick={() => trackClick('email')} className="flex items-center justify-center gap-3 py-3 border-b border-slate-100 hover:bg-[#fcfbf9] transition-colors text-slate-600">
                            <Mail size={16} className="text-[#d4af37]" /> {data.email}
                        </a>
                    </div>

                    <div className="mt-8 flex gap-3 justify-center">
                        <button onClick={downloadVCard} className="px-8 py-3 bg-[#1c1c1c] text-[#d4af37] font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors">حفظ البطاقة</button>
                        <button onClick={() => setIsLeadFormOpen(true)} className="px-4 py-3 border border-[#1c1c1c] text-[#1c1c1c] hover:bg-slate-50"><UserPlus size={16} /></button>
                    </div>
                </div>
            </div>
            {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={'#d4af37'} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
            {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
        </div>
      );
  }

  if (template === 'professional') {
      return (
        <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
               <div className="h-32 bg-slate-800 relative">
                   {data.bgVideoUrl && <video src={data.bgVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                   <div className="absolute -bottom-10 left-6">
                       {renderAvatar("relative translate-x-0 bottom-0", { borderRadius: '8px', width: '80px', height: '80px', border: '4px solid white' })}
                   </div>
               </div>
               <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                   <div className="mb-6">
                       <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
                       <p className="text-slate-500 font-medium">{data.jobTitle}</p>
                       <p className="text-blue-600 text-sm">{data.company}</p>
                       {renderSocials()}
                   </div>
                   
                   <div className="space-y-2 flex-1">
                       <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex items-center gap-3 p-3 bg-slate-50 rounded hover:bg-slate-100">
                           <div className="bg-blue-100 p-2 rounded text-blue-600"><Phone size={18} /></div>
                           <span className="text-slate-700 font-medium">{data.phone}</span>
                       </a>
                       {data.email && (
                           <a href={`mailto:${data.email}`} onClick={() => trackClick('email')} className="flex items-center gap-3 p-3 bg-slate-50 rounded hover:bg-slate-100">
                               <div className="bg-blue-100 p-2 rounded text-blue-600"><Mail size={18} /></div>
                               <span className="text-slate-700 font-medium">{data.email}</span>
                           </a>
                       )}
                       <div className="grid grid-cols-2 gap-2 mt-2">
                           <button onClick={() => setIsLeadFormOpen(true)} className="py-3 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-50">تواصل</button>
                           <button onClick={downloadVCard} className="py-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">حفظ</button>
                       </div>
                   </div>
                   
                   <div className="mt-auto border-t pt-4 flex justify-between items-center text-slate-400">
                       <div className="flex gap-4">
                           <button onClick={() => setShowWalletModal('apple')}><Wallet size={20} /></button>
                           <button onClick={() => setShowWalletModal('google')}><CreditCard size={20} /></button>
                       </div>
                       {data.website && <a href={data.website} target="_blank"><Globe size={20} /></a>}
                   </div>
               </div>
            </div>
            {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={'#2563eb'} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
            {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden relative pb-6">
        {renderHeader()}
        <div className="px-6 relative">
          {renderAvatar()}
          <div className="mt-16 text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
            <p className="font-medium" style={{ color: themeColor }}>
                {data.jobTitle} {data.company && `| ${data.company}`}
            </p>
            {renderSocials()}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href={`tel:${data.phone}`} onClick={() => trackClick('call')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              <Phone size={20} style={{ color: themeColor }} /> <span className="font-bold">اتصال</span>
            </a>
            <a href={`https://wa.me/${data.whatsapp}`} target="_blank" onClick={() => trackClick('whatsapp')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              <MessageCircle size={20} className="text-emerald-500" /> <span className="font-bold">واتساب</span>
            </a>
            {data.email && (
              <a href={`mailto:${data.email}`} onClick={() => trackClick('email')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Mail size={20} style={{ color: themeColor }} /> <span className="font-bold">إيميل</span>
              </a>
            )}
            {data.website && (
              <a href={data.website} target="_blank" onClick={() => trackClick('website')} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Globe size={20} style={{ color: themeColor }} /> <span className="font-bold">الموقع</span>
              </a>
            )}
            <button onClick={() => setIsLeadFormOpen(true)} className="col-span-2 flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                <UserPlus size={20} /> <span className="font-bold">تبادل جهات الاتصال</span>
            </button>
            <button onClick={() => setShowWalletModal('apple')} className="col-span-1 flex items-center justify-center gap-2 bg-black text-white p-3 rounded-xl hover:bg-gray-800"><Wallet size={20} /><span className="font-bold text-xs">Apple</span></button>
            <button onClick={() => setShowWalletModal('google')} className="col-span-1 flex items-center justify-center gap-2 bg-white text-black border border-slate-200 p-3 rounded-xl hover:bg-slate-50"><CreditCard size={20} className="text-blue-500" /><span className="font-bold text-xs">Google</span></button>
            {data.cvUrl && (
              <a href={data.cvUrl} target="_blank" onClick={() => trackClick('download_cv')} className="col-span-2 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <FileText size={20} className="text-orange-500" /> <span className="font-bold">{isCompany ? 'الملف التعريفي' : 'تحميل السيرة الذاتية'}</span>
              </a>
            )}
          </div>

          <button onClick={downloadVCard} className="w-full text-white p-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-8 transform active:scale-95" style={{ backgroundColor: themeColor }}>
            <UserPlus size={20} /> حفظ جهة الاتصال
          </button>
        </div>
        <div className="bg-slate-50 py-4 text-center text-slate-400 text-xs">Digital Card System © 2024</div>
      </div>
      {isLeadFormOpen && <LeadCaptureModal adminId={profileData.adminId} employeeId={profileData.id} themeColor={themeColor} onClose={() => setIsLeadFormOpen(false)} onSuccess={() => trackClick('exchange_contact')} />}
      {showWalletModal && <WalletPreviewModal type={showWalletModal} data={data} onClose={() => setShowWalletModal(null)} />}
    </div>
  );
}

// ... (باقي المكونات المساعدة: LeadCaptureModal, WalletPreviewModal, QRModal, LeadsListModal, AnalyticsModal لم تتغير) ...
// (يتم تضمينها في الكود الكامل أعلاه لضمان عمل الملف)

function LeadCaptureModal({ adminId, employeeId, themeColor, onClose, onSuccess }) {
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
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      window.alert("حدث خطأ أثناء الإرسال.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><UserPlus size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">تم الإرسال بنجاح!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6"><h3 className="text-xl font-bold text-slate-800">تبادل جهات الاتصال</h3></div>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300" placeholder="الاسم" />
            <input type="tel" required dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-right" placeholder="05xxxxxxxx" />
            <button type="submit" disabled={loading} className="w-full text-white font-bold py-3 rounded-xl" style={{ backgroundColor: themeColor }}>{loading ? '...' : 'إرسال'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function WalletPreviewModal({ type, data, onClose }) {
  const isApple = type === 'apple';
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: isApple ? 'black' : 'white', border: isApple ? 'none' : '1px solid #eee' }}>
            {isApple ? <Wallet size={32} className="text-white" /> : <CreditCard size={32} className="text-blue-500" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{isApple ? 'Apple Wallet' : 'Google Wallet'}</h3>
          <p className="text-sm text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg">هذه معاينة فقط. يتطلب التفعيل خادماً خلفياً.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRModal({ employee, userId, onClose }) {
  const getProfileUrl = () => `${window.location.href.split('#')[0]}#uid=${userId}&pid=${employee.id}`;
  const qrColor = employee.qrColor ? employee.qrColor.replace('#', '') : '000000';
  const qrBgColor = employee.qrBgColor ? employee.qrBgColor.replace('#', '') : 'ffffff';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getProfileUrl())}&color=${qrColor}&bgcolor=${qrBgColor}`;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200 p-8 flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 mb-6"><img src={qrImageUrl} alt="QR" className="w-48 h-48" /></div>
        <h3 className="text-xl font-bold mb-1">{employee.name}</h3>
      </div>
    </div>
  );
}

function LeadsListModal({ userId, employee, onClose }) {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', userId, 'employees', employee.id, 'leads');
    return onSnapshot(q, (snapshot) => setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [userId, employee.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">العملاء: {employee.name}</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className="space-y-3">{leads.map(l => <div key={l.id} className="bg-slate-50 p-3 rounded">{l.name} - {l.phone}</div>)}</div>
      </div>
    </div>
  );
}

function AnalyticsModal({ employee, onClose }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, map
    const stats = employee.stats || { views: 0, clicks: {}, countries: {}, heatmap: {} };
    const clicks = stats.clicks || {};
    const countries = stats.countries || {};
    const heatmap = stats.heatmap || {};

    const sortedClicks = Object.entries(clicks).sort(([,a], [,b]) => b - a);
    const sortedCountries = Object.entries(countries).sort(([,a], [,b]) => b - a);

    const getActionName = (key) => {
        const names = {
            'call': 'اتصال هاتفي',
            'whatsapp': 'واتساب',
            'email': 'إرسال بريد',
            'website': 'زيارة الموقع',
            'save_contact': 'حفظ جهة الاتصال',
            'download_cv': 'تحميل الملفات',
            'exchange_contact': 'تبادل جهات الاتصال',
            'facebook': 'فيسبوك',
            'twitter': 'تويتر',
            'instagram': 'انستجرام',
            'linkedin': 'لينكد إن',
            'youtube': 'يوتيوب'
        };
        return names[key] || key;
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-600" />
                        إحصائيات: {employee.name}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        نظرة عامة
                    </button>
                    <button 
                        onClick={() => setActiveTab('map')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        الخريطة الحرارية
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <div className="text-blue-500 mb-1 flex justify-center"><Activity size={24} /></div>
                                    <div className="text-2xl font-bold text-slate-800">{stats.views}</div>
                                    <div className="text-xs text-slate-500">إجمالي الزيارات</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl text-center">
                                    <div className="text-orange-500 mb-1 flex justify-center"><MousePointerClick size={24} /></div>
                                    <div className="text-2xl font-bold text-slate-800">{Object.values(clicks).reduce((a, b) => a + b, 0)}</div>
                                    <div className="text-xs text-slate-500">إجمالي النقرات</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3 border-r-4 border-blue-500 pr-2">تفاعل الأزرار</h3>
                                <div className="space-y-3">
                                    {sortedClicks.length > 0 ? sortedClicks.map(([action, count]) => (
                                        <div key={action} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                            <span className="text-sm font-medium text-slate-700">{getActionName(action)}</span>
                                            <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-100">{count}</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-400 text-center py-2">لا توجد نقرات مسجلة بعد</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3 border-r-4 border-green-500 pr-2">أهم الدول</h3>
                                <div className="space-y-2">
                                    {sortedCountries.length > 0 ? sortedCountries.map(([code, count]) => (
                                        <div key={code} className="flex items-center gap-3">
                                            <div className="w-8 text-center text-lg">{getFlagEmoji(code)}</div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-green-500 rounded-full" 
                                                        style={{ width: `${(count / stats.views) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold w-8 text-left">{count}</div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-400 text-center py-2">لا توجد بيانات جغرافية بعد</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <MapIcon size={16} />
                                أماكن المسح النشطة
                            </h3>
                            
                            <div className="relative w-full aspect-[2/1] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
                                    alt="World Map" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                                />
                                {Object.entries(heatmap).map(([key, count]) => {
                                    const [lat, lng] = key.split('_').map(Number);
                                    const x = (lng + 180) * (100 / 360);
                                    const y = (90 - lat) * (100 / 180);
                                    const size = Math.min(20, 6 + (count * 2));
                                    
                                    return (
                                        <div 
                                            key={key}
                                            className="absolute rounded-full bg-red-500/60 border border-red-600/40 shadow-sm"
                                            title={`${count} زيارات`}
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                width: `${size}px`,
                                                height: `${size}px`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        ></div>
                                    );
                                })}
                                {Object.keys(heatmap).length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                        لا توجد بيانات خريطة حتى الآن
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
                                <p><strong>ملاحظة:</strong> النقاط الحمراء تمثل التجمعات الجغرافية للمستخدمين الذين قاموا بمسح الرمز.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === 'Unknown') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
