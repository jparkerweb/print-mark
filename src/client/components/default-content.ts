export const defaultMarkdownContent = `# print-mark Feature Showcase

Welcome to **print-mark** — a web application that converts Markdown to clean, printable HTML with PDF export.

---

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use ~~strikethrough~~ for deleted content.

Inline \`code\` looks like this, perfect for mentioning \`function names\` or \`variables\`.

---

## Links

- [External Link](https://example.com)
- Auto-linked URL: https://github.com
- [Link with Title](https://example.com "Hover to see this title")

---

## Lists

### Unordered List

- First item
- Second item
- Third item
  - Nested item A
  - Nested item B
    - Deeply nested item
- Fourth item

### Ordered List

1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B
4. Fourth step

### Task Lists

- [x] Create project structure
- [x] Implement Markdown parser
- [x] Build theme system
- [x] Add PDF export
- [ ] Deploy to production
- [ ] Write documentation

---

## Code Blocks

### JavaScript

\`\`\`javascript
// Calculate factorial using recursion
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ES6 arrow function variant
const factorialArrow = (n) => n <= 1 ? 1 : n * factorialArrow(n - 1);

console.log(factorial(5)); // Output: 120
\`\`\`

### Python

\`\`\`python
def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

# Print first 10 Fibonacci numbers
print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

### Bash

\`\`\`bash
#!/bin/bash

# Build and run Docker container
docker build -t print-mark:latest .
docker run -p 3000:3000 print-mark:latest

# Check container health
curl http://localhost:3000/api/health
\`\`\`

### TypeScript

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}
\`\`\`

---

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

> **Note:** Blockquotes can contain multiple paragraphs and other elements.
>
> - They can include lists
> - And **formatted** text
>
> \`\`\`
> Even code blocks!
> \`\`\`

### Nested Blockquotes

> First level quote
>> Second level quote
>>> Third level quote

---

## Tables

### Basic Table

| Feature | Description | Status |
|---------|-------------|--------|
| Editor | CodeMirror 6 with Markdown support | ✅ Active |
| Preview | Real-time HTML rendering | ✅ Active |
| Themes | 4 print-optimized themes | ✅ Active |
| PDF Export | Server-side generation with Puppeteer | ✅ Active |

### Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| Data | Data | Data |
| More Data | More Data | More Data |

---

## Images

Images are supported with optional alt text:

![Placeholder Image](https://via.placeholder.com/600x300/2563eb/ffffff?text=print-mark+Demo)

---

## Horizontal Rules

Three ways to create horizontal rules:

---

***

___

---

## Footnotes

Here's a sentence with a footnote[^1]. And another one[^2].

[^1]: This is the first footnote. It can contain multiple paragraphs.

[^2]: This is the second footnote with a [link](https://example.com).

---

## Special Characters & Escaping

Use backslash to escape special characters:

\\*Not italic\\*  \\*\\*Not bold\\*\\*  \\[Not a link\\]

Common symbols: &copy; &reg; &trade; &mdash; &ndash; &hellip;

---

## HTML (Sanitized)

print-mark sanitizes HTML for security, but basic tags are allowed:

<p>This is a <strong>paragraph</strong> with <em>HTML</em> tags.</p>

<details>
<summary>Click to expand</summary>
This content is hidden by default.
</details>

---

## Summary

This document demonstrates all the Markdown features supported by print-mark:

1. **Headers** (h1-h6)
2. **Text formatting** (bold, italic, strikethrough, code)
3. **Links** (regular and auto-linked)
4. **Lists** (ordered, unordered, nested, task lists)
5. **Code blocks** with syntax highlighting
6. **Blockquotes** (including nested)
7. **Tables** with alignment options
8. **Images** with alt text
9. **Horizontal rules**
10. **Footnotes**
11. **Escaped characters**
12. **Basic HTML**

---

*Tip: Drag and drop a \`.md\` file onto the editor to load it instantly!*

*Select a theme from the toolbar and export to PDF when ready.*
`
