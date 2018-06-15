
function chatUpdate(parent, maxEntries) {

	if($(parent + ' div').length>maxEntries){    //max 50 messages to be shown
  				$(parent +  ' div').first().remove();
  			}

      $(parent).scrollTop($(parent)[0].scrollHeight);
}