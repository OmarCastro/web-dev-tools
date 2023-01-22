export default class I18nElement extends HTMLElement {
    constructor(){
        super()
        setTimeout(() => {
            this.attachShadow({mode: "open"})
            this.shadowRoot.innerHTML = "aaaaa"    
        }, 2000)
    }

    get key() {
        return this.getAttribute("key")
    }
    
    set key(key: string) {
        this.setAttribute("key", key)
    }

    connectedCallback(){
      console.log("AAAAHHH!!!")  
    }

    disconnectedCallback(){
        console.log("AAeeeeAAHHH!!!")  
    }
}