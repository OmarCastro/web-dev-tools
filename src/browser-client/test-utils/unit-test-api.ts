let testMethod: (description: string, testFn: () => void | Promise<void>) => void
if("Deno" in globalThis){
    testMethod = Deno.test
} else {

    

    const testList: {description: string, testFn: () => void | Promise<void>}[] = []
    let running = false
    const execute = async function(){
        if(running){ return }
        running = true
        while(testList.length > 0){
            await testList[0].testFn()
        }
        running = false
    }

    testMethod = (description: string, testFn: () => void | Promise<void>) => {
        testList.push({description, testFn})
        execute();
    }  
  }
  
  export const test = testMethod 
  export { assertEquals, assert, assertFalse } from "https://deno.land/std@0.172.0/testing/asserts.ts"
  