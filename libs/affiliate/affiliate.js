// here we inject our affiliate tag in links to Amazon

var tags={
    "amazon.com": "hilite05-20",
    "amazon.de": "hilitede-21",
    "amazon.fr": "hilitede0b-21",
    
}

function addAffiliateTags(){
    var activateCheck=new RegExp();
    activateCheck=/(google)/gi;
    
    var taggableHosts=new RegExp();
    taggableHosts = /(amazon.com)\//gi;
    
    
    if (document.location.hostname.match(activateCheck)){
        console.log('search for supported links and add tag');
        $('a').each(function(link) {
            if($(this).attr('href')){
                console.log($( this).attr('href') );
                if($(this).attr('href').indexOf('amazon.com')>-1){
                    // add the tag
                    $(this).attr('href',addAmazonTag($(this).attr('href')));
                }
            }

        })
    }
}


function addAmazonTag(link){
    if(link.indexOf('?')>-1){
        link+='&tag='+tags["amazon.com"]
    }
    else
    {   
        link+='?tag='+tags["amazon.com"]
    }
    return link;
}




