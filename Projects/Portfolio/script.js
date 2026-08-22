document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('motion-ready');

  // Opening sequence
  const opening = $('#opening');
  let introComplete = false;
  const dismissIntro = () => {
    if (introComplete) return;
    introComplete = true;
    opening?.classList.add('hidden');
    document.body.classList.add('page-ready');
  };
  $('#skipIntro')?.addEventListener('click', dismissIntro);
  setTimeout(dismissIntro, reducedMotion ? 0 : 3100);

  // Theme
  const theme = $('#theme');
  const setTheme = value => {
    root.dataset.theme = value;
    theme.setAttribute('aria-pressed', String(value === 'light'));
    theme.textContent = value === 'dark' ? '☼' : '◐';
  };
  const savedTheme = localStorage.getItem('azim-theme');
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  theme.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('azim-theme', next);
  });

  // Navigation
  const menu = $('#menu');
  const links = $('#links');
  const closeMenu = () => {
    menu.classList.remove('open');
    links.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('open', open);
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('.links a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      dismissIntro();
    }
  });
  const header = $('.header');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 12), { passive: true });
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) $$('.links a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-38% 0px -54%', threshold: 0 });
  $$('main section[id]').forEach(section => navObserver.observe(section));

  // Scroll entrances
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: .14 });
  $$('.reveal').forEach(element => revealObserver.observe(element));

  // Small, throttled hero parallax — only for a precise pointer.
  const hero = $('.hero');
  if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    let parallaxFrame;
    hero.addEventListener('pointermove', event => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      cancelAnimationFrame(parallaxFrame);
      parallaxFrame = requestAnimationFrame(() => {
        hero.style.setProperty('--parallax-x', (x * 18).toFixed(2));
        hero.style.setProperty('--parallax-y', (y * 16).toFixed(2));
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--parallax-x', '0');
      hero.style.setProperty('--parallax-y', '0');
    });
  }

  // Gentle magnetic feedback for key controls.
  if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    $$('.button').forEach(button => {
      button.addEventListener('pointermove', event => {
        const box = button.getBoundingClientRect();
        button.style.setProperty('--magnet-x', `${((event.clientX - box.left) / box.width - .5) * 5}px`);
        button.style.setProperty('--magnet-y', `${((event.clientY - box.top) / box.height - .5) * 4}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnet-x', '0px');
        button.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  // Constellation information panels
  const networkData = {
    about: {
      learning: ['LEARNING', 'Growing with intention.', 'Every concept I learn becomes another point on the path toward building better things.'],
      python: ['PYTHON', 'Where curiosity begins.', 'The language I enjoy working with most — from fundamentals and automation to projects and backend development.'],
      web: ['WEB DEVELOPMENT', 'Making ideas visible.', 'I’m learning how structure, style, and interaction come together on the web.'],
      building: ['BUILDING', 'Learning by making.', 'Projects help me turn theory into practical understanding, one iteration at a time.'],
      solving: ['PROBLEM SOLVING', 'Working through the why.', 'I like breaking a problem down, looking for the pattern, and trying a thoughtful solution.'],
      fullstack: ['FULL STACK', 'The destination in view.', 'I’m working toward understanding both sides of the web, with Python as a strong foundation.']
    },
    skills: {
      python: ['PYTHON', 'A language I enjoy.', 'From fundamentals and automation to projects and backend development, Python is my strongest current interest.'],
      html: ['HTML', 'The structure.', 'Semantic HTML provides the clear, accessible foundation of a good web experience.'],
      css: ['CSS', 'The presentation.', 'I use CSS to shape responsive, thoughtful interfaces and give ideas a visual voice.'],
      javascript: ['JAVASCRIPT', 'The interaction.', 'JavaScript is helping me learn how a static page becomes an engaging interface.'],
      git: ['GIT & GITHUB', 'Version control.', 'I’m learning the habits that make it easier to track progress, organise work, and share it clearly.'],
      django: ['DJANGO', 'Backend concepts.', 'Django is part of the backend direction I’m exploring as I grow from Python into full stack development.'],
      vscode: ['VS CODE', 'My workspace.', 'A focused environment for practicing, experimenting, and steadily building my skills.']
    }
  };
  $$('[data-network]').forEach(network => {
    const type = network.dataset.network;
    const panel = $('.panel', network);
    const selectStar = star => {
      const key = star.dataset.star;
      if (key === type) return;
      $$('.star, .skill', network).forEach(item => item.classList.toggle('active', item === star));
      $$('[data-line]', network).forEach(line => line.classList.toggle('active', line.dataset.line === key));
      const [label, title, text] = networkData[type][key];
      panel.classList.remove('panel-refresh');
      requestAnimationFrame(() => {
        $('.label', panel).textContent = label;
        $('h3', panel).textContent = title;
        $('p:not(.label)', panel).textContent = text;
        panel.classList.add('panel-refresh');
      });
    };
    $$('[data-star]', network).forEach(star => {
      star.addEventListener('click', () => selectStar(star));
      star.addEventListener('mouseenter', () => selectStar(star));
      star.addEventListener('focus', () => selectStar(star));
    });
  });

  // Card highlight and shallow tilt, with no animation loop.
  if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    $$('.project').forEach(card => {
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        card.style.setProperty('--light-x', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--light-y', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--tilt-x', `${((.5 - y) * 2.1).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${((x - .5) * 2.1).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Contact validation
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    $$('input,textarea', form).forEach(input => {
      const error = !input.value.trim() ? 'This field is required.' : input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value) ? 'Enter a valid email address.' : '';
      const field = input.closest('.field');
      field.classList.toggle('invalid', Boolean(error));
      $('small', field).textContent = error;
      valid &&= !error;
    });
    status.textContent = valid ? 'Your message is ready. This is a front-end form, so please email Azim directly to send it.' : 'Please check the highlighted fields.';
    if (valid) form.reset();
  });
  $('#year').textContent = new Date().getFullYear();
});
