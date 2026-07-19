import { useEffect } from 'react';

const SEO = ({ title, description }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | LibVerse`;
    } else {
      document.title = 'LibVerse - Best Library Management System | Digital Book Portal';
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
};

export default SEO;
