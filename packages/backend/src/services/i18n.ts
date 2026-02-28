/**
 * Multi-language support (i18n) — translates AI-generated content into
 * Indian languages using Bedrock Claude.
 * Supported: Hindi, Tamil, Telugu, Kannada, Bengali, Marathi.
 */

import { invokeBedrock } from "./bedrock.js";
import { cacheThroughAsync } from "./cache.js";
import type {
  SupportedLanguage,
  LanguageOption,
  TranslatedContent,
} from "@autodev/shared";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

function getLanguageName(code: SupportedLanguage): string {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? "English"
  );
}

/**
 * Build a system prompt for translation.
 */
function translationSystemPrompt(
  targetLang: string,
  fresherMode: boolean
): string {
  const base = `You are a professional technical translator. Translate the following developer documentation from English to ${targetLang}.
Keep all code snippets, file paths, variable/function names, and technical identifiers in English (do not translate them).
Keep formatting (bullets, headers, newlines) intact.`;

  if (fresherMode) {
    return `${base}
Additionally, simplify the explanation so a fresh college graduate with basic programming knowledge can understand it.
Add brief analogies where helpful. Avoid jargon without explanation.`;
  }

  return base;
}

/**
 * Translate a block of text to a target language.
 * Caches results in DynamoDB so repeated translations are instant.
 */
export async function translateContent(
  text: string,
  targetLang: SupportedLanguage,
  repoId: string,
  fresherMode: boolean = false
): Promise<TranslatedContent> {
  // No-op for English
  if (targetLang === "en" && !fresherMode) {
    return {
      language: "en",
      originalText: text,
      translatedText: text,
      isFresherMode: false,
    };
  }

  const cacheNs = fresherMode ? "fresher" : "translation";
  const cacheInput = `${targetLang}:${text}`;

  const translated = await cacheThroughAsync<string>(
    cacheNs as "fresher" | "translation",
    repoId,
    cacheInput,
    async () => {
      const langName = getLanguageName(targetLang);
      const systemPrompt = translationSystemPrompt(langName, fresherMode);

      let userMessage: string;
      if (targetLang === "en" && fresherMode) {
        userMessage = `Simplify the following developer documentation for a fresh college graduate:\n\n${text}`;
      } else {
        userMessage = `Translate the following to ${langName}:\n\n${text}`;
      }

      const result = await invokeBedrock(
        [{ role: "user", content: userMessage }],
        systemPrompt,
        { model: "haiku", maxTokens: 4096, temperature: 0.2 }
      );

      return result;
    },
    7200 // cache translations for 2 hours
  );

  return {
    language: targetLang,
    originalText: text,
    translatedText: translated,
    isFresherMode: fresherMode,
  };
}

/**
 * Batch-translate multiple texts to the same language.
 */
export async function batchTranslate(
  texts: string[],
  targetLang: SupportedLanguage,
  repoId: string,
  fresherMode: boolean = false
): Promise<TranslatedContent[]> {
  // Process in parallel with concurrency limit of 3
  const results: TranslatedContent[] = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((t) => translateContent(t, targetLang, repoId, fresherMode))
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        // Fallback: return original on failure
        results.push({
          language: targetLang,
          originalText: texts[results.length],
          translatedText: texts[results.length],
          isFresherMode: fresherMode,
        });
      }
    }
  }

  return results;
}
