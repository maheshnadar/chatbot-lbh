myApp.factory('apiService', function ($http, $q, $timeout, $httpParamSerializer, $httpParamSerializerJQLike) {
    adminurl2 = "https://cingulariti.com:8094/lbhbackend/";
    var adminurl3 = "http://localhost:8080/api/";
    var adminurl3 = "https://cingulariti.com:8089/api/";
    //adminurl2 = "http://localhost:8000/";
    //adminurl2 = "http://192.168.0.129:8000/";
    return {
        disconnectbyuser: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/disconnectbyuser",
                method: 'POST',
                data: formData
            })
        },
        sendmsg: function (formData, callback) {

            return $http({
                url: adminurl3 + "Liveuser/sendmsg",
                method: 'POST',
                data: formData
            })
        },
        sendchat: function (formData, callback) {

            return $http({
                url: adminurl3 + "Liveuser/sendchat",
                method: 'POST',
                data: formData
            })
        },
        getchats: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/getchats",
                method: 'POST',
                data: formData
            })
        },
        getliveuser: function (formData, callback) {

            return $http({
                url: adminurl3 + "Liveuser/getliveuser",
                method: 'POST',
                data: formData
            })
        },
        gethotkey: function (formData, callback) {

            return $http({
                url: adminurl3 + "Hotkey/gethotkeys",
                method: 'POST',
                data: formData
            })
        },
        getallconfig: function (formData, callback) {

            return $http({
                url: adminurl3 + "Pagemasters/getallconfig",
                method: 'POST',
                data: formData
            })
        },
        getpageconfig: function (formData, callback) {

            return $http({
                url: adminurl3 + "Pagemasters/getpageconfig",
                method: 'POST',
                data: formData
            })
        },
        getthemeconfig: function (formData, callback) {

            return $http({
                url: adminurl3 + "Thememaster/getthemeconfig",
                method: 'POST',
                data: formData
            })
        },

        getautocomplete: function (formData, callback) {

            return $http({
                url: adminurl3 + "Chatbotautocomplete/getautocomplete",
                method: 'POST',
                data: formData
            })
        },
        ordernosubmit: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outorder/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        htmlformsubmit: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outDTL/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        gettopsearch: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outsearch/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        outreturn: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outreturn/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        outsize: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outsize/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        getDthlinkRes: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outDTL/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        gettopsearch: function (formData, callback) {
            return $http({
                url: adminurl2 + 'outsearch/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        getCategoryFAQ: function (formData, callback) {
            return $http({
                url: adminurl2 + 'out/' + formData.user_id + "/",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'X-CSRFToken': formData.csrfmiddlewaretoken
                },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        get_session: function (formData, callback) {
            return $http({
                url: adminurl2 + 'get_session/',
                //headers: {'X-CSRFToken':formData.csrfmiddlewaretoken },
                method: 'POST',
                data: $.param(formData),
                dataType: "json"
            });
        },
        getCategory: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Category/getallcategory',
                method: 'POST',
                data: (formData),
            });
        },
        setdisconnectsocket: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/setdisconnectsocket",
                method: 'POST',
                data: formData,
            });

        },
        disconnectuser: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/disconnectuser",
                method: 'POST',
                data: formData,
            });

        },
        changepassword: function (formData, callback) {

            return $http({
                url: adminurl3 + 'Usermaster/changepassword',
                method: 'POST',
                // headers:{'authorization':$.jStorage.get('accesstoken'),'x-csrf-token':$rootScope.sailscsrf},
                data: formData
            });
            // $.ajax({
            //     url : adminurl+"changepassword",
            //     data: formData,
            //     headers: {'X-CSRFToken': CsrfTokenService.getCookie("csrftoken")},
            //     type: "POST",
            //     dataType: "json",

            // });
        },
        savehistory: function (formData, callback) {

            return $http({
                url: adminurl3 + "Chathistory/savehistory",
                method: 'POST',
                data: formData,
            });

        },
        saveagentchat: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/savechat",
                method: 'POST',
                data: formData,
            });

        },
        getuserchat: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/getchat",
                method: 'POST',
                data: formData,
            });

        },
        transferchat: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/transferchat",
                method: 'POST',
                data: formData,
            });

        },
        savefeedback: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/savefeedback",
                method: 'POST',
                data: formData,
            });

        },
        savelike: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/savelike",
                method: 'POST',
                data: formData,
            });

        },
        getdashboarddata: function (formData, callback) {

            return $http({
                url: adminurl3 + "Agentchat/getdashboarddata",
                method: 'POST',
                data: formData,
            });

        },
        saveofflinefeedback: function (formData, callback) {

            return $http({
                url: adminurl3 + "Chathistory/saveofflinefeedback",
                method: 'POST',
                data: formData,
            });

        },
        getproductbycategory: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Product/getproductbycategory',
                method: 'POST',
                data: (formData),
            });
        },
        getCategoryDropdown: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Category/getCategoryDropdown',
                method: 'POST',
                data: {},
            });
        },
        translate: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Translate/translate',
                method: 'POST',
                data: formData,
            });
        },
        translatelink: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Translate/translatelink',
                method: 'POST',
                data: formData,
            });
        },
        removelive: function (formData, callback) {
            return $http({
                url: adminurl3 + 'Liveuser/removelive',
                method: 'POST',
                data: formData,
            });
        },
        login: function (formData, callback) {

            // $http.post(adminurl + "api.php?func=getautocomplete&string=" + request).then(function (response) {
            //     console.log("Hello",response);
            //     return response;
            // });

            return $http({
                url: adminurl3 + "Usermaster/login",
                //headers: {'X-CSRFToken': "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"},
                method: 'POST',
                data: formData,
            });

        },
        logout: function (formData, callback) {


            return $http({
                //url: "http://wohlig.co.in/chatbotapi/index.php/json/" + 'login/',
                url: adminurl3 + "Chatbotuserlogs/logoutuser",
                //headers: {'X-CSRFToken': "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"},
                method: 'POST',
                data: formData,
                //withCredentials: false,
                //dataType:"json",
            });

        },
        getnewticket: function (formData, callback) {
            return $http({
                url: adminurl3 + "Employee/getnewticket",
                method: 'POST',
                data: formData,
            });

        },
        savebookmark: function (formData, callback) {


            return $http({
                url: adminurl3 + "Chatbotbookmark/savebookmark",
                method: 'POST',
                data: formData,
            });

        },
        deletebookmark: function (formData, callback) {


            return $http({
                url: adminurl3 + "Chatbotbookmark/deletebookmark",
                method: 'POST',
                data: formData,
            });

        },
        viewbookmark: function (formData, callback) {


            return $http({
                url: adminurl3 + "Chatbotbookmark/viewbookmark",
                method: 'POST',
                data: formData,
            });

        },
        getbookmark: function (formData, callback) {


            return $http({
                url: adminurl3 + "Chatbotbookmark/getbookmark",
                method: 'POST',
                data: formData,
            });

        },
        sendmail: function (formData, callback) {


            return $http({
                url: adminurl3 + "Employee/sendmail",
                method: 'POST',
                data: formData,
                // headers : {
                //     'Content-Type' : 'application/json'
                // },
                // transformRequest :  [function (data, headers) {
                //     //just send data without modifying
                //     return data;
                // }],
                contentType: "application/x-www-form-urlencoded",
            });

        },
    };
});