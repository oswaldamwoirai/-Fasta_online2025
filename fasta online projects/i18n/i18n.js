// i18n configuration and utility functions
import translations from './translations.js';

class I18n {
    constructor() {
        this.currentLocale = localStorage.getItem('cv_builder_locale') || navigator.language.split('-')[0] || 'en';
        this.translations = translations;
        this.fallbackLocale = 'en';
        
        // Initialize MutationObserver for dynamic content
        this.initObserver();
    }

    // Get current locale
    getCurrentLocale() {
        return this.currentLocale;
    }

    // Set locale and update UI
    setLocale(locale) {
        if (this.translations[locale]) {
            this.currentLocale = locale;
            localStorage.setItem('cv_builder_locale', locale);
            this.updatePageTranslations();
            document.documentElement.lang = locale;
            document.documentElement.dir = this.isRTL(locale) ? 'rtl' : 'ltr';
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('localeChanged', { 
                detail: { locale: locale }
            }));
            
            return true;
        }
        return false;
    }

    // Get translation for a key
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLocale];
        
        // Traverse the translations object
        for (const k of keys) {
            value = value?.[k];
            if (!value) {
                // Fallback to English if translation not found
                value = this.translations[this.fallbackLocale];
                for (const fallbackKey of keys) {
                    value = value?.[fallbackKey];
                    if (!value) break;
                }
                break;
            }
        }
        
        // Return key if no translation found
        if (!value) return key;
        
        // Replace parameters
        return this.interpolate(value, params);
    }

    // Replace parameters in translation string
    interpolate(text, params) {
        return text.replace(/\{(\w+)\}/g, (_, key) => {
            return params[key] !== undefined ? params[key] : `{${key}}`;
        });
    }

    // Update all translatable elements on the page
    updatePageTranslations() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.getParamsFromElement(element);
            element.textContent = this.t(key, params);
        });
        
        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Update elements with data-i18n-aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });
        
        // Update title
        document.title = this.t('app_name');
    }

    // Get parameters from data attributes
    getParamsFromElement(element) {
        const params = {};
        const dataset = element.dataset;
        
        Object.keys(dataset).forEach(key => {
            if (key.startsWith('i18nParam')) {
                const paramKey = key.replace('i18nParam', '').toLowerCase();
                params[paramKey] = dataset[key];
            }
        });
        
        return params;
    }

    // Initialize MutationObserver for dynamic content
    initObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        this.translateNode(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Translate a single node and its children
    translateNode(node) {
        if (node.getAttribute('data-i18n')) {
            const key = node.getAttribute('data-i18n');
            const params = this.getParamsFromElement(node);
            node.textContent = this.t(key, params);
        }
        
        if (node.getAttribute('data-i18n-placeholder')) {
            const key = node.getAttribute('data-i18n-placeholder');
            node.placeholder = this.t(key);
        }
        
        if (node.getAttribute('data-i18n-aria-label')) {
            const key = node.getAttribute('data-i18n-aria-label');
            node.setAttribute('aria-label', this.t(key));
        }
        
        // Recursively translate child nodes
        node.childNodes.forEach(child => {
            if (child.nodeType === 1) { // ELEMENT_NODE
                this.translateNode(child);
            }
        });
    }

    // Check if locale is RTL
    isRTL(locale) {
        const rtlLocales = ['ar', 'fa', 'he', 'ur'];
        return rtlLocales.includes(locale);
    }

    // Get available locales
    getAvailableLocales() {
        return Object.keys(this.translations);
    }

    // Format date according to locale
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
    }

    // Format number according to locale
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLocale, options).format(number);
    }
}

// Create and export singleton instance
const i18n = new I18n();
export default i18n;

// Add global access for use in HTML
window.i18n = i18n;
