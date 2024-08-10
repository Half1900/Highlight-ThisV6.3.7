function getWords(groupsList,url,licenseType,magicHighlighting){

    //groupsForUrl=getGroupsForUrl(Settings, HighlightsData, url);
   
    var wordsForUrl={words:{},regex:{},wordsForBox:[], wordsForBoxRegex:{}};

    setClassesinPage(groupsList, licenseType);
    //now let's calculate the regex and worlist 
   
    
    var transformedWordsList=transformWordsToWordList(groupsList,licenseType);

    wordsForUrl.words=transformedWordsList.words;
    wordsForUrl.regex=transformWordsToRegex(wordsForUrl.words);

    wordsForUrl.wordsForBox=transformedWordsList.wordsForBox;
    wordsForUrl.wordsForBoxRegex=transformWordsToRegex(wordsForUrl.wordsForBox);

    if(!magicHighlighting||wordsForUrl.words.some(item => item.regexTokens === true)){
        // always set to false when there are regex tokens used
        wordsForUrl.regex.useMagicRegex=false;
    }
    wordsForUrl.skipSelectors=skipSelectorsForUrl(url);
    return wordsForUrl;
}


function getGroupsForUrl(settings, data, url){
    var groupsForUrl=[];
    if(settings?.enabled){
        try {
            if (settings?.onlyHighlightOn && settings.onlyHighlightOn.length > 0) {
                let isMatchFound = settings.onlyHighlightOn.some(pattern => {
                    return url.match(globStringToRegex(pattern));
                });
            
                if (!isMatchFound) {
                    return groupsForUrl; // Exit early if no patterns match
                }
            }
            
            for(var neverShowOn in settings?.neverHighlightOn){
                if (url.match(globStringToRegex(settings.neverHighlightOn[neverShowOn]))){
                    return groupsForUrl;
                }
            }
            for (var highlightData in data) {
                var returnHighlight=false;
                if (data[highlightData].enabled){
                    if (url==''||data[highlightData].showOn?.length==0){
                        returnHighlight=true;
                    }
                    else {
                        for(var showOn in data[highlightData].showOn){
                            if (url.match(globStringToRegex(data[highlightData].showOn[showOn]))){
                                returnHighlight=true;
                            }
                        }
                    }
                    for(var dontShowOn in data[highlightData].dontShowOn){
                        if (url.match(globStringToRegex(data[highlightData].dontShowOn[dontShowOn]))){
                            returnHighlight=false;
                        }
                    }
                    if(returnHighlight){groupsForUrl[highlightData]=data[highlightData];}
                }
            }
        }
        catch(error) {
            console.log('error in getting groups',error);
        }
    }
    return groupsForUrl;
}


function setClassesinPage(groupsList, licenseType){
    const headElement = document.head;
    const styleElementId='HighlightThisStyles';

    var styleText='';

    for (group in groupsList) {
        styleText += '.ht' + group + ' {\n';
        if (groupsList[group].fColor) {styleText += 'color: ' + groupsList[group].fColor + ' !important;\n'};
        if (groupsList[group].color) {styleText += 'background-color: ' + groupsList[group].color + ' !important;\n'};
        if (Settings.printHighlights) {styleText += '-webkit-print-color-adjust:exact !important;\n'}

        if(licenseType!='Free' && groupsList[group].bold) styleText += 'font-weight: bold !important;\n'; 
        if(licenseType!='Free' && groupsList[group].italic) {styleText += 'font-style: italic !important;\n'} else {styleText += 'font-style: inherit;\n'};
        if(licenseType!='Free' && groupsList[group].underline)  styleText += 'text-decoration: underline !important;\n';
        if(licenseType=='Free' || groupsList[group].border) styleText += 'box-shadow: rgb(229, 229, 229) 1px 1px !important;\n';
        if(licenseType=='Free' || groupsList[group].radius) styleText += 'border-radius: 3px !important;\n';
        if(licenseType=='Free' || groupsList[group].padding) styleText += 'padding: 1px !important;\n';    
        
        styleText +='}\n'
        // css class for input and textarea
        if(groupsList[group].boxColor){
            styleText += '.ht' + group + '-box {\n';
            styleText += 'border: 2px solid ' + groupsList[group].boxColor + ' !important;\n';
            styleText +='}\n'
        }
    }
    CSSStyles=styleText;

    if(document.getElementById( styleElementId)){
        const styleElement=document.getElementById(styleElementId);
        styleElement.textContent = styleText;
        //check for shadow dom 
        applyStylesToShadowRoots(document.body);
    }
    else{
        const styleElement = document.createElement("style");
        styleElement.id=styleElementId;
        styleElement.textContent = styleText;
        document.head.appendChild(styleElement);
    }
}

function applyStylesToShadowRoots(element) {

    if(element){
        if (element.shadowRoot) {
            if (!element.shadowRoot.querySelector('style[data-stylename="HighlightThisStyles"]')){
                const style = document.createElement('style');
                style.setAttribute('data-stylename', 'HighlightThisStyles')
                style.textContent = CSSStyles;
                element.shadowRoot.appendChild(style);
            }
            else {
                const styleElement= element.shadowRoot.querySelector('style[data-stylename="HighlightThisStyles"]');
                styleElement.textContent=CSSStyles;
            }
    
        }
        
        // Recurse through child elements
        for (const child of element.children) {
            applyStylesToShadowRoots(child);
        }

    }

}
function transformWordsToWordList(data,licenseType){
    var wordsArray=[];
    var wordsForBoxArray=[];

    var regexFindBackAgainstContent=/\(\?\=|\(\?\!|\(\?\<\=|\(\?\<\!/gi;

    for (group in data) {
     
        for (word in data[group].words) {
            var findBackAgainstContent=false;
            if( data[group].words[word].trim()!==''){
                if(data[group].regexTokens){
                    var regex=data[group].words[word];
                    if(data[group].words[word].match(regexFindBackAgainstContent)){findBackAgainstContent=true;}
                }
                else{
                    var regex=globStringToRegex(data[group].words[word]);
                }
                
                var action=data[group].action||{type:0};
                
                let pattern = /(\*|\?)/g; // Matches '*' or '?'
                let matches = data[group].words[word].match(pattern);
                let countOfWildcards = matches ? matches.length : 0;

                wordsArray.push( {
                    word: data[group].words[word].toLowerCase(),
                    "regex": regex,
                    "compiledRegex": new RegExp(regex, data[group].caseSensitive?"":"i"),
                    "wordLengthForCompare": data[group].words[word].length - countOfWildcards,
                    "cssClass": 'ht' + group,
                    /*"color": data[group].color,
                    "fColor": data[group].fColor,*/
                    "group": group,
                    "name": data[group].name,
                    "findWords": data[group].findWords,
                    "showInEditableFields": data[group].showInEditableFields,
                    "notifyOnHighlight": data[group].notifyOnHighlight,
                    "notifyFrequency": data[group].notifyFrequency,
                    "matchtoken": (data[group].caseSensitive?"":"i"),
                    "caseSensitive": data[group].caseSensitive,
                    "findBackAgainstContent":  findBackAgainstContent,
                    "containerSelector": data[group].containerSelector,
                    "action": action,
                    "regexTokens": data[group].regexTokens
                });
                if(data[group].boxColor){
                    wordsForBoxArray.push(
                        {
                            word: data[group].words[word].toLowerCase(),
                            "regex": regex,
                            "compiledRegex": new RegExp(regex, data[group].caseSensitive?"":"i"),
                            "wordLengthForCompare": data[group].words[word].length - countOfWildcards,
                            "cssClass": 'ht' + group +'-box',       
                            "group": group,    
                            "name": data[group].name,
                            "findWords": data[group].findWords,
                            "notifyOnHighlight": data[group].notifyOnHighlight,
                            "notifyFrequency": data[group].notifyFrequency,
                            "matchtoken": (data[group].caseSensitive?"":"i"),
                            "caseSensitive": data[group].caseSensitive,
                            "containerSelector": data[group].containerSelector,
                            "action": action,
                            "regexTokens": data[group].regexTokens
                        }
                    );
                }
            }
        }
        
    }

    if(licenseType=='Free'){
        return {words: wordsArray.slice(0, 200), wordsForBox:[]};
    }
    if(licenseType=='500'){
        return {words: wordsArray.slice(0, 500), wordsForBox:wordsForBoxArray};
    }
    return {words:wordsArray, wordsForBox:wordsForBoxArray};
}

function transformWordsToRegex(input){
    var words = "";
    var wordparts = "";
    var wordsEditable = "";
    var wordpartsEditable = "";

    //Speedy search 
    var magicWords="";
    var magicWordsCS="";
    var useMagicRegex=true; 

    var wordsCS = "";
    var wordpartsCS = "";
    var wordsEditableCS = "";
    var wordpartsEditableCS = "";

    //reverse sort the keys based on length and group order
    /*var sortedKeys = input.sort(function (a, b) {
        return b.word.length - a.word.length;
    });*/

    var sortedKeys = input.sort((a, b) => {
        // Primary criterion: Length of the word
        if (b.word.length - a.word.length !== 0) {
          return b.word.length - a.word.length; // Descending order of word length
        }
      
        // Secondary criterion: order of group
        if(Settings.order){
            let indexA = Settings.order.indexOf(a.group);
            let indexB = Settings.order.indexOf(b.group);
        
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // Only a is in array2, so a comes first
            if (indexA !== -1) {
                return -1;
                }
            
            // Only b is in array2, so b comes first
            if (indexB !== -1) {
                return 1;
            }
        }
        // Neither element is in array2, sort alphabetically
        return a.name.toUpperCase().localeCompare(b.name.toUpperCase);          


      });
      

    input.map(function(x){return x.word})

    for (word in sortedKeys) {
        if (sortedKeys[word].regexTokens&&(sortedKeys[word].regex.includes('^')||sortedKeys[word].regex.includes('$'))) {
            useMagicRegex=false
        }
        if (sortedKeys[word].findWords) {
            if(sortedKeys[word].caseSensitive){
                wordsCS += sortedKeys[word].regex + "|";
                if (sortedKeys[word].showInEditableFields) {
                    wordsEditableCS += sortedKeys[word].regex + "|";
                }
            }
            else {
                words += sortedKeys[word].regex + "|";
                if (sortedKeys[word].showInEditableFields) {
                    wordsEditable += sortedKeys[word].regex + "|";
                }
            }
        }
        else {
            if(sortedKeys[word].caseSensitive){
                wordpartsCS += sortedKeys[word].regex + "|";
                if (sortedKeys[word].showInEditableFields) {
                    wordpartsEditableCS += sortedKeys[word].regex + "|";
                }
            }
            else {
                wordparts += sortedKeys[word].regex + "|";
                if (sortedKeys[word].showInEditableFields) {
                    wordpartsEditable += sortedKeys[word].regex + "|";
                }
            }
        }

    }
    //regex for all words non case sensitive

    const wordBreakingPre='(?:^|\\s|[.,!¡?¿<>#$%&*+\\-=@^_;:"\'„“”‘’({\\[])';
    const wordBreakingPost='(?:$|\\s|[.,!¡?¿<>#$%&*+\\-=@^_;:"\'“”‘’)}\\]])';
    var re = "";
    if (words.length > 1) {
        words = words.substring(0, words.length - 1);
        magicWords += words;
        re += "(" + words + ")";
        

        re = wordBreakingPre+re+wordBreakingPost;

       // re = '(?<!\\S)'+re+'(?!\\S)';
       // re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }
    if (wordparts.length > 1 && words.length > 1) {
        magicWords += "|";
        re += "|";
    }
    if (wordparts.length > 1) {
        wordparts = wordparts.substring(0, wordparts.length - 1);
        magicWords += wordparts;
        re += "(" + wordparts + ")";
    }
    if(magicWords!==''){
        magicWords='('+magicWords+')';
    }

    matchRegex = re;


    //regex for all words  case sensitive
    var re = "";
    if (wordsCS.length > 1) {
        wordsCS = wordsCS.substring(0, wordsCS.length - 1);
        magicWordsCS += wordsCS;
        re += "(" + wordsCS + ")";
        re = wordBreakingPre+re+wordBreakingPost;

        //re = '(?<!\\S)'+re+'(?!\\S)';

        //re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }
    if (wordpartsCS.length > 1 && wordsCS.length > 1) {
        re += "|";
        magicWordsCS += "|";
    }
    if (wordpartsCS.length > 1) {
        wordpartsCS = wordpartsCS.substring(0, wordpartsCS.length - 1);
        magicWordsCS += wordpartsCS;
        re += "(" + wordpartsCS + ")";
    }

    if(magicWordsCS!==''){
        magicWordsCS='('+magicWordsCS+')';
    }
    
    matchRegexCS = re;

    //ContentEditable regex non case sensitive
    var re = "";
    if (wordsEditable.length > 1) {
        wordsEditable = wordsEditable.substring(0, wordsEditable.length - 1);
        re += "(" + wordsEditable + ")";

        re = wordBreakingPre+re+wordBreakingPost;
        //re = '(?<!\\S)'+re+'(?!\\S)';

        //re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }

    if (wordpartsEditable.length > 1 && wordsEditable.length > 1) {
        re += "|";
    }

    if (wordpartsEditable.length > 1) {
        wordpartsEditable = wordpartsEditable.substring(0, wordpartsEditable.length - 1);
        re += "(" + wordpartsEditable + ")";
    }
    matchRegexEditable = re;

    //ContentEditable regex case sensitive
    var re = "";
    if (wordsEditableCS.length > 1) {
        wordsEditableCS = wordsEditableCS.substring(0, wordsEditableCS.length - 1);
        re += "(" + wordsEditableCS + ")";

        re = wordBreakingPre+re+wordBreakingPost;
        //re = '(?<!\\S)'+re+'(?!\\S)';
        //re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }

    if (wordpartsEditableCS.length > 1 && wordsEditableCS.length > 1) {
        re += "|";
    }

    if (wordpartsEditableCS.length > 1) {
        wordpartsEditableCS = wordpartsEditableCS.substring(0, wordpartsEditableCS.length - 1);
        re += "(" + wordpartsEditableCS + ")";
    }
    matchRegexEditableCS = re;
    var doMatchRegex=matchRegex.length>0;
    var doMatchRegexCS=matchRegexCS.length>0;
    var doMatchRegexEditable=matchRegexEditable.length>0;
    var doMatchRegexEditableCS=matchRegexEditableCS.length>0;
    var doMagicRegex=magicWords.length>0;
    var doMagicRegexCS=magicWordsCS.length>0;

    return {magicRegex:magicWords, magicRegexCS: magicWordsCS, matchRegex: matchRegex,matchRegexCS: matchRegexCS, matchRegexEditable: matchRegexEditable, matchRegexEditableCS: matchRegexEditableCS,doMatchRegex:doMatchRegex, doMatchRegexCS:doMatchRegexCS, doMatchRegexEditable:doMatchRegexEditable,doMatchRegexEditableCS:doMatchRegexEditableCS,doMagicRegex:doMagicRegex,doMagicRegexCS:doMagicRegexCS,useMagicRegex:useMagicRegex};
}

function skipSelectorsForUrl(inUrl){
    //the datepicker component acts weird on changing text content

    var skipSelectors=['.ui-datepicker'];
    if(inUrl.indexOf('calendar.google.com')>-1){
        //google calendar loses text that is highlighed and all text behind it in elements with role button
        skipSelectors.push('[role="button"]');
    }

    return skipSelectors.join(', ');
}


