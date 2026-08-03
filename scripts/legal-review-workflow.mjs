#!/usr/bin/env node
/**
 * Legal Tools Review Workflow
 * Orchestrates local Ollama AI to review defensoria legal tools.
 *
 * Usage: node scripts/legal-review-workflow.mjs [--mode quick|full]
 *
 * Modes:
 *   quick  - Review legal-tools service only (fast, ~2 min)
 *   full   - Review all legal/AI modules (comprehensive, ~10 min)
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const MODES = {
  quick: ['legal-tools'],
  full: ['legal-tools', 'psychological-tools', 'social-tools', 'ai-assistant', 'transversal-tools', 'knowledge'],
};

function ollamaPrompt(moduleName, mode) {
  const prompts = {
    'legal-tools': `Review the legal-tools service at apps/api/src/modules/legal-tools/legal-tools.service.ts.
Focus on:
1. Correctness of legal logic (discrepancy analysis, typicality, deadlines)
2. Ollama + RAG integration robustness
3. JSON parsing with fallback behavior
4. Error handling and access control
5. Whether AI suggestions are properly distinguished from legal conclusions
6. Security: SQL injection, XSS, auth bypass

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.
Be thorough but concise.`,

    'psychological-tools': `Review the psychological-tools service at apps/api/src/modules/psychological-tools/psychological-tools.service.ts.
Focus on:
1. Correctness of psychological risk assessment logic (SARA/NVI scales)
2. Ollama + RAG integration for trauma analysis and risk scales
3. JSON parsing with fallback behavior
4. Whether the LLM only extracts evidence (not scores) and scores are computed deterministically
5. Error handling and access control
6. Whether clinical hypotheses are properly framed as non-diagnostic

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.`,

    'social-tools': `Review the social-tools service at apps/api/src/modules/social-tools/social-tools.service.ts.
Focus on:
1. Correctness of social vulnerability and environmental mapping logic
2. Ollama + RAG integration for family mapping and environmental factors
3. JSON parsing with fallback behavior
4. Error handling and access control
5. Whether AI analysis is properly framed as an "insumo" (input) for human review

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.`,

    'ai-assistant': `Review the ai-assistant service at apps/api/src/modules/ai-assistant/ai-assistant.service.ts.
Focus on:
1. Ollama integration correctness (endpoint, model, temperature)
2. Error handling when Ollama is unavailable
3. Whether legal document drafting preserves facts without invention
4. Whether risk analysis avoids clinical diagnoses
5. Security of the Ollama API calls

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.`,

    'transversal-tools': `Review the transversal-tools service at apps/api/src/modules/transversal-tools/transversal-tools.service.ts.
Focus on:
1. Correctness of unified timeline and anonymization logic
2. Error handling and edge cases
3. Whether PII anonymization is thorough

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.`,

    'knowledge': `Review the knowledge/RAG service at apps/api/src/modules/knowledge/rag.service.ts.
Focus on:
1. RAG pipeline correctness (embeddings, pgvector similarity search)
2. Ollama query integration with RAG context
3. Error handling when Ollama or embeddings service is unavailable
4. Whether RAG context is properly bounded (no injection)

Provide findings with severity: BLOCKER | CRITICAL | WARNING | SUGGESTION.`,
  };

  return prompts[moduleName] || `Review the ${moduleName} module in the defensoria project.`;
}

function runOllamaReview(moduleName, model = 'qwen2.5-coder:7b') {
  const prompt = ollamaPrompt(moduleName, 'full');
  const payload = JSON.stringify({
    model,
    prompt,
    system: 'You are a senior code reviewer specializing in legal/AI systems for child protection. Be thorough, precise, and actionable.',
    stream: false,
    options: { temperature: 0.2 },
  });

  try {
    const result = execSync(
      `curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '${payload}'`,
      { encoding: 'utf-8', timeout: 120000 },
    );
    const data = JSON.parse(result);
    return data.response || 'No response from Ollama';
  } catch (error) {
    return `Error reviewing ${moduleName}: ${error.message}`;
  }
}

function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--mode') ? args[args.indexOf('--mode') + 1] : 'quick';
  const modules = MODES[mode] || MODES.quick;
  const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'qwen2.5-coder:7b';

  console.log(`\n=== Legal Tools Review Workflow ===`);
  console.log(`Mode: ${mode}`);
  console.log(`Modules: ${modules.join(', ')}`);
  console.log(`Model: ${model}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const results = {};

  for (const mod of modules) {
    console.log(`[${new Date().toISOString()}] Reviewing ${mod}...`);
    const review = runOllamaReview(mod, model);
    results[mod] = review;

    const outputPath = join(projectRoot, 'scripts', 'review-output', `${mod}-review.md`);
    try {
      execSync(`mkdir -p "${join(projectRoot, 'scripts', 'review-output')}"`);
    } catch {
      // directory may exist
    }
    // Write individual review
    try {
      const { writeFileSync } = await import('fs');
      writeFileSync(outputPath, `# Review: ${mod}\n\n${review}\n`);
      console.log(`  -> Saved to ${outputPath}`);
    } catch {
      console.log(`  -> (could not save to file)`);
    }
  }

  // Summary
  console.log(`\n=== Review Complete ===`);
  console.log(`Modules reviewed: ${Object.keys(results).length}`);
  console.log(`Output directory: scripts/review-output/`);

  // Write combined report
  const { writeFileSync } = await import('fs');
  const combinedPath = join(projectRoot, 'scripts', 'review-output', 'combined-review.md');
  let combined = `# Legal Tools Review Report\n\n`;
  combined += `**Generated:** ${new Date().toISOString()}\n`;
  combined += `**Mode:** ${mode}\n`;
  combined += `**Model:** ${model}\n\n`;
  combined += `---\n\n`;

  for (const [mod, review] of Object.entries(results)) {
    combined += `## ${mod}\n\n${review}\n\n---\n\n`;
  }

  writeFileSync(combinedPath, combined);
  console.log(`Combined report: ${combinedPath}`);
}

main().catch(console.error);
