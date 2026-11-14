import { useEffect } from 'react';

interface DocumentMeta {
  title: string;
  description?: string;
}

/**
 * Sets document.title and the meta-description tag while a page is mounted,
 * restoring the previous values on unmount. A lightweight alternative to a
 * Helmet-style dependency for a small SPA where only the title bar and tab
 * need to reflect the current route - the initial HTML's tags (index.html)
 * are what search crawlers and social-share previews actually see.
 */
export function useDocumentMeta({ title, description }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const descriptionTag = description
      ? document.querySelector<HTMLMetaElement>('meta[name="description"]')
      : null;
    const previousDescription = descriptionTag?.getAttribute('content') ?? null;
    if (descriptionTag && description) {
      descriptionTag.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription !== null) {
        descriptionTag.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
