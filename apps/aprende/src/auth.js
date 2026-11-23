// Sesión del sitio (S101, S103). Aprende vive en el mismo origen que `/entrar.html`, así que comparte su sesión: aquí solo se
// lee. El inicio de sesión y el consentimiento los hace la página de entrada (`/entrar.html?volver=/aprende/`).
// El SDK de Firebase se carga desde el CDN de Google con la versión fija (igual que el sitio, C40).
const SDK = "https://www.gstatic.com/firebasejs/13.4.0";

/** @returns {Promise<{ user: object | null, getToken: () => Promise<string>, signOut: () => Promise<void> }>} */
export async function createAuth(apiKey) {
  const [{ initializeApp }, { getAuth, onAuthStateChanged, signOut }] = await Promise.all([
    import(/* @vite-ignore */ `${SDK}/firebase-app.js`),
    import(/* @vite-ignore */ `${SDK}/firebase-auth.js`),
  ]);
  const auth = getAuth(initializeApp({ apiKey, authDomain: location.host }));
  // La primera notificación dice si hay una sesión guardada; hasta entonces no se sabe.
  const user = await new Promise((resolve) => {
    let off = null;
    let done = false;
    off = onAuthStateChanged(auth, (u) => {
      if (done) return;
      done = true;
      off?.(); // puede llegar antes de que `onAuthStateChanged` devuelva (si es síncrono): por eso `off` puede ser null
      resolve(u);
    });
  });
  return {
    user,
    getToken: () => auth.currentUser.getIdToken(),
    signOut: () => signOut(auth),
  };
}
