// ========================================
// I18n - Multi-language Support (Love Language Test)
// ========================================

(function () {
  'use strict';

  class I18n {
    constructor() {
      this.translations = {};
      this.supportedLanguages = ['ko', 'en', 'zh', 'hi', 'ru', 'ja', 'es', 'pt', 'id', 'tr', 'de', 'fr'];
      this.currentLang = this.detectLanguage();
    }

    detectLanguage() {
      try {
        const savedLang = localStorage.getItem('app_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) return savedLang;
      } catch (e) {}
      const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
      if (this.supportedLanguages.includes(browserLang)) return browserLang;
      return 'en';
    }

    async loadTranslations(lang) {
      try {
        const response = await fetch(`js/locales/${lang}.json`);
        if (!response.ok) throw new Error('Not found');
        this.translations[lang] = await response.json();
        return true;
      } catch (e) {
        if (lang !== 'en') return this.loadTranslations('en');
        return false;
      }
    }

    t(key) {
      try {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        return typeof value === 'string' ? value : key;
      } catch (e) {
        return key;
      }
    }

    async setLang(lang) {
      try {
        if (!this.supportedLanguages.includes(lang)) return false;
        if (!this.translations[lang]) await this.loadTranslations(lang);
        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
        this.updateUI();
        return true;
      } catch (e) {
        return false;
      }
    }

    updateUI() {
      try {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          const val = this.t(key);
          if (val !== key) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          const val = this.t(key);
          if (val !== key) el.placeholder = val;
        });
        const titleVal = this.t('meta.title');
        if (titleVal !== 'meta.title') document.title = titleVal;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
          const descVal = this.t('meta.description');
          if (descVal !== 'meta.description') meta.content = descVal;
        }
      } catch (e) {}
    }

    getLanguageName(lang) {
      const names = {
        'ko': '한국어', 'en': 'English', 'zh': '中文',
        'hi': 'हिन्दी', 'ru': 'Русский', 'ja': '日本語',
        'es': 'Español', 'pt': 'Português', 'id': 'Indonesia',
        'tr': 'Türkçe', 'de': 'Deutsch', 'fr': 'Français'
      };
      return names[lang] || lang;
    }

    getCurrentLanguage() {
      return this.currentLang;
    }
  }

  async function initI18n() {
    try {
      window.i18n = new I18n();
      await window.i18n.loadTranslations(window.i18n.currentLang);
      window.i18n.updateUI();
    } catch (e) {
      console.warn('i18n init failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})();
