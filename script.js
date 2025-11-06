/*******************************
 * script.js - Escaparate Musical
 *******************************/

const ADMIN_PASS = "1234";

/* DOM elements */
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminArea = document.getElementById('admin-area');
const heroTitle = document.getElementById('hero-title');

const uploadBtn = document.getElementById('upload-btn');
const audioInput = document.getElementById('song-audio');
const coverInput = document.getElementById('song-cover');
const audioName = document.getElementById('audio-name');
const coverName = document.getElementById('cover-name');
const songTitleInput = document.getElementById('song-title');
const songArtistInput = document.getElementById('song-artist');

const songsList = document.getElementById('songs-list');

let db;

/* ---------- IndexedDB setup ---------- */
const req = indexedDB.open('MiEscaparateDB_v1', 1);
req.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('songs')) {
    db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
  }
};
req.onsuccess = (e) => {
  db = e.target.result;
  renderSongsFromDB();
};
req.onerror = (e) => console.error('IndexedDB error', e);

/* ---------- Admin login logic ---------- */
adminLoginBtn.addEventListener('click', () => {
  const pwd = prompt('Introduce la contraseña de administrador:');
  if (pwd === null) return;
  if (pwd === ADMIN_PASS) {
    // show admin area, shrink hero
    adminArea.classList.remove('hidden');
    adminLoginBtn.classList.add('hidden');
    heroTitle.style.fontSize = '30px';
    heroTitle.style.padding = '12px 20px';
  } else {
    alert('Contraseña incorrecta');
  }
});

/* ---------- File name display ---------- */
audioInput.addEventListener('change', () => {
  audioName.textContent = audioInput.files[0]?.name || 'archivo no seleccionado';
});
coverInput.addEventListener('change', () => {
  coverName.textContent = coverInput.files[0]?.name || 'archivo no seleccionado';
});

/* ---------- Upload (store files as dataURLs) ---------- */
uploadBtn.addEventListener('click', async () => {
  const title = songTitleInput.value.trim();
  const artist = songArtistInput.value.trim();
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!title || !artist || !audioFile || !coverFile) {
    alert('Rellena todos los campos y selecciona los archivos.');
    return;
  }

  // validate cover size minimal 3000x3000 (optional: warn if too small)
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  img.onload = async () => {
    if (img.width < 3000 || img.height < 3000) {
      const ok = confirm('La carátula es más pequeña que 3000×3000. ¿Quieres subirla de todas formas?');
      if (!ok) return;
    }

    // read files as data URLs
    const audioData = await fileToDataURL(audioFile);
    const coverData = await fileToDataURL(coverFile);

    const tx = db.transaction('songs', 'readwrite');
    const store = tx.objectStore('songs');
    const record = {
      title,
      artist,
      audioData,
      coverData,
      createdAt: Date.now()
    };
    store.add(record);
    tx.oncomplete = () => {
      // clear form
      songTitleInput.value = '';
      songArtistInput.value = '';
      audioInput.value = '';
      coverInput.value = '';
      audioName.textContent = 'archivo no seleccionado';
      coverName.textContent = 'archivo no seleccionado';
      renderSongsFromDB();
    };
    tx.onerror = (e) => {
      console.error('Error saving song', e);
      alert('Error guardando la canción.');
    };
  };
});

/* ---------- Helpers ---------- */
function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Render songs ---------- */
function renderSongsFromDB(){
  songsList.innerHTML = '';
  const tx = db.transaction('songs', 'readonly');
  const store = tx.objectStore('songs');
  const reqAll = store.getAll();
  reqAll.onsuccess = () => {
    const items = reqAll.result.sort((a,b)=> b.createdAt - a.createdAt);
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.innerHTML = `
        <img src="${item.coverData}" alt="portada">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.artist)}</p>
        <audio controls>
          <source src="${item.audioData}" type="audio/mpeg">
          Tu navegador no soporta el reproductor.
        </audio>
        <div class="card-controls">
          <small style="color:var(--muted)">${new Date(item.createdAt).toLocaleString()}</small>
          <div>
            <button class="delete-btn" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `;
      songsList.appendChild(card);
    });

    // attach delete handlers
    songsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        if (!confirm('¿Eliminar esta canción?')) return;
        const tx = db.transaction('songs','readwrite');
        tx.objectStore('songs').delete(id);
        tx.oncomplete = () => renderSongsFromDB();
      });
    });
  };
}

/* small helper to avoid XSS in titles/artists */
function escapeHtml(str){
  return String(str).replace(/[&<>"'`]/g, s=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'
  }[s]));
}
