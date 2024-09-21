// src/snippets/javaSnippets.js

const javaSnippets = [
  {
    label: 'for loop',
    kind: 'snippet',
    insertText: `for (int \${1:i} = 0; \${1:i} < \${2:count}; \${1:i}++) {
    \${3:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java for loop',
  },
  {
    label: 'if statement',
    kind: 'snippet',
    insertText: `if (\${1:condition}) {
    \${2:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java if statement',
  },
  // Add more Java snippets as needed
];

export default javaSnippets;
