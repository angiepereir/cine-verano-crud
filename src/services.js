const API_URL = "http://localhost:3001/movies";
let isEditing = false;
let editingMovieId = null;

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.classList.add("toast");
  if (type !== "success") toast.classList.add(type);
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function createMovie(newMovie) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMovie)
    });

    if (response.ok) {
      const createdMovie = await response.json();
      console.log("Película creada:", createdMovie);
      printMovies();
      showToast("🎉 Película agregada");
    } else {
      showToast("⚠️ Error al crear película", "error");
    }
  } catch (error) {
    console.log("Error de red:", error);
  }
}

async function getMovies() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const movieData = await response.json();
  return movieData;
}

async function deleteMovie(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log(`Película con ID ${id} eliminada correctamente.`);
      printMovies();
      showToast("🗑️ Película eliminada");
    } else {
      showToast("⚠️ Error al eliminar", "error");
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
}

async function updateMovie(id, updatedMovie) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMovie)
    });

    if (response.ok) {
      console.log("Película actualizada");
      printMovies();
      resetForm();
      showToast("✏️ Película actualizada");
    } else {
      showToast("⚠️ Error al actualizar película", "error");
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
}

let moviesContainer = document.querySelector("section");

async function printMovies() {
  moviesContainer.innerHTML = "";
  const movies = await getMovies();

  movies.forEach(movie => {
    const safeImage = movie.image || 'https://via.placeholder.com/250x150?text=Sin+imagen';
    const stars = "⭐".repeat(movie.rating || 0) + "✩".repeat(5 - (movie.rating || 0));

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${safeImage}" alt="${movie.title}" class="movie-image">
      <h2>${movie.title}</h2>
      <p>${movie.description}</p>
      <p> ${stars}</p>
      <button onclick="deleteMovie('${movie.id}')">Eliminar</button>
      <button onclick="editMovie(
        '${movie.id}',
        '${movie.title.replace(/'/g, "\\'")}',
        '${movie.description.replace(/'/g, "\\'")}',
        '${(movie.image || '').replace(/'/g, "\\'")}',
        '${movie.rating || 0}'
      )"> Editar</button>
    `;
    moviesContainer.appendChild(div);
  });
}

const form = document.getElementById("movie-form");

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
  resetForm();
  document.getElementById("title").focus();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const movieData = {
    title: document.getElementById("title").value,
    image: document.getElementById("image").value,
    description: document.getElementById("description").value,
    rating: parseInt(document.getElementById("rating").value) || 0
  };

  if (isEditing) {
    updateMovie(editingMovieId, movieData);
  } else {
    createMovie(movieData);
  }

  form.reset();
});

function resetForm() {
  document.getElementById("movie-form").reset();
  document.querySelector("#movie-form button").textContent = "Agregar película";
  document.getElementById("cancel-edit-btn").style.display = "none";
  isEditing = false;
  editingMovieId = null;
}

function editMovie(id, title, description, image, rating) {
  document.getElementById("title").value = title;
  document.getElementById("description").value = description;
  document.getElementById("image").value = image;
  document.getElementById("rating").value = rating;
  document.querySelector("#movie-form button").textContent = "Guardar cambios";
  document.getElementById("cancel-edit-btn").style.display = "inline-block";

  isEditing = true;
  editingMovieId = id;
}
