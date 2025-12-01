const machineryData = [
  { id: 'excavadora-linkbelt-18', name: 'Linkbelt 18', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-29', name: 'Linkbelt 29', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-14', name: 'Linkbelt 14', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-volvo-04', name: 'Volvo 04', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-hyundai-02', name: 'Hyundai 02', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-kobelco-03', name: 'Kobelco 03', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-05', name: 'Linkbelt 05', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-ninguna', name: 'Ninguna', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-hyundai-agregada', name: 'Hyundai Agregada', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-08', name: 'Linkbelt 08', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-15', name: 'Linkbelt 15', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-xcmg', name: 'XCMG', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-hyundai-06', name: 'Hyundai 06', type: 'excavadora', status: 'en_espera' },
  { id: 'excavadora-linkbelt-17', name: 'Linkbelt 17', type: 'excavadora', status: 'en_espera' },
  { id: 'bulldozer-d6', name: 'Bulldozer D6', type: 'bulldozer', status: 'en_espera' },
  { id: 'patrol-xcmg', name: 'Patrol XCMG', type: 'patrol', status: 'en_espera' },
  { id: 'patrol-case', name: 'Patrol CASE', type: 'patrol', status: 'en_espera' },
  { id: 'patrol-hyundai', name: 'Patrol Hyundai', type: 'patrol', status: 'en_espera' },
];

const statusOptions = {
  activa_produccion: { label: 'Activa en producción', color: 'status-active-production' },
  activa_renta: { label: 'Activa en renta', color: 'status-active-rental' },
  inoperativa: { label: 'Inoperativa', color: 'status-inoperative' },
  en_espera: { label: 'En espera', color: 'status-waiting' },
};

const typeIcons = {
  excavadora: '⛏️',
  bulldozer: '🚜',
  patrol: '🚧',
  generic: '🏗️',
};

const machineListEl = document.getElementById('machineList');
const mapEl = document.getElementById('map');
const filterEl = document.getElementById('machineFilter');
const summaryEl = document.getElementById('summary');
const captureBtn = document.getElementById('captureBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetCanvas');
const toggleGridBtn = document.getElementById('toggleGrid');

function getIcon(type) {
  return typeIcons[type] || typeIcons.generic;
}

function getPinLabel(machine) {
  const numberMatch = machine.name.match(/(\d+)/);
  if (machine.type === 'excavadora' && numberMatch) {
    return numberMatch[1];
  }
  const parts = machine.name.split(' ');
  return parts[parts.length - 1];
}

function renderSummary() {
  const counts = Object.keys(statusOptions).reduce((acc, key) => {
    acc[key] = machineryData.filter(item => item.status === key).length;
    return acc;
  }, {});

  summaryEl.textContent = `Producción: ${counts.activa_produccion} · Renta: ${counts.activa_renta} · Inoperativa: ${counts.inoperativa} · En espera: ${counts.en_espera}`;
}

function createMachineCard(machine) {
  const card = document.createElement('div');
  card.className = 'machine-card';
  card.draggable = true;
  card.dataset.id = machine.id;

  const icon = document.createElement('div');
  icon.className = 'machine-icon';
  icon.textContent = getIcon(machine.type);

  const meta = document.createElement('div');
  meta.className = 'machine-meta';

  const name = document.createElement('h3');
  name.textContent = machine.name;

  const select = document.createElement('select');
  select.className = 'status-select';
  select.dataset.id = machine.id;
  Object.entries(statusOptions).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value.label;
    if (machine.status === key) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener('change', event => {
    const m = machineryData.find(item => item.id === machine.id);
    m.status = event.target.value;
    updatePinsForMachine(machine.id);
    renderSummary();
  });

  meta.appendChild(name);
  meta.appendChild(select);
  card.appendChild(icon);
  card.appendChild(meta);

  card.addEventListener('dragstart', event => {
    event.dataTransfer.setData('application/machine-id', machine.id);
    event.dataTransfer.effectAllowed = 'copy';
  });

  return card;
}

function renderMachineList(filter = '') {
  machineListEl.innerHTML = '';
  const normalizedFilter = filter.toLowerCase();
  machineryData
    .filter(machine =>
      machine.name.toLowerCase().includes(normalizedFilter) ||
      statusOptions[machine.status].label.toLowerCase().includes(normalizedFilter)
    )
    .forEach(machine => machineListEl.appendChild(createMachineCard(machine)));
}

function createPin(machineId, x, y) {
  const machine = machineryData.find(item => item.id === machineId);
  if (!machine) return;

  const pin = document.createElement('div');
  pin.className = 'pin';
  pin.dataset.machineId = machineId;
  pin.style.left = `${x}px`;
  pin.style.top = `${y}px`;

  const dot = document.createElement('span');
  dot.className = `dot ${statusOptions[machine.status].color}`;

  const icon = document.createElement('span');
  icon.textContent = getIcon(machine.type);

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = getPinLabel(machine);

  pin.appendChild(dot);
  pin.appendChild(icon);
  pin.appendChild(name);

  enableDragWithinMap(pin);
  mapEl.appendChild(pin);
  toggleHint();
}

function toggleHint() {
  const hasPins = mapEl.querySelectorAll('.pin').length > 0;
  const hint = mapEl.querySelector('.map-hint');
  hint.style.display = hasPins ? 'none' : 'grid';
}

function enableDragWithinMap(pin) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = event => {
    isDragging = true;
    offsetX = event.clientX - pin.getBoundingClientRect().left;
    offsetY = event.clientY - pin.getBoundingClientRect().top;
    pin.style.cursor = 'grabbing';
  };

  const onMouseMove = event => {
    if (!isDragging) return;
    const rect = mapEl.getBoundingClientRect();
    const x = event.clientX - rect.left - offsetX;
    const y = event.clientY - rect.top - offsetY;
    pin.style.left = `${Math.min(Math.max(x, 0), rect.width - pin.offsetWidth)}px`;
    pin.style.top = `${Math.min(Math.max(y, 0), rect.height - pin.offsetHeight)}px`;
  };

  const onMouseUp = () => {
    isDragging = false;
    pin.style.cursor = 'grab';
  };

  pin.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function updatePinsForMachine(machineId) {
  const machine = machineryData.find(item => item.id === machineId);
  mapEl.querySelectorAll(`[data-machine-id="${machineId}"]`).forEach(pin => {
    const dot = pin.querySelector('.dot');
    dot.className = `dot ${statusOptions[machine.status].color}`;
  });
}

mapEl.addEventListener('dragover', event => {
  event.preventDefault();
});

mapEl.addEventListener('drop', event => {
  event.preventDefault();
  const rect = mapEl.getBoundingClientRect();
  const machineId = event.dataTransfer.getData('application/machine-id');
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  createPin(machineId, x, y);
});

filterEl.addEventListener('input', event => {
  renderMachineList(event.target.value);
});

captureBtn.addEventListener('click', () => {
  html2canvas(mapEl).then(canvas => {
    const link = document.createElement('a');
    link.download = 'distribucion-maquinaria.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

exportBtn.addEventListener('click', () => {
  const lines = machineryData.map(machine => {
    const status = statusOptions[machine.status].label;
    return `${machine.name}: ${status}`;
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'maquinaria-status.txt';
  link.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener('click', () => {
  mapEl.querySelectorAll('.pin').forEach(pin => pin.remove());
  toggleHint();
});

toggleGridBtn.addEventListener('click', () => {
  mapEl.classList.toggle('grid');
});

renderMachineList();
renderSummary();
