
// @ts-ignore
import { test, assert, assertEquals } from "../../../test-utils/unit-test-api.ts";
// @ts-ignore
import { document } from "../../../test-utils/init-dom.ts"
// @ts-ignore
import { getLanguageFromElement } from "../get-lang-from-element.util.ts"
// @ts-ignore
import { eventName, rootEventName, observeLangFromElement, unobserveLangFromElement } from "../observe-lang-from-element.util.ts"

const html = String.raw

test("observeLangFromElement should trigger correctly when lang changed", async () => {
    // prepare
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;


    const level1Div = document.querySelector(".level-1") as Element
    const level4Div = document.querySelector(".level-4") as Element



    // act
    observeLangFromElement(level4Div);


    const level4DivLang = getLanguageFromElement(level4Div)
    await new Promise<void>((resolve) => {
        level4Div.addEventListener(eventName, () => { resolve(); },{once: true})
        level1Div.setAttribute("lang", "es")
    })
    const level4DivNewLang = getLanguageFromElement(level4Div)
    unobserveLangFromElement(level4Div)

    // assert
    assertEquals(level4DivLang, "pt")  
    assertEquals(level4DivNewLang, "es")  
})

test("observeLangFromElement should trigger another event on node root", async () => {
    // prepare
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;

    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element
    const rootEvent = { triggered: false }

    // act
    observeLangFromElement(level4Div);
    const level4DivLang = getLanguageFromElement(level4Div)
    await new Promise<void>((resolve) => {
        document.addEventListener(rootEventName, () => { rootEvent.triggered = true, resolve(); },{once: true})
        level3Div.setAttribute("lang", "es")
    })
    const level4DivNewLang = getLanguageFromElement(level4Div)
    unobserveLangFromElement(level4Div)

    // assert
    assert(rootEvent.triggered)
    assertEquals(level4DivLang, "pt")  
    assertEquals(level4DivNewLang, "es") 
})

test("observeLangFromElement should trigger correctly when lang changed in the middle of the ascension tree", async () => {
    // prepare
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3">
                    <div class="level-4"></div>
                </div>
            </div>
        </div>
    `;


    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element

    // act
    observeLangFromElement(level4Div);


    const level4DivLang = getLanguageFromElement(level4Div)
    await new Promise<void>((resolve) => {
        level4Div.addEventListener(eventName, () => { resolve(); },{once: true})
        level3Div.setAttribute("lang", "es")
    })
    const level4DivNewLang = getLanguageFromElement(level4Div)
    unobserveLangFromElement(level4Div)

    // assert
    assertEquals(level4DivLang, "pt")  
    assertEquals(level4DivNewLang, "es")  
})