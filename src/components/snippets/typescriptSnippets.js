// src/snippets/typescriptSnippets.js

const typescriptSnippets = [
  {
    label: 'interface',
    documentation: 'Create a TypeScript interface',
    insertText: 'interface ${1:Name} {\n\t${0:// properties...}\n}',
  },
  {
    label: 'enum',
    documentation: 'Create a TypeScript enum',
    insertText: 'enum ${1:EnumName} {\n\t${0:Value1},\n\tValue2,\n\t// ...\n}',
  },
  {
    label: 'class',
    documentation: 'Class declaration with constructor',
    insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${0:// constructor body...}\n\t}\n}',
  },
  // Add more TypeScript snippets as needed
];

export default typescriptSnippets;
