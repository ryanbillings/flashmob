$(document).ready(function(){

    function attachListeners(){
        $("#changeLink").click(function(){
            $("#changeDiv").slideDown();
        });
        $("#changeRadius").change(function(){
            var radius = $("#changeRadius").val();
            $.ajax({
                url: "/refreshevents/" + radius,
                dataType: 'json',
                success: function(response){
                    renderEvents(response);
                }
            });
        });
    }
    
    function renderEvents(response){
        clearOverlays();
        markerArray = [];
        var bounds = new google.maps.LatLngBounds ();
        $("#eventList").html("");
        for(var i = 0; i < response.length; i++){
            var newEvent = response[i];
            var latLng = new google.maps.LatLng(newEvent.latitude,
                                                 newEvent.longitude);
            var marker = new google.maps.Marker({
                position: latLng,
                title: newEvent.name
            });
            marker.setMap(map);
            markerArray.push(marker);
            bounds.extend(latLng);
            var newDiv = document.createElement("div");
            var newEvtLink = document.createElement("a");
            newEvtLink.innerHTML = newEvent.name;
            $(newEvtLink).attr("href","/event/" + newEvent._id);
            $(newDiv).append(newEvtLink);
            $("#eventList").append(newDiv);
        }
        map.fitBounds (bounds);
    }
    
    function clearOverlays() {
      for (var i = 0; i < markerArray.length; i++ ) {
        markerArray[i].setMap(null);
      }
    }
    
    attachListeners();
});