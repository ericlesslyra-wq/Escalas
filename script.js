
  // Importa Firebase SDK
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  // --- CONFIGURAÇÃO DO FIREBASE (a mesma que você já tinha) ---
  const firebaseConfig = {
    apiKey: "AIzaSyB6hsuG9GVYnbjXgm5dKY7Oio7hs_tPVqw",
    authDomain: "escala-6399b.firebaseapp.com",
    projectId: "escala-6399b",
    storageBucket: "escala-6399b.firebasestorage.app",
    messagingSenderId: "176655623745",
    appId: "1:176655623745:web:76ed7df3f347538d9608c0",
    measurementId: "G-W47E6TWSKV"
  };

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // --- CÓDIGO DO SEU SCRIPT ADAPTADO ---
  const analysts = ["Trabalhando","Plantão"];
  const adminPassword = "admin321";
  const userPassword = "lyra1";
  let userRole = '';

  async function checkPassword() {
    const inputPassword = document.getElementById("password").value;
    if (inputPassword === adminPassword) {
        userRole = 'admin';
    } else if (inputPassword === userPassword) {
        userRole = 'user';
    } else {
        alert("Senha incorreta!");
        return;
    }

    document.getElementById("passwordPrompt").classList.add("hidden");
    document.getElementById("schedule").classList.remove("hidden");
    await generateSchedule();
  }

  async function generateSchedule() {
    const monthInput = document.getElementById("month").value;
    if (!monthInput) return;

    const [year, month] = monthInput.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const tbody = document.querySelector("#schedule tbody");
    tbody.innerHTML = "";

    // Busca dados salvos no Firestore
    const docRef = doc(db, "schedules", `${year}-${month}`);
    const docSnap = await getDoc(docRef);
    let savedSchedule = docSnap.exists() ? docSnap.data() : {};

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${day}/${month}/${year}</td>
          <td>${dayOfWeek}</td>
          ${Array.from({ length: 7 }, (_, i) => 
            generateSelectCell(savedSchedule[`${day}-${i}`] || "Trabalhando", day, i, year, month)
          ).join('')}
        `;
        tbody.appendChild(row);
    }
  }

  function generateSelectCell(selectedValue, day, index, year, month) {
    let className = "";
    if (selectedValue === "Trabalhando") className = "trabalhando";
    if (selectedValue === "Plantão") className = "plantao";

    return `
      <td class="${className}">
        <select onchange="updateCellColor(this, ${day}, ${index}, ${year}, ${month})" ${userRole === 'admin' ? '' : 'disabled'}>
          ${analysts.map(analyst => 
            `<option value="${analyst}" ${analyst === selectedValue ? 'selected' : ''}>${analyst}</option>`
          ).join('')}
        </select>
      </td>
    `;
  }

  // --- Salvar no Firestore ---
  window.updateCellColor = async function(selectElement, day, index, year, month) {
    if (userRole !== 'admin') return;

    const td = selectElement.parentElement;
    const value = selectElement.value;

    td.className = value === "Trabalhando" ? "trabalhando" : 
                   value === "Plantão" ? "plantao" : "";

    // Pega dados existentes no Firestore
    const docRef = doc(db, "schedules", `${year}-${month}`);
    const docSnap = await getDoc(docRef);
    let savedSchedule = docSnap.exists() ? docSnap.data() : {};

    // Atualiza o valor alterado
    savedSchedule[`${day}-${index}`] = value;

    // Salva no Firestore
    await setDoc(docRef, savedSchedule);
  }

  window.onload = () => {
    const currentDate = new Date();
    const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById("month").value = defaultMonth;
  };

  // Expõe checkPassword para o HTML
  window.checkPassword = checkPassword;

