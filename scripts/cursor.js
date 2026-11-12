
const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (supportsCustomCursor) {


const cursorEl = document.createElement('div');
cursorEl.className = 'custom-cursor';

const nameEl = document.createElement('div');
nameEl.className = 'custom-cursor-name';
document.body.appendChild(nameEl);

const cursorInner = document.createElement('div');
cursorInner.className = 'custom-cursor-inner';
cursorInner.textContent = '*';

cursorEl.appendChild(cursorInner);
document.body.appendChild(cursorEl);

window.addEventListener('mousemove', (e) => {
  cursorEl.style.left = `${e.clientX}px`;
  cursorEl.style.top = `${e.clientY}px`;


  nameEl.style.left = `${e.clientX}px`;
  nameEl.style.top = `${e.clientY}px`;
});

const interactiveSelector = 'a,details, button, [role="button"], input, textarea, select, .carousel-dot, .carousel-arrow';

document.addEventListener('mouseover', (e) => {
  if (e.target.closest(interactiveSelector)) {
    cursorEl.classList.add('is-pointer');
  }
  const postEl = e.target.closest('.post');
  if (postEl && postEl.dataset.name) {
    nameEl.textContent = postEl.dataset.name;
    nameEl.classList.add('is-visible');
  }
});



document.addEventListener('mouseout', (e) => {
  if (e.target.closest(interactiveSelector)) {
    cursorEl.classList.remove('is-pointer');
    }

  const postEl = e.target.closest('.post');
  if (postEl) {
    nameEl.classList.remove('is-visible');
  }
});

}