/**
 * DigitalOcean Control Panel Simulator - Core Application Engine
 * Pure modular Vanilla JS managing State, Telemetry Streams, SVG Charts,
 * mock Linux terminals, Git deployment builders, and interactive guides.
 */

// ==================== APP STATE ====================
const state = {
  theme: localStorage.getItem('do-theme') || 'dark',
  activeView: 'dashboard',
  
  // Default Droplets (VMs)
  droplets: [
    {
      id: 'drop-1',
      name: 'production-api-server',
      ip: '157.245.18.232',
      os: 'Ubuntu 22.04 LTS',
      ram: '2 GB',
      cpu: '2 vCPUs',
      disk: '50 GB SSD',
      region: 'New York (NYC3)',
      status: 'active', // active, creating, stopped
      progress: 100,
      uptime: '14 days'
    },
    {
      id: 'drop-2',
      name: 'microservice-auth-node',
      ip: '167.99.122.45',
      os: 'Debian 12 Bookworm',
      ram: '1 GB',
      cpu: '1 vCPU',
      disk: '25 GB SSD',
      region: 'Amsterdam (AMS3)',
      status: 'active',
      progress: 100,
      uptime: '3 days'
    },
    {
      id: 'drop-3',
      name: 'database-replica-postgres',
      ip: '143.110.180.12',
      os: 'Ubuntu 22.04 LTS',
      ram: '2 GB',
      cpu: '2 vCPUs',
      disk: '50 GB SSD',
      region: 'Bangalore (BLR1)',
      status: 'stopped',
      progress: 100,
      uptime: 'Offline'
    }
  ],

  // Real-Time Telemetry Data Buffers (rolling 20 values for charts)
  telemetry: {
    selectedDropletId: 'drop-1',
    cpu: Array(20).fill(15), // percentages
    ram: Array(20).fill(42), // percentages
    dbConnections: Array(20).fill(12) // active pools
  },

  // Firewall rules
  firewallRules: [
    { id: 'fw-1', type: 'SSH (Secure Shell)', protocol: 'TCP', port: '22', sources: '0.0.0.0/0' },
    { id: 'fw-2', type: 'HTTP Webserver', protocol: 'TCP', port: '80', sources: '0.0.0.0/0' },
    { id: 'fw-3', type: 'HTTPS SSL Security', protocol: 'TCP', port: '443', sources: '0.0.0.0/0' }
  ],

  // App Platform Deployments
  appDeployments: {
    isBuilding: false,
    logStreamTimer: null
  },

  // Onboarding Guided Tour Configurations
  tour: {
    step: 0,
    active: false,
    steps: [
      {
        targetId: 'tour-billing-badge',
        title: 'Your Cloud Promo Credits',
        desc: 'You have been awarded $200.00 free credits via the GitHub Student Developer Pack! This covers all simulated resources for a full year.'
      },
      {
        targetId: 'tour-create-btn',
        title: 'Create Cloud Resources',
        desc: 'Use this single dropdown menu to spin up droplets (VMs), Kubernetes clusters, or host serverless web apps directly from GitHub.'
      },
      {
        targetId: 'tour-droplet-list',
        title: 'Manage Server Instances',
        desc: 'This list displays your active droplets. You can click on instances to inspect metrics, shut them down, or click "Console" to open a live simulated SSH terminal!'
      },
      {
        targetId: 'tour-telemetry-graphs',
        title: 'Real-Time Telemetry Telecast',
        desc: 'These graphs update live every second, displaying precise resource usage metrics draw dynamically using local inline SVG pathways.'
      },
      {
        targetId: 'tour-firewall-config',
        title: 'Configure Firewall Rules',
        desc: 'Under VPC & Firewalls, you can add custom ingress TCP/UDP rule sets to secure your virtual networks immediately.'
      }
    ]
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouting();
  initDashboard();
  initAppPlatform();
  initDatabases();
  initKubernetes();
  initFirewalls();
  initBilling();
  initTour();
  initUIListeners();

  // Start Global Telemetry loop (runs once a second)
  setInterval(updateLiveTelemetry, 1000);
});

// ==================== THEME CONTROLLERS ====================
function initTheme() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  
  // Set default theme state
  html.setAttribute('data-theme', state.theme);

  toggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', state.theme);
    localStorage.setItem('do-theme', state.theme);
  });
}

// ==================== ROUTING / VIEW CONTROLLERS ====================
function initRouting() {
  const navItems = document.querySelectorAll('.nav-item');
  
  // Tab selector handler
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Find href hash
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        window.location.hash = href;
      }
    });
  });

  // Hash listener
  window.addEventListener('hashchange', handleHashRouting);
  
  // Load default route
  if (!window.location.hash) {
    window.location.hash = '#dashboard';
  } else {
    handleHashRouting();
  }
}

function handleHashRouting() {
  const hash = window.location.hash.substring(1) || 'dashboard';
  const targetViewId = `view-${hash}`;
  const targetView = document.getElementById(targetViewId);

  if (targetView) {
    // Hide active views
    document.querySelectorAll('.dashboard-view').forEach(view => {
      view.classList.remove('active-view');
    });

    // Show selected view
    targetView.classList.add('active-view');

    // Update navigation sidebar active highlights
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const itemHash = item.getAttribute('href').substring(1);
      if (itemHash === hash) {
        item.classList.add('active');
      }
    });

    state.activeView = hash;
    
    // Close sidebar on mobile screens automatically
    if (window.innerWidth <= 768) {
      // No-op sidebar hide if no active drawer logic
    }
  }
}

// ==================== GENERAL UI DIALOGS / POPOVERS FALLBACKS ====================
function initUIListeners() {
  // Modal buttons
  const openCreateModalBtn = document.getElementById('open-create-droplet-modal-btn');
  const createDropletDialog = document.getElementById('create-droplet-modal');
  const closeCreateDialogBtn = document.getElementById('close-create-droplet-dialog-btn');
  const cancelDropletBtn = document.getElementById('cancel-droplet-creation-btn');
  const dropletForm = createDropletDialog.querySelector('form');

  // Shortcuts in popovers
  document.getElementById('create-droplet-shortcut').addEventListener('click', () => {
    hidePopoverMenu();
    openCreateDropletModal();
  });
  document.getElementById('create-app-shortcut').addEventListener('click', () => {
    hidePopoverMenu();
    window.location.hash = '#apps';
  });
  document.getElementById('create-db-shortcut').addEventListener('click', () => {
    hidePopoverMenu();
    window.location.hash = '#databases';
  });

  function hidePopoverMenu() {
    const popover = document.getElementById('create-menu');
    if (popover && typeof popover.hidePopover === 'function') {
      popover.hidePopover();
    } else {
      popover.classList.remove('show-popover');
    }
  }

  // Open modal
  openCreateModalBtn.addEventListener('click', openCreateDropletModal);

  function openCreateDropletModal() {
    // Reset inputs
    document.getElementById('droplet-name-input').value = `student-vm-${state.droplets.length + 1}`;
    createDropletDialog.showModal();
  }

  // Close modals
  closeCreateDialogBtn.addEventListener('click', () => createDropletDialog.close());
  cancelDropletBtn.addEventListener('click', () => createDropletDialog.close());

  // Declarative Light-dismiss coordinate boundary fallback for Dialogs (Cross-browser matching)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    createDropletDialog.addEventListener('click', (event) => {
      if (event.target !== createDropletDialog) return;
      const rect = createDropletDialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInside) createDropletDialog.close();
    });
  }

  // Create Droplet submit handler
  dropletForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Read selected options
    const name = document.getElementById('droplet-name-input').value.trim() || 'unnamed-droplet';
    const osCard = createDropletDialog.querySelector('input[name="droplet-os"]:checked');
    const regionCard = createDropletDialog.querySelector('input[name="droplet-region"]:checked');
    const specsCard = createDropletDialog.querySelector('input[name="droplet-specs"]:checked');

    let osName = 'Ubuntu 22.04 LTS';
    if (osCard.value === 'debian') osName = 'Debian 12 Bookworm';
    if (osCard.value === 'fedora') osName = 'Fedora Server 38';

    let regName = 'New York (NYC3)';
    if (regionCard.value === 'ams') regName = 'Amsterdam (AMS3)';
    if (regionCard.value === 'blr') regName = 'Bangalore (BLR1)';

    let ramSize = '512 MB', cpuSize = '1 vCPU', diskSize = '10 GB SSD';
    if (specsCard.value === 'standard') { ramSize = '1 GB'; cpuSize = '1 vCPU'; diskSize = '25 GB SSD'; }
    if (specsCard.value === 'pro') { ramSize = '2 GB'; cpuSize = '2 vCPUs'; diskSize = '50 GB SSD'; }

    // Add new droplet to state (initially in "creating" state)
    const newDropletId = `drop-${Date.now()}`;
    const newDroplet = {
      id: newDropletId,
      name: name,
      ip: 'Creating...',
      os: osName,
      ram: ramSize,
      cpu: cpuSize,
      disk: diskSize,
      region: regName,
      status: 'creating',
      progress: 0,
      uptime: '0 mins'
    };

    state.droplets.push(newDroplet);
    createDropletDialog.close();
    renderDropletList();

    // Trigger simulated Droplet spin-up timeline (takes 4 seconds)
    let progressTimer = setInterval(() => {
      const idx = state.droplets.findIndex(d => d.id === newDropletId);
      if (idx !== -1) {
        state.droplets[idx].progress += 25;
        if (state.droplets[idx].progress >= 100) {
          clearInterval(progressTimer);
          // Allocate random IP address
          const octet1 = Math.floor(Math.random() * 90) + 110;
          const octet2 = Math.floor(Math.random() * 150) + 50;
          state.droplets[idx].ip = `134.${octet1}.${octet2}.15`;
          state.droplets[idx].status = 'active';
          state.droplets[idx].uptime = '1 min';
          
          // Deduct mock credits from invoice estimation
          recalculateInvoiceSpend();
        }
        renderDropletList();
      }
    }, 1000);
  });

  // Modal OS selections
  const osCards = createDropletDialog.querySelectorAll('.os-card');
  osCards.forEach(card => {
    card.addEventListener('click', () => {
      osCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input[type="radio"]').checked = true;
    });
  });

  // Modal Region selections
  const regCards = createDropletDialog.querySelectorAll('.region-card');
  regCards.forEach(card => {
    card.addEventListener('click', () => {
      regCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input[type="radio"]').checked = true;
    });
  });

  // Modal Specs size selections
  const specCards = createDropletDialog.querySelectorAll('.specs-card');
  specCards.forEach(card => {
    card.addEventListener('click', () => {
      specCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input[type="radio"]').checked = true;

      // Update button cost estimate label
      const priceText = card.querySelector('.specs-price').textContent;
      document.getElementById('confirm-droplet-creation-btn').textContent = `Spin up Droplet (${priceText})`;
    });
  });
}

// ==================== DASHBOARD / DROPLETS MANAGEMENT ====================
function initDashboard() {
  renderDropletList();
}

function renderDropletList() {
  const tableBody = document.getElementById('droplets-table-body');
  if (!tableBody) return;

  // Clear listing
  tableBody.innerHTML = '';

  // Update headers count stats
  const activeCount = state.droplets.filter(d => d.status === 'active').length;
  document.getElementById('stats-active-droplets').textContent = activeCount;
  document.getElementById('droplet-count-badge').textContent = state.droplets.length;

  let totalAllocatedRam = 0;
  state.droplets.forEach(d => {
    if (d.status === 'active') {
      const gb = parseInt(d.ram);
      if (!isNaN(gb)) totalAllocatedRam += gb;
    }
  });
  document.getElementById('stats-total-ram').textContent = `${totalAllocatedRam} GB`;

  state.droplets.forEach(droplet => {
    const row = document.createElement('tr');
    
    // Status visual tags
    let statusBadge = '';
    let spinnerMarkup = '';
    if (droplet.status === 'active') {
      statusBadge = `<span class="badge-row-success"><span class="status-dot bg-success pulsing" style="display:inline-block; margin-right:4px;"></span>Active</span>`;
    } else if (droplet.status === 'creating') {
      statusBadge = `<span class="badge-row-warning"><span class="status-dot bg-warning pulsing" style="display:inline-block; margin-right:4px;"></span>Creating (${droplet.progress}%)</span>`;
      spinnerMarkup = `<div class="promo-progress-bg" style="width:100px; margin-top:4px;"><div class="promo-progress-fill bg-warning" style="width:${droplet.progress}%;"></div></div>`;
    } else {
      statusBadge = `<span class="badge-row-muted"><span class="status-dot bg-secondary" style="display:inline-block; margin-right:4px;"></span>Stopped</span>`;
    }

    // Power toggle button markup
    const powerActionText = droplet.status === 'active' ? 'Shut Down' : 'Power On';
    const isCreating = droplet.status === 'creating';

    row.innerHTML = `
      <td>
        <div class="instance-meta">
          <span class="instance-icon">D</span>
          <div class="instance-details">
            <a class="instance-name-link" data-id="${droplet.id}">${droplet.name}</a>
            <span class="view-subtitle" style="font-size:0.75rem;">${droplet.os}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="ip-badge">${droplet.ip}</span>
      </td>
      <td>
        <div style="display:flex; flex-direction:column;">
          <strong>${droplet.ram} RAM</strong>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${droplet.cpu} / ${droplet.disk}</span>
        </div>
      </td>
      <td>
        <div style="font-weight:600;">${droplet.region}</div>
      </td>
      <td>
        ${statusBadge}
        ${spinnerMarkup}
      </td>
      <td style="text-align: right;">
        <div style="display:inline-flex; gap:8px;">
          <button class="btn btn-sm btn-muted terminal-trigger-btn" data-id="${droplet.id}" ${isCreating ? 'disabled' : ''}>Console</button>
          <button class="btn btn-sm btn-muted power-trigger-btn" data-id="${droplet.id}" ${isCreating ? 'disabled' : ''}>${powerActionText}</button>
        </div>
      </td>
    `;

    // Row highlights on selection
    if (state.telemetry.selectedDropletId === droplet.id) {
      row.style.background = 'rgba(0, 105, 255, 0.05)';
      row.style.borderLeft = '3px solid var(--accent-primary)';
    }

    tableBody.appendChild(row);
  });

  // Attach selectors events
  document.querySelectorAll('.instance-name-link').forEach(link => {
    link.addEventListener('click', () => {
      const dropId = link.getAttribute('data-id');
      selectDropletForTelemetry(dropId);
    });
  });

  document.querySelectorAll('.terminal-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dropId = btn.getAttribute('data-id');
      openSshTerminalDialog(dropId);
    });
  });

  document.querySelectorAll('.power-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dropId = btn.getAttribute('data-id');
      toggleDropletPowerState(dropId);
    });
  });
}

function selectDropletForTelemetry(dropletId) {
  state.telemetry.selectedDropletId = dropletId;
  const droplet = state.droplets.find(d => d.id === dropletId);
  
  if (droplet) {
    // Highlight active selected row
    renderDropletList();

    // Reset Graph Labels
    document.getElementById('cpu-graph-title').textContent = `CPU Utilization (%) - ${droplet.name}`;
    document.getElementById('ram-graph-title').textContent = `RAM Consumption - ${droplet.name}`;
  }
}

function toggleDropletPowerState(dropletId) {
  const idx = state.droplets.findIndex(d => d.id === dropletId);
  if (idx !== -1) {
    const d = state.droplets[idx];
    if (d.status === 'active') {
      d.status = 'stopped';
      d.uptime = 'Offline';
    } else if (d.status === 'stopped') {
      d.status = 'active';
      d.uptime = '1 min';
    }
    renderDropletList();
    recalculateInvoiceSpend();
  }
}

// ==================== LIVE TELEMETRY SVG GRAPH GENERATORS ====================
function updateLiveTelemetry() {
  const currentDroplet = state.droplets.find(d => d.id === state.telemetry.selectedDropletId);
  
  // Shift telemetry array data
  state.telemetry.cpu.shift();
  state.telemetry.ram.shift();
  state.telemetry.dbConnections.shift();

  if (currentDroplet && currentDroplet.status === 'active') {
    // Generate organic numbers fluctuating based on instance specifications
    let baseCpu = 20;
    if (currentDroplet.name.includes('api')) baseCpu = 35;
    if (currentDroplet.name.includes('replica')) baseCpu = 15;

    const newCpuVal = Math.max(2, Math.min(99, baseCpu + Math.floor(Math.random() * 15) - 7));
    const newRamVal = Math.max(10, Math.min(95, 45 + Math.floor(Math.random() * 6) - 3));

    state.telemetry.cpu.push(newCpuVal);
    state.telemetry.ram.push(newRamVal);
  } else {
    // Stopped instances return flatline zero
    state.telemetry.cpu.push(0);
    state.telemetry.ram.push(0);
  }

  // Database metrics simulation
  const activeDbsCount = 14 + Math.floor(Math.random() * 6) - 3;
  state.telemetry.dbConnections.push(activeDbsCount);

  // Redraw SVG path streams
  drawSvgChart('cpu-line-path', 'cpu-area-path', state.telemetry.cpu, 100);
  drawSvgChart('ram-line-path', 'ram-area-path', state.telemetry.ram, 100);
  drawSvgChart('db-line-path', 'db-area-path', state.telemetry.dbConnections, 30);

  // Update pills indicators
  if (currentDroplet) {
    const avgCpu = Math.round(state.telemetry.cpu[state.telemetry.cpu.length - 1]);
    document.querySelector('.cpu-pill').textContent = `${avgCpu}% Active`;

    const ramUsageGb = currentDroplet.status === 'active' 
      ? (parseFloat(currentDroplet.ram) * (state.telemetry.ram[state.telemetry.ram.length - 1] / 100)).toFixed(2)
      : '0.00';
    document.querySelector('.ram-pill').textContent = `${ramUsageGb} GB / ${currentDroplet.ram}`;
  }

  document.querySelector('.connections-pill').textContent = `${activeDbsCount} Connections`;
  const dbActiveConnectionsStat = document.getElementById('db-active-connections');
  if (dbActiveConnectionsStat) dbActiveConnectionsStat.textContent = activeDbsCount;
}

/**
 * Calculates raw points matrix and updates line & area elements of SVGs dynamically
 */
function drawSvgChart(lineId, areaId, dataArray, maxValue) {
  const lineElement = document.getElementById(lineId);
  const areaElement = document.getElementById(areaId);

  if (!lineElement || !areaElement) return;

  const width = 500;
  const height = 200;
  const dataLen = dataArray.length;
  const xStep = width / (dataLen - 1);

  let pathData = '';
  let points = [];

  for (let i = 0; i < dataLen; i++) {
    const x = i * xStep;
    // Invert y axis for SVG drawing
    const valRatio = dataArray[i] / maxValue;
    const y = height - (valRatio * (height - 30)) - 10;
    points.push({ x, y });
  }

  // Draw smooth cubic splines
  pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    pathData += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  // Line extension endpoint
  pathData += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

  // Apply to path line
  lineElement.setAttribute('d', pathData);

  // Apply to gradient fill area
  const areaData = pathData + ` L ${width} ${height} L 0 ${height} Z`;
  areaElement.setAttribute('d', areaData);
}

// ==================== APP PLATFORM CONSOLE LOGS BUILDER ====================
function initAppPlatform() {
  const buildBtn = document.getElementById('start-app-build-btn');
  if (!buildBtn) return;

  buildBtn.addEventListener('click', () => {
    triggerAppPlatformBuild();
  });
}

function triggerAppPlatformBuild() {
  if (state.appDeployments.isBuilding) return;
  
  state.appDeployments.isBuilding = true;
  const statusLabel = document.getElementById('app-deployment-status');
  const statusBadge = document.getElementById('app-status-badge');
  const logsWindow = document.getElementById('app-logs-window');
  const selectedRepo = document.getElementById('app-git-repo').value;

  // Set building state indicators
  statusLabel.textContent = 'Building Production Bundle...';
  statusLabel.className = 'text-warning';
  statusBadge.className = 'status-indicator-pill text-warning';
  statusBadge.innerHTML = '<span class="status-dot bg-warning pulsing"></span>Building';
  
  // Clear and initialize log outputs
  logsWindow.innerHTML = `<div class="log-line text-muted">[${new Date().toLocaleTimeString()}] Triggering manual deployment rebuild hooks...</div>`;
  logsWindow.innerHTML += `<div class="log-line text-info">[${new Date().toLocaleTimeString()}] Selected repo source: github.com/${selectedRepo}</div>`;

  const logsTimeline = [
    { text: 'Cloning repository main bundle...', color: 'text-muted' },
    { text: 'Analyzing engine dependencies and lockfiles...', color: 'text-muted' },
    { text: 'Container builder: compiling docker layer environment...', color: 'text-muted' },
    { text: 'Executing custom compilation instruction: npm run build', color: '' },
    { text: '> vite build --mode production', color: 'text-info' },
    { text: 'vite v5.1.0 compiling source assets...', color: 'text-info' },
    { text: '✓ 142 modules compiled into standard single chunks.', color: 'text-success' },
    { text: 'Uploading production assets to fast Edge CDNs...', color: 'text-muted' },
    { text: 'Configuring health router protocols for traffic redirects...', color: 'text-muted' },
    { text: 'Health Check: HTTP 200 OK verified on Port 8080.', color: 'text-success' },
    { text: 'App is officially deployed and live on HTTPS!', color: 'text-success' },
    { text: `Live URL address: https://${selectedRepo.split('/')[1]}-do-app.com`, color: 'text-info' }
  ];

  let logIndex = 0;
  
  // Clear old timers
  if (state.appDeployments.logStreamTimer) {
    clearInterval(state.appDeployments.logStreamTimer);
  }

  // Stream each line every 1-1.5 seconds
  state.appDeployments.logStreamTimer = setInterval(() => {
    if (logIndex < logsTimeline.length) {
      const log = logsTimeline[logIndex];
      const timeStr = new Date().toLocaleTimeString();
      
      logsWindow.innerHTML += `<div class="log-line ${log.color}">[${timeStr}] ${log.text}</div>`;
      // Scroll to bottom
      logsWindow.scrollTop = logsWindow.scrollHeight;
      logIndex++;
    } else {
      clearInterval(state.appDeployments.logStreamTimer);
      state.appDeployments.isBuilding = false;

      // Update deployed states indicators
      statusLabel.textContent = 'Live & Active';
      statusLabel.className = 'text-success';
      statusBadge.className = 'status-indicator-pill text-success';
      statusBadge.innerHTML = '<span class="status-dot bg-success pulsing"></span>Active';
    }
  }, 1200);
}

// ==================== MANAGED DATABASES PERFORMANCE ====================
function initDatabases() {
  const copyBtn = document.getElementById('copy-db-uri-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const uriText = document.getElementById('db-uri-string').textContent;
    // Replace dots/masked characters with a simulated fake password for demo
    const cleanUri = uriText.replace('••••••••••••', 'StudentSecureP@ss123');
    
    navigator.clipboard.writeText(cleanUri).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('btn-success');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('btn-success');
      }, 2000);
    });
  });
}

// ==================== MANAGED KUBERNETES SCALING ====================
function initKubernetes() {
  const slider = document.getElementById('k8s-nodes-count');
  const countBadge = document.getElementById('k8s-nodes-count-val');
  const costDisplay = document.getElementById('k8s-projected-cost');
  const scaleBtn = document.getElementById('scale-k8s-cluster-btn');

  if (!slider) return;

  // Slider scaling listeners
  slider.addEventListener('input', () => {
    const nodes = slider.value;
    countBadge.textContent = `${nodes} Node${nodes > 1 ? 's' : ''}`;
    
    const sizeSelect = document.getElementById('k8s-node-size');
    let rate = 20;
    if (sizeSelect.value === 's-1vcpu-2gb') rate = 10;
    if (sizeSelect.value === 's-4vcpu-8gb') rate = 40;

    const cost = nodes * rate;
    costDisplay.textContent = `$${cost.toFixed(2)} / month`;
  });

  scaleBtn.addEventListener('click', () => {
    scaleBtn.textContent = 'Scaling Cluster...';
    scaleBtn.disabled = true;
    
    setTimeout(() => {
      scaleBtn.textContent = 'Scale Complete!';
      scaleBtn.classList.add('btn-success');
      
      // Inject fake pod workloads based on scaled nodes size
      const nodes = parseInt(slider.value);
      const listContainer = document.querySelector('.k8s-workload-list');
      
      listContainer.innerHTML = `
        <div class="workload-item">
          <div class="workload-meta">
            <span class="status-dot bg-success pulsing"></span>
            <div>
              <strong>frontend-pod-replicaset</strong>
              <span>${nodes} / ${nodes} Replicas Active</span>
            </div>
          </div>
          <span class="badge badge-success">OK</span>
        </div>
        <div class="workload-item">
          <div class="workload-meta">
            <span class="status-dot bg-success pulsing"></span>
            <div>
              <strong>api-server-deployment</strong>
              <span>${nodes} / ${nodes} Replicas Active</span>
            </div>
          </div>
          <span class="badge badge-success">OK</span>
        </div>
      `;

      recalculateInvoiceSpend();

      setTimeout(() => {
        scaleBtn.textContent = 'Save Node Scale Settings';
        scaleBtn.disabled = false;
        scaleBtn.classList.remove('btn-success');
      }, 2000);
    }, 1500);
  });
}

// ==================== NETWORKING & FIREWALL INGRESS RULES ====================
function initFirewalls() {
  renderFirewallRules();

  const addRuleBtn = document.getElementById('add-rule-btn');
  if (!addRuleBtn) return;

  addRuleBtn.addEventListener('click', () => {
    const protocol = document.getElementById('fw-protocol').value;
    const port = document.getElementById('fw-port').value.trim();
    const sources = document.getElementById('fw-sources').value.trim();

    if (!port) {
      alert('Please specify a valid port range.');
      return;
    }

    let typeText = 'Custom Firewall Rule';
    if (port === '80') typeText = 'HTTP Webserver Port';
    if (port === '443') typeText = 'HTTPS Security Port';
    if (port === '22') typeText = 'SSH Secure Terminal Port';
    if (port === '3306') typeText = 'MySQL Database Port';
    if (port === '5432') typeText = 'PostgreSQL Port';

    const newRule = {
      id: `fw-${Date.now()}`,
      type: typeText,
      protocol: protocol,
      port: port,
      sources: sources
    };

    state.firewallRules.push(newRule);
    renderFirewallRules();
    
    // Clear forms
    document.getElementById('fw-port').value = '';
  });
}

function renderFirewallRules() {
  const tbody = document.getElementById('firewall-rules-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  state.firewallRules.forEach(rule => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display:flex; flex-direction:column;">
          <strong>${rule.type}</strong>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${rule.protocol} protocol</span>
        </div>
      </td>
      <td>
        <code class="detail-code" style="padding: 2px 6px;">${rule.port}</code>
      </td>
      <td>
        <span class="ip-badge">${rule.sources}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-muted fw-delete-btn" data-id="${rule.id}" style="border-color:rgba(239, 68, 68, 0.2); color:var(--accent-danger);">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.fw-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ruleId = btn.getAttribute('data-id');
      state.firewallRules = state.firewallRules.filter(r => r.id !== ruleId);
      renderFirewallRules();
    });
  });
}

// ==================== BILLING / STUDENT PORTFOLIO ACCRUALS ====================
function initBilling() {
  recalculateInvoiceSpend();
}

function recalculateInvoiceSpend() {
  const tbody = document.getElementById('billing-invoice-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  let totalCost = 0;
  const hoursThisMonth = 720; // 30 Days representation

  // Accrue costs from active droplets
  state.droplets.forEach(d => {
    if (d.status === 'active') {
      let hourlyRate = 0.006; // $4.00 Basic
      let specLabel = 'Basic VM Spec';
      if (d.ram.includes('1 GB')) { hourlyRate = 0.011; specLabel = 'Standard VM Spec'; }
      if (d.ram.includes('2 GB')) { hourlyRate = 0.022; specLabel = 'Pro VM Spec'; }

      const cost = hoursThisMonth * hourlyRate;
      totalCost += cost;

      tbody.innerHTML += `
        <tr>
          <td>
            <strong>${d.name}</strong><br>
            <span class="view-subtitle" style="font-size:0.75rem;">${specLabel} - ${d.region}</span>
          </td>
          <td>${hoursThisMonth} hours</td>
          <td>$${hourlyRate.toFixed(3)}/hr</td>
          <td style="text-align: right; font-weight:600; color:var(--text-primary);">$${cost.toFixed(2)}</td>
        </tr>
      `;
    }
  });

  // Accrue costs from Kubernetes Nodes pool
  const k8sSlider = document.getElementById('k8s-nodes-count');
  if (k8sSlider) {
    const nodes = parseInt(k8sSlider.value);
    const sizeSelect = document.getElementById('k8s-node-size');
    let rate = 20;
    if (sizeSelect.value === 's-1vcpu-2gb') rate = 10;
    if (sizeSelect.value === 's-4vcpu-8gb') rate = 40;

    const k8sCost = nodes * rate;
    totalCost += k8sCost;

    tbody.innerHTML += `
      <tr>
        <td>
          <strong>doks-kubernetes-cluster</strong><br>
          <span class="view-subtitle" style="font-size:0.75rem;">Node Pool scale: ${nodes} Active Nodes</span>
        </td>
        <td>Active Pool</td>
        <td>$${rate.toFixed(2)}/node</td>
        <td style="text-align: right; font-weight:600; color:var(--text-primary);">$${k8sCost.toFixed(2)}</td>
      </tr>
    `;
  }

  // Database Cost
  const dbCost = 15.00;
  totalCost += dbCost;
  tbody.innerHTML += `
    <tr>
      <td>
        <strong>managed-postgres-db</strong><br>
        <span class="view-subtitle" style="font-size:0.75rem;">PostgreSQL Single Node DB</span>
      </td>
      <td>Active</td>
      <td>Flat rate</td>
      <td style="text-align: right; font-weight:600; color:var(--text-primary);">$${dbCost.toFixed(2)}</td>
    </tr>
  `;

  // Update Billing numbers
  document.getElementById('billing-current-spend').textContent = `$${totalCost.toFixed(2)}`;
  
  const remaining = 200.00 - totalCost;
  const remainingPct = (remaining / 200.00) * 100;

  document.getElementById('billing-remaining-credits').textContent = `$${remaining.toFixed(2)} (${remainingPct.toFixed(1)}%)`;
  
  const billingProgressFill = document.getElementById('billing-progress-bar');
  if (billingProgressFill) {
    billingProgressFill.style.width = `${remainingPct}%`;
    
    // Change bar color if running very low
    if (remainingPct < 20) {
      billingProgressFill.className = 'promo-progress-fill bg-danger';
    } else {
      billingProgressFill.className = 'promo-progress-fill bg-success';
    }
  }
}

// ==================== INTERACTIVE WEB SSH CONSOLE SIMULATOR ====================
function openSshTerminalDialog(dropletId) {
  const droplet = state.droplets.find(d => d.id === dropletId);
  const dialog = document.getElementById('ssh-terminal-modal');
  const closeBtn = document.getElementById('close-ssh-terminal-dialog-btn');
  const hostnameLabel = document.getElementById('ssh-terminal-title-hostname');
  const terminalScreen = document.getElementById('ssh-screen-output');
  const inputField = document.getElementById('ssh-terminal-input');

  if (!droplet || !dialog) return;

  hostnameLabel.textContent = droplet.name;
  
  // Reset output screen logs
  terminalScreen.innerHTML = `
    <div class="ssh-line text-info">Connecting to root@${droplet.ip}...</div>
    <div class="ssh-line text-success">Connection established via Secure Shell SSHv2.</div>
    <div class="ssh-line text-muted">Welcome to ${droplet.os} (GNU/Linux 5.15.0-60-generic x86_64)</div>
    <div class="ssh-line text-muted">System load: 0.12 | RAM allocated: ${droplet.ram} | Region: ${droplet.region}</div>
    <div class="ssh-line text-warning">Try standard commands: "ls", "top", "df -h", "neofetch", "clear", or "exit".</div>
    <div class="ssh-line">&nbsp;</div>
  `;

  dialog.showModal();
  setTimeout(() => inputField.focus(), 100);

  // Close console listeners
  closeBtn.addEventListener('click', () => dialog.close());

  // Input commands checker
  inputField.addEventListener('keydown', handleTerminalCommands);

  function handleTerminalCommands(e) {
    if (e.key === 'Enter') {
      const command = inputField.value.trim();
      inputField.value = '';
      
      if (!command) return;

      // Print command echo line
      terminalScreen.innerHTML += `<div class="ssh-line"><span class="ssh-prompt">root@${droplet.name}:~#</span> ${command}</div>`;

      // Process input parsing
      const cleanCommand = command.toLowerCase();
      let outputLines = [];

      switch (cleanCommand) {
        case 'help':
          outputLines = [
            'Available sandbox linux commands:',
            '  ls        List active workspace folder documents',
            '  top       Inspect real-time memory and CPU resource tables',
            '  df -h     Display disk space capacities and mount directories',
            '  neofetch  Display gorgeous system configuration metrics',
            '  clear     Purge history buffer lines',
            '  exit      Terminate SSH console connection'
          ];
          break;
        case 'ls':
          outputLines = [
            'docker-compose.yml   index.js   package.json   public/   src/   CLAUDE.md'
          ];
          break;
        case 'top':
          const currentCpu = state.telemetry.cpu[state.telemetry.cpu.length - 1];
          outputLines = [
            `top - 13:25:01 up 14 days,  1:12,  1 user,  load average: 0.04, 0.08, 0.12`,
            `Tasks:  94 total,   1 running,  93 sleeping,   0 stopped`,
            `%Cpu(s):  ${currentCpu}%us,  1.2%sy,  0.0%ni,  98.2%id`,
            `MiB Mem :   ${droplet.ram.includes('2 GB') ? '2048' : '1024'}.0 total,  412.0 free,   612.0 used`,
            '',
            '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
            ' 1412 root      20   0  312000  42100  28100 S   2.4   4.2   1:12.45 node index.js',
            ' 1205 nginx     20   0  182000  12400   8200 S   0.8   1.2   0:45.12 nginx: worker',
            ' 1420 root      20   0   42100   3200   2400 R   0.4   0.3   0:00.12 top'
          ];
          break;
        case 'df -h':
          outputLines = [
            'Filesystem      Size  Used Avail Use% Mounted on',
            `udev            980M     0  980M   0% /dev`,
            `tmpfs           200M  1.2M  199M   1% /run`,
            `/dev/vda1        ${droplet.disk.split(' ')[0]}  3.4G   ${parseInt(droplet.disk) - 3.4}G  14% /`,
            'tmpfs           1.0G     0  1.0G   0% /dev/shm'
          ];
          break;
        case 'neofetch':
          outputLines = [
            '            .::.             root@' + droplet.name,
            '          .::::::.           -------------------------',
            '        .::::::::::.         OS: ' + droplet.os,
            '       .::::::::::::.        Kernel: Linux 5.15.0-60-generic',
            '      ::::::::::::::::       Uptime: ' + droplet.uptime,
            '     ::::::::::::::::::      Shell: bash 5.1.16',
            '    .::::::::::::::::::.     VM Capacity: ' + droplet.ram + ' RAM / ' + droplet.cpu,
            '   .::::::::::::::::::::.    Disk Space: ' + droplet.disk,
            '  .::::::::::::::::::::::.   Region IP: ' + droplet.ip,
            ' .::::::::::::::::::::::::.'
          ];
          break;
        case 'clear':
          terminalScreen.innerHTML = '';
          return;
        case 'exit':
          dialog.close();
          return;
        default:
          outputLines = [
            `bash: command not found: ${command}`,
            'Type "help" to view sandbox available rules.'
          ];
      }

      // Print parsed lines outputs
      outputLines.forEach(line => {
        terminalScreen.innerHTML += `<div class="ssh-line">${line}</div>`;
      });

      terminalScreen.innerHTML += `<div class="ssh-line">&nbsp;</div>`;
      
      // Auto scroll
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }
  }
}

// ==================== ONBOARDING SYSTEM GUIDE WALKTHROUGH ====================
function initTour() {
  const startBtn = document.getElementById('start-tour-btn');
  const tourCard = document.getElementById('onboarding-tour-card');
  const closeBtn = document.getElementById('tour-close-btn');
  const prevBtn = document.getElementById('tour-prev-btn');
  const nextBtn = document.getElementById('tour-next-btn');

  if (!startBtn) return;

  startBtn.addEventListener('click', startTour);
  closeBtn.addEventListener('click', endTour);

  prevBtn.addEventListener('click', () => {
    if (state.tour.step > 0) {
      state.tour.step--;
      updateTourStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.tour.step < state.tour.steps.length - 1) {
      state.tour.step++;
      updateTourStep();
    } else {
      endTour();
    }
  });

  function startTour() {
    state.tour.active = true;
    state.tour.step = 0;
    
    // Switch views to dashboard if elsewhere to align coordinates
    window.location.hash = '#dashboard';
    
    tourCard.classList.remove('hidden');
    tourCard.classList.add('visible');
    
    updateTourStep();
  }

  function updateTourStep() {
    const stepData = state.tour.steps[state.tour.step];
    const targetEl = document.getElementById(stepData.targetId);

    // Update highlights
    document.querySelectorAll('.tour-highlighted-element').forEach(el => {
      el.classList.remove('tour-highlighted-element');
    });

    if (targetEl) {
      targetEl.classList.add('tour-highlighted-element');
      
      // Scroll into view gently
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Dynamically calculate coordinate placements next to target
      setTimeout(() => {
        const rect = targetEl.getBoundingClientRect();
        const cardWidth = 320;
        const cardHeight = 160;
        
        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX;

        // Overflow protections boundaries checking
        if (top + cardHeight > window.innerHeight + window.scrollY) {
          top = rect.top + window.scrollY - cardHeight - 20;
        }
        if (left + cardWidth > window.innerWidth) {
          left = window.innerWidth - cardWidth - 20;
        }
        if (left < 0) {
          left = 20;
        }

        tourCard.style.top = `${top}px`;
        tourCard.style.left = `${left}px`;
      }, 300);
    }

    // Load titles and text
    document.getElementById('tour-step-desc').innerHTML = `<strong>${stepData.title}</strong><br>${stepData.desc}`;
    document.getElementById('tour-step-number').textContent = `Step ${state.tour.step + 1} of ${state.tour.steps.length}`;

    // Enable/disable buttons based on step boundaries
    prevBtn.disabled = state.tour.step === 0;
    nextBtn.textContent = state.tour.step === state.tour.steps.length - 1 ? 'Finish' : 'Next';
  }

  function endTour() {
    state.tour.active = false;
    tourCard.classList.add('hidden');
    tourCard.classList.remove('visible');
    
    // Purge outline highlights
    document.querySelectorAll('.tour-highlighted-element').forEach(el => {
      el.classList.remove('tour-highlighted-element');
    });
  }

  // Trigger tour automatically for first-time session loads
  if (!sessionStorage.getItem('tour-completed')) {
    setTimeout(startTour, 1500);
    sessionStorage.setItem('tour-completed', 'true');
  }
}
