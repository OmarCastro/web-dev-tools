interface Loader{
    clazz: typeof HTMLElement
    assign: (clazz: typeof HTMLElement) => void
    constructor: Function

    connectedCallback?:() => void
}




const connectedCallback = Symbol("connectedCallback")
const disconnectedCallback = Symbol("disconnectedCallback")
const adoptedCallback = Symbol("adoptedCallback")
const attributeChangedCallback = Symbol("attributeChangedCallback")

function initComponent(loader: Loader, component: typeof HTMLElement){
    loader.assign(component)
}

function assignLifecycleCallback(loader: Loader, clazz:typeof HTMLElement, symbol: Symbol){
    const proto = clazz.prototype as any
    const loaderProto = loader.clazz.prototype as any
    const callback = proto[symbol.description]
    if(typeof callback === "function"){
        loaderProto[connectedCallback] = callback
    } else {
        console.warn(`expected connectedCallback() on class ${clazz} none defined`)
        loaderProto[connectedCallback] = () => {}
    }
}

function addListenConnectedCallback(loader: Loader){
    let waitingElements = []
    const newClass = class extends loader.clazz {
        connectedCallback(){this[connectedCallback]()}
        [connectedCallback](){ waitingElements.push(this) }
    }
    const oldAssign = loader.assign
    loader.assign = (clazz) => {
        oldAssign(clazz)
        assignLifecycleCallback(loader, clazz, connectedCallback)
        waitingElements.forEach(elem => elem[connectedCallback]())
        waitingElements = []
    }
    loader.clazz = newClass
}

export enum LifecycleCallbackEnum {
    CONNECTED_CALLBACK=0b0001,
    DISCONNECTED_CALLBACK=0b0010,
    ADOPTED_CALLBACK=0b0100,
    OBSERVE_ATTRIBUTES=0b1000,    
}

export function registerComponent(elementCodePath: string, importMetaUrl: string, options: LifecycleCallbackEnum, observedAttributes: string[] = [],defaultTag: string = undefined){
    let waitingElements = []
    const loader: Loader = {
        clazz: class extends HTMLElement {
            constructor(){
                super()
                loader.constructor.call(this)
            }
        },
        constructor: function() {
            import(new URL(elementCodePath, importMetaUrl).toString()).then(module => initComponent(loader, module.default))
            loader.constructor = function(){waitingElements.push(this)}
            loader.constructor.call(this)
        },
        assign: (clazz) => {
            loader.constructor = (() => clazz.prototype.constructor())
            waitingElements.forEach(elem => loader.constructor.call(elem))
            waitingElements = []
        }
    }


    if(options & LifecycleCallbackEnum.CONNECTED_CALLBACK){ addListenConnectedCallback(loader) }

    
    const url = new URL(importMetaUrl)
    const elementName = url.searchParams.get('named')
    const customElementTag = elementName || defaultTag
    customElementTag && customElements.define(customElementTag, loader.clazz)   
}
