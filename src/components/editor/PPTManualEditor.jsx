import { useState } from "react";
import BackgroundPicker from "./BackgroundPicker";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

export default function PPTManualEditor() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      name: "Slide 1",
      content: "<h1>Judul Materi</h1><p>Tulis isi materi seperti di Word.</p>",
    },
  ]);

  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const [background, setBackground] = useState({
    type: "css",
    value: "linear-gradient(135deg, #111827, #283c75)",
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis isi slide di sini..." }),
    ],
    content: slides[active].content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setSlides((old) =>
        old.map((slide, index) =>
          index === active ? { ...slide, content: html } : slide
        )
      );
    },
  });

  function changeSlide(index) {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const updatedSlides = slides.map((slide, i) =>
      i === active ? { ...slide, content: currentHtml } : slide
    );

    setSlides(updatedSlides);
    setActive(index);
    setTimeout(() => {
      editor.commands.setContent(updatedSlides[index].content);
    }, 0);
  }

  function addSlide() {
    const newSlide = {
      id: Date.now(),
      name: `Slide ${slides.length + 1}`,
      content: "<h1>Slide Baru</h1><p>Tulis isi slide baru di sini.</p>",
    };

    setSlides([...slides, newSlide]);
    setActive(slides.length);

    setTimeout(() => {
      editor?.commands.setContent(newSlide.content);
    }, 0);
  }

  function duplicateSlide() {
    const copy = {
      id: Date.now(),
      name: `${slides[active].name} Copy`,
      content: editor.getHTML(),
    };

    const next = [...slides];
    next.splice(active + 1, 0, copy);
    setSlides(next);
    setActive(active + 1);

    setTimeout(() => {
      editor?.commands.setContent(copy.content);
    }, 0);
  }

  function deleteSlide() {
    if (slides.length === 1) return alert("Minimal harus ada 1 slide.");

    const next = slides.filter((_, index) => index !== active);
    const nextIndex = Math.max(0, active - 1);

    setSlides(next);
    setActive(nextIndex);

    setTimeout(() => {
      editor?.commands.setContent(next[nextIndex].content);
    }, 0);
  }

  function insertText() {
    editor.chain().focus().insertContent("<p>Teks baru...</p>").run();
  }

  function insertImage() {
    const url = prompt("Masukkan URL gambar:");
    if (!url) return;
    editor.chain().focus().insertContent(`<img src="${url}" style="max-width:100%;border-radius:16px;" />`).run();
  }

  function insertVideo() {
    const url = prompt("Masukkan link video/YouTube:");
    if (!url) return;
    editor.chain().focus().insertContent(`<p>🎬 Video: <a href="${url}" target="_blank">${url}</a></p>`).run();
  }

  function insertQuiz() {
    editor.chain().focus().insertContent(`
      <h2>Kuis</h2>
      <p><b>Pertanyaan:</b> Tulis pertanyaan di sini?</p>
      <ul>
        <li>A. Pilihan A</li>
        <li>B. Pilihan B</li>
        <li>C. Pilihan C</li>
        <li>D. Pilihan D</li>
      </ul>
      <p><b>Jawaban:</b> A</p>
    `).run();
  }

  function saveDraft() {
    alert("Draft berhasil disimpan sementara di browser.");
  }

  if (!editor) return null;

  return (
    <>
      <div className="word-ppt-editor">
        <div className="word-toolbar">
          <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
          <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
          <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
          <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
          <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>Left</button>
          <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</button>
          <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>Right</button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Number</button>
        </div>

        <div className="word-editor-layout">
          <aside className="word-slide-list">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={active === index ? "active" : ""}
                onClick={() => changeSlide(index)}
              >
                {slide.name}
              </button>
            ))}

            <button onClick={addSlide}>+ Slide</button>
            <button onClick={duplicateSlide}>Copy Slide</button>
            <button onClick={deleteSlide}>Hapus Slide</button>
          </aside>

          <main className="word-canvas">
            <div
              className="slide-page"
              style={
                background.type === "image"
                  ? { backgroundImage: `url(${background.value})` }
                  : { background: background.value }
              }
            >
              <EditorContent editor={editor} />
            </div>
          </main>

          <aside className="word-properties">
            <h3>Tools</h3>
            <button onClick={insertText}>Text</button>
            <button onClick={insertImage}>Image</button>
            <button onClick={insertVideo}>Video</button>
            <button onClick={insertQuiz}>Quiz</button>
            <button onClick={() => setPreview(true)}>Preview</button>
            <button onClick={saveDraft}>Simpan Draft</button>
          </aside>
        </div>
      </div>

      {preview && (
        <div className="preview-modal">
          <div className="preview-box">
            <div className="preview-head">
              <h2>Preview PPT</h2>
              <button onClick={() => setPreview(false)}>Tutup</button>
            </div>

            <div className="preview-slide-box">
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
