const renderer = new marked.Renderer();

renderer.link = (href, title, text) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`;
};

marked.use({ renderer });

fetch('web-page-changes.md')
    .then(r => r.text())
    .then(md => {
        document.getElementById('content').innerHTML = marked.parse(md);
    });

