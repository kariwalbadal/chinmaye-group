/* Chinmaye Inn — interactions
   BOOKING is the single integration point: when a real booking
   engine arrives, replace submitEnquiry() and keep the UI as-is. */

const BOOKING = {
  phone: '+918877222233',
  whatsapp: '918877222233',
  purposeLabels: {
    stay: 'book a room',
    dine: 'reserve a table at Kesaria',
    event: 'plan an event at Maya',
  },
  buildMessage({ purpose, room, date, guests, name }) {
    const what = room && purpose === 'stay' ? `book the ${room}` : this.purposeLabels[purpose];
    const when = date ? ` for ${date}` : '';
    const who = guests ? `, ${guests} guest${guests > 1 ? 's' : ''}` : '';
    const sign = name ? ` — ${name}` : '';
    return `Namaste Chinmaye Inn! I'd like to ${what}${when}${who}.${sign}`;
  },
  submitEnquiry(data) {
    const url = `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(this.buildMessage(data))}`;
    window.open(url, '_blank', 'noopener');
  },
};

/* ---------- header state ---------- */
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- hero entrance ---------- */
requestAnimationFrame(() => document.body.classList.add('loaded'));

/* ---------- full-screen menu ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) menuOverlay.hidden = false;
  else setTimeout(() => { if (!document.body.classList.contains('menu-open')) menuOverlay.hidden = true; }, 500);
}
menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
menuOverlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
});

/* ---------- scroll reveals ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealables = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const pending = new Set(revealables);
  const show = (el) => { el.classList.add('in'); pending.delete(el); };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealables.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    io.observe(el);
  });
  // Fast scrolls can jump past the observer window — sweep anything
  // already above the reveal line so no section is left blank.
  let sweepScheduled = false;
  const sweep = () => {
    sweepScheduled = false;
    const line = window.innerHeight * 0.92;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < line) { show(el); io.unobserve(el); }
    });
  };
  window.addEventListener('scroll', () => {
    if (!sweepScheduled && pending.size) {
      sweepScheduled = true;
      setTimeout(sweep, 150);
    }
  }, { passive: true });
}

/* ---------- enquiry modal ---------- */
const modal = document.getElementById('booking-modal');
const form = document.getElementById('booking-form');
const dateInput = form.querySelector('input[name="date"]');
let pendingRoom = '';

function openBooking(purpose = 'stay', room = '') {
  pendingRoom = room;
  const radio = form.querySelector(`input[name="purpose"][value="${purpose}"]`);
  if (radio) radio.checked = true;
  dateInput.min = new Date().toISOString().slice(0, 10);
  if (!dateInput.value) dateInput.value = dateInput.min;
  modal.showModal();
}

document.querySelectorAll('.js-book').forEach((btn) => {
  btn.addEventListener('click', () => openBooking(btn.dataset.purpose, btn.dataset.room || ''));
});
document.querySelectorAll('.js-book-link').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    openBooking(a.dataset.purpose, a.dataset.room || '');
  });
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close('cancel');
});

form.addEventListener('submit', (e) => {
  if (e.submitter && e.submitter.value === 'cancel') return; // close button
  if (!form.reportValidity()) { e.preventDefault(); return; }
  const data = {
    purpose: form.querySelector('input[name="purpose"]:checked').value,
    room: pendingRoom,
    date: dateInput.value,
    guests: form.querySelector('input[name="guests"]').value,
    name: form.querySelector('input[name="name"]').value.trim(),
  };
  BOOKING.submitEnquiry(data);
});
