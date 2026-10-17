// --- 0. Always start from the top of the page on refresh/reload ---
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  // --- 1. Typing animation with code syntax highlighter ---
  const code = `const developer = {
  name: "Mohammad Sadegh Rasouli",
  role: "Web Developer",
  stack: ["HTML", "CSS", "JS", "React", "Node"],
  city: "Isfahan",
  openToWork: true, // let's talk
};`;

  const hl = t => t
    .replace(/</g, '&lt;')
    .replace(/(\/\/.*)/g, '<i class=c>$1</i>')
    .replace(/("[^"]*")/g, '<i class=s>$1</i>')
    .replace(/\b(const)\b/g, '<i class=k>$1</i>')
    .replace(/\b(true|\d+)\b/g, '<i class=n>$1</i>');

  const el = document.getElementById('code');
  let i = 0;
  (function typeCode() {
    if (el) {
      el.innerHTML = hl(code.slice(0, i)) + '<span class="cur"></span>';
      if (i++ < code.length) setTimeout(typeCode, 32);
    }
  })();

  // --- 2. 3D Tilt Effect on Cards ---
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!prefersReducedMotion && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(elem => {
      const multiplier = +elem.dataset.tilt || 5;
      elem.addEventListener('mousemove', ev => {
        const rect = elem.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width - 0.5;
        const y = (ev.clientY - rect.top) / rect.height - 0.5;
        elem.style.transform = `perspective(900px) rotateX(${-y * multiplier}deg) rotateY(${x * multiplier}deg) translateY(-3px)`;
        elem.style.transition = 'transform .08s';
      });

      elem.addEventListener('mouseleave', () => {
        elem.style.transform = '';
        elem.style.transition = 'transform .4s';
      });
    });
  }

  // --- 3. Mobile Navigation Drawer ---
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a, .mobile-nav-cta a');

  function openMenu() {
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.classList.add('menu-open');
    }
  }

  function closeMenu() {
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', e => {
      e.stopPropagation();
      if (drawer && drawer.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      closeMenu();

      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Auto-close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // --- 4. Click-to-Copy with Toast Notification ---
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-label') || 'متن';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older contexts
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast(`${label} کپی شد!`);
      } catch (err) {
        showToast('خطا در کپی کردن!');
      }
    });
  });

  // --- 5. Live Project Previews & Fallback Image Handling ---
  const fitIframes = () => {
    document.querySelectorAll('.pv iframe').forEach(f => {
      if (f.parentElement) {
        f.style.transform = `scale(${f.parentElement.clientWidth / 1280})`;
      }
    });
  };

  const ioF = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src;
        ioF.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('.pv iframe').forEach(f => {
    const parent = f.parentElement;
    if (!parent) return;

    const img = new Image();
    img.alt = f.title || '';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top';
    
    img.onload = () => {
      parent.prepend(img);
      f.remove();
    };
    
    img.onerror = () => {
      ioF.observe(f);
    };

    if (f.dataset.src) {
      const filename = f.dataset.src.split('/').filter(Boolean).pop();
      img.src = `images/${filename}.jpg`;
    }
  });

  fitIframes();
  window.addEventListener('resize', fitIframes);

  // --- 6. Contact Form Submission (Formspree AJAX) ---
  const contactForm = document.getElementById('cf');
  const formStatus = document.getElementById('fs');

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'در حال ارسال...';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('Submission failed');

        if (formStatus) {
          formStatus.textContent = 'پیام شما ارسال شد. به‌زودی با شما تماس می‌گیرم.';
          formStatus.style.color = '#C3E88D';
        }
        contactForm.reset();
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = 'ارسال نشد. لطفاً از تلگرام، واتساپ یا ایمیل پیام دهید.';
          formStatus.style.color = '#F78C6C';
        }
      }

      if (formStatus) formStatus.style.display = 'block';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ارسال درخواست';
      }
    });
  }

  // --- 7. Scroll Reveal Animation ---
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.rv').forEach(elem => revealObserver.observe(elem));
});
