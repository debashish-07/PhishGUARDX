/**
 * Script to convert PROJECT_REPORT.md to a downloadable PDF
 * Run with: node scripts/generate-project-report-pdf.js
 */

const fs = require('fs');
const path = require('path');

// Read the markdown file
const reportPath = path.join(__dirname, '..', 'PROJECT_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf-8');

// Create HTML version with styling
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Report - Quantum-Inspired Multi-Modal AI for Real-Time Browser Security</title>
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        h1 {
            font-size: 24pt;
            font-weight: bold;
            text-align: center;
            margin: 40px 0 20px 0;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 18pt;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
            page-break-after: avoid;
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
        }
        
        h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }
        
        h4 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }
        
        p {
            margin: 10px 0;
            text-align: justify;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
        }
        
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-left: 4px solid #333;
            overflow-x: auto;
            page-break-inside: avoid;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.4;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        blockquote {
            border-left: 4px solid #ccc;
            margin: 15px 0;
            padding-left: 15px;
            color: #666;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
        
        .title-page {
            text-align: center;
            margin-top: 100px;
        }
        
        .title-page h1 {
            font-size: 28pt;
            margin-bottom: 30px;
        }
        
        .title-page .subtitle {
            font-size: 16pt;
            margin-bottom: 50px;
        }
        
        .title-page .author-info {
            font-size: 12pt;
            line-height: 2;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="no-print" style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;" onclick="window.print()">
        📄 Print / Save as PDF
    </div>
    
    <div id="content">
        ${convertMarkdownToHTML(reportContent)}
    </div>
    
    <script>
        // Auto-format tables
        document.querySelectorAll('table').forEach(table => {
            table.style.pageBreakInside = 'avoid';
        });
        
        // Add page numbers (optional)
        let pageNum = 1;
        document.querySelectorAll('h2').forEach((h2, index) => {
            if (index > 0) {
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break';
                h2.parentNode.insertBefore(pageBreak, h2);
            }
        });
    </script>
</body>
</html>
`;

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Convert headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Convert horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Convert unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Convert ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Convert tables
    html = html.replace(/\|(.+)\|/g, function (match) {
        const cells = match.split('|').filter(cell => cell.trim());
        const isHeader = match.includes('---');
        if (isHeader) return '';

        const tag = cells[0].includes('**') ? 'th' : 'td';
        return '<tr>' + cells.map(cell => `<${tag}>${cell.trim().replace(/\*\*/g, '')}</${tag}>`).join('') + '</tr>';
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

    // Convert paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h(\d)><\/p>/g, '</h$1>');
    html = html.replace(/<p><hr><\/p>/g, '<hr>');
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');
    html = html.replace(/<p><table>/g, '<table>');
    html = html.replace(/<\/table><\/p>/g, '</table>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p><\/p>/g, '');

    return html;
}

// Write HTML file
const outputPath = path.join(__dirname, '..', 'PROJECT_REPORT.html');
fs.writeFileSync(outputPath, htmlContent, 'utf-8');

console.log('✅ Project report HTML generated successfully!');
console.log(`📄 Location: ${outputPath}`);
console.log('\n📋 Instructions:');
console.log('1. Open PROJECT_REPORT.html in your browser');
console.log('2. Click "Print / Save as PDF" button (or press Ctrl+P)');
console.log('3. Select "Save as PDF" as the destination');
console.log('4. Click "Save" to download the PDF');
console.log('\n✨ Your professional project report is ready!');
