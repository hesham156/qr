import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, onSnapshot, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, Mail, Globe, MapPin, UserPlus, Trash2, Edit2, Share2, Plus, X, ExternalLink, QrCode, MessageCircle, ArrowRight, AlertCircle, LogOut, Lock, FileText, Image as ImageIcon, Palette, Grid } from 'lucide-react';

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
  
  // دالة للتحقق من الهاش في الرابط وتحديث العرض
  const checkRoute = (currentUser) => {
    const hashString = window.location.hash.substring(1); // إزالة #
    const params = new URLSearchParams(hashString);
    const pid = params.get('pid');
    const uid = params.get('uid');
    
    // 1. حالة عرض البروفايل (QR Code)
    if (pid && uid) {
      setProfileData({ id: pid, adminId: uid });
      setViewMode('profile');
      if (!currentUser) {
        signInAnonymously(auth).catch((err) => console.error("Anonymous Auth Error:", err));
      }
      return;
    }

    // 2. حالة لوحة التحكم (Dashboard)
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
        <ProfileView data={profileData} />
      ) : viewMode === 'login' ? (
        <LoginView />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

// --- شاشة تسجيل الدخول (Admin) ---
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مسجل مسبقاً، حاول تسجيل الدخول.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل.');
      } else {
        setError('حدث خطأ: ' + err.code);
      }
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

// --- مكون لوحة التحكم (إدارة الموظفين) ---
function Dashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    // FIX: Use window.confirm explicitly
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', id));
      } catch (e) {
        console.error("Error deleting:", e);
        // FIX: Use window.alert explicitly
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
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">إدارة الموظفين</h1>
            <h1 className="text-xl font-bold text-slate-800 sm:hidden">الإدارة</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">موظف جديد</span>
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">لا يوجد موظفين حالياً</h3>
            <p className="text-slate-500 mb-6">أضف بيانات الموظفين لإنشاء بطاقات رقمية لهم</p>
            <button onClick={handleAddNew} className="text-blue-600 font-bold hover:underline">
              + إضافة أول موظف
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                onDelete={() => handleDelete(emp.id)}
                onEdit={() => handleEdit(emp)}
                onShowQR={() => setSelectedEmployee(emp)}
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
    </div>
  );
}

// --- بطاقة الموظف ---
function EmployeeCard({ employee, onDelete, onEdit, onShowQR }) {
  // استخدام لون السمة إذا وجد
  const themeColor = employee.themeColor || '#2563eb';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* عرض الصورة إذا وجدت */}
          {employee.photoUrl ? (
            <img 
              src={employee.photoUrl} 
              alt={employee.name} 
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
              style={{ borderColor: themeColor }}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: themeColor }}
            >
              {employee.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 line-clamp-1">{employee.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{employee.jobTitle || 'موظف'}</p>
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

      <div className="space-y-2 text-sm text-slate-600 mb-6">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" />
          <span dir="ltr" className="text-right">{employee.phone}</span>
        </div>
        {employee.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
      </div>

      <button 
        onClick={onShowQR}
        className="w-full text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors opacity-90 hover:opacity-100"
        style={{ backgroundColor: themeColor }}
      >
        <QrCode size={16} />
        عرض الـ QR Code
      </button>
    </div>
  );
}

// --- نموذج إضافة/تعديل موظف ---
function EmployeeForm({ onClose, initialData, userId }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jobTitle: '',
    company: '',
    website: '',
    whatsapp: '',
    photoUrl: '', 
    cvUrl: '',
    themeColor: '#2563eb', // اللون الافتراضي (أزرق)
    qrColor: '#000000',    // لون الـ QR الافتراضي (أسود)
    qrBgColor: '#ffffff'   // لون خلفية الـ QR الافتراضي (أبيض)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        themeColor: initialData.themeColor || '#2563eb',
        qrColor: initialData.qrColor || '#000000',
        qrBgColor: initialData.qrBgColor || '#ffffff'
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
      // FIX: Use window.alert
      window.alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{initialData ? 'تعديل بيانات' : 'موظف جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* قسم الألوان (السمة) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Palette size={20} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700">لون البطاقة</label>
                <p className="text-xs text-slate-400">للتصميم العام (الخلفية والأزرار)</p>
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

          {/* قسم تخصيص الـ QR Code - جديد */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
              <Grid size={18} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700">تخصيص شكل الـ QR Code</h3>
            </div>
            
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm font-medium text-slate-700">لون النقاط (QR Color)</label>
                    <p className="text-xs text-slate-400">اللون الأساسي للرمز</p>
                </div>
                <input 
                    type="color" 
                    value={formData.qrColor}
                    onChange={e => setFormData({...formData, qrColor: e.target.value})}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md"
                />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm font-medium text-slate-700">لون الخلفية (Background)</label>
                    <p className="text-xs text-slate-400">خلفية رمز الـ QR</p>
                </div>
                <input 
                    type="color" 
                    value={formData.qrBgColor}
                    onChange={e => setFormData({...formData, qrBgColor: e.target.value})}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">المسمى الوظيفي</label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الشركة</label>
              <input 
                type="text" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* حقول الروابط والمرفقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="col-span-2 text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <ImageIcon size={14}/>
                الروابط والمرفقات
             </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رابط الصورة الشخصية</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">رابط الـ CV (PDF)</label>
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

// --- نافذة الـ QR Code ---
function QRModal({ employee, userId, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const getProfileUrl = () => {
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#uid=${userId}&pid=${employee.id}`;
  };

  // استخراج الألوان وتنظيفها (إزالة #)
  const qrColor = employee.qrColor ? employee.qrColor.replace('#', '') : '000000';
  const qrBgColor = employee.qrBgColor ? employee.qrBgColor.replace('#', '') : 'ffffff';

  // بناء الرابط مع الألوان المخصصة
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getProfileUrl())}&color=${qrColor}&bgcolor=${qrBgColor}`;

  const downloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${employee.name}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // FIX: Use window.alert
      window.alert('حدث خطأ أثناء تحميل الصورة');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div 
          className="p-6 text-center text-white relative overflow-hidden"
          style={{ backgroundColor: employee.themeColor || '#2563eb' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10"></div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-1">
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold mb-1">{employee.name}</h3>
          <p className="text-white/80 text-sm">{employee.jobTitle}</p>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 mb-6 w-[220px] h-[220px] flex items-center justify-center">
            <img 
              src={qrImageUrl} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center text-amber-600 bg-amber-50 p-3 rounded-lg text-xs mb-6 w-full">
            <strong>ملاحظة هامة:</strong> تم تحديث الرابط ليشمل معرف حسابك.
          </div>

          <button 
            onClick={downloadQR}
            disabled={downloading}
            className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#1e293b' }}
          >
            {downloading ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Share2 size={18} />
            )}
            {downloading ? 'جاري التحميل...' : 'تحميل الصورة'}
          </button>
          
          <a 
            href={getProfileUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-blue-600 text-sm hover:underline flex items-center gap-1"
            style={{ color: employee.themeColor || '#2563eb' }}
          >
            تجربة الرابط في المتصفح <ExternalLink size={12}/>
          </a>
        </div>
      </div>
    </div>
  );
}

// --- صفحة البروفايل ---
function ProfileView({ data: profileData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', profileData.adminId, 'employees', profileData.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setError('لم يتم العثور على البطاقة');
        }
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileData]);

  const downloadVCard = () => {
    if (!data) return;
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
N;CHARSET=UTF-8:${data.name};;;;
FN;CHARSET=UTF-8:${data.name}
TEL;TYPE=CELL:${data.phone}
${data.email ? `EMAIL:${data.email}` : ''}
${data.jobTitle ? `TITLE;CHARSET=UTF-8:${data.jobTitle}` : ''}
${data.company ? `ORG;CHARSET=UTF-8:${data.company}` : ''}
${data.website ? `URL:${data.website}` : ''}
${data.photoUrl ? `PHOTO;URI:${data.photoUrl}` : ''}
END:VCARD`;

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
  
  if (error) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-red-500 mb-4">{error}</div>
      </div>
  );

  const themeColor = data.themeColor || '#2563eb';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Cover */}
        <div 
          className="h-32 relative"
          style={{ background: `linear-gradient(to right, ${themeColor}, #1e293b)` }}
        >
           <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Profile Info */}
        <div className="px-6 relative">
          <div className="absolute -top-12 right-1/2 translate-x-1/2">
             {data.photoUrl ? (
                <img 
                  src={data.photoUrl} 
                  alt={data.name} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  style={{ borderColor: themeColor }}
                />
             ) : (
                <div 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {data.name.charAt(0)}
                </div>
             )}
          </div>
          
          <div className="mt-16 text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
            <p className="font-medium" style={{ color: themeColor }}>{data.jobTitle} {data.company && `| ${data.company}`}</p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href={`tel:${data.phone}`} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              <Phone size={20} style={{ color: themeColor }} />
              <span className="font-bold">اتصال</span>
            </a>
            
            {data.whatsapp ? (
              <a href={`https://wa.me/${data.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <MessageCircle size={20} className="text-emerald-500" />
                <span className="font-bold">واتساب</span>
              </a>
            ) : (
               <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 p-4 rounded-xl cursor-not-allowed border border-slate-100">
                <MessageCircle size={20} />
                <span className="font-bold">واتساب</span>
              </div>
            )}

            {data.email ? (
              <a href={`mailto:${data.email}`} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Mail size={20} style={{ color: themeColor }} />
                <span className="font-bold">إيميل</span>
              </a>
            ) : null}

            {data.website ? (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Globe size={20} style={{ color: themeColor }} />
                <span className="font-bold">الموقع</span>
              </a>
            ) : null}

            {/* زر الـ CV الجديد */}
            {data.cvUrl ? (
              <a href={data.cvUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <FileText size={20} className="text-orange-500" />
                <span className="font-bold">تحميل السيرة الذاتية (CV)</span>
              </a>
            ) : null}
          </div>

          {/* Save Contact Button */}
          <button 
            onClick={downloadVCard}
            className="w-full text-white p-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-8 transform active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <UserPlus size={20} />
            حفظ جهة الاتصال
          </button>
        </div>
        
        <div className="bg-slate-50 py-4 text-center text-slate-400 text-xs">
          Digital Card System © 2024
        </div>
      </div>
    </div>
  );
}
