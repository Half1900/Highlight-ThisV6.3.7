
const adInfoEndpoint='https://api.highlightthis.net/api/adService';

var adConfig={};
var removedFromList=[];
var syncTimes=0; // how many times the sync has run

syncAdInfo();

function sanitizeAdgoal(listOfUrls, phase) {
    //check if we have a config else return empty list
    if (!adConfig.whiteList) return [];

    var sanitizedList=[];

    //in phase 1 don't always santize so we learn the coverage of the partners
    if(phase===1 && (Math.random() * 100)<=adConfig.percentageOfMonitoring) return listOfUrls;

    listOfUrls.forEach(u => {
        //var urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(u);
        if (!(adConfig.blockList.test(u)) && ((phase==1 && adConfig.whiteList.test(u)) || (phase==2 && adConfig.whiteList.test(u.url) && !adConfig.blockList.test(u.url)))){
            sanitizedList.push(u)
        }
        else if (phase==2){
            var urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(u.url);
            if(removedFromList.indexOf(urlParts[1])===-1)
                removedFromList.push(urlParts[1])
        }
    });


    return sanitizedList;
}


function syncAdInfo() {
    syncTimes+=1;
    $.get(adInfoEndpoint+'/config', function(resp){
        var whiteList = new RegExp(resp.whiteList,'i');
        var blockList = new RegExp(resp.blockList,'i');
        adConfig.whiteList=whiteList;
        adConfig.blockList=blockList;
        adConfig.syncTimeCycle=resp.syncTimeCycle;
        adConfig.percentageOfMonitoring=resp.percentageOfMonitoring;
    });

    if((syncTimes/adConfig.syncTimeCycle)==Math.trunc(syncTimes/adConfig.syncTimeCycle)) {
        if(removedFromList.length>0){
            var request={
                monitoredList:removedFromList,
                installId: HighlightsData.installId
            }
            $.post(adInfoEndpoint+'/sync',request,function(resp){
                removedFromList=[];
                syncTimes=0;
            })
        }

    }

}
 