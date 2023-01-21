
const initiated = Symbol();


const addProperty = (propertyName: string ,clazz: typeof HTMLElement) => {
    Object.defineProperty(clazz.prototype, propertyName, {
        get: function(this: HTMLElement) {
            return this.getAttribute(propertyName)
        },
        
        set: function(this: HTMLElement, key: string) {
            this.setAttribute(propertyName, key)
        }
        
    });

}

function extendClass(clazz: typeof HTMLElement){
    addProperty("key", clazz)
}


export function apply<T extends HTMLElement>(instance: T, clazz: typeof HTMLElement){

    if(!clazz.prototype[initiated]){
        extendClass(clazz)
        clazz.prototype[initiated] = true

    }
}