const modueMap = {}

function apply(element: HTMLElement, clazz: typeof HTMLElement, elementCodePath: string, importMetaUrl: string){
    const url = new URL(elementCodePath, importMetaUrl).toString()
    if(modueMap[url] instanceof Promise){
       return modueMap[url].then(({apply}) => apply(element, clazz))
    }
    if(modueMap[url]){
        return Promise.resolve(modueMap[url].apply(element, clazz))
    }
    modueMap[url] = import(url).then(module => modueMap[url] = module)
    return modueMap[url].then(({apply}) => apply(element, clazz))
}

export function registerComponent(elementCodePath: string, importMetaUrl: string, defaultTag: string = undefined){
    const clazz = class extends HTMLElement {
        constructor(){
            super()
            apply(this, clazz, elementCodePath, importMetaUrl)
        }
    }
    
    const url = new URL(importMetaUrl)
    const elementName = url.searchParams.get('named')
    const customElementTag = elementName && defaultTag
    customElementTag && customElements.define(customElementTag, clazz)   
}
