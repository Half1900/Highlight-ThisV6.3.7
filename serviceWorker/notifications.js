export function notifyWordAlreadyInList(word){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": "Highlight This",
        "message": word + " " + chrome.i18n.getMessage("already_in_wordlist")
    });
}

export function notifyWordAdded(word,groupName){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("added_new_word"),
        "message": word + " " + chrome.i18n.getMessage("has_been_added_to") +" "+ groupName + "."
    });
}
export function notifyNonWhitespaceBoundaryWordAdded(word){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("added_non_term"),
        "message": chrome.i18n.getMessage("added_non_term_description") 
    });
}
export function notifyWordFoundOnPage(text){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("word_found_on_page"), 
        "message": text
    });
}

export function notifySyncedList(listname){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("list_synced"),
        "message": "'"+listname+"' "+chrome.i18n.getMessage("has_been_updated")
    });
}

export function notifyLicenseRegistered(validUntil){
    var d = new Date(validUntil);
    var friendlyDate=d.getDate() + "-" + chrome.i18n.getMessage("shortmonth_"+(d.getMonth()+1)) + "-" + d.getFullYear();
  
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_new")||"新的许可证",
        "message": chrome.i18n.getMessage("license_new_until") + " " + friendlyDate
    });

}
export function notifyLicenseUpdated(validUntil){
    var d = new Date(validUntil);
    var friendlyDate=d.getDate() + "-" + chrome.i18n.getMessage("shortmonth_"+(d.getMonth()+1)) + "-" + d.getFullYear();
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_updated")||"更新许可证",
        "message": chrome.i18n.getMessage("license_new_until")+" "+friendlyDate
    });

}
export function notifyLicenseRevoked(){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_expired")||"许可证已到期",
        "message": chrome.i18n.getMessage("license_expired_message")
    });

}