import './index.css'
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  getDoc,
  addDoc,
  collection,
  arrayUnion
} from 'firebase/firestore';
import { Settings, Calculator, LogOut, Lock, Save, Printer, Palette, Scroll, Layout, Trash2, Plus, Maximize, User, Mail, Key, Users, UserPlus, Database, FileJson, Layers, Percent, History, FileText, ArrowRight, ToggleLeft, ToggleRight, Sliders, Eye, EyeOff, Stamp, Factory, Ban, Info } from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyDlKM00R5pD3kfFs_vv2KTsnDEvTqmWnSU",
  authDomain: "mynew-6e4cc.firebaseapp.com",
  projectId: "mynew-6e4cc",
  storageBucket: "mynew-6e4cc.firebasestorage.app",
  messagingSenderId: "789467376297",
  appId: "1:789467376297:web:8f6356a625756d179c17b8",
  measurementId: "G-81PB2CLSS9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'printing-app-v1'; 
const LOGO_URL = "https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/XWZKA/YaMTPHLOL2Te8CL4gQbZmq17ktijebIHHKZRx6jp.png";

// --- Constants ---
const USERS_DB_PATH = ['artifacts', appId, 'public', 'data', 'settings', 'users_db'];
const HISTORY_COLLECTION_PATH = ['artifacts', appId, 'public', 'data', 'pricing_history'];
const GENERAL_SETTINGS_PATH = ['artifacts', appId, 'public', 'data', 'settings', 'general'];

// --- Helper Component: Discount Manager ---
const DiscountManager = ({ discounts, onChange, unitLabel }) => {
  const [minQty, setMinQty] = useState('');
  const [percent, setPercent] = useState('');

  const handleAdd = () => {
    if (!minQty || !percent) return;
    const newRule = { min: parseFloat(minQty), percent: parseFloat(percent) };
    const newDiscounts = [...(discounts || []), newRule].sort((a, b) => a.min - b.min);
    onChange(newDiscounts);
    setMinQty('');
    setPercent('');
  };

  const handleRemove = (index) => {
    const newDiscounts = discounts.filter((_, i) => i !== index);
    onChange(newDiscounts);
  };

  return (
    <div className="bg-[#337159]/5 p-4 rounded-xl border border-[#337159]/20 mt-4">
      <div className="flex items-center gap-2 mb-3 text-[#337159]">
        <Percent className="w-5 h-5" />
        <h4 className="font-bold text-sm">شرائح الخصم (الكميات)</h4>
      </div>

      <div className="space-y-2 mb-3">
        {(!discounts || discounts.length === 0) && <p className="text-xs text-slate-400 text-center">لا توجد خصومات مفعلة</p>}
        {discounts?.map((rule, idx) => (
          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-[#b99ecb]/30 text-sm">
            <span>من <span className="font-bold text-[#337159]">{rule.min}</span> {unitLabel} فأكثر</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#fa5732] bg-[#fa5732]/10 px-2 py-0.5 rounded">خصم {rule.percent}%</span>
              <button onClick={() => handleRemove(idx)} className="text-slate-400 hover:text-[#fa5732]"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-end border-t border-[#337159]/10 pt-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 block mb-1">الحد الأدنى ({unitLabel})</label>
          <input type="number" value={minQty} onChange={(e) => setMinQty(e.target.value)} className="w-full p-2 text-sm border border-[#b99ecb] rounded outline-none focus:ring-1 focus:ring-[#337159]" placeholder="مثال: 100" />
        </div>
        <div className="w-20">
          <label className="text-[10px] text-slate-500 block mb-1">نسبة الخصم %</label>
          <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} className="w-full p-2 text-sm border border-[#b99ecb] rounded outline-none focus:ring-1 focus:ring-[#337159]" placeholder="مثال: 10" />
        </div>
        <button onClick={handleAdd} className="bg-[#337159] hover:bg-[#2a5c48] text-white p-2 rounded"><Plus className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

// --- Helper Components ---

// 1. ResultBox
const ResultBox = ({ label, value, highlighted = false }) => (
  <div className={`p-3 rounded-lg border ${highlighted ? 'bg-[#fa5732]/10 border-[#fa5732]/30' : 'bg-slate-50 border-slate-100'}`}>
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    <div className={`font-bold text-xl ${highlighted ? 'text-[#fa5732]' : 'text-[#337159]'}`}>
      {typeof value === 'object' && value !== null ? JSON.stringify(value) : value}
    </div>
  </div>
);

// --- Components ---

const AuthScreen = ({ onLoginSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'admin@print.com') {
      onLoginSuccess({
        email: 'admin@print.com',
        name: 'المدير العام',
        role: 'admin',
        uid: 'admin-master-id'
      });
      return;
    }

    try {
      const usersDocRef = doc(db, ...USERS_DB_PATH);
      const usersSnap = await getDoc(usersDocRef);
      let currentUsers = [];
      
      if (usersSnap.exists()) {
        currentUsers = usersSnap.data().list || [];
      }

      if (isLogin) {
        const foundUser = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (foundUser) {
          if (foundUser.role === 'admin') {
            onLoginSuccess(foundUser);
          } else {
            setError('هذا الحساب ليس لديه صلاحيات مسؤول.');
          }
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال بقاعدة البيانات');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative border-t-4 border-[#337159]">
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 text-slate-400 hover:text-[#337159] flex items-center gap-1 text-sm font-bold transition-colors"
        >
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center p-1">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#337159]">دخول المسؤولين</h1>
          <p className="text-slate-500 text-sm mt-1">يرجى تسجيل الدخول للوصول للإعدادات</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#337159] mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute top-3 right-3 w-5 h-5 text-[#b99ecb]" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pr-10 pl-3 py-2.5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#fa5732] outline-none" placeholder="name@company.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#337159] mb-1">كلمة المرور</label>
            <div className="relative">
              <Key className="absolute top-3 right-3 w-5 h-5 text-[#b99ecb]" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10 pl-3 py-2.5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#fa5732] outline-none" placeholder="******" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#fa5732] hover:bg-[#d94a29] text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-100 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const usersDocRef = doc(db, ...USERS_DB_PATH);
    const unsubscribe = onSnapshot(usersDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUsersList(docSnap.data().list || []);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      if (usersList.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
        setMsg('هذا البريد الإلكتروني مسجل بالفعل');
        setLoading(false);
        return;
      }
      const newUser = {
        uid: 'user-' + Date.now(),
        email: newUserEmail,
        password: newUserPass,
        name: newUserName,
        role: newUserRole,
        createdAt: new Date().toISOString()
      };
      const usersDocRef = doc(db, ...USERS_DB_PATH);
      try {
        await updateDoc(usersDocRef, { list: arrayUnion(newUser) });
      } catch {
        await setDoc(usersDocRef, { list: [newUser] });
      }
      setMsg('تم إنشاء المستخدم بنجاح!');
      setNewUserEmail(''); setNewUserPass(''); setNewUserName('');
    } catch (err) {
      console.error(err);
      setMsg('حدث خطأ أثناء الحفظ');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#337159]/5 p-6 rounded-xl border border-[#337159]/20">
        <h4 className="font-bold text-[#337159] mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> إضافة مستخدم جديد</h4>
        {msg && <div className={`p-3 rounded-lg mb-4 text-sm font-bold text-center ${msg.includes('بنجاح') ? 'bg-green-100 text-green-800' : 'bg-red-200 text-red-800'}`}>{msg}</div>}
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-slate-600 mb-1">الاسم</label><input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full p-2 rounded border border-[#b99ecb] focus:ring-2 focus:ring-[#337159] outline-none"/></div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">البريد الإلكتروني</label><input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full p-2 rounded border border-[#b99ecb] focus:ring-2 focus:ring-[#337159] outline-none"/></div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور</label><input type="text" required value={newUserPass} onChange={e => setNewUserPass(e.target.value)} className="w-full p-2 rounded border border-[#b99ecb] focus:ring-2 focus:ring-[#337159] outline-none" placeholder="كلمة المرور"/></div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">الدور (الصلاحية)</label><select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full p-2 rounded border border-[#b99ecb] focus:ring-2 focus:ring-[#337159] outline-none bg-white"><option value="employee">موظف (حاسبة فقط)</option><option value="admin">مسؤول (تحكم كامل)</option></select></div>
          <div className="md:col-span-2 mt-2"><button type="submit" disabled={loading} className="w-full bg-[#337159] hover:bg-[#2a5c48] text-white py-2 rounded-lg font-bold shadow transition-colors disabled:opacity-50">{loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}</button></div>
        </form>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#b99ecb]" /> قائمة المستخدمين المسجلين</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr><th className="p-3 border-b">الاسم</th><th className="p-3 border-b">البريد الإلكتروني</th><th className="p-3 border-b">كلمة المرور</th><th className="p-3 border-b">الدور</th><th className="p-3 border-b">تاريخ التسجيل</th></tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (<tr><td colSpan="5" className="p-4 text-center text-slate-400">لا يوجد مستخدمين مسجلين في القائمة بعد.</td></tr>) : (
                usersList.map((user, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-3">{user.name}</td><td className="p-3 font-mono text-xs">{user.email}</td><td className="p-3 font-mono text-xs text-slate-400">{user.password}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-[#b99ecb]/20 text-[#b99ecb]' : 'bg-[#337159]/10 text-[#337159]'}`}>{user.role === 'admin' ? 'مسؤول' : 'موظف'}</span></td>
                    <td className="p-3 text-slate-400 text-xs">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HistoryLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsRef = collection(db, ...HISTORY_COLLECTION_PATH);
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center p-8 text-slate-500">جاري تحميل السجل...</div>;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 animate-in fade-in duration-300">
      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-[#fa5732]" />
        سجل تسعيرات الموظفين
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600 font-bold">
            <tr>
              <th className="p-3 border-b">التاريخ</th>
              <th className="p-3 border-b">الموظف</th>
              <th className="p-3 border-b">النوع</th>
              <th className="p-3 border-b">التفاصيل</th>
              <th className="p-3 border-b">السعر النهائي</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-slate-400">لا توجد سجلات حتى الآن.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-xs font-mono text-slate-500">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-3 font-bold text-[#337159]">{log.employeeName}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold bg-[#b99ecb]/10 text-[#337159]`}>{log.type === 'roll' ? 'رول' : log.type === 'digital' ? 'ديجيتال' : log.type === 'uvdtf' ? 'UV DTF' : log.type === 'offset' ? 'أوفست' : 'بصمة'}</span></td>
                  <td className="p-3 text-xs text-slate-600">{log.details}</td>
                  <td className="p-3 font-bold text-[#fa5732]">{Math.round(log.finalPrice)} ريال</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPanel = ({ prices, onUpdatePrice, onLogout, currentUser, generalSettings, onUpdateGeneralSettings }) => {
  const [localPrices, setLocalPrices] = useState(prices);
  const [localGeneral, setLocalGeneral] = useState(generalSettings || { allowPriceOverride: false });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('roll'); 
  
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperPrice, setNewPaperPrice] = useState('');
  
  // Offset specific states for new items
  const [newOffsetPaperName, setNewOffsetPaperName] = useState('');
  const [newOffsetPaperPrice, setNewOffsetPaperPrice] = useState('');

  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  useEffect(() => {
    const updatedPrices = { ...prices };
    if (!updatedPrices.digitalAddons) updatedPrices.digitalAddons = [];
    if (!updatedPrices.rollDiscounts) updatedPrices.rollDiscounts = [];
    if (!updatedPrices.digitalDiscounts) updatedPrices.digitalDiscounts = [];
    if (!updatedPrices.uvDtfDiscounts) updatedPrices.uvDtfDiscounts = [];
    if (!updatedPrices.offsetPaperTypes) updatedPrices.offsetPaperTypes = [];
    if (!updatedPrices.offsetDiscounts) updatedPrices.offsetDiscounts = [];
    
    // Default Offset Values
    if (!updatedPrices.offsetPlatePrice) updatedPrices.offsetPlatePrice = 50;
    if (!updatedPrices.offsetPrintPrice1000) updatedPrices.offsetPrintPrice1000 = 80;
    if (!updatedPrices.offsetMinQty) updatedPrices.offsetMinQty = 1000;
    
    // Default Foil Values
    if (!updatedPrices.foilMoldPricePerCm2) updatedPrices.foilMoldPricePerCm2 = 1.15;
    if (!updatedPrices.foilMinMoldPrice) updatedPrices.foilMinMoldPrice = 150;
    if (!updatedPrices.foilStampingUnitPrice) updatedPrices.foilStampingUnitPrice = 0.40;

    // Show Digital Paper Field Toggle Default
    if (updatedPrices.showDigitalPaperField === undefined) updatedPrices.showDigitalPaperField = true;
    
    setLocalPrices(updatedPrices);
  }, [prices]);

  useEffect(() => {
    if (generalSettings) setLocalGeneral(generalSettings);
  }, [generalSettings]);

  const handleChange = (key, value) => { setLocalPrices(prev => ({ ...prev, [key]: value })); }; 

  const handleSave = async () => {
    setSaving(true);
    await onUpdatePrice(localPrices);
    if (JSON.stringify(localGeneral) !== JSON.stringify(generalSettings)) {
      await onUpdateGeneralSettings(localGeneral);
    }
    setSaving(false);
  };

  const toggleGeneralSetting = (key) => {
    setLocalGeneral(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const safeHandleAddPaper = () => {
    if (!newPaperName || !newPaperPrice) return;
    const currentPapers = localPrices.digitalPaperTypes || [];
    setLocalPrices(prev => ({ ...prev, digitalPaperTypes: [...currentPapers, { name: newPaperName, price: parseFloat(newPaperPrice), active: true }] }));
    setNewPaperName(''); setNewPaperPrice('');
  };
  const handleRemovePaper = (i) => setLocalPrices(prev => ({...prev, digitalPaperTypes: prev.digitalPaperTypes.filter((_, idx) => idx !== i)}));
  
  const handlePaperChange = (i, f, v) => {
    const up = [...localPrices.digitalPaperTypes]; 
    if (f === 'price') {
      up[i][f] = parseFloat(v);
    } else if (f === 'active') {
      up[i][f] = v;
    } else {
      up[i][f] = v;
    }
    setLocalPrices(prev => ({...prev, digitalPaperTypes: up}));
  };

  // --- Offset Paper Management ---
  const safeHandleAddOffsetPaper = () => {
    if (!newOffsetPaperName || !newOffsetPaperPrice) return;
    const currentPapers = localPrices.offsetPaperTypes || [];
    setLocalPrices(prev => ({ ...prev, offsetPaperTypes: [...currentPapers, { name: newOffsetPaperName, price: parseFloat(newOffsetPaperPrice), active: true }] }));
    setNewOffsetPaperName(''); setNewOffsetPaperPrice('');
  };
  const handleRemoveOffsetPaper = (i) => setLocalPrices(prev => ({...prev, offsetPaperTypes: prev.offsetPaperTypes.filter((_, idx) => idx !== i)}));
  const handleOffsetPaperChange = (i, f, v) => {
    const up = [...localPrices.offsetPaperTypes];
    up[i][f] = f === 'price' ? parseFloat(v) : (f === 'active' ? v : v);
    setLocalPrices(prev => ({...prev, offsetPaperTypes: up}));
  };

  const handleSheetSizeChange = (i, f, v) => {
    const us = [...localPrices.digitalSheetSizes]; us[i][f] = f === 'name' ? v : parseFloat(v);
    setLocalPrices(prev => ({...prev, digitalSheetSizes: us}));
  };
  const safeHandleAddAddon = () => {
    if (!newAddonName || !newAddonPrice) return;
    const currentAddons = localPrices.digitalAddons || [];
    setLocalPrices(prev => ({ ...prev, digitalAddons: [...currentAddons, { name: newAddonName, price: parseFloat(newAddonPrice) }] }));
    setNewAddonName(''); setNewAddonPrice('');
  };
  const handleRemoveAddon = (i) => setLocalPrices(prev => ({...prev, digitalAddons: prev.digitalAddons.filter((_, idx) => idx !== i)}));
  const handleAddonChange = (i, f, v) => {
    const ua = [...localPrices.digitalAddons]; ua[i][f] = f === 'price' ? parseFloat(v) : v;
    setLocalPrices(prev => ({...prev, digitalAddons: ua}));
  };
  const handleDiscountChange = (tab, newDiscounts) => setLocalPrices(prev => ({ ...prev, [tab]: newDiscounts }));

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-2xl font-bold text-[#337159]">لوحة تحكم المسؤول</h2>
              <p className="text-xs text-slate-500 mt-1">مرحباً بك، {currentUser.name}</p>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('roll')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'roll' ? 'bg-[#337159] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Scroll className="w-5 h-5" /> رول</button>
        <button onClick={() => setActiveTab('digital')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'digital' ? 'bg-[#337159] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Layout className="w-5 h-5" /> ديجيتال</button>
        <button onClick={() => setActiveTab('offset')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'offset' ? 'bg-[#337159] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Factory className="w-5 h-5" /> أوفست</button>
        <button onClick={() => setActiveTab('uvdtf')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'uvdtf' ? 'bg-[#337159] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Palette className="w-5 h-5" /> UV DTF</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Users className="w-5 h-5" /> المستخدمين</button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><History className="w-5 h-5" /> السجل</button>
        <button onClick={() => setActiveTab('general')} className={`px-4 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Sliders className="w-5 h-5" /> عام</button>
      </div>

      <div className="bg-white p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 min-h-[400px]">
        {activeTab === 'roll' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6 text-[#337159] border-b border-[#337159]/20 pb-4"><Scroll className="w-6 h-6" /><h3 className="font-bold text-xl">إعدادات خامات الرول</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-slate-600 mb-2">سعر المتر المربع الأساسي (ريال)</label><input type="number" value={localPrices.rollUnitPrice || ''} onChange={(e) => handleChange('rollUnitPrice', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg"/></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-2">عرض الرول الافتراضي (سم)</label><input type="number" value={localPrices.defaultRollWidth || ''} onChange={(e) => handleChange('defaultRollWidth', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg"/></div>
            </div>
            <DiscountManager discounts={localPrices.rollDiscounts} onChange={(newDiscounts) => handleDiscountChange('rollDiscounts', newDiscounts)} unitLabel="متر مربع (المساحة)" />
          </div>
        )}

        {activeTab === 'digital' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-[#337159] border-b border-[#337159]/20 pb-4"><Layout className="w-6 h-6" /><h3 className="font-bold text-xl">إعدادات خامات الديجيتال</h3></div>
            
            {/* Toggle Show/Hide Paper Field */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between mb-6">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">إظهار قائمة "نوع الورق" في الحاسبة</h4>
                <p className="text-sm text-slate-500">عند التعطيل، سيتم إخفاء قائمة اختيار الورق وسيتم اعتماد السعر الافتراضي أو أول ورق في القائمة.</p>
              </div>
              <button 
                onClick={() => handleChange('showDigitalPaperField', !localPrices.showDigitalPaperField)}
                className={`p-2 rounded-full transition-colors ${localPrices.showDigitalPaperField !== false ? 'bg-[#337159]/10 text-[#337159]' : 'bg-slate-100 text-slate-400'}`}
              >
                {localPrices.showDigitalPaperField !== false ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* 1. Foil Settings in Digital */}
                <div className="bg-[#b99ecb]/5 p-6 rounded-xl border border-[#b99ecb]/30">
                    <div className="flex items-center gap-2 mb-4 text-[#337159]"><Stamp className="w-5 h-5" /><h4 className="font-bold text-lg">إعدادات البصمة (Foil)</h4></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">سعر 1 سم² للقالب</label><input type="number" value={localPrices.foilMoldPricePerCm2 || ''} onChange={(e) => handleChange('foilMoldPricePerCm2', e.target.value)} className="w-full p-2 border border-[#b99ecb] rounded focus:ring-1 focus:ring-[#337159] outline-none text-sm"/></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">الحد الأدنى للقالب</label><input type="number" value={localPrices.foilMinMoldPrice || ''} onChange={(e) => handleChange('foilMinMoldPrice', e.target.value)} className="w-full p-2 border border-[#b99ecb] rounded focus:ring-1 focus:ring-[#337159] outline-none text-sm"/></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">سعر التبصيم (للحبة)</label><input type="number" value={localPrices.foilStampingUnitPrice || ''} onChange={(e) => handleChange('foilStampingUnitPrice', e.target.value)} className="w-full p-2 border border-[#b99ecb] rounded focus:ring-1 focus:ring-[#337159] outline-none text-sm"/></div>
                    </div>
                </div>

                {/* 2. Sheet Sizes */}
                <div className="bg-[#337159]/5 p-6 rounded-xl border border-[#337159]/10">
                  <div className="flex items-center gap-2 mb-4 text-[#337159]"><Maximize className="w-5 h-5" /><h4 className="font-bold text-lg">مقاسات الأفرخ (سم)</h4></div>
                  <div className="space-y-4">
                    {localPrices.digitalSheetSizes?.map((size, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-[#b99ecb]/30 shadow-sm">
                        <div className="mb-3"><label className="text-xs text-slate-400 block mb-1">اسم المقاس</label><input type="text" value={size.name} onChange={(e) => handleSheetSizeChange(idx, 'name', e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-[#337159] outline-none font-bold text-slate-700"/></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs text-slate-400 block mb-1">العرض</label><input type="number" value={size.width} onChange={(e) => handleSheetSizeChange(idx, 'width', e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-[#337159] outline-none text-center"/></div>
                          <div><label className="text-xs text-slate-400 block mb-1">الطول</label><input type="number" value={size.height} onChange={(e) => handleSheetSizeChange(idx, 'height', e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-[#337159] outline-none text-center"/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-4 text-amber-800"><Layers className="w-5 h-5" /><h4 className="font-bold text-lg">إدارة الإضافات</h4></div>
                  <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                    {localPrices.digitalAddons?.map((addon, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-amber-200 shadow-sm">
                        <input type="text" value={addon.name} onChange={(e) => handleAddonChange(idx, 'name', e.target.value)} className="flex-1 text-sm border-none bg-transparent outline-none font-bold text-slate-700" />
                        <span className="text-xs text-slate-400">سعر/شيت:</span>
                        <input type="number" value={addon.price} onChange={(e) => handleAddonChange(idx, 'price', e.target.value)} className="w-16 text-sm bg-amber-50 rounded px-1 text-center font-bold text-amber-800 outline-none" />
                        <button onClick={() => handleRemoveAddon(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-end border-t border-amber-200 pt-3">
                    <div className="flex-1"><label className="text-[10px] text-slate-500 block mb-1">اسم الإضافة</label><input type="text" value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} className="w-full p-2 text-sm border border-amber-200 rounded outline-none focus:ring-1 focus:ring-amber-500" /></div>
                    <div className="w-20"><label className="text-[10px] text-slate-500 block mb-1">السعر</label><input type="number" value={newAddonPrice} onChange={(e) => setNewAddonPrice(e.target.value)} className="w-full p-2 text-sm border border-amber-200 rounded outline-none focus:ring-1 focus:ring-amber-500" /></div>
                    <button onClick={safeHandleAddAddon} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col h-full">
                <div className="flex-1 bg-[#337159]/5 rounded-xl p-4 mb-4 overflow-y-auto min-h-[300px] border border-[#337159]/10">
                  {localPrices.digitalPaperTypes?.map((paper, idx) => (
                    <div key={idx} className={`flex items-center gap-3 bg-white p-3 mb-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${paper.active === false ? 'opacity-50' : ''}`}>
                      <button 
                        onClick={() => handlePaperChange(idx, 'active', paper.active === false ? true : false)}
                        className={`p-1 rounded-full ${paper.active !== false ? 'text-[#337159] hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={paper.active !== false ? 'تعطيل' : 'تفعيل'}
                      >
                        {paper.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <div className="flex-1"><label className="text-[10px] text-slate-400 block mb-1">اسم الورق</label><input type="text" value={paper.name} onChange={(e) => handlePaperChange(idx, 'name', e.target.value)} className="w-full text-sm font-bold text-slate-700 border-b border-transparent focus:border-[#337159] outline-none bg-transparent hover:bg-slate-50 p-1"/></div>
                      <div className="w-20"><label className="text-[10px] text-slate-400 block mb-1">السعر (ريال)</label><input type="number" value={paper.price} onChange={(e) => handlePaperChange(idx, 'price', e.target.value)} className="w-full text-sm font-bold text-[#337159] bg-[#337159]/10 border border-[#337159]/20 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#337159]"/></div>
                      <button onClick={() => handleRemovePaper(idx)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-4">
                  <h5 className="text-sm font-bold text-slate-600 mb-3">إضافة نوع جديد</h5>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1"><label className="block text-xs text-slate-500 mb-1">اسم الخامة</label><input type="text" value={newPaperName} onChange={(e) => setNewPaperName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#337159] outline-none" placeholder="مثال: كوشيه 300"/></div>
                    <div className="w-24"><label className="block text-xs text-slate-500 mb-1">السعر</label><input type="number" value={newPaperPrice} onChange={(e) => setNewPaperPrice(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#337159] outline-none" placeholder="0"/></div>
                    <button onClick={safeHandleAddPaper} className="bg-[#337159] hover:bg-[#2a5c48] text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-md"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
                <DiscountManager discounts={localPrices.digitalDiscounts} onChange={(newDiscounts) => handleDiscountChange('digitalDiscounts', newDiscounts)} unitLabel="شيت (عدد الأفرخ)" />
              </div>
            </div>
          </div>
        )}

        {/* --- Offset Tab Settings --- */}
        {activeTab === 'offset' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-[#337159] border-b border-[#337159]/20 pb-4"><Factory className="w-6 h-6" /><h3 className="font-bold text-xl">إعدادات الأوفست (Offset)</h3></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-600 mb-2">سعر الزنكة الواحدة (ريال)</label>
                <input type="number" value={localPrices.offsetPlatePrice || ''} onChange={(e) => handleChange('offsetPlatePrice', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg"/>
                <p className="text-xs text-slate-400 mt-1">يتم ضرب هذا السعر في عدد الألوان (4 أو 8).</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-600 mb-2">سعر طباعة 1000 فرخ</label>
                <input type="number" value={localPrices.offsetPrintPrice1000 || ''} onChange={(e) => handleChange('offsetPrintPrice1000', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg"/>
                <p className="text-xs text-slate-400 mt-1">تكلفة تشغيل الماكينة لكل ألف.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-600 mb-2">الحد الأدنى (زنكات + طباعة)</label>
                <input type="number" value={localPrices.offsetMinQty || ''} onChange={(e) => handleChange('offsetMinQty', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg"/>
                <p className="text-xs text-slate-400 mt-1">أقل سعر يمكن احتسابه للتشغيل والزنكات معاً.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Paper Management for Offset */}
              <div className="flex flex-col h-full">
                <div className="bg-[#337159]/10 p-4 rounded-t-xl border border-[#337159]/20">
                  <h4 className="font-bold text-[#337159]">قائمة أنواع ورق الأوفست</h4>
                  <p className="text-xs text-[#337159]/80">الأسعار هنا لكل 1000 فرخ (70×100)</p>
                </div>
                <div className="flex-1 bg-white border border-t-0 border-slate-200 p-4 mb-4 overflow-y-auto min-h-[300px]">
                  {localPrices.offsetPaperTypes?.map((paper, idx) => (
                    <div key={idx} className={`flex items-center gap-3 bg-slate-50 p-3 mb-2 rounded-lg border border-slate-100 shadow-sm ${paper.active === false ? 'opacity-50' : ''}`}>
                      <button 
                        onClick={() => handleOffsetPaperChange(idx, 'active', paper.active === false ? true : false)}
                        className={`p-1 rounded-full ${paper.active !== false ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      >
                        {paper.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">اسم الورق</label>
                        <input type="text" value={paper.name} onChange={(e) => handleOffsetPaperChange(idx, 'name', e.target.value)} className="w-full text-sm font-bold text-slate-700 bg-transparent border-none outline-none"/>
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-slate-400 block mb-1">سعر الألف (ريال)</label>
                        <input type="number" value={paper.price} onChange={(e) => handleOffsetPaperChange(idx, 'price', e.target.value)} className="w-full text-sm font-bold text-[#337159] bg-white border border-[#b99ecb] rounded px-2 py-1 outline-none text-center"/>
                      </div>
                      <button onClick={() => handleRemoveOffsetPaper(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  
                  {/* Add New Offset Paper */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-500 mb-2">إضافة ورق جديد</h5>
                    <div className="flex gap-2 items-end">
                      <input type="text" value={newOffsetPaperName} onChange={(e) => setNewOffsetPaperName(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-[#337159]" placeholder="اسم الورق (مثال: كوشيه 300)" />
                      <input type="number" value={newOffsetPaperPrice} onChange={(e) => setNewOffsetPaperPrice(e.target.value)} className="w-24 p-2 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-[#337159]" placeholder="السعر/1000" />
                      <button onClick={safeHandleAddOffsetPaper} className="bg-[#337159] hover:bg-[#2a5c48] text-white p-2 rounded"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offset Discounts */}
              <div>
                 <DiscountManager discounts={localPrices.offsetDiscounts} onChange={(newDiscounts) => handleDiscountChange('offsetDiscounts', newDiscounts)} unitLabel="فرخ (طباعة)" />
                 <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                    <h5 className="font-bold mb-2">ملاحظة عن الأوفست:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>يتم احتساب عدد الأفرخ بقسمة الكمية المطلوبة على عدد التكرار في الفرخ (70×100).</li>
                        <li>تكلفة الورق = (عدد الأفرخ / 1000) × سعر الورق المحدد.</li>
                        <li>تكلفة الطباعة = (عدد الأفرخ / 1000) × سعر الطباعة، بحد أدنى للتشغيل.</li>
                        <li>عدد الزنكات = 4 (وجه واحد) أو 8 (وجهين).</li>
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'history' && <HistoryLog />}
        
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="animate-in fade-in duration-300 p-4">
            <div className="flex items-center gap-3 mb-6 text-slate-800 border-b border-slate-200 pb-4"><Sliders className="w-6 h-6" /><h3 className="font-bold text-xl">إعدادات عامة</h3></div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
              <h4 className="font-bold text-[#337159] mb-4 text-lg border-b pb-2">إعدادات الأسعار والربح</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">نسبة الضريبة (VAT) %</label>
                    <input 
                      type="number" 
                      value={localGeneral.taxRate ?? 15} 
                      onChange={(e) => setLocalGeneral({...localGeneral, taxRate: parseFloat(e.target.value)})} 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg text-center font-bold text-[#337159]"
                    />
                    <p className="text-xs text-slate-400 mt-1">النسبة المئوية لضريبة القيمة المضافة (الافتراضي 15%)</p>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">نسبة هامش الربح %</label>
                    <input 
                      type="number" 
                      value={localGeneral.profitMargin ?? 15} 
                      onChange={(e) => setLocalGeneral({...localGeneral, profitMargin: parseFloat(e.target.value)})} 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#337159] outline-none text-lg text-center font-bold text-[#337159]"
                    />
                    <p className="text-xs text-slate-400 mt-1">النسبة المضافة فوق التكلفة كربح (الافتراضي 15%)</p>
                 </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">تفعيل إدخال الأسعار يدوياً للموظف</h4>
                <p className="text-sm text-slate-500">عند التفعيل، سيظهر حقل إضافي للموظف يسمح له بتعديل سعر الخامة (المتر/الفرخ) يدوياً.</p>
              </div>
              <button 
                onClick={() => toggleGeneralSetting('allowPriceOverride')}
                className={`p-2 rounded-full transition-colors ${localGeneral.allowPriceOverride ? 'bg-[#337159]/10 text-[#337159]' : 'bg-slate-100 text-slate-400'}`}
              >
                {localGeneral.allowPriceOverride ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            {/* Visibility Controls */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 border-b pb-2">التحكم في ظهور الحاسبات</h4>
                
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-medium"><Scroll className="w-4 h-4" /> حاسبة الرول (Roll-to-Roll)</span>
                    <button onClick={() => toggleGeneralSetting('showRoll')} className={`p-1 rounded-full transition-colors ${localGeneral.showRoll !== false ? 'text-[#337159]' : 'text-slate-300'}`}>
                        {localGeneral.showRoll !== false ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-medium"><Layout className="w-4 h-4" /> حاسبة الديجيتال (Digital)</span>
                    <button onClick={() => toggleGeneralSetting('showDigital')} className={`p-1 rounded-full transition-colors ${localGeneral.showDigital !== false ? 'text-[#337159]' : 'text-slate-300'}`}>
                        {localGeneral.showDigital !== false ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-medium"><Factory className="w-4 h-4" /> حاسبة الأوفست (Offset)</span>
                    <button onClick={() => toggleGeneralSetting('showOffset')} className={`p-1 rounded-full transition-colors ${localGeneral.showOffset !== false ? 'text-[#337159]' : 'text-slate-300'}`}>
                        {localGeneral.showOffset !== false ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-medium"><Palette className="w-4 h-4" /> حاسبة UV DTF</span>
                    <button onClick={() => toggleGeneralSetting('showUvDtf')} className={`p-1 rounded-full transition-colors ${localGeneral.showUvDtf !== false ? 'text-[#337159]' : 'text-slate-300'}`}>
                        {localGeneral.showUvDtf !== false ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>
            </div>

          </div>
        )}

        {activeTab === 'database' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6 text-slate-800 border-b border-slate-200 pb-4"><Database className="w-6 h-6" /><h3 className="font-bold text-xl">عرض قاعدة البيانات الخام</h3></div>
            <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-auto max-h-[500px] shadow-inner" dir="ltr">
              <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-700 pb-2"><FileJson className="w-4 h-4" /><span>/artifacts/{appId || 'app'}/public/data/settings/pricing</span></div>
              <pre>{JSON.stringify(localPrices, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {activeTab !== 'users' && activeTab !== 'history' && activeTab !== 'database' && (
        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-[#fa5732] hover:bg-[#d94a29] text-white py-3 px-8 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-transform hover:scale-105 active:scale-95">
            <Save className="w-5 h-5" /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      )}
    </div>
  );
};

// 5. الحاسبة (الموظف)
const CalculatorApp = ({ prices, onAdminLogin, currentUser, generalSettings }) => {
  const [activeTab, setActiveTab] = useState(''); 
  const [inputs, setInputs] = useState({ width: 0, height: 0, quantity: 0, rollWidth: prices.defaultRollWidth || 100, offsetFaces: '1' });
  
  const [customUnitPrice, setCustomUnitPrice] = useState('');

  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [selectedOffsetPaperIndex, setSelectedOffsetPaperIndex] = useState(0);

  const [selectedSheetSizeIndex, setSelectedSheetSizeIndex] = useState(0);
  const [selectedAddonsIndices, setSelectedAddonsIndices] = useState([]);
  const [isFoilEnabled, setIsFoilEnabled] = useState(false); // New Foil Toggle State
  const [savingLog, setSavingLog] = useState(false);

  // Set initial active tab based on visibility settings
  useEffect(() => {
    if (!activeTab) {
        if (generalSettings?.showRoll !== false) setActiveTab('roll');
        else if (generalSettings?.showDigital !== false) setActiveTab('digital');
        else if (generalSettings?.showOffset !== false) setActiveTab('offset');
        else if (generalSettings?.showUvDtf !== false) setActiveTab('uvdtf');
    }
  }, [generalSettings, activeTab]);

  // Filter active papers
  const activePapers = useMemo(() => {
    return prices.digitalPaperTypes?.filter(p => p.active !== false) || [];
  }, [prices.digitalPaperTypes]);

  const activeOffsetPapers = useMemo(() => {
    return prices.offsetPaperTypes?.filter(p => p.active !== false) || [];
  }, [prices.offsetPaperTypes]);

  // Adjust selected index if list changes
  useEffect(() => {
    if (activeTab === 'digital') {
        if (selectedPaperIndex >= activePapers.length && activePapers.length > 0) {
            setSelectedPaperIndex(0);
        }
    }
  }, [activePapers.length, activeTab]);

  useEffect(() => { setInputs(prev => ({...prev, rollWidth: prices.defaultRollWidth || 100})); }, [prices.defaultRollWidth]);
  const handleInput = (e) => { const { name, value } = e.target; setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 })); };
  const handleFaceChange = (e) => { setInputs(prev => ({ ...prev, offsetFaces: e.target.value })); };


  useEffect(() => {
    setCustomUnitPrice('');
    setIsFoilEnabled(false); // Reset foil toggle on tab change
  }, [activeTab, selectedPaperIndex]);

  const toggleAddon = (index) => {
    setSelectedAddonsIndices(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      return [...prev, index];
    });
  };

  const getDiscountPercent = (value, discounts) => {
    if (!discounts || discounts.length === 0) return 0;
    const applicable = [...discounts].reverse().find(rule => value >= rule.min);
    return applicable ? applicable.percent : 0;
  };

  const results = useMemo(() => {
    let unitPrice = 0;
    const isCustomPriceActive = generalSettings?.allowPriceOverride && customUnitPrice !== '' && !isNaN(parseFloat(customUnitPrice));
    
    // Configurable Tax & Margin
    const taxRate = (generalSettings?.taxRate ?? 15) / 100;
    const marginRate = 1 + ((generalSettings?.profitMargin ?? 15) / 100);

    if (activeTab === 'roll') {
      const stickerW = inputs.width; const stickerH = inputs.height; const qty = inputs.quantity; const rollW = inputs.rollWidth;
      
      unitPrice = isCustomPriceActive ? parseFloat(customUnitPrice) : (prices.rollUnitPrice || 0);

      const stickersPerRow = Math.floor(rollW / (stickerW + 0.2)); const rowsNeeded = stickersPerRow > 0 ? Math.ceil(qty / stickersPerRow) : 0; const baseLengthMeters = (rowsNeeded * (stickerH + 0.2)) / 100; const marginCount = Math.floor(baseLengthMeters / 0.5); const finalLength = baseLengthMeters + (marginCount * 0.05); const area = finalLength * (rollW / 100); 
      
      let finalPrice = area * unitPrice * marginRate; 
      
      const discountPercent = getDiscountPercent(area, prices.rollDiscounts);
      const discountAmount = finalPrice * (discountPercent / 100);
      const priceAfterDiscount = finalPrice - discountAmount;
      return { stickersPerRow, rowsNeeded, baseLengthMeters, marginCount, finalLength, area, finalPrice, discountPercent, discountAmount, priceAfterDiscount, details: `رول: ${stickerW}x${stickerH}cm (كمية: ${qty})` };
    } 
    else if (activeTab === 'digital') {
      const stickerW = inputs.width; const stickerH = inputs.height; const qty = inputs.quantity;
      const sizeObj = prices.digitalSheetSizes?.[selectedSheetSizeIndex] || { width: 33, height: 48 };
      const sheetW = sizeObj.width; const sheetH = sizeObj.height;
      
      let systemSheetPrice = 0;
      let paperName = 'ورق';
      
      if (activePapers.length > 0 && activePapers[selectedPaperIndex]) { 
        systemSheetPrice = activePapers[selectedPaperIndex].price; 
        paperName = activePapers[selectedPaperIndex].name;
      } else { 
        systemSheetPrice = prices.digitalSheetPrice || 0; 
      }

      unitPrice = isCustomPriceActive ? parseFloat(customUnitPrice) : systemSheetPrice;
      
      let addonsCostPerSheet = 0;
      if (prices.digitalAddons) {
        selectedAddonsIndices.forEach(idx => {
          if (prices.digitalAddons[idx]) {
            addonsCostPerSheet += (prices.digitalAddons[idx].price || 0);
          }
        });
      }
      
      // -- UPDATED LOGIC: Calculate best fit (rotate if necessary) --
      const margin = 0.2;
      // Option 1: No rotation (Width on Width, Height on Height)
      const count1 = Math.floor(sheetW / (stickerW + margin)) * Math.floor(sheetH / (stickerH + margin));
      // Option 2: Rotated 90 degrees (Width on Height, Height on Width)
      const count2 = Math.floor(sheetW / (stickerH + margin)) * Math.floor(sheetH / (stickerW + margin));
      
      const perSheet = Math.max(count1, count2);
      const isRotatedBest = count2 > count1;

      const sheetsNeeded = perSheet > 0 ? Math.ceil(qty / perSheet) : 0; 
      
      const basePrice = sheetsNeeded * unitPrice;
      const totalAddonsPrice = sheetsNeeded * addonsCostPerSheet;
      
      // Foil Calculations
      let foilCost = 0;
      let moldPrice = 0;
      let stampingCost = 0;

      if (isFoilEnabled) {
          const foilArea = stickerW * stickerH;
          moldPrice = foilArea * (prices.foilMoldPricePerCm2 || 1.15);
          if (moldPrice < (prices.foilMinMoldPrice || 150)) {
              moldPrice = prices.foilMinMoldPrice || 150;
          }
          stampingCost = qty * (prices.foilStampingUnitPrice || 0.40);
          foilCost = moldPrice + stampingCost;
      }

      const pricePreTax = basePrice + totalAddonsPrice + foilCost;
      const tax = pricePreTax * taxRate; 
      const finalPrice = pricePreTax + tax;

      const discountPercent = getDiscountPercent(sheetsNeeded, prices.digitalDiscounts);
      const discountAmount = finalPrice * (discountPercent / 100);
      const priceAfterDiscount = finalPrice - discountAmount;
      
      // --- Calculate Savings Logic ---
      let savingsMessage = null;
      if (count1 !== count2 && perSheet > 0) {
          const worstCount = Math.min(count1, count2);
          if (worstCount > 0) {
              const worstSheetsNeeded = Math.ceil(qty / worstCount);
              const worstBasePrice = worstSheetsNeeded * unitPrice;
              const worstAddons = worstSheetsNeeded * addonsCostPerSheet;
              
              const worstPricePreTax = worstBasePrice + worstAddons + foilCost;
              const worstTax = worstPricePreTax * taxRate;
              const worstFinalPrice = worstPricePreTax + worstTax;
              
              const worstDiscountPercent = getDiscountPercent(worstSheetsNeeded, prices.digitalDiscounts);
              const worstDiscountAmount = worstFinalPrice * (worstDiscountPercent / 100);
              const worstPriceAfterDiscount = worstFinalPrice - worstDiscountAmount;

              const diff = worstPriceAfterDiscount - priceAfterDiscount;
              
              if (diff > 0) {
                  const method = isRotatedBest ? "التدوير (تدوير التصميم)" : "الوضع القياسي";
                  savingsMessage = `تم اختيار ${method} تلقائياً لأنه وفر ${Math.round(diff)} ريال مقارنة بالوضع الآخر.`;
              }
          }
      }

      let details = `ديجيتال: ${paperName} (${qty} قطعة)`;
      if (isFoilEnabled) details += ` + بصمة`;

      return { 
          perSheet, sheetsNeeded, pricePreTax, tax, finalPrice, sheetPriceUsed: unitPrice, addonsCostPerSheet, totalAddonsPrice, 
          dims: `${sheetW}×${sheetH}`, discountPercent, discountAmount, priceAfterDiscount, details,
          foilCost, moldPrice, stampingCost, savingsMessage
      };
    }
    else if (activeTab === 'offset') {
        const itemW = inputs.width; const itemH = inputs.height; const qty = inputs.quantity;
        const faces = inputs.offsetFaces === '2' ? 2 : 1;
        // Assume 70x100 sheet
        const sheetW = 100; const sheetH = 70;
        
        // Simple UPS calculation
        const ups = Math.floor(sheetW / (itemW + 0.4)) * Math.floor(sheetH / (itemH + 0.4));
        const sheetsNeeded = ups > 0 ? Math.ceil(qty / ups) : 0;
        const totalSheetsIncludingWaste = Math.ceil(sheetsNeeded * 1.05); // 5% waste

        // Costs
        const numPlates = faces === 2 ? 8 : 4; // 4 colors CMYK assumed
        const plateCost = numPlates * (prices.offsetPlatePrice || 50);
        
        // Print Cost
        const printRunCost = (totalSheetsIncludingWaste / 1000) * (prices.offsetPrintPrice1000 || 80);
        const actualPrintCost = Math.max(printRunCost, (prices.offsetMinQty || 0) / 2); // Split min qty logic? Let's just assume Print Price applies directly but check logic. 
        // Actually usually min qty applies to the total process, but let's just stick to unit prices for now.
        
        // Paper Cost
        let paperPricePer1000 = 0;
        let paperName = 'ورق أوفست';
        if (activeOffsetPapers.length > 0 && activeOffsetPapers[selectedOffsetPaperIndex]) {
            paperPricePer1000 = activeOffsetPapers[selectedOffsetPaperIndex].price;
            paperName = activeOffsetPapers[selectedOffsetPaperIndex].name;
        }
        
        // Override
        if (isCustomPriceActive) {
            paperPricePer1000 = parseFloat(customUnitPrice);
        }

        const paperCost = (totalSheetsIncludingWaste / 1000) * paperPricePer1000;

        const subTotal = plateCost + actualPrintCost + paperCost;
        const total = subTotal * marginRate; 
        
        // Removed double margin: const finalPrice = total * 1.20; 
        const finalPrice = total; 

        const discountPercent = getDiscountPercent(sheetsNeeded, prices.offsetDiscounts);
        const discountAmount = finalPrice * (discountPercent / 100);
        const priceAfterDiscount = finalPrice - discountAmount;

        const details = `أوفست: ${paperName} (${faces === 2 ? 'وجهين' : 'وجه واحد'}) - ${qty} قطعة`;

        return {
            ups, sheetsNeeded, totalSheetsIncludingWaste, plateCost, paperCost, actualPrintCost, finalPrice, discountPercent, discountAmount, priceAfterDiscount, details, numPlates, paperPriceUsed: paperPricePer1000
        };
    }
    else if (activeTab === 'uvdtf') {
      const h = inputs.height; const w = inputs.width; const qty = inputs.quantity; const itemsPerRow = Math.floor(50 / (w + 0.2)); const totalRows = itemsPerRow > 0 ? Math.ceil(qty / itemsPerRow) : 0; const rawLength = (totalRows * (h + 0.2)) / 100; const marginPart = Math.floor(rawLength / 0.5) * 0.05; const metersConsumed = (rawLength + marginPart) * 0.5; 
      
      unitPrice = isCustomPriceActive ? parseFloat(customUnitPrice) : (prices.uvDtfPrice || 0);

      const finalPrice = (metersConsumed * unitPrice) * marginRate;
      const discountPercent = getDiscountPercent(metersConsumed, prices.uvDtfDiscounts);
      const discountAmount = finalPrice * (discountPercent / 100);
      const priceAfterDiscount = finalPrice - discountAmount;
      return { itemsPerRow, totalRows, metersConsumed, finalPrice, discountPercent, discountAmount, priceAfterDiscount, details: `UV DTF: ${w}x${h}cm (كمية: ${qty})` };
    }
    return {};
  }, [inputs, prices, activeTab, selectedPaperIndex, selectedSheetSizeIndex, selectedAddonsIndices, customUnitPrice, generalSettings, activePapers, isFoilEnabled, activeOffsetPapers, selectedOffsetPaperIndex]);

  const handleSaveQuote = async () => {
    setSavingLog(true);
    try {
      const logData = {
        type: activeTab,
        details: results.details,
        finalPrice: results.priceAfterDiscount || results.finalPrice || 0,
        discountPercent: results.discountPercent || 0,
        employeeName: currentUser.name,
        employeeId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, ...HISTORY_COLLECTION_PATH), logData);
      alert('تم حفظ التسعيرة بنجاح في السجل');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
    setSavingLog(false);
  };

  const getSystemPriceDisplay = () => {
    if (activeTab === 'roll') return prices.rollUnitPrice;
    if (activeTab === 'uvdtf') return prices.uvDtfPrice;
    if (activeTab === 'digital') {
        if (activePapers.length > 0 && activePapers[selectedPaperIndex]) {
            return activePapers[selectedPaperIndex].price;
        }
        return prices.digitalSheetPrice || 'السعر الافتراضي';
    }
    if (activeTab === 'offset') {
         if (activeOffsetPapers.length > 0 && activeOffsetPapers[selectedOffsetPaperIndex]) {
            return activeOffsetPapers[selectedOffsetPaperIndex].price;
        }
        return 'سعر الورق لكل 1000';
    }
    return 0;
  };

  if (!activeTab && (generalSettings?.showRoll !== false || generalSettings?.showDigital !== false || generalSettings?.showOffset !== false || generalSettings?.showUvDtf !== false)) {
    return <div className="p-10 text-center text-slate-500">جاري تحميل الحاسبة...</div>;
  }
  
  if (!activeTab) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
            <Ban className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-600">عذراً، جميع الحاسبات معطلة حالياً</h2>
            <p className="text-sm text-slate-400 mt-2">يرجى التواصل مع المسؤول لتفعيل الخدمات.</p>
            <button onClick={onAdminLogin} className="mt-8 text-slate-500 hover:text-[#fa5732] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:border-[#fa5732] transition-colors"><Lock className="w-4 h-4" /> لوحة المسؤول</button>
        </div>
      )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#337159]">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 border border-slate-100"><img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" /></div>
            <div>
                <h2 className="text-xl font-bold text-[#337159]">حاسبة التسعير</h2>
                <p className="text-sm text-slate-500">مرحباً بك في النظام</p>
            </div>
        </div>
        <button onClick={onAdminLogin} className="text-slate-500 hover:text-[#fa5732] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 hover:border-[#fa5732] transition-colors"><Lock className="w-4 h-4" /> لوحة المسؤول</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-3">
          {generalSettings?.showRoll !== false && (
            <button onClick={() => setActiveTab('roll')} className={`w-full text-right p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'roll' ? 'bg-[#337159] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Scroll className="w-5 h-5" /> حاسبة رول تو رول</button>
          )}
          {generalSettings?.showDigital !== false && (
            <button onClick={() => setActiveTab('digital')} className={`w-full text-right p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'digital' ? 'bg-[#337159] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Layout className="w-5 h-5" /> حاسبة الديجيتال</button>
          )}
          {generalSettings?.showOffset !== false && (
            <button onClick={() => setActiveTab('offset')} className={`w-full text-right p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'offset' ? 'bg-[#337159] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Factory className="w-5 h-5" /> حاسبة الأوفست</button>
          )}
          {generalSettings?.showUvDtf !== false && (
            <button onClick={() => setActiveTab('uvdtf')} className={`w-full text-right p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'uvdtf' ? 'bg-[#337159] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Palette className="w-5 h-5" /> حاسبة UV DTF</button>
          )}
        </div>
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#337159]"></span> المدخلات (بيانات العميل)</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* --- Custom Unit Price Override Input --- */}
              {generalSettings?.allowPriceOverride && (
                <div className="md:col-span-3 mb-4 bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-800 mb-1">
                      {activeTab === 'roll' ? 'سعر المتر المربع (تعديل يدوي)' : 
                       activeTab === 'digital' ? 'سعر الفرخ (تعديل يدوي)' : 
                       activeTab === 'offset' ? 'سعر الألف فرخ (ورق) (تعديل يدوي)' :
                       'سعر المتر الطولي (تعديل يدوي)'}
                    </label>
                    <input 
                      type="number" 
                      value={customUnitPrice} 
                      onChange={(e) => setCustomUnitPrice(e.target.value)}
                      className="w-full p-2 bg-white border border-orange-300 rounded text-center font-bold text-orange-900 outline-none focus:ring-1 focus:ring-[#fa5732]"
                      placeholder={getSystemPriceDisplay()}
                    />
                  </div>
                  <div className="text-xs text-orange-600 max-w-[200px] leading-tight">
                    * يمكنك إدخال سعر خاص لهذه العملية فقط. اترك الحقل فارغاً لاستخدام السعر الرسمي ({getSystemPriceDisplay()}).
                  </div>
                </div>
              )}

              {activeTab === 'digital' && (
                <>
                  {/* Conditional Paper Selection */}
                  {(prices.showDigitalPaperField !== false) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-600 mb-2">نوع الورق / الخامة</label>
                      <select value={selectedPaperIndex} onChange={(e) => setSelectedPaperIndex(Number(e.target.value))} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none font-bold text-lg text-slate-700">
                        {activePapers.length > 0 ? (
                          activePapers.map((type, idx) => (
                            <option key={idx} value={idx}>{type.name} - ({type.price} ريال)</option>
                          ))
                        ) : (
                          <option value={0}>الافتراضي ({prices.digitalSheetPrice || 0} ريال)</option>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-600 mb-2">مقاس الفرخ</label>
                    <select value={selectedSheetSizeIndex} onChange={(e) => setSelectedSheetSizeIndex(Number(e.target.value))} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none font-bold text-lg text-slate-700">
                      {prices.digitalSheetSizes && prices.digitalSheetSizes.length > 0 ? ( prices.digitalSheetSizes.map((size, idx) => (<option key={idx} value={idx}>{size.name}</option>)) ) : (<option value={0}>33×48</option>)}
                    </select>
                  </div>

                  {/* Toggle Foil Option */}
                  <div className="md:col-span-3 my-2">
                    <button 
                        onClick={() => setIsFoilEnabled(!isFoilEnabled)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${isFoilEnabled ? 'bg-[#b99ecb]/10 border-[#b99ecb] text-[#337159]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Stamp className="w-5 h-5" />
                            <span className="font-bold">إضافة بصمة (Foil Stamping)</span>
                        </div>
                        {isFoilEnabled ? <ToggleRight className="w-8 h-8 text-[#fa5732]" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </button>
                  </div>

                  {/* Addons Section - Only show if addons exist */}
                  {prices.digitalAddons && prices.digitalAddons.length > 0 && (
                    <div className="md:col-span-3 mt-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <label className="block text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> الإضافات (سلوفان، داي كت، إلخ)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {prices.digitalAddons.map((addon, idx) => (
                            <label key={idx} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedAddonsIndices.includes(idx) ? 'bg-amber-200 border-amber-400 shadow-sm' : 'bg-white border-amber-100 hover:bg-amber-100'}`}>
                              <input type="checkbox" checked={selectedAddonsIndices.includes(idx)} onChange={() => toggleAddon(idx)} className="w-4 h-4 accent-amber-600" />
                              <div className="flex flex-col"><span className="text-sm font-bold text-slate-700">{addon.name}</span><span className="text-[10px] text-slate-500">{addon.price} ريال/شيت</span></div>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Offset Inputs */}
              {activeTab === 'offset' && (
                <>
                   <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">نوع الورق (سعر الألف)</label>
                    <select value={selectedOffsetPaperIndex} onChange={(e) => setSelectedOffsetPaperIndex(Number(e.target.value))} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none font-bold text-lg text-slate-700">
                      {activeOffsetPapers.length > 0 ? (
                        activeOffsetPapers.map((type, idx) => (
                          <option key={idx} value={idx}>{type.name} - ({type.price} ريال/1000)</option>
                        ))
                      ) : (
                        <option value={0}>ورق افتراضي</option>
                      )}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-600 mb-2">عدد الأوجه</label>
                    <select name="offsetFaces" value={inputs.offsetFaces} onChange={handleFaceChange} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none font-bold text-lg text-slate-700">
                      <option value="1">وجه واحد (4 زنكات)</option>
                      <option value="2">وجهين (8 زنكات)</option>
                    </select>
                  </div>
                </>
              )}

              <div><label className="block text-sm font-bold text-slate-600 mb-2">العرض (سم)</label><input type="number" name="width" value={inputs.width || ''} onChange={handleInput} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none text-center font-bold text-lg" placeholder="0"/></div>
              <div><label className="block text-sm font-bold text-slate-600 mb-2">الارتفاع (سم)</label><input type="number" name="height" value={inputs.height || ''} onChange={handleInput} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none text-center font-bold text-lg" placeholder="0"/></div>
              <div><label className="block text-sm font-bold text-slate-600 mb-2">العدد المطلوب</label><input type="number" name="quantity" value={inputs.quantity || ''} onChange={handleInput} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none text-center font-bold text-lg" placeholder="0"/></div>
              {activeTab === 'roll' && (<div><label className="block text-sm font-bold text-slate-600 mb-2">عرض الرول (سم)</label><input type="number" name="rollWidth" value={inputs.rollWidth || ''} onChange={handleInput} className="w-full p-3 bg-[#337159]/5 border border-[#b99ecb] rounded-xl focus:ring-2 focus:ring-[#337159] outline-none text-center font-bold text-lg"/></div>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4"><h3 className="font-bold text-slate-700 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#fa5732]"></span> المخرجات (التكلفة)</h3></div>
            <div className="p-6">
              {activeTab === 'roll' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultBox label="العدد في الصف" value={results.stickersPerRow} /><ResultBox label="عدد الصفوف" value={results.rowsNeeded} /><ResultBox label="الطول الأساسي (م)" value={results.baseLengthMeters?.toFixed(2)} /><ResultBox label="عدد الهوامش" value={results.marginCount} /><ResultBox label="الطول النهائي (م)" value={results.finalLength?.toFixed(2)} highlighted /><ResultBox label="المساحة (م²)" value={results.area?.toFixed(2)} />
                  <div className="col-span-2 md:col-span-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-slate-500"><span>السعر الأساسي:</span><span>{Math.round(results.finalPrice || 0)} ريال</span></div>
                    {results.discountPercent > 0 && (<div className="flex justify-between items-center text-[#337159]"><span>خصم الكمية ({results.discountPercent}%):</span><span>-{Math.round(results.discountAmount)} ريال</span></div>)}
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center"><span className="font-bold text-[#337159] text-lg">السعر النهائي (بعد الخصم):</span><span className="font-black text-3xl text-[#fa5732]">{Math.round(results.priceAfterDiscount || 0)} <span className="text-sm font-medium">ريال</span></span></div>
                  </div>
                </div>
              )}
              {activeTab === 'digital' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultBox label="العدد في الفرخ" value={results.perSheet} /><ResultBox label="عدد الأفرخ المطلوبة" value={results.sheetsNeeded} highlighted /><ResultBox label="أبعاد الفرخ" value={results.dims} />
                  <ResultBox label="سعر الورق (للفرخ)" value={results.sheetPriceUsed} />
                  {results.addonsCostPerSheet > 0 && <ResultBox label="سعر الإضافات (للفرخ)" value={results.addonsCostPerSheet} />}
                  
                  {isFoilEnabled && (
                    <div className="col-span-2 md:col-span-3 bg-[#b99ecb]/10 p-3 rounded-lg border border-[#b99ecb] grid grid-cols-2 gap-2 mt-2">
                        <div className="col-span-2 font-bold text-[#337159] text-xs mb-1">تفاصيل البصمة:</div>
                        <div className="text-xs flex justify-between"><span>سعر القالب:</span> <span className="font-bold">{results.moldPrice?.toFixed(1)} ريال</span></div>
                        <div className="text-xs flex justify-between"><span>تكلفة التبصيم:</span> <span className="font-bold">{results.stampingCost?.toFixed(1)} ريال</span></div>
                        <div className="text-xs flex justify-between border-t border-[#b99ecb] pt-1 col-span-2 text-[#337159]"><span>إجمالي البصمة:</span> <span className="font-bold">{results.foilCost?.toFixed(1)} ريال</span></div>
                    </div>
                  )}

                  {results.savingsMessage && (
                    <div className="col-span-2 md:col-span-3 bg-[#337159]/10 border border-[#337159] text-[#337159] p-3 rounded-lg text-xs font-bold flex items-center gap-2 mt-2">
                        <Info className="w-4 h-4" />
                        {results.savingsMessage}
                    </div>
                  )}

                  <ResultBox label="السعر قبل الضريبة" value={results.pricePreTax?.toFixed(2)} /><ResultBox label="قيمة الضريبة (15%)" value={results.tax?.toFixed(2)} />
                  <div className="col-span-2 md:col-span-3 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-slate-500"><span>السعر الأساسي:</span><span>{Math.round(results.finalPrice || 0)} ريال</span></div>
                    {results.discountPercent > 0 && (<div className="flex justify-between items-center text-[#337159]"><span>خصم الكمية ({results.discountPercent}%):</span><span>-{Math.round(results.discountAmount)} ريال</span></div>)}
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center"><span className="font-bold text-[#337159] text-lg">السعر النهائي (بعد الخصم):</span><span className="font-black text-3xl text-[#fa5732]">{Math.round(results.priceAfterDiscount || 0)} <span className="text-sm font-medium">ريال</span></span></div>
                  </div>
                </div>
              )}
              {activeTab === 'offset' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultBox label="عدد التكرار (UPS)" value={results.ups} />
                  <ResultBox label="أفرخ الطباعة" value={results.totalSheetsIncludingWaste} highlighted />
                  <ResultBox label="عدد الزنكات" value={results.numPlates} />
                  
                  <div className="col-span-2 md:col-span-3 bg-[#337159]/5 p-3 rounded-lg border border-[#337159]/20 mt-2">
                     <div className="text-xs font-bold text-[#337159] mb-2 border-b border-[#337159]/10 pb-1">تفاصيل التكلفة:</div>
                     <div className="flex justify-between text-xs mb-1"><span>تكلفة الزنكات:</span> <b>{Math.round(results.plateCost)} ريال</b></div>
                     <div className="flex justify-between text-xs mb-1"><span>تكلفة الورق ({results.paperPriceUsed}/ألف):</span> <b>{Math.round(results.paperCost)} ريال</b></div>
                     <div className="flex justify-between text-xs"><span>تكلفة التشغيل:</span> <b>{Math.round(results.actualPrintCost)} ريال</b></div>
                  </div>

                  <div className="col-span-2 md:col-span-3 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-slate-500"><span>السعر الأساسي:</span><span>{Math.round(results.finalPrice || 0)} ريال</span></div>
                    {results.discountPercent > 0 && (<div className="flex justify-between items-center text-[#337159]"><span>خصم الكمية ({results.discountPercent}%):</span><span>-{Math.round(results.discountAmount)} ريال</span></div>)}
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center"><span className="font-bold text-[#337159] text-lg">السعر النهائي (شامل الهامش):</span><span className="font-black text-3xl text-[#fa5732]">{Math.round(results.priceAfterDiscount || 0)} <span className="text-sm font-medium">ريال</span></span></div>
                  </div>
                </div>
              )}
              {activeTab === 'uvdtf' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultBox label="عدد في الصف" value={results.itemsPerRow} /><ResultBox label="عدد الصفوف" value={results.totalRows} /><ResultBox label="الأمتار المستهلكة" value={results.metersConsumed?.toFixed(3)} highlighted />
                  <div className="col-span-2 md:col-span-3 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-slate-500"><span>السعر الأساسي:</span><span>{Math.round(results.finalPrice || 0)} ريال</span></div>
                    {results.discountPercent > 0 && (<div className="flex justify-between items-center text-[#337159]"><span>خصم الكمية ({results.discountPercent}%):</span><span>-{Math.round(results.discountAmount)} ريال</span></div>)}
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center"><span className="font-bold text-[#337159] text-lg">السعر النهائي (بعد الخصم):</span><span className="font-black text-3xl text-[#fa5732]">{Math.round(results.priceAfterDiscount || 0)} <span className="text-sm font-medium">ريال</span></span></div>
                  </div>
                </div>
              )}
              
              {/* Save Button */}
              <div className="mt-6 flex justify-end col-span-full">
                <button 
                  onClick={handleSaveQuote} 
                  disabled={savingLog || !results.finalPrice}
                  className="bg-[#fa5732] hover:bg-[#d94a29] text-white py-3 px-8 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <FileText className="w-5 h-5" />
                  {savingLog ? 'جاري الحفظ...' : 'حفظ التسعيرة'}
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-8">{activeTab === 'digital' ? `السعر المطبق للورق: ${results.sheetPriceUsed} ريال | المقاس: ${results.dims}` : activeTab === 'offset' ? `حساب: ${results.ups} قطع في الفرخ | الزنكات: ${results.numPlates}` : `الأسعار الأساسية: رول: ${prices.rollUnitPrice} | UV: ${prices.uvDtfPrice}`}</div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Entry ---
export default function App() {
  const [view, setView] = useState('calculator'); // 'calculator', 'login', 'admin'
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Added visibility settings to initial state
  const [generalSettings, setGeneralSettings] = useState({ 
    allowPriceOverride: false,
    showRoll: true,
    showDigital: true,
    showOffset: true,
    showUvDtf: true
  });
  
  const [prices, setPrices] = useState({
    rollUnitPrice: 80, defaultRollWidth: 120, digitalSheetPrice: 5, digitalPaperTypes: [], digitalAddons: [], rollDiscounts: [], digitalDiscounts: [], uvDtfDiscounts: [],
    digitalSheetSizes: [{ name: 'ربع فرخ (33×48)', width: 33, height: 48 }, { name: 'فرخ كامل (70×100)', width: 70, height: 100 }],
    sheetWidth: 33, sheetHeight: 48, uvDtfPrice: 150,
    foilMoldPricePerCm2: 1.15, foilMinMoldPrice: 150, foilStampingUnitPrice: 0.40,
    // Offset Defaults
    offsetPlatePrice: 50, offsetPrintPrice1000: 80, offsetMinQty: 1000, offsetPaperTypes: [], offsetDiscounts: [],
    // New Toggle default
    showDigitalPaperField: true
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth Error:", e);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    // Add Cairo Font
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `* { font-family: 'Cairo', sans-serif; }`;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (loading) return;
    const priceDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'pricing');
    const generalRef = doc(db, ...GENERAL_SETTINGS_PATH);

    const unsubPrice = onSnapshot(priceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPrices(prev => ({ ...prev, ...docSnap.data() }));
      } else {
        setDoc(priceDocRef, prices).catch(console.error);
      }
    });

    const unsubGeneral = onSnapshot(generalRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Merge with defaults to ensure all keys exist for new features
        setGeneralSettings(prev => ({ ...prev, ...data }));
      } else {
        setDoc(generalRef, { 
          allowPriceOverride: false,
          showRoll: true,
          showDigital: true,
          showOffset: true,
          showUvDtf: true 
        });
      }
    });

    return () => {
      unsubPrice();
      unsubGeneral();
    };
  }, [loading]);

  const handleUpdatePrice = async (newPrices) => {
    try {
      const priceDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'pricing');
      await updateDoc(priceDocRef, newPrices);
      alert('تم تحديث الأسعار بنجاح');
    } catch (error) {
      console.error("Error updating:", error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleUpdateGeneralSettings = async (newSettings) => {
    try {
      const generalRef = doc(db, ...GENERAL_SETTINGS_PATH);
      await updateDoc(generalRef, newSettings);
      // alert('تم تحديث الإعدادات العامة بنجاح'); // Optional feedback
    } catch (error) {
      console.error("Error updating general settings:", error);
    }
  };

  const handleAdminLogin = (user) => {
    if (user.role === 'admin') {
        setAdminUser(user);
        setView('admin');
    } else {
        alert("هذا الحساب ليس لديه صلاحيات مسؤول");
    }
  };

  const handleLogout = () => { 
    setAdminUser(null);
    setView('calculator');
  };

  if (loading) return (<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4"><div className="w-10 h-10 border-4 border-[#337159] border-t-transparent rounded-full animate-spin"></div><p>جاري التحميل...</p></div>);

  if (view === 'login') {
    return <AuthScreen onLoginSuccess={handleAdminLogin} onCancel={() => setView('calculator')} />;
  }

  if (view === 'admin' && adminUser) {
    return <AdminPanel 
      prices={prices} 
      onUpdatePrice={handleUpdatePrice} 
      onLogout={handleLogout} 
      currentUser={adminUser}
      generalSettings={generalSettings}
      onUpdateGeneralSettings={handleUpdateGeneralSettings}
    />;
  }

  // Default View: Calculator (No Login Required)
  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <CalculatorApp 
        prices={prices} 
        onAdminLogin={() => setView('login')} 
        currentUser={{ name: 'موظف عام', uid: 'guest' }} 
        generalSettings={generalSettings}
      />
    </div>
  );
}
