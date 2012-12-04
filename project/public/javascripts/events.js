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
            fitToMarkers(markerArray);
            //bounds.extend(latLng);
            var evtContain = document.createElement("div");
            var newDiv = document.createElement("div");
            var newEvtLink = document.createElement("a");
            newEvtLink.innerHTML = newEvent.name;
            newEvtLink.className = "eventName";
            var evtDate = document.createElement("div");
            evtDate.className = "eventDate";
            newEvent.start_time = new Date(newEvent.start_time);
            evtDate.innerHTML = (newEvent.start_time.getMonth()+1) + "/" + newEvent.start_time.getDay()
                        + "/" + newEvent.start_time.getFullYear();
            var evtDesc = document.createElement("div");
            evtDesc.className = "eventDescription";
            evtDesc.innerHTML = newEvent.description;
            $(newEvtLink).attr("href","/event/" + newEvent._id);
            $(newDiv).append(newEvtLink);
            $(evtContain).append(newDiv).append(evtDate).append(evtDesc);
            $("#eventList").append(evtContain);
        }
        //map.fitBounds (bounds);
    }
    
        // Pan & Zoom map to show all markers
    function fitToMarkers(markers) {

        var bounds = new google.maps.LatLngBounds();

        // Create bounds from markers
        for( var index in markers ) {
            var latlng = markers[index].getPosition();
            bounds.extend(latlng);
        }

        // Don't zoom in too far on only one marker
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
           var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
           var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
           bounds.extend(extendPoint1);
           bounds.extend(extendPoint2);
        }

        map.fitBounds(bounds);

        // Adjusting zoom here doesn't work :/

    }
    
    function clearOverlays() {
      for (var i = 0; i < markerArray.length; i++ ) {
        markerArray[i].setMap(null);
      }
    }
    
    attachListeners();
});