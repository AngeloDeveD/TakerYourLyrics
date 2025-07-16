import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-electron-fs-backend';

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
            ipcRenderer: window.api.i18nextElectronBackend,
        },
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
