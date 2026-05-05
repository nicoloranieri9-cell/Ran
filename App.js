const form = document.getElementById('vehicleForm');
const vehicleList = document.getElementById('vehicleList');
const empty = document.getElementById('empty');
const togglePlanBtn = document.getElementById('togglePlan');
const planStatus = document.getElementById('planStatus');

const STORAGE_KEY = 'vehicleAppState';
const defaultState = { premium: false, vehicles: [] };
let state = loadState();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      premium: Boolean(parsed.premium),
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('it-IT');
}

function expiryInfo(dateStr) {
  if (!dateStr) return { text: 'non impostata', cls: 'neutral' };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { text: 'data non valida', cls: 'warning' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.round((date - today) / 86400000);
  if (diffDays < 0) return { text: `scaduta da ${Math.abs(diffDays)} gg`, cls: 'danger' };
  if (diffDays <= 30) return { text: `scade tra ${diffDays} gg`, cls: 'warning' };
  return { text: `ok (${diffDays} gg)`, cls: 'ok' };
}

function renderField(label, dateValue) {
  const info = expiryInfo(dateValue);
  return `<div class="small">${label}: <strong>${formatDate(dateValue)}</strong> <span class="pill ${info.cls}">${info.text}</span></div>`;
}

function render() {
  vehicleList.innerHTML = '';
  empty.style.display = state.vehicles.length ? 'none' : 'block';
  planStatus.innerHTML = `Piano attivo: <strong>${state.premium ? 'Premium (5,90€ / anno)' : 'Base'}</strong>`;
  togglePlanBtn.textContent = state.premium ? 'Disattiva Premium' : 'Attiva Premium';

  state.vehicles.forEach((v, idx) => {
    const card = document.createElement('article');
    card.className = 'vehicle';
    card.innerHTML = `
      <h3>${v.model} - ${v.plate}</h3>
      ${renderField('Revisione', v.inspection)}
      ${renderField('Assicurazione', v.insurance)}
      ${state.premium ? renderField('Bollo', v.tax) : ''}
      ${state.premium ? renderField('Tagliando', v.service) : ''}
      <button data-remove="${idx}" class="danger-btn">Rimuovi</button>
    `;
    vehicleList.appendChild(card);
  });

  document.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.remove);
      state.vehicles.splice(i, 1);
      save();
      render();
    };
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!state.premium && state.vehicles.length >= 1) {
    alert('Con il piano Base puoi registrare solo 1 veicolo. Attiva Premium (5,90€ / anno) per aggiungerne altri.');
    return;
  }

  const plate = document.getElementById('plate').value.trim().toUpperCase();
  const model = document.getElementById('model').value.trim();

  if (!plate || !model) {
    alert('Inserisci targa e modello.');
    return;
  }

  const vehicle = {
    plate,
    model,
    inspection: document.getElementById('inspection').value,
    insurance: document.getElementById('insurance').value,
    tax: document.getElementById('tax').value,
    service: document.getElementById('service').value,
  };

  state.vehicles.push(vehicle);
  save();
  render();
  form.reset();
});

togglePlanBtn.addEventListener('click', () => {
  state.premium = !state.premium;
  save();
  render();
});

render();

