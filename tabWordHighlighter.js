var HighlightsData = {};
var Settings = skipSelectorsForUrl(window.location.href);
var wordsArray = [];
var wordsForBox = [];
var regexConfig = {};
var wordsForBoxRegex = {};
var skipSelectors = '';
var ReadyToFindWords = true; //indicates if not in a highlight execution
var Debug = false;
var DebugStats = {
    findCount: 0,
    loopCount: 0,
    subTreeModCount: 0
};
var highlightMarkers = {};
var nrFoundWords = 0;
var nrFoundWordsInFields = 0;
var CSSStyles = '';
var isClicked = false;
var inAction = false;
var showCursor = false;
var setTimeOutTag = null;
var i = 1;
var timeNum = 1;
var targetSelected = false; //光标定位元素获取location
var Config = {
    decreaseLoop: 125,
    fixedLoopTime: false,
    highlightLoopFrequency: 500,
    increaseLoop: 0,
    maxLoopTime: 2500,
    minLoopTime: 500,
    updateOnDomChange: true
}
var licensed = true;
var Highlight = true;
var HighlightLoopFrequency = 1000;
var HighlightLoop;
var alreadyNotified = false;
var highlighterEnabled = true;
var markerCurrentPosition = -1;
//var markerPositions = [];
var highlightMarkers = {};
var markerScroll = false;
var printHighlights = true;
var initialTag = false;
var numOfHighlights = 0;
var myFieldsHilighter = new HighlightFieldsEngine();
var contentCircle = `

                    <div id="containerCircle">  
                        <div class="circle"></div>  
                        <span class="text" id="brushText">刷 新高 亮</span>  
                    </div>
                    <style type="text/css">
                    #containerCircle {
                        position: fixed;
                        z-index:99999999;
                        top:47.5%;
                        width: 50px;
                        height: 50px;
                        display: none;
                        cursor:pointer;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        user-select:none !important;
                        -webkit-user-select:none !important;
                        background: -webkit-linear-gradient(left, rgb(64, 180, 229), rgb(170, 123, 201));
                        border-radius: 50%;
                    }
                    .circle {
                        position: absolute;
                        top:5px;
                        left:5px;
                        width: 80%;
                        height: 80%;
                        border-radius: 50%;
                        background: white;
                        user-select:none !important;
                        -webkit-user-select:none !important;
                        background-clip: padding-box;
                    }
                    #brushText {
                        position: absolute;
                        z-index: 2;
                        top:8px;
                        line-height: 17px;
                        left:11px;
                        color: white;
                        width:28px;
                        font-size: 12px;
                        font-weight: bold;
                        text-align: center;
                        user-select:none !important;
                        -webkit-user-select:none !important;
                        background: -webkit-linear-gradient(left, rgb(170, 123, 201), rgb(64, 180, 229));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;    
                    }
                    </style>`;
var html = `
            <div id="secKillForm">
                <div class="secKill-filed secKill-filed-2">
                    <span class="secKill-name">选 择 器 ：</span>
                    <div class="selectorClass">
                        <input type="checkbox" name="selector" id="rb1" value="jQuery" checked="checked"/>
                        <label for="rb1">jQuery</label>
                        <input type="checkbox" name="selector" id="rb2" value="xPath" disabled/>
                        <label for="rb2">xPath</label>
                    </div>
                </div>
                <div class="secKill-filed secKill-filed-3">
                    <span class="secKill-name">选 取 值 ：</span>
                    <input type="text" name="location" class="secKill-input-text1" id="location" value="" placeholder="元素路径"/>
                </div>
                <div class="secKill-filed secKill-filed-time">
                    <span class="secKill-name">随 机 值 ：</span>
                    <input type="text" name="time" class="secKill-input-text1" id="time1" value="3" placeholder="3" />  
                    <input type="text" name="time" class="secKill-input-text1" id="time2" value="5" placeholder="5" />
                    <div class="chkC chkk">
                        <input type="checkbox" name="selector" id="chk2" />
                        <label for="chk2">启用</label>                     
                    </div>
                </div>        
                <div class="secKill-filed secKill-filed-6">
                    <span class="secKill-name">循 环 值 ：</span>
                    <input type="number" name="count" class="secKill-input-number1 secKill-count1" id="count" value="100" placeholder="尝试次数"/>
                    <div class="chkC">
                        <input type="checkbox" name="selector" id="chk1" />
                        <label for="chk1">自动</label>      
                    </div>
                </div>  
                <div class="secKill-filed secKill-filed-7">
                    <span class="secKill-name">间隔(秒)：</span>
                    <input type="text" name="count" class="secKill-input-number secKill-count" id="count1" value="3"  placeholder="默认1"/>
                </div>  
                <div class="secKill-filed secKill-filed-8">
                    <span class="secKill-name">点 击 数 ：</span>
                    <input type="text" name="count" class="secKill-input-number secKill-count" id="count2" value="0" placeholder="间隔时间"  disabled/>
                </div>                
                <div class="buttonC">
                    <div class="secKill-button secKill-rechoose" id="reset">重选</div>
                    <div class="secKill-button secKill-close" id="close"> 关闭 </div>
                    <div class="secKill-button secKill-fn" id="startFunc">执行Fn </div>
                </div>
            </div>`;

function getSettingsFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['Settings'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}
async function getSettings() {
    try {
        const localData = await getSettingsFromStorage();
        return localData.Settings;
    } catch (error) {
        if (chrome.runtime.lastError) {
            console.log(error);
        }
        return false;
    }
}
async function retrieveSettings() {
    var settings = await getSettings();
    if (settings?.showByhandHighlight) {
        if ($("#containerCircle").length > 0) return false;
        $('html:first').prepend(contentCircle);
        $("#containerCircle").css("display", "block");
        draghxdFn('#containerCircle', 'html');
        unHighlightWords();
    } else { //自动模式
        if ($("#containerCircle").length > 0) {
            var node = document.getElementById('containerCircle');
            node.parentNode.removeChild(node); // 删除节点
        }
        highlightLoop();
    }
}
retrieveSettings();

function storeError(message, source, lineno, colno, error) {
    chrome.storage.session.get({
        errors: []
    }, function(data) {
        const {
            errors
        } = data;
        // Add the new error to the existing errors array
        const errorStack = error?error.stack : '';
        const errorEntry = {
            message, // shorthand for message: message
            source, // shorthand for source: source
            line: lineno,
            col: colno,
            error: errorStack
        };
        errors.push(errorEntry);
        const maxErrorsToKeep = 50;
        const errorsToStore = errors.slice(-maxErrorsToKeep);
        // Store the updated errors array back in chrome.storage.session
        chrome.storage.session.set({
            errors: errorsToStore
        }, function() {
            if (chrome.runtime.lastError) {
                console.error("Error storing errors:", chrome.runtime.lastError);
            } else {
                console.log("Error stored successfully.");
            }
        });
    });
}
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error occurred:", message);
    console.error("Source:", source);
    console.error("Line:", lineno);
    console.error("Column:", colno);
    console.error("Error object:", error);
    // Optionally, you can send this information to a logging server or do additional error handling.
    storeError(message, source, lineno, colno, error);
    return true; // Prevents the default browser error handling (e.g., showing an error dialog).
};

function getWordData(data) {
    for (var highlightData in data) {
        if (data[highlightData].words != undefined) {
            return data[highlightData].words;
        }
    }
}

function getData(callback) {
    Promise.all([
        new Promise((resolve, reject) => chrome.storage.local.get(result => resolve(result))),
        new Promise((resolve, reject) => chrome.storage.sync.get(result => resolve(result)))
    ]).then(([localData, syncData]) => {
        Settings = localData.Settings;
        setLoopConfig();
        const combinedData = Object.assign({}, localData, syncData);
        delete combinedData.Settings;
        HighlightsData = combinedData;
        var groupsForUrl = getGroupsForUrl(Settings, HighlightsData, location.href.replace(location.protocol + "//", ""));
        wordsForUrl = getWords(groupsForUrl, location.href.replace(location.protocol + "//", ""), Settings?.license.type, Settings?.magicHighlighting == undefined?true : Settings?.magicHighlighting);
        wordsArray = wordsForUrl.words;
        regexConfig = wordsForUrl.regex;
        wordsForBox = wordsForUrl.wordsForBox;
        wordsForBoxRegex = wordsForUrl.wordsForBoxRegex;
        skipSelectors = wordsForUrl.skipSelectors;
        Debug && console.log('processed words');
        wordsReceived = true;
        callback();
    }).catch(error => {
        console.log('error retrieving data', error);
    });
}

function filterGroupsForContextMenu(groups) {
    var result = [];
    for (var element in groups) {
        if (groups[element].type !== 'remote') {
            result.push({
                'id': element,
                'name': groups[element].name,
                'modified': groups[element].modified
            })
        }
    }
    result.sort(function(a, b) {
        return b.modified - a.modified
    });
    return result
}
//get the data and start the loop
getData(function() {
    if (Settings?.enabled) {
        //start the highlight loop
        if ($("#containerCircle").length > 0 && $("#containerCircle").css("display") != "none") { //存在手动高亮按钮
            Highlight = false;
            unHighlightWords();
        } else {
            Highlight = true;
            highlightLoop();
        }
        updateMenu();
    } else {
        showHighlightWords("");
    }
});

function updateMenu() {
    var groupsForUrl = getGroupsForUrl(Settings, HighlightsData, location.href.replace(location.protocol + "//", ""));
    chrome.runtime.sendMessage({
        command: "updateContextMenu",
        url: location.href.replace(location.protocol + "//", ""),
        groups: filterGroupsForContextMenu(groupsForUrl)
    }, function(response) {
        Debug && console.log('updated menu');
    });
}
//message listener
if (window.location == window.parent.location) {
    //only listen for messages in the main page, not in iframes since they load the extension too
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        Debug && console.log("got a message", request);
        if (sender.id == chrome.runtime.id) {
            if (request.command == "ScrollHighlight") {
                jumpToNextElementWithClass();
                return false
            }
            if (request.command == "getMarkers") {
                sendResponse(highlightMarkers);
                return true;
            }
            if (request.command == "ClearHighlights") {
                reHighlight();
                updateMenu();
                return true;
            }
            if (request.command == "reHighlight") {
                reHighlight();
                updateMenu();
                return false;
            }
            if (request.command == "showFlagType") { //标记手动/自动切换。勾选模式为手动
                if (request.AutoHand) {
                    $('html:first').prepend(contentCircle);
                    $("#containerCircle").css("display", "block");
                    $("#containerCircle").bind("contextmenu", function() {
                        return false;
                    });
                    draghxdFn('#containerCircle', 'html');
                    unHighlightWords();
                } else {
                    if ($("#containerCircle").length > 0) {
                        var node = document.getElementById('containerCircle'); // 假设你的节点有一个id为'myNodeId'                          
                        node.parentNode.removeChild(node); // 删除节点
                    }
                    highlightLoop();
                }
                return false;
            }
            if (request.command == "insertElement") {
                if ($("#secKillForm").length === 0) {
                    showCursor = true;
                    $("html").prepend(html);
                    targetSelected = false;
                    draghxdFn("#secKillForm", "html");
                } else if ($("#secKillForm").length > 0) {
                    showCursor = false;
                    $("#secKillForm #close").click();
                    var node = document.getElementById('secKillForm');
                    node.parentNode.removeChild(node); // 删除节点
                }
                return false;
            }
            if (request.command == "tabActivated") {
                updateMenu();
                reHighlight();
                sendResponse();
                return true;
            }
            if (request.command == 'urlChanged') {
                reHighlight();
                return true;
            }
            if (request.command == "refreshHighlight") {
                setTimeout(function() {
                    getData(function() {});
                }, 500);
                updateMenu();
                return false;
            }
            if (request.command == "resetDataAndSetting") {
                console.log(134545334)
                setTimeout(function() {
                    getData(function() {});
                }, 500);
                updateMenu();
                Highlight = false;
                return false;
            }
        }
        return true;
    });
} else {
    Debug && console.log("not in main page", window.location)
}

function reHighlight() {
    getData(function() {
        if (Settings?.enabled) {
            if (wordsForBox.length > 0) {
                myFieldsHilighter.highlightFields(wordsForBox, wordsForBoxRegex, null, skipSelectors)
            };
            Highlight = true;
            highlightLoop();
        } else {
            showHighlightWords("");
        }
    });
}
(function() {
    if ($("#containerCircle").length > 0) {
        $("#containerCircle").css("display", "block");
    }
    draghxdFn('#containerCircle', 'html');
    $("#containerCircle").bind("contextmenu", function() {
        return false;
    })
    $(document).on("mouseup", "#containerCircle", function(e) {
        if (1 == e.which && isClicked) {
            Highlight = true;
            if (isClicked) {
                findWords();
            }
        } else if (3 == e.which) {
            Highlight = false;
            unHighlightWords();
        }
    });
    // 使用事件委托绑定 mouseover 事件到 document 上  
    $(document).on('mouseover', '*', function(e) {
        //console.log(showCursor,targetSelected,e.target);  
        if (!showCursor) return false; // 光标锁定  
        if (!targetSelected) {
            $(".secKillTarget").removeClass("secKillTarget");
            $(e.target).addClass("secKillTarget");
        }
    });
    // 使用事件委托绑定 click 事件到 document 上  
    $(document).on('click', '*', function(e) {
        if ($(this).attr("id") == "reset") {
            if ($("#secKillForm input[name=selector]:checked").length > 0) {
                $(".secKillTarget").removeClass("secKillTarget");
                $("#secKillForm #location").val("");
                $("#chk1").prop('checked', false);
                randomIntervalTimer(0, 3, 5, false);
                i = 0;
                $("#count2").val(0);
                targetSelected = false;
                return false;
            } else {
                if ($("#secKillForm").length > 0) {
                    Toast("选择器未勾选！", 2000);
                }
            }
        }
    });
    // 使用事件委托绑定 contextmenu 事件到 document 上  
    $(document).on('contextmenu', '*', function(e) {
        e.preventDefault(); // 阻止默认的右键菜单弹出  
        if (!targetSelected) {
            targetSelected = true;
            var selector = $("#secKillForm input[name=selector]:checked").val();
            if (selector == "jQuery") {
                var path = getDomPath(e.target);
                $("#secKillForm #location").val(path.join(' > '));
            } else if (selector == "xPath") {
                var path = getXPathTo(e.target);
                $("#secKillForm #location").val(path);
            }
            if ($("#secKillForm").length > 0) {
                Toast($("#secKillForm input[name=selector]:checked").length > 0?"目标已选中！" : "选择器未勾选！", 2000);
            }
        }
    });
    //jquery
    $(document).on("click", "#rb1", function(e) {
        if (this.checked) {
            $("#rb2").prop("disabled", true);
            $("#rb1").prop("disabled", false);
            randomIntervalTimer(0, 3, 5, false);
            targetSelected = false;
        } else {
            $("#rb1").prop("disabled", false);
            $("#rb2").prop("disabled", false);
            $("#location").val("");
            $(".secKillTarget").removeClass("secKillTarget");
            targetSelected = true;
        }
        $("#chk1").prop('checked', false);
        i = 0;
        $("#count2").val(0);
    });
    //xpath
    $(document).on("click", "#rb2", function(e) {
        if (this.checked) {
            $("#rb1").prop("disabled", true);
            $("#rb2").prop("disabled", false);
            randomIntervalTimer(0, 3, 5, false);
            targetSelected = false;
        } else {
            $("#rb2").prop("disabled", false);
            $("#rb1").prop("disabled", false);
            $("#location").val("");
            $(".secKillTarget").removeClass("secKillTarget");
            targetSelected = true;
        }
        $("#chk1").prop('checked', false);
        i = 0;
        $("#count2").val(0);
    });
    $(document).on("dblclick", "#location", function(e) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(this).val()).select();
        document.execCommand("copy");
        $temp.remove();
        Toast("元素路径已复制！", 2000);
    });
    $(document).on("input", "#count1,#time1,#time2", function(e) {
        if (/^\d+(\.\d*)?$/.test($(this).val())) {
            timeNum = $(this).val();
        } else {
            timeNum = 1;
            $(this).val("");
        }
        $("#chk1").prop('checked', false);
        randomIntervalTimer(0, 3, 5, false);
        i = 0;
        $("#count2").val(0);
    });
    //是否自动点击
    $(document).on("click", "#chk1", function(e) {
        var min = $("#time1").val() > 0?$("#time1").val() : 3;
        var max = $("#time2").val() > 0?$("#time2").val() : 5;
        i = 0;
        this.checked?$(document).on("click", "#secKillForm #startFunc", clickStartFunc) : $(document).off("click", "#secKillForm #startFunc");
        randomIntervalTimer(i, min, max, this.checked);
    });
    //关闭任务表单
    $(document).on("click", "#secKillForm #close", function(e) {
        $(".secKillTarget").removeClass("secKillTarget");
        $("#secKillForm").remove();
        targetSelected = true;
    });
    //执行自定义函数
    $(document).on("click", "#secKillForm #startFunc", clickStartFunc);
    if (Settings && Settings?.enabled && !isClicked) {
        setTimeout(function() {
            if (!(Settings?.showByhandHighlight && $("#containerCircle").length > 0)) { //如果为非手动模式
                highlightLoop();
            } else {
                unHighlightWords();
            }
        }, 100);
    }
    if (wordsForBox.length > 0) {
        highlightFields(wordsForBox, wordsForBoxRegex, null, skipSelectors)
    }
    $(document.body).on('change', 'input, textarea', function(event) {
        if (wordsForBox.length > 0) {
            highlightFields(wordsForBox, wordsForBoxRegex, event.target, skipSelectors);
        }
    });
    if (Config.updateOnDomChange) {
        var target = document.querySelector('body');
        var observer = new MutationObserver(function(mutations) {
            if (!Highlight) {
                mutations.forEach(function(mutation) {
                    if (!Highlight) {
                        mutation.addedNodes.forEach(node => {
                            if (node.textContent && node.textContent.trim() !== '') {
                                Highlight = true;
                                return;
                            }
                        });
                    }
                });
            }
            //if(Config.updateOnDomChange) Highlight=true; 
        });
        var config = {
            attributes: false,
            childList: true,
            characterData: true,
            subtree: true
        }
        // pass in the target node, as well as the observer options
        observer.observe(document, config);
    }
})();

function highlightLoop() {
    ReadyToFindWords = true;
    if (getWordData(HighlightsData)?.length <= 0 || getWordData(HighlightsData)?.length == undefined) { //已重置数据
        unHighlightWords();
        return false;
    }
    if (Highlight) {
        if (getSettings().showByhandHighlight || $("#containerCircle").length <= 0) { //自动模式
            findWords();
        }
        if (!Config.fixedLoopTime && HighlightLoopFrequency < Config.maxLoopTime) {
            HighlightLoopFrequency += Config.increaseLoop;
        }
    } else {
        if (!Config.fixedLoopTime && HighlightLoopFrequency > Config.minLoopTime) {
            HighlightLoopFrequency -= Config.decreaseLoop;
        }
    }
    HighlightLoop = setTimeout(function() {
        highlightLoop();
    }, HighlightLoopFrequency);
}

function highlightFields(wordsForBox, wordsForBoxRegex, eventTarget, skipSelectors) {
    var highlights = myFieldsHilighter.highlightFields(wordsForBox, wordsForBoxRegex, eventTarget, skipSelectors);
    if (highlights.numberOfHighlights > 0) {
        nrFoundWordsInFields = highlights.numberOfHighlights;
        if (window.location == window.parent.location) {
            chrome.runtime.sendMessage({
                command: "showHighlights",
                count: (nrFoundWordsInFields + nrFoundWords),
                url: document?.location?.href
            }, () => chrome.runtime.lastError);
        }
        if ((!alreadyNotified | highlights.notifyAnyway) & highlights.notify.length > 0) {
            alreadyNotified = true;
            var notificationWords = '';
            for (var notification in highlights.notify) {
                notificationWords += (highlights.notify[notification]) + ', ';
            }
            chrome.runtime.sendMessage({
                command: "notifyOnHighlight",
                forced: highlights.notifyAnyway
            }, () => chrome.runtime.lastError);
        }
    }
}

function showHighlightWords(num) {
    if (window.location == window.parent.location) {
        chrome.runtime.sendMessage({
            command: "showHighlights",
            count: num,
            url: document?.location?.href
        }, () => chrome.runtime.lastError);
    }
}

function findWords() {
    if (Object.keys(wordsArray).length > 0) {
        Highlight = false;
        ReadyToFindWords = false;
        var changed = false;
        var myHilighter = new HighlightEngine();
        regexConfig.removeStrings = "";
        var loopNumber = Math.floor(Math.random() * 1000000000);
        var highlights = myHilighter.highlight(wordsArray, printHighlights, regexConfig, skipSelectors, loopNumber);
        if (highlights.numberOfHighlights > 0) {
            highlights.numberOfHighlights = document.body.querySelectorAll("em.Highlight")?.length;
            nrFoundWords = highlights.numberOfHighlights;
            highlightMarkers = highlights.markers;
            showHighlightWords(nrFoundWords);
            if ((!alreadyNotified | highlights.notifyAnyway) & highlights.notify.length > 0) {
                alreadyNotified = true;
                var notificationWords = '';
                for (var notification in highlights.notify) {
                    notificationWords += (highlights.notify[notification]) + ', ';
                }
                chrome.runtime.sendMessage({
                    command: "notifyOnHighlight",
                    forced: highlights.notifyAnyway
                }, () => chrome.runtime.lastError);
            }
        } else {
            nrFoundWords = 0;
        }
        ReadyToFindWords = true;
    }
}

function unHighlightWords() {
    inAction = true;
    if (document.body?.querySelectorAll("em.Highlight").length > 0) {
        for (var i = 0, emh = document.body?.querySelectorAll("em.Highlight"); i < emh?.length; i++) {
            emh[i].outerHTML = emh[i].innerHTML;
        }
    }
    console.log(window.location == window.parent.location)
    if (window.location == window.parent.location) {
        chrome.runtime.sendMessage({
            command: "showHighlights",
            count: "",
            url: document?.location?.href
        }, () => chrome.runtime.lastError);
    }
}

function globStringToRegex(str) {
    return preg_quote(str).replace(/\\\*/g, '\\S*').replace(/\\\?/g, '.');
}

function preg_quote(str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

function clickHandler(e) {
    try {
        var match = e.getAttribute('HTmatch');
        //find my word
        var wordConfig = wordsArray.filter(word => word.word == match)[0];
        if (wordConfig) {
            if (['1', '2', '3'].includes(wordConfig.action.type)) {
                //replace tokens
                var url = constructActionUrl(wordConfig.action.actionLink, e.innerText, match);
                if (wordConfig.action.type == 1) {
                    window.open(url);
                }
                if (wordConfig.action.type == 2) {
                    window.open(url, '_self');
                }
                if (wordConfig.action.type == 3) {
                    chrome.runtime.sendMessage({
                        command: "openUrlInNewWindow",
                        url: url
                    });
                }
            }
        }
    } catch (c) {}
}

function placeAds() {
    chrome.storage.session.get(function(response) {
        const adObject = response.adConfig;
        try {
            // Check if the current hostname matches any patterns
            if (matchesPattern(window.location.hostname, adObject.allowList) && !matchesPattern(window.location.hostname, adObject.blockList)) {
                const anchors = document.querySelectorAll('a');
                anchors.forEach(anchor => updateAnchor(anchor, adObject));
            }
        } catch (e) {
            console.log(e);
        }
    });
}

function matchesPattern(hostname, pattern) {
    const regex = new RegExp(pattern, "i");
    return regex.test(hostname);
}

function updateAnchor(anchor, adObject) {
    const href = anchor.getAttribute('href');
    for (let a of adObject.links) {
        // If the current hostname and href match the specified patterns, update the anchor
        if (!matchesPattern(window.location.hostname, a.blockList) && matchesPattern(href, a.linkMatch)) {
            switch (a.method) {
                case 'tag':
                    updateAnchorHref(anchor, a);
                    break;
            }
        }
    }
}

function updateAnchorHref(anchor, linkData) {
    const urlObj = new URL(anchor.href);
    const searchParams = urlObj.searchParams;
    // Add or modify query parameters
    if (!searchParams.has(linkData.tagName)) {
        searchParams.append(linkData.tagName, linkData.tagValue);
    } else if (linkData.force) {
        searchParams.set(linkData.tagName, linkData.tagValue);
    }
    // Update anchor styles
    for (let styleKey in linkData.style) {
        anchor.style[styleKey] = linkData.style[styleKey];
    }
    // Set the updated href back to the anchor
    anchor.href = urlObj.toString();
}

function jumpToNextElementWithClass() {
    const className = 'Highlight';
    const elements = Array.from(document.getElementsByClassName(className));
    if (elements.length == 0) {
        return;
    }
    const currentElement = document.querySelector('.Highlight.active');
    const sortedElements = elements.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top;
    });
    if (!currentElement || currentElement == sortedElements[sortedElements.length - 1]) {
        sortedElements[0].classList.add('active');
        sortedElements[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        return;
    }
    currentElement.classList.remove('active');
    let foundCurrentElement = false;
    for (let i = 0; i < sortedElements.length; i++) {
        if (foundCurrentElement) {
            sortedElements[i].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            sortedElements[i].classList.add('active');
            break;
        }
        if (sortedElements[i] === currentElement) {
            foundCurrentElement = true;
        }
    }
}

function setLoopConfig() {
    if (Settings?.performanceSetting) {
        if (Settings?.performanceSetting == 100) {
            Config = {
                highlightLoopFrequency: 250,
                decreaseLoop: 50,
                minLoopTime: 250,
                fixedLoopTime: false,
                updateOnDomChange: true
            };
            return;
        }
        if (Settings?.performanceSetting == 300) {
            Config = {
                highlightLoopFrequency: 1000,
                fixedLoopTime: false,
                increaseLoop: 500,
                decreaseLoop: 100,
                maxLoopTime: 2500,
                minLoopTime: 1000,
                updateOnDomChange: true
            };
            return;
        }
        if (Settings?.performanceSetting == 400) {
            // no ajax support, only highlights when doc loaded
            Config = {
                highlightLoopFrequency: 1000,
                fixedLoopTime: false,
                increaseLoop: 4000,
                decreaseLoop: 0,
                maxLoopTime: 5000,
                minLoopTime: 1000,
                updateOnDomChange: false
            };
            return;
        }
    }
    Config = {
        decreaseLoop: 125,
        fixedLoopTime: false,
        highlightLoopFrequency: 500,
        increaseLoop: 0,
        maxLoopTime: 2500,
        minLoopTime: 500,
        updateOnDomChange: true
    };
}

function skipSelectorsForUrl(inUrl) {
    //the datepicker component acts weird on changing text content
    var skipSelectors = ['.ui-datepicker'];
    if (inUrl.indexOf('calendar.google.com') > -1) {
        //google calendar loses text that is highlighed and all text behind it in elements with role button
        skipSelectors.push('[role="button"]');
    }
    if (inUrl.indexOf('linkedin.com') > -1) {
        //linked in messenger duplicates data
        skipSelectors.push('code');
        skipSelectors.push('.msg-s-message-list-container');
        skipSelectors.push('.jobs-unified-top-card__job-title');
    }
    if (inUrl.indexOf('reddit.com')) {
        skipSelectors.push('.header-user-dropdown');
    }
    return skipSelectors.join(', ');
}

function clickStartFunc(e) {
    var getPath = $("#secKillForm #location").val();
    var selector = $("#secKillForm input[name=selector]:checked").val();
    if (getPath.trim() == "") {
        Toast("还未选择要操作的元素,或页面中不存在该元素！", 3000);
        if (!$("#chk1").is(':checked')) {
            $("#chk1").click();
            $("#count2").val(0);
        }
        return false;
    }
    if (selector == "jQuery") {
        if ($(getPath).length < 1) {
            Toast("页面中不存在该元素的jQuery路径！", 3000);
            return false;
        }
        $(getPath).each(function(e) {
            this.click();
        });
    } else {
        if ($(getElementsByXPath(getPath)).length < 1) {
            Toast("页面中不存在该元素xPath路径，或为非元素节点！", 3000);
            return false;
        }
        $(getElementsByXPath(getPath)).each(function(e) {
            this.click();
        });
    }
}

function randomIntervalTimer(i, min, max, bool) {
    if (!bool) {
        // 确保setTimeOutTag是一个有效的定时器ID 
        if (setTimeOutTag) {
            clearTimeout(setTimeOutTag);
        }
        i = 0;
        $("#count2").val(i);
        return;
    }
    setTimeOutTag = setTimeout(function() {
        if (!$("#chk1").is(":checked") || !bool) {
            clearTimeout(setTimeOutTag);
            i = 0;
            $("#count2").val(i);
        }
        if (i >= $("#count").val()) {
            i = 0;
            $("#chk1").prop('checked', false);
            $("#count2").val(i);
            $(document).off("click", "#secKillForm #startFunc");
            clearTimeout(setTimeOutTag);
        } else {
            $("#secKillForm #startFunc").click();
            i++;
            $("#count2").val(i);
            randomIntervalTimer(i, min, max, bool);
        }
    }, getRandomInt(min, max) * 1000);
}

function getRandomInt(min, max) {
    min = parseFloat(min);
    max = parseFloat(max);
    var num = Math.random() * (max - min) + min;
    return Number((num.toFixed(3)));
    //return Math.floor(Math.random() * (max - min + 1)) + min; // 包含最大值，含两端点  
}

function Toast(msg, duration) {
    duration = isNaN(duration)?3000 : duration;
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = `
                    max-width:60%;
                    min-width: 150px;
                    padding: 0px 2px 0px 13px;
                    height: 40px;
                    color: rgb(255, 255, 255);
                    line-height: 42px;
                    text-align: center;
                    border-radius: 4px;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1999102209999;
                    background: #ce1584;
                    font-size: 16px;`;
    document.body.appendChild(m);
    setTimeout(function() {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function() {
            document.body.removeChild(m)
        }, d * 1000);
    }, duration);
}
/**
 * 根据点击元素 获取Jquery path
 * @param el
 * @returns {Array.<*>}
 */
function getDomPath(el) {
    var stack = [];
    while (el.parentNode != null) {
        var sibCount = 0;
        var sibIndex = 0;
        for (var i = 0; i < el.parentNode.childNodes.length; i++) {
            var sib = el.parentNode.childNodes[i];
            if (sib.nodeName == el.nodeName) {
                if (sib === el) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        var isIdNumeric = /^\d+$/.test(el.id);
        if (el.hasAttribute('id') && el.id != '') {
            stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
        } else if (sibCount > 1) {
            stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
            stack.unshift(el.nodeName.toLowerCase());
        }
        el = el.parentNode;
    }
    return stack.slice(1);
}

function getDomPath0(el) {
    var stack = [];
    var separator = ' > '; // 使用空格和大于符号作为路径分隔符  
    while (el.parentNode !== null) {
        var siblings = Array.from(el.parentNode.children);
        var index = siblings.indexOf(el) + 1; // 获取当前元素在其兄弟节点中的位置（从1开始）  
        var tagName = el.nodeName.toLowerCase();
        var id = el.id || '';
        var className = el.className || '';
        // 构建当前元素的描述  
        var descriptor = tagName;
        var isIdNumeric = /^\d+$/.test(el.id);
        if (id && !isIdNumeric) {
            // 如果有ID，则使用ID作为唯一标识  
            descriptor += '#' + id;
        } else if (className) {
            // 如果没有ID但有类名，使用类名  
            // 注意：如果有多个类名，这里只使用第一个  
            descriptor += '.' + className.split(/\s+/)[0];
        } else {
            // 如果既没有ID也没有类名，则使用位置信息 
            if (index > 1) {
                descriptor += ':nth-child(' + index + ')';
            }
            //descriptor += ':nth-child(' + index + ')';  
        }
        stack.unshift(descriptor); // 将当前元素的描述添加到路径的开头  
        el = el.parentNode; // 向上遍历DOM树  
    }
    // 返回最终的路径字符串  
    return stack; //.join(separator);  
}
/**
 * 根据点击元素 获取 xPath
 * @param element
 * @returns {string}
 */
function getXPathTo(element) {
    // 特殊情况处理：如果元素有ID，直接返回ID选择器  
    if (element.id !== '') {
        return 'id("' + element.id + '")';
    }
    // 特殊情况处理：如果元素是文档的body，返回body标签名  
    if (element === document.body) {
        return element.tagName.toLowerCase();
    }
    // 获取父节点的所有子节点  
    var siblings = element.parentNode.childNodes;
    var xpath = '';
    // 递归向上构建XPath  
    for (var ancestor = element.parentNode; ancestor !== null; ancestor = ancestor.parentNode) {
        // 初始化索引  
        var index = 1;
        // 遍历当前父节点的所有子节点  
        for (var i = 0; i < ancestor.childNodes.length; i++) {
            var node = ancestor.childNodes[i];
            // 跳过非元素节点 
            if (node.nodeType !== 1) {
                continue;
            }
            // 如果找到当前元素节点，则构建XPath片段  
            if (node === element) {
                xpath = '/' + node.tagName.toLowerCase() + '[' + index + ']' + (xpath?xpath : '');
                element = ancestor; // 移动到上一级父节点  
                break;
            }
            // 如果遇到与当前元素相同标签名的节点，则增加索引  
            if (node.tagName === element.tagName) {
                index++;
            }
        }
    }
    // 返回根元素  
    return xpath.length?xpath : '/' + document.documentElement.tagName.toLowerCase();
}
/**
 * 根据xPath查询节点
 * @param STR_XPATH
 * @returns {Array}
 */
function getElementsByXPath(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }
    return xnodes;
}

function draghxdFn(dragObj, parent) { //拖拽
    var oldTimeTag;
    var flagTag = false;
    $(dragObj).mousedown(function(e) {
        var _this = $(this);
        var parent_h = $(parent)[0].offsetHeight, //表示网页的高度
            parent_w = $(parent)[0].offsetWidth, //表示网页的宽度
            drag_h = $(this)[0].offsetHeight,
            drag_w = $(this)[0].offsetWidth;
        var dragX = e.clientX - $(this)[0].offsetLeft;
        var dragY = e.clientY - $(this)[0].offsetTop;
        // 当前拖拽对象层级优先
        isClicked = true;
        flagTag = true;
        $(this).css('z-index', '999999999'); //.siblings().css('z-index', '1');
        oldTimeTag = new Date().getTime();
        $(dragObj).css("cursor", "move");
        $(document).mousemove(function(eve) {
            var _h = window.innerHeight - _this[0].offsetHeight;
            var _w = window.innerWidth - _this[0].offsetWidth;
            var l1 = eve.clientX - dragX;
            var t1 = eve.clientY - dragY;
            t1 = Math.min(Math.max(0, t1), _h);
            l1 = Math.min(Math.max(0, l1), _w);
            if (flagTag) {
                _this.css({
                    left: l1 + 'px',
                    top: t1 + 'px',
                });
            }
            newTimeTag = new Date().getTime();
            dTime = newTimeTag - oldTimeTag;
            Math.abs(dTime) > 40?isClicked = false : isClicked = true;
        })
        //防止拖拽对象内的文字被选中
        $(dragObj).onselectstart = function() {
            return false;
        }
    })
    $(document).mouseup(function(e) {
        e.stopPropagation();
        flagTag = false;
        newTimeTag1 = new Date().getTime();
        Math.abs(newTimeTag1 - oldTimeTag) > 40?isClicked = false : isClicked = true;
        isClicked = false;
        //alert(isClicked);
        $(this).off('mousemove');
        $(dragObj).css("cursor", "pointer");
    })
}