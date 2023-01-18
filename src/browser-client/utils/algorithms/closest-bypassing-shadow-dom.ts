
/**
 * 
 *   Get closest element by passing shadow DOM, the Element.closest() validates
 * until the root node in the DOM. The use-cases for this are few, such as
 * getting environment information about the component
 */
export function closestElement(selector: string, base: Element = this) {
    const { ownerDocument } = base;
    let el: Node = base
    while (el != null && el !== ownerDocument){
        const element = (el as Element)
        const found = element.closest(selector);
        if(found){
            return found
        }
        el = (element.getRootNode() as ShadowRoot).host
    } 
    return null
}

/**
 *   Get closest element by passing shadow DOM, the Element.closest() validates
 * until the root node in the DOM. It is an adaptation of closestElement that
 * allows to get information inside shadow DOM of components with slot in shadow DOM
 */
export function closestElementNavigatingSlots(selector: string, base: Element = this) {
    const { ownerDocument } = base;
    let el: Node = base
    while (el != null && el !== ownerDocument){
        const element = (el as Element)
        if(element.matches(selector)){
            return element;
        }
        if (element.assignedSlot){
            el = element.assignedSlot;
            continue;
        }
        if(element.parentNode instanceof ShadowRoot){
            el = element.parentNode.host
            continue
        }
        el = element.parentNode
    
    }
    return null;
}