(()=>{
const dialog=document.querySelector('#subscribe-dialog'),url=new URL('/api/calendar',location.origin).href;
document.querySelector('#calendar-url').value=url;
document.querySelector('#subscribe-webcal').href=url.replace(/^https?:/,'webcal:');
document.querySelector('#subscribe-open').onclick=()=>dialog.showModal();
document.querySelector('#subscribe-close').onclick=()=>dialog.close();
document.querySelector('#subscribe-copy').onclick=async()=>{try{await navigator.clipboard.writeText(url);document.querySelector('#subscribe-feedback').textContent='Adresa zkopírovaná.';}catch{document.querySelector('#calendar-url').select();document.querySelector('#subscribe-feedback').textContent='Zkopíruj vybranou adresu ručně.';}};
})();
