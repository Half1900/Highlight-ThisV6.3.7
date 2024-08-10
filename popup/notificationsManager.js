var notyf = new Notyf({
    position: {
        x: 'center',
        y: 'center'
    },
    types: [{
        type: 'warning',
        background: 'orange'
    }, {
        type: 'error',
        background: 'indianred',
        dismissible: true
    }, {
        type: 'success',
        background: '#e00bc4'
    }]
});
var notify = {
    restoreCompleted: function() {
        notyf.success(getLiteral("notif_restoreComplete"))
    },
    restoring: function() {
        notyf.success(getLiteral("notif_restoring"))
    }, 
    groupName:function(){
        notyf.success("列表名不能为空");
    },   
    listSaved: function(listname) {
        notyf.success(formatString(getLiteral("notif_listSaved"), listname))
    },
    listNotSaved: function(listname, errorText) {
        notyf.error(formatString('list not saved {0}<p>{1}</p>', listname, errorText))
    },
    listDeleted: function(listname) {
        notyf.success(formatString(getLiteral("notif_listDeleted"), listname))
    },
    listDisabled: function(listname) {
        notyf.success(formatString(getLiteral("notif_listDisabled"), listname))
    },
    listEnabled: function(listname) {
        notyf.success(formatString(getLiteral("notif_listEnabled"), listname))
    },
    highlightingDisabled: function() {
        notyf.success(formatString(getLiteral("notif_allDisabled")))
    },
    highlightingEnabled: function() {
        notyf.success(formatString(getLiteral("notif_allEnabled")))
    },
    settingsSaved: function() {
        notyf.success(formatString(getLiteral("notif_settingsSaved")))
    },
    backupCompleted: function() {
        notyf.success(formatString(getLiteral("notif_backupDone")))
    },
    licenseChangedFree: function() {
        notyf.success(formatString(getLiteral("notif_licenseAdfree")))
    },
    licenseChangedAd: function() {
        notyf.success(formatString(getLiteral("notif_licenseAd")))
    },
    licenseChangedPaid: function(product, validUntil) {
        notyf.success(formatString(getLiteral("notif_licensePaid"), product))
    },
    licenseGenarate: function(value) {
        notyf.success(formatString(value))
    },    
    bugReportSent: function(product, validUntil) {
        notyf.success(formatString(getLiteral("notif_bugReportSent"), product))
    }
}