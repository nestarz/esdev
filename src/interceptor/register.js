console.log(import.meta.url);
navigator.serviceWorker.register("./build/_esdev/sw.js").then(function () {
 console.log("Interceptor Service Worker Registered");
});