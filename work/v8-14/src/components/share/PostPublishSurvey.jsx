import { Send, Star, X } from "lucide-react";
import { useState } from "react";
import { auth } from "../../firebase/config";

export default function PostPublishSurvey({ material, user, onClose, notify }) {
  const [rating,setRating]=useState(0);
  const [comment,setComment]=useState("");
  const [sending,setSending]=useState(false);
  async function submit(event){
    event.preventDefault();
    if(!rating) return notify("Pilih nilai 1 sampai 5.","warning");
    if(comment.trim().length<3) return notify("Tambahkan komentar singkat.","warning");
    setSending(true);
    try{
      const token=await auth.currentUser?.getIdToken();
      const response=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token||""}`},body:JSON.stringify({name:user?.name||"Pengguna",email:user?.email||"",category:"Penilaian setelah publish",rating,ratingLabel:`${rating} dari 5`,comment:`Materi: ${material?.title||"Tanpa judul"}\n${comment.trim()}`})});
      const result=await response.json();
      if(!response.ok||!result.success) throw new Error(result.error||"Penilaian belum terkirim.");
      notify("Terima kasih, nilai dan komentar sudah dikirim."); onClose();
    }catch(error){notify(error.message||"Penilaian belum terkirim.","error");}
    finally{setSending(false);}
  }
  return <div className="post-publish-backdrop"><form className="post-publish-survey" onSubmit={submit}>
    <button type="button" className="survey-close" onClick={onClose}><X size={18}/></button>
    <span className="survey-icon">✓</span><small>PUBLIKASI BERHASIL</small><h2>Bagaimana pengalamanmu?</h2><p>Berikan nilai dan komentar setelah memublikasikan <b>{material?.title}</b>.</p>
    <div className="survey-stars">{[1,2,3,4,5].map((value)=><button type="button" key={value} className={value<=rating?"selected":""} onClick={()=>setRating(value)} aria-label={`Nilai ${value}`}><Star size={28} fill="currentColor"/><span>{value}</span></button>)}</div>
    <textarea rows="4" value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Apa yang sudah baik atau perlu diperbaiki?"/>
    <div className="survey-actions"><button type="button" onClick={onClose}>Nanti saja</button><button className="primary-button" disabled={sending}><Send size={17}/>{sending?"Mengirim...":"Kirim penilaian"}</button></div>
  </form></div>;
}
