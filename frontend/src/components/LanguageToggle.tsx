
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      title={t('switch.language')}
      style={{
        position: "fixed",
        top: "5px",
        right: "clamp(70px, 15vw, 84px)", // Positioned to the left of the theme toggle
        zIndex: 50,
        width: "clamp(44px, 10vw, 48px)",
        height: "clamp(44px, 10vw, 48px)",
        borderRadius: "50%",
        background: "var(--theme-surface-bg)",
        border: "2px solid var(--theme-borderColor)",
        color: "var(--theme-iconColor)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 4px 16px var(--theme-shadow)`,
        transition: "var(--theme-transition)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        fontSize: "14px",
        fontWeight: "700",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = `0 8px 24px var(--theme-shadow)`;
        e.currentTarget.style.borderColor = "var(--theme-iconColor)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = `0 4px 16px var(--theme-shadow)`;
        e.currentTarget.style.borderColor = "var(--theme-borderColor)";
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <Languages size={14} style={{ marginBottom: '2px' }} />
        <span style={{ fontSize: '10px' }}>{language === 'en' ? 'हि' : 'EN'}</span>
      </div>
    </button>
  );
};

export default LanguageToggle;
