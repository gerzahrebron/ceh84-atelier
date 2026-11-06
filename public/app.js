const works = [
  ['armchair', 'Кресло с мягким сиденьем'],
  ['spiral-stairs', 'Винтовая лестница'],
  ['table', 'Стол на фигурных опорах'],
  ['river-table', 'Стол-река'],
  ['cabinet', 'Шкаф с фактурными фасадами']
];
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('dialog');
const large = document.querySelector('#large');

for (const [slug, title] of works) {
  const tile = document.createElement('button');
  const photo = new Image();
  tile.className = 'tile';
  photo.src = './img/' + slug + '.webp';
  photo.alt = title;
  photo.loading = 'lazy';
  tile.append(photo);
  gallery.append(tile);
  tile.onclick = () => {
    large.src = photo.src;
    large.alt = title;
    dialog.showModal();
  };
}
document.querySelector('#close').onclick=()=>dialog.close();
dialog.onclick=e=>{if(e.target===dialog) dialog.close()};
const form=document.querySelector('form'), statusLine=document.querySelector('#status');
let key;
form.oninput=()=>{key=undefined;statusLine.textContent=''};
form.onsubmit=async event=>{
  event.preventDefault(); const button=form.querySelector('button'); if(button.disabled)return;
  button.disabled=true; statusLine.textContent='Отправляем…';
  try{
    key ??= crypto.randomUUID();
    const response=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(new FormData(form)),id:key})});
    if(!response.ok) throw new Error();
    form.reset(); key=undefined; statusLine.textContent='Заявка принята. Антон сможет связаться с вами по указанному контакту.';
  }catch{statusLine.textContent='Не удалось отправить заявку. Повторите попытку или напишите в Instagram.'}
  finally{button.disabled=false}
};
