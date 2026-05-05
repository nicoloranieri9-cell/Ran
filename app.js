const form = document.getElementById('vehicleForm');
const vehicleList = document.getElementById('vehicleList');
const empty = document.getElementById('empty');
const togglePlanBtn = document.getElementById('togglePlan');
const planStatus = document.getElementById('planStatus');

let state = JSON.parse(localStorage.getItem('vehicleAppState') || '{"premium":false,"vehicles":[]}');

function save() {
  localStorage.setItem('vehicleAppState', JSON.stringify(state));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT');
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
      <div class="small">Revisione: <strong>${formatDate(v.inspection)}</strong></div>
      <div class="small">Assicurazione: <strong>${formatDate(v.insurance)}</strong></div>
      ${state.premium ? `<div class="small">Bollo: <strong>${formatDate(v.tax)}</strong></div>
      <div class="small">Tagliando: <strong>${formatDate(v.service)}</strong></div>` : ''}
      <button data-remove="${idx}">Rimuovi</button>
    `;
    vehicleList.appendChild(card);
  });

  document.querySelectorAll('[data-remove]').forEach(btn => {
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

  const vehicle = {
    plate: document.getElementById('plate').value.trim().toUpperCase(),
    model: document.getElementById('model').value.trim(),
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
