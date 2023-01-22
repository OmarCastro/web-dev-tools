const queryAllShadowHosts = (node: Node): Element[] => {
    const result = []
    const nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
    let currentNode;
    while (currentNode = nodeIterator.nextNode()) {
        if(currentNode.shadowRoot) {
            result.push(currentNode)
        }
    }
    return result
}

const queryAllShadowHostsRecursive = (node: Node): Element[] => {
    const result = []
    const firstResult = queryAllShadowHosts(node)
    result.push(...firstResult)
    firstResult.forEach(node => result.push(...queryAllShadowHostsRecursive(node.shadowRoot)))
    return result
}

const queryAllUndefinedElements = (node: Element|ShadowRoot) => node.querySelectorAll(":not(:defined)")

interface RegistryData {
    importCall: () => Promise<{default: typeof HTMLElement}>
    status: "pending" | "registering" | "registered"
}

const registry = {
    definedTagNames: new Set(),
    registeringTagNames: new Set(),
    registryMap: new Map<string, RegistryData>(),
    get pendingTagNames(){
        return Array.from(registry.registryMap.entries())
            .filter(([_, value]) => value.status === "pending")
            .map(([key]) => key)
    },
    get unregisteredTagNames() {
        const tagNames = registry.registryMap.keys()
        return Array.from(tagNames).filter(name => customElements.get(name) == null)
    },
    get tagNamesToRegister(){
        const {unregisteredTagNames, registryMap, definedTagNames} = registry
        return unregisteredTagNames.filter(name => definedTagNames.has(name) && registryMap.get(name).status === "pending")
    },
    registerElement: (name: string) => {
        const registryData = registry.registryMap.get(name);
        if(registryData?.status === "pending"){
            registryData.importCall().then(module => customElements.define(name, module.default))
        }
    }
}
const tagNamesToIgnore = new Set("script link template".split(" "));
const loopRegistryAnalysisFromNodes = (...nodes: Node[]) => {
    nodes.forEach(node => {
        if(node instanceof Element && !tagNamesToIgnore.has(node.tagName.toLowerCase())){
            queryAllUndefinedElements(node).forEach(elem => registry.definedTagNames.add(elem.tagName.toLowerCase()))
            const shadowHosts = queryAllShadowHostsRecursive(node).map(elem => elem.shadowRoot)
            shadowHosts.forEach(elem => {
                queryAllUndefinedElements(elem).forEach(elem => registry.definedTagNames.add(elem.tagName.toLowerCase()))
                observer.observe(elem, observerParams)
            })
        }
    })
    registry.tagNamesToRegister.forEach(registry.registerElement)
    if(registry.pendingTagNames.length <= 0){
        observer.disconnect();
    }
}

const mutationCallback: MutationCallback = (records) => {
    records.forEach((mutation) => {
        if(mutation.type != "childList"){
            return console.warn("reached unreachable code")
        }
        loopRegistryAnalysisFromNodes(...(mutation.addedNodes || []))
    })
    
}
const observerParams : MutationObserverInit = {
    childList: true,
    subtree: true
}
const observer = new MutationObserver(mutationCallback);


let idleCallback = 0
export function registerComponent(importCall: () => Promise<{default: typeof HTMLElement}>, tag: string){
    const {registryMap} = registry;
    if(registryMap.has(tag.toLowerCase())){
        return console.error(`A custom element with name "${tag}" already exists`)
    }
    registryMap.set(tag, {importCall, status: "pending"})
    observer.observe(document.body, observerParams);
    if(!idleCallback){
        idleCallback = requestIdleCallback(() => {
            loopRegistryAnalysisFromNodes(document.body)
            idleCallback = 0;
        })
    }
}
