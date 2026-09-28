(function () {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(min-width: 641px) and (hover: hover) and (pointer: fine)");
  const glow = document.createElement("div");
  glow.className = "cursor-glow"; glow.setAttribute("aria-hidden","true"); document.body.append(glow);
  let frame = 0, idleTimer, targetX = 0, targetY = 0, x = 0, y = 0, placed = false;
  function enabled(){return !reduced.matches && finePointer.matches && !document.hidden;}
  function hide(){glow.classList.remove("is-visible");cancelAnimationFrame(frame);frame=0;placed=false;clearTimeout(idleTimer);}
  function move(){
    frame=0;if(!enabled())return hide();
    x+=(targetX-x)*.24;y+=(targetY-y)*.24;
    glow.style.transform="translate3d("+(x-215)+"px,"+(y-215)+"px,0)";
    if(Math.abs(x-targetX)+Math.abs(y-targetY)>.5)frame=requestAnimationFrame(move);
  }
  document.addEventListener("pointermove",event=>{
    if(event.pointerType!=="mouse" || !enabled() || document.querySelector("dialog[open]"))return hide();
    targetX=event.clientX;targetY=event.clientY;
    if(!placed){x=targetX;y=targetY;placed=true;}
    glow.classList.add("is-visible");
    if(!frame)frame=requestAnimationFrame(move);
    clearTimeout(idleTimer);idleTimer=setTimeout(hide,1800);
  },{passive:true});
  document.documentElement.addEventListener("pointerleave",hide);
  window.addEventListener("blur",hide);
  document.addEventListener("keydown",hide);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)hide();});
  function animate(element,keyframes,options){
    if(!element || reduced.matches || !element.animate)return;
    return element.animate(keyframes,options);
  }
  let observer;
  if("IntersectionObserver" in window)observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(entry.isIntersecting){animate(entry.target,[{opacity:.35,translate:"0 14px"},{opacity:1,translate:"0 0"}],{duration:380,easing:"cubic-bezier(.2,.7,.2,1)"});observer.unobserve(entry.target);}}
  },{threshold:.08});
  window.KubiasMotion={
    cards(){observer?.disconnect();document.querySelectorAll(".stream-card,.empty-state").forEach(card=>{if(observer&&!reduced.matches)observer.observe(card);});},
    digit(element){animate(element,[{opacity:.4,translate:"0 3px"},{opacity:1,translate:"0 0"}],{duration:170,easing:"ease-out"});},
    reaction(element){animate(element,[{scale:"1"},{scale:"1.065",offset:.45},{scale:"1"}],{duration:270,easing:"ease-out"});}
  };
  function preferences(){hide();if(reduced.matches)document.getAnimations().forEach(animation=>animation.cancel());}
  reduced.addEventListener("change",preferences);finePointer.addEventListener("change",preferences);
  animate(document.querySelector(".hero-copy"),[{opacity:.4,translate:"0 12px"},{opacity:1,translate:"0 0"}],{duration:550,easing:"ease-out"});
  const heroArt=document.querySelector(".hero-art");
  if(heroArt)animate(heroArt,[{opacity:0,scale:".97"},{opacity:getComputedStyle(heroArt).opacity,scale:"1"}],{duration:650,easing:"ease-out"});
})();
