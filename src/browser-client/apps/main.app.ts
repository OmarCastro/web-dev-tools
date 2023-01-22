import {applyStyleSheetToShadowDom, applyHtmlTemplateToShadowDom} from '../utils/web-components/shadow-dom-asset-load.util'
import "../components/i18n/i18n.d.element.ts?named=x-i18n"

const pages = {
    dashboard: {
        importModule: () => import("../pages/dashboard/dashboard.page"),
        template: "<x-dashboard></x-dashboard>"
    }
} as const



class MainApp extends HTMLElement {

    constructor(){
        super()
        
    }

    setPage(pagename:string){
        this.setAttribute("page", pagename)
    }

    connectedCallback(){
        const page = pages[this.currentPage]
        if(page){
            page.importModule()
            this.innerHTML = page.template;
        }
    }

    get currentPage(){
        return this.hasAttribute("page") ? this.getAttribute("page") as string : "dashboard"; 
    }
    
}

customElements.define("x-main", MainApp)


