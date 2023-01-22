interface Loader{
    clazz: typeof HTMLElement
    assign: (clazz: typeof HTMLElement) => void
    constructor: Function
    constructingInstance?: HTMLElement | null
}

const connectedCallback = Symbol("connectedCallback")
const disconnectedCallback = Symbol("disconnectedCallback")
const adoptedCallback = Symbol("adoptedCallback")
const attributeChangedCallback = Symbol("attributeChangedCallback")

function initComponent(loader: Loader, component: typeof HTMLElement){

    const loaded = Symbol();
    const instanceOf = (element: HTMLElement) => element[loaded] ?  element : loader.constructingInstance

    const newComponent = class extends component {
        constructor(){
            super()
            const targetNode = loader.constructingInstance
            this[loaded] = true
            targetNode[loaded] = true
            return targetNode
        }

        /* override attribute that can be used on constructors */ 

        get dataset(){
            return instanceOf(this).dataset
        }

        attachShadow(init: ShadowRootInit): ShadowRoot {
            return instanceOf(this).attachShadow(init)
        }
        get shadowRoot(){
            return instanceOf(this).shadowRoot
        }
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: unknown, listener: unknown, options?: unknown): void {
            return instanceOf(this).addEventListener(type as any,listener as any,options)
        }
        dispatchEvent(event: Event): boolean {
            return instanceOf(this).dispatchEvent(event)
        }
        setAttribute(qualifiedName: string, value: string): void { 
            return instanceOf(this).setAttribute(qualifiedName, value) 
        }
        getAttribute(qualifiedName: string): string {
            return instanceOf(this).getAttribute(qualifiedName)
        }
    }
    loader.assign(newComponent)
}

function assignLifecycleCallback(loader: Loader, clazz:typeof HTMLElement, symbol: symbol){
    const proto = clazz.prototype as any
    const loaderProto = loader.clazz.prototype as any
    const callback = proto[symbol.description]
    if(typeof callback === "function"){
        loaderProto[symbol] = callback
    } else {
        console.warn(`expected connectedCallback() on class ${clazz} none defined`)
        loaderProto[symbol] = () => {}
    }
}

function addConnectedCallback(loader: Loader){
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

function addDisconnectedCallback(loader: Loader){
    let waitingElements = []
    const newClass = class extends loader.clazz {
        disconnectedCallback(){this[disconnectedCallback]()}
        [disconnectedCallback](){ waitingElements.push(this) }
    }
    const oldAssign = loader.assign
    loader.assign = (clazz) => {
        oldAssign(clazz)
        assignLifecycleCallback(loader, clazz, disconnectedCallback)
        waitingElements.forEach(elem => elem[disconnectedCallback]())
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
                loader.constructingInstance = this;
                loader.constructor.call(this)
            }
        },
        constructor: function() {
            import(new URL(elementCodePath, importMetaUrl).toString()).then(module => initComponent(loader, module.default))
            loader.constructor = function(){waitingElements.push(this)}
            loader.constructor.call(this)
        },
        assign: (clazz) => {
            customElements.define(customElementTag+crypto.randomUUID(), clazz)   
            loader.constructor = () => new clazz()
            waitingElements.forEach(elem => {
                loader.constructingInstance = elem
                loader.constructor()
            })
            waitingElements = []
        }
    }


    if(options & LifecycleCallbackEnum.CONNECTED_CALLBACK){ addConnectedCallback(loader) }
    if(options & LifecycleCallbackEnum.DISCONNECTED_CALLBACK){ addDisconnectedCallback(loader) }

    
    const url = new URL(importMetaUrl)
    const elementName = url.searchParams.get('named')
    const customElementTag = elementName || defaultTag
    customElementTag && customElements.define(customElementTag, loader.clazz)   
}
