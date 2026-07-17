/*==========================================================
    CL(AMOR) - VOCES SILENCIADAS
    PARTE 1: Cargador Asíncrono y Navegación SPA
==========================================================*/

document.addEventListener("DOMContentLoaded", async () => {
  log("Iniciando carga de componentes...");
  
  // 1. Cargamos el HTML externo primero
  await cargarTodasLasPaginas();
  
  // 2. Una vez que el DOM tiene todo el contenido, inicializamos el JS
  inicializarSelectoresGlobales();
  iniciarSPA();
  iniciarTabs();
  iniciarCanvas();
  actualizarContador();
  setInterval(actualizarContador, 1000);
  inicializarFormulario();
  inicializarEfectosVisuales();
  inicializarEfectosScroll();
});

/*==========================================================
    VARIABLES GLOBALES (Se definen vacías y se llenan al cargar)
==========================================================*/
let paginas, enlaces, botonesTabs, contenidosTabs;

function inicializarSelectoresGlobales() {
  paginas = document.querySelectorAll(".page");
  enlaces = document.querySelectorAll(".menu a");
  botonesTabs = document.querySelectorAll(".tab-btn");
  contenidosTabs = document.querySelectorAll(".tab-content");
}

/*==========================================================
    CARGAR PÁGINAS EXTERNAS (FETCH)
==========================================================*/
async function cargarTodasLasPaginas() {
  const paginasAMapear = [
    { id: "home", ruta: "pages/home.html" },
    { id: "laboratory", ruta: "pages/laboratory.html" },
    { id: "dancers", ruta: "pages/dancers.html" },
    { id: "launch", ruta: "pages/launch.html" } // Cambia si el archivo se llama diferente
  ];

  const promesas = paginasAMapear.map(async (p) => {
    const contenedor = document.getElementById(p.id);
    if (!contenedor) return;
    try {
      const respuesta = await fetch(p.ruta);
      if (!respuesta.ok) throw new Error(`HTTP error! Status: ${respuesta.status}`);
      const html = await respuesta.text();
      contenedor.innerHTML = html;
      log(`Página [${p.id}] cargada con éxito.`);
    } catch (error) {
      console.error(`Error cargando ${p.ruta}:`, error);
      contenedor.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #c0392b;">
          <p>⚠️ No se pudo cargar la sección: <strong>${p.id}</strong></p>
          <small>Verifica que el archivo exista en la ruta "${p.ruta}"</small>
        </div>`;
    }
  });

  // Esperamos a que todas las peticiones terminen juntas
  await Promise.all(promesas);
}

/*==========================================================
    INICIALIZAR SPA
==========================================================*/
function iniciarSPA() {
  mostrarPagina("home");
  activarMenu("home");
  agregarEventosMenu();
}

function agregarEventosMenu() {
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const destino = enlace.dataset.page;
      
      mostrarPagina(destino);
      activarMenu(destino);
      animarPagina(destino);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}

function mostrarPagina(id) {
  if (!paginas) return;
  paginas.forEach((pagina) => {
    pagina.classList.remove("active");
  });

  const pagina = document.getElementById(id);
  if (pagina) {
    pagina.classList.add("active");
  }
}

function activarMenu(id) {
  if (!enlaces) return;
  enlaces.forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.page === id) {
      link.classList.add("active");
    }
  });
}

function irA(id) {
  mostrarPagina(id);
  activarMenu(id);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function animarPagina(id) {
  const pagina = document.getElementById(id);
  if (!pagina) return;

  pagina.style.opacity = "0";
  pagina.style.transform = "translateY(20px)";

  requestAnimationFrame(() => {
    pagina.style.transition = ".5s";
    pagina.style.opacity = "1";
    pagina.style.transform = "translateY(0px)";
  });
}

/*==========================================================
    PARTE 2: Tabs del Laboratorio
==========================================================*/
function iniciarTabs() {
  if (!botonesTabs || botonesTabs.length === 0) return;

  botonesTabs.forEach((boton) => {
    boton.addEventListener("click", () => {
      const destino = boton.dataset.tab;
      cambiarTab(destino);
    });
  });

  // Activar primer tab por defecto
  const primer = botonesTabs[0].dataset.tab;
  cambiarTab(primer);
}

function cambiarTab(id) {
  if (!botonesTabs || !contenidosTabs) return;

  botonesTabs.forEach((btn) => btn.classList.remove("active"));
  contenidosTabs.forEach((tab) => tab.classList.remove("active"));

  const botonActivo = document.querySelector(`.tab-btn[data-tab="${id}"]`);
  const contenidoActivo = document.getElementById(id);

  if (botonActivo) {
    botonActivo.classList.add("active");
  }

  if (contenidoActivo) {
    contenidoActivo.classList.add("active");
    animarContenido(contenidoActivo);
  }
}

function animarContenido(elemento) {
  elemento.style.opacity = "0";
  elemento.style.transform = "translateY(25px)";

  requestAnimationFrame(() => {
    elemento.style.transition = ".45s";
    elemento.style.opacity = "1";
    elemento.style.transform = "translateY(0px)";
  });
}

/*==========================================================
    PARTE 3: Canvas - Planimetría del escenario
==========================================================*/
function iniciarCanvas() {
  const canvas = document.getElementById("stageCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let tiempo = 0;
  const bailarines = [
    { color: "#e74c3c", radio: 12, x: 0, y: 0 },
    { color: "#3498db", radio: 12, x: 0, y: 0 },
    { color: "#f1c40f", radio: 12, x: 0, y: 0 },
    { color: "#2ecc71", radio: 12, x: 0, y: 0 },
  ];

  function dibujarEscenario() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;

    for (let i = 1; i < 4; i++) {
      let x = (canvas.width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, canvas.height - 20);
      ctx.stroke();
    }

    for (let i = 1; i < 4; i++) {
      let y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
  }

  function actualizar() {
    tiempo += 0.01;
    const w = canvas.width;
    const h = canvas.height;

    bailarines[0].x = w * 0.25 + Math.sin(tiempo) * 120;
    bailarines[0].y = h * 0.25 + Math.cos(tiempo * 1.2) * 80;

    bailarines[1].x = w * 0.75 + Math.cos(tiempo * 1.4) * 100;
    bailarines[1].y = h * 0.3 + Math.sin(tiempo) * 140;

    bailarines[2].x = w * 0.3 + Math.cos(tiempo * 0.8) * 150;
    bailarines[2].y = h * 0.75 + Math.sin(tiempo * 1.5) * 70;

    bailarines[3].x = w * 0.72 + Math.sin(tiempo * 1.6) * 130;
    bailarines[3].y = h * 0.72 + Math.cos(tiempo) * 100;
  }

  function trayectorias() {
    ctx.save();
    ctx.setLineDash([8, 8]);
    bailarines.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 28, 0, Math.PI * 2);
      ctx.strokeStyle = b.color + "66";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  function dibujarBailarines() {
    bailarines.forEach((bailarin, index) => {
      const gradiente = ctx.createRadialGradient(
        bailarin.x, bailarin.y, 5,
        bailarin.x, bailarin.y, 30
      );
      gradiente.addColorStop(0, bailarin.color);
      gradiente.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = gradiente;
      ctx.arc(bailarin.x, bailarin.y, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = bailarin.color;
      ctx.arc(bailarin.x, bailarin.y, bailarin.radio, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "11px Roboto Mono";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index + 1, bailarin.x, bailarin.y);
    });
  }

  function dibujarTexto() {
    ctx.fillStyle = "#f5f0e8";
    ctx.font = "16px Roboto Mono";
    ctx.fillText("Vista Superior del Escenario", 30, 45);
  }

  function animar() {
    dibujarEscenario();
    actualizar();
    trayectorias();
    dibujarBailarines();
    dibujarTexto();
    requestAnimationFrame(animar);
  }

  animar();
}

/*==========================================================
    PARTE 4: Componentes Interactivos y Efectos Visuales
==========================================================*/
function actualizarContador() {
  const diasEl = document.getElementById("days");
  const horasEl = document.getElementById("hours");
  const minutosEl = document.getElementById("minutes");
  const segundosEl = document.getElementById("seconds");

  // El estreno se mantiene en Diciembre 16, 2026
  const estreno = new Date("December 16, 2026 19:00:00").getTime();
  const ahora = new Date().getTime();
  let diferencia = estreno - ahora;

  if (diferencia <= 0) {
    if (diasEl) diasEl.textContent = "00";
    if (horasEl) horasEl.textContent = "00";
    if (minutosEl) minutosEl.textContent = "00";
    if (segundosEl) segundosEl.textContent = "00";
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  diferencia %= 1000 * 60 * 60 * 24;
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  diferencia %= 1000 * 60 * 60;
  const minutos = Math.floor(diferencia / (1000 * 60));
  diferencia %= 1000 * 60;
  const segundos = Math.floor(diferencia / 1000);

  if (diasEl) diasEl.textContent = String(dias).padStart(2, "0");
  if (horasEl) horasEl.textContent = String(horas).padStart(2, "0");
  if (minutosEl) minutosEl.textContent = String(minutos).padStart(2, "0");
  if (segundosEl) segundosEl.textContent = String(segundos).padStart(2, "0");
}

function inicializarFormulario() {
  const formulario = document.getElementById("subscribeForm");
  const emailInput = document.getElementById("email");
  const mensaje = document.getElementById("successMessage");

  if (formulario) {
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();
      const correo = emailInput.value.trim();

      if (correo === "") {
        alert("Ingresa tu correo electrónico.");
        emailInput.focus();
        return;
      }

      const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!expresion.test(correo)) {
        alert("Correo electrónico no válido.");
        emailInput.focus();
        return;
      }

      if (mensaje) {
        mensaje.style.display = "block";
        mensaje.innerHTML = "✅ Gracias por suscribirte. Muy pronto recibirás información.";
        formulario.reset();
        setTimeout(() => { mensaje.style.display = "none"; }, 5000);
      }
    });
  }
}

function inicializarEfectosVisuales() {
  // 1. Tarjetas Hover
  const tarjetas = document.querySelectorAll(".card, .media-card, .tool-card, .dancer-card, .venue");
  tarjetas.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px) scale(1.02)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0px) scale(1)";
    });
  });

  // 2. Aparición Suave (Fade Up)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0px)";
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".block, .card, .media-card, .tool-card, .dancer-card, .venue, .subscribe").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = ".8s";
    observer.observe(el);
  });

  // 3. Botón Volver Arriba
  const btnTop = document.getElementById("btnTop");
  if (btnTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        btnTop.style.opacity = "1";
        btnTop.style.pointerEvents = "all";
      } else {
        btnTop.style.opacity = "0";
        btnTop.style.pointerEvents = "none";
      }
    });
    btnTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 4. Parallax Hero
  const hero = document.querySelector(".hero");
  if (hero) {
    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      hero.style.backgroundPosition = `${50 + x * 6}% ${50 + y * 6}%`;
    });
  }

  // 5. Año footer
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

/*==========================================================
    DEBUG & UTILIDADES
==========================================================*/
function log(mensaje) {
  console.log("[CL(AMOR)] " + mensaje);
}


/*==========================================================
    PARTE 4: Controladores de Scroll (Header & Botón de Arriba)
==========================================================*/
function inicializarEfectosScroll() {
  const header = document.querySelector("header");
  const btnTop = document.getElementById("btnTop");

  if (!header && !btnTop) return;

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY;

    // 1. Control del Header Flotante
    if (scrollPos > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // 2. Control de visibilidad del Botón Top (aparece tras bajar 400px)
    if (scrollPos > 400) {
      btnTop.classList.add("show");
    } else {
      btnTop.classList.remove("show");
    }
  });

  // 3. Acción de click para subir con suavidad
  if (btnTop) {
    btnTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}