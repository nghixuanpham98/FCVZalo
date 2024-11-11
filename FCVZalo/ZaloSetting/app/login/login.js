
$(document).ready(function () {
    $("#txtUS").keydown(function (event) {
        if (event.keyCode == 13) {
            Login();
        }
    });
    $("#txtPW").keydown(function (event) {
        if (event.keyCode == 13) {
            Login();
        }
    });
});



function Login() {

    try {
        var isError = false;
        var clsValid = 'is-invalid';
        var us = $('#txtUS').val();
        var pw = $('#txtPW').val();
        $('.ivg-input').removeClass(clsValid);
        if (us == '') {
            $('#txtUS').addClass(clsValid);
            isError = true;
        }
        if (pw == '') {
            $('#txtPW').addClass(clsValid);
            isError = true;
        }


        if (!isError) {
            ShowLoading();
            var setting = {
                url: api_url + "Admin/Login",
                type: "POST",
                data: { US: us, PW: pw }
            };

            $.ajax(setting).done(function (rs) {
                $('#lblError').text('');
                console.log(rs);
                HideLoading();
                if (rs.Data != undefined) {
                    var info = rs.Data;

                    var data = {
                        "id": info.IntID,
                        "userName": info.Username,
                        "guid": info.GUID,
                        "firstName": info.FirstName,
                        "lastName": info.LastName,
                        "email": info.Email,
                        "lastLoginDate": info.LastLoginDate,
                        "portalRole": info.PortalRole,
                        "passWord": null,
                        "displayName": null,
                        "ou": null,
                        "department": null,
                        "title": null,
                        "phone": null,
                        "description": null,
                        "agentType": null,
                        "agentID": null,
                        "extensionID": null,
                        "status": null,
                        "statusBegin": null,
                        "desktopActive": null,
                        "lastDesktopHeartbeat": null,
                        "active": null,
                        "inboundCalls": null,
                        "answeredCalls": null,
                        "outboundCalls": null,
                        "avgRingTime": null,
                        "avgTalkTime": null,
                        "avgIncTalk": null,
                        "avgOutTalk": null,
                        "avgHoldTime": null,
                        "sid": null,
                        "code": null,
                        "departmentID": null,
                        "groups": null,
                        "isAdmin": null,
                        "lastLogOn": null,
                        "session": null,
                        "lastMissCallID": null,
                        "accountCode": null,
                        "lastAgentLogOn": null,
                        "firstAgentLogOnToday": null,
                        "lastAgentLogOff": null,
                        "sfid": null,
                        "companyName": null,
                        "division": null,
                        "mobilephone": null,
                        "isActive": null,
                        "userRoleId": null,
                        "profileId": null,
                        "userType": null,
                        "userSubtype": null,
                        "startDay": null,
                        "endDay": null,
                        "employeeNumber": null,
                        "managerId": null,
                        "lastPasswordChangeDate": null,
                        "createdDate": null,
                        "createdById": null,
                        "lastModifiedDate": null,
                        "lastModifiedById": null,
                        "systemModstamp": null,
                        "contactId": null,
                        "accountId": null,
                        "isSFUser": null,
                        "token": null,
                        "birthDate": null,
                        "gender": null,
                        "portalCreatedBy": null,
                        "portalCreatedOn": null,
                        "portalModifiedBy": null,
                        "portalModifiedOn": null
                    }

                    localStorage.setItem('currentUser', JSON.stringify(data));

                    window.location.href = common_index_url;
                     
                }
                else {
                    $('#lblError').text(rs.Error);
                }

            });
        }

    } catch (e) {

    }
}


setInterval(function () {
    onCheckLogin();
}, 1000);


onCheckLogin();
function onCheckLogin() {
    if (localStorage.getItem("currentUser") != null) {
        window.location.href = common_index_url; 
    } 
}