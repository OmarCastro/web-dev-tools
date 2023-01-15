
const logI18nError = (name: string) => { console.error(`i18n methdo ${name} not provided`)}

interface I18n {
    translate: (text: string, ...params: unknown[] ) => string
    translateFroLanguage: (lang: string, text: string, ...params: unknown[] ) => string
    getTranslations: () => {[x: string]: string}
}


const currentImplementation: I18n = {
    translate: (text:string) => (logI18nError("translate"), text),
    translateFroLanguage: (lang: string, text: string) => (logI18nError("translateFroLanguage"), text),
    getTranslations: () => (logI18nError("getTranslations"), {})
}

export const implementation: Readonly<I18n> = Object.freeze({
    translate: (...args: Parameters<I18n['translate']>) => currentImplementation.translate(...args),
    translateFroLanguage: (...args: Parameters<I18n['translateFroLanguage']>) => currentImplementation.translateFroLanguage(...args),
    getTranslations: (...args: Parameters<I18n['getTranslations']>) => currentImplementation.getTranslations(...args)
})

export function provide(i18n: I18n){
    Object.assign(currentImplementation, i18n)
}