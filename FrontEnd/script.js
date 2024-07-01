//fetchAndDisplayWorks();

function displayWorks(works) {
  let gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
    let workElement = document.createElement("figure");
    workElement.innerHTML = `
                  <img src="${work.imageUrl}" alt="${work.title}">
                  <figcaption>${work.title}</figcaption>
              `;
    gallery.appendChild(workElement);
  });
}

function createCategoryMenu(works) {
  const categories = [
    "Tous",
    ...new Set(works.map((work) => work.category.name)),
  ];
  const categoryMenu = document.querySelector(".category-menu");
  categories.forEach((category, i) => {
    console.log(i);
    console.log(category);
    const categoryElement = document.createElement("button");
    if (i == 0) {
      categoryElement.classList.add("btn-active");
    }
    categoryElement.textContent = category;
    categoryElement.dataset.category = category;
    categoryElement.addEventListener("click", (event) =>
      filterCategory(event, works)
    );
    categoryMenu.appendChild(categoryElement);
  });
}

function filterCategory(e, works) {
  const categoriesMenu = document.querySelectorAll(".category-menu button");
  categoriesMenu.forEach((category) => {
    category.classList.remove("btn-active");
  });
  if (e.target.dataset.category == "Tous") {
    filteredWorks = works;
  } else {
    filteredWorks = works.filter(
      (work) => work.category.name === e.target.dataset.category
    );
  }
  displayWorks(filteredWorks);
  e.target.classList.add("btn-active");
}

async function fetchAndDisplayWorks(isReload = false) {
  const worksApiUrl = "http://localhost:5678/api/works";
  let response = await fetch(worksApiUrl);
  let works = await response.json();

  if (!isReload) {
    createCategoryMenu(works);
  }

  //addCategoryFilter(works);
  displayWorks(works);
}

fetchAndDisplayWorks(false);

// formulaire LOG IN =>

function showLogin() {
  document.getElementById("login-container").style.display = "block";
  document.getElementById("main-content").style.display = "none";
  document.getElementById("error-message").textContent = "";
}

function showMainContent() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("main-content").style.display = "block";
}

document
  .getElementById("login-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showLogin();
  });

document
  .getElementById("works-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showMainContent();
  });

document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    const errorMessageElement = document.getElementById("error-message");

    if (!email && !password) {
      errorMessageElement.textContent = "Merci de renseigner vos identifiants.";
      return;
    }

    if (!email) {
      errorMessageElement.textContent = "Merci de renseigner un email.";
      return;
    }

    if (!password) {
      errorMessageElement.textContent = "Merci de renseigner un mot de passe.";
      return;
    }

    const logsUrl = "http://localhost:5678/api/users/login";

    try {
      let response = await fetch(logsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        let data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "./index.html";
      } else {
        const errorMessage = await response.json();
        document.getElementById("error-message").textContent =
          "Nom d'utilisateur ou mot de passe incorrect.";
      }
    } catch (error) {
      console.error("Erreur:", error);
      document.getElementById("error-message").textContent =
        "Une erreur s'est produite. Veuillez réessayer.";
    }
  });

// Log out & modify link //

document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();

  function checkAuthentication() {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.createElement("a");
    logoutLink.textContent = "logout";
    logoutLink.href = "./";
    logoutLink.addEventListener("click", logOut);

    if (token) {
      loginLink.parentNode.replaceChild(logoutLink, loginLink);

      const modifyLink = document.createElement("a");
      modifyLink.href = "#";
      modifyLink.innerHTML = '<i class="fas fa-edit"></i><span>modifier</span>';
      modifyLink.addEventListener("click", showModal);

      const portfolioHeader = document.querySelector("#portfolio h2");
      if (portfolioHeader) {
        const modifyContainer = document.createElement("p");
        modifyContainer.appendChild(modifyLink);
        portfolioHeader.parentNode.insertBefore(
          modifyContainer,
          portfolioHeader.nextSibling
        );
      }

      document.getElementById("edit-mode-bar").style.display = "block";
      document.querySelector(".category-menu").style.display = "none";
    }
  }
});

function logOut(event) {
  event.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "./index.html";
}

// Modal //

function showModal(event) {
  event.preventDefault();
  const modal = document.getElementById("photo-gallery-modal");
  modal.style.display = "block";
  fetchAndDisplayPhotos();
}

function closeModal() {
  const modal = document.getElementById("photo-gallery-modal");
  modal.style.display = "none";
  resetModalContent(); // Appel à la fonction pour réinitialiser le contenu de la modale
}

// Fonction pour réinitialiser le contenu de la modale
function resetModalContent() {
  const form = document.querySelector("#photo-gallery-modal form");
  if (form) {
    form.reset(); // Réinitialiser le formulaire
  }
}

function fetchAndDisplayPhotos() {
  const galleryContainer = document.querySelector(".modal .new-gallery");
  galleryContainer.innerHTML = "";

  const worksApiUrl = "http://localhost:5678/api/works";
  fetch(worksApiUrl)
    .then((response) => response.json())
    .then((works) => {
      works.forEach((work) => {
        const galleryItem = document.createElement("div");
        galleryItem.classList.add("gallery-item");
        galleryItem.innerHTML = `
          <img src="${work.imageUrl}" alt="${work.title}">
          <i class="fas fa-trash trash-icon" data-work-id="${work.id}"></i>
        `;
        galleryItem.addEventListener("click", deleteWork);
        galleryContainer.appendChild(galleryItem);
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des photos:", error);
    });
}

// delete works from gallery //

function deleteWork(event) {
  event.preventDefault();

  let workId = event.target.dataset.workId;
  console.log(workId);

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté pour supprimer une photo.");
    return;
  }

  const deleteApiUrl = `http://localhost:5678/api/works/${workId}`;
  fetch(deleteApiUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Photo supprimée avec succès.");
        updateGalleries();
      } else {
        alert("Erreur lors de la suppression de la photo.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression de la photo:", error);
    });
}

function updateGalleries() {
  fetchAndDisplayWorks(true);
  fetchAndDisplayPhotos();
}

// fermeture modal //

document.querySelector(".modal .close").addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
  const modal = document.getElementById("photo-gallery-modal");
  if (event.target === modal) {
    closeModal();
  }
});

// modal ajout photo //

document.getElementById("add-photo-btn").addEventListener("click", function () {
  document.getElementById("modal-content").style.display = "none";
  document.getElementById("add-photo-view").style.display = "block";
});

// return back to the gallery //

const returnToGallerySpan = document.querySelector(".return");

returnToGallerySpan.addEventListener("click", () => {
  document.getElementById("modal-content").style.display = "block";
  document.getElementById("add-photo-view").style.display = "none";
});

// fermeture modal 2 //

document
  .querySelector(".add-photo-view .close")
  .addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
  const modalSecond = document.getElementById("add-photo-view");
  if (event.target === modalSecond) {
    closeModal();
  }
});

// miniature photo quand j'upload un fichier //

document
  .getElementById("photo-upload")
  .addEventListener("change", function (event) {
    document.querySelector(".photo-upload-container label").style.display =
      "none";
    document.querySelector(".photo-upload-container p").style.display = "none";
    document.querySelector(".photo-upload-container").style.padding = "0";
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Prévisualisation de la photo";
        //img.style.maxWidth = "70%";
        //img.style.maxHeight = "20%";

        const photoUploadContainer = document.querySelector(
          ".photo-upload-container"
        );

        //while (photoUploadContainer.firstChild) {
        //photoUploadContainer.removeChild(photoUploadContainer.firstChild);
        //}

        photoUploadContainer.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  });

// ici c'est l'ajout d'événement pour le champ de sélection des catégories //

const categorySelect = document.getElementById("photo-category");
categorySelect.addEventListener("click", () => {
  if (!categorySelect.hasAttribute("data-loaded")) {
    addCategorySelect();
    categorySelect.setAttribute("data-loaded", "true");
  }
});

// Fonction pour ajouter le sélecteur de catégories
function addCategorySelect() {
  /*const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Sélectionner une catégorie";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  categorySelect.appendChild(defaultOption);*/

  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((categories) => {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des catégories:", error);
    });
}

// upload fichier //

document
  .querySelector(".photo-upload-label button")
  .addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("photo-upload").click();
  });

// Update background color du bouton valider

document
  .getElementById("photo-upload")
  .addEventListener("change", handleFormUpdate);
document
  .getElementById("photo-title")
  .addEventListener("input", handleFormUpdate);
document
  .getElementById("photo-category")
  .addEventListener("input", handleFormUpdate);

function handleFormUpdate() {
  const photoUpload = document.querySelector(".photo-upload-container img");
  const photoTitle = document.getElementById("photo-title").value.trim() !== "";
  const photoCategory = document.getElementById("photo-category").value !== "";

  const submitButton = document.getElementById("add-photo-btn2");

  if (photoUpload && photoTitle && photoCategory) {
    submitButton.style.backgroundColor = "#155a45";
  } else {
    submitButton.style.backgroundColor = "";
  }
}

// POST new work dans ma gallerie //

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("add-photo-btn2")
    .addEventListener("click", async function (event) {
      event.preventDefault();

      let photoUpload = document.getElementById("photo-upload");
      //let photoUpload = photoUploadElement.files[0];

      if (!photoUpload) {
        alert("Veuillez sélectionner une photo.");
        return;
      }

      let photoTitle = document.getElementById("photo-title").value.trim();
      let photoCategory = document.getElementById("photo-category").value;

      if (!photoTitle || !photoCategory) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      const formData = new FormData();
      formData.append("image", photoUpload.files[0]);
      formData.append("title", photoTitle);
      formData.append("category", photoCategory);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vous devez être connecté pour ajouter une photo.");
        return;
      }

      console.log("Token:", token);

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        });

        if (response.ok) {
          alert("Le projet a été ajouté avec succès.");
          updateGalleries();
          // window.location.reload();
        } else {
          const errorData = await response.json();
          alert("Erreur : " + errorData.message);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
      }
    });
});
