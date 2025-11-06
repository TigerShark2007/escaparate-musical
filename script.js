const adminLoginBtn = document.getElementById('admin-login-btn');
const adminPanel = document.getElementById('admin-panel');
const uploadBtn = document.getElementById('upload-btn');
const audioInput = document.getElementById('song-audio');
const coverInput = document.getElementById('song-cover');
const songsContainer = document.getElementById('songs-container');
const audioFileName = document.getElementById('audio-file-name');
const coverFileName = document.getElementById('cover-file-name');

let db;
let songs = [];

// --- IndexedDB Setup ---
const request = indexedDB.open('musicDB', 1);
request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
};
request.onsuccess = (event) => {
  db = event.target.result;
  loadSongs();
};

// --- Login de administrador ---
adminLoginBtn.addEventListener('click', () => {
  const password = prompt("Introduce la contraseña de administrador:");
  if (password === "1234") {
    adminPanel.classList.remove('hidden');
    adminLoginBtn.classList.add('hidden');
  } else if (password !== null) {
    alert("Contraseña incorrecta");
  }
});

// Mostrar nombre del archivo seleccionado
audioInput.addEventListener('change', () => {
  audioFileName.textContent = audioInput.files[0]?.name || "Ningún archivo seleccionado";
});
coverInput.addEventListener('change', () => {
  coverFileName.textContent = coverInput.files[0]?.name || "Ningún archivo seleccionado";
});

// --- Subir canción ---
uploadBtn.addEventListener('click', () => {
  const title = document.getElementById('song-title').value.trim();
  const artist = document.getElementById('song-artist').value.trim();

  if (!title || !artist || !audioInput.files[0] || !coverInput.files[0]) {
    alert("Por favor, completa todos los campos y selecciona los archivos.");
    return;
  }

  const readerAudio = new FileReader();
  const readerCover = new FileReader();

  readerAudio.onload = (e) => {
    const audioData = e.target.result;

    readerCover.onload = (e2) => {
      const coverData = e2.target.result;

      const song = { title, artist, audioData, coverData };

      // Guardar en IndexedDB
      const tx = db.transaction('songs', 'readwrite');
      tx.objectStore('songs').add(song);
      tx.oncomplete = loadSongs;
    };

    readerCover.readAsDataURL(coverInput.files[0]);
  };

  readerAudio.readAsDataURL(audioInput.files[0]);
});

// --- Cargar canciones ---
function loadSongs() {
  songsContainer.innerHTML = '';
  const tx = db.transaction('songs', 'readonly');
  const store = tx.objectStore('songs');
  const request = store.getAll();

  request.onsuccess = () => {
    const songs = request.result;
    songs.forEach(song => {
      const div = document.createElement('div');
      div.classList.add('song-card');
      div.innerHTML = `
        <img src="${song.coverData}" alt="Carátula">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
        <audio controls>
          <source src="${song.audioData}">
        </audio>
      `;
      songsContainer.appendChild(div);
    });
  };
}
