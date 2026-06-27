import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

export default function PPTManualEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Tulis isi slide di sini...",
      }),
    ],
    content: `
      <h1>Judul Materi</h1>
      <p>Tulis materi seperti di Word. Bisa bold, italic, underline, bullet, numbering, dan align.</p>
    `,
  });

  if (!editor) return null;

  return (
    <div className="ppt-editor">
      <div className="word-toolbar">
        <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>

        <span className="divider"></span>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>P</button>

        <span className="divider"></span>

        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>

        <span className="divider"></span>

        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>Left</button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>Right</button>
        <button onClick={() => editor.chain().focus().setTextAlign("justify").run()}>Justify</button>

        <span className="divider"></span>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Number</button>
      </div>

      <div className="ppt-workspace">
        <aside className="ppt-slide-list">
          <button className="active">
            <span>1</span>
            <small>Slide Judul</small>
          </button>
          <button>
            <span>2</span>
            <small>Slide Materi</small>
          </button>
          <button className="add-slide">+ Slide</button>
        </aside>

        <main className="ppt-canvas-wrap">
          <div className="ppt-canvas-page">
            <EditorContent editor={editor} />
          </div>
        </main>

        <aside className="ppt-properties">
          <h3>Properties</h3>
          <label>Theme</label>
          <select>
            <option>Gradient Purple</option>
            <option>Light</option>
            <option>Dark</option>
            <option>Green</option>
          </select>

          <label>Background</label>
          <input type="color" defaultValue="#111827" />

          <label>Tools</label>
          <button>Insert Image</button>
          <button>Insert Video</button>
          <button>Insert Quiz</button>
          <button>Preview</button>
        </aside>
      </div>
    </div>
  );
}
