import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title.includes('UniStore') ? title : `${title} | UniStore`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
