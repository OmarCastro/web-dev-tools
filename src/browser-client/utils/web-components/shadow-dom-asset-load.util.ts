
const cssPromiseCache: {[x:string]:Promise<CSSStyleSheet> } = {}
const cssCache: {[x:string]:CSSStyleSheet } = {}
const fetchCss = (url: URL) => {
    const urlString = url.toString()
    if(cssPromiseCache[urlString] != null) {
        return cssPromiseCache[urlString]
    }
    const cssPromise = fetch(url)
        .then(response => response.text())
        .then(text => new CSSStyleSheet().replace(text))
        .then(style => {
            cssCache[urlString] = style;
            return style
        })
    cssPromiseCache[urlString] = cssPromise
    return cssPromise
}
const applyStyleSheetTo = (shadowRoot: ShadowRoot) => (stylesheet: CSSStyleSheet) => {
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, stylesheet]
    return shadowRoot
}


const htmlPromiseCache: {[x:string]:Promise<HTMLTemplateElement> } = {}
const htmlCache: {[x:string]:HTMLTemplateElement } = {}
const fetchHtml = (url: URL) => {
    const urlString = url.toString()
    if(htmlPromiseCache[urlString] != null) {
        return htmlPromiseCache[urlString]
    }
    const htmlPromise = fetch(url)
        .then(response => response.text())
        .then(html => {
            const template = document.createElement("template");
            template.innerHTML = html
            return template;
        }).then(template => {
            htmlCache[urlString] = template;
            return template
        })
    htmlPromiseCache[urlString] = htmlPromise
    return htmlPromise
}

const applyTemplateTo = (shadowRoot: ShadowRoot) => (template: HTMLTemplateElement) => {
    shadowRoot.appendChild(template.content.cloneNode(true));
    return shadowRoot
}



export const applyStyleSheetToShadowDom = ({url, shadowRoot}: {url: URL, shadowRoot: ShadowRoot}):Promise<ShadowRoot> => {
    const urlString = url.toString()
    if(cssCache[urlString] != null){
        applyStyleSheetTo(shadowRoot)(cssCache[urlString])
        return Promise.resolve(shadowRoot);
    } 
    return fetchCss(url).then(applyStyleSheetTo(shadowRoot))
}

export const applyHtmlTemplateToShadowDom = ({url, shadowRoot}: {url: URL, shadowRoot: ShadowRoot}):Promise<ShadowRoot> => {
    const urlString = url.toString()
    if(htmlCache[urlString] != null){
        applyTemplateTo(shadowRoot)(htmlCache[urlString])
        return Promise.resolve(shadowRoot);
    } 
    if(htmlPromiseCache[urlString] != null) {
        return htmlPromiseCache[urlString].then(applyTemplateTo(shadowRoot))
    }
    return fetchHtml(url).then(applyTemplateTo(shadowRoot))
}

export const applyHtmlAndCssToShadowDom = ({cssUrl, htmlUrl, shadowRoot}: {cssUrl: URL, htmlUrl: URL, shadowRoot: ShadowRoot}) => {
    return Promise.all([
        applyStyleSheetToShadowDom({url: cssUrl, shadowRoot}),
        applyHtmlTemplateToShadowDom({url: htmlUrl, shadowRoot})
    ]).then(() => shadowRoot)
}

export type ShadowDomTemplate = {
    applyTo: (shadowRoot: ShadowRoot) => Promise<ShadowRoot>
}

export const ShadowDomTemplate = ({cssUrl, htmlUrl}: {cssUrl: URL, htmlUrl: URL}):ShadowDomTemplate => {
    window.requestIdleCallback(() => {
        fetchCss(cssUrl)
        fetchHtml(htmlUrl)
    })
    return {
        applyTo: (shadowRoot: ShadowRoot) => applyHtmlAndCssToShadowDom({cssUrl, htmlUrl, shadowRoot})
    }
}