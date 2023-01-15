export function closestElement(selector: string, base: Element = this) {
    const { ownerDocument } = base;
    const windowObj = ownerDocument.defaultView;
    function __closestFrom(el: Element | Window | Document): Element {
      if (!el || el === ownerDocument || el === windowObj) return null;
      if ((el as Slottable).assignedSlot) el = (el as Slottable).assignedSlot;
      let found = (el as Element).closest(selector);
      return found
        ? found
        : __closestFrom(((el as Element).getRootNode() as ShadowRoot).host);
    }
    return __closestFrom(base);
  }