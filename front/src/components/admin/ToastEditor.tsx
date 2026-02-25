"use client";

import React, { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";

interface ToastEditorProps {
  initialValue?: string;
  onChange?: (html: string) => void;
  height?: string;
}

export default function ToastEditor({
  initialValue = "",
  onChange,
  height = "500px",
}: ToastEditorProps) {
  const editorRef = useRef<Editor>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && editorRef.current && initialValue) {
      const inst = editorRef.current.getInstance();
      inst.setHTML(initialValue);
      initialized.current = true;
    }
  }, [initialValue]);

  const handleChange = () => {
    if (!editorRef.current || !onChange) return;
    const inst = editorRef.current.getInstance();
    onChange(inst.getHTML());
  };

  useEffect(() => {
    if (document.getElementById("toastui-editor-css")) return;
    const link = document.createElement("link");
    link.id = "toastui-editor-css";
    link.rel = "stylesheet";
    link.href = "/toastui-editor.css";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="toast-editor-wrapper">
      <Editor
        ref={editorRef}
        initialValue={initialValue || " "}
        initialEditType="wysiwyg"
        previewStyle="vertical"
        height={height}
        useCommandShortcut={true}
        onChange={handleChange}
        toolbarItems={[
          ["heading", "bold", "italic", "strike"],
          ["hr", "quote"],
          ["ul", "ol", "indent", "outdent"],
          ["table", "link"],
          ["code", "codeblock"],
        ]}
        hideModeSwitch={false}
      />
    </div>
  );
}
