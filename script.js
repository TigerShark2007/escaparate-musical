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

uploadBtn.addEventListener("click", () => {
  const title = document.getElementById("song-title").value.trim();
  const artist = document.getElementById("song-artist").value.trim();

  if (!title || !artist || !audioInput.files.length || !coverInput.files.length) {
    alert("Por favor, completa todos los campos y selecciona los archivos.");
    return;
  }

  const songItem = document.createElement("div");
  songItem.classList.add("song-item");
  songItem.innerHTML = `
    <span>${title} - ${artist}</span>
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


