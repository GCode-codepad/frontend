// CodeEditor.jsx
import React, { useRef, useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import pythonSnippets from './snippets/pythonSnippets';
import javaSnippets from './snippets/javaSnippets';
import './CodeEditor.css';

const CodeEditor = ({ code, onChange, language, setLanguage }) => {
    const editorRef = useRef(null);
    const [monacoInstance, setMonacoInstance] = useState(null);
    const getMonacoKind = (kind) => {
        switch (kind) {
            case 'snippet':
                return monaco.languages.CompletionItemKind.Snippet;
            // Extend mappings as needed
            default:
                return monaco.languages.CompletionItemKind.Text;
        }
    };

    const getMonacoInsertTextRule = (rule) => {
        switch (rule) {
            case 'InsertAsSnippet':
                return monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
            // Extend mappings as needed
            default:
                return monaco.languages.CompletionItemInsertTextRule.None;
        }
    };

    const registerSnippets = (lang) => {
        if (!monacoInstance) return;

        // Dispose previous providers to avoid duplicates
        if (editorRef.current && editorRef.current.snippetProvider) {
            editorRef.current.snippetProvider.dispose();
        }

        let snippets = [];
        if (lang === 'python') {
            snippets = pythonSnippets;
        } else if (lang === 'java') {
            snippets = javaSnippets;
        }

        if (!snippets.length) return;

        // Register completion provider
        const provider = monacoInstance.languages.registerCompletionItemProvider(lang, {
            provideCompletionItems: () => {
                const suggestions = snippets.map((snippet) => ({
                    label: snippet.label,
                    kind: getMonacoKind(snippet.kind),
                    insertText: snippet.insertText,
                    insertTextRules: getMonacoInsertTextRule(snippet.insertTextRules),
                    documentation: snippet.documentation,
                }));
                return { suggestions };
            },
            // Adjust trigger characters as needed
            triggerCharacters: ['.'], // You can add more or change based on your needs
        });

        // Store the provider so it can be disposed later
        if (editorRef.current) {
            editorRef.current.snippetProvider = provider;
        }
    };

    const handleEditorDidMount = (editor, monacoInstance) => {
        editorRef.current = editor;
        setMonacoInstance(monacoInstance);
        registerSnippets(language);
    };



    // Register snippets whenever the language changes
    useEffect(() => {
        registerSnippets(language);
        console.log(language)
    }, [language, monacoInstance]);

    return (
        <div className="code-editor-container">
            <div className="language-select-container">
                <label htmlFor="language-select" className="language-select-label">
                    Select Language:
                </label>
                <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-select-dropdown"
                >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                </select>
            </div>
            <Editor
                height="50vh"
                language={language}
                value={code}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true,
                    },
                    snippetSuggestions: 'inline',
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 22,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    renderLineHighlight: 'gutter',
                    scrollBeyondLastLine: false,
                    overviewRulerLanes: 0,
                }}
                className="monaco-editor"
            />
        </div>
    );
};

export default CodeEditor;

