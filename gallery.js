(function(){
    var GALLERY_WIDTH = 10,
        GALLERY_HEIGHT = 5,
        DISPLAY_WIDTH = 8,
        DISPLAY_HEIGHT = 4;

    var Check = false;

    var Gallery = $("#gallery"),
        Wrapper = $("#gallery-wrapper");
    Wrapper[0].style.height = "calc(" + DISPLAY_HEIGHT + " * 100vw / " + DISPLAY_WIDTH + " )";
    var Data;
    $.ajax({
        url: "data.json",
    }).success(function(response){
        Data = response;
        makeGallery();
        return true;
    });

    function makeGallery() {
        function dateformat(activity_at)
        {
            var date = new Date();
            var milliseconds = date.getTime();
            var currenttime = Math.round(milliseconds / 1000);
            var unixtime = (activity_at)/1000;
            var a = new Date(unixtime*1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
            var sec = a.getSeconds();
            var post_time = date + '-' + month ;
            var diff=currenttime-unixtime;
            if(diff > 86400)
            {
                return 'Posted on '+post_time;
            }
            else if(diff < 86400)
            {
                var numhours = Math.floor((diff % 86400) / 3600);
                var numminutes = Math.floor(((diff % 86400) % 3600) / 60);
                if(numhours >0)
                {
                    if(numhours == 1)
                        return 'Posted '+numhours+' hour ago';
                    else
                        return 'Posted '+numhours+' hours ago';
                }
                else
                if(numminutes==0)
                    return 'Posted 1 minute ago';
                else
                    return 'Posted '+numminutes+' minutes ago';

            }
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        for (var h = 0; h < GALLERY_HEIGHT; ++h) {
            var newLine = document.createElement("li");
            Gallery.append(newLine);
            for (var w = 0; w < GALLERY_WIDTH; ++w) {
                var index = (w + h * GALLERY_WIDTH) % Data.length;
                var newBox = document.createElement("li");
                newBox.innerHTML = "<img src = " + Data[index].post_image + " data-id='" + index + "'>";
                //Gallery.append(newBox);
                newLine.appendChild(newBox);
            }
        }

        var Boxes = $("#gallery > li > li").addClass("gallery-box");

        /*Boxes.on('click', function() {
            createModal(this);
        });*/

        function createModal(elem){
            var id = elem.children[0].getAttribute("data-id"), H;
            var Modal = $("#gallery-modal");
            Modal[0].style.width = "300px";
            Modal[0].style.height = "auto";
            if (Data[id].video_link == ""){
                var content = $("#gallery-img");
                content[0].setAttribute("src", Data[id].post_image);
                content.addClass("visible");
                content.removeClass("hidden");

            }
            else {
                var content = $("#gallery-video");
                content[0].setAttribute("src", Data[id].video_link);
                content.addClass("visible");
                content.removeClass("hidden");
                //content[0].play();
                content[0].onended = function() {
                    closeModal();
                };
            }
            textBox = $("#gallery-text");//.text(Data[id].username + "\n" + Data[id].message);
            textBox.html("<div class='userphoto'><img class='profile_photo' src='" + Data[id].profile_pic_url + "'>" +
                "<div class='username'>" + Data[id].username + "</div>" +
                "<div class='posted'>" + dateformat(parseInt(Data[id].activity_at)) + "</div>" +
                "</div>" +
                "<div class='message'>" + Data[id].message + "</div>");
            //textBox.text = Data[id].message;
            console.log(Data[id].message);
            var bound = elem.getBoundingClientRect();
            Modal[0].style.top = parseInt( (bound.top + bound.bottom) / 2) + 'px';
            Modal[0].style.left = parseInt( (bound.left + bound.right) / 2)  + 'px';
            $('#gallery-overlay').fadeIn(400, function(){
                Modal[0].style.width = "500px";
                Modal[0].style.height = "500px";
                Modal.css('display', 'block')
                    .animate({}, 0, function() {
                        if (Data[id].video_link == "")
                            var bo = $("#gallery-img")[0].getBoundingClientRect();
                        else
                            var bo = $("#gallery-video")[0].getBoundingClientRect();
                        H = bo.height;
                        Modal[0].style.width = "0px";
                        Modal[0].style.height = "0px";
                        Modal.animate({opacity: 1, top: "10%", left: "10%", width: "500px", height: H + "px"}, 1000, function() {
                            textBox = $("#gallery-text").css('display', 'block').animate({opacity: 1}, 500);
                            console.log((Modal[0].style.height.substring(0, Modal[0].style.height.length - 2)).toString());
                            //textBox[0].style.maxHeight = (Modal[0].style.height.substring(0, Modal[0].style.height.length - 2)).toString() + "px";
                            if (Data[id].video_link != "") {
                                content[0].play();
                            }
                            else {
                                setTimeout(closeModal, 5000);
                            }
                        });
                    })

            });
        };

        function closeModal() {
            var Modal = $("#gallery-modal");
            var video = $("#gallery-video")
            if (!video.paused) {
                video[0].pause();
            }
            $("#gallery-text").animate({opacity: 0}, 500);
            Modal.animate({opacity: 1, top: "0%", left: "0%", width: "1px", height: "1px"}, 500,
                function() {
                    Modal.css('display', 'none');
                    $("#gallery-text").css('display', 'none');
                    $('#gallery-overlay').fadeOut(400);
                    $("#gallery-img").addClass("hidden").removeClass("visible");
                    video.addClass("hidden").removeClass("visible");
                    Check = false;
                }
            );
        }

        setInterval(moveGallery, 50);
        setInterval(galleryChecking, 1000);

        function galleryChecking() {
            if (Check == false) {
                Check = true;
                var row = getRandomInt(1, DISPLAY_HEIGHT - 1),
                    col = getRandomInt(1, DISPLAY_WIDTH - 1),
                    Boxes = $("#gallery > li");
                createModal(Boxes[row].childNodes[col]);
            }
        }

        function moveGallery() {
            var BoxImg = $(".gallery-box"),
                w = BoxImg.width(),
                h = BoxImg.height(),
                step = 1;
            Gallery[0].style.top = (Gallery[0].style.top.substring(0, Gallery[0].style.top.length - 2) - step).toString() + "px";
            Gallery[0].style.left = (Gallery[0].style.left.substring(0, Gallery[0].style.left.length - 2) - step).toString() + "px";
            if (Gallery[0].style.top.substring(0, Gallery[0].style.top.length - 2) <= -h-2 &&
                Gallery[0].style.left.substring(0, Gallery[0].style.left.length - 2) <= -w-2) {
                rebuild();
            }
        }

        function rebuild() {
            Gallery[0].style.top = "0px";
            Gallery[0].style.left = "0px";
            var Boxes = $("#gallery > li");
            for (var i = 0; i < Boxes.length; ++i) {
                var clone = Boxes[i].childNodes[0].cloneNode(true);
                Boxes[i].appendChild(clone);
                Boxes[i].childNodes[0].remove();
            }
            clone = Boxes[0].cloneNode(true);
            Gallery.append(clone);
            Boxes[0].remove();
            $("#gallery > li > li").on('click', function() {
                createModal(this);
            });
        };
    }

})()