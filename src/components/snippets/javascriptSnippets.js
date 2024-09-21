// src/snippets/javascriptSnippets.js

const javascriptSnippets = [
  {
    label: 'log',
    documentation: 'Console log statement',
    insertText: 'console.log(${1:variable});',
  },
  {
    label: 'func',
    documentation: 'Function declaration',
    insertText: `function \${1:name}(\${2:params}) {
  \${0:// body...}
}`,
  },
  {
    label: 'clg',
    documentation: 'Console log shortcut',
    insertText: 'console.log(${1:variable});',
  },
  // Add more JavaScript snippets as needed
];

export default javascriptSnippets;
