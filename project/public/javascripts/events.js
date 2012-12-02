$(document).ready(function(){

    function attachListeners(){
        $("#changeLink").click(function(){
            $("#changeDiv").slideDown();
        });
    }
    
    attachListeners();
});