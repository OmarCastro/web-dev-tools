
// @ts-ignore
import { test, assertEquals } from "../../../test-utils/unit-test-api.ts";
// @ts-ignore
import { getLanguageFromElement } from "../get-lang-from-element.util.ts"
// @ts-ignore
import { document } from "../../../test-utils/init-dom.ts"

const html = String.raw



test("getLanguageFromElement should get correctly defined lang value", () => {
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3" lang="en-US">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;


    const level1Div = document.querySelector(".level-1") as Element
    const level2Div = document.querySelector(".level-2") as Element
    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element

    assertEquals(getLanguageFromElement(level1Div), "pt")
    assertEquals(getLanguageFromElement(level2Div), "pt")
    assertEquals(getLanguageFromElement(level3Div), "en-US")
    assertEquals(getLanguageFromElement(level4Div), "en-US")  
})

test("getLanguageFromElement should ignore incorrectly defined html lang value", () => {
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3" lang="aaah! ngonyaaahh!">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;


    const level1Div = document.querySelector(".level-1") as Element
    const level2Div = document.querySelector(".level-2") as Element
    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element

    assertEquals(getLanguageFromElement(level1Div), "pt")
    assertEquals(getLanguageFromElement(level2Div), "pt")
    assertEquals(getLanguageFromElement(level3Div), "pt")
    assertEquals(getLanguageFromElement(level4Div), "pt")  
})

test("getLanguageFromElement return navigation.language on undefined lang", () => {
    // prepare
    document.body.innerHTML = html`<div class="level-1"></div>`;
    const navigatorLanguage = navigator.language
    const level1Div = document.querySelector(".level-1") as Element
    document.documentElement.removeAttribute("lang")

    //act
    const level1DivLang = getLanguageFromElement(level1Div)

    //assert
    assertEquals(level1DivLang, navigatorLanguage)

    // clean
    document.documentElement.setAttribute("lang", "en")
})

test("getLanguageFromElement return navigation.language on invalid <html> lang", () => {
    // prepare
    document.body.innerHTML = html`<div class="level-1"></div>`;
    const navigatorLanguage = navigator.language
    const level1Div = document.querySelector(".level-1") as Element
    document.documentElement.setAttribute("lang", "yayay!!")

    // act
    const level1DivLang = getLanguageFromElement(level1Div)

    // clean
    document.documentElement.setAttribute("lang", "en")

    // assert
    assertEquals(level1DivLang, navigatorLanguage)
})

test("getLanguageFromElement should get lang value on element inside shadow DOM", () => {
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3" lang="en-US">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;

    const level2ShadowDomHtml = html`
    <div class="shadow-level-1">
        <div class="shadow-level-2">
            <slot></slot>
        </div>
    </div>
`;


    const level1Div = document.querySelector(".level-1") as Element
    const level2Div = document.querySelector(".level-2") as Element
    const shadowRoot = level2Div.attachShadow({mode: "open"})
    shadowRoot.innerHTML = level2ShadowDomHtml

    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element
    const shadowLevel2Div = shadowRoot.querySelector(".shadow-level-2") as Element

    assertEquals(getLanguageFromElement(level1Div), "pt")
    assertEquals(getLanguageFromElement(level2Div), "pt")
    assertEquals(getLanguageFromElement(level3Div), "en-US")
    assertEquals(getLanguageFromElement(level4Div), "en-US")  
    assertEquals(getLanguageFromElement(shadowLevel2Div), "pt")  
})

test("getLanguageFromElement should get lang from shadow DOM, if defined, on slotted element", () => {
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;

    const level2ShadowDomHtml = html`
    <div class="shadow-level-1" lang="pt-PT">
        <div class="shadow-level-2">
            <slot></slot>
        </div>
    </div>
`;


    const level1Div = document.querySelector(".level-1") as Element
    const level2Div = document.querySelector(".level-2") as Element
    const shadowRoot = level2Div.attachShadow({mode: "open"})
    shadowRoot.innerHTML = level2ShadowDomHtml

    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element

    assertEquals(getLanguageFromElement(level1Div), "pt")
    assertEquals(getLanguageFromElement(level2Div), "pt")
    assertEquals(getLanguageFromElement(level3Div), "pt-PT")
    assertEquals(getLanguageFromElement(level4Div), "pt-PT")  
})

