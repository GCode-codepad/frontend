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
  {
    label: 'while loop',
    kind: 'snippet',
    insertText: `while (\${1:condition}) {
    \${2:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java while loop',
  },
  {
    label: 'do-while loop',
    kind: 'snippet',
    insertText: `do {
    \${1:// TODO}
} while (\${2:condition});`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java do-while loop',
  },
  {
    label: 'switch statement',
    kind: 'snippet',
    insertText: `switch (\${1:variable}) {
    case \${2:option1}:
        \${3:// TODO}
        break;
    case \${4:option2}:
        \${5:// TODO}
        break;
    default:
        \${6:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java switch statement',
  },
  {
    label: 'try-catch block',
    kind: 'snippet',
    insertText: `try {
    \${1:// TODO}
} catch (\${2:Exception} \${3:e}) {
    \${4:// Handle exception}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java try-catch block',
  },
  {
    label: 'class declaration',
    kind: 'snippet',
    insertText: `public class \${1:ClassName} {
    
    \${2:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java class declaration',
  },
  {
    label: 'method declaration',
    kind: 'snippet',
    insertText: `public \${1:void} \${2:methodName}(\${3}) {
    \${4:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java method declaration',
  },
  {
    label: 'main method',
    kind: 'snippet',
    insertText: `public static void main(String[] args) {
    \${1:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java main method',
  },
  {
    label: 'array declaration',
    kind: 'snippet',
    insertText: `\${1:int}[] \${2:arrayName} = new \${1:int}[\${3:size}];`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java array declaration',
  },
  {
    label: 'print statement',
    kind: 'snippet',
    insertText: `System.out.println(\${1:message});`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java print statement',
  },
  {
    label: 'constructor declaration',
    kind: 'snippet',
    insertText: `public \${1:ClassName}(\${2:parameters}) {
    \${3:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java constructor declaration',
  },
  {
    label: 'enhanced for loop',
    kind: 'snippet',
    insertText: `for (\${1:type} \${2:element} : \${3:collection}) {
    \${4:// TODO}
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java enhanced for loop (foreach)',
  },
  {
    label: 'getter method',
    kind: 'snippet',
    insertText: `public \${1:type} get\${2:Field}() {
    return this.\${3:field};
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java getter method',
  },
  {
    label: 'setter method',
    kind: 'snippet',
    insertText: `public void set\${1:Field}(\${2:type} \${3:field}) {
    this.\${3:field} = \${3:field};
}`,
    insertTextRules: 'InsertAsSnippet',
    documentation: 'Java setter method',
  },
];

export default javaSnippets;
