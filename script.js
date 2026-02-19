// البيانات المحلية
let currentUser = null;
let currentUserType = null;
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const trainersRef = ref(db, "trainers");

onValue(trainersRef, (snapshot) => {
  trainers = snapshot.val() || [];
  renderTrainers();
});
let registrationRequests = [];

const registrationRef = ref(db, "registrationRequests");

onValue(registrationRef, (snapshot) => {
  registrationRequests = snapshot.val() || {};
  renderRegistrationRequests();
});

let questions = [];

const questionsRef = ref(db, "questions");

onValue(questionsRef, (snapshot) => {
  questions = snapshot.val() || {};
  renderQuestions();
});

let clients = [];

const clientsRef = ref(db, "clients");

onValue(clientsRef, (snapshot) => {
  clients = snapshot.val() || {};
  renderClients();
});

let surveys = [];

const surveysRef = ref(db, "surveys");

onValue(surveysRef, (snapshot) => {
  surveys = snapshot.val() || {};
  renderSurveys();
});

const answersRef = ref(db, "clientAnswers");

onValue(answersRef, (snapshot) => {
  clientAnswers = snapshot.val() || {};
  renderAnswers();
});

let trainerLogos = {};

const logosRef = ref(db, "trainerLogos");

onValue(logosRef, (snapshot) => {
  trainerLogos = snapshot.val() || {};
  renderTrainerLogos();
});

// كود المدير الافتراضي
const ADMIN_CODE = 'admin2025';

// تهيئة الموقع
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  loadTrainerOptions();
  showScreen('loginScreen');
});

// إعداد مستمعي الأحداث
function initializeEventListeners() {
  // نموذج تسجيل الدخول
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // زر التسجيل
  document.getElementById('registerBtn').addEventListener('click', function() {
    showScreen('registerScreen');
  });
  
  // نموذج التسجيل
  document.getElementById('registerForm').addEventListener('submit', handleRegistration);
  
  // نماذج المدير
  document.getElementById('trainerForm').addEventListener('submit', handleTrainerActivation);
  document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmission);
  document.getElementById('logoForm').addEventListener('submit', handleLogoUpload);
import { onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const registrationRef = ref(db, "registrationRequests");

onValue(registrationRef, (snapshot) => {
  const data = snapshot.val() || {};
  renderRegistrationRequests(data);
});

  
  // زر الاستبيان
  document.getElementById('surveyBtn').addEventListener('click', function() {
    showModal('surveyModal');
  });
  
  // نموذج الاستبيان
  document.getElementById('surveyForm').addEventListener('submit', handleSurveySubmission);
  
  // زر إرسال الإجابة
  document.getElementById('submitAnswerBtn').addEventListener('click', handleAnswerSubmission);
}

// عرض الشاشات
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// تسجيل الدخول
function handleLogin(e) {
  e.preventDefault();
  const code = document.getElementById('loginCode').value.trim();
  
  if (code === ADMIN_CODE) {
    currentUser = { name: 'المدير', code: ADMIN_CODE };
    currentUserType = 'admin';
    showScreen('adminScreen');
    loadAdminData();
  } else {
    // البحث في المدربين
    const trainer = trainers.find(t => t.code === code);
    if (trainer) {
      currentUser = trainer;
      currentUserType = 'trainer';
      showScreen('trainerScreen');
      loadTrainerData();
      return;
    }
    
    // البحث في العملاء
    const client = clients.find(c => c.code === code);
    if (client) {
      currentUser = client;
      currentUserType = 'client';
      document.getElementById('clientName').textContent = client.name;
      showScreen('clientScreen');
      loadClientData();
      return;
    }
    
    alert('كود الدخول غير صحيح');
  }
}

// التسجيل الجديد
function handleRegistration(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('regName').value,
    phone: document.getElementById('regPhone').value,
    governorate: document.getElementById('regGovernorate').value,
    trainer: document.getElementById('regTrainer').value,
    source: document.getElementById('regSource').value,
    timestamp: new Date().toISOString()
  };

  const registrationRef = ref(db, "registrationRequests");

  push(registrationRef, formData)
    .then(() => {
      alert('تم إرسال طلب التسجيل بنجاح! سيتم مراجعته من قبل الإدارة.');
      showScreen('loginScreen');
      document.getElementById('registerForm').reset();
    })
    .catch((error) => {
      console.error("خطأ في الإرسال:", error);
      alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
    });
}

// تحميل خيارات المدربين
function loadTrainerOptions() {
  const trainerSelect = document.getElementById('regTrainer');
  const logoTrainerSelect = document.getElementById('logoTrainer');
  
  trainerSelect.innerHTML = '<option value="">اختر المدرب</option>';
  logoTrainerSelect.innerHTML = '<option value="">اختر المدرب</option>';
  
  trainers.forEach(trainer => {
    const option1 = new Option(trainer.name, trainer.name);
    const option2 = new Option(trainer.name, trainer.code);
    trainerSelect.appendChild(option1);
    logoTrainerSelect.appendChild(option2);
  });
}

// تفعيل المدرب
function handleTrainerActivation(e) {
  e.preventDefault();
  
  const trainerData = {
    name: document.getElementById('trainerName').value,
    phone: document.getElementById('trainerPhone').value,
    amount: document.getElementById('trainerAmount').value,
    code: document.getElementById('trainerCode').value,
    allowEdit: document.getElementById('allowEdit').checked,
    timestamp: new Date().toISOString()
  };
  
  trainers.push(trainerData);
import { set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

set(ref(db, "trainers"), trainers);
  
  loadTrainerOptions();
  loadTrainersTable();
  document.getElementById('trainerForm').reset();
  
  alert('تم تفعيل المدرب بنجاح!');
}

// تحميل جدول المدربين
function loadTrainersTable() {
  const tbody = document.querySelector('#trainersTable tbody');
  tbody.innerHTML = '';
  
  trainers.forEach((trainer, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${trainer.name}</td>
      <td>${trainer.phone}</td>
      <td>${trainer.amount}</td>
      <td>${trainer.code}</td>
      <td>${trainer.allowEdit ? 'مسموح' : 'غير مسموح'}</td>
      <td>
        <button class="action-btn copy-btn" onclick="copyCode('${trainer.code}')">
          <i class="fas fa-copy"></i> نسخ
        </button>
      </td>
    `;
  });
}

// نسخ الكود
function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    alert('تم نسخ الكود بنجاح!');
  });
}

// تحميل طلبات التسجيل
function loadRegistrationRequests() {
  const tbody = document.querySelector('#requestsTable tbody');
  tbody.innerHTML = '';
  
  registrationRequests.forEach((request, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${request.name}</td>
      <td>${request.phone}</td>
      <td>${request.governorate}</td>
      <td>${request.trainer}</td>
      <td>${request.source}</td>
      <td>
        <button class="action-btn approve-btn" onclick="approveRequest(${index})">
          <i class="fas fa-check"></i> قبول
        </button>
        <button class="action-btn reject-btn" onclick="rejectRequest(${index})">
          <i class="fas fa-times"></i> رفض
        </button>
      </td>
    `;
  });
}

// قبول طلب التسجيل
import { ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// References لقاعدة البيانات
const registrationRef = ref(db, "registrationRequests");
const clientsRef = ref(db, "clients");

// الاستماع للتغييرات لحظيًا
onValue(registrationRef, snapshot => registrationRequests = snapshot.val() || []);
onValue(clientsRef, snapshot => clients = snapshot.val() || []);

// دالة قبول طلب تسجيل
function approveRequest(index) {
  const request = registrationRequests[index];
  const clientCode = generateClientCode();

  const client = {
    ...request,
    code: clientCode,
    approved: true,
    approvedAt: new Date().toISOString()
  };

  // 1️⃣ إضافة العميل الجديد إلى Firebase
  push(clientsRef, client)
    .then(() => {
      // 2️⃣ إزالة الطلب من قائمة الطلبات في Firebase
      const requestKey = Object.keys(registrationRequests)[index]; // نحصل على مفتاح الطلب
      return remove(ref(db, `registrationRequests/${requestKey}`));
    })
    .then(() => {
      loadRegistrationRequests(); // تحديث العرض فورًا
      alert(`تم قبول الطلب! كود العميل: ${clientCode}`);
    })
    .catch(error => {
      console.error("خطأ أثناء الموافقة على الطلب:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    });
}


// رفض طلب التسجيل
import { ref, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// الاستماع للطلبات لحظيًا
const registrationRef = ref(db, "registrationRequests");
onValue(registrationRef, snapshot => registrationRequests = snapshot.val() || []);

// دالة رفض الطلب
function rejectRequest(index) {
  const requestKey = Object.keys(registrationRequests)[index]; // الحصول على مفتاح الطلب

  remove(ref(db, `registrationRequests/${requestKey}`))
    .then(() => {
      loadRegistrationRequests(); // تحديث العرض فورًا
      alert('تم رفض الطلب');
    })
    .catch(error => {
      console.error("خطأ أثناء رفض الطلب:", error);
      alert('حدث خطأ أثناء رفض الطلب');
    });
}


// توليد كود العميل
function generateClientCode() {
  return 'CLIENT_' + Date.now().toString(36).toUpperCase();
}

// إضافة سؤال جديد
function handleQuestionSubmission(e) {
  e.preventDefault();
  
  const questionData = {
    day: parseInt(document.getElementById('questionDay').value),
    openDate: document.getElementById('questionOpenDate').value,
    closeDate: document.getElementById('questionCloseDate').value,
    text: document.getElementById('questionText').value,
    answers: [
      document.getElementById('answer1').value,
      document.getElementById('answer2').value,
      document.getElementById('answer3').value || null,
      document.getElementById('answer4').value || null
    ].filter(answer => answer !== null && answer !== ''),
    correctAnswer: parseInt(document.querySelector('input[name="correctAnswer"]:checked').value) - 1,
    image: null, // سيتم إضافة دعم الصور لاحقاً
    timestamp: new Date().toISOString()
  };
  
  // التحقق من عدم وجود سؤال لنفس اليوم
 import { ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Reference لجدول الأسئلة
const questionsRef = ref(db, "questions");

// الاستماع للتغييرات لحظيًا
onValue(questionsRef, snapshot => questions = snapshot.val() || []);

// دالة حفظ السؤال
function saveQuestion(questionData) {
  // نبحث إذا يوجد سؤال لليوم نفسه
  const existingQuestionIndex = questions.findIndex(q => q.day === questionData.day);

  if (existingQuestionIndex !== -1) {
    if (confirm('يوجد سؤال لهذا اليوم بالفعل. هل تريد استبداله؟')) {
      const questionKey = Object.keys(questions)[existingQuestionIndex];
      set(ref(db, `questions/${questionKey}`), questionData)
        .then(() => {
          loadQuestionsList();
          document.getElementById('questionForm').reset();
          alert('تم حفظ السؤال بنجاح!');
        })
        .catch(error => {
          console.error("خطأ في حفظ السؤال:", error);
          alert('حدث خطأ أثناء حفظ السؤال');
        });
    } else {
      return;
    }
  } else {
    // إضافة السؤال الجديد
    push(questionsRef, questionData)
      .then(() => {
        loadQuestionsList();
        document.getElementById('questionForm').reset();
        alert('تم حفظ السؤال بنجاح!');
      })
      .catch(error => {
        console.error("خطأ في حفظ السؤال:", error);
        alert('حدث خطأ أثناء حفظ السؤال');
      });
  }
}
// تحميل قائمة الأسئلة
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Reference لجدول الأسئلة
const questionsRef = ref(db, "questions");

// الاستماع للتغييرات لحظيًا
onValue(questionsRef, (snapshot) => {
  const data = snapshot.val() || {};
  questions = Object.values(data); // تحويل الكائن إلى مصفوفة
  loadQuestionsList();             // تحديث العرض فورًا عند أي تغيير
});

// دالة عرض الأسئلة
function loadQuestionsList() {
  const container = document.getElementById('questionsList');
  container.innerHTML = '';

  // ترتيب الأسئلة حسب اليوم
  questions.sort((a, b) => a.day - b.day).forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';

    questionDiv.innerHTML = `
      <div class="question-header">
        <span class="question-day">اليوم ${question.day}</span>
        <small>من ${new Date(question.openDate).toLocaleString('ar-EG')} إلى ${new Date(question.closeDate).toLocaleString('ar-EG')}</small>
      </div>
      <div class="question-text">${question.text}</div>
      <div class="question-answers">
        ${question.answers.map((answer, index) => `
          <div class="answer-option ${index === question.correctAnswer ? 'correct' : ''}">
            ${answer} ${index === question.correctAnswer ? '✓' : ''}
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(questionDiv);
  });
}

// رفع الشعار
function handleLogoUpload(e) {
  e.preventDefault();

  const trainerCode = document.getElementById('logoTrainer').value;
  const fileInput = document.getElementById('logoFile');

  if (fileInput.files[0]) {
    const file = fileInput.files[0];
    const storage = getStorage();

    // مسار التخزين في Firebase Storage
    const storagePath = 'trainerLogos/' + trainerCode + '_' + Date.now();
    const logoStorageRef = storageRef(storage, storagePath);

    // رفع الملف
    uploadBytes(logoStorageRef, file)
      .then(() => getDownloadURL(logoStorageRef)) // الحصول على رابط الصورة
      .then((downloadURL) => {
        // نخزن رابط الصورة والمسار في قاعدة البيانات
        const logoDbRef = ref(db, "trainerLogos/" + trainerCode);

        return set(logoDbRef, {
          url: downloadURL,
          storagePath: storagePath,
          uploadedAt: new Date().toISOString()
        });
      })
      .then(() => {
        loadLogosGallery(); // تحديث المعرض فورًا
        document.getElementById('logoForm').reset();
        alert('تم رفع الشعار بنجاح!');
      })
      .catch((error) => {
        console.error("خطأ في رفع الشعار:", error);
        alert("حدث خطأ أثناء رفع الشعار");
      });
  } else {
    alert("الرجاء اختيار ملف أولًا");
  }
}

// تحميل معرض الشعارات
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Listener لمعرض الشعارات أونلاين
const logosRef = ref(db, "trainerLogos");

onValue(logosRef, (snapshot) => {
  const data = snapshot.val() || {};
  renderLogos(data);
});

// تحميل معرض الشعارات
function renderLogos(trainerLogos) {
  const gallery = document.getElementById('logosGallery');
  gallery.innerHTML = '';
  
  Object.entries(trainerLogos).forEach(([trainerCode, logoData]) => {
    const trainer = trainers.find(t => t.code === trainerCode);
    if (trainer) {
      const logoDiv = document.createElement('div');
      logoDiv.className = 'logo-item';
      logoDiv.innerHTML = `
        <div>
          <img src="${logoData.url}" alt="${trainer.name}" class="logo-preview">
          <span>${trainer.name}</span>
        </div>
        <button class="action-btn reject-btn" onclick="deleteLogo('${trainerCode}', '${logoData.storagePath}')">
          <i class="fas fa-trash"></i> حذف
        </button>
      `;
      gallery.appendChild(logoDiv);
    }
  });
}

// حذف الشعار أونلاين
function deleteLogo(trainerCode, storagePath) {
  if (!confirm('هل أنت متأكد من حذف هذا الشعار؟')) return;

  const logoDbRef = ref(db, "trainerLogos/" + trainerCode);
  const storage = getStorage();
  const logoStorageRef = storageRef(storage, storagePath);

  // أولاً نحذف من Firebase Storage
  deleteObject(logoStorageRef)
    .then(() => {
      // بعد كده نحذف من قاعدة البيانات
      return remove(logoDbRef);
    })
    .then(() => {
      alert('تم حذف الشعار بنجاح!');
    })
    .catch((error) => {
      console.error("خطأ في حذف الشعار:", error);
      alert('حدث خطأ أثناء الحذف');
    });
}

// تحميل بيانات المدير
function loadAdminData() {
  loadTrainersTable();
  loadRegistrationRequests();
  loadQuestionsList();
  loadLogosGallery();
}

// تحميل بيانات المدرب
function loadTrainerData() {
  // عرض شعار المدرب إن وجد
  const trainerLogo = document.getElementById('trainerLogo');
  if (trainerLogos[currentUser.code]) {
    trainerLogo.innerHTML = `<img src="${trainerLogos[currentUser.code]}" alt="${currentUser.name}">`;
  }
  
  loadTrainerQuestions();
  loadTrainerReports();
}

// تحميل أسئلة المدرب
function loadTrainerQuestions() {
  const container = document.getElementById('trainerQuestions');
  container.innerHTML = '';
  
  questions.sort((a, b) => a.day - b.day).forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    
    const now = new Date();
    const openDate = new Date(question.openDate);
    const closeDate = new Date(question.closeDate);
    const isActive = now >= openDate && now <= closeDate;
    const isPast = now > closeDate;
    
    questionDiv.innerHTML = `
      <div class="question-header">
        <span class="question-day">اليوم ${question.day}</span>
        <span class="question-status ${isActive ? 'active' : isPast ? 'past' : 'future'}">
          ${isActive ? 'نشط' : isPast ? 'منتهي' : 'قادم'}
        </span>
      </div>
      <div class="question-text">${question.text}</div>
      <div class="question-answers">
        ${question.answers.map((answer, index) => `
          <div class="answer-option ${index === question.correctAnswer ? 'correct' : ''}">
            ${answer} ${index === question.correctAnswer ? '✓' : ''}
          </div>
        `).join('')}
      </div>
    `;
    
    container.appendChild(questionDiv);
  });
}

// تحميل تقارير المدرب
function loadTrainerReports() {
  const tbody = document.querySelector('#reportsTable tbody');
  tbody.innerHTML = '';
  
  const trainerClients = clients.filter(client => client.trainer === currentUser.name);
  
  trainerClients.forEach((client, index) => {
    const clientStats = calculateClientStats(client.code);
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${client.name}</td>
      <td>${client.governorate}</td>
      <td>${client.phone}</td>
      <td>${clientStats.correct}</td>
      <td>${clientStats.wrong}</td>
      <td>${clientStats.percentage}%</td>
    `;
  });
}

// حساب إحصائيات العميل
function calculateClientStats(clientCode) {
  const answers = clientAnswers[clientCode] || {};
  let correct = 0;
  let wrong = 0;
  
  Object.values(answers).forEach(answer => {
    if (answer.isCorrect) {
      correct++;
    } else {
      wrong++;
    }
  });
  
  const total = correct + wrong;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return { correct, wrong, percentage };
}

// تحميل بيانات العميل
function loadClientData() {
  loadClientChallenges();
}

// تحميل تحديات العميل
function loadClientChallenges() {
  const grid = document.getElementById('challengesGrid');
  grid.innerHTML = '';
  
  for (let day = 1; day <= 30; day++) {
    const question = questions.find(q => q.day === day);
    const challengeBox = document.createElement('div');
    challengeBox.className = 'challenge-box';
    
    const now = new Date();
    let isLocked = true;
    
    if (question) {
      const openDate = new Date(question.openDate);
      const closeDate = new Date(question.closeDate);
      isLocked = now < openDate || now > closeDate;
    }
    
    if (isLocked) {
      challengeBox.classList.add('locked');
    }
    
    challengeBox.innerHTML = `
      <div class="challenge-number">${day}</div>
      ${isLocked ? '<i class="fas fa-lock lock-icon"></i>' : ''}
    `;
    
    if (!isLocked && question) {
      challengeBox.addEventListener('click', () => openQuestion(question));
    }
    
    grid.appendChild(challengeBox);
  }
}

// فتح السؤال
function openQuestion(question) {
  document.getElementById('modalQuestionTitle').textContent = `سؤال اليوم ${question.day}`;
  document.getElementById('modalQuestionText').textContent = question.text;
  
  const answersContainer = document.getElementById('modalAnswers');
  answersContainer.innerHTML = '';
  
  question.answers.forEach((answer, index) => {
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-option-modal';
    answerDiv.innerHTML = `
      <input type="radio" name="questionAnswer" value="${index}" id="answer_${index}">
      <label for="answer_${index}">${answer}</label>
    `;
    
    answerDiv.addEventListener('click', () => {
      document.querySelectorAll('.answer-option-modal').forEach(opt => opt.classList.remove('selected'));
      answerDiv.classList.add('selected');
      document.getElementById(`answer_${index}`).checked = true;
    });
    
    answersContainer.appendChild(answerDiv);
  });
  
  // حفظ السؤال الحالي
  window.currentQuestion = question;
  showModal('questionModal');
}

// إرسال الإجابة
function handleAnswerSubmission() {
  const selectedAnswer = document.querySelector('input[name="questionAnswer"]:checked');
  
  if (!selectedAnswer) {
    alert('يرجى اختيار إجابة');
    return;
  }
  
  const answerIndex = parseInt(selectedAnswer.value);
  const isCorrect = answerIndex === window.currentQuestion.correctAnswer;
  
  // حفظ الإجابة
 import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Reference لإجابات العملاء
const clientAnswersRef = ref(db, "clientAnswers");

// الاستماع للتغييرات لحظيًا
onValue(clientAnswersRef, snapshot => clientAnswers = snapshot.val() || {});

// دالة حفظ إجابة العميل
function saveClientAnswer(answerIndex, isCorrect) {
  if (!currentUser || !currentUser.code) return;

  const userCode = currentUser.code;
  const questionDay = window.currentQuestion.day;

  if (!clientAnswers[userCode]) {
    clientAnswers[userCode] = {};
  }

  clientAnswers[userCode][questionDay] = {
    answer: answerIndex,
    isCorrect: isCorrect,
    timestamp: new Date().toISOString()
  };

  // حفظ الإجابة على Firebase للتزامن اللحظي
  set(ref(db, `clientAnswers/${userCode}/${questionDay}`), clientAnswers[userCode][questionDay])
    .then(() => {
      console.log("تم حفظ إجابة العميل بنجاح");
    })
    .catch(error => {
      console.error("حدث خطأ أثناء حفظ الإجابة:", error);
    });
}

  // عرض النتيجة
  alert(isCorrect ? 'إجابة صحيحة! أحسنت' : 'إجابة خاطئة، حاول مرة أخرى غداً');
  
  closeModal('questionModal');
  loadClientChallenges();
}

// إرسال الاستبيان
function handleSurveySubmission(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const surveyData = {
    clientCode: currentUser.code,
    clientName: currentUser.name,
    experience: formData.get('experience'),
    difficulty: formData.get('difficulty'),
    designFeedback: formData.get('design_feedback'),
    recommend: formData.get('recommend'),
    timestamp: new Date().toISOString()
  };
  
  surveys.push(surveyData);
  localStorage.setItem('surveys', JSON.stringify(surveys));
  
  alert('تم إرسال الاستبيان بنجاح! شكراً لك');
  closeModal('surveyModal');
  e.target.reset();
}

// عرض تبويبات المدير
function showAdminTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// عرض تبويبات المدرب
function showTrainerTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// عرض النوافذ المنبثقة
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

// إغلاق النوافذ المنبثقة
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// تسجيل الخروج
function logout() {
  currentUser = null;
  currentUserType = null;
  showScreen('loginScreen');
  document.getElementById('loginForm').reset();
}

// تصدير التقرير
function exportReport() {
  const trainerClients = clients.filter(client => client.trainer === currentUser.name);
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "الرقم,اسم العميل,المحافظة,رقم الهاتف,الإجابات الصحيحة,الإجابات الخاطئة,النسبة المئوية\n";
  
  trainerClients.forEach((client, index) => {
    const stats = calculateClientStats(client.code);
    csvContent += `${index + 1},${client.name},${client.governorate},${client.phone},${stats.correct},${stats.wrong},${stats.percentage}%\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `تقرير_${currentUser.name}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('تم تصدير التقرير بنجاح!');
}

// إغلاق النوافذ المنبثقة عند النقر خارجها
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// منع إغلاق النافذة عند النقر على المحتوى
document.querySelectorAll('.modal-content').forEach(content => {
  content.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});
// حفظ البيانات تلقائياً كل 30 ثانية
// نعمل References لكل جدول في Firebase
const trainersRef = ref(db, "trainers");
const registrationRef = ref(db, "registrationRequests");
const questionsRef = ref(db, "questions");
const clientsRef = ref(db, "clients");
const surveysRef = ref(db, "surveys");
const clientAnswersRef = ref(db, "clientAnswers");
const trainerLogosRef = ref(db, "trainerLogos");

// ---------------------------
// 1️⃣ الاستماع للتغييرات وتحديث المتغيرات تلقائيًا
onValue(trainersRef, snapshot => trainers = snapshot.val() || {});
onValue(registrationRef, snapshot => registrationRequests = snapshot.val() || {});
onValue(questionsRef, snapshot => questions = snapshot.val() || {});
onValue(clientsRef, snapshot => clients = snapshot.val() || {});
onValue(surveysRef, snapshot => surveys = snapshot.val() || {});
onValue(clientAnswersRef, snapshot => clientAnswers = snapshot.val() || {});
onValue(trainerLogosRef, snapshot => trainerLogos = snapshot.val() || {});

// ---------------------------
// 2️⃣ الدالة لحفظ أي تغيير مباشرة على Firebase
function saveDataOnline() {
  set(trainersRef, trainers);
  set(registrationRef, registrationRequests);
  set(questionsRef, questions);
  set(clientsRef, clients);
  set(surveysRef, surveys);
  set(clientAnswersRef, clientAnswers);
  set(trainerLogosRef, trainerLogos);
}

// ---------------------------
// 3️⃣ حفظ تلقائي كل 30 ثانية (اختياري، لو عندك تغييرات متراكمة)
setInterval(saveDataOnline, 30000);

// إضافة بيانات تجريبية للاختبار (يمكن حذفها في الإنتاج)
import { ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Reference لجدول المدربين
const trainersRef = ref(db, "trainers");

// الاستماع لأي تغيير في المدربين (التزامن مع كل الأجهزة)
onValue(trainersRef, (snapshot) => {
  trainers = snapshot.val() || [];
});

// إضافة مدرب افتراضي إذا لم يوجد مدرب
function addDefaultTrainer() {
  if (!trainers || trainers.length === 0) {
    const defaultTrainer = {
      name: 'أحمد محمد',
      phone: '01234567890',
      amount: '500',
      code: 'TRAINER001',
      allowEdit: true,
      timestamp: new Date().toISOString()
    };

    // نستخدم push لإضافة المدرب الجديد في Firebase
    push(trainersRef, defaultTrainer)
      .then(() => {
        console.log("تم إضافة المدرب الافتراضي بنجاح!");
      })
      .catch((error) => {
        console.error("خطأ أثناء إضافة المدرب الافتراضي:", error);
      });
  }
}

// استدعاء الدالة عند تحميل الصفحة أو بدء المشروع
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// أولًا نتأكد من إضافة المدرب الافتراضي
addDefaultTrainer();

// Reference لجدول الأسئلة
const questionsRef = ref(db, "questions");

// الاستماع للتغييرات لحظيًا
onValue(questionsRef, snapshot => {
  questions = snapshot.val() ? Object.values(snapshot.val()) : [];

  // إذا لم يوجد أي سؤال، أضف السؤال الافتراضي
  if (questions.length === 0) {
    const sampleQuestion = {
      day: 1,
      openDate: new Date().toISOString(),
      closeDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      text: 'لزياده القوه العضلية يفضل؟',
      answers: [
        'اوزان ثقيله وتكررات قليله',
        'كارديو فقط',
        'اطالات فقط',
        'اوزان خفيفة وتكررات عاليه جدا'
      ],
      correctAnswer: 0,
      image: null,
      timestamp: new Date().toISOString()
    };

    // حفظ السؤال على Firebase للتزامن مع كل الأجهزة
    push(questionsRef, sampleQuestion)
      .then(() => console.log("تم إضافة السؤال الافتراضي بنجاح"))
      .catch(error => console.error("خطأ أثناء إضافة السؤال الافتراضي:", error));
  }
});
