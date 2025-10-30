// Contraseña administrador
const ADMIN_PASS = "1234"; // cambia por tu contraseña segura

// DOM
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('admin-login-btn');
const uploadBtn = document.getElementById('upload-btn');
const songsContainer = document.getElementById('songs-container');

// IndexedDB setup
let db;
const request = indexedDB.open("MiEscaparateDB", 1);
request.onupgradeneeded = (e)=>{
  db = e.target.result;
  const store = db.createObjectStore("songs",{keyPath:"id",autoIncrement:true});
};
request.onsuccess = (e)=>{ db = e.target.result; loadSongs(); };

// Login administrador
loginBtn.addEventListener('click', ()=>{
  const pwd = prompt("Introduce contraseña de administrador:");
  if(pwd === ADMIN_PASS){
    adminPanel.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else { alert("Contraseña incorrecta"); }
});

// Subida canción
uploadBtn.addEventListener('click', async ()=>{
  const title = document.getElementById('song-title').value;
  const artist = document.getElementById('song-artist').value;
  const audioFile = document.getElementById('song-audio').files[0];
  const coverFile = document.getElementById('song-cover').files[0];

  if(!title || !artist || !audioFile || !coverFile){
    alert("Rellena todos los campos");
    return;
  }

  // Validar carátula mínima 3000x3000
  const img = new Image();
  img.src = URL.createObjectURL(coverFile);
  img.onload = async ()=>{
    if(img.width < 3000 || img.height < 3000){
      alert("La carátula debe tener al menos 3000x3000 px");
      return;
    }

    // Guardar en IndexedDB
    const tx = db.transaction("songs","readwrite");
    const store = tx.objectStore("songs");
    store.add({
      title,
      artist,
      audio: await fileToBase64(audioFile),
      cover: await fileToBase64(coverFile)
    });
    tx.oncomplete = ()=>{
      alert("Canción subida!");
      document.getElementById('song-title').value = "";
      document.getElementById('song-artist').value = "";
      document.getElementById('song-audio').value = "";
      document.getElementById('song-cover').value = "";
      loadSongs();
    };
  };
});

// Convertir archivo a base64
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Cargar canciones en escaparate
function loadSongs(){
  const tx = db.transaction("songs","readonly");
  const store = tx.objectStore("songs");
  const req = store.getAll();
  req.onsuccess = ()=>{
    songsContainer.innerHTML = "";
    req.result.forEach(song=>{
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
