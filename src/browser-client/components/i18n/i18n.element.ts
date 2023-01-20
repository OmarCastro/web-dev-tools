class I18nElement extends HTMLElement {
    get key(){
        return this.getAttribute("key")
    }

    set key(key: string) {
        this.setAttribute("key", key)
    }
}

customElements.define("x-i18n", I18nElement)