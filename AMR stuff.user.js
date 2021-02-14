// ==UserScript==
// @name         AMR stuff
// @version      0.1
// @description  just some AMR QOL stuff 
// @author       Robo
// @include      *
// @grant        GM_addStyle
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements, gmfetch, MonkeyConfig*/

let observerr = new MutationObserver(callbackk);

function callbackk(mutations) {
    if (document.querySelector("#amrapp > div.v-application--wrap > main > div > div > table > tr > td")) {
        observerr.disconnect()

        //no boarders in continuous scroll mode
        document.querySelector("#amrapp > div.v-application--wrap > main > div > div > table").classList.add('webtoon');
        
        //if no jquiry then add jquiry
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

        //detect space bar press and do scrollMagic from HakuNeko 
        function myJQueryCode() {
            jQuery(document).on('keydown', function (e) {
                console.log(e.keyCode);
                if (e.keyCode == 32 && e.target == document.body) {
                    e.preventDefault();
                    scrollMagic();
                }
            });
        }

        /*
        in order
        make the bookmark triange (top right of any scan) the correct size
        make the scan 100% width (for portrait viewing)
        dito
        no boarders in side by side mode
        */
        GM_addStyle(`
            .amr-triangle {
                border-left: 0px solid transparent;
            }
            .scanContainer.res-w img {
                width: 100%;
            }
            .scanContainer img {
                object-fit: contain;
            }
            .amr-scan-container td {
                padding: 0 !important;
            }
        `)
    }
}

let options = {
    characterData: true,
    childList: true
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
        $('html, body').animate({
            scrollTop: $(targetScrollImage).offset().top
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
        $('html, body').animate({
            scrollTop: $(nextScrollImage).offset().top
        }, 500);

    }
}
