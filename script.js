(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------- TODO 1 : Menu mobile ----------
  // Au clic sur #menu-toggle :
  // - affichez/masquez #mobile-menu
  // - mettez à jour l'attribut aria-expanded du bouton ("true"/"false")
  // Fermez aussi le menu si l'utilisateur clique sur un des liens qu'il contient.

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function openMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fermer le menu");
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  // ---------- TODO 2 : Accordéon FAQ ----------
  // Pour chaque .faq-question :
  // - au clic, affichez/masquez le .faq-answer associé (attribut hidden)
  // - mettez à jour aria-expanded sur le bouton
  // - un seul item ouvert à la fois : ouvrir une question referme celle qui était ouverte
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = question.getAttribute("aria-expanded") === "true";

      faqItems.forEach((other) => {
        const q = other.querySelector(".faq-question");
        const a = other.querySelector(".faq-answer");
        if (!q || !a) return;
        q.setAttribute("aria-expanded", "false");
        a.hidden = true;
      });

      if (!isOpen) {
        question.setAttribute("aria-expanded", "true");
        answer.hidden = false;
      }
    });
  });

  // ---------- TODO 3 : Compteurs animés ----------
  // Utilisez IntersectionObserver pour détecter quand #stats-section entre dans l'écran.
  // Une fois visible (une seule fois), pour chaque .stat-value :
  // - lisez la valeur cible dans l'attribut data-target
  // - animez le nombre affiché de 0 jusqu'à cette valeur (ex. avec setInterval,
  //   requestAnimationFrame, ou une simple boucle avec des étapes)

  const statsSection = document.getElementById("stats-section");

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("fr-FR");
      return;
    }

    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = current.toLocaleString("fr-FR");

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (statsSection) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target
              .querySelectorAll(".stat-value")
              .forEach(animateCounter);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.4 },
      );

      observer.observe(statsSection);
    } else {
      statsSection.querySelectorAll(".stat-value").forEach((el) => {
        el.textContent = parseInt(el.dataset.target, 10).toLocaleString(
          "fr-FR",
        );
      });
    }
  }

  // ---------- TODO 4 : Formulaire de devis ----------
  // Sur #quote-form, à la soumission (submit) :
  // - empêchez le rechargement de la page (preventDefault)
  // - validez : nom non vide, message non vide, email au format valide (contient "@" et un domaine)
  // - si invalide : affichez un message d'erreur à côté du/des champ(s) concerné(s) (pas de alert() !)
  // - si valide : affichez un message de confirmation dans la page, et réinitialisez le formulaire

  const form = document.getElementById("quote-form");

  if (form) {
    const rules = {
      name: (value) => {
        if (!value.trim()) return "Merci d’indiquer votre nom.";
        if (value.trim().length < 2) return "Le nom est trop court.";
        return "";
      },
      prenom: (value) => {
        if (!value.trim()) return "Merci d’indiquer votre prenom.";
        if (value.trim().length < 2) return "Le nom est trop court.";
        return "";
      },
      
      
      email: (value) => {
        const v = value.trim();
        if (!v) return "Merci d’indiquer votre e-mail.";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          return "Adresse e-mail invalide.";
        }
        return "";
      },
     

      message: (value) => {
        if (!value.trim()) return "Merci de décrire votre besoin.";
        if (value.trim().length > 500) {
          return "Décrivez votre besoin en quelques mots (500 caractères max.).";
        }
        return "";
      },
    };

    const fields = [...form.querySelectorAll("input, textarea")].filter(
      (f) => rules[f.name],
    );

    function getErrorEl(field) {
      return form.querySelector(`[data-error-for="${field.name}"]`);
    }

    function showError(field, message) {
      const wrapper = field.closest(".field");
      const errorEl = getErrorEl(field);

      if (message) {
        wrapper?.classList.add("has-error");
        field.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = message;
      } else {
        wrapper?.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
      }
    }

    function validateField(field) {
      const rule = rules[field.name];
      if (!rule) return true;

      const message = rule(field.value);
      showError(field, message);
      return !message;
    }

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const results = fields.map(validateField);

      if (!results.every(Boolean)) {
        form.querySelector(".has-error input, .has-error textarea")?.focus();
        return;
      }

      const success = form.querySelector(".form-success");
      if (success) {
        success.hidden = false;
        setTimeout(() => {
          success.hidden = true;
        }, 6000);
      }

      form.reset();

      fields.forEach((f) => showError(f, ""));
    });
  }

  // ---------- TODO 5 : FOOTER ----------
  //  cliquer sur "OK" déclenche aussi l'ouverture du mail client
  const btnFoot = document.querySelector(".btn-foot");
  const newsletterLink = document.querySelector(".newsletter a");

  if (btnFoot && newsletterLink) {
    btnFoot.addEventListener("click", () => {
      window.location.href = newsletterLink.href;
    });
  }
})();
