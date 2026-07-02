const API = "http://localhost:3000/api";
let token = localStorage.getItem("token") || null;

// 12 hour format
function convertTo12Hour(time) {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// ===== DARK MODE =====
function toggleDark() {
  document.body.classList.toggle("dark");
  const btn = document.querySelector(".dark-toggle");
  btn.textContent = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}
// Helper funtion
function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "admin";
}

async function deleteQuestion(questionId) {
  if (!confirm("Are you sure you want to delete this question?")) return;

  try {
    const res = await fetch(`${API}/qa/questions/${questionId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      alert("Question deleted!");
      getAllQuestions();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to delete question.");
  }
}

// ===== NAVIGATION =====
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const link = document.querySelector(`[onclick="showSection('${id}')"]`);
  if (link) link.classList.add("active");
  window.scrollTo(0, 0);

  // Auto load content when section opens
  if (id === "mosques") loadAllMosques();
  if (id === "maktab") loadAllMaktabs();
  if (id === "events") loadAllEvents();
  if (id === "qa") getAllQuestions();
  if (id === "prayer") loadPrayerTimes();
  if (id === "ramadan") loadRamadanSchedule();
}

// ===== AUTH =====
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) { alert("Please enter email and password!"); return; }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.data));
      updateAuthUI();
      showSection("home");
      alert(`Welcome back ${data.data.name}!`);
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Login failed. Please try again.");
  }
}

async function register() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) { alert("Please fill all fields!"); return; }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (data.success) {
      token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.data));
      updateAuthUI();
      showSection("home");
      alert(`Welcome ${data.data.name}!`);
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Registration failed. Please try again.");
  }
}

function logout() {
  token = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateAuthUI();
  showSection("home");
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authButtons = document.querySelector(".auth-buttons");

  if (user) {
    authButtons.innerHTML = `
      ${user.role === "admin" ? `<a href="#" class="nav-link" onclick="showSection('admin')">⚙️ Admin</a>` : ""}
      <a href="#" class="nav-link" onclick="showSection('profile'); loadProfile();">👤 ${user.name}</a>
      <button class="btn-login" onclick="logout()">Logout</button>
      <button class="dark-toggle" onclick="toggleDark()">🌙 Dark</button>
    `;
  } else {
    authButtons.innerHTML = `
      <button class="btn-login" onclick="showSection('login')">Login</button>
      <button class="dark-toggle" onclick="toggleDark()">🌙 Dark</button>
    `;
  }
}



// ===== HOME =====
async function loadHomeStats() {
  try {
    const [mosquesRes, eventsRes, questionsRes] = await Promise.all([
      fetch(`${API}/mosques/region/Dhaka`),
      fetch(`${API}/events/region/Dhaka`),
      fetch(`${API}/qa/questions`)
    ]);

    const mosques = await mosquesRes.json();
    const events = await eventsRes.json();
    const questions = await questionsRes.json();

    document.getElementById("totalMosques").textContent = mosques.count || 0;
    document.getElementById("totalEvents").textContent = events.count || 0;
    document.getElementById("totalQuestions").textContent = questions.count || 0;
  } catch (err) {
    console.error("Stats load failed:", err);
  }
}

async function loadHomeAnnouncements() {
  try {
    const res = await fetch(`${API}/events/upcoming`);
    const data = await res.json();
    const div = document.getElementById("homeEvents");

    if (!data.data || data.data.length === 0) {
      div.innerHTML = "<p>No upcoming events.</p>";
      return;
    }

    div.innerHTML = data.data.slice(0, 3).map(e => `
      <div class="event-announcement-card">
        ${e.imageUrl ? `<img src="${e.imageUrl}" alt="${e.title}">` : `<div class="no-image">📅</div>`}
        <div class="event-announcement-body">
          <h3>${e.title}</h3>
          <p>🎤 ${e.speaker}</p>
          <p>📅 ${new Date(e.eventDate).toLocaleDateString('en-BD')}</p>
          <p>⏰ ${e.eventTime}</p>
          ${e.location ? `<p>📍 ${e.location}</p>` : ""}
          <span class="card-badge ${e.isFree ? 'free' : 'paid'}">${e.isFree ? "Free Entry" : "Paid"}</span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    document.getElementById("homeEvents").innerHTML = "<p>Could not load events.</p>";
  }
}

// ===== MOSQUES =====
async function loadAllMosques() {
  const div = document.getElementById("mosqueResults");
  div.innerHTML = "<p>Loading mosques...</p>";

  try {
    const res = await fetch(`${API}/mosques/region/Dhaka`);
    const data = await res.json();
    displayMosques(data.data, div);
  } catch (err) {
    div.innerHTML = "<p>Could not load mosques.</p>";
  }
}

async function searchMosque() {
  const query = document.getElementById("mosqueSearchInput").value;
  if (!query) { alert("Please enter a region or name!"); return; }

  const div = document.getElementById("mosqueResults");
  div.innerHTML = "<p>Searching...</p>";

  try {
    const [regionRes, nameRes] = await Promise.all([
      fetch(`${API}/mosques/region/${query}`),
      fetch(`${API}/mosques/search/${query}`)
    ]);

    const regionData = await regionRes.json();
    const nameData = await nameRes.json();

    const allMosques = [...(regionData.data || []), ...(nameData.data || [])];
    const unique = allMosques.filter((m, index, self) =>
      index === self.findIndex(t => t.id === m.id)
    );

    displayMosques(unique, div);
  } catch (err) {
    div.innerHTML = "<p>Search failed.</p>";
  }
}



function displayMosques(mosques, div) {
  if (!mosques || mosques.length === 0) {
    div.innerHTML = "<p>No mosques found.</p>";
    return;
  }

  div.innerHTML = mosques.map(m => `
    <div class="card mosque-card">
      ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.name}" class="card-image">` : ""}
      <div class="card-body">
        <h3>🕌 ${m.name}</h3>
        <p>📍 ${m.address}</p>
        <p>🗺️ Region: ${m.region}</p>
        ${m.imamName ? `<p>👳 Imam: ${m.imamName}</p>` : ""}
        ${m.muazzinName ? `<p>🔊 Muazzin: ${m.muazzinName}</p>` : ""}
        ${m.fajrTime ? `
          <div class="prayer-mini">
            <span>Fajr: ${m.fajrTime}</span>
            <span>Zuhr: ${m.zuhrTime}</span>
            <span>Asr: ${m.asrTime}</span>
            <span>Maghrib: ${m.maghribTime}</span>
            <span>Isha: ${m.ishaTime}</span>
          </div>
        ` : ""}
        ${m.latitude ? `
          <a href="https://maps.google.com/?q=${m.latitude},${m.longitude}" 
             target="_blank" class="map-btn">🗺️ View on Google Maps</a>
        ` : ""}
      </div>
    </div>
  `).join("");
}

// ===== MAKTAB =====
async function loadAllMaktabs() {
  const div = document.getElementById("maktabResults");
  div.innerHTML = "<p>Loading Maktabs...</p>";

  try {
    const res = await fetch(`${API}/maktabs`);
    const data = await res.json();
    displayMaktabs(data.data, div);
  } catch (err) {
    div.innerHTML = "<p>Could not load Maktabs.</p>";
  }
}

async function searchMaktabByName() {
  const name = document.getElementById("maktabSearchInput").value;
  if (!name) { alert("Please enter a name!"); return; }

  const div = document.getElementById("maktabResults");
  div.innerHTML = "<p>Searching...</p>";

  try {
    const res = await fetch(`${API}/maktabs/search/${name}`);
    const data = await res.json();
    displayMaktabs(data.data, div);
  } catch (err) {
    div.innerHTML = "<p>Search failed.</p>";
  }
}


function displayMaktabs(maktabs, div) {
  if (!maktabs || maktabs.length === 0) {
    div.innerHTML = "<p>No Maktabs found.</p>";
    return;
  }

  div.innerHTML = maktabs.map(m => `
    <div class="card">
      ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.name}" class="card-image">` : ""}
      <div class="card-body">
        <h3>📚 ${m.name}</h3>
        ${m.address ? `<p>📍 ${m.address}</p>` : ""}
        <p>👨‍🏫 Ustad: ${m.teacherName}</p>
        <p>📞 ${m.teacherPhone}</p>
        <p>🪑 Total Seats: ${m.totalSeats}</p>
        ${m.coursesOffered ? `<p>📖 Courses: ${m.coursesOffered}</p>` : ""}
        ${m.mosque ? `<p>🕌 Mosque: ${m.mosque.name}</p>` : `<span class="card-badge">Independent</span>`}
      </div>
    </div>
  `).join("");
}

// ===== EVENTS =====
async function loadAllEvents() {
  const div = document.getElementById("eventResults");
  div.innerHTML = "<p>Loading events...</p>";

  try {
    const res = await fetch(`${API}/events/region/Dhaka`);
    const data = await res.json();
    displayEvents(data.data, div);
  } catch (err) {
    div.innerHTML = "<p>Could not load events.</p>";
  }
}

async function getEvents() {
  const region = document.getElementById("eventRegionInput").value;
  if (!region) { alert("Please enter a region!"); return; }

  const div = document.getElementById("eventResults");
  div.innerHTML = "<p>Searching...</p>";

  try {
    const res = await fetch(`${API}/events/region/${region}`);
    const data = await res.json();
    displayEvents(data.data, div);
  } catch (err) {
    div.innerHTML = "<p>Search failed.</p>";
  }
}

function displayEvents(events, div) {
  if (!events || events.length === 0) {
    div.innerHTML = "<p>No events found.</p>";
    return;
  }

  div.innerHTML = events.map(e => `
    <div class="card event-card">
      ${e.imageUrl ? `<img src="${e.imageUrl}" alt="${e.title}" class="card-image">` : ""}
      <div class="card-body">
        <h3>📅 ${e.title}</h3>
        <p>📖 Topic: ${e.topic}</p>
        <p>🎤 Speaker: ${e.speaker}</p>
        <p>📅 Date: ${new Date(e.eventDate).toLocaleDateString('en-BD')}</p>
        <p>⏰ Time: ${e.eventTime}</p>
        ${e.location ? `<p>📍 Location: ${e.location}</p>` : ""}
        ${e.description ? `<p>ℹ️ ${e.description}</p>` : ""}
        ${e.mosque ? `<p>🕌 Mosque: ${e.mosque.name}</p>` : ""}
        <span class="card-badge ${e.isFree ? 'free' : 'paid'}">${e.isFree ? "Free Entry" : "Paid Entry"}</span>
        <span class="card-badge">${e.status}</span>
      </div>
    </div>
  `).join("");
}

// ===== Q&A =====
async function postQuestion() {
  if (!token) { alert("Please login to ask a question!"); showSection("login"); return; }

  const title = document.getElementById("questionTitle").value;
  const body = document.getElementById("questionBody").value;
  const category = document.getElementById("questionCategory").value;

  if (!title || !body || !category) { alert("Please fill all fields!"); return; }

  try {
    const res = await fetch(`${API}/qa/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, body, category }),
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById("questionTitle").value = "";
      document.getElementById("questionBody").value = "";
      document.getElementById("questionCategory").value = "";
      alert("Question posted successfully!");
      getAllQuestions();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to post question.");
  }
}

let allQuestionsData = [];
let questionsShown = 3;

async function getAllQuestions() {
  const div = document.getElementById("qaResults");
  div.innerHTML = "<p>Loading questions...</p>";

  try {
    const res = await fetch(`${API}/qa/questions`);
    const data = await res.json();

    if (data.count === 0) {
      div.innerHTML = "<p>No questions yet. Be the first to ask!</p>";
      return;
    }

    allQuestionsData = data.data;
    questionsShown = 3;
    renderQuestions();
  } catch (err) {
    div.innerHTML = "<p>Could not load questions.</p>";
  }
}

function renderQuestions() {
  const div = document.getElementById("qaResults");
  const toShow = allQuestionsData.slice(0, questionsShown);

  div.innerHTML = toShow.map(q => {
    const answers = q.answers || [];
    const visibleAnswers = answers.slice(0, 2);
    const hasMore = answers.length > 2;

    return `
    <div class="card qa-card">
      <h3>❓ ${q.title}</h3>
      <p>${q.body}</p>
      <p>📂 Category: ${q.category}</p>
      <p>👤 Asked by: ${q.user?.name}</p>
      <p>💬 ${answers.length} Answer(s)</p>
      ${isAdmin() ? `<button class="delete-btn" onclick="deleteQuestion('${q.id}')">🗑️ Delete</button>` : ""}
      ${answers.length > 0 ? `
        <div class="answers" id="answers-${q.id}">
          <h4>Answers:</h4>
          ${visibleAnswers.map(a => `
            <div class="answer-item">
              <p>${a.body}</p>
              ${a.isAccepted ? '<span class="card-badge accepted">✅ Best Answer</span>' : ""}
            </div>
          `).join("")}
        </div>
        ${hasMore ? `<button class="view-all-btn" onclick="viewAllAnswers('${q.id}')">View All ${answers.length} Answers</button>` : ""}
      ` : ""}
      <div class="answer-form">
        <input type="text" id="answer-${q.id}" placeholder="Write your answer...">
        <button onclick="postAnswer('${q.id}')">Reply</button>
      </div>
    </div>
  `}).join("");

  if (questionsShown < allQuestionsData.length) {
    div.innerHTML += `<button class="btn-primary" onclick="loadMoreQuestions()">Load More Questions</button>`;
  }
}

function viewAllAnswers(questionId) {
  const question = allQuestionsData.find(q => q.id === questionId);
  const answersDiv = document.getElementById(`answers-${questionId}`);

  answersDiv.innerHTML = `
    <h4>All Answers:</h4>
    ${question.answers.map(a => `
      <div class="answer-item">
        <p>${a.body}</p>
        ${a.isAccepted ? '<span class="card-badge accepted">✅ Best Answer</span>' : ""}
      </div>
    `).join("")}
  `;
}


function loadMoreQuestions() {
  questionsShown += 3;
  renderQuestions();
}


async function postAnswer(questionId) {
  if (!token) { alert("Please login to answer!"); showSection("login"); return; }

  const body = document.getElementById(`answer-${questionId}`).value;
  if (!body) { alert("Please write an answer!"); return; }

  try {
    const res = await fetch(`${API}/qa/questions/${questionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();

    if (data.success) {
      alert("Answer posted!");
      getAllQuestions();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to post answer.");
  }
}


// ===== PRAYER TIMES =====
async function loadPrayerTimes() {
  const city = document.getElementById("prayerCity")?.value || "Dhaka";
  fetchPrayerTimes(city);
}

async function fetchPrayerTimes(city) {
  const div = document.getElementById("prayerResults");
  div.innerHTML = "<p>Loading prayer times...</p>";

  try {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Bangladesh&method=1`);
    const data = await res.json();

    if (data.code !== 200) {
      div.innerHTML = "<p>Could not load prayer times.</p>";
      return;
    }

    const t = data.data.timings;
    const date = data.data.date.readable;

    div.innerHTML = `
      <div class="prayer-card">
        <h3>🕌 Prayer Times for ${city}</h3>
        <p>📅 ${date}</p>
        <div class="prayer-times-grid">
          <div class="prayer-time-item fajr">
            <span class="prayer-name">Fajr</span>
            <span class="prayer-time">${convertTo12Hour(t.Fajr)}</span>
          </div>
          <div class="prayer-time-item">
            <span class="prayer-name">Sunrise</span>
            <span class="prayer-time">${convertTo12Hour(t.Sunrise)}</span>
          </div>
          <div class="prayer-time-item zuhr">
            <span class="prayer-name">Zuhr</span>
            <span class="prayer-time">${convertTo12Hour(t.Dhuhr)}</span>
          </div>
          <div class="prayer-time-item asr">
            <span class="prayer-name">Asr</span>
            <span class="prayer-time">${convertTo12Hour(t.Asr)}</span>
          </div>
          <div class="prayer-time-item maghrib">
            <span class="prayer-name">Maghrib</span>
            <span class="prayer-time">${convertTo12Hour(t.Maghrib)}</span>
          </div>
          <div class="prayer-time-item isha">
            <span class="prayer-name">Isha</span>
            <span class="prayer-time">${convertTo12Hour(t.Isha)}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = "<p>Could not load prayer times. Check your internet connection.</p>";
  }
}

// ===== RAMADAN SCHEDULE =====
async function loadRamadanSchedule() {
  const city = document.getElementById("ramadanCity")?.value || "Dhaka";
  fetchRamadanSchedule(city);
}

async function fetchRamadanSchedule(city) {
  const div = document.getElementById("ramadanResults");
  div.innerHTML = "<p>Loading Ramadan schedule...</p>";

  try {
    // Ramadan 2027 - month 9, year 2027
    const res = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${city}&country=Bangladesh&method=1&month=3&year=2027`);
    const data = await res.json();

    if (data.code !== 200) {
      div.innerHTML = "<p>Could not load Ramadan schedule.</p>";
      return;
    }

    div.innerHTML = `
      <div class="ramadan-header">
        <h3>🌙 Ramadan 2027 Schedule — ${city}</h3>
        <p>Sehri ends at Fajr time | Iftar at Maghrib time</p>
      </div>
      <div class="ramadan-table">
        <div class="ramadan-row header">
          <span>Date</span>
          <span>Sehri (Fajr)</span>
          <span>Iftar (Maghrib)</span>
        </div>
        ${data.data.map((day, i) => `
          <div class="ramadan-row ${i % 2 === 0 ? 'even' : ''}">
            <span>${i + 1} Ramadan | ${day.date.readable}</span>
            <span>🌙 ${day.timings.Fajr}</span>
            <span>🌅 ${day.timings.Maghrib}</span>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    div.innerHTML = "<p>Could not load Ramadan schedule. Check your internet connection.</p>";
  }
}

// ===== PROFILE =====
async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) { showSection("login"); return; }

  document.getElementById("profileName").value = user.name;
  document.getElementById("profileEmail").value = user.email;
}

async function updateProfile() {
  const name = document.getElementById("profileName").value;
  const email = document.getElementById("profileEmail").value;
  const password = document.getElementById("profilePassword").value;

  const body = {};
  if (name) body.name = name;
  if (email) body.email = email;
  if (password) body.password = password;

  try {
    const res = await fetch(`${API}/auth/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.data));
      updateAuthUI();
      document.getElementById("profilePassword").value = "";
      alert("Profile updated successfully!");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Update failed. Please try again.");
  }
}
// ===== ADMIN =====
function showAdminTab(tabId) {
  document.querySelectorAll(".admin-tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

async function adminAddMosque() {
  const body = {
    name: document.getElementById("m_name").value,
    address: document.getElementById("m_address").value,
    region: document.getElementById("m_region").value,
    imamName: document.getElementById("m_imam").value,
    muazzinName: document.getElementById("m_muazzin").value,
    imageUrl: document.getElementById("m_image").value,
    latitude: parseFloat(document.getElementById("m_lat").value) || null,
    longitude: parseFloat(document.getElementById("m_lng").value) || null,
  };

  if (!body.name || !body.address || !body.region) { alert("Name, address and region are required!"); return; }

  try {
    const res = await fetch(`${API}/mosques`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      alert("Mosque added successfully!");
      document.querySelectorAll("#addMosqueTab input").forEach(i => i.value = "");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to add mosque.");
  }
}

async function adminAddMaktab() {
  const body = {
    name: document.getElementById("mk_name").value,
    address: document.getElementById("mk_address").value,
    teacherName: document.getElementById("mk_teacher").value,
    teacherPhone: document.getElementById("mk_phone").value,
    totalSeats: parseInt(document.getElementById("mk_seats").value),
    coursesOffered: document.getElementById("mk_courses").value,
    imageUrl: document.getElementById("mk_image").value,
    mosqueId: document.getElementById("mk_mosqueId").value || null,
  };

  if (!body.name || !body.teacherName || !body.teacherPhone || !body.totalSeats) { alert("Name, teacherName, phone and seats are required!"); return; }

  try {
    const res = await fetch(`${API}/maktabs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      alert("Maktab added successfully!");
      document.querySelectorAll("#addMaktabTab input").forEach(i => i.value = "");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to add maktab.");
  }
}

async function adminAddEvent() {
  const body = {
    title: document.getElementById("e_title").value,
    topic: document.getElementById("e_topic").value,
    speaker: document.getElementById("e_speaker").value,
    eventDate: document.getElementById("e_date").value,
    eventTime: document.getElementById("e_time").value,
    location: document.getElementById("e_location").value,
    description: document.getElementById("e_description").value,
    imageUrl: document.getElementById("e_image").value,
    mosqueId: document.getElementById("e_mosqueId").value || null,
  };

  if (!body.title || !body.topic || !body.speaker || !body.eventDate || !body.eventTime) { alert("Title, topic, speaker, date and time are required!"); return; }

  try {
    const res = await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      alert("Event added successfully!");
      document.querySelectorAll("#addEventTab input").forEach(i => i.value = "");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Failed to add event.");
  }
}

// ===== INIT =====
updateAuthUI();
loadHomeStats();
loadHomeAnnouncements();
getAllQuestions();
