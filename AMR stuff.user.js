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
    name: 'webtoon mode on by defult',
    default: true
},
{
    id: 'mangaTitle',
    name: "set page title to 'manga'",
    default: false
},
{
    id: 'magicScroll',
    name: 'Magic Scroll on space bar',
    default: true
},
{
    id: 'halfFix',
    name: 'Fix new chapters from starting half way',
    default: true
},
{
    id: 'Triangle',
    name: 'Fix yellow Triangle size',
    default: true
},
{
    id: '100Width',
    name: 'always scale up images',
    default: true//mangaTitleName
},
{
    id: 'mangaTitleName',
    name: 'set page title to the manga title',
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

function callbackk(mutations) {
    if (document.querySelector("#amrapp div.v-select__selection.v-select__selection--comma")) {
        observerr.disconnect()

        //no boarders in continuous scroll mode
        if (GM_config.get('webtoon')) {
            document.querySelector("#amrapp > div.v-application--wrap > main > div > div > table").classList.add('webtoon');
        }

        //code probably only i need
        if (GM_config.get('mangaTitle')) {
            if (document.querySelector("head > title").textContent != 'Manga') {
                document.querySelector("head > title").textContent = 'Manga'
            }
        } else if (GM_config.get('mangaTitleName')) {
            if (!(document.querySelector("h4 > a") == null || document.querySelector("div.v-select__selection.v-select__selection--comma") == null)) {
                if (document.querySelector("head > title").textContent != document.querySelector("h4 > a").textContent + ' ' + document.querySelector("div.v-select__selection.v-select__selection--comma").textContent) {
                    document.querySelector("head > title").textContent = document.querySelector("h4 > a").textContent + ' ' + document.querySelector("div.v-select__selection.v-select__selection--comma").textContent
                }
            }
        }

        //if no jquiry then add jquiry
        if (GM_config.get('magicScroll')) {
            if (typeof jQuery == 'undefined') {
                var headTag = document.getElementsByTagName("head")[0];
                var jqTag = document.createElement('script');
                jqTag.type = 'text/javascript';
                jqTag.src = 'https://code.jquery.com/jquery-3.5.1.js';
                jqTag.onload = myJQueryCode;
                headTag.appendChild(jqTag);
            } else {
                myJQueryCode();
            }
        }

        //detect space bar press and do scrollMagic from HakuNeko
        function myJQueryCode() {
            jQuery(document).on('keydown', function (e) {
                if (e.keyCode == 32 && e.target == document.body) {
                    e.preventDefault();
                    scrollMagic();
                }
            });
        }

        //code probably only i need
        //this origonally just changed the title of the page to "manga" but t now fixes the starting half way issue
        if (GM_config.get('mangaTitle') || GM_config.get('halfFix') || GM_config.get('mangaTitleName')) {
            let observer = new MutationObserver(callback);
            let options = {
                characterData: true,
                childList: true
            }
            observer.observe(document.querySelector("head > title"), options);
        }

        /*
        in order
        make the bookmark triange (top right of any scan) the correct size
        make the scan 100% width (for portrait viewing)
        dito
        no boarders in side by side mode
        */
        if (GM_config.get('Triangle')) {
            GM_addStyle(`
            .amr-triangle {
                border-left: 0px solid transparent;
            }`)
        }
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
            }`)
        }
        if (GM_config.get('webtoon')) {
            GM_addStyle(`
                .amr-scan-container td {
                    padding: 0 !important;
                }`)
        }
    }
}

//code probably only i need
//this origonally just changed the title of the page to "manga" but t now fixes the starting half way issue

function callback(mutations) {
    if (GM_config.get('mangaTitle')) {
        if (document.querySelector("head > title").textContent != 'Manga') {
            document.querySelector("head > title").textContent = 'Manga'
        }
    } else if (GM_config.get('mangaTitleName')) {
        let title = document.querySelector("h4 > a").textContent + ' ' + document.querySelector("div.v-select__selection.v-select__selection--comma").textContent
        if (document.querySelector("head > title").textContent != title) {
            document.querySelector("head > title").textContent = title
        }
    }
    if (GM_config.get('halfFix')) {
        $('html,body').animate({ scrollTop: 0 }, 0);
    }
}


let options = {
    characterData: true,
    childList: true,
    subtree: true
}

//run the observer that checks for if the page is taekn over by amr
observerr.observe(document.querySelector("body"), options);


//ripped from hakuneko
//changed quite a bit to make it work though
async function scrollMagic() {
    let images = document.querySelectorAll('.amr-scan-container img');

    // Find current image within view
    let targetScrollImages = [...images].filter(image => {
        let rect = image.getBoundingClientRect();
        return (rect.top <= window.innerHeight && rect.bottom > 1);
    });

    // If multiple images filtered, get the last one. If none scroll use the top image
    let targetScrollImage = targetScrollImages[targetScrollImages.length - 1] || images[0];

    // Is the target image top within view ? then scroll to the top of it
    if (targetScrollImage.getBoundingClientRect().top > 1) {
        // Scroll to it
        jQuery('html, body').animate({
            scrollTop: jQuery(targetScrollImage).offset().top
        }, 500);
    }// Do we stay within target ? (bottom is further than current view)
    else if (window.innerHeight + 1 < targetScrollImage.getBoundingClientRect().bottom) {
        await window.scrollBy({
            top: window.innerHeight * 0.80,
            left: 0,
            behavior: 'smooth'
        });
    }// We have to try to get to next image
    else {
        // Find next image
        let nextScrollImage = targetScrollImage.nextElementSibling;
        // Scroll to it
        jQuery('html, body').animate({
            scrollTop: jQuery(nextScrollImage).offset().top
        }, 500);

    }
}
