$(document).ready(function(){

    function attachListeners(){
        $("#createMessage").submit(function(){
            $.ajax({
              type: "GET",
              url: "/createMessage",
              data: $('#createMessage').serialize(),
              success: function(data, textStatus, jqXHR) {
                alert('Message Sent!');
              }
            });
            return false;
        });
    }
    
    attachListeners();

});