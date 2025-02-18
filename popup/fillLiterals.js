function fillLiterals() {
    const labelAssignments = {
        "litTitle": "popup_title",
        "popup_title": "popup_mid_title",
        "popup_mid_title": "popup_mid_title",
        "byline": "popup_byline",
        "popup_nowords": "popup_nowords",
        "collapseAll": "popup_collapseAll",
        "popup_create1": "popup_create1",
        "popup_create2": "popup_create2",
        "toConfig": "popup_configureWords",
        "foundWords": "popup_foundWords",
        "dontShowWordsLabel": "popup_dontshowwords",
        "field_listname": "field_listname",
        "field_colors": "field_colors",
        "field_colors_help": "field_colors_help",
        "field_foreground": "field_foreground",
        "field_background": "field_background",
        "field_boxColor": "field_boxColor",
        "example1": "example1",
        "example2": "example2",
        "example": "example",
        "field_detection_help": "field_detection_help",
        "field_words": "field_words",
        "sites_info": "sites_info",
        "field_highlightOn": "field_highlightOn",
        "field_dontHighlight": "field_dontHighlight",
        "cancelAddGroup": "popup_cancel",
        "popup_settings": "popup_settings",
        "field_byhandHighlight": "field_byhandHighlight",
        "field_showFoundWords": "field_showFoundWords",
        "field_printHighlights": "field_printHighlights",
        "field_onlyHighlightOn": "field_onlyHighlightOn",
        "field_neverHighlightOn": "field_neverHighlightOn",
        "field_neverHighlightOn_help": "field_neverHighlightOn_help",
        "cancelSettings": "popup_cancel",
        "saveSettings": "popup_save",
        "field_exportSettings": "field_exportSettings",
        "exportLink": "field_export",
        "field_importSettings": "field_importSettings",
        "importFileLink": "field_import",
        "restoreWarning": "restoreWarning",
        "popup_confirmDelete": "popup_confirmDelete",
        "yesDeleteGroup": "popup_yes",
        "noDeleteGroup": "popup_no",
        "labelListName": "popup_labelListName",
        "newGroupTitle": "title_newGroupType",
        "newGroupDetail": "newGroupDetail",
        "cancelCreateGroup": "popup_cancel",
        "createGroupLink": "popup_next",
        "localLabel": "localLabel",
        "remoteLabel": "remoteLabel",
        "field_source": "field_source",
        "field_useRegexTokens_help": "field_useRegexTokens_help",
        "field_caseSensitive_label": "field_caseSensitive_label",
        "syncLinkText": "sync",
        "field_performance": "performance",
        "performanceHelp": "performanceHelp",
        "field_showInEditableFields_help": "highlight_editable_fields",
        "field_notifyOnHighlight_help": "notify_when_found",
        "notifyFrequency_1": "once_per_page",
        "notifyFrequency_2": "everytime",
        "newGroupTitleStorage": "sync_list_header",
        "newGroupDetailStorage": "sync_list_desc",
        "storageLocalLabel": "sync_list_no",
        "storageSyncLabel": "sync_list_yes",
        "non_unicode_chars": "non_unicode_chars",
        "tabGeneral": "tab_general",
        "tabStyleScreen": "tab_style",
        "tabLimitations": "tab_limitations",
        "tabSettingsLimitations": "tab_limitations",
        "tabAdvanced": "tab_advanced",
        "tabAction": "tab_action",
        "tabSettingsGeneral": "tab_settings_general",
        "tabSettingsBackup": "tab_settings_backup",
        "titleCreateNewList": "create_new_list",
        "remotelist_help": "remotelist_help",
        "wordsMoveMenuTitle": "send_to",
        "action_intro": "action_intro",
        "label_link": "label_link",
        "action_none": "action_none",
        "action_newtab": "action_newtab",
        "actionExampleHelp": "action_example",
        "action_tip1": "action_tip1",
        "action_tip2": "action_tip2",
        "action_tip3": "action_tip3",
        "action_tip4": "action_tip4",
        "last_synced_on": "last_synced_on",
        "launchGoogleSheetsAssisantbtn": "launch_assistant",
        "closeGoogleSheetsAssisantbtn": "close_assistant",
        "labelSheetsId": "sheets_id",
        "googleSheetsAssistantTitle": "sheets_assistant",
        "googleAssist1": "assistant_step_1",
        "googleAssist2": "assistant_step_2",
        "googleAssist3": "assistant_step_3",
        "googleAssist4": "assistant_step_4",
        "googleAssist5": "assistant_step_5",
        "googleAssist6": "assistant_step_6",
        "menu_home_label": "menu_home_label",
        "menu_settings_label": "menu_settings_label",
        "menu_subscription_label": "menu_subscription_label",
        "menu_help_label": "menu_help_label",
        "currentlicense-free-title": "currentlicense_free_title",
        "currentlicense-free-description": "currentlicense_free_description",
        "currentlicense-temp-title": "currentlicense_temp_title",
        "currentlicense-temp-description": "currentlicense_temp_description",
        "currentlicense-ad-title": "currentlicense_ad_title",
        "currentlicense-ad-description": "currentlicense_ad_description",
        "currentlicense-500-title": "currentlicense_500_title",
        "currentlicense-500-description": "currentlicense_500_description",
        "currentlicense-unlimited-title": "currentlicense_unlimited_title",
        "currentlicense-unlimited-description": "currentlicense_unlimited_description",
        "changelicense-title": "changelicense_title",
        "changelicense-ad-title": "changelicense_ad_title",
        "changelicense-ad-description": "changelicense_ad_description",
        "changelicense-free-title": "changelicense_free_title",
        "changelicense-free-description": "changelicense_free_description",
        "changelicense-paid-title": "changelicense_paid_title",
        "changelicense-paid-description": "changelicense_paid_description",
        "enterlicense-title": "enterlicense_title",
        "enterlicense-description": "enterlicense_description",
        "enterlicense-label": "enterlicense_label",
        "licenseEnableAds": "changelicense_ad_button",
        "licenseDisableAds": "changelicense_free_button",
        "licenseBuy": "changelicense_paid_button",
        "validateEnteredLicenseKey": "enterlicense_button",
        "enterlicense-title": "enterlicense_title",
        "enterlicense-description": "enterlicense_description",
        "enterlicense-label": "enterlicense_label",
        "field_words_help": "field_words_help",
        "changelicense-ad-moreinfo": "changelicense_ad_moreinfo",
        "field_containerSelector": "field_containerSelector",
        "field_clearSyncLists": "field_clearSyncLists",
        "info_clearSyncLists": "info_clearSyncLists",
        "resetDataAndSettings": "resetDataAndSettings",
        "popup_confirmReset": "popup_confirmReset",
        "yesReset": "yesReset",
        "noReset": "noReset",
        "field_sendErrors": "field_sendErrors",
        "field_magicHighlighting": "magicHighlighting",
        "sendErrorsHelp": "sendErrorsHelp",
        "field_sendErrorsDescription": "field_sendErrorsDescription",
        "field_sendErrorsEmail": "field_sendErrorsEmail",
        "sendErrorsButton": "sendErrorsButton",
        "menu_sendErrors_label": "menu_sendErrors_label",
        "field_autoBackupSettings": "field_autoBackupSettings",
        "info_autoBackupSettings": "info_autoBackupSettings",
        "autoBackup_Never": "autoBackup_Never",
        "autoBackup_Daily": "autoBackup_Daily",
        "autoBackup_Weekly": "autoBackup_Weekly",
        "autoBackup_Monthly": "autoBackup_Monthly",
        "action_sametab": "action_sametab",
        "action_newwindow": "action_newwindow",
        "field_showOrHideEle":"field_AutoClick"
    }
    for (label in labelAssignments) {
        document.getElementById(label).innerHTML = chrome.i18n.getMessage(labelAssignments[label]);
    }
    const placeholderAssignments = {
        "filterwords": "filterwords",
        "filterwordlist": "filterwords"
    }
    for (label in placeholderAssignments) {
        document.getElementById(label).placeholder = chrome.i18n.getMessage(placeholderAssignments[label]);
    }
}

function getLiteral(literal) {
    //return 'yyy';
    return chrome.i18n.getMessage(literal);
}