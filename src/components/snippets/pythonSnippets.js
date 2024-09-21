// src/snippets/pythonSnippets.js

const pythonSnippets = [
  {
    label: 'for loop',
    kind: 'snippet',
    insertText: `for \${1:variable} in \${2:iterable}:
    \${3:pass}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Python for loop',
  },
  {
    label: 'if statement',
    kind: 'snippet',
    insertText: `if \${1:condition}:
    \${2:pass}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Python if statement',
  },
  // Add more Python snippets as needed
];

export default pythonSnippets;
