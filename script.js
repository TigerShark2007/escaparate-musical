const loginBtn = document.getElementById("admin-login");
const loginScreen = document.getElementById("login-screen");
const uploadScreen = document.getElementById("upload-screen");

loginBtn.addEventListener("click", () => {
  const password = prompt("Introduce la contraseña de administrador:");
  if (password === "1234") {
    loginScreen.style.display = "none";
    uploadScreen.classList.remove("hidden");
  } else {
    alert("Contraseña incorrecta.");
  }
});

// Mostrar nombres de archivos seleccionados
const audioInput = document.getElementById("audio-file");
const coverInput = document.getElementById("cover-file");
const audioName = document.getElementById("audio-name");
const coverName = document.getElementById("cover-name");

audioInput.addEventListener("change", () => {
  audioName.textContent = audioInput.files.length
    ? audioInput.files[0].name
    : "Archivo no seleccionado";
});

coverInput.addEventListener("change", () => {
  coverName.textContent = coverInput.files.length
    ? coverInput.files[0].name
    : "Archivo no seleccionado";
});

// Subir canción
const uploadBtn = document.getElementById("upload-btn");
const songList = document.getElementById("song-list");

uploadBtn.addEventListener("click", async () => {
  const title = document.getElementById("song-title").value.trim();
  const artist = document.getElementById("song-artist").value.trim();
  const audioFile = audioInput.files[0];
  const coverFile = coverInput.files[0];

  if (!title || !artist || !audioFile || !coverFile) {
    alert("Por favor, completa todos los campos y selecciona los archivos.");
    return;
  }

  // Convertir los archivos a base64 para mostrarlos
  const audioURL = await fileToBase64(audioFile);
  const coverURL = await fileToBase64(coverFile);

  const songItem = document.createElement("div");
  songItem.classList.add("song-item");
  songItem.innerHTML = `
    <div class="song-info">
      <img src="${coverURL}" alt="Portada" class="song-cover">
      <div>
        <h4>${title}</h4>
        <p>${artist}</p>
        <audio controls>
          <source src="${audioURL}" type="${audioFile.type}">
          Tu navegador no soporta el reproductor de audio.
        </audio>
      </div>
    </div>
    <button class="btn-crystal delete-btn">Eliminar</button>
  `;

  songItem.querySelector(".delete-btn").addEventListener("click", () => {
    songItem.remove();
  });

  songList.appendChild(songItem);

  // Resetear formulario
  document.getElementById("song-title").value = "";
  document.getElementById("song-artist").value = "";
  audioInput.value = "";
  coverInput.value = "";
  audioName.textContent = "Archivo no seleccionado";
  coverName.textContent = "Archivo no seleccionado";
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
