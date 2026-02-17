// main.js

import { initComponents } from './ESModule/loader.js';
import { initHeader } from './ESModule/header.js';
import { initTheme } from './ESModule/theme.js';
import { initPreloader } from './ESModule/preloader.js';
import { initAOS } from './ESModule/aos.js';
import { initTyped } from './ESModule/typed.js';
import { initPureCounter } from './ESModule/purecounter.js';
import { initGLightbox } from './ESModule/glightbox.js';
import { initDynamicMenu } from './ESModule/dynamicMenu.js';
import { initSwiper } from './ESModule/swiper.js';
import { initIsotope } from './ESModule/isotope.js';
import { initScrollTop } from './ESModule/scrollTop.js';
import { initMarkdownLoader } from './ESModule/markdownLoader.js';
import { initMenuAutoOpenPersistent } from './ESModule/menuAutoOpen.js';

"use strict";

initComponents();
document.addEventListener('componentsLoaded', () => {
  initHeader();
  initTheme();
  initPreloader();
  initScrollTop();

  initAOS();
  initTyped();
  initPureCounter();
  initGLightbox();

  initDynamicMenu();

  initSwiper();
  initIsotope();
  initMenuAutoOpenPersistent();

  initMarkdownLoader();
});
