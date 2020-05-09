navigator.serviceWorker
  .register("esdev.interceptor.sw.js", { scope: "/" })
  .then(function (reg) {
    console.log("[ESDEV] Interceptor Service Worker Registered");
    console.log("[ESDEV] Scope is " + reg.scope);
  });
