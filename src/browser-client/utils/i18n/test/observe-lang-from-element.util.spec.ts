
// @ts-ignore
import { test, assert, assertEquals, assertFalse } from "../../../test-utils/unit-test-api.ts";
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


test("observeLangFromElement should trigger multiple observing elements when ancestor lang changed", async () => {
    // prepare
    document.body.innerHTML = html`
        <div class="level-1" lang="pt">
            <div class="level-2">
                <div class="level-3">
                    <div class="level-4">
                        <div class="level-5"></div>
                        <div class="level-5-2"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const level3Div = document.querySelector(".level-3") as Element
    const level4Div = document.querySelector(".level-4") as Element
    const level5Div = document.querySelector(".level-5") as Element
    const level5_2Div = document.querySelector(".level-5-2") as Element
    const level3Event = { triggered: false }
    const level4Event = { triggered: false }
    const level5Event = { triggered: false }
    const level5_2Event = { triggered: false }

    // act
    observeLangFromElement(level3Div);
    observeLangFromElement(level5Div);
    observeLangFromElement(level5_2Div);

    level3Div.addEventListener(eventName, () => { level3Event.triggered = true; },{once: true})
    level4Div.addEventListener(eventName, () => { level4Event.triggered = true; },{once: true})
    level5Div.addEventListener(eventName, () => { level5Event.triggered = true; },{once: true})
    level5_2Div.addEventListener(eventName, () => { level5_2Event.triggered = true; },{once: true})

    await new Promise<void>((resolve) => {
        document.addEventListener(rootEventName, () => { resolve(); },{once: true})
        level3Div.setAttribute("lang", "es")
    })

    unobserveLangFromElement(level3Div)
    unobserveLangFromElement(level5Div)
    unobserveLangFromElement(level5_2Div)

    // assert
    assert(level3Event.triggered)
    assertFalse(level4Event.triggered)
    assert(level5Event.triggered)
    assert(level5_2Event.triggered)
})

test("observeLangFromElement should trigger when lang changed in the middle of the ascension tree", async () => {
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

test("observeLangFromElement should not trigger event when a new lang was added in the middle of the ascension tree, but is equal", async () => {
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
    const level4DivLangEvent = { triggered: false }


    // act
    observeLangFromElement(level4Div);
    level4Div.addEventListener(eventName, () => { level4DivLangEvent.triggered = true; },{once: true})

    await new Promise<void>((resolve) => {
        document.addEventListener(rootEventName, () => { rootEvent.triggered = true, resolve(); },{once: true})
        level3Div.setAttribute("lang", "pt")
    })
    const level4DivNewLang = getLanguageFromElement(level4Div)
    unobserveLangFromElement(level4Div)

    // assert
    assert(rootEvent.triggered)
    assertFalse(level4DivLangEvent.triggered)
    assertEquals(level4DivNewLang, "pt")  
})