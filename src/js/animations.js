// animations.js — 通用動畫觸發工具
export function animateFlash(element) {
  element.classList.add('animate-flash');
  element.addEventListener('animationend', () => {
    element.classList.remove('animate-flash');
  }, { once: true });
}

export function animateFadeIn(element) {
  element.classList.add('animate-fade-in');
}

export function animateSlideIn(element) {
  element.classList.add('animate-slide-in');
}

// 使用範例：
import { animateFlash, animateFadeIn } from './animations.js';

const card = document.querySelector('.card');
const timeline = document.querySelector('.timeline');

// 卡片屬性更新時閃爍強調
animateFlash(card);

// 首次載入時時間軸淡入
animateFadeIn(timeline);
