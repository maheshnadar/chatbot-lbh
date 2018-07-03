myApp.controller('HomeCtrl', function ($scope, TemplateService, NavigationService, $timeout, $rootScope, apiService, $cookies) {
        $scope.template = TemplateService.getHTML("content/home.html");
        TemplateService.title = "Home"; //This is the Title of the Website
        $rootScope.uipage = 'home';
        $scope.navigation = NavigationService.getNavigation();
        //$scope.categorydropdown = apiService.getCategoryDropdown({});



        $rootScope.gotsession = true;
        window.me = {};
        angular.element(document).ready(function () {
            $scope.setdisconnectsocket = function () {
                var formData = {
                    from_id: $.jStorage.get("email")
                };
                apiService.setdisconnectsocket(formData).then(function (data) {

                });
            };
            // $scope.setdisconnectsocket();
            $scope.getParentUrl = function () {
                var isInIframe = (parent !== window),
                    parentUrl = null;

                if (isInIframe) {
                    parentUrl = document.referrer;
                    // console.log("in iframe");
                }
                return parentUrl;
            };
            var referrerurl = $scope.getParentUrl();

            function startPrivateConversation() {

                // Get the user list
                var select = $('#users-list');

                // Make sure a user is selected in the list
                if (select.val() === null) {
                    return alert('Please select a user to send a private message to.');
                }

                // Get the recipient's name from the text of the option in the <select>
                var recipientName = $('option:selected', select).text();
                var recipientId = select.val();

                // Prompt for a message to send
                var message = prompt("Enter a message to send to " + recipientName);

                // Create the UI for the room if it doesn't exist
                createPrivateConversationRoom({
                    name: recipientName,
                    id: recipientId
                });

                // Add the message to the room
                addMessageToConversation(window.me.id, recipientId, message);

                // Send the private message
                io.socket.post('/chat/private', {
                    to: recipientId,
                    msg: message
                });

            }

            // Create the HTML to hold a private conversation between two users
            function createPrivateConversationRoom(penPal) {

                // Get the ID of the HTML element for this private convo, if there is one
                var roomName = 'private-room-' + penPal.id;

                // If HTML for the room already exists, return.
                if ($('#' + roomName).length) {
                    return;
                }

                var penPalName = penPal.name == "unknown" ? ("User #" + penPal.id) : penPal.name;

                // Create a new div to contain the room
                var roomDiv = $('<div id="' + roomName + '"></div>');

                // Create the HTML for the room
                var roomHTML = '<h2>Private conversation with <span id="private-username-' + penPal.id + '">' + penPalName + '</span></h2>\n' +
                    '<div id="private-messages-' + penPal.id + '" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>' +
                    '<input id="private-message-' + penPal.id + '"/> <button id="private-button-' + penPal.id + '">Send message</button">';

                roomDiv.html(roomHTML);

                // Add the room to the private conversation area
                $('#convos').append(roomDiv);

                // Hook up the "send message" button
                $('#private-button-' + penPal.id).click(onClickSendPrivateMessage);

            }

            // Callback for when the user clicks the "Send message" button in a private conversation
            function onClickSendPrivateMessage(e) {

                // Get the button that was pressed
                var button = e.currentTarget;

                // Get the ID of the user we want to send to
                var recipientId = button.id.split('-')[2];

                // Get the message to send
                var message = $('#private-message-' + recipientId).val();
                $('#private-message-' + recipientId).val("");

                // Add this message to the room
                addMessageToConversation(window.me.id, recipientId, message);

                // Send the message
                io.socket.post('/chat/private', {
                    to: recipientId,
                    msg: message
                });

            }

            // Add HTML for a new message in a private conversation
            function addMessageToConversation(senderId, recipientId, message) {

                var fromMe = senderId == window.me.id;
                var roomName = 'private-messages-' + (fromMe ? recipientId : senderId);
                $.jStorage.set('lastroom', roomName);
                $.jStorage.set('lastroomid', (fromMe ? recipientId : senderId));
                var senderName = fromMe ? "Me" : $('#private-username-' + senderId).html();
                var justify = fromMe ? 'right' : 'left';

                var div = $('<div style="text-align:' + justify + '"></div>');
                div.html('<strong>' + senderName + '</strong>: ' + message);
                $('#' + roomName).append(div);

            }

            // Handle an incoming private message from the server.
            function receivePrivateMessage(data) {

                var sender = data.from;

                // Create a room for this message if one doesn't exist
                createPrivateConversationRoom(sender);

                // Add a message to the room
                //addMessageToConversation(sender.id, window.me.id, data.msg);
                //$(".chat").append("<li class='left clearfix'><span class='chat-img pull-left'><img ng-src='img/Tenali.png' alt='BOT' class='img-circle  doneLoading' src='img/Tenali.png'></span><div class='chat-body'><p>"+data.msg+" </p></div></li>");
                // console.log(data, "recvdmsg");
                mymsg = {
                    Text: data.msg,
                    type: "SYS_FIRST"
                };
                //$rootScope.chatlist.push({id:"id",msg:mymsg,position:"left",curTime: $rootScope.getDatetime()});
                $rootScope.pushSystemMsg(0, mymsg);
            }


            //console.log($.jStorage.get("notloggedin"));
            //angular.element(document).ready(function () {
            if (!$.jStorage.get('firstreload')) {
                $.jStorage.set('firstreload', true);
                location.reload();
            }

            // if(!$.jStorage.get("notloggedin"))
            {

                io.socket.on('connect', function socketConnected() {

                    // Show the main UI
                    $('#disconnect').hide();
                    $('#main').show();
                    // window.me = {};
                    // Announce that a new user is online--in this somewhat contrived example,
                    // this also causes the CREATION of the user, so each window/tab is a new user.
                    // if (!window.me.id && $.jStorage.get("email")) {
                    //     userdata = {
                    //         sid: $.jStorage.get("id"),
                    //         email: $.jStorage.get("email"),
                    //         name: $.jStorage.get("fname") + ' ' + $.jStorage.get("lname"),
                    //         sname: $.jStorage.get("fname") + ' ' + $.jStorage.get("lname"),
                    //         access_role: "user",
                    //         livechat: 0,
                    //         page:referrerurl
                    //     };
                    //     io.socket.get("/user/announce", {
                    //         query: userdata
                    //     }, function (data) {
                    //         //console.log(data);

                    //         userdata.socketId = data.socketId;
                    //         userdata.id = data.id;
                    //         $.jStorage.set("socketId", userdata.socketId);
                    //         $.jStorage.set("sid", userdata.sid);
                    //         window.me = data;
                    //         // console.log(data, "sails userdata");
                    //         updateMyName(data);

                    //         // Get the current list of users online.  This will also subscribe us to
                    //         // update and destroy events for the individual users.
                    //         io.socket.get('/user', updateUserList);

                    //         // Get the current list of chat rooms. This will also subscribe us to
                    //         // update and destroy events for the individual rooms.
                    //         io.socket.get('/room', updateRoomList);

                    //     });
                    // }

                    // Listen for the "room" event, which will be broadcast when something
                    // happens to a room we're subscribed to.  See the "autosubscribe" attribute
                    // of the Room model to see which messages will be broadcast by default
                    // to subscribed sockets.
                    io.socket.on('room', function messageReceived(message) {

                        switch (message.verb) {

                            // Handle room creation
                            case 'created':
                                addRoom(message.data);
                                break;

                                // Handle a user joining a room
                            case 'addedTo':
                                // Post a message in the room
                                postStatusMessage('room-messages-' + message.id, $('#user-' + message.addedId).text() + ' has joined');
                                // Update the room user count
                                increaseRoomCount(message.id);
                                break;

                                // Handle a user leaving a room
                            case 'removedFrom':
                                // Post a message in the room
                                postStatusMessage('room-messages-' + message.id, $('#user-' + message.removedId).text() + ' has left');
                                // Update the room user count
                                decreaseRoomCount(message.id);
                                break;

                                // Handle a room being destroyed
                            case 'destroyed':
                                removeRoom(message.id);
                                break;

                                // Handle a public message in a room.  Only sockets subscribed to the "message" context of a
                                // Room instance will get this message--see the "join" and "leave" methods of RoomController.js
                                // to see where a socket gets subscribed to a Room instance's "message" context.
                            case 'messaged':
                                receiveRoomMessage(message.data);
                                break;

                            default:
                                break;

                        }

                    });

                    // Listen for the "user" event, which will be broadcast when something
                    // happens to a user we're subscribed to.  See the "autosubscribe" attribute
                    // of the User model to see which messages will be broadcast by default
                    // to subscribed sockets.
                    io.socket.on('user', function messageReceived(message) {
                        //console.log("%%%%%%%%%%%%%%%",message);
                        switch (message.verb) {

                            // Handle user creation
                            case 'created':
                                addUser(message.data);
                                break;

                                // Handle a user changing their name
                            case 'updated':

                                // Get the user's old name by finding the <option> in the list with their ID
                                // and getting its text.
                                var oldName = $('#user-' + message.id).text();

                                // Update the name in the user select list
                                $('#user-' + message.id).text(message.data.name);

                                // If we have a private convo with them, update the name there and post a status message in the chat.
                                if ($('#private-username-' + message.id).length) {
                                    $('#private-username-' + message.id).html(message.data.name);
                                    postStatusMessage('private-messages-' + message.id, oldName + ' has changed their name to ' + message.data.name);
                                }

                                break;

                                // Handle user destruction
                            case 'destroyed':
                                {
                                    // if ($rootScope.lastagent == message.previous.email && $rootScope.agentconnected)
                                    //     $rootScope.endConversation(2);
                                    // removeUser(message.id);

                                }
                                break;

                                // Handle private messages.  Only sockets subscribed to the "message" context of a
                                // User instance will get this message--see the onConnect logic in config/sockets.js
                                // to see where a new user gets subscribed to their own "message" context
                            case 'messaged':
                                if (message.data.messagetype == 'Transfer') {
                                    $rootScope.agentdet = {
                                        sid: message.data.extraobj.sid,
                                        sname: message.data.extraobj.name,
                                        id: parseInt(message.data.extraobj.id),
                                        socketid: message.data.extraobj.socketId,
                                        email: message.data.extraobj.email
                                    };

                                    $rootScope.lastagentid = parseInt(message.data.extraobj.id);
                                    //console.log("######################",$rootScope.lastagentid);
                                } else if (message.data.messagetype && message.data.messagetype == 'disconnect') {
                                    var msg = {
                                        Text: "Chat terminated by agent",
                                        type: "SYS_CONV_END"
                                    };
                                    $rootScope.pushSystemMsg(0, msg);
                                    $rootScope.agentconnected = false;
                                    $rootScope.lastagentmsg = false;
                                    $rootScope.agentdet = {};
                                    $rootScope.lastagentid = "";
                                    $rootScope.lastagent = "";
                                }
                                receivePrivateMessage(message.data);
                                break;


                            default:
                                break;
                        }

                    });

                    // Add a click handler for the "Update name" button, allowing the user to update their name.
                    // updateName() is defined in user.js.
                    $('#update-name').click(updateName);

                    // Add a click handler for the "Send private message" button
                    // startPrivateConversation() is defined in private_message.js.
                    $('#private-msg-button').click(startPrivateConversation);

                    // Add a click handler for the "Join room" button
                    // joinRoom() is defined in public_message.js.
                    $('#join-room').click(joinRoom);

                    // Add a click handler for the "New room" button
                    // newRoom() is defined in room.js.
                    $('#new-room').click(newRoom);

                    // console.log('Socket is now connected!');

                    // When the socket disconnects, hide the UI until we reconnect.
                    io.socket.on('disconnect', function () {
                        // Hide the main UI
                        $('#main').hide();
                        $('#disconnect').show();
                    });

                });

            }
            //});
            // apiService.get_session({}).then(function (response) {
            //     $cookies.put("csrftoken", response.data.csrf_token);
            //     $cookies.put("session_id", response.data.session_id);
            //     $.jStorage.set("session_id", response.data.session_id);
            //     $.jStorage.set("csrftoken", response.data.csrf_token);
            //     $rootScope.gotsession = true;
            //     //console.log(response.data);

            // });
        });
    })

    .controller('SpeechRecognitionController', function ($scope, $rootScope) {

        var vm = this;
        vm.displayTranscript = displayTranscript;
        vm.transcript = '';

        function displayTranscript() {
            vm.transcript = $rootScope.transcript;
            // console.log("transcript", $rootScope.transcript);
            $(".chatinput").val($rootScope.transcript);
            $rootScope.pushMsg(0, $rootScope.transcript);
            //This is just to refresh the content in the view.
            // if (!$scope.$$phase) {
            //     $scope.$digest();
            //     //console.log("transcript",$rootScope.transcript);
            //     $(".chatinput").val("");
            // }
        }


        $rootScope.startspeech = function () {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            // console.log("new func");
            // recognition.onresult = function(event) 
            {
                // console.log(event);
            }
            recognition.start();
        };
        /**
         * Handle the received transcript here.
         * The result from the Web Speech Recognition will
         * be set inside a $rootScope variable. You can use it
         * as you want.
         */
        $rootScope.speechStarted = function () {
            // console.log("speech Started");
        };


    })

    .controller('ChatCtrl', function ($scope, $rootScope, TemplateService, $timeout, $http, apiService, $state, $sce, $cookies, $location, $compile, $uibModal, Idle, $location, $interval, $window, $filter) {
		$scope.allchats=[];
        var url = $location.absUrl().split('?')[0];
        var pId = $location.path().split("/")[3] || "Unknown"; //path will be /person/show/321/, and array looks like: ["","person","show","321",""]
        $scope.usocketId = "";
		$rootScope.lastagentname="";
		$rootScope.lastagentid="";
        // $scope.onExit = function() {
        //     //$localStorage.$reset();//it will delete all the data from localstorage.
        //     $rootScope.logoutagent();
        //    };
        //    $window.onbeforeunload =  $scope.onExit;


        // console.log($rootScope.lastagentid,"ddisss");
        $scope.logout = function () {
            //$rootScope.setdisconnectsocket1();
            // console.log($rootScope.lastagentid,"ddisss");
            if ($.jStorage.get("uemail")) {
                $scope.usocketId = "";
                $.jStorage.deleteKey("ufname");
                $.jStorage.deleteKey("ulname");
                $.jStorage.deleteKey("name");
                $.jStorage.deleteKey("uemail");
                $.jStorage.deleteKey("isLoggedin");
                $.jStorage.deleteKey("usetsession");
				/*
                if ($rootScope.agentdet) {
                    io.socket.post('/chat/private', {
                        to: $rootScope.lastagentid,
                        msg: '',
                        messagetype: "disconnect",

                        session_id: $.jStorage.get('session_id'),
                        // msg: value,
                        from_id: $scope.uemail,
                        fromid: $rootScope.userid,
                        fromname: $scope.ufname,
                        from_socketid: $scope.usocketId,
                        toid: $rootScope.lastagentid,
                        toname: $rootScope.agentdet.sname,
                        to_id: $rootScope.agentdet.email,
                        to_socketid: $rootScope.agentdet.socketid
                    });
                    var formData = {
                        disconnectby: $rootScope.userid,
                        from_id: $scope.uemail,
                        to_id: $rootScope.agentdet.email,
                        socketid: $scope.usocketId,
                        // session_id: $.jStorage.get('session_id'),

                        // from_id: $.jStorage.get("email"),
                        // fromid: window.me.id,
                        // fromname: ($.jStorage.get("fname") + ' ' + $.jStorage.get("lname")),
                        // from_socketid: $.jStorage.get("socketId"),
                        // toid: $rootScope.lastagentid,
                        // toname: $rootScope.agentdet.sname,
                        // to_id: $rootScope.agentdet.email,
                        // to_socketid: $rootScope.agentdet.socketid

                    };
                    apiService.disconnectuser(formData).then(function (data) {

                    });
                }*/
				if($rootScope.agentconnected)
				{
					var disconnectby = "";
					var endmsg = "";
					endmsg = "Your Chat has ended.";
					var msg = {
						Text: endmsg,
						type: "SYS_CONV_END"
					};
					$rootScope.pushSystemMsg(0, msg);


					apiService.sendmsg({
						email: $scope.uemail,
						name: $scope.ufname,
						from_id:$scope.uemail,
						fromname:$scope.ufname,
						to_id:$rootScope.lastagentid,
						toname:$rootScope.lastagentname,
						msg: "Disconnect",
						messagetype: "disconnect"
					}).then(function (data) {

					});
					apiService.disconnectbyuser({
						email: $scope.uemail,
						name: $scope.ufname,
						msg: "Disconnect",
						messagetype: "disconnect",
						to_id:$rootScope.lastagentid,
					}).then(function (data) {

					});
					$rootScope.offlineuser = false;
					$rootScope.lastagentid="";
					$rootScope.lastagentname="";
				}
            }
            $rootScope.agentconnected = false;
            $rootScope.lastagentmsg = false;

            $rootScope.offlineuser = false;
            // $.jStorage.flush();
            $rootScope.isLoggedin = false;
            $rootScope.chatlist = [];
            $rootScope.offline = false;
            $rootScope.offlineuser = false;
            // $scope.formData = {sessionid:$.jStorage.get("sessionid"),user:$.jStorage.get("id")};
            // apiService.logout($scope.formData).then(function (callback){
            //     $.jStorage.flush();
            //     $rootScope.isLoggedin = false;
            //     $rootScope.chatlist = [];
            //     $.jStorage.set("showchat",false);
            //     $rootScope.chatOpen = true;

            // });
            //$rootScope.endConversation();

        };
        if ($.jStorage.get("uemail")) {
            $scope.ufname = $.jStorage.get("ufname");
            $scope.uemail = $.jStorage.get("uemail");
			io.socket.on($scope.ufname + '_' + $scope.uemail, function (data) {
                $scope.allchats.push(data);
				$rootScope.scrollChatWindow
                $scope.$apply();
            });
        }
        $scope.checkloginstatus = function () {
            // if($scope.usocketId && $scope.usocketId!='')
            $scope.gotsocket = true;
            $interval(function () {
                if (!$.jStorage.get("usetsession")) {
                    $scope.logout();
                } else {
                    var curtime = new Date();
                    var s_time = new Date($.jStorage.get("usetsession"));
                    var diff = (curtime - s_time) / 1000;
                    // console.log(diff,"time diff");
                    if (diff < 15) {
                        $.jStorage.set("usetsession", new Date());
                        // console.log(diff,"timeok");
                    } else {
                        //console.log("logout time < 15sec");
                        $scope.logout();
                    }
                    //$rootScope.logoutagent();
                }
            }, 10000);
        };
        $scope.lastloggedin = function () {
            if (!$.jStorage.get("usetsession")) {
                $scope.logout();
            } else {
                var curtime = new Date();
                var s_time = new Date($.jStorage.get("usetsession"));
                var diff = (curtime - s_time) / 1000;
                //console.log(diff,"time diff");
                if (diff < 15) {
                    $.jStorage.set("usetsession", new Date());
                    //console.log(diff,"timeok");
                } else {


                    //CsrfTokenService.getCookie("csrftoken").then(function (token) {
                    $scope.logout();


                    //console.log("logout time < 15sec");
                }
                //$rootScope.logoutagent();
            }
        };
        // if($.jStorage.get("uemail")){
        //     $scope.lastloggedin();
        //     $scope.checkloginstatus();
        // }
        $scope.gotsocket = false;
        $rootScope.setdisconnectsocket1 = function () {
            //console.log("dc");
            var formData = {
                // from_id: $.jStorage.get("email")
                from_id: $scope.uemail
            };
            apiService.setdisconnectsocket(formData).then(function (data) {

            });
        };
        $rootScope.userid = "";
        $scope.$modalInstance = {};
        $scope.openChangePwd = function () {
            $scope.$modalInstance = $uibModal.open({
                scope: $scope,
                animation: true,
                //size: 'sm',
                templateUrl: 'views/modal/changepassword.html',
                //controller: 'CommonCtrl'
            });
        };
        $scope.changePwdcancel = function () {
            //console.log("dismissing");
            $scope.$modalInstance.dismiss('cancel');
            //$scope.$modalInstance.close();
        };
        $scope.passworderror = 0
        $scope.changepasswordSuccess = 0;

        $scope.changepassword = function (currentpassword, newpassword, newpassword2) {
            //console.log(newpassword);
            // userid = $.jStorage.get("uid");
            userid = $scope.uid
            // CsrfTokenService.getCookie("csrftoken").then(function (done) {
            //     $scope.token = done;
            $scope.formData = {
                userid: userid,
                oldpassword: (currentpassword),
                newpassword: (newpassword),
                // csrfmiddlewaretoken: $scope.token
            };
            //console.log($scope.formData);
            apiService.changepassword($scope.formData).then(function (callback) {
                if (callback.data.value) {
                    $scope.changepasswordSuccess = 1;
                    $timeout(function () {
                        $scope.$modalInstance.dismiss('cancel');
                        $scope.changepasswordSuccess = 0;
                    }, 500);
                } else if (callback.data.error.message == -1)
                    $scope.passworderror = -1;
            })

        };
        $scope.getParentUrl = function () {
            var isInIframe = (parent !== window),
                parentUrl = null;

            if (isInIframe) {
                parentUrl = document.referrer;
                // console.log("in iframe");
            }
            return parentUrl;
        };
        var referrerurl = $scope.getParentUrl();

        var promise;
        // window.me = {};

        // starts the interval
        $scope.startio = function () {
            // stops any running interval to avoid two intervals running at the same time

            $scope.stopio();

            // store the interval promise
            //if(!window.me.id && window.me.id!='')
            console.log($scope.usocketId, "ssss");
            if (!$scope.gotsocket)
                promise = $interval(connectio2, 2000);
        };

        // stops the interval
        $scope.stopio = function () {
            $interval.cancel(promise);
        };

        // starting the interval by default
        // if(!$.jStorage.get("uid"))
        // $scope.startio();
        // else
        //     $rootScope.userid=$.jStorage.get("uid");
        function connectio2() {
            console.log("get io");
            if ($scope.usocketId == "") {

                // console.log("u conn",$.jStorage.get("email"));
                userdata = {
                    sid: "",
                    email: $scope.uemail,
                    name: $scope.ufname,
                    sname: $scope.ufname,
                    access_role: "user",
                    livechat: 0,
                    page: referrerurl
                };

                io.socket.get("/user/announce", {
                    query: userdata
                }, function (data) {
                    // console.log("got socket");
                    $scope.stopio();
                    // console.log("announce");
                    $timeout(function () {
                        $scope.gotsocket = true;
                    }, 0);

                    userdata.socketId = data.socketId;
                    userdata.id = data.id;
                    $rootScope.userid = data.id;
                    $.jStorage.set("usocketId", userdata.socketId);
                    $.jStorage.set("sid", userdata.sid);

                    $.jStorage.set("uid", data.id);
                    window.me = data;
                    $scope.usocketId = userdata.socketId;
                    $scope.sid = userdata.sid;
                    $scope.uid = data.id;
                    // console.log(data, "sails userdata");
                    updateMyName(data);

                    // Get the current list of users online.  This will also subscribe us to
                    // update and destroy events for the individual users.
                    io.socket.get('/user', {});

                    // Get the current list of chat rooms. This will also subscribe us to
                    // update and destroy events for the individual rooms.
                    io.socket.get('/room', {});


                });


            }
        }

        /*******************get window url ********************/


        $scope.concurrentcount = 3;
        $rootScope.referrerurlmsg = [];
        $scope.findmsg = "";
        $scope.themedata = {};
        $scope.offlinemessage = {};
        $scope.getconfig = false;
        $scope.getallconfig = function () {
            apiService.getallconfig({
                from_id: $.jStorage.get("uemail")
            }).then(function (response) {

                $rootScope.referrerurlmsg = response.data.data.pageconfig;
                $scope.findmsg = _.find($rootScope.referrerurlmsg, function (url) {
                    return url.referurl == referrerurl;
                });
                $scope.themedata = response.data.data.themeconfig;
                $scope.offlinemessage = response.data.data.offlineconfig;
                $rootScope.showChatwindow();
                $scope.getconfig = true;
                $rootScope.userchat = response.data.data.chat.chatlist;
                // $scope.agentfirstmsg = response.data.data.chat.contexts
                //  console.log("$$$$$$$$$$$userchat", $scope.themedata);
                // $scope.concurrentcount = response.data.data.concurrentconfig.count;

                var finduserid = _.find($rootScope.userchat, function (o) {

                    return o.from_id != $.jStorage.get("uemail");

                });
                //console.log("finduserid**********", finduserid);
                //  console.log("finduserrrrrrr",finduserid)

                if ($rootScope.userchat) {
                    for (i = 0; i <= $rootScope.userchat.length - 1; i++) {
                        if (i == 1) {
                            var msg1 = {

								Text: "Hi, I am "+response.data.data.chat.username2+" ,"+$scope.themedata.agent_message,
                                type: "SYS_EMPTY_RES"
                            };
                            $rootScope.pushSystemMsg(0, msg1);
                        }
                        if ($rootScope.userchat[i].from_id == $.jStorage.get("uemail")) {
                            $rootScope.chatlist.push({
                                id: "id",
                                msg: $rootScope.userchat[i].msg,
                                position: "right",
                                curTime: $rootScope.userchat[i].date
                            });
                        } else {
                            mymsg = {
                                Text: $rootScope.userchat[i].msg,
                                type: "SYS_FIRST"
                            };
                            //$rootScope.chatlist.push({id:"id",msg:mymsg,position:"left",curTime: $rootScope.getDatetime()});
                            $rootScope.pushSystemMsg(0, mymsg);
                        }
                        // console.log(i);
                    }

                    // $rootScope.agentdet = {
                    //     // sid: finduserid.from_id,
                    //     // sname: finduserid.fromname,
                    //     // id: finduserid.fromid,
                    //     // socketid: finduserid.from_socketid,
                    //     // email: finduserid.from_id,
                    //     sid: $rootScope.userchat[0].toid,
                    //     sname: $rootScope.userchat[0].toname,
                    //     id: $rootScope.userchat[0].toid,
                    //     socketid: $rootScope.userchat[0].to_socketid,
                    //     email: $rootScope.userchat[0].to_id
                    // };
                    $rootScope.agentconnected = true;

                    // $rootScope.lastagentid = parseInt($rootScope.userchat[0].toid);
                    $rootScope.lastagentid = $rootScope.userchat[0].to_id;
					$rootScope.lastagentname=response.data.data.chat.username2;
                }
            });

        };
        $scope.getpageconfiguration = function () {
            apiService.getpageconfig({}).then(function (response) {

            });
        };


        $scope.getthemeconfiguration = function () {
            apiService.getthemeconfig({}).then(function (response) {
                $scope.themedata = response.data.data;
            });
        };

        // $scope.getpageconfiguration();
        // $scope.getthemeconfiguration();
        $scope.getallconfig();



        //console.log($scope.getParentUrl());// returns blank if cross domain | if same domain returns null
        var url2 = (window.location != window.parent.location) ? document.referrer : document.location.href;
        //console.log(url2);// returns blank if cross domain | returns url
        //console.log(document.referrer);// returns blank if cross domain | returns url
        // if(!window.top.location.href)
        //     console.log("Different domain");
        // else    
        //     console.log("same domain");
        //console.log(Browser.getParentUrl());
        // $rootScope.validDomain = false;

        // console.log("*********** referrerurl", referrerurl)
        // if(referrerurl == null || referrerurl == "http://104.46.103.162:8096/" || referrerurl == "http://localhost/flatlab/")
        //     $rootScope.validDomain = true;
        $rootScope.validDomain = true;
        $rootScope.languagelist = [{
                id: "en",
                name: "English"
            },
            {
                id: "hi",
                name: "Hindi"
            },
            {
                id: "mr",
                name: "Marathi"
            },
            {
                id: "gu",
                name: "Gujarati"
            },
            {
                id: "ta",
                name: "Tamil"
            },
        ];
        $rootScope.selectedLanguage = $rootScope.languagelist[0];
        $scope.formSubmitted = false;
        $scope.loginerror = 0;
        $rootScope.autocompletelist = [];
        $rootScope.chatOpen = false;
        $rootScope.showTimeoutmsg = false;
        $rootScope.firstMsg = false;
        $rootScope.chatmsg = "";
        $rootScope.chatmsgid = "";
        $rootScope.categories = [];
        $rootScope.msgSelected = false;
        $rootScope.chatlist = [];
        $rootScope.agentconnected = false;
        $rootScope.lastagent = "";
        $rootScope.agentlist = [];
        $rootScope.agentdet = {};
        $rootScope.offlineuser = false;

        // var mylist = $.jStorage.get("chatlist");
        // //var mylist = [];
        // if(!mylist || mylist == null)
        //     $rootScope.chatlist = [];
        // else
        // {
        //     $rootScope.chatlist = $.jStorage.get("chatlist");
        // }
        $rootScope.autolistid = "";
        $rootScope.autolistvalue = "";
        $rootScope.showMsgLoader = false;
        $rootScope.rate_count = 0;
        $scope.showfaqviewmore = false;
        $scope.faqlimit = 3;
        $scope.isOpenfaq = false;
        $scope.faqviewbtn = "View More";
        $rootScope.categorylist = [];
        $rootScope.links = [];
        $rootScope.faqs = [];
        $rootScope.dsepolicy = [];
        $rootScope.returnpolicy = [];
        $rootScope.showempprev = "";
        $rootScope.qticket = "";
        var oldLimit;
        $(document).on('click', '.faqtoggle', function () {
            $(this).parent().parent().find('.faqmore').toggle("slow");
        });
        $scope.faqtoggle = function () {
            // if ($scope.isOpenfaq) 
            // {
            //     $scope.faqviewbtn = "View More";
            //     $scope.faqlimit = oldLimit;
            // }
            // else {
            //     oldLimit = $scope.faqlimit;
            //     $scope.faqlimit = $rootScope.faqs.length;
            //     $scope.faqviewbtn = "View Less";
            // }

            // $scope.isOpenfaq = !$scope.isOpenfaq;

        };
        $rootScope.endConversation = function (byrole) {
            //byrole-1->user,2-> chat agent
            var disconnectby = "";
            var endmsg = "";
            if (byrole == 2) {
                disconnectby = $rootScope.lastagentid;
                endmsg = "Chat terminated by agent.";
            } else {
                disconnectby = $.jStorage.get("id");
                endmsg = "Your Chat has ended.";
            }
            var msg = {
                Text: endmsg,
                type: "SYS_CONV_END"
            };
            $rootScope.pushSystemMsg(0, msg);


            // io.socket.post('/chat/private', {
            //     to: $rootScope.lastagentid,
            //     msg: '',
            //     messagetype: "disconnect",

            //     session_id: $.jStorage.get('session_id'),
            //     // msg: value,
            //     from_id: $.jStorage.get("uemail"),
            //     fromid: $rootScope.userid,
            //     fromname: ($.jStorage.get("ufname") + ' ' + $.jStorage.get("lname")),
            //     from_socketid: $.jStorage.get("usocketId"),
            //     toid: $rootScope.lastagentid,
            //     toname: $rootScope.agentdet.sname,
            //     to_id: $rootScope.agentdet.email,
            //     to_socketid: $rootScope.agentdet.socketid
            // });
            $rootScope.agentconnected = false;
            $rootScope.lastagentmsg = false;
            // var formData = {
            //     disconnectby: disconnectby,
            //     from_id: $.jStorage.get("uemail"),
            //     to_id: $rootScope.lastagent,
            //     socketid: $.jStorage.get("usocketId"),
            //     // session_id: $.jStorage.get('session_id'),

            //     // from_id: $.jStorage.get("email"),
            //     // fromid: window.me.id,
            //     // fromname: ($.jStorage.get("fname") + ' ' + $.jStorage.get("lname")),
            //     // from_socketid: $.jStorage.get("socketId"),
            //     // toid: $rootScope.lastagentid,
            //     // toname: $rootScope.agentdet.sname,
            //     // to_id: $rootScope.agentdet.email,
            //     // to_socketid: $rootScope.agentdet.socketid

            // };
            // apiService.disconnectuser(formData).then(function (data) {

            // });
			apiService.sendmsg({
				email: $scope.uemail,
				name: $scope.ufname,
				from_id:$scope.uemail,
				fromname:$scope.ufname,
				to_id:$rootScope.lastagentid,
				toname:$rootScope.lastagentname,
				msg: "Disconnect",
                messagetype: "disconnect"
			}).then(function (data) {

			});
            apiService.disconnectbyuser({
                email: $scope.uemail,
                name: $scope.ufname,
                msg: "Disconnect",
                messagetype: "disconnect",
				to_id:$rootScope.lastagentid,
            }).then(function (data) {

            });
            $rootScope.offlineuser = false;
            //$scope.logout();
            //$rootScope.chatlist = [];
        };
        $rootScope.getCookie = function (c_name) {
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) c_end = document.cookie.length;
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        };
        $rootScope.scrollChatWindow = function () {
            $timeout(function () {
                var chatHeight = $("ul.chat").height();
                $('.panel-body').animate({
                    scrollTop: chatHeight
                });
            });
        };
        $rootScope.iframeHeight = window.innerHeight - 53;
        $rootScope.isLoggedin = false;
        if ($.jStorage.get("isLoggedin"))
            $rootScope.isLoggedin = true;
        console.log("**************islogggedin", $.jStorage.get("isLoggedin"));
        $rootScope.showQuerybtn = function () {
            var msg = {
                type: "SYS_QUERY"
            };
            $rootScope.pushSystemMsg(0, msg);
        };
        $rootScope.getorderstatus = function () {
            formdata = Array();
            formdata.push({
                "fieldname": "orderno",
                fieldtype: "number"
            });
            formdata.push({
                "fieldname": "name",
                fieldtype: "text"
            });

            // var msg = {type:"html_form",form_name:"orderstatus",formdata:formdata};
            // $rootScope.pushSystemMsg(0,msg); 
            var formData = {
                customer_name: $.jStorage.get("uname"),
                customer_id: $.jStorage.get("uemail"),
                user_input: "order status",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            apiService.getCategoryFAQ(formData).then(function (response) {
                angular.forEach(response.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, response.data);

                    }
                    if (value.type == "text") {
                        $rootScope.pushSystemMsg(0, response.data);
                    }
                    if (value.type == "html_form") {
                        $rootScope.pushSystemMsg(0, response.data);
                    }
                    $rootScope.showMsgLoader = false;
                });
            }).catch(function (reason) {
                // console.log(reason);
                var msg = {
                    Text: "Sorry I did not get you.Could you please try another query.",
                    type: "SYS_EMPTY_RES"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            });
        };
        $scope.ra = "";
        $scope.getrtn = function () {
            $rootScope.showMsgLoader = true;
            $rootScope.scrollChatWindow();
            var formData = {
                customer_name: $.jStorage.get("uname"),
                customer_id: $.jStorage.get("uemail"),
                user_input: "return_exchange",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            apiService.getCategoryFAQ(formData).then(function (response) {
                angular.forEach(response.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, response.data);

                    }
                    if (value.type == "text") {
                        $rootScope.pushSystemMsg(0, response.data);
                    }
                    if (value.type == "product listing") {
                        $rootScope.pushSystemMsg(0, response.data);
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                        //return false;
                    }
                    if (value.type == "html_form") {
                        $rootScope.pushSystemMsg(0, response.data);

                    }
                    $rootScope.showMsgLoader = false;
                });
            }).catch(function (reason) {
                // console.log(reason);
                var msg = {
                    Text: "Sorry I did not get you.Could you please try another query.",
                    type: "SYS_EMPTY_RES"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            });
        };
        $scope.getsizing = function () {
            $rootScope.showMsgLoader = true;
            $rootScope.scrollChatWindow();
            var formData = {
                customer_name: $.jStorage.get("name"),
                customer_id: $.jStorage.get("email"),
                user_input: "offers",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            apiService.getCategoryFAQ(formData).then(function (response) {
                angular.forEach(response.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, response.data);
                    }
                    if (value.type == "text") {
                        $rootScope.pushSystemMsg(0, data.data);
                    }
                    $rootScope.showMsgLoader = false;
                });
            }).catch(function (reason) {
                // console.log(reason);
                var msg = {
                    Text: "Sorry I did not get you.Could you please try another query.",
                    type: "SYS_EMPTY_RES"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            });
        };
        $scope.addtocart = function (productname) {
            // console.log(productname);
            var msg = {
                Text: "Here you will be redirected to a payment gateway. At present, this has not been incorporated in the bot.",
                type: "SYS_ADD_CART"
            };
            $rootScope.pushSystemMsg(0, msg);
            $rootScope.showMsgLoader = false;
            $rootScope.scrollChatWindow();
        };
        // $scope.htmlformsubmit = function(formname,formdata,fieldvalue) {
        //     // console.log(formdata,"formdata");
        //     // console.log(formname,"formname");
        //     // console.log(fieldvalue,"fieldvalue");
        //     var formData = {customer_name:$.jStorage.get("name"),customer_id:$.jStorage.get("email"),user_input:"",csrfmiddlewaretoken:$rootScope.getCookie("csrftoken"),auto_id:"",auto_value:"",user_id:$.jStorage.get("session_id"),form_name:formname};
        //     var mergedObject = angular.extend(formData, fieldvalue);
        //     console.log(mergedObject);
        //     apiService.htmlformsubmit(mergedObject).then( function (response) {
        //         angular.forEach(response.data.tiledlist, function(value, key) {
        //             if(value.type=="DTHyperlink")
        //             {
        //                 $rootScope.DthResponse(0,response.data);
        //             }
        //             if(value.type=="order_status")
        //             {
        //                 $rootScope.pushSystemMsg(0,response.data);
        //             }
        //             if(value.type=="text")
        //             {
        //                 $rootScope.pushSystemMsg(0,response.data);
        //             }
        //             $rootScope.showMsgLoader = false;
        //         });
        //     });
        // }
        $scope.htmlformsubmit = function (formname, formdata, fieldvalue) {
            // console.log(formdata,"formdata");
            // console.log(formname,"formname");
            // console.log(fieldvalue,"fieldvalue");
            angular.forEach(formdata, function (value, key) {
                // console.log(value);
                if (value.type == 'date') {
                    var dt = new Date(fieldvalue[value.name]);
                    var date = dt.getDate();
                    var month = dt.getMonth();
                    var year = dt.getFullYear();
                    month = month + 1;
                    if (month.toString().length == 1) {
                        month = "0" + month
                    }
                    if (date.toString().length == 1) {
                        date = "0" + date
                    }
                    dob = date.toString() + "-" + month.toString() + "-" + year.toString();
                    fieldvalue[value.name] = dob;
                }
            });
            formdata.DTHstage == undefined ? DTHstage1 = $.jStorage.get("DTHstage") : DTHstage1 = formdata.DTHstage;
            formdata.DTHlink == undefined ? DTHlink1 = $.jStorage.get("DTHlink") : DTHlink1 = formdata.DTHlink;


            var formData1 = {
                customer_name: $.jStorage.get("name"),
                customer_id: $.jStorage.get("email"),
                user_input: "",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                DTHlink: DTHlink1,
                DTHstage: DTHstage1,
                auto_value: "",
                user_id: $.jStorage.get("session_id"),
                form_name: formname
            };
            if (formname == 'reasons')
                formData1['ra'] = $scope.ra;
            if (formname == 'Return_the_product')
                formData1['order'] = $scope.orderno;
            var mergedObject = angular.extend(formData1, fieldvalue);
            // console.log(mergedObject);
            if (formdata.DTHstage || formdata.DTHstage != '') {
                if (mergedObject.DTHlink == undefined || mergedObject.DTHstage == undefined) {
                    mergedObject.DTHlink = formdata.DTHlink;
                    mergedObject.DTHstage = formdata.DTHstage;
                }

                apiService.htmlformsubmit(mergedObject).then(function (response) {
                    angular.forEach(response.data.tiledlist, function (value, key) {
                        if (value.type == "DTHyperlink") {
                            $rootScope.DthResponse(0, response.data);
                        }
                        if (value.type == "order_status") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "text") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "product listing") {
                            $rootScope.pushSystemMsg(0, response.data);
                            $rootScope.showMsgLoader = false;
                            $timeout(function () {
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel').find('.item').first().addClass('active');
                            }, 2000);

                        }
                        if (value.type == "recommend") {
                            $rootScope.pushSystemMsg(0, response.data);
                            $rootScope.showMsgLoader = false;
                            $timeout(function () {
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel').find('.item').first().addClass('active');
                            }, 2000);

                        }
                        if (value.type == "html_form") {
                            response.data.tiledlist[0].form_data.DTHlink = response.data.tiledlist[0].stage_details.DT[0];
                            response.data.tiledlist[0].form_data.DTHstage = response.data.tiledlist[0].stage_details.Stage;
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        $rootScope.showMsgLoader = false;
                    });
                });
            } else {
                apiService.htmlformsubmit(mergedObject).then(function (response) {
                    angular.forEach(response.data.tiledlist, function (value, key) {
                        if (value.type == "DTHyperlink") {
                            $rootScope.DthResponse(0, response.data);
                        }
                        if (value.type == "order_status") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "text") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "product listing") {
                            $rootScope.pushSystemMsg(0, response.data);
                            $rootScope.showMsgLoader = false;
                            $timeout(function () {
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel').find('.item').first().addClass('active');
                            }, 2000);

                        }
                        if (value.type == "html_form") {
                            response.data.tiledlist[0].form_data.DTHlink = response.data.tiledlist[0].stage_details.DT[0];
                            response.data.tiledlist[0].form_data.DTHstage = response.data.tiledlist[0].stage_details.Stage;
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "recommend") {
                            $rootScope.pushSystemMsg(0, response.data);
                            $rootScope.showMsgLoader = false;
                            $timeout(function () {
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel').find('.item').first().addClass('active');
                            }, 2000);

                        }
                        $rootScope.showMsgLoader = false;
                    });
                });
            }
        };
        $scope.ordernoSubmit = function (orderno) {
            if (orderno == "")
                alert("Please Enter Order No");
            else {
                $rootScope.showMsgLoader = true;
                $rootScope.scrollChatWindow();
                var formData = {
                    orderno: orderno,
                    customer_name: $.jStorage.get("name"),
                    customer_id: $.jStorage.get("email"),
                    user_input: "",
                    csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                    auto_id: "",
                    auto_value: "",
                    user_id: $.jStorage.get("session_id")
                };
                apiService.ordernosubmit(formData).then(function (response) {
                    angular.forEach(response.data.tiledlist, function (value, key) {
                        if (value.type == "DTHyperlink") {
                            $rootScope.DthResponse(0, response.data);
                        }
                        if (value.type == "order_status") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        if (value.type == "text") {
                            $rootScope.pushSystemMsg(0, response.data);
                        }
                        $rootScope.showMsgLoader = false;
                    });
                });
            }
        };
        $scope.login = function (username, name) {
            var fullname = name + " " + '';
            $.jStorage.set("ufname", name);
            $.jStorage.set("ulname", '');
            $.jStorage.set("name", fullname);
            $.jStorage.set("uemail", username);
            $.jStorage.set("isLoggedin", true);
            $.jStorage.set("usetsession", new Date());
            $rootScope.chatlist = [];
            $rootScope.isLoggedin = true;
            $rootScope.firstMsg = true;
            $scope.uemail = username;
            $scope.ufname = fullname;
            $scope.usetsession = $.jStorage.get("usetsession");
            $scope.gotsocket = false;
            $scope.usocketId = "";
            // $timeout(function () {
            //     $scope.startio();
            // }, 500);
            io.socket.on($scope.ufname + '_' + $scope.uemail, function (data) {
                $scope.allchats.push(data);
				$rootScope.scrollChatWindow();
                $scope.$apply();
            });
            //location.reload();
            //msg = {Text:"Hi there , this is Meera , your assistant. Let me help you with any of the following tasks. For any other assistance , please type your query in the space below.",type:"SYS_FIRST"};
            msg = {
                Text: "Hi " + $.jStorage.get("ufname") + "! " + $scope.themedata.welcome_message,
                type: "SYS_FIRST"
            };
            $rootScope.pushSystemMsg(0, msg);
            $scope.$on('IdleStart', function () {
                // // the user appears to have gone idle
                //     console.log("Idle started");
            });
            //$rootScope.showQuerybtn();
            // io.socket.on('connect', function socketConnected() {

            //     // Show the main UI
            //     // $('#disconnect').hide();
            //     // $('#main').show();

            //     // Announce that a new user is online--in this somewhat contrived example,
            //     // this also causes the CREATION of the user, so each window/tab is a new user.
            //     userdata = {
            //         sid: $.jStorage.get("id"),
            //         email: $.jStorage.get("email"),
            //         name: $.jStorage.get("fname") + ' ' + $.jStorage.get("lname"),
            //         sname: $.jStorage.get("fname") + ' ' + $.jStorage.get("lname"),
            //         access_role: "user",
            //         livechat:0,
            //     };

            // });








            /*var formData = {username:username};
            
            apiService.login(formData).then(function (callback){
                $.jStorage.flush();
                //if(username == "admin@exponentiadata.com" && password == "admin")
                if(callback.data.value)
                {
                    $.jStorage.set("id", callback.data.data._id);
                    // $.jStorage.set("fname", callback.data.data.fname);
                    $.jStorage.set("name", callback.data.data["Employee Name"]);
                    $.jStorage.set("email", username);
                    // $.jStorage.set("branch", callback.data.data.branch);
                    // $.jStorage.set("access_role", callback.data.data.accessrole);
                    $.jStorage.set("userid", callback.data.data.userid);
                    $.jStorage.set("sessionid", callback.data.data._id);
                    $.jStorage.set("isLoggedin", true);
                    if(!callback.data.data.chunk)
                    {
                        $.jStorage.set("chunk","");
                        $.jStorage.set("Ticket","");
                        $rootScope.qticket = "";
                    }
                    else {
                        $.jStorage.set("chunk",callback.data.data.chunk);
                        $.jStorage.set("Ticket",callback.data.data.chunk.Ticket);
                        $rootScope.qticket = callback.data.data.chunk.Ticket;
                    }
                    
                    $.jStorage.setTTL("isLoggedin", 3600000);
                    
                    $rootScope.chatlist=[];
                    $rootScope.isLoggedin = true;
                    $rootScope.firstMsg = true;  
                    $scope.$on('IdleStart', function() {
                        // the user appears to have gone idle
                        //Idle.setIdle(10);
                        //Idle.watch();
                        console.log("Idle started");
                    });
                    //location.reload();
                    //if(!$rootScope.firstMsg)
                    {
                        msg = {Text:"Hi, How may I help you ?",type:"SYS_FIRST"};
                        $rootScope.pushSystemMsg(0,msg);  
                    }
                }
                else if(callback.data.error.message == -1)
                {
                    $scope.loginerror = -1;
                }
            });
            */
        };


        $rootScope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
        $rootScope.$on('IdleTimeout', function () {
            // $.jStorage.flush();
            // $rootScope.isLoggedin = false;
            // $rootScope.chatlist = [];
            // var scope = angular.element(document.getElementById('chat_window_1')).scope();
            // scope.logout();
            if ($rootScope.agentsessionid != '')
                $rootScope.logoutagent();
            //location.reload();
        });
        $rootScope.pushLinkmsg = function (index, link) {
            //alert(link);

            $rootScope.pushQuestionMsg(index, link);
        };
        $scope.mailus = function () {
            var msg = {
                type: "SYS_MAIL"
            };
            $rootScope.pushSystemMsg(0, msg);
        };
        $scope.callus = function () {
            var msg = {
                type: "SYS_CALL"
            };
            $rootScope.pushSystemMsg(0, msg);
        };
        $scope.chatwithhuman = function () {
            //window.open('http://www.ross-simons.com/content/_05_livechat.htm#','winname','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=350,height=450');
            //$rootScope.minimizeChatwindow();
        };
        $(document).on('click', 'a.mailus', function () {
            $scope.mailus();
        });
        $(document).on('click', 'a.callus', function () {
            $scope.callus();
        });
        $rootScope.getCategory = function () {
            apiService.getCategory().then(function (response) {
                //$rootScope.links = response.data;
                //$rootScope.categories = response.data.data;
                // $rootScope.returnpolicy =  response.data.data;
                // console.log(response.data);

                msg2 = {
                    categories: angular.copy(response.data.data),
                    type: "new_product"
                };
                $rootScope.chatlist.push({
                    id: 0,
                    msg: msg2,
                    position: "left",
                    curTime: $rootScope.getDatetime()
                });
                $rootScope.showMsgLoader = false;
                $rootScope.scrollChatWindow();
            });
        };
        $scope.getvip = function () {
            formData = {
                customer_name: $.jStorage.get("name"),
                customer_id: $.jStorage.get("email"),
                user_input: 'vip_rewards',
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            apiService.getCategoryFAQ(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    if (value.type == "text") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;


                        return false;
                    }
                    if (value.type == "show employee") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $rootScope.showempprev = $scope.prevtext;
                        $scope.prevtext = "";
                        return false;
                    }
                    if (value.type == "product listing") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                        return false;
                    }
                    // if(value.type=="rate card")
                    // {
                    //     $rootScope.pushSystemMsg(0,data.data.data);
                    //     $rootScope.showMsgLoader = false;


                    //     return false;
                    // }
                    else if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                    // else if(value.type=="Instruction")
                    // {
                    // 	$rootScope.InstructionResponse(0,data.data.data);  
                    // }
                    if (value.type == "faq") {
                        // var reversefaq = new Array();
                        // //console.log(data.data.tiledlist[0].FAQ);
                        // reversefaq = _.reverse(data.data.tiledlist[0].FAQ);
                        // data.data.tiledlist[0].FAQ = reversefaq;
                        //console.log(reversefaq);
                        $rootScope.FAQResponse(0, data.data);
                    }
                    if (value.type == "qlikframe") {
                        value.prevmsg = prevmsg;

                        $rootScope.pushSystemMsg(0, data.data);
                        if (value.flag == 5) {
                            $timeout(function () {
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel' + ($rootScope.chatlist.length - 1)).find('.item').first().addClass('active');
                            }, 2000);
                        }
                    }
                    if (value.type == "html_form") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                    }
                });


                //$.jStorage.set("sessiondata",data.data.data.session_obj_data);
            }).catch(function (reason) {
                //console.log(reason);
                //msg = {Text:"Nope ! didn't catch that . Do you want to <a href='#' class='mailus'>Mail Us</a>",type:"SYS_EMPTY_RES"};
                msg = {
                    Text: "Sorry I did not get you.Could you please try another query.",
                    type: "SYS_EMPTY_RES"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            });
        };
        $rootScope.getproductbycategory = function (category) {
            $scope.formData = {
                category: category
            };
            apiService.getproductbycategory($scope.formData).then(function (response) {
                //$rootScope.links = response.data;
                //$rootScope.categories = response.data.data;
                // $rootScope.returnpolicy =  response.data.data;
                // console.log(response.data.data);

                msg2 = {
                    products: angular.copy(response.data.data),
                    type: "product_carousel"
                };
                // console.log(msg2);
                //msg2.images = 
                $rootScope.chatlist.push({
                    id: 0,
                    msg: msg2,
                    position: "left",
                    curTime: $rootScope.getDatetime()
                });
                $rootScope.showMsgLoader = false;
                $rootScope.scrollChatWindow();
                $timeout(function () {
                    $('.carousel').carousel({
                        interval: false,
                        wrap: false
                    });
                    $('.carousel' + ($rootScope.chatlist.length - 1)).find('.item').first().addClass('active');
                }, 2000);
            });
        };

        $(document).on('click', '.breakdownbtn', function () {
            $(this).parent().find('.breakdownid').toggle("slow");
        });
        $rootScope.getSearch = function (searchtext) {
            $rootScope.pushMsg(0, searchtext);
        };
        $rootScope.getTopsearch = function () {
            var formData = {
                customer_name: $.jStorage.get("name"),
                customer_id: $.jStorage.get("email"),
                user_input: "",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            apiService.gettopsearch(formData).then(function (response) {
                //$rootScope.links = response.data;
                // $rootScope.dsepolicy = response.data.data;
                // //console.log(response.data);
                // msg2={queslink:angular.copy(response.data.data),type:"cat_faq_ans_dsepolicy"};
                // console.log(msg2);
                // $rootScope.chatlist.push({id:0,msg:msg2,position:"right",curTime: $rootScope.getDatetime()});
                // $rootScope.showMsgLoader=false;
                // $rootScope.scrollChatWindow();
                angular.forEach(response.data.tiledlist, function (value, key) {
                    if (value.type == "top_search") {
                        $rootScope.pushSystemMsg(0, response.data);
                        $rootScope.showMsgLoader = false;
                    }
                });
            });
        };
        $rootScope.getfaqans = function (id, index) {
            var ans = $rootScope.faqs[index];
            msg2 = {
                anslink: angular.copy(ans),
                type: "cat_faq_ans"
            };
            // console.log(msg2);
            $rootScope.chatlist.push({
                id: 0,
                msg: msg2,
                position: "left",
                curTime: $rootScope.getDatetime()
            });
            $rootScope.showMsgLoader = false;
            $timeout(function () {
                $rootScope.scrollChatWindow();
            }, 1000);
        };
        $rootScope.getCategoryFAQ = function (category) {
            $scope.formData = {
                user_input: category._id,
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $.jStorage.get("session_id")
            };
            //console.log($scope.formData);
            apiService.getCategoryFAQ($scope.formData).then(function (response) {
                $rootScope.links = response.data;
                //console.log(response.data);
            });
        };

        $rootScope.getCategoryQuestions = function (category) {
            categoryid = category._id;

            $scope.formData = {
                category: categoryid
            };
            //console.log(category.name);
            apiService.getCategoryQuestions($scope.formData).then(function (response) {
                $rootScope.links = response.data.data;
                $rootScope.links.type = "cat_faq";
                if (category.name == "Choose a Category")
                    $("div#all_questions").css("background", "none");
                else
                    $("div#all_questions").css("background", "#EF9C6D");
                //console.log($rootScope.links);
            });
        };
        $rootScope.getDatetime = function () {
            //return (new Date).toLocaleFormat("%A, %B %e, %Y");
            return currentTime = new Date();
        };
        $rootScope.chatText = "";
        $rootScope.answers = "";
        $rootScope.getAutocomplete = function (chatText) {
            $rootScope.showTimeoutmsg = false;
            // if($rootScope.showTimeoutmsg == false && chatText=="") 
            // {
            //     $timeout(function () {
            //         $rootScope.showTimeoutmsg = true;
            //         msg = {Text:"Any Confusion ? How May I help You ?",type:"SYS_INACTIVE"};
            //         $rootScope.pushSystemMsg(0,msg);
            //     },60000);
            // }
            if (!$rootScope.agentconnected) {
                // $rootScope.chatText = chatText;
                // if(chatText == "" || chatText == " " || chatText == null)
                //     $rootScope.autocompletelist = [];
                // else {
                //     $rootScope.chatdata = { string:$rootScope.chatText};
                //     apiService.getautocomplete($rootScope.chatdata).then(function (response){
                //         // console.log(response.data);
                //         $rootScope.autocompletelist = response.data.data;
                //     });
                // }
            }
            // var languageid = $.jStorage.get("language");
            // $scope.formData = {"text": chatText,"language":languageid };
            // apiService.translate($scope.formData).then( function (response) {
            //     //$(".chatinput").val(response.data.data);
            //     console.log(response.data.data);
            // });
        };
        $rootScope.showFAQAns = function (e) {
            $(e).parent().parent().parent().find('.faqans').slideDown();
            //$rootScope.scrollChatWindow();
        };
        $rootScope.pushSystemMsg = function (id, value) {
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;

            $rootScope.chatlist.push({
                id: "id",
                msg: value,
                position: "left",
                curTime: $rootScope.getDatetime()
            });
            $.jStorage.set("chatlist", $rootScope.chatlist);
            $timeout(function () {
                $rootScope.scrollChatWindow();
            }, 1500);
            $timeout(function () {
                $rootScope.autocompletelist = [];
            }, 2000);
        };
        $scope.trustedHtml = function (plainText) {
            return $sce.trustAsHtml(plainText);
        };
        $rootScope.pushQuesMsg = function (id, value) {
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;
            var value2 = $rootScope.links;
            if (value2[id].link != "") {
                var linkdata = "";
                var prev_res = false;

                final_link = value2[id].link.split("<br>");
                var languageid = $.jStorage.get("language");
                $scope.formData = {
                    "items": final_link,
                    "language": languageid,
                    arr_index: id
                };
                apiService.translatelink($scope.formData).then(function (response) {
                    value2.queslink = response.data.data.linkdata;
                    value2.queslink = $sce.trustAsHtml(value2.queslink);
                    msg2 = {
                        "queslink": angular.copy(value2.queslink),
                        type: "cat_faq"
                    };
                    $timeout(function () {
                        $rootScope.chatlist.push({
                            id: id,
                            msg: msg2,
                            position: "left",
                            curTime: $rootScope.getDatetime()
                        });
                        $rootScope.showMsgLoader = false;
                        $rootScope.scrollChatWindow();
                    }, 1500);
                });
                // _.each(final_link, function(value, key) {
                //     var languageid = $.jStorage.get("language");
                //     $scope.formData = {"text": value,"language":languageid };
                //     // var dummy = "id='"+key+"' data-id='"+id+"' ng-click='pushPortalLink("+id+","+key+");'";
                //     // linkdata += "<p class='portalapp' "+dummy+">"+value+"</p>";

                //     // value2.queslink = $sce.trustAsHtml(value2.queslink);
                //     // msg2={"queslink":angular.copy(value2.queslink),type:"cat_faq"};
                //     // $timeout(function(){
                //     //     $rootScope.chatlist.push({id:id,msg:msg2,position:"left",curTime: $rootScope.getDatetime()});
                //     //     $rootScope.showMsgLoader=false;
                //     //     $rootScope.scrollChatWindow();
                //     // },2000);
                //     console.log(key,"k");
                //     if(key == 0)
                //         prev_res = true;
                //     else
                //         prev_res = false;
                //     console.log(prev_res);
                //     if(prev_res)
                //     {    
                //         apiService.translate($scope.formData).then( function (response) {
                //             //console.log(response);
                //             prev_res = true;
                //             if(response.xhrStatus == "complete")
                //             {
                //                 var dummy = "id='"+key+"' data-id='"+id+"' ng-click='pushPortalLink("+id+","+key+");'";
                //                 linkdata += "<p class='portalapp' "+dummy+">"+response.data.data+"</p>";
                //                 console.log(linkdata);
                //                 console.log(response.data.data);
                //                 if(key == (final_link.length-1))
                //                 {
                //                     //console.log(key+"-key,length:"+final_link.length);
                //                     value2.queslink=linkdata;
                //                     console.log(value2.queslink);
                //                     value2.queslink = $sce.trustAsHtml(value2.queslink);

                //                     msg2={"queslink":angular.copy(value2.queslink),type:"cat_faq"};
                //                     $timeout(function(){
                //                         $rootScope.chatlist.push({id:id,msg:msg2,position:"left",curTime: $rootScope.getDatetime()});
                //                         $rootScope.showMsgLoader=false;
                //                         $rootScope.scrollChatWindow();
                //                     },2000);
                //                     console.log($rootScope.chatlist);
                //                 }
                //                 return;
                //             }

                //         }).finally(function() {

                //         });
                //     }
                // });
                //value2.queslink=linkdata;
            } else {
                value2.queslink = value2[id].answers.replace(new RegExp("../static/data_excel/", 'g'), adminurl2 + 'static/data_excel/');
                value2.queslink = $sce.trustAsHtml(value2.queslink);

                msg2 = {
                    "queslink": angular.copy(value2.queslink),
                    type: "cat_faqlink"
                };
                $timeout(function () {
                    $rootScope.chatlist.push({
                        id: id,
                        msg: msg2,
                        position: "left",
                        curTime: $rootScope.getDatetime()
                    });
                    $rootScope.showMsgLoader = false;
                    $rootScope.scrollChatWindow();
                }, 2000);
            }

            // value2.queslink = $sce.trustAsHtml(value2.queslink);

            // msg2={"queslink":angular.copy(value2.queslink),type:"cat_faq"};
            // $timeout(function(){
            //     $rootScope.chatlist.push({id:id,msg:msg2,position:"left",curTime: $rootScope.getDatetime()});
            //     $rootScope.showMsgLoader=false;
            //     $rootScope.scrollChatWindow();
            // },2000);
            // $el = $( "ul.chat li" ).last();
            // console.log($el);
            // $compile($el)($scope);

            //$.jStorage.set("chatlist",$rootScope.chatlist);


        };
        $rootScope.pushPortalLink = function (id, type) {
            // console.log(id, "index"); //index of array
            // console.log(type, "value"); // 0-ion portal ,1-ion app
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = type;
            var value3 = $rootScope.links;
            if (value3[id].answers != "") {
                var answer1 = new Array();
                answer1 = value3[id].answers.split("(2nd)");
                if (type == 0)
                    answer1 = answer1[0];
                else if (type == 1)
                    answer1 = answer1[1];
                answer1 = answer1.replace("\n", "<br />", "g");
                value3.queslink = answer1;

            }
            value3.queslink = $sce.trustAsHtml(value3.queslink);
            //$compile(linkdata)($scope);
            msg2 = {
                "queslink": angular.copy(value3.queslink),
                type: "cat_faqlink"
            };
            $rootScope.chatlist.push({
                id: id,
                msg: msg2,
                position: "left",
                curTime: $rootScope.getDatetime()
            });
            $rootScope.showMsgLoader = false;
            //$.jStorage.set("chatlist",$rootScope.chatlist);
            $timeout(function () {
                $rootScope.scrollChatWindow();
            });
        };
        $rootScope.showChatwindow = function () {
            // newlist = $.jStorage.get("chatlist");
            // if(!newlist || newlist == null)
            // {
            //     $rootScope.firstMsg = false;
            // }
            // else
            // { 
            //     $rootScope.firstMsg = true;
            // }
            // //$.jStorage.set("showchat",true);
            if (!$rootScope.firstMsg) {
                $rootScope.firstMsg = true;

                //msg = {Text:"Hi there , this is Meera , your assistant. Let me help you with any of the following tasks. For any other assistance , please type your query in the space below.",type:"SYS_FIRST"};
                //    if( !$scope.findmsg ){
                //     msg = {
                //         Text: "Hi! There, Welcome to Ross-Simons live chat support. Please type your query to begin",
                //         type: "SYS_FIRST"
                //     };
                //    }
                //    else{
                //     msg = {
                //         Text: $scope.findmsg.message,
                //         type: "SYS_FIRST"
                //     }

                //    }
                msg = {
                    Text: "Hi " + $.jStorage.get("ufname") + "! " + $scope.themedata.welcome_message,
                    type: "SYS_FIRST"
                };
                $rootScope.pushSystemMsg(0, msg);
            }

            if ($rootScope.chatlist.length == 0)
                $rootScope.showQuerybtn();
            $('#chat_panel').slideDown("slow");
            //$('#chat_panel').find('.panel-body').slideDown("fast");
            //$('#chat_panel').find('.panel-footer').slideDown("slow");
            $('.panel-heading span.icon_minim').removeClass('panel-collapsed');
            $('.panel-heading span.icon_minim').removeClass('glyphicon-plus').addClass('glyphicon-minus');
            $("#chatImage").hide();
            $rootScope.chatOpen = true;
            $rootScope.scrollChatWindow();

        };
        angular.element(document).ready(function () {

            // $rootScope.showChatwindow();
        });
        $rootScope.scrollleft = function () {
            // $(".btnright").hide();
            // $(".btnleft").show();
            // $timeout(function(){
            //     var btnwidth = $(".hulbtns").width();
            //     $('.hulbtns').animate({scrollLeft: btnwidth});
            // });
        };
        $rootScope.scrollright = function () {
            // $(".btnright").show();
            // $(".btnleft").hide();
        };
        $rootScope.minimizeChatwindow = function () {
            $.jStorage.set("showchat", false);
            $rootScope.showTimeoutmsg = false;
            $rootScope.autocompletelist = [];
            $('#chat_panel').slideUp();
            //$('#chat_panel').find('.panel-body').slideUp("fast");
            //$('#chat_panel').find('.panel-footer').slideUp("fast");
            $('.panel-heading span.icon_minim').addClass('panel-collapsed');
            $('.panel-heading span.icon_minim').addClass('glyphicon-plus').removeClass('glyphicon-minus');
            $("#chatImage").show("fadeIn");
        };
        $rootScope.appendSysMsg = function (id, value) {
            //console.log(value);
            if (!value.flag)
                value.flag = 2;
            $rootScope.currentProjectUrl = value.url;

            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;
            $rootScope.chatlist.push({
                id: "id",
                msg: value,
                position: "left",
                curTime: $rootScope.getDatetime()
            });
            $.jStorage.set("chatlist", $rootScope.chatlist);
            $timeout(function () {
                $rootScope.scrollChatWindow();
            });
        };
        $rootScope.appendMsg = function (id, value) {
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;
            $rootScope.autocompletelist = [];
            $rootScope.chatlist.push({
                id: "id",
                msg: value,
                position: "right",
                curTime: $rootScope.getDatetime()
            });
            //console.log("msgid="+id+"chatmsg="+$rootScope.msgSelected);
            $.jStorage.set("chatlist", $rootScope.chatlist);
            $rootScope.msgSelected = false;
            $rootScope.scrollChatWindow();
        };
        $rootScope.submitMsg = function () {

            if ($(".chatinput").val() != "") {
                $rootScope.pushMsg(0, $(".chatinput").val());
                $('#userMsg').val('');
            }
        };
        $rootScope.pushMsg = function (id, value) {
            if ($rootScope.agentconnected) {
                $rootScope.autocompletelist = [];
                /*$rootScope.chatlist.push({
                    id: "id",
                    msg: value,
                    position: "right",
                    curTime: $rootScope.getDatetime()
                });*/
                //$rootScope.sendMsgtoagent(value);
				/*
                addMessageToConversation($rootScope.userid, $rootScope.lastagentid, value);
                io.socket.post('/chat/private', {
                    to: $rootScope.lastagentid,
                    fromid: $rootScope.userid,
                    // fromname: $.jStorage.get('fname') + ' ' + $.jStorage.get('lname'),
                    fromname: $scope.ufname,
                    fromaccess: "",
                    from_socketid: $scope.usocketId,
                    fromemail: $scope.uemail,
                    msg: value
                });
                var formData = {
                    session_id: $.jStorage.get('session_id'),
                    msg: value,
                    from_id: $scope.uemail,
                    fromid: $rootScope.userid,
                    fromname: $scope.ufname,
                    from_socketid: $scope.usocketId,
                    toid: $rootScope.lastagentid,
                    toname: $rootScope.agentdet.sname,
                    to_id: $rootScope.agentdet.email,
                    to_socketid: $rootScope.agentdet.socketid
                };
                apiService.saveagentchat(formData).then(function (data) {

                });*/
				apiService.sendmsg({
					email: $scope.uemail,
					name: $scope.ufname,
					from_id:$scope.uemail,
					fromname:$scope.ufname,
					to_id:$rootScope.lastagentid,
					toname:$rootScope.lastagentname,
					msg: value
				}).then(function (data) {

				});
                $rootScope.scrollChatWindow();
            } else {
                if (value != "") {
                    $rootScope.msgSelected = true;
                    $rootScope.chatmsgid = id;
                    $rootScope.chatmsg = value;
                    $rootScope.autocompletelist = [];
                    $rootScope.chatlist.push({
                        id: "id",
                        msg: value,
                        position: "right",
                        curTime: $rootScope.getDatetime()
                    });
                    //console.log("msgid="+id+"chatmsg="+$rootScope.msgSelected);
                    $rootScope.getSystemMsg(id, value);
                    $.jStorage.set("chatlist", $rootScope.chatlist);
                    $rootScope.msgSelected = false;
                    $rootScope.showMsgLoader = true;
                    $rootScope.chatText = "";
                    $(".chatinput").val("");
                    $rootScope.scrollChatWindow();
                }
            }
        };
        $rootScope.pushAutoMsg = function (id, value, answer) {
            $rootScope.msgSelected = true;
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;
            $rootScope.answers = answer;
            // console.log(answer);
            $rootScope.autocompletelist = [];
            $rootScope.chatlist.push({
                id: id,
                msg: value,
                position: "right",
                curTime: $rootScope.getDatetime()
            });
            //console.log("msgid="+id+"chatmsg="+$rootScope.msgSelected);
            var automsg = {
                Text: answer,
                type: "SYS_AUTO"
            };
            $rootScope.pushSystemMsg(id, automsg);
            $rootScope.showMsgLoader = false;
            //$.jStorage.set("chatlist",$rootScope.chatlist);
            $rootScope.msgSelected = false;
            $rootScope.chatmsgid = "";
            $rootScope.chatmsg = "";
            $rootScope.answers = "";
            $rootScope.scrollChatWindow();
        };
        $rootScope.pushQuestionMsg = function (id, value) {
            $rootScope.msgSelected = true;
            $rootScope.chatmsgid = id;
            $rootScope.chatmsg = value;
            $rootScope.autocompletelist = [];
            $rootScope.chatlist.push({
                id: id,
                msg: value,
                position: "right",
                curTime: $rootScope.getDatetime()
            });
            $rootScope.getQuestionMsg(id, value);
            $rootScope.msgSelected = false;
            //$rootScope.showMsgLoader=true;
            $rootScope.scrollChatWindow();
        };
        // if($.jStorage.get("showchat"))
        //     $rootScope.showChatwindow();
        // else
        //     $rootScope.minimizeChatwindow();

        $rootScope.ratecardSubmit = function (coldata, rowdata) {
            // console.log(coldata, rowdata);
        };
        $rootScope.datesubmit = function (ddate, stage, dthlink, index) {
            var mysession = {};

            // console.log(stage + "-" + dthlink);
            mysession.DTHlink = dthlink;
            //mysession.DTHline=lineno;
            //mysession.DTHcol=colno;
            mysession.DTHstage = stage;
            // formData = {};
            // formData.DTHcol = colno;
            // formData.DTHline = lineno;
            // formData.DTHlink = dthlink;
            var dt = new Date(ddate);
            var date = dt.getDate();
            var month = dt.getMonth();
            var year = dt.getFullYear();
            month = month + 1;
            if (month.toString().length == 1) {
                month = "0" + month
            }
            if (date.toString().length == 1) {
                date = "0" + date
            }
            newdate = date.toString() + "-" + month.toString() + "-" + year.toString();

            formData = mysession;
            formData.csrfmiddlewaretoken = $rootScope.getCookie("csrftoken");
            formData.user_id = $.jStorage.get("session_id");
            formData.Form_Key = "Date";
            formData.Form_Value = newdate;
            formData.customer_name = $.jStorage.get("name");
            formData.customer_id = $.jStorage.get("email");
            apiService.getDthlinkRes(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                });
            }).catch(function (reason) {
                // console.log(reason);
            });
        };
        $rootScope.productsubmit = function (productname, stage, dthlink, index) {
            var mysession = {};

            // console.log(stage + "-" + dthlink);
            mysession.DTHlink = dthlink;
            //mysession.DTHline=lineno;
            //mysession.DTHcol=colno;
            mysession.DTHstage = stage;
            // formData = {};
            // formData.DTHcol = colno;
            // formData.DTHline = lineno;
            // formData.DTHlink = dthlink;
            formData = mysession;
            formData.csrfmiddlewaretoken = $rootScope.getCookie("csrftoken");
            formData.user_id = $.jStorage.get("session_id");
            formData.Form_Key = "Product_Name";
            formData.Form_Value = productname;
            formData.customer_name = $.jStorage.get("name");
            formData.customer_id = $.jStorage.get("email");
            apiService.getDthlinkRes(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                });
            }).catch(function (reason) {
                // console.log(reason);
            });
        };
        $rootScope.getDthlinkRes4 = function (stage, dthlink, diff, ra) {
            //console.log(colno,lineno,dthlink);
            //mysession = $.jStorage.get("sessiondata");
            var mysession = {};

            //console.log(stage+"-"+dthlink);
            mysession.DTHlink = dthlink;
            //mysession.DTHline=lineno;
            //mysession.DTHcol=colno;
            mysession.DTHstage = stage;
            // mysession.order=orderno;
            $scope.ra = ra;
            mysession.form_name = 'diff';
            mysession.diff = diff;
            // formData = {};
            // formData.DTHcol = colno;
            // formData.DTHline = lineno;
            // formData.DTHlink = dthlink;
            $rootScope.chatlist.push({
                id: "id",
                msg: dthlink,
                position: "right",
                curTime: $rootScope.getDatetime()
            });

            formData = mysession;
            formData.csrfmiddlewaretoken = $rootScope.getCookie("csrftoken");
            formData.user_id = $.jStorage.get("session_id");
            formData.customer_name = $.jStorage.get("name");
            formData.customer_id = $.jStorage.get("email");
            apiService.getDthlinkRes(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                    if (value.type == "html_form") {
                        data.data.tiledlist[0].form_data.DTHlink = data.data.tiledlist[0].stage_details.DT[0];
                        data.data.tiledlist[0].form_data.DTHstage = data.data.tiledlist[0].stage_details.Stage;
                        $rootScope.pushSystemMsg(0, data.data);
                    }

                    if (value.type == "recommend") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                    if (value.type == "product listing") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                });
            }).catch(function (reason) {
                // console.log(reason);
                $rootScope.msgSelected = false;
                $rootScope.scrollChatWindow();
            });
        };
        $scope.orderno = "";
        $rootScope.getDthlinkRes3 = function (stage, dthlink, orderno, ra) {
            //console.log(colno,lineno,dthlink);
            //mysession = $.jStorage.get("sessiondata");
            var mysession = {};

            //console.log(stage+"-"+dthlink);
            mysession.DTHlink = dthlink;
            //mysession.DTHline=lineno;
            //mysession.DTHcol=colno;
            mysession.DTHstage = stage;
            mysession.order = orderno;
            $scope.ra = ra;
            $scope.orderno = orderno;
            mysession.form_name = dthlink.replace(/ /g, "_");
            // formData = {};
            // formData.DTHcol = colno;
            // formData.DTHline = lineno;
            // formData.DTHlink = dthlink;
            $rootScope.chatlist.push({
                id: "id",
                msg: dthlink,
                position: "right",
                curTime: $rootScope.getDatetime()
            });

            formData = mysession;
            formData.csrfmiddlewaretoken = $rootScope.getCookie("csrftoken");
            formData.user_id = $.jStorage.get("session_id");
            formData.customer_name = $.jStorage.get("name");
            formData.customer_id = $.jStorage.get("email");
            apiService.getDthlinkRes(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                    if (value.type == "html_form") {
                        data.data.tiledlist[0].form_data.DTHlink = data.data.tiledlist[0].stage_details.DT[0];
                        data.data.tiledlist[0].form_data.DTHstage = data.data.tiledlist[0].stage_details.Stage;
                        $rootScope.pushSystemMsg(0, data.data);
                    }

                    if (value.type == "recommend") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                    if (value.type == "product listing") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                });
            }).catch(function (reason) {
                // console.log(reason);
                $rootScope.msgSelected = false;
                $rootScope.scrollChatWindow();
            });
        };
        $rootScope.getDthlinkRes = function (stage, dthlink, index) {
            //console.log(colno,lineno,dthlink);
            //mysession = $.jStorage.get("sessiondata");
            var mysession = {};
            if (dthlink == 'Return Authorization' || dthlink == 'Exchange with the same product' || dthlink == 'exchange1' || dthlink == 'Okay') {
                mysession.ra = $scope.ra;
                //$scope.ra="";
            }
            //console.log(stage+"-"+dthlink);
            mysession.DTHlink = dthlink;
            //mysession.DTHline=lineno;
            //mysession.DTHcol=colno;
            mysession.DTHstage = stage;
            // formData = {};
            // formData.DTHcol = colno;
            // formData.DTHline = lineno;
            // formData.DTHlink = dthlink;
            var inputDate = new Date();
            $rootScope.chatlist.push({
                id: "id",
                msg: dthlink,
                position: "right",
                curTime: $rootScope.getDatetime()
            });

            formData = mysession;
            formData.csrfmiddlewaretoken = $rootScope.getCookie("csrftoken");
            formData.user_id = $.jStorage.get("session_id");
            formData.customer_name = $.jStorage.get("name");
            formData.customer_id = $.jStorage.get("email");
            apiService.getDthlinkRes(formData).then(function (data) {
                angular.forEach(data.data.tiledlist, function (value, key) {
                    var topic2 = "";
                    var outputDate = new Date();
                    var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
                    if (data.data.tiledlist[0].topic)
                        topic2 = data.data.tiledlist[0].topic;
                    var Journey_Name2 = "";
                    if (data.data.tiledlist[0].Journey_Name)
                        Journey_Name2 = data.data.tiledlist[0].Journey_Name;
                    var obj = {
                        DTHstage: stage,
                        DTHlink: dthlink,
                        session_id: $.jStorage.get('session_id'),
                        user: $.jStorage.get('email'),
                        user_input: '',
                        response: data.data.tiledlist[0],
                        topic: topic2,
                        Journey_Name: Journey_Name2,
                        responsetype: value.type,
                        inputDate: inputDate,
                        outputDate: outputDate,
                        respdiff: respdiff,
                        // context_id: $.jStorage.get("context_id"),
                        // conversation_id: $.jStorage.get("conversation_id")
                    };
                    $rootScope.savehistory(obj);
                    if (value.type == "DTHyperlink") {
                        $rootScope.DthResponse(0, data.data);
                    }
                    if (value.type == "html_form") {
                        data.data.tiledlist[0].form_data.DTHlink = data.data.tiledlist[0].stage_details.DT[0];
                        data.data.tiledlist[0].form_data.DTHstage = data.data.tiledlist[0].stage_details.Stage;
                        $rootScope.pushSystemMsg(0, data.data);
                    }

                    if (value.type == "recommend") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                    if (value.type == "product listing") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                    if (value.type == "diff product") {
                        $rootScope.pushSystemMsg(0, data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function () {
                            $('.carousel').carousel({
                                interval: false,
                                wrap: false
                            });
                            $('.carousel').find('.item').first().addClass('active');
                        }, 2000);

                    }
                });
            }).catch(function (reason) {
                // console.log(reason);
                $rootScope.msgSelected = false;
                $rootScope.scrollChatWindow();
            });
        };
        $rootScope.DthResponse = function (id, data) {
            // if(data.tiledlist[0].DT.length > 0 || data.tiledlist[0].Text != "")
            // {

            //     if(data.tiledlist[0].DT.length > 0 || ( data.tiledlist[0].Text != "" && data.tiledlist[0].Text)  )
            //         $rootScope.pushSystemMsg(id,data);

            // }
            var dtstage = data.tiledlist[0].Stage;
            var dtstage = dtstage.replace(".", "");
            //var dtstage = "";
            data.tiledlist[0].bgstage = dtstage;
            $rootScope.pushSystemMsg(id, data);
            $rootScope.showMsgLoader = false;
        };
        $rootScope.savehistory = function (obj) {
            //console.log(obj);
            apiService.savehistory(obj).then(function (response) {

            });
        };
        $rootScope.FAQResponse = function (id, data) {
            $rootScope.pushSystemMsg(id, data);
            // console.log(data);
            $rootScope.showMsgLoader = false;
        };
        $rootScope.InstructionResponse = function (id, data) {
            $rootScope.pushSystemMsg(id, data);
            // console.log(data);
            $('#myCarousel').carousel({
                interval: false,
                wrap: false
            });
            $('#myCarousel').find('.item').first().addClass('active');
            $rootScope.showMsgLoader = false;
        };
        $rootScope.getQuestionMsg = function (index, value) {
            $rootScope.pushQuesMsg(index, value);
            $rootScope.showMsgLoader = false;
        };
        $rootScope.getSystemMsg = function (id, value) {
            //console.log("id",id);
            var prevmsg = value;
            sess2 = {
                id: id,
                Text: value
            };
            var inputDate = new Date();
            //CsrfTokenService.getCookie("csrftoken").then(function(token) {

            //var mysessiondata = $.jStorage.get("sessiondata");
            //mysessiondata = mysessiondata.toObject();
            //mysessiondata.data = {id:parseInt(id),Text:value};
            //mysessiondata.data = {id:id,Text:value};
            //$rootScope.formData = mysessiondata;
            $scope.prevtext = value;
            $timeout(function () {
                $(".chatinput").val("");
            });

            // io.socket.get('/user', function (users) {
            //         var newuser = _.remove(users, function (n) {
            //             return n.livechat == "1";
            //         });
            //         if (newuser.length > 0) {
            //             $rootScope.agentconnected = true;
            //             if ($rootScope.agentconnected) {

            //                 $rootScope.sendMsgtoagent(sess2.Text, inputDate);
            //                 var outputDate = new Date();
            //                 var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //                 // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),livechat:1,session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:prevmsg,response:{},topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
            //                 // $rootScope.savehistory(obj);
            //             }

            //         } else {
            //             $rootScope.agentconnected = false;
            //             var msg3 = {
            //                 Text: "Sorry I could not understand",
            //                 type: "SYS_EMPTY_RES"
            //             };
            //             $rootScope.pushSystemMsg(0, msg3);
            //             // console.log(io.socket);
            //             // console.log("connect");
            //             // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:msg,response:msg3,topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
            //             // $rootScope.savehistory(obj);

            //         }
            //     });
            var inputDate = new Date();
            // if ($scope.offlinemessage.ustat) {
            //     //console.log();
            //     apiService.sendchat({
            //         email: $scope.uemail,
            //         name: $scope.ufname,
            //         msg: value
            //     }).then(function (data) {
            //         if (data.data.data) {
			// 			$rootScope.showMsgLoader = false;
            //             $rootScope.agentconnected = true;
            //             $rootScope.lastagentid = data.data.data.email;
			// 			$rootScope.lastagentname=data.data.data.name;
			// 			var msg1 = {
			// 				//Text: "I am a Bot,I am still learning. <br>We’re finding the best person to connect with you.Please stay online.",
			// 				Text: "Hi, I am " + data.data.data.name + " " + $scope.themedata.agent_message,

			// 				type: "SYS_EMPTY_RES"
			// 			};
			// 			// one of our agents will attend to you right away.
			// 			$rootScope.pushSystemMsg(0, msg1);
			// 			$rootScope.lastagentmsg = true;
            //         }
			// 		else {
            //             $rootScope.showMsgLoader = false;
            //             $rootScope.agentconnected = false;
            //             var msg3 = {
            //                 //Text: "Hi we are currently unavailable at the moment , please leave a message and we will get back to you shortly",
            //                 Text: $scope.offlinemessage.offline_messages,
            //                 type: "LIVE_EMPTY_RES"
            //             };
            //             $rootScope.pushSystemMsg(0, msg3);
            //             $rootScope.offlineuser = true;
            //             var outputDate = new Date();
            //             var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //             var obj = {
            //                 // context_id: $.jStorage.get("context_id"),
            //                 // conversation_id: $.jStorage.get("conversation_id"),
            //                 session_id: $.jStorage.get('session_id'),
            //                 user: $scope.uemail,
            //                 username: $scope.ufname,
            //                 user_input: prevmsg,
            //                 response: {},
            //                 topic: "",
            //                 Journey_Name: "",
            //                 responsetype: "",
            //                 inputDate: inputDate,
            //                 outputDate: outputDate,
            //                 respdiff: respdiff,
            //                 unanswered: 1,
            //                 offline: 1,
            //                 clientname: $scope.ufname,
            //                 socketid: ""
            //             };
            //             $rootScope.savehistory(obj);

            //         }
            //     });
            //     /*apiService.getliveuser().then(function (data) {
            //         if (data.data.data.length > 0) {
            //             $rootScope.agentconnected = true;
            //             if ($rootScope.agentconnected) {

            //                 $rootScope.sendMsgtoagent(sess2.Text, inputDate);
            //                 var outputDate = new Date();
            //                 var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //                 // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),livechat:1,session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:prevmsg,response:{},topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
            //                 // $rootScope.savehistory(obj);
            //             }

            //         } else {
            //             $rootScope.showMsgLoader = false;
            //             $rootScope.agentconnected = false;
            //             var msg3 = {
            //                 //Text: "Hi we are currently unavailable at the moment , please leave a message and we will get back to you shortly",
            //                 Text: $scope.offlinemessage.offline_messages,
            //                 type: "LIVE_EMPTY_RES"
            //             };
            //             $rootScope.pushSystemMsg(0, msg3);
            //             $rootScope.offlineuser = true;
            //             var outputDate = new Date();
            //             var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //             var obj = {
            //                 // context_id: $.jStorage.get("context_id"),
            //                 // conversation_id: $.jStorage.get("conversation_id"),
            //                 session_id: $.jStorage.get('session_id'),
            //                 user: $scope.uemail,
            //                 username: $scope.ufname,
            //                 user_input: prevmsg,
            //                 response: {},
            //                 topic: "",
            //                 Journey_Name: "",
            //                 responsetype: "",
            //                 inputDate: inputDate,
            //                 outputDate: outputDate,
            //                 respdiff: respdiff,
            //                 unanswered: 1,
            //                 offline: 1,
            //                 clientname: $scope.ufname,
            //                 socketid: $scope.socketId
            //             };
            //             $rootScope.savehistory(obj);
            //             // console.log(io.socket);
            //             // console.log("connect");
            //             // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:msg,response:msg3,topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
            //             // $rootScope.savehistory(obj);

            //         }
            //     });*/
            // } else {


            //     var msg3 = {
            //         //Text: "Hi we are currently unavailable at the moment , please leave a message and we will get back to you shortly",
            //         Text: $scope.offlinemessage.inactive_messages,
            //         type: "LIVE_EMPTY_RES"
            //     };
            //     $rootScope.pushSystemMsg(0, msg3);
            //     $rootScope.offlineuser = true;
            //     var outputDate = new Date();
            //     var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //     var obj = {
            //         // context_id: $.jStorage.get("context_id"),
            //         // conversation_id: $.jStorage.get("conversation_id"),
            //         session_id: $.jStorage.get('session_id'),
            //         user: $scope.uemail,
            //         username: $scope.ufname,
            //         user_input: prevmsg,
            //         response: {},
            //         topic: "",
            //         Journey_Name: "",
            //         responsetype: "",
            //         inputDate: inputDate,
            //         outputDate: outputDate,
            //         respdiff: respdiff,
            //         unanswered: 1,
            //         offline: 1,
            //         clientname: $scope.ufname,
            //         socketid: $scope.socketId
            //     };
            //     $rootScope.savehistory(obj);
            //     $timeout(function () {
            //         $rootScope.showMsgLoader = false;
            //     }, 2000);


            // }

            
            //             return false;
            //         }
            //         // if(value.type=="rate card")
            //         // {
            //         //     $rootScope.pushSystemMsg(0,data.data.data);
            //         //     $rootScope.showMsgLoader = false;

$scope.formData = { customer_name:$.jStorage.get("name"),customer_id:$.jStorage.get("email"),user_input:value,csrfmiddlewaretoken:$rootScope.getCookie("csrftoken"),auto_id:"",auto_value:"",DTHlink:$scope.chatText,user_id:$.jStorage.get("session_id") };
            apiService.getCategoryFAQ($scope.formData).then(function (data){
                var outputDate = new Date();
                var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
                angular.forEach(data.data.tiledlist, function(value, key) {
                    if(value.type=="text")
                    {
                        $rootScope.pushSystemMsg(0,data.data);
                        $rootScope.showMsgLoader = false;
                        if(value.Text=="Sorry I did not get you.Could you please try another query")
                        {
                            // apiService.getliveuser().then(function (data){
                            //     if (data.data.data.length > 0) {
                            //             $rootScope.agentconnected = true;
                            //             if ($rootScope.agentconnected) {

                            //                 $rootScope.sendMsgtoagent(sess2.Text, inputDate);
                            //                 var outputDate = new Date();
                            //                 var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
                            //                 // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),livechat:1,session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:prevmsg,response:{},topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                            //                 // $rootScope.savehistory(obj);
                            //             }

                            //         } else {
                            //         $rootScope.agentconnected = false;
                            //         // var msg3 = {
                            //         //     Text: "Sorry I could not understand",
                            //         //     type: "SYS_EMPTY_RES"
                            //         // };
                            //         // $rootScope.pushSystemMsg(0, msg3);
                            //         // console.log(io.socket);
                            //         // console.log("connect");
                            //         // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:msg,response:msg3,topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                            //         // $rootScope.savehistory(obj);

                            //     }
                            // });
                        }
                        //return false;
                    }
                    if(value.type=="show employee")
                    {
                        $rootScope.pushSystemMsg(0,data.data);
                        $rootScope.showMsgLoader = false;
                        $rootScope.showempprev = $scope.prevtext;
                        $scope.prevtext="";
                        return false;
                    }
                    if(value.type=="product listing")
                    {
                        $rootScope.pushSystemMsg(0,data.data);
                        $rootScope.showMsgLoader = false;
                        $timeout(function(){
                        $('.carousel').carousel({
                            interval: false,
                            wrap: false
                        });
                        $('.carousel').find('.item').first().addClass('active');
                        },2000);

                    //     return false;
                    }
            		if(value.type=="diff product")
            		{
            			$rootScope.pushSystemMsg(0,data.data);
            			$rootScope.showMsgLoader = false;
            			$timeout(function(){
            			$('.carousel').carousel({
            				interval: false,
            				wrap: false
            			});
            			$('.carousel').find('.item').first().addClass('active');
            			},2000);

            		}
                    else if(value.type=="DTHyperlink")
                    {
                        $rootScope.DthResponse(0,data.data);  
                    }
                    // else if(value.type=="Instruction")
                    // {
                    // 	$rootScope.InstructionResponse(0,data.data.data);  
                    // }
                    if(value.type=="faq")
                    {
                        // var reversefaq = new Array();
                        // //console.log(data.data.tiledlist[0].FAQ);
                        // reversefaq = _.reverse(data.data.tiledlist[0].FAQ);
                        // data.data.tiledlist[0].FAQ = reversefaq;
                        //console.log(reversefaq);
                        $rootScope.FAQResponse(0,data.data);  
                    }
                    if(value.type=="qlikframe")
                    {
                        value.prevmsg = prevmsg;

                        $rootScope.pushSystemMsg(0,data.data); 
                        if(value.flag == 5)
                        {
                            $timeout(function(){
                                $('.carousel').carousel({
                                    interval: false,
                                    wrap: false
                                });
                                $('.carousel'+($rootScope.chatlist.length-1)).find('.item').first().addClass('active');
                            },2000);
                        }
                    }
                    if(value.type=="html_form")
                    {
                        $rootScope.pushSystemMsg(0,data.data);
                        $rootScope.showMsgLoader=false;
                    }
                     var topic2 = "";
                    if (data.data.tiledlist[0].topic)
                        topic2 = data.data.tiledlist[0].topic;
                    var Journey_Name2 = "";
                    if (data.data.tiledlist[0].Journey_Name)
                        Journey_Name2 = data.data.tiledlist[0].Journey_Name;
                    var obj = {
                        // context_id: $.jStorage.get("context_id"),
                        // conversation_id: $.jStorage.get("conversation_id"),
                        session_id: $.jStorage.get('session_id'),
                        user: $.jStorage.get('email'),
                        username:$.jStorage.get('fname')+' '+$.jStorage.get('lname'),
                        user_input: prevmsg,
                        response: data.data.tiledlist[0],
                        topic: topic2,
                        Journey_Name: Journey_Name2,
                        responsetype: value.type,
                        inputDate: inputDate,
                        outputDate: outputDate,
                        respdiff: respdiff
                    };
                    $rootScope.savehistory(obj);
                });
            	// debugger;
            	if (angular.isDefined($scope.formData.DTHlink) && angular.isDefined(data.data.tiledlist[0].stage_details))

            	{	
                $.jStorage.set("DTHlink", data.data.tiledlist[0].stage_details.DT[0]);
            	$.jStorage.set("DTHstage", data.data.tiledlist[0].stage_details.Stage);
            	}

                //$.jStorage.set("sessiondata",data.data.data.session_obj_data);
            }).catch(function (reason) {
                //console.log(reason);
                //msg = {Text:"Nope ! didn't catch that . Do you want to <a href='#' class='mailus'>Mail Us</a>",type:"SYS_EMPTY_RES"};
                // msg = {Text:"Sorry I did not get you.Could you please try another query.",type:"SYS_EMPTY_RES"};
                // $rootScope.pushSystemMsg(0,msg); 
                $rootScope.scrollChatWindow();
                $rootScope.showMsgLoader=false;
                // $scope.formData = { customer_name:$.jStorage.get("name"),customer_id:$.jStorage.get("email"),user_input:value,csrfmiddlewaretoken:$rootScope.getCookie("csrftoken"),auto_id:"",auto_value:"",DTHlink:$scope.chatText,user_id:$.jStorage.get("session_id") };
                apiService.getliveuser().then(function (data){
                    if (data.data.data.length > 0) {
                            $rootScope.agentconnected = true;
                            if ($rootScope.agentconnected) {

                                $rootScope.sendMsgtoagent(sess2.Text, inputDate);
                                var outputDate = new Date();
                                var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
                                // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),livechat:1,session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:prevmsg,response:{},topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                                // $rootScope.savehistory(obj);
                            }

                        } else {
                        $rootScope.agentconnected = false;
                        var msg3 = {
                            Text: "Sorry I could not understand",
                            type: "SYS_EMPTY_RES"
                        };
                        $rootScope.pushSystemMsg(0, msg3);
                        // console.log(io.socket);
                        // console.log("connect");
                        // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:msg,response:msg3,topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                        // $rootScope.savehistory(obj);

                    }
                });
                // $rootScope.showMsgLoader=false;
                // io.socket.get('/user', function (users) {
                //     var newuser = _.remove(users, function (n) {
                //         return n.livechat == "1";
                //     });
                //     if (newuser.length > 0) {
                //         $rootScope.agentconnected = true;
                //         if ($rootScope.agentconnected) {

                //             $rootScope.sendMsgtoagent(sess2.Text, inputDate);
                //             var outputDate = new Date();
                //             var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
                //             // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),livechat:1,session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:prevmsg,response:{},topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                //             // $rootScope.savehistory(obj);
                //         }

                //     } else {
                //         $rootScope.agentconnected = false;
                //         var msg3 = {
                //             Text: "Sorry I could not understand",
                //             type: "SYS_EMPTY_RES"
                //         };
                //         $rootScope.pushSystemMsg(0, msg3);
                //         // console.log(io.socket);
                //         // console.log("connect");
                //         // var obj = {context_id:$.jStorage.get("context_id"),conversation_id:$.jStorage.get("conversation_id"),session_id:$.jStorage.get('session_id'),user:$.jStorage.get('email'),user_input:msg,response:msg3,topic:"",Journey_Name:"",responsetype:"",inputDate:inputDate,outputDate:outputDate,respdiff:respdiff,unanswered:1};
                //         // $rootScope.savehistory(obj);

                //     }
                // });
            });


        };

        function addMessageToConversation(senderId, recipientId, message) {

            var fromMe = senderId == window.me.id;
            var roomName = 'private-messages-' + (fromMe ? recipientId : senderId);
            $.jStorage.set('lastroom', roomName);
            $.jStorage.set('lastroomid', (fromMe ? recipientId : senderId));
            var senderName = fromMe ? "Me" : $('#private-username-' + senderId).html();
            var justify = fromMe ? 'right' : 'left';

            var div = $('<div style="text-align:' + justify + '"></div>');
            div.html('<strong>' + senderName + '</strong>: ' + message);
            $('#' + roomName).append(div);

        }
        $rootScope.lastagentid = "";
        $rootScope.lastagentmsg = false;
        $rootScope.sendMsgtoagent = function (msg, inputDate) {
            $rootScope.showMsgLoader = false;
            var outputDate = new Date();
            var respdiff = (outputDate.getTime() - inputDate.getTime()) / 1000;
            //io.socket.get('/user', function (users) {
            apiService.getliveuser().then(function (data) {
                users = data.data.data;
                var newuser = _.remove(users, function (n) {
                    return (n.livechat == "1" && n.email != null);
                });
                // _.sortBy(newuser, [function (o) {
                //     return o.id;
                // }]);
                // _.reverse(newuser);
                // _.uniqBy(newuser, 'email');
                // console.log(newuser, "online users");
                if (newuser.length > 0) {
                    // if (newuser.length == 1) { //one agent is online
                    //     $rootScope.lastagent = newuser[0].email;
                    //     newuser.forEach(function (user) {
                    //         if (_.find($rootScope.agentlist, function (o) {
                    //                 return o == user.email;
                    //             })) {

                    //         } else {
                    //             // console.log(newuser[0].email, "single users");
                    //             $rootScope.agentlist.push(newuser[0].email);
                    //             $.jStorage.set("agentlist", $rootScope.agentlist);
                    //         }
                    //     });

                    // } else {
                    //     var allconnected = true;
                    //     var newuser3 = newuser;
                    //     var emptyuser = false;
                    //     var emptyuser2 = false;
                    //     var emptyuserid = "";
                    //     var f_list = Array();
                    //     newuser3.forEach(function (user) {
                    //         livechats = user.livechats;
                    //         // if (!emptyuser2) {
                    //         //     if (livechats.length > 0) {
                    //         //         livechats.forEach(function (lc) {
                    //         //             if (!emptyuser) {
                    //         //                 if (lc.disconnected == true) {
                    //         //                     emptyuserid = user.email;
                    //         //                     emptyuser = true;
                    //         //                 }
                    //         //             }
                    //         //         });
                    //         //     } else {
                    //         //         emptyuserid = user.email;
                    //         //         emptyuser2 = true;
                    //         //     }
                    //         // }

                    //         if (!emptyuser) {
                    //             var countuser = _.filter(livechats, function (n) {
                    //                 return (n.disconnected == false);
                    //             });

                    //             if (countuser.length < 3) {
                    //                 // emptyuserid = user.email;
                    //                 // emptyuser = true;
                    //                 f_user = user;
                    //                 f_user.conc_count=countuser.length;
                    //                 f_list.push(f_user);
                    //             }
                    //         }
                    //     });
                    //     if(f_list.length == 1)
                    //     {
                    //         $rootScope.lastagent=f_list[0].email;
                    //         f_list.forEach(function (user) {
                    //             if (_.find($rootScope.agentlist, function (o) {
                    //                     return o == user.email;
                    //                 })) {

                    //             } else {
                    //                 // console.log(newuser[0].email, "single users");
                    //                 $rootScope.agentlist.push(f_list[0].email);
                    //                 $.jStorage.set("agentlist", $rootScope.agentlist);
                    //             }
                    //         });
                    //     }
                    //     else {
                    //         _.sortBy(f_list, [function(o) { return o.conc_count; }]);
                    //         $rootScope.lastagent=f_list[0].email;
                    //         f_list.forEach(function (user) {
                    //             if (_.find($rootScope.agentlist, function (o) {
                    //                     return o == user.email;
                    //                 })) {

                    //             } else {
                    //                 // console.log(newuser[0].email, "single users");
                    //                 $rootScope.agentlist.push(f_list[0].email);
                    //                 $.jStorage.set("agentlist", $rootScope.agentlist);
                    //             }
                    //         });
                    //     }
                    //     // var newuser2 = _.find(newuser3, function (n) {
                    //     //     return (n.livechats.length == 0 || n.livechats.disconnected==true);
                    //     // });
                    //     // console.log(emptyuserid, "filter");
                    //     if (emptyuserid != '') {
                    //         allconnected = false;
                    //         // console.log(newuser2.email,"inside 2");
                    //         // $rootScope.lastagent = newuser2.email;
                    //         // $rootScope.agentlist.push(newuser2.email);
                    //         // console.log(emptyuserid, "inside 2");
                    //         $rootScope.lastagent = emptyuserid;
                    //         $rootScope.agentlist.push(emptyuserid);
                    //         $.jStorage.set("agentlist", $rootScope.agentlist);
                    //     } else {
                    //         newuser.forEach(function (user) {
                    //             if (_.find($rootScope.agentlist, function (o) {
                    //                     return o == user.email;
                    //                 })) {

                    //             } else {
                    //                 // if(user.livechats.length==0)
                    //                 // {

                    //                 // }
                    //                 // else {

                    //                 // }

                    //                 allconnected = false;
                    //                 $rootScope.lastagent = user.email;
                    //                 $rootScope.agentlist.push(user.email);

                    //                 $.jStorage.set("agentlist", $rootScope.agentlist);
                    //             }
                    //         });
                    //     }


                    //     if (allconnected) {
                    //         var setid = false;

                    //         //$rootScope.lastagent = newuser[newuser.length-1].sid;
                    //         newuser.forEach(function (user) {
                    //             if ($rootScope.lastagent == user.email) {

                    //             } else if (!setid) {
                    //                 setid = true;
                    //                 $rootScope.lastagent = user.email;

                    //             }
                    //         });
                    //     }
                    // }
                    // console.log(newuser, "users");
                    // console.log($rootScope.lastagent, "last agent");
                    var gotuser = false;
                    var allconnected = true;
                    var newuser3 = newuser;
                    var emptyuser = false;
                    var emptyuser2 = false;
                    var emptyuserid = "";
                    var f_list = Array();

                    // mongo
                    // newuser3.forEach(function (user) {
                    //     if(user.livechats)
                    //     livechats = user.livechats;
                    //     else
                    //         livechats = [];
                    //     // if (!emptyuser2) {
                    //     //     if (livechats.length > 0) {
                    //     //         livechats.forEach(function (lc) {
                    //     //             if (!emptyuser) {
                    //     //                 if (lc.disconnected == true) {
                    //     //                     emptyuserid = user.email;
                    //     //                     emptyuser = true;
                    //     //                 }
                    //     //             }
                    //     //         });
                    //     //     } else {
                    //     //         emptyuserid = user.email;
                    //     //         emptyuser2 = true;
                    //     //     }
                    //     // }
                    //     if(livechats.length>0) {
                    //         if (!emptyuser) {
                    //             var countuser = _.filter(livechats, function (n) {
                    //                 return (n.disconnected == false);
                    //             });
                    //             //console.log(countuser,"cout");
                    //             if (countuser.length < user.chatlimit) {
                    //                 // emptyuserid = user.email;
                    //                 // emptyuser = true;
                    //                 f_user = user;
                    //                 f_user.conc_count=countuser.length;
                    //                 f_list.push(f_user);
                    //             }
                    //         }
                    //     }
                    //     else {

                    //             // emptyuserid = user.email;
                    //             // emptyuser = true;
                    //             f_user = user;
                    //             f_user.conc_count=0;
                    //             f_list.push(f_user);


                    //     }
                    // });
                    // //console.log(f_list);
                    // if(f_list.length == 1)
                    // {
                    //     gotuser=true;
                    //     $rootScope.lastagent=f_list[0].email;
                    //     f_list.forEach(function (user) {
                    //         if (_.find($rootScope.agentlist, function (o) {
                    //                 return o == user.email;
                    //             })) {

                    //         } else {
                    //             // console.log(newuser[0].email, "single users");
                    //             $rootScope.agentlist.push(f_list[0].email);
                    //             $.jStorage.set("agentlist", $rootScope.agentlist);
                    //         }
                    //     });
                    // }
                    // else if(f_list.length>1) {
                    //     gotuser=true;
                    //     //_.sortBy(f_list, [function(o) { return o.conc_count; }]);
                    //     $filter('orderBy')(f_list, 'conc_count');
                    //     //console.log(f_list,"after sorting");
                    //     $rootScope.lastagent=f_list[0].email;
                    //     f_list.forEach(function (user) {
                    //         if (_.find($rootScope.agentlist, function (o) {
                    //                 return o == user.email;
                    //             })) {

                    //         } else {
                    //             // console.log(newuser[0].email, "single users");
                    //             $rootScope.agentlist.push(f_list[0].email);
                    //             $.jStorage.set("agentlist", $rootScope.agentlist);
                    //         }
                    //     });
                    // }
                    $rootScope.lastagent = newuser[0].email;
                    gotuser = true;
                    if (gotuser) {
                        var arr_ind = _.findIndex(newuser, function (o) {
                            return o.email == $rootScope.lastagent;
                        });
                        // console.log(arr_ind, "index");
                        // console.log(newuser, "index");
                        $rootScope.agentdet = {
                            sid: newuser[arr_ind].sid,
                            sname: newuser[arr_ind].sname,
                            id: newuser[arr_ind].id,
                            socketid: newuser[arr_ind].socketId,
                            email: newuser[arr_ind].email
                        };

                        if (!$rootScope.lastagentmsg) {

                            // var msg2 = {
                            //     Text: "You are connected to our customer support " ,
                            //     type: "SYS_CONV_START"
                            // };
                            // $rootScope.pushSystemMsg(0, msg2);
                            var msg1 = {
                                //Text: "I am a Bot,I am still learning. <br>We’re finding the best person to connect with you.Please stay online.",
                                Text: "Hi, I am " + newuser[arr_ind].sname + " " + $scope.themedata.agent_message,

                                type: "SYS_EMPTY_RES"
                            };
                            // one of our agents will attend to you right away.
                            $rootScope.pushSystemMsg(0, msg1);
                            $rootScope.lastagentmsg = true;
                            // var obj = {
                            //     context_id: $.jStorage.get("context_id"),
                            //     conversation_id: $.jStorage.get("conversation_id"),
                            //     session_id: $.jStorage.get('session_id'),
                            //     user: $.jStorage.get('email'),
                            //     user_input: msg,
                            //     response: msg2,
                            //     topic: "",
                            //     Journey_Name: "",
                            //     responsetype: "",
                            //     inputDate: inputDate,
                            //     outputDate: outputDate,
                            //     respdiff: respdiff
                            // };
                            // $rootScope.savehistory(obj);
                        }
                        //console.log(msg);
                        $rootScope.lastagentid = newuser[arr_ind].id;

                        addMessageToConversation($rootScope.userid, newuser[arr_ind].id, msg);
                        io.socket.post('/chat/private', {
                            to: newuser[arr_ind].id,
                            fromid: $rootScope.userid,
                            fromname: $scope.ufname,
                            fromemail: $scope.uemail,
                            fromaccess: "",
                            from_socketid: $scope.usocketId,
                            to_socketid: newuser[arr_ind].socketId,
                            msg: $rootScope.chatlist
                        });
                        var formData = {
                            session_id: $.jStorage.get('session_id'),
                            msg: msg,
                            from_id: $scope.uemail,
                            fromid: $rootScope.userid,
                            fromname: $scope.ufname,
                            from_socketid: $scope.usocketId,
                            toid: newuser[arr_ind].id,
                            toname: newuser[arr_ind].sname,
                            to_id: newuser[arr_ind].email,
                            to_socketid: newuser[arr_ind].socketId,
                            // conversation_id:$.jStorage.get("conversation_id"),
                            // context_id:$.jStorage.get("context_id"),
                            chatlist: $rootScope.chatlist
                        };
                        apiService.saveagentchat(formData).then(function (data) {

                        });
                    } else {
                        $rootScope.agentconnected = false;
                        // var msg3 = {
                        //     Text: "Sorry I could not understand",
                        //     type: "SYS_EMPTY_RES"
                        // };
                        // $rootScope.pushSystemMsg(0, msg3);
                        var msg3 = {
                            // Text: "Hi we are currently unavailable at the moment , please leave a message and we will get back to you shortly",
                            Text: $scope.offlinemessage.offline_messages,
                            type: "LIVE_EMPTY_RES"
                        };
                        $rootScope.pushSystemMsg(0, msg3);
                        $rootScope.offlineuser = true;
                        var obj = {
                            // context_id: $.jStorage.get("context_id"),
                            // conversation_id: $.jStorage.get("conversation_id"),
                            session_id: $.jStorage.get('session_id'),
                            user: $scope.uemail,
                            username: $scope.ufname,
                            user_input: msg,
                            response: {},
                            topic: "",
                            Journey_Name: "",
                            responsetype: "",
                            inputDate: new Date(),
                            outputDate: new Date(),
                            respdiff: 1,
                            unanswered: 1,
                            offline: 1,
                            clientname: $scope.ufname,
                            socketid: $scope.usocketId
                        };
                        $rootScope.savehistory(obj);
                    }
                } else {
                    $rootScope.agentconnected = false;
                    // var msg3 = {
                    //     Text: "Sorry I could not understand",
                    //     type: "SYS_EMPTY_RES"
                    // };
                    // $rootScope.pushSystemMsg(0, msg3);
                    var msg3 = {
                        //Text: "Hi we are currently unavailable at the moment , please leave a message and we will get back to you shortly",
                        Text: $scope.offlinemessage.offline_messages,
                        type: "LIVE_EMPTY_RES"
                    };
                    var obj = {
                        // context_id: $.jStorage.get("context_id"),
                        // conversation_id: $.jStorage.get("conversation_id"),
                        session_id: $.jStorage.get('session_id'),
                        user: $scope.uemail,
                        username: $scope.ufname,
                        user_input: msg,
                        response: {},
                        topic: "",
                        Journey_Name: "",
                        responsetype: "",
                        inputDate: new Date(),
                        outputDate: new Date(),
                        respdiff: 1,
                        unanswered: 1,
                        offline: 1,
                        clientname: $scope.ufname,
                        socketid: $scope.usocketId
                    };
                    $rootScope.savehistory(obj);
                    $rootScope.pushSystemMsg(0, msg3);
                    $rootScope.offlineuser = true;
                    // var obj = {
                    //     context_id: $.jStorage.get("context_id"),
                    //     conversation_id: $.jStorage.get("conversation_id"),
                    //     session_id: $.jStorage.get('session_id'),
                    //     user: $.jStorage.get('email'),
                    //     user_input: msg,
                    //     response: msg3,
                    //     topic: "",
                    //     Journey_Name: "",
                    //     responsetype: "",
                    //     inputDate: inputDate,
                    //     outputDate: outputDate,
                    //     respdiff: respdiff
                    // };
                    // $rootScope.savehistory(obj);
                }
            });

            // addMessageToConversation(window.me.id, "5a0a81e8179172360420c966", msg);

            // // Send the message
            // io.socket.post('/chat/private', {to: "5a0a81e8179172360420c966", msg: msg});
        };

        $rootScope.tappedKeys = '';

        $rootScope.onKeyUp = function (e) {
            //if(e.key == "ArrowDown" || e.key == "ArrowUp")
            if (e.which == 40) {
                if ($("ul#ui-id-1 li.active").length > 0) {
                    var storeTarget = $('ul#ui-id-1').find("li.active").next();
                    $("ul#ui-id-1 li.active").removeClass("active");
                    storeTarget.focus().addClass("active");
                    $(".chatinput").val(storeTarget.text());
                    $rootScope.autolistid = $(storeTarget).attr("data-id");
                    $rootScope.autolistvalue = $(storeTarget).attr("data-value");
                    $rootScope.answers = $(storeTarget).attr("data-answers");
                    $timeout(function () {
                        // var o_ele = "#suggestionList .ui-widget.ui-widget-content";
                        // console.log(o_ele.scrollHeight > o_ele.clientHeight);
                        // if(o_ele.scrollHeight > o_ele.clientHeight)
                        // {
                        //     var ulHeight = $("#suggestionList .ui-widget.ui-widget-content").height();
                        //     $('#suggestionList .ui-widget.ui-widget-content').animate({scrollTop: ulHeight});
                        // }

                    });
                } else {
                    $('ul#ui-id-1').find("li:first").focus().addClass("active");
                    var storeTarget = $('ul#ui-id-1').find("li.active");
                    $(".chatinput").val($('ul#ui-id-1').find("li:first").text());
                    $rootScope.autolistid = $('ul#ui-id-1').find("li:first").attr("data-id");
                    $rootScope.autolistvalue = $('ul#ui-id-1').find("li:first").attr("data-value");
                    $rootScope.answers = $(storeTarget).attr("data-answers");
                }
                return;
            }
            if (e.which == 38) {
                if ($("ul#ui-id-1 li.active").length != 0) {
                    var storeTarget = $('ul#ui-id-1').find("li.active").prev();
                    $("ul#ui-id-1 li.active").removeClass("active");
                    storeTarget.focus().addClass("active");
                    $(".chatinput").val(storeTarget.text());
                    $rootScope.autolistid = $(storeTarget).attr("data-id");
                    $rootScope.autolistvalue = $(storeTarget).attr("data-value");
                    $rootScope.answers = $(storeTarget).attr("data-answers");
                } else {
                    $('ul#ui-id-1').find("li:last").focus().addClass("active");
                    var storeTarget = $('ul#ui-id-1').find("li.active");
                    $(".chatinput").val($('ul#ui-id-1').find("li:last").text());
                    $rootScope.autolistid = $('ul#ui-id-1').find("li:last").attr("data-id");
                    $rootScope.autolistvalue = $('ul#ui-id-1').find("li:last").attr("data-value");
                    $rootScope.answers = $(storeTarget).attr("data-answers");
                }

                return;
            }
            if (e.which == 13) {
                if ($rootScope.answers) {
                    $rootScope.pushAutoMsg($rootScope.autolistid, $(".chatinput").val(), $rootScope.answers);
                    $rootScope.autocompletelist = [];

                } else if (($rootScope.autolistid == "" || $rootScope.autolistid == null || $rootScope.autolistid == 0)) {


                    $rootScope.pushMsg("", $(".chatinput").val(), "");

                } else {

                    $rootScope.pushMsg($rootScope.autolistid, $(".chatinput").val(), "");
                }
                $rootScope.autocompletelist = [];
                $(".chatinput").val("");
                $rootScope.chatText = "";
            }
            if (e.which == 8) {

                if ($(".chatinput").val() == "") {
                    $rootScope.autocompletelist = [];
                    $rootScope.chatText = "";
                }

            }
            // $rootScope.chatText = "";
            // $rootScope.autolistid=="";
            // $rootScope.autolistvalue = "";
        };
        $rootScope.attchcount = 0;
        $rootScope.mailmodalInstance = {};
        $rootScope.mailbookmarkerror = 0;
        $scope.openMailmodal = function () {
            if ($("input[name='formailing[]']:checked").length == 0) {
                alert("Please select graph  to mail");
                $rootScope.mailmodalCancel();
            } else {
                $rootScope.$mailmodalInstance = $uibModal.open({
                    scope: $rootScope,
                    animation: true,
                    size: 'lg',
                    templateUrl: 'views/modal/mailmodal.html',
                    //controller: 'CommonCtrl'
                });
                $rootScope.attchcount = $("input[name='formailing[]']:checked").length;
            }
            //window.open('mailto:test@example.com?subject=subject&body=body');
        };
        $rootScope.mailmodalCancel = function () {
            //console.log("dismissing");
            $rootScope.$mailmodalInstance.dismiss('cancel');
            $rootScope.attchcount = 0;
        };

        $rootScope.$viewmodalInstance = {};
        $rootScope.selectbookmarkerror = 0;
        $rootScope.clearChat = function () {
            $rootScope.chatlist = [];
            $.jStorage.set("chatlist", $rootScope.chatlist);
        };
        $rootScope.openviewBookmark = function () {
            $scope.formData = {
                userid: $.jStorage.get("sessionid")
            };


            apiService.viewbookmark($scope.formData).then(function (callback) {
                $("#selectbookmark_list").html("");


                $rootScope.$viewmodalInstance = $uibModal.open({
                    scope: $rootScope,
                    animation: true,
                    size: 'sm',
                    templateUrl: 'views/modal/selectbookmark.html',
                    resolve: {
                        items: function () {
                            return callback.data.data;
                        }
                    },
                    controller: 'ViewCtrl'
                });

            });
        };
        $rootScope.selectbookmarkCancel = function () {
            //console.log("dismissing");
            $rootScope.$viewmodalInstance.dismiss('cancel');
        };

        $rootScope.$deletemodalInstance = {};
        $rootScope.deletebookmarkerror = 0;

        $rootScope.opendeleteBookmark = function () {
            $scope.formData = {
                userid: $.jStorage.get("sessionid")
            };


            apiService.viewbookmark($scope.formData).then(function (callback) {
                $("#selectbookmark_list").html("");


                $rootScope.$deletemodalInstance = $uibModal.open({
                    scope: $rootScope,
                    animation: true,
                    size: 'sm',
                    templateUrl: 'views/modal/deletebookmark.html',
                    resolve: {
                        items: function () {
                            return callback.data.data;
                        }
                    },
                    controller: 'DeleteBookmarkCtrl'
                });

            });
        };
        $rootScope.deletebookmarkCancel = function () {
            //console.log("dismissing");
            $rootScope.$deletemodalInstance.dismiss('cancel');
        };

        $rootScope.$savemodalInstance = {};
        $rootScope.savebookmarkerror = 0;
        $scope.opensaveBookmark = function () {
            $rootScope.$savemodalInstance = $uibModal.open({
                scope: $rootScope,
                animation: true,
                size: 'sm',
                templateUrl: 'views/modal/savebookmark.html',
                //controller: 'CommonCtrl'
            });
        };
        $rootScope.bookmarkCancel = function () {
            //console.log("dismissing");
            $rootScope.$savemodalInstance.dismiss('cancel');
        };
        $rootScope.likeChatClick = function () {
            $timeout(function () {
                $('span.thumbsup').css("color", "#39E61F");
                $('.thumbsdown').css("color", "#6B002A");
            }, 200);

            var formData = {
                // suggestion: suggestion,
                from_id: $scope.uemail,
                // fromid: window.me.id,
                // fromname: ($.jStorage.get("fname") + ' ' + $.jStorage.get("lname")),
                from_socketid: $scope.usocketId,
                // toid: recipientId,
                // toname: from_sname,
                to_id: $rootScope.agentdet.email,
                to_socketid: $rootScope.agentdet.socketid
            };
            apiService.savelike(formData).then(function (data) {

            });
        };
        $rootScope.$dislikemodalInstance = {};
        $rootScope.dislikesuggestionerror = 0;
        $rootScope.dislikeChatClick = function () {
            if ($rootScope.chatlist.length > 3) {

                $rootScope.$dislikemodalInstance = $uibModal.open({
                    scope: $rootScope,
                    animation: true,
                    size: 'sm',
                    templateUrl: 'views/modal/dislikechat.html',
                    //controller: 'CommonCtrl'
                });
                $timeout(function () {
                    $('span.thumbsdown').css("color", "#F32525");
                    $('.thumbsup').css("color", "#6B002A");
                }, 200);
            } else {
                alert("response is less than 3");
            }
        };
        $rootScope.dislikeCancel = function () {
            //console.log("dismissing");
            $scope.$dislikemodalInstance.dismiss('cancel');
            $('span.thumbsdown').css("color", "#6B002A");
        };
        $rootScope.dislikesuggestionsubmit = function (suggestion) {
            // console.log("suggestion", suggestion);
            $rootScope.dislikesuggestionSuccess = 1;
            var formData = {
                suggestion: suggestion,
                from_id: $.jStorage.get("uemail"),
                // fromid: window.me.id,
                // fromname: ($.jStorage.get("fname") + ' ' + $.jStorage.get("lname")),
                // from_socketid: $.jStorage.get("socketId"),
                // toid: recipientId,
                // toname: from_sname,
                to_id: $rootScope.agentdet.email,
                // to_socketid: $rootScope.agentdet.socketid
            };
            apiService.savefeedback(formData).then(function (data) {

            });
            $timeout(function () {
                $rootScope.dislikesuggestionSuccess = 0;
                $rootScope.dislikeCancel();
            }, 500);
            $('span.thumbsdown').css("color", "#6B002A");

            // var msg = {Text:"I am  so sorry as I could not assist you satisfactory . May I redirect you to an executive to address your query?",type:"SYS_DISLIKEMSG"};
            // $rootScope.pushSystemMsg(0,msg); 
            $rootScope.showMsgLoader = false;
        };
        $rootScope.feedbacksubmit2 = function (suggestion, index) {

            var formData = {
                suggestion: suggestion,
                user: $scope.uemail,
                socketid: $scope.socketId,

            };
            apiService.saveofflinefeedback(formData).then(function (data) {

            });
            //alert("Thank you. We will get back to you shortly");
            $(".feedbackbtn" + index).hide();
            $(".dislikesuggestion_" + index).hide();

            $scope.openOffline();

            $timeout(function () {
                $rootScope.closeoffline();
            }, 3000);

        };
        $scope.openOffline = function () {
            $scope.$modalInstancee = $uibModal.open({
                scope: $scope,
                animation: true,
                size: 'sm',
                templateUrl: 'views/modal/offlinemsgpopup.html',
                //controller: 'CommonCtrl'
            });
        };
        $rootScope.closeoffline = function () {
            //console.log("dismissing");
            $scope.$modalInstancee.dismiss('cancel');

        };
        $scope.dislikebtns = function (msg1) {
            // console.log(msg1);
            if (msg1 == 'Yes') {
                var msg = {
                    Text: "Here the customer will be redirected to a live agent.",
                    type: "SYS_DISLIKEMSG1"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            }
            if (msg1 == 'No') {
                var msg = {
                    Text: "Please let me know if I can assist with anything else.",
                    type: "SYS_DISLIKEMSG1"
                };
                $rootScope.pushSystemMsg(0, msg);
                $rootScope.showMsgLoader = false;
            }
        };
        $scope.checkoutmember = function (price) {
            var msg = {
                Text: "Here you will be redirected to a payment gateway. At present, this has not been incorporated in the bot.",
                type: "SYS_ADD_CART"
            };
            $rootScope.pushSystemMsg(0, msg);
            $rootScope.showMsgLoader = false;
            $rootScope.scrollChatWindow();
        };
        $rootScope.getTopsearch = function () {
            var formData = {
                customer_name: $.jStorage.get("name"),
                customer_id: $.jStorage.get("email"),
                user_input: "",
                csrfmiddlewaretoken: $rootScope.getCookie("csrftoken"),
                auto_id: "",
                auto_value: "",
                user_id: $cookies.get("session_id")
            };
            apiService.gettopsearch(formData).then(function (response) {
                //$rootScope.links = response.data;
                // $rootScope.dsepolicy = response.data.data;
                // //console.log(response.data);
                // msg2={queslink:angular.copy(response.data.data),type:"cat_faq_ans_dsepolicy"};
                // console.log(msg2);
                // $rootScope.chatlist.push({id:0,msg:msg2,position:"right",curTime: $rootScope.getDatetime()});
                // $rootScope.showMsgLoader=false;
                // $rootScope.scrollChatWindow();
                angular.forEach(response.data.tiledlist, function (value, key) {
                    if (value.type == "top_search") {
                        $rootScope.pushSystemMsg(0, response.data);
                        $rootScope.showMsgLoader = false;
                    }
                });
            });
        };
        $timeout(function () {
            //$('#chatTabs a:last').tab('show');
        }, 200);


        //get agent list






    })

    .controller('DeleteBookmarkCtrl', function ($scope, $uibModalInstance, items) {

        $scope.items = items;
        // $scope.selected = {
        //     item: $scope.items[0]
        // };
        var dt = "";
        _.each($scope.items, function (v, k) {
            dt += "<option value='" + v._id + "'>" + v.name + "</option>";

        });
    })
    .controller('LoginDetCtrl', function ($scope, $rootScope, TemplateService, NavigationService, $timeout, toastr, $http, $state, apiService) {
        $scope.fullname = "";
        $scope.branch = "";
        if ($.jStorage.get("aid") == null || $.jStorage.get("aid") == "" || $.jStorage.get("aid") == 0) {
            $.jStorage.set("anotloggedin", true);
            $rootScope.notLoggedin = true;
            $state.go("login");
        } else {
            $scope.fullname = $.jStorage.get("afname") + " ";

            $.jStorage.set("anotloggedin", false);
            $rootScope.anotLoggedin = false;
        }

    })

    .controller('CommonCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, toastr, $http, $state, apiService, $cookies, $rootScope) {
        var date = new Date();
        $scope.FromDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
        $rootScope.logoutagent = function () {

            //CsrfTokenService.getCookie("csrftoken").then(function (token) {
            $scope.formData = {
                sessionid: $.jStorage.get("sessionid"),
                user: $.jStorage.get("id"),
                email: $.jStorage.get("email"),
            };
            apiService.logout($scope.formData).then(function (callback) {


                // $rootScope.tabvalue.elements = [];
                // $rootScope.tabvalue.element_values = [];
                //$.jStorage.flush();
                $state.go("login");
            });

        };

        $scope.$modalInstance = {};
        $scope.openChangePwd = function () {
            $scope.$modalInstance = $uibModal.open({
                scope: $scope,
                animation: true,
                //size: 'sm',
                templateUrl: 'views/modal/changepassword.html',
                //controller: 'CommonCtrl'
            });
        };
        $scope.changePwdcancel = function () {
            //console.log("dismissing");
            $scope.$modalInstance.dismiss('cancel');
            //$scope.$modalInstance.close();
        };
        $scope.passworderror = 0
        $scope.changepasswordSuccess = 0;

        $scope.changepassword = function (currentpassword, newpassword, newpassword2) {
            //console.log(newpassword);
            userid = $.jStorage.get("id");
            $scope.token = "";
            // CsrfTokenService.getCookie("csrftoken").then(function (done) {
            //     $scope.token = done;
            $scope.formData = {
                userid: userid,
                oldpassword: (currentpassword),
                newpassword: (newpassword),
                // csrfmiddlewaretoken: $scope.token
            };
            //console.log($scope.formData);
            apiService.changepassword($scope.formData).then(function (callback) {
                if (callback.data.value) {
                    $scope.changepasswordSuccess = 1;
                    $timeout(function () {
                        $scope.$modalInstance.dismiss('cancel');
                        $scope.changepasswordSuccess = 0;
                    }, 500);
                } else if (callback.data.error.message == -1)
                    $scope.passworderror = -1;
            })

        };

        // $timeout(function () {

        //     $('span.thumbsup').click(function (event) {
        //         $(this).css("color", "#ed232b");
        //         $('.thumbsdown').css("color", "#444");
        //     });
        //     $('span.thumbsdown').click(function (event) {
        //         $(this).css("color", "#ed232b");
        //         $('.thumbsup').css("color", "#444");
        //     });
        // },200); 
    })
    .controller('Dashboard5Ctrl', function ($scope, $rootScope, TemplateService, NavigationService, $timeout, $http, apiService, $state, $cookies, $uibModal) {
        $scope.template = TemplateService.getHTML("content/dashboard5.html");
        TemplateService.title = "Dashboard"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $rootScope.uipage = "dashboard";
        $scope.isCollapsed_c = true;
        $scope.isCollapsed_c1 = true;
        $scope.isCollapsed_c2 = true;
        $.jStorage.set("firstreload", false);
        var formData = {
            from_id: $.jStorage.get("email")
        };
        apiService.removelive(formData).then(function (data) {

        });
    })
    .controller('LoginCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $http, $state, apiService, $uibModal, $filter, $rootScope, $window) {
        $scope.template = TemplateService.getHTML("login.html");
        TemplateService.title = "Login"; //This is the Title of the Website
        //$scope.navigation = NavigationService.getNavigation();

        //CsrfTokenService.getCookie("csrftoken");

        $scope.loginbg = 1;
        $scope.iframeHeight = window.innerHeight;
        $rootScope.uipage = "login";

        $scope.formSubmitted = false;
        $scope.loginerror = 0;
        //$rootScope.notLoggedin = false;
        //console.log($.jStorage.get("notloggedin"));


        if ($.jStorage.get("anotloggedin"))
            $rootScope.notLoggedin = true;

        else
            $state.go("agentdashboard");
        $scope.login = function (username, password) {

            $scope.formData = {
                username: username,
                password: (password),

            };
            /*
            apiService.login($scope.formData).then(function (callback){
                //console.log(callback);
            });*/

            apiService.login($scope.formData).then(function (callback) {
                //$scope.csrftoken = CsrfTokenService.getCookie("csrftoken");

                //if(angular.isUndefined(callback.data.error.message))
                if (callback.data.value) {
                    //console.log(callback);
                    //$.jStorage.flush();
                    $rootScope.access_role = 'livechat';
                    $.jStorage.set("aid", callback.data.data._id);
                    //$.jStorage.set("accesstoken", callback.data.data.token);
                    $.jStorage.set("afname", callback.data.data.user_name);
                    $.jStorage.set("alname", "");
                    $.jStorage.set("aemail", callback.data.data.user_id);
                    $.jStorage.set("access_role", 'livechat');
                    $.jStorage.set("asessionid", callback.data.data.sessionid);
                    $.jStorage.set("anotloggedin", false);
                    $.jStorage.set("asetsession", new Date());
                    //$.jStorage.setTTL("email", 14400000);//4hr

                    $rootScope.aid = callback.data.data._id;
                    $rootScope.afname = callback.data.data.user_name;
                    $rootScope.aemail = callback.data.data.user_id;

                    $rootScope.asessionid = callback.data.data.sessionid;
                    $rootScope.anotloggedin = false;
                    $rootScope.asetsession = new Date();


                    $scope.sessiondata = {
                        id_string: callback.data.data._id,
                        //data : {},
                        DTHyperlink: '',
                        LineNo: '',
                        options: '',
                        opts: '',
                        row_by_framework_level: '',
                        framework_level: 1,
                        response: {},
                        response_type: '',
                        form_input_type: '',
                        form_input_dict: {},
                        form_input_list: [],
                        form_category: '',
                        Context: '',
                        Context_1: '',
                        Context_2: '',
                        Context_3: '',
                        Context_4: '',
                        Context_5: '',
                        gb_dt_start_row: -1,
                        gb_dt_end_row: -1,
                        gb_dt_current_cursor_row: -1,
                        gb_dt_current_cursor_col: -1,
                        gb_dt_file_name: '',
                        gb_sub_topic_list: [],
                        gb_step_list: [],
                        gb_current_step: '',
                        tooltip: [],
                        gb_topic_tuple_array: [],
                        gb_max_ratio_index_in_tuple: [],
                        gb_topic: '',
                        gb_matched_row_values: [],
                        gb_matched_col_values: [],
                    };
                    $.jStorage.set("sessiondata", $scope.sessiondata);

                    //if (callback.data.data.accessrole == 4)
                    $state.go("agentdashboard");
                    // else {
                    //     //io.socket.get('/chat/addconv');

                    //     $state.go("dashboard");
                    // }
                } else if (callback.data.error.message == -1)
                    $scope.loginerror = -1;
            });


        };
        $scope.openForgotpassword = function () {
            $scope.$modalInstance = $uibModal.open({
                scope: $scope,
                animation: true,
                size: 'sm',
                templateUrl: 'views/modal/forgotpassword.html',
                //controller: 'CommonCtrl'
            });
        };
        $scope.changePwdcancel = function () {
            //console.log("dismissing");
            $scope.$modalInstance.dismiss('cancel');
            //$scope.$modalInstance.close();
        };
        $scope.forgotpasswordreq = function (email) {
            str = $filter('date')(new Date(), 'hh:mm:ss a') + email;
            $scope.formData = {
                email: email,
                resettoken: sha256_digest(str)
            };
            apiService.forgotpassword($scope.formData).then(function (callback) {
                if (callback.data.value) {
                    $scope.forgotpasswordSuccess = 1;
                    $timeout(function () {
                        $scope.$modalInstance.dismiss('cancel');
                        $scope.forgotpasswordSuccess = 0;
                    }, 1000);
                } else if (callback.data.error.message == -1)
                    $scope.forgotpassworderror = -1;
            })
        };

        $scope.onExit = function () {
            // $localStorage.$reset();//it will delete all the data from localstorage.
            $rootScope.logoutagent();
        };
        //$window.onbeforeunload =  $scope.onExit;
    })
    .controller('ViewCtrl', function ($scope, $uibModalInstance, items) {

        $scope.items = items;
        // $scope.selected = {
        //     item: $scope.items[0]
        // };
        var dt = "";
        _.each($scope.items, function (v, k) {
            // console.log(v);
            dt += "<option value='" + v._id + "'>" + v.name + "</option>";

        });
        // console.log(dt);
        //$("select#selectbookmark_list").html(dt);
    })
    .controller('FormCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
        $scope.template = TemplateService.getHTML("content/form.html");
        TemplateService.title = "Form"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.formSubmitted = false;
        // $scope.data = {
        //     name: "Chintan",
        //     "age": 20,
        //     "email": "chinyan@wohlig.com",
        //     "query": "query"
        // };
        $scope.submitForm = function (data) {
            // console.log("This is it");
            return new Promise(function (callback) {
                $timeout(function () {
                    callback();
                }, 5000);
            });
        };
    })
    .controller('AgentdashboardCtrl', function ($scope, $rootScope, TemplateService, NavigationService, $timeout, $interval, $http, apiService, $state, $uibModal, $cookies, $sce, $location, $document) {
        $scope.template = TemplateService.getHTML("content/agentdashboard.html");
        TemplateService.title = "Agent"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.uipage = "agentdashboard";
        $rootScope.access_role = $.jStorage.get("access_role");
        $scope.firstreload = false;
        $rootScope.hotkeymsg = [];
        $scope.agentname = $.jStorage.get("afname");
        $scope.agentnullname = $.jStorage.get("afname");
        $scope.agentemail = $.jStorage.get("aemail");
        $scope.connected = [];
        $scope.alogout = function () {
            $scope.formData = {
                sessionid: $.jStorage.get("asessionid"),
                user: $.jStorage.get("aid"),
                email: $.jStorage.get("aemail"),
            };
            apiService.logout($scope.formData).then(function (callback) {
                $.jStorage.deleteKey("aid");
                //$.jStorage.set("accesstoken", callback.data.data.token);
                $.jStorage.deleteKey("afname");
                $.jStorage.deleteKey("alname");
                $.jStorage.deleteKey("aemail");
                $.jStorage.deleteKey("access_role");
                $.jStorage.deleteKey("asessionid");
                $.jStorage.deleteKey("anotloggedin");
                $.jStorage.deleteKey("asetsession");
                for (var i = 0; i <= $scope.connected.length - 1; i++) {
                    io.socket.post('/chat/private', {
                        to: parseInt($scope.connected[i].id),
                        msg: " ",
                        fromaccess: "",
                        from_socketid: $scope.asocketId,
                        fromemail: $scope.agentemail,
                        fromid: parseInt($scope.aid),
                        fromname: $scope.afname,
                        messagetype: "disconnect",


                    });
                }
                $scope.connected = [];
                // $rootScope.tabvalue.elements = [];
                // $rootScope.tabvalue.element_values = [];
                // $.jStorage.flush();
                $state.go("login");
                //window.location.href="https://cingulariti.com:8095/#!/login"
            });
        };
        $scope.checkloginstatus = function () {

            $interval(function () {
                if (!$.jStorage.get("asetsession")) {
                    $scope.alogout();

                } else {
                    var curtime = new Date();
                    var s_time = new Date($.jStorage.get("asetsession"));
                    var diff = (curtime - s_time) / 1000;
                    // console.log(diff,"time diff");
                    if (diff < 15) {
                        $.jStorage.set("asetsession", new Date());
                        // console.log(diff,"timeok");
                    } else {
                        // console.log("logout time < 15sec");
                        $scope.alogout();
                    }
                    //$rootScope.logoutagent();
                }
            }, 10000);
        };
        $scope.lastloggedin = function () {
            if (!$.jStorage.get("asetsession")) {
                $scope.alogout();
            } else {
                var curtime = new Date();
                var s_time = new Date($.jStorage.get("asetsession"));
                var diff = (curtime - s_time) / 1000;
                //console.log(diff,"time diff");
                if (diff < 15) {
                    $.jStorage.set("asetsession", new Date());
                    //console.log(diff,"timeok");
                } else {

                    //CsrfTokenService.getCookie("csrftoken").then(function (token) {
                    $scope.alogout();

                    //console.log("logout time < 15sec");
                }
                //$rootScope.logoutagent();
            }
        };
        if ($scope.agentemail != '') {
            //$scope.lastloggedin();
            //$scope.checkloginstatus();
        }
        $scope.gethotkey = function () {
            apiService.gethotkey({}).then(function (response) {

                $rootScope.hotkeymsg = response.data.data;
                $document.on("keydown", '.pvtmsg', function (k) {

                    var findkey = _.find($rootScope.hotkeymsg, function (key) {
                        return key.hotkeystring == k.keyCode && k.altKey;
                    });
                    if (findkey)
                        $(this).val(findkey.message);
                    // console.log(k, "key");
                });
            });
        };

        $scope.gethotkey();
        $scope.scrollagentChatWindow = function (id) {
            $timeout(function () {
                var chatHeight = $("#collapseExampleprivate-room-" + id + " .private_conv").height();
                $("#collapseExampleprivate-room-" + id + " .private_conv").animate({
                    scrollTop: chatHeight
                });
            });
        };
        /*if ($.jStorage.get("firstreload"))
            $scope.firstreload = true;
        else {
            $.jStorage.set("firstreload", true);
            location.reload();
        }*/
        $rootScope.setdisconnectsocket1 = function () {
            //console.log("dc");
            var formData = {
                from_id: $.jStorage.get("aemail")
            };
            apiService.setdisconnectsocket(formData).then(function (data) {

            });
        };
        $scope.setdisconnectsocket1 = function () {
            //console.log("dc");
            var formData = {
                from_id: $.jStorage.get("aemail")
            };
            apiService.setdisconnectsocket(formData).then(function (data) {

            });
        };
        $scope.sendmsg = function (user1, username1, user2, username2, msg) {
            apiService.sendmsg({
                email: $scope.agentemail,
                name: $scope.agentname,
				from_id:user2,
				fromname:username2,
				to_id:user1,
				toname:username1,
                msg: msg
            }).then(function (data) {

            });
        };
        angular.element(document).ready(function () {
            $scope.allchats = [];
            $scope.inputs = [];
            $interval(function () {
                apiService.getchats({
                    email: $scope.agentemail
                }).then(function (data) {
					if(data.data.data) {
						$scope.allchats = data.data.data;
						for (i = 0; i <= data.data.data.length - 1; i++) {
							io.socket.on(data.data.data[i].username1 + '_' + data.data.data[i].user1, function (cdata) {
								//$scope.allchats = cdata;
								//$scope.$apply();
							});
						}
					}
					else
						$scope.allchats = [];
                });
            }, 5000);
            // window.onbeforeunload = function() {
            //     if(check(document.URL))
            //         return "Data will be lost if you leave the page, are you sure?";      
            //     else 
            //         return "Data will be lost if you leave the page, are you sure?aa"; 
            //         //return undefined;
            //     //return "Data will be lost if you leave the page, are you sure?";

            // };
            // $cookies.put("expo","1");
            //         window.addEventListener("beforeunload",function(e){
            //             var formData = {
            //                 from_id: $.jStorage.get("email")
            //             };
            //             apiService.removelive(formData).then(function (data) {

            //             });
            //        });
            //        $(window).bind("onbeforeunload",function(){
            //         var formData = {
            //             from_id: $.jStorage.get("email")
            //         };
            //         apiService.removelive(formData).then(function (data) {

            //         });
            //     });
            //     $(window).bind("unload",function(){
            //         var formData = {
            //             from_id: $.jStorage.get("email")
            //         };
            //         apiService.removelive(formData).then(function (data) {

            //         });
            //    });
            $timeout(function () {
                // $scope.chatpanelheight = $("#chat_window_1").height()-130;
                $scope.agentpanelheight = $(window).height() - 5;
                $scope.agentchatpanelheight = $(window).height() - 200;
            }, 2000);

            $scope.setdisconnectsocket = function () {
                var formData = {
                    from_id: $.jStorage.get("aemail")
                };
                apiService.setdisconnectsocket(formData).then(function (data) {

                });
            };
            // $scope.setdisconnectsocket();


        });
        var promise;
        window.me = {};
        $rootScope.agentsessionid = "";
        // starts the interval
        $scope.startio = function () {
            // stops any running interval to avoid two intervals running at the same time

            $scope.stopio();

            // store the interval promise
            if ($rootScope.agentsessionid == "")
                promise = $interval(connectio, 2000);
        };

        // stops the interval
        $scope.stopio = function () {
            $interval.cancel(promise);
        };

        // starting the interval by default
        // $scope.startio();

        function connectio() {
            //console.log("connectio");
            userdata = {
                sid: $.jStorage.get("aid"),
                email: $.jStorage.get("aemail"),
                name: $.jStorage.get("afname"),
                sname: $.jStorage.get("afname"),
                //name: "Agent",
                access_role: $.jStorage.get("access_role"),
                livechat: 1,
                page: ""
            };
            io.socket.get("/user/announce", {
                query: userdata
            }, function (data) {
                //console.log(data);
                $scope.stopio();
                userdata.socketId = data.socketId;
                userdata.id = data.id;
                $rootScope.agentsessionid = data.id;
                //console.log($rootScope.agentsessionid,"aid");
                $.jStorage.set("asocketId", userdata.asocketId);
                $.jStorage.set("asid", userdata.sid);
                $scope.asocketId = userdata.socketId;
                $scope.sid = userdata.sid;
                window.me = data;
                updateMyName(data);

                // Get the current list of users online.  This will also subscribe us to
                // update and destroy events for the individual users.
                io.socket.get('/user', updateUserList);

                // Get the current list of chat rooms. This will also subscribe us to
                // update and destroy events for the individual rooms.
                io.socket.get('/room', updateRoomList);

            });
        }

        function startPrivateConversation() {

            // Get the user list
            var select = $('#users-list');

            // Make sure a user is selected in the list
            if (select.val() === null) {
                return alert('Please select a user to send a private message to.');
            }

            // Get the recipient's name from the text of the option in the <select>
            var recipientName = $('option:selected', select).text();
            var recipientId = select.val();

            // Prompt for a message to send
            var message = prompt("Enter a message to send to " + recipientName);

            // Create the UI for the room if it doesn't exist
            createPrivateConversationRoom({
                name: recipientName,
                id: recipientId
            });

            // Add the message to the room
            addMessageToConversation($rootScope.agentsessionid, recipientId, message);

            // Send the private message
            io.socket.post('/chat/private', {
                to: recipientId,
                msg: message,
                fromid: $rootScope.agentsessionid,
                fromname: $scope.afname,
                fromaccess: "livechat",
                from_socketid: $scope.asocketId,
                fromemail: $scope.agentemail,


                //to_socketid: newuser[arr_ind].socketId,
            });

        }

        // $scope.$on('$locationChangeStart', function (event, next, current) {
        //     if (check(next+current)) {
        //             var answer = confirm("Are you sure you want to navigate away from this page");
        //         if (!answer) {
        //             event.preventDefault();
        //         }
        //     }    
        // });
        // Create the HTML to hold a private conversation between two users
        function createPrivateConversationRoom(penPal) {

            // Get the ID of the HTML element for this private convo, if there is one
            var roomName = 'private-room-' + penPal.id;
            //console.log(penPal);
            // If HTML for the room already exists, return.
            if ($('#' + roomName).length) {
                $('#private-message-' + penPal.id).show();
                $('#private-button-' + penPal.id).show();
                return;
            }

            var penPalName = penPal.sname == "unknown" ? ("User #" + penPal.id) : penPal.sname;

            // Create a new div to contain the room
            var roomDiv = $('<div id="' + roomName + '"></div>');



            // Create the HTML for the room
            //            var roomHTML = '<div class="userlist"><button class="blink-bg blink_me" data-toggle="collapse" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"></button><button type="button" class="btn useronline "  > <span  id="private-username-' + penPal.id + '"><span class="userimg"><img src="img/logo7.png" class="img-fluid"></span>' + penPalName + '</span><span class="pull-right onlinesymbol"><i class="fa fa-circle" aria-hidden="true"></i></span></button></div>';
            //            var chatconv = '<div class="collapse in" id="collapseExample' + roomName + '"><div id="private-messages-' + penPal.id + '" style="height:' + $scope.agentchatpanelheight + 'px;" class="private_conv"></div>' +
            //                '<div class="row"><div class="col-md-9"><input id="private-message-' + penPal.id + '" placeholder="Enter Message"  class="form-control pvtmsg"/></div><div class="col-md-3"> <button class="btn btn-primary agentsendbtn" id="private-button-' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '"><i class="fa fa-paper-plane" aria-hidden="true"></i></button"></div></div></div>';
            //            roomDiv.html(roomHTML);

            // var roomHTML = '<div class="userlist"><button class="blink-bg blink_me blinkbtn' + penPal.id + '" data-toggle="tab" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"><i class="fa fa-times" aria-hidden="true"></i></button><button type="button" class="btn useronline show-blink " data-toggle="tab" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"> <span class="user-right" id="private-username-' + penPal.id + '"><span class="userimg"><img src="img/logo7.png" class="img-fluid"></span>' + penPalName + '</span><span class="pull-right onlinesymbol"><i class="fa fa-circle" aria-hidden="true"></i></span><i class="fa fa-times closechat" aria-hidden="true" id="private-username-' + penPal.id + '" ></i></button></div>';
            var roomHTML = '<div class="userlist"><button class="blink-bg blink_me blinkbtn' + penPal.id + '" data-toggle="tab" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"></button><button type="button" class="btn useronline show-blink" data-toggle="tab" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"> <span class="user-right closechat" id="private-username-' + penPal.id + '"><span class="userimg"><img src="img/logo7.png" class="img-fluid"></span>' + penPalName + '</span><span class="pull-right onlinesymbol addgreen' + penPal.id + '" data-toggle="tab" data-target="#collapseExample' + roomName + '" aria-expanded="false" aria-controls="collapseExample' + roomName + '"><i class="fa fa-circle" aria-hidden="true"></i></span><i class="fa fa-times closechatt" aria-hidden="true" id="chatclose" id="private-username-' + penPal.id + '"  id="collapseExample' + roomName + '" ></i></button></div>';
            // var chatconv = '<div class="tab-pane fade " id="collapseExample' + roomName + '"><div id="private-messages-' + penPal.id + '" style="height:' + $scope.agentchatpanelheight + 'px;"  class="private_conv"></div>' +
            // '<div class="row"><div class="col-md-9"><input id="private-message-' + penPal.id + '" placeholder="Enter Message"  class="form-control bor-gray pvtmsg"/></div><div class="col-md-1"> <button class="btn btn-primary agentsendbtn" id="private-button-' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '"><i class="fa fa-paper-plane" aria-hidden="true"></i></button"></div> <div class="col-md-2"><div class="agent-list" ng-if="liveuserlist"> <select><option disabled selected>Transfer chat</option> <option  data-ng-repeat="liveuser in liveuserlist">{{liveuser.name}}</option> </select> </div> </div></div></div>'; roomDiv.html(roomHTML);
            // var chatconv = '<div class="tab-pane fade " id="collapseExample' + roomName + '"><div id="private-messages-' + penPal.id + '" style="height:' + $scope.agentchatpanelheight + 'px;"  class="private_conv"></div>' +
            //     '<div class="row"><div class="col-md-9"><input id="private-message-' + penPal.id + '" placeholder="Enter Message"  class="form-control bor-gray pvtmsg"/></div><div class="col-md-1"> <button class="btn btn-primary agentsendbtn " id="private-button-' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '"><i class="fa fa-paper-plane" aria-hidden="true"></i></button"></div><div class="col-md-2"><button type="button" class="btn btn-primary btn-md transferchat" data-id="' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '">Transfer chat</button></div></div></div>'; roomDiv.html(roomHTML);
            var chatconv = '<div class="tab-pane fade " id="collapseExample' + roomName + '"><div id="private-messages-' + penPal.id + '" style="height:' + $scope.agentchatpanelheight + 'px;"  class="private_conv"></div>' +
                '<div class="row"><div class="col-md-9"><input id="private-message-' + penPal.id + '" placeholder="Enter Message"  class="form-control bor-gray pvtmsg"/></div><div class="col-md-1"> <button class="btn btn-primary agentsendbtn " id="private-button-' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '"><i class="fa fa-paper-plane" aria-hidden="true"></i></button"></div><div class="col-md-2"><button type="button" class="btn btn-primary btn-md enduserchat" id="endchat" data-id="' + penPal.id + '" data-sname="' + penPal.sname + '" data_id="' + penPal.fromemail + '" data-socketid="' + penPal.from_socketid + '">End chat</button> </div></div></div>';
            roomDiv.html(roomHTML);

            // Add the room to the private conversation area
            $('#convos .agentusersidebar').append(roomDiv);
            $("#convos_chat").append(chatconv);
            // Hook up the "send message" button
            $('#private-button-' + penPal.id).click(onClickSendPrivateMessage);


            window.onbeforeunload = function () {
                return "Data will be lost if you leave the page, are you sure?";

            };

            //   $(document).on('click', '.closechat', function () {
            //     console.log("%%%%%%%%%hihihihi")

            //     removeUser(message.data.from.id);
            //    });

            //   $("#endchat").on('click', function(){
            //     $("#collapseExample").remove();
            //    });

            //get live agent list

            apiService.getliveuser().then(function (data) {
                $scope.liveuserlist = data.data.data;

                var evens = _.remove($scope.liveuserlist, function (n) {
                    return n.email == $scope.agentemail || n.email == null;
                });

                angular.forEach($scope.liveuserlist, function (value) {

                });

            });

        }


        //transfer user chat
        $scope.tarsferuserchat = function (data, items) {
            //    console.log("************socketid" ,data)
            //    console.log("@@@@@@@@@@@@@",items)



            var formData = {

                from_socketid: items.usocketid,
                to_socketid: $.jStorage.get('asocketId'),
                to_agentid: data.selectedOption.asocketId,
                to_id: data.selectedOption.aemail,

            };
            apiService.transferchat(formData).then(function (responsedata) {
                io.socket.post('/chat/private', {
                    to: data.selectedOption.id,
                    msg: responsedata.data.data.chatlist,
                    fromaccess: "",
                    from_socketid: items.usocketid,
                    fromemail: items.uemail,
                    fromid: items.uid,
                    fromname: items.uname,
                    // fromemail: $.jStorage.get("email"),
                });
                io.socket.post('/chat/private', {
                    to: parseInt(items.uid),
                    msg: "now u r connected to " + '' + data.selectedOption.sname,
                    fromaccess: "",
                    from_socketid: $.jStorage.get('asocketId'),
                    fromemail: $.jStorage.get('aemail'),
                    fromid: parseInt($.jStorage.get('aid')),
                    fromname: $.jStorage.get("afname"),
                    messagetype: "Transfer",
                    extraobj: data.selectedOption,

                });
                var formData = {
                    session_id: $.jStorage.get('session_id'),
                    msg: responsedata.data.data.chatlist[0],
                    from_id: items.uemail,
                    fromid: $rootScope.agentsessionid,
                    fromname: items.uname,
                    from_socketid: items.usocketid,
                    toid: data.selectedOption.aid,
                    toname: data.selectedOption.name,
                    to_id: data.selectedOption.aemail,
                    to_socketid: data.selectedOption.asocketId
                };
                apiService.saveagentchat(formData).then(function (data) {

                });

            });
            removeUser(items.uid);
        }

        $scope.$modalInstance = {};
        $scope.opentransferChat = function (data) {
            //console.log("hihihihihi", data) 

            //    $rootScope.viewdata = d;

            $scope.$modalInstance = $uibModal.open({
                scope: $scope,
                animation: true,
                size: 'md',
                templateUrl: 'views/modal/transferchat.html',
                resolve: {
                    items: function () {
                        return $rootScope.sendobj;
                    }
                },
                controller: 'TrasferchatCtrl'
            });
        };
        $scope.transferchatcancel = function () {
            //console.log("dismissing");
            $scope.$modalInstance.dismiss('cancel');
            //$scope.$modalInstance.close();
        };

        $(document).on('click', '.transferchat', function () {

            var uid = $(this).attr("data-id");
            var uname = $(this).attr("data-sname");
            var uemail = $(this).attr("data_id");
            var usocketid = $(this).attr("data-socketid");

            $rootScope.sendobj = {
                uid: uid,
                uname: uname,
                uemail: uemail,
                usocketid: usocketid
            };

            $scope.opentransferChat($rootScope.sendobj);
        });
        $(document).on('click', '.closechatt', function () {
            var closing = $(this).parent("button").attr("data-target");
            var idclosing = closing.split("-");
            $scope.removeuserxbutton(idclosing[2]);

        });
        $(document).on('click', '.enduserchat', function () {

            var uid = $(this).attr("data-id");
            var uname = $(this).attr("data-sname");
            var uemail = $(this).attr("data_id");
            var usocketid = $(this).attr("data-socketid");

            $("button[aria-controls='collapseExampleprivate-room-" + uid + "'] .closechatt").show();


            io.socket.post('/chat/private', {
                to: parseInt(uid),
                msg: "",
                fromaccess: "",
                from_socketid: $scope.asocketId,
                fromemail: $scope.agentemail,
                fromid: parseInt($scope.aid),
                fromname: $scope.agentname,
                messagetype: "disconnect",

            });
            // var formData = {
            //     session_id: $.jStorage.get('session_id'),
            //     msg: "",
            //     from_id:$scope.agentemail ,
            //     fromid: $rootScope.agentsessionid,
            //     fromname:$scope.agentname ,
            //     from_socketid:  $scope.asocketId,
            //     toid: uid,
            //     toname:uname,
            //     to_id: uemail ,
            //     to_socketid: usocketid
            // };
            var formData = {
                disconnectby: $scope.agentemail,
                from_id: uemail,
                to_id: $scope.agentemail,
                socketid: $scope.asocketId,

            };
            apiService.disconnectuser(formData).then(function (data) {

            });
            $scope.removeuser(uid);
            $(this).hide();
            removeUser(uid);

        });
        $("#chatclose").hide();


        $(document).on('click', '.closechat', function () {

            var uid = $(this).attr("id");
            // var uname = $(this).attr("data-sname");
            // var uemail = $(this).attr("data_id");
            // var usocketid = $(this).attr("data-socketid");

            //   apiService.disconnectuser(formData).then(function (data) {

            //     });
            $scope.removeuser(uid);
            $(this).hide();
            removeUser(uid);
        });


        // Callback for when the user clicks the "Send message" button in a private conversation
        function onClickSendPrivateMessage(e) {

            // Get the button that was pressed
            var button = e.currentTarget;

            // Get the ID of the user we want to send to
            var recipientId = parseInt(button.id.split('-')[2]);
            var from_socketid = $(this).attr("data-socketid");
            var from_id = $(this).attr("data_id");
            var from_sname = $(this).attr("data-sname");
            // Get the message to send
            var message = $('#private-message-' + recipientId).val();
            // console.log(message);
            // console.log(recipientId);
            // console.log(message);
            // console.log(message);
            $('#private-message-' + recipientId).val("");
            if (message != '') {
                // Add this message to the room
                addMessageToConversation(window.me.id, recipientId, message);

                // Send the message
                io.socket.post('/chat/private', {
                    to: recipientId,
                    msg: message,
                    fromaccess: "",
                    from_socketid: $scope.asocketId,
                    fromemail: $scope.agentemail,
                    fromid: $rootScope.agentsessionid,
                    fromname: $scope.agentname,

                });
                var formData = {
                    msg: message,
                    from_id: $scope.agentemail,
                    fromid: $rootScope.agentsessionid,
                    fromname: $scope.agentname,
                    from_socketid: $scope.asocketId,
                    toid: recipientId,
                    toname: from_sname,
                    to_id: from_id,
                    to_socketid: from_socketid
                };
                apiService.saveagentchat(formData).then(function (data) {

                });
                $scope.scrollagentChatWindow(recipientId);
            }
        }

        function viewtransferchat(senderId, recipientId, message, sender) {

            var divstring = "";
            var fromMe = senderId == window.me.id;
            var roomName = 'private-messages-' + (fromMe ? recipientId : senderId);
            var senderName = fromMe ? "Me" : $('#private-username-' + senderId).html();
            var alignclass = fromMe ? 'pull-right' : 'pull-left';
            var bubbleclass = fromMe ? 'rightbubble' : 'leftbubble';
            var floatclass = fromMe ? 'floatright' : 'floatleft';
            for (var i = 0; i < message.length; i++) {
                if (message[i].position == 'right') {
                    floatclass = "floatleft";
                    alignclass = "pull-left";
                    bubbleclass = "leftbubble";
                    var div = $('<div class="' + floatclass + '"></div>');
                    if (typeof (message[i].msg) == 'string') {
                        //divstring += ""message[i].msg;

                        div.html('<strong class="' + alignclass + '">' + senderName + '</strong>  <div  class="' + bubbleclass + '">' + message[i].msg + '</div>');

                    } else if (typeof (message[i].msg) == 'object') {
                        if (message[i].msg.type == 'SYS_DT_RES') {
                            div.html('<strong class="' + alignclass + '">' + senderName + '</strong><div  class="' + bubbleclass + '">' + message[i].msg.Text + "</div>");
                        }
                    }
                    $('#' + roomName).append(div);
                    $scope.scrollagentChatWindow(senderId);
                } else if (message[i].position == 'left') {
                    floatclass = "floatright";
                    bubbleclass = "rightbubble";
                    alignclass = "pull-right";
                    if (message[i].msg.tiledlist) {
                        var div = $('<div class="' + floatclass + '"></div>');
                        if (message[i].msg.tiledlist[0].type == 'DTHyperlink' || message[i].msg.tiledlist[0].type == 'Process Tree') {
                            dtstring = "";
                            for (var j = 0; j < message[i].msg.tiledlist[0].DT.length; j++) {
                                dtstring += "<div class='dthyperlink chatdt'>" + message[i].msg.tiledlist[0].DT[j] + "</div>";
                            }

                            div.html('<strong class="' + alignclass + '">Bot</strong><div  class="' + bubbleclass + '">' + dtstring + '</div>');

                        } else if (message[i].msg.tiledlist[0].type == 'text') {
                            div.html('<strong class="' + alignclass + '">Bot</strong> <div  class="' + bubbleclass + '">' + message[i].msg.tiledlist[0].Text + '</div>');
                        } else if (message[i].msg.tiledlist[0].type == 'product listing') {

                            var pl = "";
                            pl += "<div class='carousel slide' id='myCarousel'>";
                            pl += "<div class='carousel-inner'>";
                            for (var k = 0; k < message[i].msg.tiledlist[0].product_list.length; k++) {
                                pl += "<div class='item carousel_item2'  >";

                                pl += "<div class='col-xs-12' >";
                                // <div class="text-box" ng-if="imagelist.Brand_Name!=''">
                                //     <div class="imgtitle2">
                                //         <b><span>
                                //             <ng-bind-html  ng-bind-html="imagelist.Brand_Name">
                                //                 {{imagelist.Brand_Name}}
                                //             </ng-bind-html>
                                //         </span></b>
                                //     </div>
                                // </div> 
                                pl += "<div class='img-box2'>";
                                pl += "<a ng-href='http://exponentiadata.co.in/kotakdm/uploads/productlisting/" + message[i].msg.tiledlist[0].product_list[k] + ".image_name'  data-fancybox='imggroup2' rel='gallary' fancybox  data-caption='" + message[i].msg.tiledlist[0].product_list[k].details + "'  >";
                                pl += " <img ng-src='http://exponentiadata.co.in/kotakdm/uploads/productlisting/" + message[i].msg.tiledlist[0].product_list[k] + ".image_name}}' class='img-full'>";
                                pl += "</a>";
                                pl += "</div>";
                                pl += "</div>";
                                pl += "</div>";
                            }
                            pl += "</div>";
                            pl += "<a class='left carousel-control' href='#myCarousel' data-slide='prev'><i class='glyphicon glyphicon-chevron-left'></i></a>";
                            pl += "<a class='right carousel-control' href='#myCarousel' data-slide='next'><i class='glyphicon glyphicon-chevron-right'></i></a>";
                            pl += "</div>";
                            div.html('<strong class="' + alignclass + '">Bot</strong><div  class="' + bubbleclass + '">' + pl + '</div>');
                        }
                        $('#' + roomName).append(div);
                        $scope.scrollagentChatWindow(senderId);
                    }
                }
            }


        }

        function botconversation(senderId, recipientId, message, sender) {
            /*_.remove(message, function(n) {
            	return n.msg.type == "SYS_FIRST";
            });*/
            var divstring = "";
            var fromMe = senderId == $rootScope.agentsessionid;
            var roomName = 'private-messages-' + (fromMe ? recipientId : senderId);
            var senderName = fromMe ? "Me" : $('#private-username-' + senderId).html();
            var alignclass = fromMe ? 'pull-right' : 'pull-left';
            var bubbleclass = fromMe ? 'rightbubble' : 'leftbubble';
            var floatclass = fromMe ? 'floatright' : 'floatleft';
            for (var i = 0; i < message.length; i++) {
                if (message[i].position == 'right') {
                    floatclass = "floatleft";
                    alignclass = "pull-left";
                    bubbleclass = "leftbubble";
                    var div = $('<div class="' + floatclass + '"></div>');
                    if (typeof (message[i].msg) == 'string') {
                        //divstring += ""message[i].msg;

                        div.html('<strong class="' + alignclass + '">' + senderName + '</strong>  <div  class="' + bubbleclass + '">' + message[i].msg + '</div>');

                    } else if (typeof (message[i].msg) == 'object') {
                        if (message[i].msg.type == 'SYS_DT_RES') {
                            div.html('<strong class="' + alignclass + '">' + senderName + '</strong><div  class="' + bubbleclass + '">' + message[i].msg.Text + "</div>");
                        }
                    }
                    $('#' + roomName).append(div);
                    $scope.scrollagentChatWindow(senderId);
                } else if (message[i].position == 'left') {
                    floatclass = "floatright";
                    bubbleclass = "rightbubble";
                    alignclass = "pull-right";
                    if (message[i].msg.tiledlist) {
                        var div = $('<div class="' + floatclass + '"></div>');
                        if (message[i].msg.tiledlist[0].type == 'DTHyperlink' || message[i].msg.tiledlist[0].type == 'Process Tree') {
                            dtstring = "";
                            for (var j = 0; j < message[i].msg.tiledlist[0].DT.length; j++) {
                                dtstring += "<div class='dthyperlink chatdt'>" + message[i].msg.tiledlist[0].DT[j] + "</div>";
                            }

                            div.html('<strong class="' + alignclass + '">Bot</strong><div  class="' + bubbleclass + '">' + dtstring + '</div>');

                        } else if (message[i].msg.tiledlist[0].type == 'text') {
                            div.html('<strong class="' + alignclass + '">Bot</strong> <div  class="' + bubbleclass + '">' + message[i].msg.tiledlist[0].Text + '</div>');
                        } else if (message[i].msg.tiledlist[0].type == 'product listing') {

                            var pl = "";
                            pl += "<div class='carousel slide' id='myCarousel'>";
                            pl += "<div class='carousel-inner'>";
                            for (var k = 0; k < message[i].msg.tiledlist[0].product_list.length; k++) {
                                pl += "<div class='item carousel_item2'  >";

                                pl += "<div class='col-xs-12' >";
                                // <div class="text-box" ng-if="imagelist.Brand_Name!=''">
                                //     <div class="imgtitle2">
                                //         <b><span>
                                //             <ng-bind-html  ng-bind-html="imagelist.Brand_Name">
                                //                 {{imagelist.Brand_Name}}
                                //             </ng-bind-html>
                                //         </span></b>
                                //     </div>
                                // </div> 
                                pl += "<div class='img-box2'>";
                                pl += "<a ng-href='http://exponentiadata.co.in/kotakdm/uploads/productlisting/" + message[i].msg.tiledlist[0].product_list[k] + ".image_name'  data-fancybox='imggroup2' rel='gallary' fancybox  data-caption='" + message[i].msg.tiledlist[0].product_list[k].details + "'  >";
                                pl += " <img ng-src='http://exponentiadata.co.in/kotakdm/uploads/productlisting/" + message[i].msg.tiledlist[0].product_list[k] + ".image_name}}' class='img-full'>";
                                pl += "</a>";
                                pl += "</div>";
                                pl += "</div>";
                                pl += "</div>";
                            }
                            pl += "</div>";
                            pl += "<a class='left carousel-control' href='#myCarousel' data-slide='prev'><i class='glyphicon glyphicon-chevron-left'></i></a>";
                            pl += "<a class='right carousel-control' href='#myCarousel' data-slide='next'><i class='glyphicon glyphicon-chevron-right'></i></a>";
                            pl += "</div>";
                            div.html('<strong class="' + alignclass + '">Bot</strong><div  class="' + bubbleclass + '">' + pl + '</div>');
                        }
                        $('#' + roomName).append(div);
                        $scope.scrollagentChatWindow(senderId);
                    }
                }
            }
        }
        // Add HTML for a new message in a private conversation
        function addMessageToConversation(senderId, recipientId, message, sender) {
            // console.log("*************************8", sender);
            var fromMe = senderId == $rootScope.agentsessionid;
            var roomName = 'private-messages-' + (fromMe ? recipientId : senderId);
            var senderName = fromMe ? "Me" : $('#private-username-' + senderId).html();
            // console.log(message);
            // console.log(senderId);
            if (typeof (message) == 'string') {
                var justify = fromMe ? 'right' : 'left';
                var alignclass = fromMe ? 'pull-right' : 'pull-left';
                var bubbleclass = fromMe ? 'rightbubble' : 'leftbubble';
                var floatclass = fromMe ? 'floatright' : 'floatleft';
                var div = $('<div class="' + floatclass + '" ></div>');
                div.html('<strong class="' + alignclass + '">' + senderName + '</strong> <div  class="' + bubbleclass + '">' + message + '</div>');
                $('#' + roomName).append(div);
                $('.blinkbtn' + senderId).show();
                $('.addgreen' + senderId).show();

                $scope.scrollagentChatWindow(senderId);

            } else {
                // botconversation(senderId, recipientId, message, sender);
                viewtransferchat(senderId, recipientId, message, sender);
            }
            $(".enduserchat[data-id=" + senderId + "]").show()
            $("#private-room-" + senderId).removeClass("gtor");
        }



        function notifyMe(msg) {
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                alert("This browser does not support system notifications");
            }
            // Let's check whether notification permissions have already been granted
            else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                var notification = new Notification(msg);
            }

            // Otherwise, we need to ask the user for permission
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        var notification = new Notification(msg);
                    }
                });
            }

            // Finally, if the user has denied notifications and you 
            // want to be respectful there is no need to bother them any more.
        }

        // Handle an incoming private message from the server.
        function receivePrivateMessage(data) {

            var sender = data.from;

            // Create a room for this message if one doesn't exist
            createPrivateConversationRoom(sender);
            //window blink
            // console.log(sender);
            var oldTitle = document.title;
            var msg = "New Msg from " + sender.sname;
            var timeoutId = false;

            var blink = function () {
                document.title = document.title == msg ? oldTitle : msg; //Modify Title in case a popup

                if (document.hasFocus()) //Stop blinking and restore the Application Title
                {
                    document.title = oldTitle;
                    clearInterval(timeoutId);
                }
            };
            notifyMe(msg);
            if (!timeoutId) {
                timeoutId = setInterval(blink, 500); //Initiate the Blink Call
            }; //Blink logic
            // Add a message to the room
            addMessageToConversation(sender.id, $rootScope.agentsessionid, data.msg, sender);
            //$(".chat").append("<li class='left clearfix'><span class='chat-img pull-left'><img ng-src='img/Tenali.png' alt='BOT' class='img-circle  doneLoading' src='img/Tenali.png'></span><div class='chat-body'><p>"+data.msg+" </p></div></li>");
            //console.log(data, "recvdmsg");
            mymsg = {
                Text: data.msg,
                type: "SYS_FIRST"
            };
            //$rootScope.chatlist.push({id:"id",msg:mymsg,position:"left",curTime: $rootScope.getDatetime()});
            //$rootScope.pushSystemMsg(0,mymsg);  


            $scope.coinAudio = new Audio('audio/sound.mp3');
            $scope.coinAudio.pause();
            $scope.coinAudio.play();



        }
        angular.element(document).ready(function () {
            //$('.pvtmsg').keypress(function (e) {
            // $('.pvtmsg').keyup(function(){
            //     console.log("entering");
            //     if (e.which == 13) {
            //         console.log("entering");
            //         var id=$(this).attr('id');
            //         var intid =parseInt(id.split('private-button-'));
            //         $('#private-button-'+intid).click(onClickSendPrivateMessage);
            //         return false;    //<---- Add this line
            //     }
            // });
            $(document).on("keyup", ".pvtmsg", function (e) {
                if (e.which == 13) {
                    // console.log("entering");
                    var id = $(this).attr('id');
                    var intid = id.split('private-message-');
                    var myid = intid[1];
                    // console.log(myid);
                    $('#private-button-' + myid).trigger("click");
                    //$('#private-button-'+myid).click(onClickSendPrivateMessage);
                    //return false;    //<---- Add this line
                }
            });
            // function pvtkeyup(e){
            //     console.log("entering");
            //     if (e.which == 13) {
            //         console.log("entering");
            //         var id=$(this).attr('id');
            //         var intid =parseInt(id.split('private-button-'));
            //         $('#private-button-'+intid).click(onClickSendPrivateMessage);
            //         return false;    //<---- Add this line
            //     }
            // }
        });
        $scope.removeuser = function (id) {
            //console.log("*************hihih",id);
            // $("#private-room-"+id).remove();
            $("#private-room-" + id).addClass('gtor');
            $("#collapseExampleprivate-room-" + id).addClass('gtor');
            // $("#collapseExampleprivate-room-"+id).remove();
            // _.remove($scope.connected, function(n) {
            //     return n.id == id;
            // });
        };
        $scope.removeuserxbutton = function (id) {
            //console.log("*************hihih",id);
            $("#private-room-" + id).remove();
            // $("#private-room-" + id).addClass('gtor');
            // $("#collapseExampleprivate-room-" + id).addClass('gtor');
            $("#collapseExampleprivate-room-" + id).remove();
            _.remove($scope.connected, function (n) {
                return n.id == id;
            });
        };

        io.socket.on('connect', function socketConnected() {

            // Show the main UI
            $('#disconnect').hide();
            $('#main').show();

            // Announce that a new user is online--in this somewhat contrived example,
            // this also causes the CREATION of the user, so each window/tab is a new user.
            if ($rootScope.agentsessionid != 0) {
                $timeout(function () {
                    userdata = {
                        sid: $.jStorage.get("aid"),
                        email: $.jStorage.get("aemail"),
                        name: $.jStorage.get("afname") + ' ' + $.jStorage.get("lname"),
                        sname: $.jStorage.get("afname") + ' ' + $.jStorage.get("lname"),
                        //name: "Agent",
                        access_role: $.jStorage.get("access_role"),
                        livechat: 1,
                        page: ""
                    };
                    io.socket.get("/user/announce", {
                        query: userdata
                    }, function (data) {
                        //console.log(data);

                        updateMyName(data);
                        userdata.socketId = data.socketId;
                        userdata.id = data.id;
                        $rootScope.agentsessionid = data.id;
                        //console.log($rootScope.agentsessionid,"aid");
                        $.jStorage.set("asocketId", userdata.asocketId);
                        $.jStorage.set("asid", userdata.sid);
                        $scope.socketId = userdata.asocketId;
                        $scope.sid = userdata.sid;
                        window.me = data;
                        // Get the current list of users online.  This will also subscribe us to
                        // update and destroy events for the individual users.
                        io.socket.get('/user', updateUserList);

                        // Get the current list of chat rooms. This will also subscribe us to
                        // update and destroy events for the individual rooms.
                        io.socket.get('/room', updateRoomList);

                    });
                }, 500);

            }
            // Listen for the "room" event, which will be broadcast when something
            // happens to a room we're subscribed to.  See the "autosubscribe" attribute
            // of the Room model to see which messages will be broadcast by default
            // to subscribed sockets.
            io.socket.on('room', function messageReceived(message) {
                // console.log(message);
                switch (message.verb) {

                    // Handle room creation
                    case 'created':
                        addRoom(message.data);
                        break;

                        // Handle a user joining a room
                    case 'addedTo':
                        // Post a message in the room
                        postStatusMessage('room-messages-' + message.id, $('#user-' + message.addedId).text() + ' has joined');
                        // Update the room user count
                        increaseRoomCount(message.id);
                        break;

                        // Handle a user leaving a room
                    case 'removedFrom':
                        // Post a message in the room
                        postStatusMessage('room-messages-' + message.id, $('#user-' + message.removedId).text() + ' has left');
                        // Update the room user count
                        decreaseRoomCount(message.id);
                        break;

                        // Handle a room being destroyed
                    case 'destroyed':
                        removeRoom(message.id);
                        break;

                        // Handle a public message in a room.  Only sockets subscribed to the "message" context of a
                        // Room instance will get this message--see the "join" and "leave" methods of RoomController.js
                        // to see where a socket gets subscribed to a Room instance's "message" context.
                    case 'messaged':
                        receiveRoomMessage(message.data);
                        break;

                    default:
                        break;

                }

            });

            // Listen for the "user" event, which will be broadcast when something
            // happens to a user we're subscribed to.  See the "autosubscribe" attribute
            // of the User model to see which messages will be broadcast by default
            // to subscribed sockets.
            io.socket.on('user', function messageReceived(message) {
                //console.log(message);
                switch (message.verb) {

                    // Handle user creation
                    case 'created':

                        var finduid = _.find($scope.connected, function (o) {

                            return o.fromemail == message.data.email;

                        });
                        // console.log(message.data.email,"inside");

                        // console.log($scope.connected,"ccc");
                        if (finduid) {
                            // console.log(finduid,"inside");
                            $("div[id='private-room-" + finduid.id + "']").attr("id", "private-room-" + message.data.id);
                            $(".blinkbtn" + finduid.id).removeClass("blinkbtn" + finduid.id).addClass("blinkbtn" + message.data.id);
                            $("button[data-target='#collapseExampleprivate-room-" + finduid.id + "']").attr("data-target", "#collapseExampleprivate-room-" + message.data.id);
                            $("button[aria-controls='collapseExampleprivate-room-" + finduid.id + "']").attr("aria-controls", "collapseExampleprivate-room-" + message.data.id);
                            $("span.user-right[id='private-username-" + finduid.id + "']").attr("id", "private-username-" + message.data.id);
                            $(".tab-pane[id='collapseExampleprivate-room-" + finduid.id + "']").attr("id", "collapseExampleprivate-room-" + message.data.id);
                            $("div[id='private-messages-" + finduid.id + "']").attr("id", "private-messages-" + message.data.id);
                            $("input[id='private-message-" + finduid.id + "']").attr("id", "private-message-" + message.data.id);
                            $("button[id='private-button-" + finduid.id + "']").attr("id", "private-button-" + message.data.id);
                            $("button[data-socketid='" + finduid.socketId + "']").attr("data-socketId", message.data.socketId);
                            $("button[data-id='" + finduid.id + "']").attr("data-id", message.data.id);
                            _.remove($scope.connected, function (n) {
                                return n.fromemail == message.data.email;
                            });
                            $("#users-list option[id='user-" + finduid.id + "']").remove();
                        }


                        addUser(message.data);
                        break;

                        // Handle a user changing their name
                    case 'updated':

                        // Get the user's old name by finding the <option> in the list with their ID
                        // and getting its text.
                        var oldName = $('#user-' + message.id).text();

                        // Update the name in the user select list
                        $('#user-' + message.id).text(message.data.name);

                        // If we have a private convo with them, update the name there and post a status message in the chat.
                        if ($('#private-username-' + message.id).length) {
                            $('#private-username-' + message.id).html(message.data.name);
                            postStatusMessage('private-messages-' + message.id, oldName + ' has changed their name to ' + message.data.name);
                        }

                        break;

                        // Handle user destruction
                    case 'destroyed':
                        // removeUser(message.id);

                        // $scope.removeuser(message.id);

                        // $scope.removeuser = function(data){
                        //     console.log("%%%%%%%%%hihihihi")
                        //     removeUser(message.data.from.id);
                        // }
                        //     $(document).on('click', '.closechat', function () {
                        //         console.log("%%%%%%%%%hihihihi")

                        //         removeUser(message.data.from.id);
                        //  });

                        break;

                        // Handle private messages.  Only sockets subscribed to the "message" context of a
                        // User instance will get this message--see the onConnect logic in config/sockets.js
                        // to see where a new user gets subscribed to their own "message" context
                    case 'messaged':
                        {

                            if (message.data.messagetype && message.data.messagetype == 'disconnect') {
                                removeUser(message.data.from.id);
                                $scope.removeuser(message.data.from.id);



                            } else {
                                receivePrivateMessage(message.data);
                                $scope.connected.push(message.data.from);
                            }
                        }

                        break;

                    default:
                        break;
                }

            });

            // Add a click handler for the "Update name" button, allowing the user to update their name.
            // updateName() is defined in user.js.
            $('#update-name').click(updateName);

            // Add a click handler for the "Send private message" button
            // startPrivateConversation() is defined in private_message.js.
            $('#private-msg-button').click(startPrivateConversation);

            // Add a click handler for the "Join room" button
            // joinRoom() is defined in public_message.js.
            $('#join-room').click(joinRoom);

            // Add a click handler for the "New room" button
            // newRoom() is defined in room.js.
            $('#new-room').click(newRoom);

            // console.log('Socket is now connected!');

            // When the socket disconnects, hide the UI until we reconnect.
            io.socket.on('disconnect', function () {
                // Hide the main UI
                $('#main').hide();
                $('#disconnect').show();
                $scope.setdisconnectsocket1();
            });

        });


        //key event

        // $rootScope.hotkeymsg = [{
        //         'keycode': 72,
        //         'msg': "Hello! Thank you for contacting Ross-Simons. I am a customer service representative and I am here to assist you. How may I help you today?",
        //     },
        //     {
        //         'keycode': 71,
        //         'msg': " Thank you for chatting with Ross-Simons. We value your feedback. Please click the “End Chat” button at the top right of your Visitor Chat Window to answer a few questions about your experience with us today.",
        //     },
        //     {
        //         'keycode': 90,
        //         'msg': "Sorry we are not able to continue our chat. Since I have not heard from you for some time, I am going to close this chat. If you need any help in the future, please do not hesitate to chat with us again.",
        //     },
        //     {
        //         'keycode': 84,
        //         'msg': "Thank you!",
        //     },
        //     {
        //         'keycode': 87,
        //         'msg': "You’re welcome.",
        //     },
        //     {
        //         'keycode': 88,
        //         'msg': "You’re welcome. Is there anything else I can help you with today?",
        //     },
        //     {
        //         'keycode': 81,
        //         'msg': "Have a nice day!",
        //     },
        //     {
        //         'keycode': 82,
        //         'msg': "Do you have the order number? If not, I can use your email address to access the order.",
        //     },
        //     {
        //         'keycode': 66,
        //         'msg': "Can you please verify your billing address?",
        //     },
        //     {
        //         'keycode': 73,
        //         'msg': "Can I have the item number please?",
        //     },
        //     {
        //         'keycode': 70,
        //         'msg': "Is there anything else I can help you with today?",
        //     },
        //     {
        //         'keycode': 89,
        //         'msg': "I have not heard from you for a few moments. Are you still with me?",
        //     },
        //     {
        //         'keycode': 83,
        //         'msg': "One moment please while I look that up for you.",
        //     },
        //     {
        //         'keycode': 85,
        //         'msg': "If there is anything else we can help you with, please not hesitate to contact us again.",
        //     },
        //     {
        //         'keycode': 86,

        //         'msg': "We wanted to take this opportunity to introduce our VIP Rewards Club Membership. This program offers benefits such as free upgraded shipping, free returns, $150 in coupons to be used on future orders and other exclusive offers. Click the link below to read more about this membership program.http://www.ross-simons.com/content/vip",
        //     },
        //     {
        //         'keycode': 67,
        //         'msg': " If you purchase an item and something should happen to that item outside of our 30 day return policy but within 12 months from the date of purchase, you can return the item to our Repair Department. We would be happy to see if it may be repairable or replaceable at no cost to you. If it is outside of 12 months, you can still return the item to our Repair Department and we will be happy to see if the item is repairable.",
        //     },
        //     {
        //         'keycode': 77,
        //         'msg': " If for any reason you are not 100% satisfied with your purchase within 30 days of receipt, youmay return any unused merchandise that has not been engraved or customized for a refund, credit or exchange (minus shipping &amp; handling). Merchandise returned must be in its original condition and credit is subject to merchandise being reviewed by our Quality Assurance Specialists. Merchandise that is damaged or altered in any way by a Jeweler other than Ross-Simons cannot be returned. A merchandise credit will be issued if merchandise received as a gift is returned by the recipient. Items that have been personalized cannot be returned. Items may be returned by any shipping method you prefer, but for your security, please be sure to insure your package for the full value of the items.",
        //     },
        //     {
        //         'keycode': 74,
        //         'msg': "Thank you for your patience. Your RA # is (insert number). Please note RAs expire after 30 days and your return will take approximately 2-3 weeks to process. Please be sure to fill out your packing slip indicating that you wish to return your item for exchange or for refund. You should also note the RA# on the outside of the package. Please send your items back fully insured to: Ross-Simons Returns 9 Ross-Simons Drive Cranston, RI 02920",
        //     },
        //     {
        //         'keycode': 75,
        //         'msg': "I apologize for the issues you are having with your (ITEM). Our records indicate that your order was shipped on (date of shipping), and is outside of our 30 day return policy. However, if you would like to send your item to our Repairs Department, we would be happy to see if it may be repairable. Your original order number is, (ORDER NUMBER). Please take this information and put it on a plain sheet of paper along with your name, address, daytime phone number, and a brief description of the item and why it is coming back. Please note, this process may take up to 4-6 weeks. When you return this item, please make sure that it is insured and return to:Ross-Simons Returns 9 Ross-Simons Drive Cranston, RI 02920",
        //     },
        // ]



        // dashboard modal
        $scope.$modalInstanceds = {};
        $scope.openMydashboard = function () {
            $scope.$modalInstanceds = $uibModal.open({
                scope: $scope,
                animation: true,
                size: 'md',
                templateUrl: 'views/modal/dashboard.html',
                controller: 'ProfileCtrl'
            });
        };
        $scope.Mydashboardcancel = function () {
            //console.log("dismissing");
            $scope.$modalInstanceds.dismiss('cancel');
            //$scope.$modalInstance.close();
        };




        // var el = document.getElementById('overlayBtn');
        // if(el){
        //   el.addEventListener('click', swapper, false);
        // }

        //  var el = document.getElementById('#show_button').addEventListener('click', function() {
        //         if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
        //           // function defined in step 2
        //           window.webkitNotifications.createNotification(
        //               'icon.png', 'Notification Title', 'Notification content...');
        //         } else {
        //           window.webkitNotifications.requestPermission();
        //         }
        //       }, false);




    })

    .controller('GridCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
        $scope.template = TemplateService.getHTML("content/grid.html");
        TemplateService.title = "Grid"; // This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
    })

    // Example API Controller
    .controller('DemoAPICtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout) {
        apiService.getDemo($scope.formData, function (data) {
            // console.log(data);
        });
    })
    .controller('ProfileCtrl', function ($scope, $rootScope, TemplateService, NavigationService, $timeout, $http, apiService, $state, $cookies) {
        $scope.myemail = $.jStorage.get('aemail');
        angular.element(document).ready(function () {
            $(document).on('change', '.fromdate', function () {
                //$(".fromdate").change(function() {
                $scope.getdashboarddata();
            });
            $(document).on('change', '.todate', function () {
                //$(".todate").change(function() {
                $scope.getdashboarddata();
            });
            $(document).on('change', '.datefilter2', function () {
                //$(".datefilter2").change(function() {
                $scope.getdashboarddata();
            });
            $(document).on('change', '.userlist', function () {
                //$(".userlist").change(function() {

                $scope.getdashboarddata();
            });
        });
        $scope.getdashboarddata = function () {
            fromdate = $(".fromdate").val();
            todate = $(".todate").val();
            datefilter2 = $(".datefilter2").val();
            var date_filter = "";
            var date_filter2 = "";

            var today = new Date();

            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!

            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            var today = yyyy + '-' + mm + '-' + dd;
            if (fromdate == '')
                fromdate = today;
            // console.log(fromdate);
            //datefilter 1= today, 2 = last 30 day 
            // if (datefilter2 == '') {

            // } else {
            //     if (datefilter2 == '1')
            //         date_filter = today;
            //     else if (datefilter2 == '2') {
            //         date_filter2 = moment().subtract(30, "days").format("YYYY-MM-DD");
            //     }
            // }

            formData = {
                user: $scope.myemail,
                fromdate: fromdate,
                todate: todate,
                date_filter: fromdate,
                date_filter2_todate: today,
                date_filter2_fromdate: fromdate,
                date_filter_type: ""
            };

            apiService.getdashboarddata(formData).then(function (response) {
                // $(".tcount").text(response.data.data.t_count);
                $(".icount").text(response.data.data.i_count);
                $(".ccount").text(response.data.data.c_count);
                $scope.userlist = response.data.data.userlist;
            });


        };
        $scope.getfilterdb = function () {
            fromdate = $(".fromdate").val();
            todate = $(".todate").val();
            // console.log(fromdate);
            // console.log(todate);
            $scope.getdashboarddata();
        };
        angular.element(document).ready(function () {
            $timeout(function () {
                $scope.getdashboarddata();
            }, 1000);

        });

        //user conversation data

    })
myApp.controller('MsgFormCtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout, $rootScope) {
    $scope.template = TemplateService.getHTML("content/msgform.html");
    TemplateService.title = "Hotkeys";
    $scope.navigation = NavigationService.getNavigation();



});