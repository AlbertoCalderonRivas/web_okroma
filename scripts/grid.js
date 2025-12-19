// Configuración
const CONFIG = {
  jsonPath: "/json/post.json",
  mediaBasePath: "/media",
  autoplayInterval: 3000,
  supportedImageFormats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"],
  supportedVideoFormats: ["mp4", "webm", "ogv", "mov"],
  supportedAudioFormats: ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
  supportedTextFormats: ["txt", "md"],
};

// Utilidades
const Utils = {
  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  },

  isImage(filename) {
    const ext = this.getFileExtension(filename);
    return CONFIG.supportedImageFormats.includes(ext);
  },

  isVideo(filename) {
    const ext = this.getFileExtension(filename);
    return CONFIG.supportedVideoFormats.includes(ext);
  },

  isAudio(filename) {
    const ext = this.getFileExtension(filename);
    return CONFIG.supportedAudioFormats.includes(ext);
  },

  isText(filename) {
    const ext = this.getFileExtension(filename);
    return CONFIG.supportedTextFormats.includes(ext);
  },

  async fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  },

  async fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.text();
  },
};

// Clase para manejar los archivos de una carpeta
class MediaFolder {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.files = [];
    this.images = [];
    this.videos = [];
    this.audios = [];
    this.texts = [];
  }

  async loadFiles() {
    try {
      // Intentar cargar el índice de archivos
      const indexUrl = `${this.folderPath}/index.json`;
      const data = await Utils.fetchJSON(indexUrl);
      this.files = data.files || [];
    } catch (error) {
      console.warn(`No se encontró index.json en ${this.folderPath}`);
      this.files = [];
    }

    this.categorizeFiles();
    return this.files.length > 0;
  }

  categorizeFiles() {
    this.images = this.files.filter((f) => Utils.isImage(f));
    this.videos = this.files.filter((f) => Utils.isVideo(f));
    this.audios = this.files.filter((f) => Utils.isAudio(f));
    this.texts = this.files.filter((f) => Utils.isText(f));
  }

  getFullPath(filename) {
    return `${this.folderPath}/${filename}`;
  }

  async getTextContent() {
    if (this.texts.length === 0) return null;
    const textUrl = this.getFullPath(this.texts[0]);
    try {
      return await Utils.fetchText(textUrl);
    } catch (error) {
      console.error(`Error cargando texto: ${error.message}`);
      return null;
    }
  }

  getMediaFiles() {
    return [...this.images, ...this.videos, ...this.audios];
  }
}

// Clase Post
class Post {
  constructor(data, index) {
    this.id = `post-${index}`;
    this.title = data.title || null;
    this.folderPath = data.folder
      ? `${CONFIG.mediaBasePath}/${data.folder}`
      : null;
    this.link = data.link || null;
    this.background = data.background || null;
    this.autoplay = data.autoplay || false;
    this.mediaFolder = null;
  }

  async load() {
    if (!this.folderPath) return false;

    this.mediaFolder = new MediaFolder(this.folderPath);
    return await this.mediaFolder.loadFiles();
  }

  async render() {
    const post = document.createElement("div");
    post.className = "post";
    post.id = this.id;

    if (this.background) {
      post.style.backgroundColor = this.background;
    }

    const content = await this.createContent();

    if (this.link) {
      const linkWrapper = document.createElement("a");
      linkWrapper.href = this.link;
      linkWrapper.className = "post-link";
      //linkWrapper.target = '_blank'; abrir en nueva pestaña
      linkWrapper.rel = "noopener noreferrer";
      linkWrapper.appendChild(content);
      post.appendChild(linkWrapper);
    } else {
      post.appendChild(content);
    }

    return post;
  }

  async createContent() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "100%";

    if (!this.mediaFolder) {
      container.innerHTML =
        '<div class="fallback">No hay contenido disponible</div>';
      return container;
    }

    const mediaFiles = this.mediaFolder.getMediaFiles();

    // Crear sección de media
    if (mediaFiles.length > 0) {
      const mediaSection = await this.createMediaSection(mediaFiles);
      container.appendChild(mediaSection);
    }

    // Crear sección de texto
    const textContent = await this.mediaFolder.getTextContent();
    if (this.title || textContent) {
      const title = this.title;
      const textSection = this.createTextSection(title, textContent);
      container.appendChild(textSection);
    }

    return container;
  }

  async createMediaSection(mediaFiles) {
    const mediaDiv = document.createElement("div");
    mediaDiv.className = "post-media";

    if (mediaFiles.length === 1) {
      // Un solo archivo
      mediaDiv.appendChild(this.createMediaElement(mediaFiles[0]));
    } else if (mediaFiles.length > 1) {
      // Carousel
      const carousel = this.createCarousel(mediaFiles);
      mediaDiv.appendChild(carousel);
    }

    return mediaDiv;
  }

  createMediaElement(filename) {
    const fullPath = this.mediaFolder.getFullPath(filename);

    if (Utils.isImage(filename)) {
      const img = document.createElement("img");
      img.src = fullPath;
      img.alt = this.title || "Imagen del proyecto";
      img.loading = "eager"; // carga todas de golpe, si peta mucho cambiar a "lazy"
      return img;
    } else if (Utils.isVideo(filename)) {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      const source = document.createElement("source");
      source.src = fullPath;
      source.type = `video/${Utils.getFileExtension(filename)}`;
      video.appendChild(source);
      return video;
    } else if (Utils.isAudio(filename)) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.controlsList = "nodownload";
      audio.style.width = "100%";
      audio.style.minHeight = "40px";
      const source = document.createElement("source");
      source.src = fullPath;
      source.type = `audio/${Utils.getFileExtension(filename)}`;
      audio.appendChild(source);
      return audio;
    }
  }

  createCarousel(mediaFiles) {
    const carousel = document.createElement("div");
    carousel.className = "carousel";
    carousel.dataset.postId = this.id;

    const track = document.createElement("div");
    track.className = "carousel-track";

    mediaFiles.forEach((file) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      slide.appendChild(this.createMediaElement(file));
      track.appendChild(slide);
    });

    carousel.appendChild(track);

    // Controles
    const prevBtn = document.createElement("button");
    prevBtn.className = "carousel-arrow prev";
    prevBtn.innerHTML = "‹";
    prevBtn.setAttribute("aria-label", "Anterior");

    const nextBtn = document.createElement("button");
    nextBtn.className = "carousel-arrow next";
    nextBtn.innerHTML = "›";
    nextBtn.setAttribute("aria-label", "Siguiente");

    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);

    // Dots

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";

    mediaFiles.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "carousel-dot";
      if (index === 0) dot.classList.add("active");
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });

    carousel.appendChild(dotsContainer);

    // Inicializar comportamiento del carousel después de renderizar
    setTimeout(() => this.initCarousel(carousel), 0);

    return carousel;
  }

  initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    const dots = carousel.querySelectorAll(".carousel-dot");

    if (slides.length === 0) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isTransitioning = false;

    // Variables para el swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    const swipeThreshold = 50; // Píxeles mínimos para considerar un swipe

    // Clonar primera y última slide para el efecto infinito
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = track.querySelectorAll(".carousel-slide");
    const totalSlides = allSlides.length;

    currentIndex = 1;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    const adjustCarouselHeight = () => {
      if (currentIndex < 0 || currentIndex >= allSlides.length) return;
      const currentSlide = allSlides[currentIndex];
      const media = currentSlide.querySelector("img, video, audio");

      if (media) {
        const updateHeight = () => {
          requestAnimationFrame(() => {
            const mediaHeight = media.offsetHeight;
            if (mediaHeight > 0) {
              carousel.style.height = mediaHeight + "px";
            }
          });
        };

        if (media.tagName === "IMG") {
          if (media.complete && media.naturalWidth > 0) {
            updateHeight();
          } else {
            media.onload = updateHeight;
          }
        } else if (media.tagName === "VIDEO") {
          if (media.readyState >= 1) {
            updateHeight();
          } else {
            media.onloadedmetadata = updateHeight;
          }
        } else if (media.tagName === "AUDIO") {
          updateHeight();
        }
      }
    };

    const updateCarousel = (newIndex, instant = false) => {
      if (instant) {
        track.style.transition = "none";
        currentIndex = newIndex;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        track.offsetHeight;
        track.style.transition = "transform 0.5s ease";
      } else {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = newIndex;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      const realIndex = currentIndex - 1;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === realIndex % slides.length);
      });

      adjustCarouselHeight();
    };

    track.addEventListener("transitionend", () => {
      isTransitioning = false;
      if (currentIndex === 0) {
        updateCarousel(slides.length, true);
      } else if (currentIndex === totalSlides - 1) {
        updateCarousel(1, true);
      }
    });

    const next = () => {
      if (!isTransitioning) {
        updateCarousel(currentIndex + 1);
      }
    };

    const prev = () => {
      if (!isTransitioning) {
        updateCarousel(currentIndex - 1);
      }
    };

    // ============================================
    // SWIPE TÁCTIL
    // ============================================

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Solo hacer swipe si el movimiento horizontal es mayor que el vertical
      // Esto evita interferir con el scroll vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > swipeThreshold) {
          if (diffX > 0) {
            // Swipe hacia la izquierda - siguiente
            next();
            resetAutoplay();
          } else {
            // Swipe hacia la derecha - anterior
            prev();
            resetAutoplay();
          }
        }
      }
    };

    // Añadir eventos táctiles al carousel
    carousel.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    carousel.addEventListener("touchend", handleTouchEnd, { passive: true });

    // ============================================
    // FIN DEL CÓDIGO DE SWIPE
    // ============================================

    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prev();
      resetAutoplay();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      next();
      resetAutoplay();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        if (!isTransitioning) {
          updateCarousel(index + 1);
          resetAutoplay();
        }
      });
    });

    const startAutoplay = () => {
      if (this.autoplay && slides.length > 1) {
        autoplayTimer = setInterval(next, CONFIG.autoplayInterval);
      }
    };

    const resetAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        startAutoplay();
      }
    };

    setTimeout(adjustCarouselHeight, 100);
    window.addEventListener("resize", adjustCarouselHeight);
    startAutoplay();
  }

  createTextSection(title, textContent) {
    const textDiv = document.createElement("div");
    textDiv.className = "post-text";

    /*
          if (title) {
            const titleEl = document.createElement("h2");
            titleEl.textContent = this.title;
            textDiv.appendChild(titleEl);
          }
*/
    if (textContent) {
      const textEl = document.createElement("p");
      textEl.innerHTML = textContent;
      textDiv.appendChild(textEl);
    }

    return textDiv;
  }
}

// Clase principal de la aplicación
class PortfolioApp {
  constructor() {
    this.posts = [];
    this.loadingEl = document.getElementById("loading");
    this.errorEl = document.getElementById("error");
    this.gridEl = document.getElementById("postGrid");
  }

  showError(message) {
    this.loadingEl.classList.add("hidden");
    this.errorEl.textContent = `Error: ${message}`;
    this.errorEl.classList.remove("hidden");
  }

  hideLoading() {
    this.loadingEl.classList.add("hidden");
  }

  async init() {
    try {
      const data = await Utils.fetchJSON(CONFIG.jsonPath);

      if (!data.post || !Array.isArray(data.post)) {
        throw new Error("Formato de JSON inválido");
      }

      this.posts = data.post.map(
        (postData, index) => new Post(postData, index)
      );

      await this.loadAndRenderPosts();
      this.hideLoading();
    } catch (error) {
      this.showError(error.message);
      console.error("Error inicializando la aplicación:", error);
    }
  }

  async loadAndRenderPosts() {
    for (const post of this.posts) {
      await post.load();
      const postElement = await post.render();
      this.gridEl.appendChild(postElement);
    }
  }
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  const app = new PortfolioApp();
  app.init();
});
