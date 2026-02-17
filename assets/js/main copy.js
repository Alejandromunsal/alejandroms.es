/**
 * Final Modular Main.js Optimized - Feb 16 2026
 * Author: Alejandro Muñoz Salas
 * Bootstrap v5.3.7
 */

document.addEventListener("componentsLoaded", () => {
  "use strict";

  const onReady = (fn) => document.readyState === "complete" ? fn() : window.addEventListener("load", fn);

  const header = document.getElementById('header');
  const headerToggleBtn = document.querySelector('.header-toggle');
  const swipeArea = document.querySelector('.swipe-area');
  const swipeHint = document.querySelector('.swipe-hint');
  const scrollTop = document.querySelector('.scroll-top');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const preloader = document.querySelector('#preloader');

  if (!header || !headerToggleBtn) return;

  let headerWidth = header.offsetWidth;
  window.addEventListener('resize', () => { headerWidth = header.offsetWidth; updateSwipeArea(); });

  /* ===============================
     HEADER SWIPE & MOBILE TOGGLE
  =============================== */
  let hintTimeout, startX = 0, currentX = 0, isDragging = false;

  const showSwipeHint = () => {
    if (window.innerWidth > 1199 || header.classList.contains('header-show')) return;
    swipeHint?.classList.add('active');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => swipeHint?.classList.remove('active'), 4500);
  };
  const updateSwipeArea = () => {
    if (window.innerWidth >= 1200) { header.classList.remove('header-closed'); if (swipeArea) swipeArea.style.pointerEvents = 'none'; return; }
    if (swipeArea) swipeArea.style.pointerEvents = header.classList.contains('header-show') ? 'none' : 'auto';
  };

  const openHeader = () => { header.classList.add('header-show'); headerToggleBtn.classList.replace('bi-list','bi-x'); header.classList.remove('header-closed'); swipeHint?.classList.remove('active'); updateSwipeArea(); };
  const closeHeader = () => { header.classList.remove('header-show'); headerToggleBtn.classList.replace('bi-x','bi-list'); header.classList.add('header-closed'); showSwipeHint(); updateSwipeArea(); };
  const headerToggle = (forceClose=false) => forceClose || header.classList.contains('header-show') ? closeHeader() : openHeader();

  headerToggleBtn.addEventListener('click', e => { e.stopPropagation(); headerToggle(); });
  header.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', e => { if (window.innerWidth<1200 && header.classList.contains('header-show') && !header.contains(e.target) && !headerToggleBtn.contains(e.target)) headerToggle(true); });

  document.addEventListener('touchstart', e => {
    if (window.innerWidth>=1200) return;
    startX = currentX = e.touches[0].clientX;
    if ((!header.classList.contains('header-show') && e.target.closest('.swipe-area')) || header.classList.contains('header-show')) {
      isDragging = true; header.style.transition='none';
    }
  });
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    let deltaX = currentX-startX;
    if (header.classList.contains('header-show')) deltaX=Math.min(0,deltaX);
    else { deltaX=Math.max(0,deltaX); deltaX=Math.min(deltaX,headerWidth); deltaX -= headerWidth; }
    header.style.transform=`translateX(${deltaX}px)`;
  });
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging=false; header.style.transition=''; header.style.transform='';
    const deltaX=currentX-startX, threshold=headerWidth/4;
    header.classList.contains('header-show') ? (deltaX<-threshold ? closeHeader() : openHeader()) : (deltaX>threshold ? openHeader() : closeHeader());
  });

  document.querySelectorAll('#navmenu a').forEach(link => link.addEventListener('click',()=>{if(window.innerWidth<1200&&header.classList.contains('header-show'))closeHeader();}));

  /* ===============================
     DROPDOWNS MULTINIVEL UNIFICADOS
  =============================== */
  const toggleDropdown = (li, menu, arrow) => {
    const isActive = li.classList.contains('active');
    if (isActive) closeDropdown(li);
    else openDropdown(li, menu, arrow);
  };
  const openDropdown = (li, menu, arrow) => {
    li.classList.add('active'); menu.style.display='block'; menu.style.height='0'; menu.style.opacity=0;
    const height = menu.scrollHeight+'px'; menu.offsetHeight;
    menu.style.transition='height 0.3s ease, opacity 0.3s ease'; menu.style.height=height; menu.style.opacity=1;
    if(arrow) arrow.style.transform='rotate(180deg)';
    menu.addEventListener('transitionend',()=>{menu.style.height=''; menu.style.transition='';},{once:true});
  };
  const closeDropdown = (li) => {
    li.classList.remove('active'); const menu=li.querySelector(':scope>ul'), arrow=li.querySelector(':scope>a>.toggle-dropdown'); if(!menu) return;
    menu.style.height=menu.scrollHeight+'px'; menu.offsetHeight; menu.style.transition='height 0.3s ease, opacity 0.3s ease';
    menu.style.height='0'; menu.style.opacity=0; if(arrow) arrow.style.transform='rotate(0deg)';
    menu.addEventListener('transitionend',()=>{menu.style.display='none'; menu.style.height=''; menu.style.opacity=''; menu.style.transition='';},{once:true});
    li.querySelectorAll('li.dropdown.active').forEach(child=>closeDropdown(child));
  };
  const initDropdownToggles = container => container.querySelectorAll('.toggle-dropdown').forEach(toggle=>{
    toggle.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
      const li=toggle.closest('li.dropdown'), menu=li?.querySelector(':scope>ul'); if(!li||!menu) return;
      li.parentNode.querySelectorAll(':scope>li.dropdown.active').forEach(s=>{if(s!==li)closeDropdown(s);});
      toggleDropdown(li, menu, toggle);
    });
  });
  initDropdownToggles(document);

  /* ===============================
     PRELOADER
  =============================== */
  if(preloader) onReady(()=>preloader.remove());

  /* ===============================
     SCROLL TOP
  =============================== */
  const toggleScrollTop = ()=>scrollTop?.classList.toggle('active',window.scrollY>100);
  scrollTop?.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
  onReady(toggleScrollTop); document.addEventListener('scroll',toggleScrollTop);

  /* ===============================
     AOS
  =============================== */
  onReady(()=>{if(window.AOS)AOS.init({duration:600,easing:'ease-in-out',once:true,mirror:false});});

  /* ===============================
     Typed.js
  =============================== */
  const typedEl=document.querySelector('.typed');
  if(typedEl&&window.Typed)new Typed('.typed',{strings:typedEl.getAttribute('data-typed-items').split(','),loop:true,typeSpeed:100,backSpeed:50,backDelay:2000});

  /* ===============================
     PureCounter
  =============================== */
  if(window.PureCounter)new PureCounter();

  /* ===============================
     GLightbox
  =============================== */
  if(window.GLightbox)GLightbox({selector:'.glightbox'});

  /* ===============================
     Dark / Light Theme
  =============================== */
  const applyTheme=mode=>{document.body.classList.toggle('light-mode',mode==='light'); updateThemeButton();};
  const updateThemeButton=()=>{if(!toggleThemeBtn)return; toggleThemeBtn.innerHTML=document.body.classList.contains('light-mode')?'<i class="bi bi-moon-fill"></i>':'<i class="bi bi-sun-fill"></i>';};
  applyTheme(localStorage.getItem('theme')||'dark');
  toggleThemeBtn?.addEventListener('click',()=>{const newMode=document.body.classList.contains('light-mode')?'dark':'light'; localStorage.setItem('theme',newMode); applyTheme(newMode);});
  window.addEventListener('storage',e=>{if(e.key==='theme')applyTheme(e.newValue);});

  /* ===============================
     Auto-open dropdown por URL
  =============================== */
  const normalizePath=path=>path.replace(window.location.origin,'').replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')||'/';
  const openMenuByCurrentURL=()=>{
    const currentPath=normalizePath(window.location.pathname);
    document.querySelectorAll('#navmenu a[href]').forEach(link=>{
      const href=link.getAttribute('href'); if(!href||href=='#')return;
      if(normalizePath(href)===currentPath){link.classList.add('active'); let parent=link.closest('li.dropdown'); while(parent){parent.classList.add('active'); const submenu=parent.querySelector(':scope>ul'); if(submenu)submenu.style.display='block'; parent=parent.parentElement.closest('li.dropdown');}}});
  };
  onReady(openMenuByCurrentURL);

  /* ===============================
     Tutoriales & Proyectos Dinámicos
  =============================== */
  const categoryIcons={proxmox:'bi bi-server',docker:'bi bi-box',linux:'bi bi-terminal',web:'bi bi-wifi',default:'bi bi-hdd-stack'};
  const getIconClass=cat=>categoryIcons[cat.toLowerCase()]||categoryIcons.default;

  const createMenuItems=(data,basePath)=>{
    return Object.entries(data).map(([key,value])=>{
      const li=document.createElement('li'); li.classList.add('dropdown');
      li.innerHTML=`<a href="#"><i class="${getIconClass(key)} navicon"></i>${key.charAt(0).toUpperCase()+key.slice(1)}<i class="bi bi-chevron-down toggle-dropdown"></i></a><ul class="dropdown-menu"></ul>`;
      const submenu=li.querySelector('ul');
      if(Array.isArray(value)) value.forEach(f=>{const childLi=document.createElement('li'); childLi.innerHTML=`<a href="/${basePath}/${key}/${f}"><i class="bi bi-file-earmark-text navicon"></i>${f.replace(/-/g,' ')}</a>`; submenu.appendChild(childLi);});
      else if(typeof value==='object') createMenuItems(value,`${basePath}/${key}`).forEach(c=>submenu.appendChild(c));
      initDropdownToggles(submenu); return li;
    });
  };

  const loadDynamicMenuRecursive=(selector,section,basePath)=>{
    const menu=document.querySelector(selector); if(!menu)return;
    fetch(`/forms/get-md-dir-tree.php?section=${section}`).then(r=>r.json()).then(data=>{createMenuItems(data,basePath).forEach(li=>menu.appendChild(li)); initDropdownToggles(menu);}).catch(console.error);
  };

  loadDynamicMenuRecursive('#navmenu li[data-id="tutoriales"]>.dropdown-menu','tutorials','tutoriales');
  loadDynamicMenuRecursive('#navmenu li[data-id="proyectos"]>.dropdown-menu','proyectos','proyectos');

  /* ===============================
     Swiper
  =============================== */
  onReady(()=>document.querySelectorAll(".init-swiper").forEach(el=>new Swiper(el,JSON.parse(el.querySelector(".swiper-config").innerHTML.trim()))));

  /* ===============================
     ISOTOPE
  =============================== */
  window.initDynamicFeatures=()=>{
    document.querySelectorAll('.isotope-layout').forEach(item=>{
      const container=item.querySelector('.isotope-container'); if(!container)return;
      const layout=item.getAttribute('data-layout')||'masonry';
      const filter=item.getAttribute('data-default-filter')||'*';
      const sort=item.getAttribute('data-sort')||'original-order';
      let iso; imagesLoaded(container,()=>{iso=new Isotope(container,{itemSelector:'.isotope-item',layoutMode:layout,filter,sortBy:sort});});
      item.querySelectorAll('.isotope-filters li').forEach(f=>f.addEventListener('click',function(){item.querySelector('.filter-active')?.classList.remove('filter-active'); this.classList.add('filter-active'); iso?.arrange({filter:this.getAttribute('data-filter')}); AOS?.refresh();}));
    });

    document.querySelectorAll('.skills-animation').forEach(el=>{if(!window.Waypoint)return; new Waypoint({element:el,offset:'80%',handler:()=>el.querySelectorAll('.progress-bar').forEach(p=>p.style.width=p.getAttribute('aria-valuenow')+'%')});});

    if(window.location.hash){const section=document.querySelector(window.location.hash); if(section)setTimeout(()=>{const m=parseInt(getComputedStyle(section).scrollMarginTop); window.scrollTo({top:section.offsetTop-m,behavior:'smooth'});},100);}
  };
});
