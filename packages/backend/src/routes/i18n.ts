/**
 * i18n routes — translate content and list supported languages.
 */

import { Router, type Router as RouterType } from "express";
import type { SupportedLanguage } from "@autodev/shared";
import {
  translateContent,
  batchTranslate,
  SUPPORTED_LANGUAGES,
} from "../services/i18n.js";

export const i18nRoutes: RouterType = Router();

// GET /api/i18n/languages — list supported languages
i18nRoutes.get("/languages", (_req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

// POST /api/i18n/translate — translate a block of text
i18nRoutes.post("/translate", async (req, res) => {
  const { text, language, repoId, fresherMode } = req.body as {
    text: string;
    language: SupportedLanguage;
    repoId: string;
    fresherMode?: boolean;
  };

  if (!text || !language || !repoId) {
    res.status(400).json({ error: "text, language, and repoId are required" });
    return;
  }

  try {
    const result = await translateContent(
      text,
      language,
      repoId,
      fresherMode ?? false
    );
    res.json(result);
  } catch (error) {
    console.error(`[route] Translation failed:`, error);
    res.status(500).json({ error: "Failed to translate content" });
  }
});

// POST /api/i18n/batch — translate multiple texts at once
i18nRoutes.post("/batch", async (req, res) => {
  const { texts, language, repoId, fresherMode } = req.body as {
    texts: string[];
    language: SupportedLanguage;
    repoId: string;
    fresherMode?: boolean;
  };

  if (!texts || !language || !repoId) {
    res
      .status(400)
      .json({ error: "texts, language, and repoId are required" });
    return;
  }

  try {
    const results = await batchTranslate(
      texts,
      language,
      repoId,
      fresherMode ?? false
    );
    res.json({ translations: results });
  } catch (error) {
    console.error(`[route] Batch translation failed:`, error);
    res.status(500).json({ error: "Failed to translate content" });
  }
});
