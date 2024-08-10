var WordsSelectAll=true;
var RandomString="nv5oN52OYN2hGhQlsIL4QuetMdZk5gELIWiCD5uUXYjWeHi1GfxKjJ3nRLYSwV3x7V07wHcyNTXUK6uF81C2PDAGzd9xRNHp88DKnJmFFsfOkiSlPYaqP7JOUTNezmvWgcbcDlKqVXszEQ8hz61Zz7OvoQ09H2l33RsGaBRG2YgJUe4ba2VA6KIvynei3IgkPFDRJjQetNPWIyXe9q2ph3hbSDfVowmwPisl8nQo2MMGOGr7dwLKsGdkw0YOJtjsvchaUYGXhp1a4f4VzfCFRUCHaD9gkYYBb5joCcP9Q0Zl0CNrubl8FI8KQRBLuAWTaKyL76X8jywrrkFBVxfAYUlbeaAm0B7fLvMRbJr8vQAn6qtCgAr2ffO0ydL6VSiylinz14UBgfwJaecwvhA41RjJ2qgaVylive1ULvzZc0oRNmMIjX88epRxobuskWz8wwQJLa0q0lYj1kixn841MxLWwjLndX72n1n7jxkWzxTxsqXK62YZiafdYg4cNO0Ehdc5AUDDMXVKdfyRMpVBA81M3gBTfUf7YuE1qxnyMiwDsI0ocYmhHBbVfNyuR3ZblfUYEhb9eY2aw5Ib3LCD3qVVHCtfYAdfVdk75jIhyZw5eiM77u3SOeQLnO8e4SRKKbAw3AhyqerX8QptPHY4lPohp9yOyHKv9gGfxk7m1fTisFHNHBf7cT8vtXLgjM4GzUmeFQP8F13AoDDtLL9of2H5WvX97uNC2LNpPaatBd1WAOVEmr1AY7XDG9dldYSghp4eNx4XMT8tzeGj0C7zowaGJWGWgUOIhM5tecbIcNwHaW574xgTCp1FD5Ix6BPXiolcvJM8JdEMgxXPeXbOx6q7IZtvBJ9FZym2En8fqELR6BioMbjbrjCwyDUDGx2z5UTltmVpGPuY9Xqw3yDz9OxqukDll3wXvlTNqfabyf1oD9wHMukrlu32A4hLObmgXnCVxiCJawzuHds747t5VpoKLrcjo2cN2ozaDjau";
var WordCheckTimeout = null; 

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("words").addEventListener("paste", function(e) {
        e.preventDefault();
        if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
            document.getElementById("words").innerHTML='<div></div>'
        }
        var text = e.clipboardData.getData("text/plain");
        if (getBrowser()=="Firefox") {
            ensureOneParagraph();
            textArray=(text.split('\n')).replace(/^\s+|\s+$/gm, '');
            textArray.forEach(function(word){
                document.execCommand("insertParagraph", false, null);
                document.execCommand("insertText", false, word);
            });
        }
        else {
            document.execCommand("insertText", false, text);
        }
        hintNonUnicodeChar(editorToWords().join(''));
    });
    
    document.getElementById("words").addEventListener("drop", function(e) {
        e.preventDefault();

        if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
            document.getElementById("words").innerHTML='<div></div>'
        }
        var text = e.dataTransfer.getData("Text");
        document.execCommand("insertText", false, text);
        hintNonUnicodeChar(editorToWords().join(''));

    });

    document.getElementById("words").addEventListener("click", function(e) {
        if(e.x<35){
            WordsSelectAll=false;
            updateWordsSelectIcon();
            if(e.target.className=="") {
                e.target.className="checked";
            }
            else if (e.target.className="checked"){
                e.target.className="";
            }
        }
    });
    document.getElementById("wordsSelectBtn").addEventListener("click", function(e) {
        WordsSelectAll=!WordsSelectAll;
        e.preventDefault(); 
        document.querySelectorAll("#words div:not([hidden])").forEach(element => {
            element.className=WordsSelectAll?"":"checked";
        });
        updateWordsSelectIcon();
    });
    document.getElementById("wordsDelete").addEventListener('click', function(e){
        e.preventDefault();
        WordsSelectAll=true;
        updateWordsSelectIcon();
        document.querySelectorAll("#words div.checked:not([hidden])").forEach(function(el){el.remove()});
        ensureOneParagraph();
    });

    document.addEventListener('selectionchange',()=>{
        selection=window.getSelection();
     
        if(selection.rangeCount>0 && document.getElementById("filterwordlist").value!=='' && selection.getRangeAt(0).commonAncestorContainer.id=='words'){
            const range = selection.getRangeAt(0);

            // Check if the selection spans multiple blocks
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
        
            if (startContainer !== endContainer) {
              // The selection spans multiple blocks
        
              // Example action: Collapse the selection to the start
              selection.collapseToStart();
            }
        }
    });
   /* document.getElementById("wordsNotes").addEventListener('click', function(e){
        e.preventDefault();
        document.getElementById('words').style.display='none';
        document.getElementById('notesOnWords').style.display='block';
        document.getElementById('editorMenuDefault').style.display='none';
        document.getElementById('editorMenuDefaultNotes').style.display='table-cell';
        wordsToNotesEditor();

    });
    document.getElementById('wordsNotesBack').addEventListener('click', function(e){
        e.preventDefault();
        document.getElementById('words').style.display='block';
        document.getElementById('notesOnWords').style.display='none';
        document.getElementById('editorMenuDefault').style.display='table-cell';
        document.getElementById('editorMenuDefaultNotes').style.display='none';
    })*/
    document.getElementById("wordsMove").addEventListener('click', function(e){
        e.preventDefault();
 
        //build menu
        groups=HighlightsData;
        var menuHtml='';
        for(var group in groups){
            if(group!=document.getElementById("editWordsGroupId").value)
            menuHtml+='<li groupId="'+group+'">'+groups[group].name+'</li>';
        }
        
        document.getElementById("wordsMoveMenuList").innerHTML=menuHtml;
        document.getElementById("wordsMoveMenu").style.display='block';

    });
    document.getElementById("wordsMoveMenuList").addEventListener('click', function(e){
        WordsSelectAll=true;
        updateWordsSelectIcon();
        //console.log('clicked on '+e.target.getAttribute('groupName')        );
        var words=[];
        document.querySelectorAll("#words div.checked:not([hidden])").forEach(function(el){words.push(el.innerText)})

        console.log ('move ', words, ' from ', document.getElementById("editWordsGroupId").value,' to ',e.target.getAttribute('groupId'))
        moveWords(words, document.getElementById("editWordsGroupId").value, e.target.getAttribute('groupId'))

        document.getElementById("wordsMoveMenu").style.display='none';

    });


    document.getElementById('wordsMoveContainer').addEventListener('mouseleave',function(){

        document.getElementById("wordsMoveMenu").style.display='none';

    });
    document.getElementById('searchicon').addEventListener('click',(e)=>{e.preventDefault()})
    document.getElementById("wordsSortAsc").addEventListener('click', function(e){
        sortWordList('#words div', true);
        e.preventDefault();
    });
    document.getElementById("wordsSortDesc").addEventListener('click', function(e){
        sortWordList('#words div', false);
        e.preventDefault();
    })
    document.getElementById("filterwordlist").addEventListener('input',function(){filterWordList(this.value)});

    document.getElementById("words").addEventListener("keydown", function(e) {
        //console.log(e.target.innerHTML);

        ensureOneParagraph();
        hintNonUnicodeChar(editorToWords().join(''));

    });
   
    document.getElementById("words").addEventListener("input",function(e){
        
        validateWords();


    })
    document.getElementById("words").addEventListener("focusout", function(e) {
        //validateWords();
    });

});

function ensureOneParagraph(){
    if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
        document.getElementById("words").innerHTML='<div></div>'

    }
}
function updateWordsSelectIcon(){
    if(!WordsSelectAll){
        document.getElementById('WordsSelectIcon').textContent='check_box';
        document.getElementById("wordsMove").disabled=true;

    }
    else {
        document.getElementById('WordsSelectIcon').textContent='check_box_outline_blank';
        document.getElementById("wordsMove").disabled=false;

    }
}

function wordsToNotesEditor(){
    words= editorToWords();
    var wordsNotesText='';
    for (var word in words){
        wordsNotesText+='<div><h3>'+words[word]+'</h3><textarea style="width: 90%; margin-left: 5px; resize: none;"></textarea></div>'

    }
    document.getElementById('notesOnWords').innerHTML=wordsNotesText;
}
function wordsToEditor(words){

    //.replace(/</g,"&lt;")
    if(words){
        words=words.map(function(x){ return x.replace(/</g,"&lt;") });
        wordsText='<div>'+words.join('</div><div>')+'</div>';
    }
    else {
        wordsText='<div></div>';
    }
    try{
        var displayMovebtn=false;
        //groups=chrome.extension.getBackgroundPage().getGroupsForMoveOrCopy();
        /*for(var group in groups){
            if(groups[group][0]!=document.getElementById("editWordsGroupName").value)
                displayMovebtn=true;
        }
        displayMovebtn>0?(document.getElementById("wordsMove").style.display='block'):(document.getElementById("wordsMove").style.display='none');

        document.getElementById("wordsMove").disabled=true;
        */
        WordsSelectAll=true;
        updateWordsSelectIcon();
    }
    catch(e) {
        console.log('issue occured when initializing the word editor' , e)
    }
    document.execCommand('defaultParagraphSeparator', false, 'p');

    document.getElementById("words").innerHTML = wordsText;
}

function editorToWords1(){
    var words=[];
    if (document.getElementById("words").childNodes[0]&&document.getElementById("words").childNodes[0].textContent.trim()!=''){
        words.push(document.getElementById("words").childNodes[0].textContent);
    }
    document.querySelectorAll("#words div").forEach(function(el){
        var word=el.innerText;
        if(word.trim()!==''&&words.indexOf(word)==-1){
            words.push(word);
        }
    });
    return words;
}

function editorToWords() {  
    var words = new Set(); // 使用 Set 来自动去重  
    // 处理 id 为 "words" 的元素（假设它是直接的文本节点或只有一个文本子节点）  
    var wordsElement = document.getElementById("words");  
    if (document.getElementById("words").childNodes[0]&&document.getElementById("words").childNodes[0].textContent.trim()!=''){  
        words.add((document.getElementById("words").childNodes[0].textContent).replace(/^\s+|\s+$/g, '')); // 使用 trim 去除前导和尾随空格  
    }  
    // 处理 id 为 "words" 的元素下的所有 <div> 子元素  
    document.querySelectorAll("#words div").forEach(function(el) {  
        var word = el.textContent.trim(); // 使用 textContent 和 trim  
        if (word !== '') {  
            words.add(word); // Set 会自动处理重复项  
        }  
    });  
    // 将 Set 转换回数组并返回  
    return Array.from(words);  
}

function filterWordList(infilter){
    //wordListContainer
    var searchExp=new RegExp(infilter,'gi');
    WordsSelectAll=true;
    updateWordsSelectIcon();
    document.getElementById("words").childNodes.forEach(element => {
        if(element.innerText.match(searchExp)){
            element.hidden=false;
        }
        else {
            element.hidden=true;
        }
    });
}

function sortWordList(s, asc) {
    Array.prototype.slice.call(document.body.querySelectorAll(s)).sort(function sort (ea, eb) {
        var a = ea.textContent.trim();
        var b = eb.textContent.trim();
        if (a < b) return asc?-1:1;
        if (a > b) return asc?1:-1;
        return 0;
    }).forEach(function(div) {
        div.parentElement.appendChild(div);
    });
}

function validateWords(){
    //Disable the submit button to allow for validation checks
    document.getElementById("formSubmitButton").disabled=true;

    if (document.getElementById("regexTokens").checked){
        clearTimeout(WordCheckTimeout);
        WordCheckTimeout = setTimeout(function () {
            validateWordRegexes(function(valid,reasons){
                validationWordsRender(valid, reasons);
            });
        }, 500);
    }
    else {
        if(document.getElementById("field_storage").value=='sync' && !acceptedLengthForSyncStorage()){
            validationWordsRender(false, [getLiteral("wordlist_too_long_for_sync_storage")]);
        }
        else {
            validationWordsRender(true, [])
        }
    }        
}

function validationWordsRender(valid, reasons){

    if(valid){
        document.getElementById("validationErrors").style.display='none';
        document.getElementById("formSubmitButton").disabled=false;
        document.querySelectorAll("#words div").forEach(function(el){el.style.color='black'});
    }
    else {
        document.getElementById("validationErrors").style.display='block';
        document.getElementById("validationErrors").innerHTML=reasons.join(",");
        document.getElementById("formSubmitButton").disabled=true;
    }
}

function validateWordRegexes(callback){
    var response=true
    var reasons=[];
    document.querySelectorAll("#words div").forEach(function(el){
        valid=validateWordRegex(el.innerText);
        if (valid.result){
            el.style.color='black';
        }
        else{
            el.style.color='red';
            if (reasons.indexOf(valid.reason) === -1) reasons.push(valid.reason);
            response=false;
        }
    })
    
    callback(response, reasons);
}

function validateWordRegex(word){
    try {
        var testRegex=new RegExp(word,"gi");
        if(RandomString.match(testRegex)&&RandomString.match(testRegex).length>50){
            return {result:false, reason:getLiteral("regex_too_many_matches")};
        }
        return {result:true};
    }
    catch {
        return {result:false, reason:getLiteral("regex_invalid")};;
    }
    


}

