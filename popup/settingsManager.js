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
        console.error(error);
        return false;
    }
}
// retrieve the settings
async function retrieveSettings() {
    Settings = await getSettings();
}

function setSetting(setting, value, callback) {
    switch (setting) {
        case 'enabled':
            Settings.enabled = value;
            value ? notify.highlightingEnabled() : notify.highlightingDisabled();
            break;
        case 'showByhandHighlight':
            Settings.showByhandHighlight = value;
            break;
        case 'showAutoClick':
            Settings.showAutoClick = value;
            break;
        case 'showFoundWords':
            Settings.showFoundWords = value;
            break;
        case 'printHighlights':
            Settings.printHighlights = value;
            break;
        case 'showOrHideEle':
            Settings.showOrHideEle = value;
            break;
        case 'licenseFree':
            Settings.license = {
                type: 'Free'
            };
            notify.licenseChangedFree();
            chrome.runtime.sendMessage({
                command: "sendAnalyticsOnSubChange"
            }, function(response) {});
            break;
        case 'licenseAd':
            Settings.license = {
                type: 'Ad'
            };
            notify.licenseChangedAd();
            chrome.runtime.sendMessage({
                command: "sendAnalyticsOnSubChange"
            }, function(response) {});
            break;
        case 'magicHighlighting':
            Settings.magicHighlighting = value;
            break;
        case 'order':
            Settings.order = value;
            break;
    }
    chrome.storage.local.set({
        ['Settings']: Settings
    }, callback);
}

function saveSettings() {
    document.getElementById("onPage").style.display = "none";
    Settings.showFoundWords = document.getElementById("showFoundWords").checked;
    Settings.printHighlights = document.getElementById("printHighlights").checked;
    Settings.magicHighlighting = document.getElementById("magicHighlighting").checked;

    var neverHighlightOnSites = document.getElementById("neverHighlightOn").value.split("\n").filter(function(e) {
        return e
    });
    var cleanNeverHighlightOnSites = [];

    if (neverHighlightOnSites.length > 0) {
        neverHighlightOnSites.forEach(function(item) {
            cleanNeverHighlightOnSites.push(item.replace(/(http|https):\/\//gi, ""));
        });
    }
    Settings.neverHighlightOn = cleanNeverHighlightOnSites;

    var onlyHighlightOnSites = document.getElementById("onlyHighlightOn").value.split("\n").filter(function(e) {
        return e
    });
    var cleanOnlyHighlightOnSites = [];
    if (onlyHighlightOnSites.length > 0 || Settings?.onlyHighlightOn) {
        onlyHighlightOnSites.forEach(function(item) {
            cleanOnlyHighlightOnSites.push(item.replace(/(http|https):\/\//gi, ""));
        });
        Settings.onlyHighlightOn = cleanOnlyHighlightOnSites;
    }
    
    Settings.performanceSetting = document.getElementById("performance").value * 100 + 100;
    //backup
    if (!Settings?.backup || (Settings?.backup && Settings.backup.frequency !== document.getElementById("autoBackupFrequency").value)) {
        if (document.getElementById("autoBackupFrequency").value == 'never') {
            delete Settings?.backup;
        } else {
            Settings.backup = {
                frequency: document.getElementById("autoBackupFrequency").value,
                last: null
            }
        }
    }
    chrome.storage.local.set({
        ['Settings']: Settings
    }, function() {
        notify.settingsSaved();
        drawInterface();
        closeSettings();
    });
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            command: "refreshHighlight"
        }, function(response) {
            if (!chrome.runtime.lastError) {
                console.log(response);
            }
        });
    });
}

function getLicense1(key, callback) {
    const licenseUrl = 'https://api.highlightthis.net/api/licenseService/licensecheck';
    requestObject = {
        licenseKey: key,
        installId: Settings.installId
    }
    fetch(licenseUrl, {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestObject)
    }).then((response) => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Network response was not ok.');
        callback(false)
    }).then((licenseInfo) => {
        licenseInfo = JSON.parse(licenseInfo);
        //console.log(licenseInfo);
        validUntil = new Date(licenseInfo.validUntil).getTime();
        Settings.license = {
            type: licenseInfo.product,
            validUntil: validUntil,
            licenseKey: licenseInfo.licenseKey
        }
        notify.licenseChangedPaid(licenseInfo.product, licenseInfo.validUntil);
        chrome.storage.local.set({
            ['Settings']: Settings
        }, callback(true));
        chrome.runtime.sendMessage({
            command: "sendAnalyticsOnSubChange"
        }, function(response) {});
    }).catch((err) => {
        console.log(err);
        callback(false)
    });
}

function getLicense(key, callback) {
    var types = "";
    var notice = "";
    var date = null;
    var today = new Date();
    switch (generateStringHash(key + "") + "") {
        case "2345yz01uvwxqrst":
            types = "Free";
            notice = "当前许可证：200字词限定版本";
            date = today.setDate(today.getDate() + 36500);
            break;
        case "WXUVabYZefcdijgh":
            types = "Free";
            notice = "当前许可证：200字词限定版本";
            date = today.setDate(today.getDate() + 36500);
            break;
        case "01234567stuvwxyz":
            types = "Free";
            notice = "当前许可证：200字词限定版本";
            date = today.setDate(today.getDate() + 36500);
            break;
        case "543210zyxwvutsrq":
            types = '500';
            notice = "当前许可证：500字词限定版本";
            date = today.setDate(today.getDate() + 60);
            break;
        case "ZYbaVUXWhgjidcfe":
            types = '500';
            notice = "当前许可证：500字词限定版本";
            date = today.setDate(today.getDate() + 60);
            break;
        case "10325476tsvuxwzy":
            types = "Temp";
            notice = "当前许可证：试用版本";
            date = today.setDate(today.getDate() + 30);
            break;
        case "efcdijghWXUVabYZ":
            types = "Unlimited";
            notice = "当前许可证：无限制版本";
            date = today.setDate(today.getDate() + 36500);
            break;
        case "IJGHEFCDAB896745":
            types = "Ad";
            notice = "当前许可证：无限制版本但可能有广告";
            date = today.setDate(today.getDate() + 36500);
            break;
        default:
            types = "none";
    }
    if (types != "none") {
        Settings.license = {
            type: types,
            validUntil: date,
            licenseKey: key
        }
        notify.licenseGenarate(notice);
        chrome.storage.local.set({
            ['Settings']: Settings
        }, callback(true));
        chrome.runtime.sendMessage({
            command: "sendAnalyticsOnSubChange"
        }, function(response) {});
    } else {
        notify.licenseGenarate("许可证无效，请检查！");
    }
}

function generateStringHash(str) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let hash = 0;
    let result = '';
    // 使用字符串的每个字符的编码来计算哈希值  
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
    }
    // 使用哈希值来生成最终的字符串  
    // 通过取模运算和字符集的长度来确保结果始终在字符集范围内  
    for (let i = 0; i < 16; i++) {
        // 使用哈希值和字符集长度来生成一个索引  
        const index = (hash ^ i) % characters.length;
        // 从字符集中取出对应位置的字符，并添加到结果字符串中  
        result += characters.charAt(index);
    }
    return result;
}

function resetDataAndSettings() {
    document.getElementById("newGroup").style.display = "none";
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("deleteGroup").style.display = "none";
    document.getElementById("settingsGroup").style.display = "none";
    document.getElementById("resetSettings").style.display = "block";
}

function noResetDataAndSettings(tag) {
    if (tag == 1) {
        closeSettings();
        document.getElementById("resetSettings").style.display = "none";
        document.getElementById("deleteGroup").style.display = "none";
    } else {
        document.getElementById("settingsGroup").style.display = "block";
        document.getElementById("resetSettings").style.display = "none";
        document.getElementById("deleteGroup").style.display = "none";
    }
    tag = 0;
}

function yesResetDataAndSettings() {
    getLists(function(){drawInterface();});
    clearHighlightsFromTab();
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            command: "resetDataAndSetting"
        }, function(response) {
            if (!chrome.runtime.lastError) {
                window.close();
            }
        });
    });

    chrome.runtime.sendMessage({command: "resetDataAndSettings"}, function (response) {
        window.close();
    }); 
}