import CodeEditor from '@monaco-editor/react'
import React from 'react'

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string) : void
}

const Editor: React.FC<CodeEditorProps> = ({onChange, initialValue}) => {
        const onEditorDidMount = (getValue: () => string, monacoEditor: any) => {
                monacoEditor.onDidChangeModelContent(() => {
                 onChange(getValue());
                });
        }
        return <CodeEditor
                editorDidMount={onEditorDidMount}
                value = {initialValue}
                theme="dark"
                language="javascript"
                height="500px"
                options = {{
                        wordWrap: 'on',
                        minimap: {enabled: false},
                        showUnused: false,
                        folding: false,
                        lineNumbersMinChars: 3,
                        fontSize: 16,
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                    }}
        />

}

export default Editor;
