let observerr = new MutationObserver(callbackk);

function callbackk (mutations) {
    observerr.disconnect()
    if (call(mutations)){
        console.log(mutations)
        let elements = [...document.querySelectorAll("#app tr.m-2")]

        let finalElements = elements.sort(function(a, b){
            let sortsa = a.querySelector('select.amr-chap-sel')
            let sortsb = b.querySelector('select.amr-chap-sel')

            if (sortsa == null || sortsb == null){
                return -1
            }

            let sort2a = Array.apply(null, sortsa.options).findIndex(ele => ele.value == sortsa.value)
            let sort2b = Array.apply(null, sortsb.options).findIndex(ele => ele.value == sortsb.value)
            return sort2b-sort2a
        })
        finalElements.forEach(ele => ele.parentElement.appendChild(ele))

        let elementss = [...document.querySelectorAll("#app tr.m-2 div.amr-manga-row")]
        elementss.forEach(ele => {
            ele.classList.remove('darken-2')
            ele.classList.remove('lighten-1')
        })
        elementss.filter((_,ind) => ind % 2 === 1).forEach(ele => ele.classList.add('darken-2'))
        elementss.filter((_,ind) => ind % 2 === 0).forEach(ele => ele.classList.add('lighten-1'))
    }
    observerr.observe(document.querySelector("#app > div.v-application--wrap > main > div > div:nth-child(1) > div.v-data-table.v-data-table--has-bottom.theme--dark > div.v-data-table__wrapper > table > tbody"), options);
}

function call(mutations){
    try{
        return !mutations[0].target.classList.contains('v-tooltip')
    }catch(e){
        return true
    }
}

let options = {
    characterData: true,
    childList: true,
    subtree:true
}
callbackk()