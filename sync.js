// ==================== إعداد Firebase ====================
const firebaseConfig = {
  apiKey: "AIzaSyAAFKSdUPEa7U1zpFxc3ZQjqwj9Pji768Q",
  authDomain: "yasosystem.firebaseapp.com",
  projectId: "yasosystem",
  storageBucket: "yasosystem.firebasestorage.app",
  messagingSenderId: "250096554890",
  appId: "1:250096554890:web:fac52f0d5912db08b7ee73"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==================== تهيئة المزامنة الفورية ====================

/**
 * نظام المزامنة الفورية - يعمل على كل الأجهزة
 * المبدأ: كل جهاز يخزن بياناته في مستند منفصل باسم الجهاز
 * ثم نستمع لتغييرات كل الأجهزة ونجمعها في localStorage
 */

// معرف فريد لكل جهاز (يتم إنشاؤه مرة واحدة ويحفظ في localStorage)
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2) + '_' + Date.now();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

const DEVICE_ID = getDeviceId();
const DEVICE_NAME = navigator.userAgent.substring(0, 50); // اسم المتصفح كمعرف

console.log('🔧 معرف هذا الجهاز:', DEVICE_ID);

// ==================== دوال الحفظ الفوري ====================

/**
 * حفظ البيانات في Firebase فور حدوث أي تغيير
 */
async function saveToFirebase(collectionName, data) {
    try {
        // نستخدم document ID = collectionName (مثلاً trainers_doc)
        // هذا أفضل من استخدام 'main' لأن كل جهاز له مستند منفصل
        await db.collection(collectionName).doc(DEVICE_ID).set({
            data: data,
            deviceId: DEVICE_ID,
            deviceName: DEVICE_NAME,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ تم حفظ ${collectionName} من هذا الجهاز`);
        return true;
    } catch (error) {
        console.error(`❌ خطأ في حفظ ${collectionName}:`, error);
        return false;
    }
}

/**
 * تحميل كل البيانات من جميع الأجهزة ودمجها
 */
async function loadFromFirebase(collectionName) {
    try {
        // نجلب كل المستندات في هذه المجموعة (كل الأجهزة)
        const snapshot = await db.collection(collectionName).get();
        
        // نجمع البيانات من جميع الأجهزة
        let allData = [];
        snapshot.forEach(doc => {
            const docData = doc.data().data;
            if (docData) {
                if (Array.isArray(docData)) {
                    allData = allData.concat(docData);
                }
            }
        });
        
        // إزالة التكرارات (حسب id إذا وجد)
        const uniqueData = allData.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
        );
        
        // حفظ في localStorage
        localStorage.setItem(collectionName, JSON.stringify(uniqueData));
        
        console.log(`✅ تم تحميل ${collectionName} من ${snapshot.size} جهاز`);
        return uniqueData;
    } catch (error) {
        console.error(`❌ خطأ في تحميل ${collectionName}:`, error);
        return null;
    }
}

// ==================== الاستماع المباشر للتغييرات ====================

/**
 * الاستماع للتغييرات في الوقت الفعلي
 * هذه أهم دالة: أي جهاز يغير البيانات، كل الأجهزة تتلقى التحديث فوراً
 */
function listenToChanges(collectionName) {
    db.collection(collectionName).onSnapshot((snapshot) => {
        // نتأكد أن التغيير ليس من هذا الجهاز (حتى لا نحدث أنفسنا مرتين)
        let changedByOther = false;
        snapshot.docChanges().forEach(change => {
            if (change.doc.id !== DEVICE_ID) {
                changedByOther = true;
            }
        });
        
        if (changedByOther) {
            console.log(`🔄 تغيير في ${collectionName} من جهاز آخر - جاري التحديث`);
            loadFromFirebase(collectionName).then(() => {
                // إظهار إشعار للمستخدم
                showNotification(`📱 تم تحديث ${collectionName} من جهاز آخر`);
                
                // إعادة تحميل الصفحة إذا كان المستخدم موافق
                if (confirm(`تم تحديث البيانات من جهاز آخر. هل تريد تحديث الصفحة الآن؟`)) {
                    location.reload();
                }
            });
        }
    }, (error) => {
        console.error(`❌ خطأ في الاستماع لـ ${collectionName}:`, error);
    });
}

// ==================== مراقبة التغييرات المحلية ====================

/**
 * مراقبة localStorage وإرسال التغييرات إلى Firebase فوراً
 */
function watchLocalStorage() {
    const collections = ['trainers', 'registrationRequests', 'questions', 'clients', 'surveys', 'clientAnswers', 'trainerLogos'];
    
    // حفظ القيم السابقة
    let previousValues = {};
    collections.forEach(col => {
        previousValues[col] = localStorage.getItem(col);
    });
    
    // فحص كل 3 ثواني
    setInterval(() => {
        collections.forEach(col => {
            const currentValue = localStorage.getItem(col);
            if (currentValue !== previousValues[col]) {
                // تغيير حدث!
                previousValues[col] = currentValue;
                if (currentValue) {
                    try {
                        const parsed = JSON.parse(currentValue);
                        saveToFirebase(col, parsed);
                    } catch (e) {
                        console.error('خطأ في تحليل JSON:', e);
                    }
                }
            }
        });
    }, 3000);
}

// ==================== دوال مساعدة ====================

function showNotification(text, type = 'info') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 10001;
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-size: 14px;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = text;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// إضافة animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// ==================== إنشاء واجهة المستخدم ====================

function createUI() {
    // شريط سفلي
    const bar = document.createElement('div');
    bar.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: linear-gradient(45deg, #2196F3, #1976D2);
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        z-index: 10000;
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 600px;
        margin: 0 auto;
    `;
    
    bar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            <span>🌍 المزامنة الفورية نشطة (جهاز: ${DEVICE_ID.substring(0, 8)})</span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="forceSync()" style="background: white; color: #1976D2; border: none; padding: 6px 15px; border-radius: 25px; cursor: pointer; font-family: 'Cairo'; font-size: 13px;">
                🔄 مزامنة الآن
            </button>
        </div>
    `;
    
    document.body.appendChild(bar);
    document.body.style.paddingBottom = '80px';
    
    // إضافة pulse animation
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(pulseStyle);
}

// دالة للمزامنة اليدوية
window.forceSync = async function() {
    showNotification('🔄 جاري المزامنة...', 'info');
    
    const collections = ['trainers', 'registrationRequests', 'questions', 'clients', 'surveys', 'clientAnswers', 'trainerLogos'];
    
    for (const col of collections) {
        await loadFromFirebase(col);
    }
    
    showNotification('✅ تمت المزامنة بنجاح', 'success');
    
    if (confirm('تم تحديث البيانات. هل تريد إعادة تحميل الصفحة الآن؟')) {
        location.reload();
    }
};

// ==================== تعديل الدوال الأصلية ====================

// حفظ الدوال الأصلية
const originalFunctions = {
    handleRegistration: window.handleRegistration,
    handleAnswerSubmission: window.handleAnswerSubmission,
    handleQuestionSubmission: window.handleQuestionSubmission,
    handleTrainerActivation: window.handleTrainerActivation
};

// تعديل دالة التسجيل
window.handleRegistration = function(e) {
    if (e) e.preventDefault();
    
    // تنفيذ الدالة الأصلية
    if (originalFunctions.handleRegistration) {
        originalFunctions.handleRegistration(e);
    }
    
    // حفظ في Firebase بعد ثانية
    setTimeout(() => {
        const data = localStorage.getItem('registrationRequests');
        if (data) {
            saveToFirebase('registrationRequests', JSON.parse(data));
        }
    }, 1000);
};

// تعديل دالة إضافة إجابة
window.handleAnswerSubmission = function() {
    if (originalFunctions.handleAnswerSubmission) {
        originalFunctions.handleAnswerSubmission();
    }
    
    setTimeout(() => {
        const data = localStorage.getItem('clientAnswers');
        if (data) {
            saveToFirebase('clientAnswers', JSON.parse(data));
        }
    }, 1000);
};

// تعديل دالة إضافة سؤال
window.handleQuestionSubmission = function(e) {
    if (e) e.preventDefault();
    
    if (originalFunctions.handleQuestionSubmission) {
        originalFunctions.handleQuestionSubmission(e);
    }
    
    setTimeout(() => {
        const data = localStorage.getItem('questions');
        if (data) {
            saveToFirebase('questions', JSON.parse(data));
        }
    }, 1000);
};

// تعديل دالة تفعيل مدرب
window.handleTrainerActivation = function(e) {
    if (e) e.preventDefault();
    
    if (originalFunctions.handleTrainerActivation) {
        originalFunctions.handleTrainerActivation(e);
    }
    
    setTimeout(() => {
        const data = localStorage.getItem('trainers');
        if (data) {
            saveToFirebase('trainers', JSON.parse(data));
        }
    }, 1000);
};

// ==================== بدء التشغيل ====================

window.onload = async function() {
    // إضافة Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fa);
    }
    
    // إنشاء واجهة المستخدم
    createUI();
    
    // تحميل البيانات من جميع الأجهزة
    showNotification('🔄 جاري تحميل البيانات من السحابة...', 'info');
    
    const collections = ['trainers', 'registrationRequests', 'questions', 'clients', 'surveys', 'clientAnswers', 'trainerLogos'];
    
    for (const col of collections) {
        await loadFromFirebase(col);
    }
    
    // بدء الاستماع للتغييرات في الوقت الفعلي
    collections.forEach(col => listenToChanges(col));
    
    // بدء مراقبة التغييرات المحلية
    watchLocalStorage();
    
    showNotification('✅ نظام المزامنة الفورية جاهز', 'success');
    
    console.log('🚀 نظام المزامنة الفورية يعمل على الجهاز:', DEVICE_ID);
};
