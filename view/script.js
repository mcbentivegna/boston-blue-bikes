$('#show-more').click( () => {
	if ($(".hidden").css("display") == "table-row"){
			$(".hidden").css("display", "none");
		}
	else if ($(".hidden").css("display") == "none"){
			$(".hidden").css("display", "table-row");
		}	
		
})

