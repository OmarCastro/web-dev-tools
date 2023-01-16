


function closestFrom(el: Node | Window | Document, selector: string, ownerDocument: Document, window: Window): Element {
    if (!el || el === ownerDocument || el === window){
      return null;
    } 
    
    let found = (el as Element).closest(selector);
    return found ? found : closestFrom(((el as Element).getRootNode() as ShadowRoot).host, selector, ownerDocument, window);
}

function closestFrom__navigatingSlots(el: Node, selector: string, ownerDocument: Document): Element {
    
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


export function closestElement(selector: string, base: Element = this, {navigateSlots = false} = {}) {
    const { ownerDocument } = base;
    return navigateSlots ? closestFrom__navigatingSlots(base, selector, ownerDocument) : closestFrom(base, selector, ownerDocument, ownerDocument.defaultView)
  }