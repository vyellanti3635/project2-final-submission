let deferredPrompt = null;
let swRegistration = null;

function init() {
  if (!('serviceWorker' in navigator)) return;
  
  registerServiceWorker();
  setupInstallPrompt();
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    swRegistration = registration;
    
    registration.addEventListener("updatefound", () => {
      handleUpdate(registration);
    });
    
    if (registration.waiting) {
      handleUpdate(registration);
    }
  } catch (error) {
    console.error('SW registration failed:', error);
  }
}

function handleUpdate(registration) {
  const newWorker = registration.installing || registration.waiting;
  if (!newWorker) return;
  
  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    showUpdateNotification(registration);
    return;
  }
  
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
      showUpdateNotification(registration);
    }
  });
}

function showUpdateNotification(registration) {
  let notification = document.getElementById("pwa-update-notification");
  
  if (!notification) {
    notification = document.createElement("div");
    notification.id = 'pwa-update-notification';
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <span>New version available!</span>
        <button class='pwa-update-button' id="pwa-update-apply">Update</button>
        <button class="pwa-update-dismiss" id="pwa-update-dismiss">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    document.getElementById("pwa-update-apply").onclick = () => applyUpdate(registration);
    document.getElementById("pwa-update-dismiss").onclick = hideUpdateNotification;
  }
  
  notification.style.display = "block";
  setTimeout(() => notification.classList.add('visible'), 10);
}

function hideUpdateNotification() {
  const notification = document.getElementById('pwa-update-notification');
  if (notification) {
    notification.classList.remove('visible');
    setTimeout(() => notification.style.display = "none", 300);
  }
}

function applyUpdate(registration) {
  if (!registration?.waiting) return;
  
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallButton();
  });
}

function showInstallButton() {
  let btn = document.getElementById("pwa-install-button");
  
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'pwa-install-button';
    btn.className = 'pwa-install-button';
    btn.innerHTML = '<span>Install App</span>';
    document.body.appendChild(btn);
  }
  
  btn.style.display = "flex";
  btn.classList.add("visible");
  btn.addEventListener("click", promptInstall);
}

async function promptInstall() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  
  if (result.outcome === 'accepted') {
    hideInstallButton();
  }
  
  deferredPrompt = null;
}

function hideInstallButton() {
  const btn = document.getElementById("pwa-install-button");
  if (btn) {
    btn.style.display = "none";
    btn.classList.remove("visible");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
