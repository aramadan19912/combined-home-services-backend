import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const switchTo = (lng: 'ar' | 'en') => {
    if (lng !== current) {
      i18n.changeLanguage(lng);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={current === 'ar' ? 'default' : 'secondary'}
        size="sm"
        onClick={() => switchTo('ar')}
        aria-pressed={current === 'ar'}
      >
        {t('lang.ar')}
      </Button>
      <Button
        variant={current === 'en' ? 'default' : 'secondary'}
        size="sm"
        onClick={() => switchTo('en')}
        aria-pressed={current === 'en'}
      >
        {t('lang.en')}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;