// AgeWise — Age Calculator Logic
(function () {
  const $ = id => document.getElementById(id);

  const dayEl = $('day'), monthEl = $('month'), yearEl = $('year');
  const calcBtn = $('calculateBtn');
  const errorMsg = $('errorMsg');
  const resultSection = $('resultSection');
  const resetBtn = $('resetBtn');

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* ---- Input: clamp on blur ---- */
  dayEl.addEventListener('blur', () => {
    let v = parseInt(dayEl.value);
    if (v < 1) dayEl.value = 1;
    if (v > 31) dayEl.value = 31;
  });
  monthEl.addEventListener('blur', () => {
    let v = parseInt(monthEl.value);
    if (v < 1) monthEl.value = 1;
    if (v > 12) monthEl.value = 12;
  });
  yearEl.addEventListener('blur', () => {
    let v = parseInt(yearEl.value);
    if (v < 1900) yearEl.value = 1900;
    if (v > 2026) yearEl.value = 2026;
  });

  /* ---- Validate ---- */
  function validate(d, m, y) {
    if (!d || !m || !y) return 'Please fill in all fields.';
    if (d < 1 || d > 31) return 'Day must be between 1 and 31.';
    if (m < 1 || m > 12) return 'Month must be between 1 and 12.';
    if (y < 1900 || y > 2026) return 'Year must be between 1900 and 2026.';

    const test = new Date(y, m - 1, d);
    if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) {
      return `${MONTHS[m-1]} ${y} doesn't have ${d} days.`;
    }

    const birth = new Date(y, m - 1, d);
    if (birth > new Date()) return 'Birth date cannot be in the future.';

    return null;
  }

  /* ---- Calculate age ---- */
  function calcAge(birthY, birthM, birthD) {
    const now = new Date();
    const nowY = now.getFullYear(), nowM = now.getMonth() + 1, nowD = now.getDate();

    let years = nowY - birthY;
    let months = nowM - birthM;
    let days = nowD - birthD;

    if (days < 0) {
      months--;
      const prevMonth = new Date(nowY, nowM - 1, 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const birthDate = new Date(birthY, birthM - 1, birthD);
    const diffMs = now - birthDate;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMins = Math.floor(diffMs / (1000 * 60));
    const totalSecs = Math.floor(diffMs / 1000);
    const totalWeeks = Math.floor(totalDays / 7);

    // Next birthday
    let nextBday = new Date(nowY, birthM - 1, birthD);
    if (nextBday <= now) nextBday.setFullYear(nowY + 1);
    const daysToNextBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

    // Day of week born
    const dayOfWeek = WEEKDAYS[birthDate.getDay()];

    return { years, months, days, totalDays, totalHours, totalMins, totalSecs, totalWeeks, daysToNextBday, dayOfWeek };
  }

  /* ---- Animated counter ---- */
  function animateCounter(el, target, duration = 1200, isLarge = false) {
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease out quart
      const current = Math.floor(from + (target - from) * eased);

      if (isLarge) {
        el.textContent = current.toLocaleString();
      } else {
        el.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---- Show Results ---- */
  function showResults(age, d, m, y) {
    // Hide calculator hero
    document.querySelector('.hero').style.display = 'none';

    // Show results
    resultSection.style.display = 'flex';
    resultSection.classList.add('visible');

    // Set name
    $('resultName').textContent = `Born ${MONTHS[m - 1]} ${d}, ${y}`;

    // Animate main counters
    animateCounter($('resYears'), age.years, 1200);
    animateCounter($('resMonths'), age.months, 1200);
    animateCounter($('resDays'), age.days, 1200);

    // Bars
    setTimeout(() => {
      $('barYears').style.width = Math.min((age.years / 100) * 100, 100) + '%';
      $('barMonths').style.width = ((age.months / 11) * 100) + '%';
      $('barDays').style.width = ((age.days / 30) * 100) + '%';
    }, 100);

    // Stats
    animateCounter($('statHours'), age.totalHours, 1800, true);
    animateCounter($('statMinutes'), age.totalMins, 2000, true);
    animateCounter($('statSeconds'), age.totalSecs, 2200, true);
    animateCounter($('statWeeks'), age.totalWeeks, 1600, true);

    $('statNextBday').textContent = age.daysToNextBday === 0 ? '🎉 Today!' : age.daysToNextBday;
    $('statDayOfWeek').textContent = age.dayOfWeek;

    // Scroll into view
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Calculate button ---- */
  calcBtn.addEventListener('click', () => {
    const d = parseInt(dayEl.value);
    const m = parseInt(monthEl.value);
    const y = parseInt(yearEl.value);

    const err = validate(d, m, y);
    if (err) {
      errorMsg.textContent = err;
      errorMsg.classList.add('visible');
      // Shake animation
      calcBtn.style.animation = 'none';
      calcBtn.offsetHeight; // reflow
      calcBtn.style.animation = 'shake 0.4s ease';
      return;
    }

    errorMsg.classList.remove('visible');

    // Button loading state
    calcBtn.disabled = true;
    calcBtn.querySelector('.btn-text').textContent = 'Calculating…';

    setTimeout(() => {
      const age = calcAge(y, m, d);
      showResults(age, d, m, y);
      calcBtn.disabled = false;
      calcBtn.querySelector('.btn-text').textContent = 'Reveal My Age';
    }, 600);
  });

  /* ---- Reset button ---- */
  resetBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    resultSection.classList.remove('visible');
    document.querySelector('.hero').style.display = '';
    dayEl.value = monthEl.value = yearEl.value = '';
    errorMsg.classList.remove('visible');
    document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });

    // Reset bars
    $('barYears').style.width = '0%';
    $('barMonths').style.width = '0%';
    $('barDays').style.width = '0%';
  });

  /* ---- Enter key trigger ---- */
  [dayEl, monthEl, yearEl].forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') calcBtn.click();
    });
  });

  /* ---- Shake keyframe injection ---- */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.fact-card, .stat-item');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 80}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));

})();
