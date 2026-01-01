import React, { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, User, Hash, LayoutTemplate, Image as ImageIcon, Loader } from 'lucide-react';

const BalanceConfirmationApp = () => {
  // الحالة (State) لتخزين البيانات المدخلة
  const [formData, setFormData] = useState({
    refNumber: '00P-JED-225',
    customerName: 'مؤسسة جمال اللوحات للدعاية والإعلان',
    customerNameEn: 'Jamal Paintings Est. for Advertising',
    startDate: '2025-01-01',
    endDate: '2025-11-05',
    balanceDate: '2025-11-05',
    balanceAmount: '31535.30',
    logoUrl: 'https://i.ibb.co/R4GYZ29b/MATCHING-INITIATIVES-pdf-1.png', // رابط شعار شركة نجد الجديد
    stampUrl: 'https://i.ibb.co/yJBySkV/MATCHING-INITIATIVES-pdf.png', // رابط الختم
    footerBgUrl: 'https://i.ibb.co/6Rvg2LWN/MATCHING-INITIATIVES-pdf-2.png' // رابط خلفية التذييل الجديدة
  });

  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // تحميل مكتبة html2pdf.js عند بدء التشغيل
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => setIsPdfReady(true);
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // ignore removal errors
      }
    };
  }, []);

  // دالة لتحديث البيانات عند الكتابة
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // دالة تحميل PDF المباشر
  const handleDownloadPDF = () => {
    if (!isPdfReady) return;
    setIsGenerating(true);

    const element = document.getElementById('printable-section');
    
    // إعدادات التحويل - تم ضبطها لتناسب صفحة واحدة تماماً
    const opt = {
      margin:       0,
      filename:     `Balance_Confirmation_${formData.refNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // التنفيذ
    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
    });
  };

  // تنسيق المبلغ لإضافة الفواصل
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row app-container">
      
      {/* استدعاء خط Cairo */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ---------------- القسم الأول: لوحة التحكم ---------------- */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white p-6 shadow-lg border-r border-gray-200 overflow-y-auto z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-4">
          <LayoutTemplate size={24} />
          <h1 className="text-xl font-bold">بيانات المصادقة</h1>
        </div>

        <div className="space-y-4">
          {/* رقم العميل / المرجع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Hash size={14} /> كود العميل / المرجع
            </label>
            <input
              type="text"
              name="refNumber"
              value={formData.refNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-left"
              dir="ltr"
            />
          </div>

          {/* اسم العميل (عربي) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User size={14} /> اسم العميل (عربي)
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="مثال: مؤسسة جمال اللوحات"
            />
          </div>

          {/* اسم العميل (إنجليزي) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User size={14} /> اسم العميل (إنجليزي)
            </label>
            <input
              type="text"
              name="customerNameEn"
              value={formData.customerNameEn}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-left"
              placeholder="e.g. Jamal Est."
              dir="ltr"
            />
          </div>

          {/* التواريخ */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> من تاريخ
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> إلى تاريخ
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* تاريخ الرصيد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} /> الرصيد كما في تاريخ
            </label>
            <input
              type="date"
              name="balanceDate"
              value={formData.balanceDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* المبلغ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <DollarSign size={14} /> مبلغ الرصيد
            </label>
            <input
              type="number"
              name="balanceAmount"
              value={formData.balanceAmount}
              onChange={handleChange}
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md font-mono font-bold text-lg text-black"
            />
          </div>

          {/* رابط شعار الشركة (Header) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <ImageIcon size={14} /> رابط شعار الشركة (Header)
            </label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-xs text-gray-500 text-left"
              dir="ltr"
            />
          </div>

          {/* رابط خلفية التذييل (Footer BG) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <ImageIcon size={14} /> رابط خلفية التذييل (Footer)
            </label>
            <input
              type="text"
              name="footerBgUrl"
              value={formData.footerBgUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-xs text-gray-500 text-left"
              dir="ltr"
            />
          </div>

          {/* رابط صورة الختم (Footer/Stamp) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <ImageIcon size={14} /> رابط الختم (Signature)
            </label>
            <input
              type="text"
              name="stampUrl"
              value={formData.stampUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-xs text-gray-500 text-left"
              dir="ltr"
            />
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={!isPdfReady || isGenerating}
            className={`w-full mt-6 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all 
              ${!isPdfReady || isGenerating ? 'bg-gray-400 cursor-wait' : 'bg-green-700 hover:bg-green-800 cursor-pointer active:bg-green-900'}`}
          >
            {isGenerating ? <Loader className="animate-spin" size={20} /> : <Download size={20} />}
            {isGenerating ? 'جاري إنشاء الملف...' : 'تحميل PDF مباشرة'}
          </button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            سيتم حفظ الملف باسم: Balance_Confirmation_{formData.refNumber}.pdf
          </p>
        </div>
      </div>

      {/* ---------------- القسم الثاني: معاينة المستند (المساحة البيضاء) ---------------- */}
      <div className="flex-1 bg-gray-200 p-4 md:p-8 overflow-auto flex justify-center no-print-bg">
        
        {/* صفحة A4 - تم ضبط الأبعاد لتكون ثابتة تماماً */}
        <div 
          id="printable-section"
          className="bg-white shadow-2xl w-[210mm] h-[297mm] p-[10mm] relative text-black box-border flex flex-col justify-between mx-auto overflow-hidden"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {/* الخلفية السفلية (Footer Background) */}
          {formData.footerBgUrl && (
            <img 
              src={formData.footerBgUrl} 
              className="absolute bottom-0 left-0 w-full z-0 object-cover" 
              alt="Footer Background"
              crossOrigin="anonymous"
              style={{bottom:"50px"}}
            />
          )}

          {/* ---- رأس الصفحة Header ---- */}
          <header className="border-b-2 border-black pb-2 mb-2 relative z-10">
            <div className="flex justify-between items-start">
              {/* الجهة الإنجليزية (اليسار) */}
              <div className="text-left w-1/3">
                <h2 className="font-bold text-lg leading-tight text-blue-900">NAJD INTERNATIONAL MARKETING CO.</h2>
                <div className="text-sm space-y-1 mt-1 text-gray-700 font-medium">
                   <p><span className="font-bold">C.R:</span> 4030524136</p>
                   <p><span className="font-bold">VAT:</span> 311815766100003</p>
                </div>
              </div>

              {/* الشعار (وسط) */}
              <div className="w-1/3 flex flex-col items-center justify-center">
                {/* شعار الشركة (اللوجو الجديد) */}
                <div className="h-20 w-full flex items-center justify-center mb-1">
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="NAJD Logo" className="h-full object-contain" crossOrigin="anonymous" />
                   ) : (
                     <div className="h-16 w-16 border-4 border-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xl font-black text-blue-900 tracking-tighter">NAJD</span>
                     </div>
                   )}
                </div>
                <div className="text-xs font-bold border border-black px-2 py-1 bg-gray-100">
                  {formData.refNumber || 'REF-000'}
                </div>
              </div>

              {/* الجهة العربية (اليمين) */}
              <div className="text-right w-1/3" dir="rtl">
                <h2 className="font-bold text-lg leading-tight text-blue-900">شركة نجد الدولية للتسويق</h2>
                <div className="text-sm space-y-1 mt-1 text-gray-700 font-medium">
                  <p>س.ت: ٤٠٣٠٥٢٤١٣٦</p>
                  <p>الرقم الضريبي: ٣١١٨١٥٧٦٦١٠٠٠٠٣</p>
                </div>
              </div>
            </div>
          </header>

          {/* ---- عنوان الوثيقة ---- */}
          <div className="text-center mb-4 relative z-10">
            <h1 className="text-xl font-bold border-2 border-black inline-block px-8 py-1 rounded-lg bg-gray-50 uppercase shadow-sm">
              مـطـابـقـة رصـيـد <br/>
              <span className="text-base font-medium">Balance Confirmation</span>
            </h1>
          </div>

          {/* ---- محتوى الرسالة (Grid Layout) ---- */}
          <div className="flex flex-col gap-3 flex-grow relative z-10">
            
            {/* التواريخ واسم العميل */}
            <div className="flex justify-between items-end border-b border-gray-300 pb-2">
               <div className="text-left w-1/2">
                  <p className="font-bold text-gray-600 mb-1">M/S:</p>
                  <p className="text-lg font-bold ">{formData.customerNameEn}</p>
               </div>
               <div className="text-right w-1/2" dir="rtl">
                 <p className="mb-1 text-sm text-gray-600 font-medium">
                    اعتباراً من <span className="font-bold text-black"> {formData.startDate} </span> إلى <span className="font-bold text-black"> {formData.endDate} </span>
                 </p>
                 <p className="font-bold text-gray-600 mb-1">السادة  المحترمين /</p>
                 <p className="text-lg font-bold ">{formData.customerName}</p>
               </div>
            </div>

            {/* النص الرئيسي وعرض الرصيد (منفصلين) */}
            <div className="flex flex-row-reverse gap-6">
              
              {/* النص العربي (يمين) */}
              <div className="w-1/2 text-right" dir="rtl">
                <p className="leading-snug mb-2 text-justify font-medium text-sm">
                  بمناسبة تدقيق حساباتنا الدورية المعتادة لبياناتنا المالية، فإننا نرغب في الحصول على تأكيد مباشر للرصيد المستحق لنا من طرفكم كما هو بتاريخ <span className="font-bold px-1">{formData.balanceDate}</span>.
                </p>
                <p className="mb-1 font-bold text-sm" >الرصيد حسب سجلاتنا هو  <span>:</span></p>
                
                {/* مربع الرصيد العربي */}
                <div className="border border-black p-2 mt-1 inline-block w-full text-center ">
                   <div className="flex justify-center items-center gap-2" style={{color:"black"}}>
                      <span className="text-xl font-black" style={{color:"black"}}>{formatCurrency(formData.balanceAmount)}</span>
                      <span className="text-sm font-bold" style={{color:"black"}}>ريال سعودي</span>
                   </div> 
                </div>
              </div>

              {/* النص الإنجليزي (يسار) */}
              <div className="w-1/2 text-left">
                <p className="leading-snug mb-2 text-justify text-sm font-medium">
                  As per our normal financial audit requirements please check and confirm the accuracy of our balance with you as of <span className="font-bold px-1">{formData.balanceDate}</span>.
                </p>
                <p className="mb-1 font-bold text-sm">According to our records, the balance is:</p>
                
                {/* مربع الرصيد الإنجليزي */}
                <div className="border border-black p-2 mt-1 inline-block w-full text-center">
                   <div className="flex justify-center items-center gap-2">
                      <span className="text-xl font-black" style={{color:"black"}}>{formatCurrency(formData.balanceAmount)}</span>
                      <span className="text-sm font-bold" style={{color:"black"}}>SR</span>
                   </div>
                </div>
              </div>
            </div>

            {/* النص السفلي (تعليمات) */}
            <div className="flex flex-row-reverse gap-6">
               <div className="w-1/2 text-right" dir="rtl">
                 <p className="text-xs leading-relaxed text-justify font-medium">
                   نرجو مقارنة الرصيد الموضح أعلاه مع سجلاتكم وتوضيح أي اختلافات بالرصيد في الجزء السفلي من هذه الرسالة، كما نرجو منكم توقيع وختم الرسالة وإعادتها إلينا.
                   <br/><br/>
                   <span className="text-[10px] text-gray-500 font-bold">* إذا لم يصلنا الرد خلال 10 أيام سوف نعتبر هذا بمثابة موافقة نهائية على الرصيد.</span>
                 </p>
               </div>
               <div className="w-1/2 text-left">
                 <p className="text-xs leading-relaxed text-justify font-medium">
                   Please confirm the balance by signing and stamping in the space given below. State any discrepancies in detail if any.
                   <br/><br/>
                   <span className="text-[10px] text-gray-500 font-bold">* If we do not receive your confirmation within 10 days, it is understood you agree to the contents therein.</span>
                 </p>
               </div>
            </div>

            {/* ---- قسم الرد (Confirmation Section) ---- */}
            <div className="border-t-2 border-dashed border-gray-400 pt-2 relative z-10 mt-[18px]">
               <div className="p-3 border border-gray-300 rounded-lg">
                  <div className="flex justify-between mb-3 border-b border-gray-300 pb-1">
                     <h3 className="font-bold text-base">Confirmation Reply</h3>
                     <h3 className="font-bold text-base">رد المصادقة</h3>
                  </div>

                  {/* خيارات الموافقة */}
                  <div className="space-y-4">
                    
                    {/* خيار 1: موافق */}
                    <div className="flex items-center justify-between">
                       {/* English Part */}
                       <div className="flex items-center gap-2 w-1/2">
                          <div className="w-5 h-5 border border-black flex-shrink-0"></div>
                          <p className="text-xs font-medium leading-none pt-0.5">We confirm the above balance is correct.</p>
                       </div>
                       
                       {/* Arabic Part */}
                       <div className="flex items-center justify-start gap-2 w-1/2" dir="rtl">
                          <div className="w-5 h-5 border border-black flex-shrink-0"></div>
                          <p className="text-xs font-medium leading-none pt-0.5">إننا نوافق على أن الرصيد المبين أعلاه صحيح.</p>
                       </div>
                    </div>

                    {/* خيار 2: غير موافق */}
                    <div className="flex items-start justify-between">
                       {/* English Part */}
                       <div className="w-1/2 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-5 h-5 border border-black flex-shrink-0"></div>
                             <p className="text-xs font-medium leading-none pt-0.5">We do not agree. The balance in our books is:</p>
                          </div>
                          {/* تم إصلاح الخطأ هنا */}
                          <div className="border-b border-dotted border-black h-6 w-[88%] mt-1 ml-7" style={{border :"1px solid black",padding:"18px 0"}}></div>
                       </div>
                       
                       {/* Arabic Part */}
                       <div className="w-1/2 pl-2" dir="rtl">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-5 h-5 border border-black flex-shrink-0"></div>
                             <p className="text-xs font-medium leading-none pt-0.5">إننا لا نوافق على صحة الرصيد، فالرصيد لدينا هو:</p>
                          </div>
                          <div className="border-b border-dotted border-black h-6 w-[88%] mt-1 mr-7" style={{border :"1px solid black",padding:"18px 0"}}></div>
                       </div>
                    </div>
                  </div>

                  {/* معلومات العميل للتوقيع */}
                  <div className="flex justify-between items-end mt-4 pt-2">
                     <div className="text-center w-1/3">
                        <div className="border-b border-black mb-1 pb-2"></div>
                        <p className="text-xs font-bold">Signature / التوقيع</p>
                     </div>
                     <div className="text-center w-1/3">
                        <div className="border-b border-black mb-1 pb-2"></div>
                        <p className="text-xs font-bold">Stamp / الختم</p>
                     </div>
                     <div className="text-center w-1/3">
                        <div className="mb-1 pb-2 font-bold text-sm ">{formData.customerName}</div>
                        <p className="text-xs font-bold text-gray-500">Client Name / اسم العميل</p>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* التوقيعات (إدارة الشركة) مع الختم */}
            <div className="flex justify-end mt-2 mb-2" style={{marginTop:"-5px"}}>
               <div className="text-center w-64 relative">
                 <div className="h-20 flex items-end justify-center pb-2 relative">
                    {/* الختم في الخلفية عند التوقيع (Stamp) */}
                    {formData.stampUrl && (
                      <img 
                        src={formData.stampUrl} 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 opacity-90 mix-blend-multiply pointer-events-none" 
                        alt="Stamp" 
                        crossOrigin="anonymous"
                      />
                    )}
                 </div>
               </div>
            </div>
          </div>

          {/* تذييل الصفحة Footer */}
          <footer style={{bottom:"15px"}} className="mt-2 text-center text-[10px] text-gray-500 border-t pt-1 font-medium relative z-10">
             <div className="flex justify-between items-center px-4">
               <span>Jeddah, Saudi Arabia</span>
               <span>+966 55 607 607 3</span>
               <span>najdmarketing@gmail.com</span>
             </div>
             <p className="mt-0.5 opacity-50">Generated Systematically - NAJD CO.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BalanceConfirmationApp;
