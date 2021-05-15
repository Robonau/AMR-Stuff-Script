// ==UserScript==
// @name         AMR stuff
// @version      0.6
// @description  just some AMR QOL stuff
// @author       Robo
// @include      *
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM.registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements, gmfetch, MonkeyConfig*/

/* #region setup */
const optionss = [{
    id: 'webtoon',
    name: 'webtoon mode on always',
    default: true
},
{
    id: 'mangaTitle',
    name: "set page title to 'manga'",
    default: false
},
{
    id: '100Width',
    name: 'always scale up images',
    default: true
},
{
    id: '100Width toggalable',
    name: 'toggle always scale up images',
    default: false
},
]

let fieldDefs = JSON.parse('{' + optionss.map(ele => ret(ele)).join('\n,') + '}')

GM_config.init({
    id: 'GM_config',
    title: 'Config for AMR Manga Reading',
    fields: fieldDefs,
    css: `
    [id^="GM_config_ID"] {
        float: left
    }
    .iconImg {
        width: 16px;
        vertical-align: middle;
    }
    .config_var {
        margin-right: 5% !important;
        display: inline !important;
    }`,
    events: {
        open: function (doc) {
            [...doc.querySelectorAll(".section_header_holder")].filter(ele => ele.querySelector('.center')).forEach(function (ele) {
                ele.style.backgroundColor = 'transparent'
                ele.style.border = '4px solid transparent'
            });
        },
        save: function () {
            location.reload();
        }
    }
});

function ret(ele) {
    return `"${ele.id}": {
    "section": [],
    "label": "${ele.name}",
    "type": "checkbox",
    "default": ${ele.default}
    }`
}

GM_registerMenuCommand("Config for AMR Manga Reading", function () {
    GM_config.open();
});

/* #endregion */

let observerr = new MutationObserver(callbackk);
let start = 0
function callbackk(mutations) {
    if (document.querySelector("#amrapp div.v-select__selection.v-select__selection--comma")) {
        observerr.disconnect();
        start = 1
        //no boarders in continuous scroll mode
        if (GM_config.get('webtoon')) {
            document.querySelector("#amrapp > div.v-application--wrap > main > div > div > table").classList.add('webtoon');
        }

        //code probably only i need
        if (GM_config.get('mangaTitle')) {
            if (document.querySelector("head > title").textContent != 'Manga') {
                document.querySelector("head > title").textContent = 'Manga'
            }
        }

        if (GM_config.get('mangaTitle')) {
            let observer = new MutationObserver(callback);
            let options = {
                characterData: true,
                childList: true
            }
            observer.observe(document.querySelector("head > title"), options);
        }

        /*
        in order
        make the scan 100% width (for portrait viewing)
        no boarders in side by side mode
        */
        if (GM_config.get('100Width')) {
            GM_addStyle(`
                .scanContainer.res-w img {
                    width: 100%;
                }
                .scanContainer img {
                    object-fit: contain;
                }
                .amr-scan-container td {
                    padding: 0 !important;
                }`
            )
        }
        if (GM_config.get('100Width toggalable')) {
            console.log('hihihihihihi')
            let toggle = GM_config.get('100Width')
            document.addEventListener('keydown', doc_keyUp, false);
            console.log('hihihihihihi')
            function doc_keyUp(e) {
                if (e.keyCode == 83 && e.shiftKey == true){
                    toggle = !toggle
                    if (toggle){
                        GM_addStyle(`
                            .scanContainer.res-w img {
                                width: 100%;
                            }
                            .scanContainer img {
                                object-fit: contain;
                            }`
                        )
                    }else{
                        GM_addStyle(`
                            .scanContainer.res-w img {
                                width: auto;
                            }
                            .scanContainer img {
                                object-fit: unset;
                            }`
                        )
                    }
                }
            }
        }

        if (GM_config.get('webtoon')) {
            GM_addStyle(`
                .amr-scan-container td {
                    padding: 0 !important;
                }`
            )
        }
    }
}

function callback() {
    if (GM_config.get('mangaTitle')) {
        if (document.querySelector("head > title").textContent != 'Manga') {
            document.querySelector("head > title").textContent = 'Manga'
        }
    }
}

let options = {
    characterData: true,
    childList: true,
    subtree: true
}

//run the observer that checks for if the page is taekn over by amr
observerr.observe(document.querySelector("body"), options);