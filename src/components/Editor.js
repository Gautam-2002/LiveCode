import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
// import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike"; // Import C++ mode
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          //   mode: { name: "javascript", json: true },
          //   theme: "dracula",
          //   autoCloseTags: true,
          //   autoCloseBrackets: true,
          //   lineNumbers: true,
          mode: "text/x-c++src", // Set mode to C++ syntax highlighting
          theme: "dracula", // Keep the Dracula theme
          autoCloseBrackets: true, // Auto-close brackets
          lineNumbers: true, // Show line numbers
          indentUnit: 4, // Set indentation to 4 spaces
          smartIndent: true, // Enable smart indentation
          matchBrackets: true, // Highlight matching brackets
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
