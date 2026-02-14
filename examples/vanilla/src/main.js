import './index.css';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';
import { Spotr } from '../../../src/index';
import spotrLogo from '../../shared/spotr.svg';
import {
  extractEditableConfig,
  getNestedValue,
  formatCellValue,
  parseConfigWithHandlers,
  EDITOR_WIDTH_KEY,
  DEFAULT_EDITOR_WIDTH,
  MIN_EDITOR_WIDTH,
} from '../../shared/utils';
import { keywordHandlers, sections } from '../../shared/spotr-config';

let currentSection = 'fields-basic';
let spotr = null;
let editorView = null;
let currentQuery = '';
let editorWidth = parseInt(localStorage.getItem(EDITOR_WIDTH_KEY)) || DEFAULT_EDITOR_WIDTH;
let isDragging = false;

// Initialize editor width
document.getElementById('editor-panel').style.width = editorWidth + 'px';

function parseEditorContent(content) {
  try {
    const parsed = JSON.parse(content);
    document.getElementById('parse-error').classList.add('hidden');
    
    // Merge with handlers from section defaults
    const merged = parseConfigWithHandlers(parsed, keywordHandlers[currentSection]);
    return merged;
  } catch (e) {
    const errorDiv = document.getElementById('parse-error');
    errorDiv.textContent = 'Parse Error: ' + e.message;
    errorDiv.classList.remove('hidden');
    return null;
  }
}

function createSpotr(parsedConfig) {
  const section = sections[currentSection];
  const config = parsedConfig
    ? { collection: section.data, ...parsedConfig }
    : { collection: section.data, ...section.config };
  
  spotr = new Spotr(config);
}

function renderSection(sectionId) {
  const section = sections[sectionId];
  currentSection = sectionId;

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.remove('nav-active');
    if (link.dataset.section === sectionId) {
      link.classList.add('nav-active');
    }
  });

  // Update editor content
  const editableConfig = extractEditableConfig(section.config);
  const editorContent = JSON.stringify(editableConfig, null, 2);
  
  if (editorView) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: editorContent }
    });
  }
  
  createSpotr(JSON.parse(editorContent));
  currentQuery = '';
  renderResults('');
}

function renderResults(query) {
  const section = sections[currentSection];
  let result;
  
  if (!query.trim()) {
    const limit = spotr.options?.limit || section.config.limit || Infinity;
    result = {
      results: spotr.collection.slice(0, limit).map((item) => ({ item, score: null })),
      matchedKeywords: [],
      tokens: [],
      warnings: [],
    };
  } else {
    result = spotr.query(query);
  }

  const content = document.getElementById('content');
  content.innerHTML = `
    <h1 class="text-2xl font-bold mb-2 text-neutral-100">${section.title}</h1>
    <p class="text-neutral-400 mb-6">${section.description}</p>
    
    <div class="mb-4">
      <input 
        type="text" 
        id="search-input" 
        value="${query}"
        placeholder="Search..." 
        class="w-full px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div class="mb-4 flex gap-2 flex-wrap">
      ${section.examples.map((ex) => `<button class="example-btn px-3 py-1 text-sm bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600">${ex}</button>`).join('')}
    </div>
    
    <div id="matched-keywords" class="mb-4"></div>
    <div id="warnings" class="mb-4"></div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full bg-neutral-800 border border-neutral-700">
        <thead>
          <tr class="bg-neutral-700">
            <th class="px-4 py-2 text-left text-sm font-medium text-neutral-300">Score</th>
            ${section.columns.map((col) => `<th class="px-4 py-2 text-left text-sm font-medium text-neutral-300">${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="results-body"></tbody>
      </table>
    </div>
  `;

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    renderResults(e.target.value);
  });

  document.querySelectorAll('.example-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentQuery = btn.textContent;
      searchInput.value = btn.textContent;
      renderResults(btn.textContent);
    });
  });

  const tbody = document.getElementById('results-body');

  const matchedKeywordsDiv = document.getElementById('matched-keywords');
  if (result.matchedKeywords.length > 0) {
    matchedKeywordsDiv.innerHTML = `
      <div class="text-sm text-neutral-400">
        <span class="font-medium">Matched Keywords:</span>
        ${result.matchedKeywords.map((k) => `<span class="keyword-highlight ml-2">${k.name} (${k.terms.join(', ')})</span>`).join('')}
      </div>
    `;
  } else {
    matchedKeywordsDiv.innerHTML = '';
  }

  const warningsDiv = document.getElementById('warnings');
  if (result.warnings.length > 0) {
    warningsDiv.innerHTML = `
      <div class="text-sm text-amber-400 bg-amber-900/30 p-2 rounded">
        <span class="font-medium">Warnings:</span>
        ${[...new Set(result.warnings)].join('; ')}
      </div>
    `;
  } else {
    warningsDiv.innerHTML = '';
  }

  tbody.innerHTML = result.results
    .map(
      (r) => `
    <tr class="border-t border-neutral-700 hover:bg-neutral-700/50">
      <td class="px-4 py-2 text-sm text-neutral-200">${r.score !== null ? r.score.toFixed(2) : '-'}</td>
      ${section.columns.map((col) => `<td class="px-4 py-2 text-sm text-neutral-200">${formatCellValue(getNestedValue(r.item, col))}</td>`).join('')}
    </tr>
  `
    )
    .join('');
}

// Initialize CodeMirror
function initEditor() {
  const section = sections[currentSection];
  const editableConfig = extractEditableConfig(section.config);
  const initialContent = JSON.stringify(editableConfig, null, 2);

  editorView = new EditorView({
    doc: initialContent,
    extensions: [
      basicSetup,
      javascript(),
      vsCodeDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString();
          const parsedConfig = parseEditorContent(content);
          if (parsedConfig) {
            createSpotr(parsedConfig);
            renderResults(currentQuery);
          }
        }
      }),
    ],
    parent: document.getElementById('editor'),
  });
}

// Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
  const section = sections[currentSection];
  const editableConfig = extractEditableConfig(section.config);
  const content = JSON.stringify(editableConfig, null, 2);
  
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: content }
  });
  
  document.getElementById('parse-error').classList.add('hidden');
  createSpotr(JSON.parse(content));
  renderResults(currentQuery);
});

// Resize handle
const resizeHandle = document.getElementById('resize-handle');
const editorPanel = document.getElementById('editor-panel');

resizeHandle.addEventListener('mousedown', (e) => {
  isDragging = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const newWidth = window.innerWidth - e.clientX;
  editorWidth = Math.max(MIN_EDITOR_WIDTH, newWidth);
  editorPanel.style.width = editorWidth + 'px';
  localStorage.setItem(EDITOR_WIDTH_KEY, editorWidth.toString());
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// Navigation
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    renderSection(link.dataset.section);
  });
});

// Set logo
const logoImg = document.querySelector('nav img');
if (logoImg) {
  logoImg.src = spotrLogo;
}

// Initialize
initEditor();
createSpotr(JSON.parse(JSON.stringify(extractEditableConfig(sections[currentSection].config))));
renderResults('');
