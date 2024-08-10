var observersMap = new Map();
var observersActive = true;

function HighlightEngine() {
    var highlightTag = "EM";
    var highlightClassname = "Highlight";
    var skipTags = new RegExp("^(?:SCRIPT|HEAD|NOSCRIPT|STYLE|TEXTAREA)$"); //TEXTAREA
    var SkipSelectors = "";
    var wordColor = [];
    var magicRegex = "";
    var magicRegexCS = "";
    var matchRegex = "";
    var matchRegexEditable = "";
    var numberOfHighlights = 0;
    var highlights = {};
    var notifyAnyway = false;
    var highlightMarkers = {};
    var notifyForWords = new Set();
    var RegexConfig = {};
    var loopingTime = 0;
    var loopingstartTime = 0;
    var countLoops = 0;
    var featureFlagDetectDynamicUpdates = false;
    const Debug = false;

    function containsShadowRoot(node) {
        if (node.nodeType !== 1) {
            return false;
        }
        const allElements = node.querySelectorAll('*');
        for (const element of allElements) {
            if (element.shadowRoot) {
                return true;
            }
        }
        return false;
    }

    function stopObservingHighlightElement(element) {
        var observer = observersMap.get(element);
        if (observer) {
            observer.disconnect();
            observersMap.delete(element);
            console.log('Stopped observing the element.');
        } else {
            //console.log('Element was not being observed.');
        }
    }
    this.observeHighlightElement = function(element) {
        if (observersMap.has(element)) {
            return;
        }
        var observer = new MutationObserver(function(mutations) {
            if (observersActive) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        highlightElements = mutation.target.querySelectorAll('.Highlight');
                        const addedHighlightNodes = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE) // Filter out non-element nodes
                            .filter(node => node.classList.contains('Highlight'))
                        if (mutation.removedNodes.length > 0 && addedHighlightNodes.length == 0) {
                            highlightElements.forEach(function(e) {
                                observersActive = false;
                                lengthToRemoveAfter = e.getAttribute('htTextAfter')
                                if (lengthToRemoveAfter > 0) {
                                    if (e.nextSibling.nodeType == 3 && e.nextSibling.length == lengthToRemoveAfter) {
                                        e.nextSibling.remove()
                                    }
                                }
                                e.remove();
                                observersActive = true;
                            });
                        }
                        if (!highlightElements.length == 0) {
                            stopObservingHighlightElement(mutation.target)
                        }
                    }
                });
            }
        });
        var config = {
            characterData: false,
            childList: true,
            subtree: false
        };
        observer.observe(element, config);
        observersMap.set(element, observer);
    }
    // recursively apply word highlighting
    this.highlightWords = function(node, printHighlights, inContentEditable, loopNumber) {
        if (node == undefined || !node) return;
        if (node.nodeType === Node.ELEMENT_NODE && (skipTags.test(node.nodeName) || node.matches(SkipSelectors))) {
            return;
        }
        // check if there is any shadow-root element, if so dive deeper
        if (node.nodeName == highlightTag && node.classList.contains(highlightClassname)) {
            //text was already highlighted
            //console.log("skip highlighting",node)
            if (node.getAttribute('htloopNumber') !== loopNumber.toString()) {
                highlightMarkers[numberOfHighlights] = {
                    "word": node.getAttribute('htmatch')
                };
                numberOfHighlights += 1;
            }
            return
        }
        if (node.nodeType !== 3 /*&& node.nodeName !== highlightTag && !node.classList.contains(highlightClassname)*/ ) {
            if (node.shadowRoot) {
                if (!node.shadowRoot.querySelector('style[data-stylename="HighlightThisStyles"]')) {
                    const style = document.createElement('style');
                    style.setAttribute('data-stylename', 'HighlightThisStyles')
                    style.textContent = CSSStyles;
                    node.shadowRoot.appendChild(style);
                }
                for (const childNode of node.shadowRoot.childNodes) {
                    this.highlightWords(childNode, printHighlights, inContentEditable || node.isContentEditable, loopNumber);
                }
            }
            var textContent = node.textContent;
            if (RegexConfig.useMagicRegex && textContent.length < 5000) {
                //console.time("inUseMagicRegex")
                //console.log("text length",textContent.length)
                RegexConfig.doMagicRegex ? (regs = magicRegex.exec(textContent)) : regs = undefined;
                RegexConfig.doMagicRegexCS ? (regsCS = magicRegexCS.exec(textContent)) : regsCS = undefined;
                //console.timeEnd("inUseMagicRegex")
                var boolContainsShadowRoot = containsShadowRoot(node)
                if (!regs && !regsCS && !boolContainsShadowRoot) {
                    return;
                }
            }
            for (const childNode of node.childNodes) {
                this.highlightWords(childNode, printHighlights, inContentEditable || node.isContentEditable, loopNumber);
            }
        }
        if (node.nodeType == 3) {
            //only act on text nodes
            var nv = node.nodeValue;
            if (nv.trim() != '') {
                if (node.parentElement && !(node.parentElement.tagName == highlightTag && node.parentElement.getAttribute(highlightClassname))) {
                    //if we compare 2 regex's eg Case Sensity / Insensitive. Take the one with the lowest index from the exec, if equal take the longest string in [0]
                    if (inContentEditable) {
                        RegexConfig.doMatchRegexEditable ? (regs = matchRegexEditable.exec(nv)) : regs = undefined;
                        RegexConfig.doMatchRegexEditableCS ? (regsCS = matchRegexEditableCS.exec(nv)) : regsCS = undefined;
                    } else {
                        RegexConfig.doMatchRegex ? (regs = matchRegex.exec(nv)) : regs = undefined;
                        RegexConfig.doMatchRegexCS ? (regsCS = matchRegexCS.exec(nv)) : regsCS = undefined;
                    }
                    if (regs && regsCS) {
                        if (regs.index > regsCS.index || (regs.index == regsCS.index && regsCS[1] && regs[1] && regsCS[1].length > regs[1].length)) {
                            regs = regsCS
                        }
                    } else {
                        regs = regs || regsCS;
                    }
                    if (regs) {
                        var wordfound = "";
                        if (regs[1]) {
                            regResult = regs[1];
                            startIndex = regs.index + regs[0].indexOf(regs[1]);
                        } else {
                            regResult = regs[0];
                            startIndex = regs.index;
                        }
                        //find back the longest word that matches the found word 
                        for (word in wordColor) {
                            let currentWordColor = wordColor[word];
                            if ((currentWordColor.regexTokens || regResult.length >= currentWordColor.wordLengthForCompare) && (currentWordColor.containerSelector == '' || node.parentElement.matches(currentWordColor.containerSelector))) {
                                var pattern = currentWordColor.compiledRegex;
                                if ((!currentWordColor.findBackAgainstContent && pattern.test(regResult))) {
                                    wordfound = word;
                                    break;
                                }
                                //check back regexes
                                if (((currentWordColor.findBackAgainstContent && pattern.test(regs.input)))) {
                                    regsRegex = pattern.exec(regs.input);
                                    if (regsRegex[0] == regs[0]) {
                                        regResult = regs[0];
                                        startIndex = regs.index;
                                        wordfound = word;
                                        break;
                                    }
                                }
                            }
                        }
                        if (wordColor[wordfound] != undefined) {
                            if (!inContentEditable || (inContentEditable && wordColor[wordfound].showInEditableFields)) {
                                try {
                                    var match = document.createElement(highlightTag);
                                    
                                    if (window.getComputedStyle(node.parentElement).display === 'flex') {
                                        var newSpan = document.createElement('span');
                                        newSpan.textContent = node.textContent;
                                        node.parentElement.replaceChild(newSpan, node);
                                        node = newSpan.childNodes[0];
                                    }                                   
                                    match.classList.add(highlightClassname, wordColor[wordfound].cssClass);
                                    match.setAttribute(highlightClassname, true);
                                    match.setAttribute('htmatch', wordColor[wordfound].word);
                                    match.setAttribute('htloopnumber', loopNumber);
                                    match.style.fontStyle = "inherit";
                                    if (wordColor[wordfound].action.type != 0) {
                                        match.onclick = function() {
                                            clickHandler(this);
                                        };
                                    }
                                    //在捕获组匹配开始时拆分文本节点
                                    //observersActive=false;
                                    var matchStart = node.splitText(startIndex);
                                    //在捕获组匹配的末尾拆分“matchStart”节点，将其隔离在自己的节点中
                                    var matchEnd = matchStart.splitText(regResult.length);
                                    //创建新元素以包装捕获组匹配
                                    match.textContent = matchStart.nodeValue; // Set the capturing group match as the content of the new element
                                    //featureFlagDetectDynamicUpdates && match.setAttribute('htTextAfter',matchEnd.length);
                                    //用新元素替换匹配的文本节点
                                    matchStart.parentNode.replaceChild(match, matchStart);
                                    //observersActive=true;
                                    //featureFlagDetectDynamicUpdates && this.observeHighlightElement(node.parentNode);
                                } catch (error) {
                                    // Manually report the error to window.onerror
                                    if (window.onerror) {
                                        const message = (error.message || "An error occurred") + "-[" + regs + "]-" + window.location;
                                        const source = error.fileName || "unknown file"; // Note: error.fileName is non-standard
                                        const lineno = error.lineNumber || 0; // Note: error.lineNumber is non-standard
                                        const colno = error.columnNumber || 0; // Note: error.columnNumber is non-standard
                                        window.onerror(message, source, lineno, colno, error);
                                    } else {
                                        // Fallback error handling if window.onerror is not available
                                        console.error(error);
                                        storeError('an error occured during highlighting', 'HighlightEngine', 0, 0, error)
                                    }
                                    return true;
                                }
                            }
                            if (wordColor[wordfound].notifyOnHighlight) {
                                notifyForWords.add(wordColor[wordfound].word);
                                if (wordColor[wordfound].notifyFrequency == "2") {
                                    notifyAnyway = true;
                                }
                            }
                            highlightMarkers[numberOfHighlights] = {
                                "word": wordColor[wordfound].word
                            };
                            numberOfHighlights += 1;
                        }
                    }
                }
            }
        }
    };
    // start highlighting at target node
    this.highlight = function(words, printHighlights, regexConfig, skipSelectors, loopNumber) {
        wordColor = words;
        numberOfHighlights = 0;
        RegexConfig = regexConfig;
        matchRegex = new RegExp(regexConfig.matchRegex, "i");
        matchRegexCS = new RegExp(regexConfig.matchRegexCS, "");
        matchRegexEditable = new RegExp(regexConfig.matchRegexEditable, "i");
        matchRegexEditableCS = new RegExp(regexConfig.matchRegexEditableCS, "");
        magicRegex = new RegExp(regexConfig.magicRegex, "i");
        magicRegexCS = new RegExp(regexConfig.magicRegexCS, "");
        SkipSelectors = skipSelectors;
        if (matchRegex || matchRegexCS) {
            this.highlightWords(document.body, printHighlights, false, loopNumber);
        }
        return {
            numberOfHighlights: numberOfHighlights,
            markers: highlightMarkers,
            notify: Array.from(notifyForWords),
            notifyAnyway: notifyAnyway
        };
    };
}