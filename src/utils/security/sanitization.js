const ALLOWED_TAGS = {
  p: true, br: true, b: true, i: true,
  strong: true, em: true, u: true, a: true,
  ul: true, ol: true, li: true
};

export function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  function sanitizeNode(node) {
    if (node.nodeType === 3) return; // Text node

    if (node.nodeType === 1) { // Element node
      if (!ALLOWED_TAGS[node.tagName.toLowerCase()]) {
        node.replaceWith(...node.childNodes);
        return;
      }

      // Remove all attributes except href for links
      const attrs = Array.from(node.attributes);
      attrs.forEach(attr => {
        if (node.tagName.toLowerCase() === 'a' && attr.name === 'href') {
          // Ensure href is safe
          if (!attr.value.startsWith('http') && !attr.value.startsWith('/')) {
            node.removeAttribute(attr.name);
          }
        } else {
          node.removeAttribute(attr.name);
        }
      });
    }

    Array.from(node.childNodes).forEach(sanitizeNode);
  }

  sanitizeNode(div);
  return div.innerHTML;
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function validateInput(input, pattern) {
  if (typeof pattern === 'string') {
    return new RegExp(pattern).test(input);
  }
  return pattern.test(input);
}

export const SAFE_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,16}$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  date: /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/
};