#!/usr/bin/env node

/**
 * Generate privacy.html from privacyPolicyData.js
 * This keeps the web version in sync with the app version
 */

const fs = require('fs');
const path = require('path');

// Since we're using ES modules in the source file, we need to handle it
// We'll read the file and parse it manually
const dataPath = path.join(__dirname, '..', 'utils', 'privacyPolicyData.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract lastUpdated date
const lastUpdatedMatch = dataContent.match(/lastUpdated:\s*'([^']+)'/);
const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : '2025-01-27';

// Format date for display
const formatDate = (dateString) => {
  // Parse YYYY-MM-DD format explicitly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Parse sections from the file
const sections = [];
const sectionRegex = /{\s*title:\s*'([^']+)',[\s\S]*?content:\s*\[([\s\S]*?)\],([\s\S]*?)},/g;

// More robust parsing: find each section block
let sectionBlocks = dataContent.split(/title:\s*'/);
sectionBlocks = sectionBlocks.slice(1); // Skip the first part before any sections

sectionBlocks.forEach((block) => {
  // Extract title - handle escaped quotes properly
  // Use a regex that matches strings with escaped quotes
  const titleMatch = block.match(/^((?:[^'\\]|\\.)+)'/);
  if (!titleMatch) return;
  
  // Unescape the title
  const title = titleMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  
  // Extract content array
  const content = [];
  const contentStart = block.indexOf('content: [');
  if (contentStart !== -1) {
    const contentEnd = block.indexOf('],', contentStart);
    if (contentEnd !== -1) {
      const contentBlock = block.substring(contentStart, contentEnd);
      const contentMatches = contentBlock.matchAll(/'([^']+)'/g);
      for (const match of contentMatches) {
        content.push(match[1]);
      }
    }
  }
  
  // Extract listItems array
  const listItems = [];
  const listStart = block.indexOf('listItems: [');
  if (listStart !== -1) {
    const listEnd = block.indexOf('],', listStart);
    if (listEnd !== -1) {
      const listBlock = block.substring(listStart, listEnd);
      const listMatches = listBlock.matchAll(/'([^']+)'/g);
      for (const match of listMatches) {
        listItems.push(match[1]);
      }
    }
  }
  
  // Extract additionalContent array
  const additionalContent = [];
  const additionalStart = block.indexOf('additionalContent: [');
  if (additionalStart !== -1) {
    const additionalEnd = block.indexOf('],', additionalStart);
    if (additionalEnd !== -1) {
      const additionalBlock = block.substring(additionalStart, additionalEnd);
      const additionalMatches = additionalBlock.matchAll(/'([^']+)'/g);
      for (const match of additionalMatches) {
        additionalContent.push(match[1]);
      }
    }
  }
  
  sections.push({ title, content, listItems, additionalContent });
});

// HTML utility functions
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatLink = (text) => {
  // Convert URLs to links
  return text.replace(
    /(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" class="link" target="_blank" rel="noopener noreferrer">$1</a>'
  );
};

const formatEmail = (text) => {
  // Convert email addresses to mailto links (but not if already in a link)
  return text.replace(
    /(?<!href=")(?<!>)([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)(?!<\/a>)/g,
    '<a href="mailto:$1" class="link">$1</a>'
  );
};

const formatText = (text) => {
  // First escape HTML, then add links, then add email links
  let formatted = escapeHtml(text);
  formatted = formatLink(formatted);
  formatted = formatEmail(formatted);
  return formatted;
};

// Generate HTML sections
const generateSectionHTML = (section) => {
  let html = `      <div class="section">
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
`;
  
  // Add content paragraphs
  section.content.forEach(para => {
    html += `        <p class="body-text">${formatText(para)}</p>\n`;
  });
  
  // Add list items if they exist
  if (section.listItems && section.listItems.length > 0) {
    html += `        <ul class="list">\n`;
    section.listItems.forEach(item => {
      html += `          <li class="list-item">${formatText(item)}</li>\n`;
    });
    html += `        </ul>\n`;
  }
  
  // Add additional content if it exists
  if (section.additionalContent && section.additionalContent.length > 0) {
    section.additionalContent.forEach(para => {
      html += `        <p class="body-text">${formatText(para)}</p>\n`;
    });
  }
  
  html += `      </div>`;
  return html;
};

// Generate full HTML
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - 13-Day Stories</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #12091A 0%, #1C0F29 50%, #2A1F3D 100%);
      color: #ffffff;
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #6E45CF 0%, #9D7AE8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .last-updated {
      font-size: 14px;
      color: #888;
      font-style: italic;
      margin-bottom: 32px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
      margin-top: 24px;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }

    .body-text {
      font-size: 16px;
      color: #e0e0e0;
      margin-bottom: 16px;
      line-height: 1.8;
    }

    .list {
      list-style: none;
      padding-left: 0;
      margin-bottom: 16px;
    }

    .list-item {
      font-size: 16px;
      color: #e0e0e0;
      margin-bottom: 12px;
      padding-left: 24px;
      position: relative;
      line-height: 1.8;
    }

    .list-item::before {
      content: '•';
      position: absolute;
      left: 8px;
      color: #9D7AE8;
      font-weight: bold;
    }

    .link {
      color: #9D7AE8;
      text-decoration: none;
      border-bottom: 1px solid rgba(157, 122, 232, 0.3);
      transition: border-color 0.2s;
    }

    .link:hover {
      border-bottom-color: #9D7AE8;
    }

    .footer {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: #888;
      font-size: 14px;
    }

    .footer a {
      color: #9D7AE8;
      text-decoration: none;
      margin: 0 8px;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .container {
        padding: 24px;
      }

      h1 {
        font-size: 24px;
      }

      .section-title {
        font-size: 18px;
      }

      .body-text,
      .list-item {
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">13-Day Stories</div>
      <h1>Privacy Policy</h1>
      <div class="last-updated">Last Updated: ${formatDate(lastUpdated)}</div>
    </div>

    <div class="content">
${sections.map(section => generateSectionHTML(section)).join('\n\n')}
    </div>

    <div class="footer">
      <p>
        <a href="/">Home</a> | 
        <a href="/privacy">Privacy Policy</a>
      </p>
      <p style="margin-top: 12px;">© 2025 13-Day Stories. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// Write the file
const outputPath = path.join(__dirname, '..', 'vercel', 'privacy.html');
fs.writeFileSync(outputPath, htmlTemplate, 'utf8');
console.log('✓ Generated privacy.html from privacyPolicyData.js');
console.log(`✓ Last updated: ${formatDate(lastUpdated)}`);
console.log(`✓ Generated ${sections.length} sections`);

