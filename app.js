const ADMIN_PASS = "1234";

// DOM
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('admin-login-btn');
const uploadBtn = document.getElementById('upload-btn');
const songsContainer = document.getElementById('songs-container');

// Inputs de archivos
const audioInput = document.getElementById('song-audio');
const coverInput = document.getElementById('song-cover');
const audioName = document.getElementById('audio-file-name');
const coverName = document.getElementById('cover-file-name');

// Mostrar nombre de archivo seleccionado
audioInput.addEventListener('change', () => {
  const file = audioInput.files[0];
  audioName.textContent = file ? file.name : "Ningún archivo seleccionado";
});

coverInput.addEventListener('change', () => {
  const file = coverInput.files[0];
  coverName.textContent = file ? file.name : "Ningún archivo seleccionado";
});

// IndexedDB
let db;
const request = indexedDB.open("MiEscaparateDB", 1);
request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
};
request.onsuccess = e => { db = e.target.result; loadSongs(); };

// Login administrador
loginBtn.addEventListener('click', () => {
  const pwd = prompt("Introduce contraseña de administrador:");
  if (pwd === ADMIN_PASS) {
    adminPanel.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else {
    alert("Contraseña incorrecta");
  }
});

// Subida canción
uploadBtn.addEventListener('click', async () => {
  const title = document.getElementById('song-title').value;
  const artist = document.getElementById('song-artist').value;
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!title || !artist || !audioFile || !coverFile) {
    alert("Rellena todos los campos");
    return;
  }

  // Validar carátula mínima 3000x3000
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  img.onload = async () => {
    if (img.width < 3000 || img.height < 3000) {
      alert("La carátula debe tener al menos 3000x3000 px");
      return;
    }

    const tx = db.transaction("songs", "readwrite");
    const store = tx.objectStore("songs");
    store.add({
      title,
      artist,
      audio: await fileToBase64(audioFile),
      cover: await fileToBase64(coverFile)
    });
    tx.oncomplete = () => {
      alert("Canción subida!");
      document.getElementById('song-title').value = "";
      document.getElementById('song-artist').value = "";
      audioInput.value = "";
      coverInput.value = "";
      audioName.textContent = "Ningún archivo seleccionado";
      coverName.textContent = "Ningún archivo seleccionado";
      loadSongs();
    };
  };
});

// Convertir archivo a Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Cargar canciones
function loadSongs() {
  const tx = db.transaction("songs", "readonly");
  const store = tx.objectStore("songs");
  const req = store.getAll();
  req.onsuccess = () => {
    songsContainer.innerHTML = "";
    req.result.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.innerHTML = `
        <img src="${song.cover}">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
        <audio controls>
          <source src="${song.audio}" type="audio/mpeg">
          Tu navegador no soporta el reproductor de audio.
        </audio>
      `;
      songsContainer.appendChild(card);
    });
  };
}
