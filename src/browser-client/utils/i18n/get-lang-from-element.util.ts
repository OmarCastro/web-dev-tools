// @ts-ignore
import { closestElement } from "../algorithms/closest-bypassing-shadow-dom.ts";

function handleInvalidLanguage(elementWithLangAttr: Element, invalidLanguage: string): string{
    console.error(`invalid language "${invalidLanguage}" ignoring lang`)
    if(elementWithLangAttr === elementWithLangAttr.ownerDocument.documentElement){
        return navigator.language
    } else if(elementWithLangAttr.parentNode instanceof ShadowRoot){
        return getLanguageFromElement(elementWithLangAttr.parentNode.host)
    }
    return getLanguageFromElement(elementWithLangAttr.parentElement)
}

export function getLanguageFromElement(element: Element): string {
    const elementWithLangAttr = closestElement("[lang]", element, {navigateSlots: true});
    if(elementWithLangAttr == null){
        return navigator.language
    }
    const langValue = elementWithLangAttr.getAttribute("lang")
    try{
        const locale = new Intl.Locale(langValue)
        const {language, region} = locale
        if(region == null){
            return language
        }
        return `${language}-${region}`
    } catch (e){
        return handleInvalidLanguage(elementWithLangAttr, langValue)
    }
}