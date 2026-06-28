import { useRef, useState } from "react";
const backgrounds=[
{name:"Navy Blue",value:"linear-gradient(135deg,#0b1f46,#1d4ed8)"},
{name:"Sky Bright",value:"linear-gradient(135deg,#ffffff,#dbeafe)"},
{name:"Yellow Flower",value:"radial-gradient(circle at 16% 18%,#facc15 0 7%,transparent 8%), radial-gradient(circle at 82% 20%,#fde047 0 8%,transparent 9%), linear-gradient(135deg,#fff7c2,#fef08a)"},
{name:"Pink Floral",value:"radial-gradient(circle at 18% 22%,#fb7185 0 7%,transparent 8%), radial-gradient(circle at 80% 18%,#f9a8d4 0 8%,transparent 9%), linear-gradient(135deg,#fff1f2,#fbcfe8)"},
{name:"Green Nature",value:"linear-gradient(135deg,#ecfdf5,#22c55e)"},
{name:"Galaxy",value:"radial-gradient(circle at 20% 15%,#8b5cf6,transparent 28%), radial-gradient(circle at 80% 20%,#22d3ee,transparent 25%), linear-gradient(135deg,#020617,#111827)"}
];
export default function BackgroundPicker({onPick}){const ref=useRef(null);const[url,setUrl]=useState("");function upload(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>onPick({type:"image",value:r.result});r.readAsDataURL(f);}return <div className="bg-panel"><h3>Background</h3><button onClick={()=>ref.current.click()}>Upload Lokal</button><input ref={ref} type="file" accept="image/*" hidden onChange={upload}/><div className="url-row"><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL gambar / Drive"/><button onClick={()=>url.trim()&&onPick({type:"image",value:url.trim()})}>Pakai</button></div><div className="bg-grid">{backgrounds.map(bg=><button key={bg.name} onClick={()=>onPick({type:"css",value:bg.value})}><span style={{background:bg.value}}/><b>{bg.name}</b></button>)}</div></div>}