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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis isi slide di sini..." }),
    ],
    content: "<h1>Judul Materi</h1><p>Tulis isi materi seperti di Word.</p>",
  });

  if (!editor) return null;

  return (
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
          <button className="active">Slide 1</button>
          <button>Slide 2</button>
          <button>+ Slide</button>
        </aside>

        <main className="word-canvas">
          <div className="slide-page">
            <EditorContent editor={editor} />
          </div>
        </main>

        <aside className="word-properties">
          <h3>Tools</h3>
          <button>Text</button>
          <button>Image</button>
          <button>Video</button>
          <button>Quiz</button>
          <button>Preview</button>
        </aside>
      </div>
    </div>
  );
}
