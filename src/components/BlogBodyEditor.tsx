import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Bold, Italic, Strikethrough, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { List } from "@ckeditor/ckeditor5-list";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { Link as EditorLink } from "@ckeditor/ckeditor5-link";
import "@ckeditor/ckeditor5-ui/dist/index.css";
import "@ckeditor/ckeditor5-editor-classic/dist/index.css";
import "@ckeditor/ckeditor5-essentials/dist/index.css";
import "@ckeditor/ckeditor5-paragraph/dist/index.css";
import "@ckeditor/ckeditor5-heading/dist/index.css";
import "@ckeditor/ckeditor5-basic-styles/dist/index.css";
import "@ckeditor/ckeditor5-list/dist/index.css";
import "@ckeditor/ckeditor5-block-quote/dist/index.css";
import "@ckeditor/ckeditor5-link/dist/index.css";

const EDITOR_CONFIG = {
  licenseKey: "GPL",
  plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, List, BlockQuote, EditorLink],
  toolbar: [
    "undo", "redo", "|", "heading", "|", "bold", "italic", "underline", "strikethrough",
    "|", "bulletedList", "numberedList", "blockQuote", "link",
  ],
};

interface BlogBodyEditorProps {
  data: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export default function BlogBodyEditor({ data, disabled, onChange }: BlogBodyEditorProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={EDITOR_CONFIG}
      data={data}
      disabled={disabled}
      onChange={(_, editor) => onChange(editor.getData())}
    />
  );
}
