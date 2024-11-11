var webSocket = null;
var ws_protocol = "wss";
//var ws_hostname = "smartcenter.com.vn";
var ws_hostname = "inmpp.cogaihalan.com.vn";
var ws_port = "8081";
var ws_endpoint = "";
var myuser = "";
var myext = "";
var flogon = true;
var _logonExt = "";
var myagent = "";
var mysite = 0;
var loger = '';
var ivrnumber = "82802";//"81795";
var usertype = 0; //0 outbound, 1 inbound, 2 user nay ko lam gi

var version_js = 'ver_jun_2023_crm';
var myuserId = "";
var userIdSF = '';
var customerInCallList = false;// Check SDT khach hang co nam trong Callist khong

var sendData = 0;
var callRequestClosed = false;// Check khong quay so goi lai
var _callObject = false;//CallObject cua Task
var _callObjectNotInCallList = null;//Truyen callObject cho sdt khong trong callist
var _intervalId = null;
var _msgcallDesc, _msgcallResult, _msgcusSfId;
var _timeLock = 6;
var _timeShow = 0;
var _checkAcceptCall = false;
var _checkcallrequest = 0;
var _ThoiGianAgentAvailTiep = 0;

var _number = "";
var agentInfo = null;
var activeCall = null;
var heldCall = null;
var userInfo = null;
var fOpenCallLog = false;
var fAutoCreate = false;
var fUAT = false;
var fSaveInternalCall = true;
var onClickStopCall = false;
var _CallId, _customerId, _customerName, _Direction, _phonenumber, _taskid, _subject;
var _accountid;
var _customerType;
var _startTime, _connectedtime, _disconnecttime;
var _link = "https://smartcenter.com.vn/SFintegration/playrecording.html?";
var apiUrl = "https://inmpp.cogaihalan.com.vn/uatautodialerapi/api/";
var apiUrl_Zalo = "https://inmpp.cogaihalan.com.vn/zaloapi/api/CRM/";



var isApproved = false;

// Click To Dial
var listener = function (response) {
    var phone = response.number;
    if (phone != undefined && phone != null && phone != "") {
        MakeCall(phone);
    }
};

sforce.opencti.onClickToDial({ listener: listener });

// Enable -Disable ClickToDial
var enableClickToDialCallback = function (response) {

};

function EnableClickToDial() {
    sforce.opencti.enableClickToDial({ callback: enableClickToDialCallback });
};

var disableClickToDialCallback = function (response) {
};

function DisableClickToCall() {
    sforce.opencti.disableClickToDial({ callback: disableClickToDialCallback })
}

visibleSoftPhoneCallBack = function (response) {
    console.log(response);
    if (response.success) {
        var returnValue = response.returnValue;
    }
    else {
        alert('Something went wrong! Errors:', response.errors);
    }
}

searchAndGetScreenPopUrlcallback = function (response) {
    if (response.success) {
        var as = [];
        var accs = [];
        var cons = [];
        var leads = [];
        var sfObjs = response.returnValue;
        for (obj in sfObjs) {
            var a = new Object;
            a.value = obj;
            for (att in sfObjs[obj]) {
                if (att == 'Id')
                    a.Id = sfObjs[obj][att];
                else if (att == 'Name')
                    a.Name = sfObjs[obj][att];
                else if (att == 'RecordType')
                    a.RecordType = sfObjs[obj][att];
                else if (att == 'object')
                    a.RecordType = sfObjs[obj][att];
            }
            if (a.RecordType == "Contact") {
                as.push(a);
                cons.push(a);
            }
            else if (a.RecordType == "Account") {
                as.push(a);
                accs.push(a);
            }
            else if (a.RecordType == "Lead") {
                as.push(a);
                leads.push(a);
            }
        }

        if (as.length == 0) /* khach hang moi*/ {
            document.getElementById("txtCustomerName").setAttribute("style", "display:none");
            document.getElementById("txtCustomerName").innerHTML = "";
            document.getElementById("btnNewCustomer").setAttribute("style", "display:block");
            $('.fContactSelect').hide();
            $('.fSaveLog').hide();
            $('.fText').show();

            if (_taskid == null || _taskid == "") {
                var subject = "";
                if (_Direction == "Inbound")
                    subject = "New call from: " + _phonenumber;
                else
                    subject = "New call to: " + _phonenumber;
                SaveCallLogNew(subject);
            }
        }
        else if (as.length == 1) /*thay mot khach hang*/ {
            //debugger;
            _customerId = as[0].value;
            _customerType = as[0].RecordType;
            var popupparam = { recordId: as[0].value };
            sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
            if (as[0].Name != undefined && as[0].Name != null) {
                _customerName = as[0].Name;
                document.getElementById("callNumber").innerHTML = _phonenumber + " " + _customerName;
                document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                document.getElementById("txtCustomerName").innerHTML = _customerName;
            }
            document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
            $('.fContactSelect').hide();
            $('.fContactNew').hide();
            document.getElementById("fa2").innerHTML = _phonenumber + " " + _customerName;
            var subject = "";
            if (_Direction == "Inbound")
                subject = "New call from: " + _customerName + "-" + _phonenumber;
            else
                subject = "New call to: " + _customerName + "-" + _phonenumber;

            if (_taskid == null || _taskid == "")
                SaveCallLogNew(subject);
            else
                SaveCallLogUpdateCustomer2(as[0].value, as[0].Name, subject);
        }
        else /*nhieu*/ {
            if (cons.length == 0 && leads.length == 1) /*khong co contact chi co 1 lead */ {
                _customerId = leads[0].value;
                _customerType = leads[0].RecordType;
                var popupparam = { recordId: leads[0].value };
                sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
                if (leads[0].Name != undefined && leads[0].Name != null) {
                    _customerName = leads[0].Name;
                    document.getElementById("callNumber").innerHTML = _phonenumber + " " + _customerName;
                    document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                    document.getElementById("txtCustomerName").innerHTML = _customerName;
                }
                document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                document.getElementById("btnOpenCon").setAttribute("style", "display:none");
                $('.fContactSelect').hide();
                $('.fContactNew').hide();
                $('.fSaveLog').hide();

                document.getElementById("fa2").innerHTML = _phonenumber + " " + _customerName;
                var subject = "";
                if (_Direction == "Inbound")
                    subject = "New call from: " + _customerName + "-" + _phonenumber;
                else
                    subject = "New call to: " + _customerName + "-" + _phonenumber;

                if (_taskid == null || _taskid == "")
                    SaveCallLogNew(subject);
                else
                    SaveCallLogUpdateCustomer2(leads[0].value, leads[0].Name, subject);
            }
            else if (cons.length == 1) /* co mot con tact */ {
                _customerId = cons[0].value;
                _customerType = cons[0].RecordType;
                var popupparam = { recordId: cons[0].value };
                sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
                if (cons[0].Name != undefined && cons[0].Name != null) {
                    _customerName = cons[0].Name;
                    document.getElementById("callNumber").innerHTML = _phonenumber + " " + _customerName;
                    document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                    document.getElementById("txtCustomerName").innerHTML = _customerName;
                }
                document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                document.getElementById("btnOpenCon").setAttribute("style", "display:none");

                $('.fContactSelect').hide();
                $('.fContactNew').hide();
                $('.fSaveLog').hide();

                document.getElementById("fa2").innerHTML = _phonenumber + " " + _customerName;
                var subject = "";
                if (_Direction == "Inbound")
                    subject = "New call from: " + _customerName + "-" + _phonenumber;
                else
                    subject = "New call to: " + _customerName + "-" + _phonenumber;

                if (_taskid == null || _taskid == "")
                    SaveCallLogNew(subject);
                else
                    SaveCallLogUpdateCustomer2(cons[0].value, cons[0].Name, subject);
            }
            else /* co nhieu contact hoac lead */ {
                //debugger;
                if (_taskid == null || _taskid == "") {
                    var subject = "";
                    if (_Direction == "Inbound")
                        subject = "New call from: " + _phonenumber;
                    else
                        subject = "New call to: " + _phonenumber;
                    SaveCallLogNew(subject);
                }
                $('.fContactSelect').show();
                $('.fContactNew').hide();
                $('.fSaveLog').show();

                document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                document.getElementById("txtCustomerName").innerHTML = "";
                document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                var data = JSON.stringify(as);
                $.each($.parseJSON(data), function (idx, item) {
                    $('#myselect').append('<option value="' + item.value + '" rType="' + item.RecordType + '">' + item.Name + '</option>');
                });
            }
        }
    }
    else {
        alert('Something went wrong! Errors:', response.errors);
    }
}

function onOpenConClick() {
    try {
        var fConID = $('#myselect :selected').val();
        var popupparam = { recordId: fConID };
        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
    }
    catch {

    }
}

function searchAndGetScreenPopUrl(phone, callType) {
    newConTactPhone = phone;
    if (callType == 1)
        sforce.opencti.searchAndScreenPop({
            searchParams: phone,
            queryParams: 'object=Contact',
            callType: sforce.opencti.CALL_TYPE.INBOUND,
            deferred: true,
            callback: searchAndGetScreenPopUrlcallback
        });
    else
        sforce.opencti.searchAndScreenPop({
            searchParams: phone,
            queryParams: 'object=Contact',
            callType: sforce.opencti.CALL_TYPE.OUTBOUND,
            deferred: true,
            callback: searchAndGetScreenPopUrlcallback
        });
}


function SearchCusByPhone(phone) {


    phone = phone_number_org(phone);

    //if (phone.length > 15 && phone.startsWith("88"))
    //    phone = phone.substring(2, phone.length);

    //else if (phone.length > 15 && phone.startsWith("9"))
    //    phone = phone.substring(1, phone.length);

    //if (phone.startsWith("00"))
    //    phone = phone.substring(1, phone.length);

    console.log(`SF | SearchCusByPhone`, phone);

    newConTactPhone = phone;
    var findInput = 'phone=' + phone;
    var param = { apexClass: 'SCSearchController', methodName: 'getCustomerByPhone', methodParams: findInput };
    param.callback = callbackSearchCusByPhone;
    sforce.opencti.runApex(param);

};

var callbackSearchCusByPhone = function (response) {
    console.log(`ivg callbackSearchCusByPhone`, response);

    if (response.success) {
        if (response.returnValue != null || response.returnValue != "") {
            /*khong tim thay*/
            if (response.returnValue.runApex == "") {
                document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                document.getElementById("txtCustomerName").innerHTML = "";
                document.getElementById("btnNewCustomer").setAttribute("style", "display:block");
                $('.fContactSelect').hide();
                $('.fSaveLog').hide();
                $('.fText').show();

                if (_taskid == null || _taskid == "") {
                    var subject = "";
                    if (_Direction == "Inbound")
                        subject = "New call from: " + _phonenumber;
                    else
                        subject = "New call to: " + _phonenumber;
                    SaveCallLogNew(subject);
                }
            }
            else {
                var cuss = JSON.parse(response.returnValue.runApex);
                /*khong tim thay*/
                if (cuss.objectType == null || cuss.objectType == undefined || cuss.objectType == "") {
                    document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                    document.getElementById("txtCustomerName").innerHTML = "";
                    document.getElementById("btnNewCustomer").setAttribute("style", "display:block");
                    $('.fContactSelect').hide();
                    $('.fSaveLog').hide();
                    $('.fText').show();

                    if (_taskid == null || _taskid == "") {
                        var subject = "";
                        if (_Direction == "Inbound")
                            subject = "New call from: " + _phonenumber;
                        else
                            subject = "New call to: " + _phonenumber;
                        SaveCallLogNew(subject);
                    }
                }
                else if (cuss.objectType == "Contact") /* contact da ton tai */ {
                    if (cuss.conts.length == 1) /*co mot contact*/ {
                        //debugger;
                        _customerId = cuss.conts[0].Id;
                        _customerType = "Contact";
                        var popupparam = { recordId: _customerId };
                        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
                        if (cuss.conts[0].Name != undefined && cuss.conts[0].Name != null) {
                            _customerName = cuss.conts[0].Name;
                            document.getElementById("callNumber").innerHTML = _phonenumber + " " + _customerName;
                            document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                            document.getElementById("txtCustomerName").innerHTML = _customerName;
                        }
                        document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                        document.getElementById("btnOpenCon").setAttribute("style", "display:none");

                        $('.fContactSelect').hide();
                        $('.fContactNew').hide();
                        $('.fSaveLog').hide();

                        document.getElementById("fa2").innerHTML = _phonenumber + " " + _customerName;
                        var subject = "";
                        if (_Direction == "Inbound")
                            subject = "New call from: " + _customerName + "-" + _phonenumber;
                        else
                            subject = "New call to: " + _customerName + "-" + _phonenumber;

                        if (_taskid == null || _taskid == "")
                            SaveCallLogNew(subject);
                        else
                            SaveCallLogUpdateCustomer2(_customerId, _customerName, subject);
                    }
                    else /*co nhieu contact*/ {
                        _customerId = cuss.conts[0].Id;
                        _customerType = "Contact";
                        var popupparam = { recordId: _customerId };
                        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });

                        if (_taskid == null || _taskid == "") {
                            var subject = "";
                            if (_Direction == "Inbound")
                                subject = "New call from: " + _phonenumber;
                            else
                                subject = "New call to: " + _phonenumber;
                            SaveCallLogNew(subject);
                        }
                        $('.fContactSelect').show();
                        $('.fContactNew').hide();
                        $('.fSaveLog').show();

                        document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                        document.getElementById("txtCustomerName").innerHTML = "";
                        document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                        $.each(cuss.conts, function (idx, item) {
                            $('#myselect').append('<option value="' + item.Id + '" rType="Contact">' + item.Name + '</option>');
                        });
                    }
                }
                else if (cuss.objectType == "Lead") /* Lead da ton tai */ {
                    if (cuss.leads.length == 1) /*co mot lead*/ {
                        _customerId = cuss.leads[0].Id;
                        _customerType = "Lead";
                        var popupparam = { recordId: _customerId };
                        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });
                        if (cuss.leads[0].Name != undefined && cuss.leads[0].Name != null) {
                            _customerName = cuss.leads[0].Name;
                            document.getElementById("callNumber").innerHTML = _phonenumber + " " + _customerName;
                            document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                            document.getElementById("txtCustomerName").innerHTML = _customerName;
                        }
                        document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                        document.getElementById("btnOpenCon").setAttribute("style", "display:none");

                        $('.fContactSelect').hide();
                        $('.fContactNew').hide();
                        $('.fSaveLog').hide();

                        document.getElementById("fa2").innerHTML = _phonenumber + " " + _customerName;
                        var subject = "";
                        if (_Direction == "Inbound")
                            subject = "New call from: " + _customerName + "-" + _phonenumber;
                        else
                            subject = "New call to: " + _customerName + "-" + _phonenumber;

                        if (_taskid == null || _taskid == "")
                            SaveCallLogNew(subject);
                        else
                            SaveCallLogUpdateCustomer2(_customerId, _customerName, subject);
                    }
                    else /*co nhieu lead*/ {
                        if (_taskid == null || _taskid == "") {
                            var subject = "";
                            if (_Direction == "Inbound")
                                subject = "New call from: " + _phonenumber;
                            else
                                subject = "New call to: " + _phonenumber;
                            SaveCallLogNew(subject);
                        }
                        $('.fContactSelect').show();
                        $('.fContactNew').hide();
                        $('.fSaveLog').show();

                        document.getElementById("txtCustomerName").setAttribute("style", "display:none");
                        document.getElementById("txtCustomerName").innerHTML = "";
                        document.getElementById("btnNewCustomer").setAttribute("style", "display:none");
                        $.each(cuss.leads, function (idx, item) {
                            $('#myselect').append('<option value="' + item.Id + '" rType="Lead">' + item.Name + '</option>');
                        });
                    }
                }
            }
        }
    } else {
        alert(response.error);
    }
};

function SaveCallLogUpdateCustomer() {
    if (_taskid != null && _taskid != "") {
        try {
            var whoId = _customerId;
            if (whoId != undefined && whoId != null)
                sforce.opencti.saveLog({
                    value: {
                        Id: _taskid,
                        entityApiName: 'Task',
                        WhoId: whoId,
                        Customer_Name__c: _customerName
                    },
                    callback: callbackSaveCallLog
                });


        } catch (e) {
            console.log("Error SaveCallLogUpdateCustomer");
            console.log(e);
        }
    }
}

function SaveCallLogUpdateCustomer2(whoid, whoname, subject) {
    if (_taskid != null && _taskid != "") {
        try {
            sforce.opencti.saveLog({
                value: {
                    Id: _taskid,
                    entityApiName: 'Task',
                    Subject: subject,
                    WhoId: whoid,
                    Customer_Name__c: whoname
                },
                callback: callbackSaveCallLog
            });


        } catch (e) {
            console.log("Error SaveCallLogUpdateCustomer");
            console.log(e);
        }
    }
}

function SaveCallLogUpdateConnectedTime() {
    //debugger;
    if (_taskid != null && _taskid != "") {
        try {
            sforce.opencti.saveLog({
                value: {
                    Id: _taskid,
                    entityApiName: 'Task',
                    Connected_Time__c: new Date()
                },
                callback: callbackSaveCallLog
            });
        } catch (e) {
            console.log("Error SaveCallLogUpdateConnectedTime");
            console.log(e);
        }
    }
}

function SaveCallLogEndCall() {
    try {
        if (_taskid == null || _taskid == "") return;
        var duration = 0;
        var callafter = null;
        if (_startTime != undefined && _startTime != null && _disconnecttime != undefined && _disconnecttime != null) {
            duration = (_disconnecttime - _startTime) / 1000;
        }
        _startTime = null;
        _disconnecttime = null;
        _connectedtime = null;
        var _status = 'Open';

        var _description = $('#txtCallDescDial').val();

        var whoId = _customerId;
        var _phone__c = _phonenumber;
        var _disTime = new Date();

        if (whoId != undefined && whoId != null) {
            var _whoid = _customerId;
            var _customer_name__c = _customerName;
            sforce.opencti.saveLog({
                value: {
                    Id: _taskid,
                    entityApiName: 'Task',
                    WhoId: whoId,
                    CallDurationInSeconds: duration,
                    Disconnected_Time__c: _disTime,
                    description: _description
                },
                callback: callbackSaveCallLog
            });
            InsertSFTask(_taskid, _subject, _status, null/*_statusCode*/, ConvertDateTimeDB(_disTime), duration, _description, _whoid, _customer_name__c, _phone__c, callafter, callRequestClosed);
        }
        else {
            sforce.opencti.saveLog({
                value: {
                    Id: _taskid,
                    entityApiName: 'Task',
                    Status: _status,
                    //statuscode__c: _statusCode,
                    CallDurationInSeconds: duration,
                    Disconnected_Time__c: _disTime
                },
                callback: callbackSaveCallLog
            });
            InsertSFTask(_taskid, _subject, _status, null, ConvertDateTimeDB(_disTime), duration, _description, null, null, _phone__c, callafter, callRequestClosed);
        }
        //_taskid = null;
    } catch (e) {
        alert(e);
    }
}
function ConvertDateTimeDB(date) {
    var _date = new Date(date)
    var mm = date.getMonth() + 1;
    return _date.getFullYear() + '/' + mm + '/' + _date.getDate()
        + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
}
function SaveCallLogNew(subject) {
    try {
        _callObject = "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + _CallId + "&date=" + formatDate(new Date());
        if (_customerId != null && _customerId != "")
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Task',
                    Subject: subject,
                    Type: 'Call',
                    CallType: _Direction,
                    Phone: _phonenumber,
                    Phone__c: _phonenumber,
                    WhoId: _customerId,
                    Customer_Name__c: _customerName,
                    ActivityDate: new Date(),
                    CallObject: _callObject
                },
                callback: callbackSaveCallLogNew
            });
        else
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Task',
                    Subject: subject,
                    Type: 'Call',
                    CallType: _Direction,
                    Phone: _phonenumber,
                    Phone__c: _phonenumber,
                    ActivityDate: new Date(),
                    CallObject: _callObject
                },
                callback: callbackSaveCallLogNew
            });
        _subject = subject;
    } catch (e) {
        alert(e);
    }
}

var _fSaveNewCallTransfer = false;

function SaveCallLogNew2(subject, callid, phonenumber, Direction, Calltype, starttime, connecttime) {
    try {
        _callObject = "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + callid + "&date=" + formatDate(new Date());
        if (connecttime == null)
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Task',
                    Subject: subject,
                    Type: 'Call',
                    CallType: Direction,
                    Phone: phonenumber,
                    Phone__c: phonenumber,
                    ActivityDate: new Date(),
                    CallObject: _callObject
                },
                callback: callbackSaveCallLogNew
            });
        else
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Task',
                    Subject: subject,
                    Type: 'Call',
                    CallType: Direction,
                    Phone: phonenumber,
                    Phone__c: phonenumber,
                    ActivityDate: new Date(),
                    Connected_Time__c: connecttime,
                    CallObject: _callObject
                },
                callback: callbackSaveCallLogNew
            });

        _subject = subject;
    } catch (e) {
        alert(e);
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');
}

callbackSaveCallLog = function (response) {
    if (response.success) {
        //_taskid = response.returnValue.recordId;
    } else {
        alert("E1: " + response.errors);
    }
}

callbackSaveCallLogNew = function (response) {
    //debugger;
    if (response.success) {

        _taskid = response.returnValue.recordId;
        if (fOpenCallLog)
            sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: response.returnValue });
    } else {
        console.log("SaveCallLogNew: " + response.errors);
    }
    //debugger;
    if (_fSaveNewCallTransfer)
        SearchCusByPhone(_phonenumber);
    //searchAndGetScreenPopUrl(_phonenumber, 1);
    _fSaveNewCallTransfer = false;
}

var _caseid;
function CreateCase() {
    //debugger;
    try {

        var fdata = $('#myselect :selected').val();
        var fType = $('#myselect :selected').attr('rType');
        if (fdata) {
            _customerId = fdata;
            _customerType = fType;
        }
        else if (_customerId == undefined || _customerId == null) {
            alert("Không tạo được case khi chưa biết khách hàng nào");
            return;
        }

        if (_customerType != "Contact") {
            alert("Chỉ tạo được case cho Contact!");
            return;
        }

        var subject = document.getElementById("txtSubject").value;
        var comment = document.getElementById("txtContent").value;
        if (subject == "") {
            if (_customerName != undefined && _customerName != null && _customerName != "")
                subject = "New " + _customerName + " Case";
            else
                subject = "New " + _phonenumber + " Case";
        }

        if (_customerType == "Contact")
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Case',
                    Subject: subject,
                    Origin: 'Phone',
                    ContactMobile: _phonenumber,
                    ContactId: _customerId,
                    Description: comment
                },
                callback: callbackCreateCase
            });
        else
            sforce.opencti.saveLog({
                value: {
                    entityApiName: 'Case',
                    Subject: subject,
                    Origin: 'Phone',
                    ContactMobile: _phonenumber,
                    AccountId: _customerId,
                    Description: comment
                },
                callback: callbackCreateCase
            });


    } catch (e) {
        alert(e);
    }
}

function onCreateCaseClick() {
    CreateCase();
}

callbackCreateCase = function (response) {
    if (response.success) {
        _caseid = response.returnValue.recordId;
        if (_taskid != undefined && _taskid != null) {
            sforce.opencti.saveLog({
                value: {
                    Id: _taskid,
                    entityApiName: 'Task',
                    WhatId: _caseid
                },
                callback: callbackSaveCallLog
            });
        }

        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: response.returnValue });
    } else {
        alert("E1: " + response.errors);
    }
}

callbackNewContact = function (response) {
}

var newConTactPhone = "";
callbackAddNewContact = function (response) {
    //debugger;
    if (response.success) {
        _customerId = response.returnValue.recordId;
        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: response.returnValue });
        SaveCallLogUpdateCustomer();
    } else {
        alert('Could not create record ' + response.errors);
        console.log(response.errors);
        sforce.opencti.screenPop({
            type: sforce.opencti.SCREENPOP_TYPE.NEW_RECORD_MODAL, //Review the arguments section.
            params: { entityName: 'Lead', defaultFieldValues: { MobilePhone: newConTactPhone } }, callbackNewContact
        });
    }
    newConTactPhone = "";
}

function NewContact() {
    if (!newConTactPhone.startsWith("0"))
        newConTactPhone = "0" + newConTactPhone;
    if (fAutoCreate) {
        sforce.opencti.saveLog({
            value: {
                entityApiName: 'Lead',
                Company: "New customer",
                LastName: "New Customer",
                Status: "New",
                MobilePhone: newConTactPhone
            },
            callback: callbackAddNewContact
        });
    }
    else {
        sforce.opencti.screenPop({
            type: sforce.opencti.SCREENPOP_TYPE.NEW_RECORD_MODAL,
            params: { entityName: 'Lead', defaultFieldValues: { MobilePhone: newConTactPhone } }, callbackNewContact
        });
    }
}

function onNewCustomerClick() {
    NewContact(myagent);
}

/* End SalesForce Function */

var heartbeatTimer = setInterval(heartbeat, 5000);
function heartbeat() {
    try {
        if (webSocket != null) {
            var data = {
                type: "heartbeat",
                time: new Date(),
                clientPc: version_js,
                user: myuser,
                extension: myext
            };
            console.log('IVG_04 --- HeartBeat');
            wsSend(data);

            var data2 = { "type": "query", "object": "user", "user": myuser }
            wsSend(data2);
        }
        else {
            onConnectClick();
            console.log('error heartbeat ', e);
        }
    }
    catch (e) {
        if (webSocket != null) webSocket.close();
        webSocket = null;
    }
}
function GetSCUser(username) {
    if (webSocket != null) {
        var data = { "type": "query", "object": "user", "user": username }
        wsSend(data);
    }
}

function wsSend(data) {
    try {
        if (webSocket != null && webSocket.readyState == webSocket.OPEN) {
            webSocket.send(JSON.stringify(data));
        }
    }
    catch (e) {
        if (webSocket != null) webSocket.close();
        webSocket = null;
        console.log('error sending ', e);
    }
}

function UserInfo(obj) {
    userInfo = obj;
    mysite = userInfo.siteID;

    //alert("Day la Site ID: "+mysite);
    document.getElementById("f5queue").innerHTML = userInfo.queueingCalls;
    document.getElementById("f5inc").innerHTML = userInfo.inboundCalls;
    document.getElementById("f5ans").innerHTML = userInfo.answeredCalls;
    document.getElementById("f5ansf").innerHTML = userInfo.percentAnswered;
    document.getElementById("f5out").innerHTML = userInfo.outboundCalls;
    document.getElementById("f5avg").innerHTML = userInfo.averageTalk;

    var UserID = userInfo.userid;
    //Report
    var furl = 'href="https://inmpp.cogaihalan.com.vn/sfintegration';
    document.getElementById("reportView").innerHTML = '<a ' + furl + '/calllogs/calllogs.html?userid=' + UserID + '" target="_blank" class="btn btn-warning">View Report</a>';
    document.getElementById("reportExport").innerHTML = '<a ' + furl + '/reportexport.html?userid=' + UserID + '" target="_blank" class="btn btn-success">Export Report</a>';

    if (userInfo.devNumber != undefined && userInfo.devNumber != null && userInfo.devNumber != "") {
        //if (flogon)
        myext = userInfo.devNumber;
        $('#mAgent').text(userInfo.agentID);
        $('#mExt').text(myext);
        EnableClickToDial();
    }
    else {
        if (flogon)
            myext = "";
        DisableClickToCall;
    }

    flogon = false;

    if (userInfo.agentID != undefined && userInfo.agentID != null && userInfo.agentID != "") {
        myagent = userInfo.agentID;

        if (userInfo.agentState == 1 || userInfo.agentState == -1 || userInfo.devNumber == "") {
            //AgentLogOn(myagent);
            document.getElementById("c-login").style.display = "block";
            document.getElementById("tcontent").style.display = "none";
            document.getElementById("cStatus").disabled = true;
        }
        else {
            document.getElementById("c-login").style.display = "none";
            document.getElementById("tcontent").style.display = "block";
            document.getElementById("statics").style.display = "block";
            document.getElementById("cStatus").disabled = false;
            document.getElementById("fLog").disabled = false;
        }

        if (userInfo.agentState == 2) {
            document.getElementById("btnLogIn").disabled = true;
            document.getElementById("btnLogOff").disabled = false;
            document.getElementById("btnAvail").disabled = true;
            document.getElementById("btnUnAvail").disabled = false;
            document.getElementById("btnWrapup").disabled = true;
            document.getElementById("cStatus").value = 'Avail';
            //san sang
        }
        else if (userInfo.agentState == 3) {
            document.getElementById("btnLogIn").disabled = true;
            document.getElementById("btnLogOff").disabled = true;
            document.getElementById("btnAvail").disabled = true;
            document.getElementById("btnUnAvail").disabled = true;
            document.getElementById("btnWrapup").disabled = true;
            document.getElementById("cStatus").value = 'Avail';
            //busy
        }
        else if (userInfo.agentState == 0) {
            //ko san sang
            document.getElementById("btnLogIn").disabled = true;
            document.getElementById("btnLogOff").disabled = false;
            document.getElementById("btnAvail").disabled = false;
            document.getElementById("btnUnAvail").disabled = true;
            document.getElementById("btnWrapup").disabled = true;
            document.getElementById("cStatus").value = 'UnAvail';
        }
        else if (userInfo.agentState == 4) {
            //ghi chep
            document.getElementById("btnLogIn").disabled = true;
            document.getElementById("btnLogOff").disabled = false;
            document.getElementById("btnAvail").disabled = false;
            document.getElementById("btnUnAvail").disabled = true;
            document.getElementById("btnWrapup").disabled = true;
            document.getElementById("cStatus").value = 'Wrapup';
        }
    }
    else {
        //Disable when AgentID Empty
        myagent = "";
        document.getElementById("tcontent").style.display = "block";
        document.getElementById("statics").style.display = "block";
        document.getElementById("cStatus").disabled = true;
        document.getElementById("fLog").style.display = "none";
        document.getElementById("c-login").style.display = "none";
    }
    if (myext == "" && myagent == "") {
        document.getElementById("myAlert").innerHTML = "Sorry, You may not use this application!";
        usertype = 2;
        document.getElementById("c-login").style.display = "none";
        document.getElementById("tcontent").style.display = "none";
    }
    else if (myagent != "") {
        usertype = 1;
        document.getElementById("aCallIvr").disabled = false;
        if (myext == "")
            GetDevices();
    }
    else {
        document.getElementById("btnSingleStepTransfer").style.visibility = "hidden";
        usertype = 0;
    }
}

function GetDevices() {
    if (webSocket != null) {
        var type = mysite + 1;
        var data = {
            type: "query",
            object: "devices",
            devType: type
        };
        wsSend(data);
    }
}

function DeviceList(obj) {
    var list = obj.list;
    //$('#fExt').empty();
    var array = list.split(",")
    array.forEach(function (item) {
        $('#fExt').append('<option value="' + item + '">' + item + '</option>');
    })
}

function fLogOnEtx() {
    myext = $('#fExt :selected').val();
    AgentLogOn(myagent);
}

function onLogOnClick() {
    AgentLogOn(myagent);
}

function fLogOn() {
    AgentLogOn(myagent);
}

function onLogOffClick() {
    AgentLogOff();
}

function fLogOut() {
    AgentLogOff();
    location.reload();
}

function onAvailClick() {
    AgentReady();
}
function onUnAvailClick() {
    AgentNotReady();
}

function onWrapupClick() {
    AgentWrapup();
}

function onMakeCallClick() {
    var called = document.getElementById("txtPhoneNumber").value;
    if (called != "")
        MakeCall(called);

}

function onMakeCallOut() {
    var called = document.getElementById("txtPhoneOut").value;
    if (called != "")
        MakeCall(called);
}

function onAnswerClick() {
    //debugger;
    if (activeCall != null) {
        if (activeCall.event != "Transferred") {
            if (activeCall.callID != null && activeCall.callID != "")
                AnswerCall(activeCall.callID);
        }
        else {
            if (activeCall.newCallID != null && activeCall.newCallID != "")
                AnswerCall(activeCall.newCallID);
        }
    }
}

function onCancelClick() {
    if (activeCall != null) {
        if (activeCall.event != "Transferred") {
            if (activeCall.callID != null && activeCall.callID != "")
                CancelCall(activeCall.callID);
        }
        else {
            if (activeCall.newCallID != null && activeCall.newCallID != "")
                CancelCall(activeCall.newCallID);
        }
    }
}


function onStopClick() {
    //debugger;
    onClickStopCall = true;
    if (activeCall != null && activeCall.callID != null && activeCall.callID != "")
        StopCall(activeCall.callID);
}

function onClearClick() {
    if (activeCall != null && activeCall.callID != null && activeCall.callID != "")
        ClearCall(activeCall.callID);
}

function onEndCallOut() {
    if (activeCall != null && activeCall.callID != null && activeCall.callID != "")
        EndCallOut(activeCall.callID);
}

function onConsultClick() {
    var called = document.getElementById("txtPhoneNumber").value;
    if (called != "") {
        if (activeCall != null && activeCall.callID != null && activeCall.callID != "")
            ConsultCall(activeCall.callID, called);
    }
}

function onIvrClick() {
    if (ivrnumber != "") {
        if (activeCall != null && activeCall.callID != null && activeCall.callID != "")
            SingleStepTransfer(activeCall.callID, ivrnumber);
    }
    location.reload();
}

function onReconnectClick() {
    if (activeCall != null && activeCall.callID != null && activeCall.callID != "") {
        if (heldCall != null && heldCall.callID != null && heldCall.callID != "")
            ReconnectCall(activeCall.callID, heldCall.callID);
    }
}

function onTransferClick() {
    if (activeCall != null && activeCall.callID != null && activeCall.callID != "") {
        if (heldCall != null && heldCall.callID != null && heldCall.callID != "")
            TransferCall(activeCall.callID, heldCall.callID);
    }
}

function MakeCall(callnumber) {

    callnumber = callnumber.trim();

    //if (myext.startsWith('86') || myext.startsWith('82')) {
    //    /* 82-Hot / 84-HN / 86-BD */
    //    zalo_prefix = '9';
    //}


    var zalo_prefix = '9';

    /*Jul.2023*/

    if (callnumber.length > 15)
        callnumber = zalo_prefix + callnumber;

    //OA ra di động có approved
    else if (callnumber.length > 7 && callnumber.length < 15 && callnumber.startsWith("90"))
        callnumber = callnumber;

    //khi nhận contact data và xác định được sđt đó có chấp nhận gọi zalo
    else if (callnumber.length > 7 && callnumber.length < 15 && isApproved == true) {
        callnumber = zalo_prefix + callnumber;
    }
    //cuộc gọi bình thường
    else if (callnumber.startsWith("0") && !callnumber.startsWith("00"))
        callnumber = "0" + callnumber;

    //cuộc gọi bình thường
    else if (callnumber.length > 7 && !callnumber.startsWith("0"))
        callnumber = "0" + callnumber;


    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "MakeCall",
            callNumber: callnumber
        };
        wsSend(data);
    }
}


function CancelCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Disconnect",
            callID: callid
        };
        wsSend(data);
    }
}

function ClearCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Disconnect",
            callID: callid
        };
        wsSend(data);
    }
}

function StopCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Disconnect",
            callID: callid
        };
        wsSend(data);
    }
}

function EndCallOut(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Disconnect",
            callID: callid
        };
        wsSend(data);
    }
}

function AnswerCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Answer",
            callID: callid
        };
        wsSend(data);
    }
}

function HoldCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Hold",
            callID: callid
        };
        wsSend(data);
    }
}

function aHoldCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Hold",
            callID: callid
        };
        wsSend(data);
    }
}

function RetrieveCall(callid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Retrieve",
            callID: callid
        };
        wsSend(data);
    }
}

function ConsultCall(callid, callnumber) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Consult",
            callID: callid,
            callNumber: callnumber
        };
        wsSend(data);
    }
}

/**
 * Callid la id cua cuoc goi dang active
 * heldid la id cua cuoc goi bi giu
 */
function TransferCall(callid, heldid) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Transfer",
            callID: callid,
            heldCallID: heldid
        };
        wsSend(data);
    }
}

/**
 * Callid la id cua cuoc goi dang active
 * heldid la id cua cuoc goi bi giu
 */
function ReconnectCall(callid, heldid) {
    //debugger;
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "Reconnect",
            callID: callid,
            heldCallID: heldid
        };
        wsSend(data);
    }
}

function SingleStepTransfer(callid, callnumber) {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "SingleStepTransfer",
            callID: callid,
            callNumber: callnumber
        };
        wsSend(data);
    }
}

function CallAgentEvent(message) {
    //if (sendData == 0) {
    //    console.log('IVG --- Chưa search sđt');
    //}
    //else {
    //    console.log('IVG --- Đã mở contact');
    //}
    var callObj = JSON.parse(message);
    if (callObj.type == 'heartbeat') {
        var data = {
            type: "heartbeat",
            time: new Date(),
            clientPc: version_js,
            user: myuser,
            extension: myext
        };
        wsSend(data);
    }

    if (callObj.type == "callEvent") {
        try {
            console.log('IVG --- callEvent', callObj);
            CallEvent(callObj);
        }
        catch (ex) {
            if (activeCall != null)
                console.log(activeCall);
        }
    }

    else if (callObj.type == "agentEvent") {
        console.log('IVG --- agentEvent', callObj);
        AgentEvent(callObj);
    }
    else if (callObj.type == "userSnapshot") {
        //console.log('IVG --- userSnapshot1.5', callObj);
        UserInfo(callObj);
    }
    else if (callObj.type == "query" && callObj.object == "callTransferInfo")
        CallTransferInfo(callObj);
    else if (callObj.type == "data") {
        if (callObj.object == "devices") {
            DeviceList(callObj);
        }
    }
    /* --------- AutoDialer --------- */
    if (callObj.type == "contactData" && callObj.devNumber == userInfo.devNumber && sendData == 0) {
        sendData = 1;
        console.log('IVG --- contactData', callObj);
        customerInCallList = true;

        isApproved = callObj.contactData.isApproved == "1" ? true : false;

        _number = callObj.calling;
        sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
        _customerId = callObj.contactData.cusSFId;

        var popupparam = { recordId: _customerId };
        sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });

        $('#hdfRedialNumber').val(callObj.calling);
        $('#hdfIVRCallRequestID').val(callObj.requestID);

        document.getElementById("fNumberCalling").innerHTML = "From: " + callObj.calling;
        document.getElementById("cdCusName").innerHTML = callObj.contactData.cusFullName;

        _number = _number.trim();
        _number = phone_number_org(_number);

        //if (_number.startsWith("00")) _number = _number.substr(1);

        document.getElementById("searchManual").innerHTML
            = '<a href="#" onclick="SearchCusByPhone(\'' + _number + '\')">Search contact</a>';

        _subject = callObj.callSubject + ': ' + callObj.contactData.cusFullName + '-' + _number;
        _phonenumber = callObj.calling;
        $('.scalling').show();
        if (callObj.sfTaskId == "") {
            SaveCallLogNew(_subject);
        }
        else {
            _taskid = callObj.sfTaskId;
            $('#txtCallDescTask').val(callObj.callDescription);
        }
    }

    //if (_checkcallrequest == 1) {
    //    _timeShow++;
    //}
    /* Progressive */
    //if (callObj.type == "callRequest") {
    //    _checkcallrequest = 1;
    //    ProgressiveCall(callObj);
    //}
    //if (_timeShow > _timeLock && _checkcallrequest == 1 && _checkAcceptCall == false) {
    //    _checkcallrequest = 0;
    //    _timeShow = 0;
    //    AgentNotReady();
    //    location.reload();
    //}
}

function ProcessingContactData(data) {

    try {

    } catch (e) {

    }

}

function CheckPopup(callObj) {
    if (fUAT) {
        if (callObj.event == "Delivered" || callObj.event == "Established") {
            if (callObj.calling == "103" || callObj.calling == "104") return false;
        }
        else if (callObj.event == "Originated") {
            if (callObj.called == "104" || callObj.called == "103") return false;
        }
    }
    else {
        if (callObj.event == "Delivered" || callObj.event == "Established") {
            if (callObj.assCalling == "") return false;
        }
        else if (callObj.event == "Originated") {
            if (callObj.assCalled == "") return false;
        }
    }

    return true;
}

function CallEvent(callObj) {
    console.log(`ivg CallEvent`, callObj);
    if (callObj.devNumber != myext) {
        if (callObj.event == "Established" || callObj.event == "ConnectionCleared" || callObj.event == "Diverted") {
            if (activeCall == null)
                return;

            if (activeCall.callID == null)
                return;

            if (activeCall.callID != callObj.callID && heldCall == null)
                return;

            if (activeCall.callID != callObj.callID && heldCall.callID != callObj.callID)
                return;
        }
        else
            return;
    }
    /* Cuoc goi den */
    if (callObj.event == "Delivered") {
        console.log('IVG --- Cuoc goi den', callObj);
        $('#hdfRedialNumber').val(callObj.calling);
        //sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
        if (_CallId != callObj.callID) {
            _CallId = callObj.callID;
            _Direction = "Inbound";
            _phonenumber = callObj.calling;
            _phonenumber = phone_number_org(_phonenumber);
            $('#hdfRedialNumber').val(_phonenumber);

            //if (_phonenumber.length > 7 && !_phonenumber.startsWith("0"))
            //    _phonenumber = "0" + _phonenumber;

            var subject = "New call from: " + _phonenumber;
            _startTime = new Date();
            _subject = subject;
            _callObjectNotInCallList = callObj;
        }

        activeCall = {
            event: "Delivered",
            callID: callObj.callID,
            alerting: callObj.alerting,
            calling: callObj.calling,
            called: callObj.called,
            redirect: callObj.redirect
        };

        document.getElementById("btnMakeCall").disabled = true;
        document.getElementById("btnAnswer").disabled = false;
        document.getElementById("btnCancel").disabled = false;
        document.getElementById("btnClear").disabled = false;
        document.getElementById("btnConsult").disabled = true;
        document.getElementById("btnReconnect").disabled = true;
        document.getElementById("btnTransfer").disabled = true;
        document.getElementById("callNumber").innerHTML = callObj.calling;

        //$('.lCallIn').show();//predic ko co
        $('.lCallRedial').hide();
        $('.home').hide();
        $('.call-now').hide();
    }
    /* Cuoc goi di */
    else if (callObj.event == "Originated") {
        console.log('@IVG[CallEvent-Cuoc goi di]' + time, callObj);

        if (_checkcallrequest == 1) _checkAcceptCall = true;

        $('.lCallRedial').hide();

        sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
        if (heldCall == null || heldCall.callID == null) {
            if (_CallId != callObj.callID) {
                _CallId = callObj.callID;
                _Direction = "Outbound";
                _phonenumber = callObj.called;
                _phonenumber = phone_number_org(_phonenumber);


                //if (_phonenumber.startsWith("00"))
                //    _phonenumber = _phonenumber.substr(1);

                _startTime = new Date();
                var subject = "New call to: " + _phonenumber;
                _subject = subject;
                if (customerInCallList == false) {
                    console.log('customerInCallList', customerInCallList);
                    if (CheckPopup(callObj)) {
                        SaveCallLogNew(subject);
                        SearchCusByPhone(_phonenumber);
                    }
                    else {
                        _Direction = "Internal";
                        if (fSaveInternalCall)
                            SaveCallLogNew2(subject, callObj.callID, _phonenumber, "Internal", 3, _startTime, null);
                    }
                }
            }
        }

        activeCall = {
            event: "Originated",
            callID: callObj.callID,
            calling: callObj.calling,
            called: callObj.called
        };
        $('.c-tsearch').hide();
        $('.c-tab').hide();
        $('.call-now').hide();
        $('.callingOut').show("slow,swing");
        document.getElementById("fa1").innerHTML = callObj.calling;
        document.getElementById("fa2").innerHTML = callObj.called;
        document.getElementById("btnMakeCall").disabled = true;
        document.getElementById("btnAnswer").disabled = true;
        document.getElementById("btnClear").disabled = false;
        document.getElementById("btnConsult").disabled = true;
        if (heldCall != null && heldCall.callID != null) {
            document.getElementById("btnTransfer").disabled = false;
            document.getElementById("btnReconnect").disabled = false;
        }
        else {
            document.getElementById("btnTransfer").disabled = true;
            document.getElementById("btnReconnect").disabled = true;
        }
    }
    /* Cuoc goi ket noi */
    else if (callObj.event == "Established") {
        console.log('IVG --- Cuoc goi ket noi', callObj);

        $('.lCallRedial').hide();

        if (activeCall == null || callObj.cause == "callPickup") {
            sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
            _CallId = callObj.callID;
            _Direction = "Inbound";
            _phonenumber = callObj.calling;
            _phonenumber = phone_number_org(_phonenumber);
            //if (_phonenumber.length > 7 && !_phonenumber.startsWith("0"))
            //    _phonenumber = "0" + _phonenumber;
            _startTime = new Date();
            _connectedtime = _startTime;
            var subject = "New call from: " + _phonenumber;

            if (sendData == 0) { ContactDataPopup(_phonenumber); }

            //if (customerInCallList == false) {
            //    console.log('customerInCallList', customerInCallList);
            //    if (CheckPopup(callObj))
            //        SearchCusByPhone(_phonenumber);
            //    else {
            //        _Direction = "Internal";
            //        if (fSaveInternalCall)
            //            SaveCallLogNew2(subject, callObj.callID, _phonenumber, "Internal", 3, _startTime, null);
            //    }
            //}

            $('.home').hide();
            _subject = subject;
        }

        activeCall = {
            event: "Established",
            callID: callObj.callID,
            answering: callObj.answering,
            calling: callObj.calling,
            called: callObj.called,
            redirect: callObj.redirect
        };

        if (callObj.calling.length > 7 && !callObj.calling.startsWith("0")) {
            document.getElementById("searchManual").innerHTML
                = '<a href="#" onclick="SearchCusByPhone(\'' + callObj.calling + '\')">Search contact</a>';
        }

        $('.scalling').show();
        $('.lCallIn').hide();

        $('.lCallOut').hide();

        if (_Direction == "Internal") {
            $('.fContactSelect').hide();
            $('.fContactNew').hide();
            $('.fSaveLog').hide();
        }
        clearInterval(_intervalId);
        stopWatch();

        document.getElementById("btnMakeCall").disabled = true;
        document.getElementById("btnAnswer").disabled = true;
        document.getElementById("btnClear").disabled = false;

        /* Hien thi From: xxxx hoac To: xxxx */
        if (callObj.calling.startsWith("0") || callObj.calling.startsWith("00")) /* Goi den */ {
            if (_tmpTransferCall == "")
                document.getElementById("fNumberCalling").innerHTML = "From: " + callObj.calling;
            else
                document.getElementById("fNumberCalling").innerHTML = "From: " + _tmpTransferCall;
            _tmpTransferCall = "";
            document.getElementById("fNumberCaller").innerHTML = "";
        }
        else {/* Goi di */
            document.getElementById("fNumberCalling").innerHTML = "";
            document.getElementById("fNumberCaller").innerHTML = "To: " + callObj.called;
        }

        document.getElementById("aHoldCall").disabled = true;
        document.getElementById("aStopCall").disabled = false;
        document.getElementById("call-now").style.display = "none";
        if (heldCall != null && heldCall.callID != null) {
            document.getElementById("btnTransfer").disabled = false;
            document.getElementById("btnReconnect").disabled = false;
            document.getElementById("btnConsult").disabled = true;
        }
        else {
            SaveCallLogUpdateConnectedTime();
            document.getElementById("btnTransfer").disabled = true;
            document.getElementById("btnReconnect").disabled = true;
            document.getElementById("btnConsult").disabled = false;
        }
    }
    /* Cuoc goi huy */
    else if (callObj.event == "ConnectionCleared") {
        console.log('@IVG[CallEvent-Cuoc goi huy]' + time, callObj);

        var fServiceInitiated = true;
        if (activeCall != null && activeCall.event != "ServiceInitiated")
            fServiceInitiated = false;
        if (_CallId == callObj.callID && !fServiceInitiated) {
            _disconnecttime = new Date();
            SaveCallLogEndCall();
            _CallId = null;
        }

        if (activeCall != null && activeCall.callID == callObj.callID) {
            activeCall = null;
        }
        else if (heldCall != null && heldCall.callID == callObj.callID) {
            heldCall = null;
        }

        if (activeCall == null && heldCall == null && !fServiceInitiated) {
            CallCleared();
            _tmpTransferCall = "";

            /* ----- Cuoc goi bi ngat dot ngot ----- */
            console.log('IVG --- Cuộc gọi không tắt bởi Softphone', callObj);
            $('#txtScheduleDateDial').val($('#txtScheduleDateTask').val());
            $('#txtScheduleTimeDial').val($('#txtScheduleTimeTask').val());
            $('#txtCallDescDial').val($('#txtCallDescTask').val());

            $('.scalling').hide();
            $('.home').hide();

            $('.lCallRedial').show();

            //kiểm tra xem sđt này phải số đt thường không 

            console.log(`_phonenumber`, _phonenumber);
            console.log(`_customerId`, _customerId);

            if (_phonenumber.length < 15) {
                onCheckConsentRequest();
            }

        }
    }
    /* Cuoc goi bi giu */
    else if (callObj.event == "Held") {
        heldCall = {
            event: "Held",
            callID: callObj.callID,
            holding: callObj.answering,
            calling: callObj.calling
        };
        if (activeCall != null && heldCall.callID != activeCall.callID) {
            document.getElementById("btnTransfer").disabled = false;
            document.getElementById("btnReconnect").disabled = false;
        }
    }
    /* Cuoc goi lay lai */
    else if (callObj.event == "Retrieved") {
        heldCall = null;
        activeCall = {
            event: "Retrieved",
            callID: callObj.callID,
            holding: callObj.holding
        };

        document.getElementById("btnMakeCall").disabled = true;
        document.getElementById("btnAnswer").disabled = true;
        document.getElementById("btnClear").disabled = false;
        document.getElementById("btnConsult").disabled = false;
        document.getElementById("btnReconnect").disabled = true;
        document.getElementById("btnTransfer").disabled = true;
    }
    else if (callObj.event == "Diverted") {
        if (callObj.divertedTo != myext) {
            activeCall = null;
            heldCall = null;
            location.reload();
        }
        else if (callObj.divertedTo == myext) {
            activeCall = {
                event: "Diverted",
                callID: callObj.callID
            };
        }
    }
    /* Cuoc goi transfer */
    else if (callObj.event == "Transferred") {
        if (callObj.transferring == myext) {
            _disconnecttime = new Date();
            SaveCallLogEndCall();
            _CallId = null;
            activeCall = null;
            heldCall = null;
            document.getElementById("btnMakeCall").disabled = false;
            document.getElementById("btnAnswer").disabled = true;
            document.getElementById("btnClear").disabled = true;
            document.getElementById("btnConsult").disabled = true;
            document.getElementById("btnReconnect").disabled = true;
            document.getElementById("btnTransfer").disabled = true;
            location.reload();
        }
        else if (callObj.transferredTo == myext) {
            heldCall = null;
            _disconnecttime = new Date();
            SaveCallLogEndCall();

            _CallId = callObj.callID;
            _preEvent = activeCall;
            _transferring = callObj.transferring;
            GetCallingFrom(callObj.transferring, callObj.callID);

            activeCall = {
                event: "Transferred",
                callID: callObj.newCallID,
                newCallID: callObj.newCallID,
                transferring: callObj.transferring
            };
        }
    }
    else if (callObj.event == "ServiceInitiated") {
        if (activeCall == null) {
            activeCall = {
                event: "ServiceInitiated",
                callID: callObj.callID
            };
        }
    }
}

function GetCallingFrom(devnumber, callid) {
    if (webSocket != null) {
        var data = { "type": "query", "object": "callInfo", "devNumber": "1-" + devnumber, "callID": callid }
        wsSend(data);
    }
}

var _tmpTransferCall = "";
var _transferring = "";
var _preEvent;
function CallTransferInfo(callObj) {
    //debugger;
    var calltype = 1;
    if (callObj.devNumber != callObj.calling) {
        _Direction = "Inbound";
        _phonenumber = callObj.calling;
    }
    else {
        calltype = 2;
        _Direction = "Outbound"
        _phonenumber = callObj.called;
    }

    _tmpTransferCall = _phonenumber;
    document.getElementById("fNumberCalling").innerHTML = _phonenumber;
    document.getElementById("callNumber").innerHTML = _phonenumber;
    //debugger;
    _startTime = new Date();
    var subject = "New call from: " + _phonenumber;
    _fSaveNewCallTransfer = true;
    if (_preEvent != null && _preEvent.event == "Established") {
        _connectedtime = _startTime;
        if (calltype == 1)
            SaveCallLogNew2(subject, activeCall.callID, _phonenumber, "Inbound", 1, _startTime, _connectedtime);
        else
            SaveCallLogNew2(subject, activeCall.callID, _phonenumber, "Outbound", 2, _startTime, _connectedtime);
    }
    else {
        if (calltype == 1)
            SaveCallLogNew2(subject, activeCall.callID, _phonenumber, "Inbound", 1, _startTime, null);
        else
            SaveCallLogNew2(subject, activeCall.callID, _phonenumber, "Outbound", 2, _startTime, _connectedtime);
    }
}

function CallCleared() {
    $('.scalling').hide();
    $('.c-tsearch').show("slow,swing");
    $('.c-tab').show("slow,swing");
    $('.home').show();
}

function AgentEvent(agentObj) {
    if (agentObj.agentID != myagent)
        return;

    myext = agentObj.devNumber;

    if (agentObj.event == "AgentLogOn") {
        agentInfo = { id: agentObj.agentID, group: agentObj.groupID, state: "AgentLogOn" };
        document.getElementById("c-login").style.display = "none";
        document.getElementById("tcontent").style.display = "block";
        document.getElementById("statics").style.display = "block";
        document.getElementById("cStatus").disabled = false;
        document.getElementById("cStatus").value = 'Avail';
        $('#mAgent').text(userInfo.agentID);
        $('#mExt').text(myext);
        EnableClickToDial();
    }
    else if (agentObj.event == "AgentLogOff") {
        myext = "";
        agentInfo = null;
        DisableClickToCall();
        document.getElementById("c-login").style.display = "block";
        document.getElementById("tcontent").style.display = "none";
        document.getElementById("statics").style.display = "none";
    }
    else if (agentObj.event == "AgentReady") {
        agentInfo = { id: agentObj.agentID, group: agentObj.groupID, state: "AgentReady" };
        document.getElementById("cStatus").value = 'Avail';
    }
    else if (agentObj.event == "AgentNotReady") {
        agentInfo = { id: agentObj.agentID, group: agentObj.groupID, state: "AgentNotReady" };
        document.getElementById("cStatus").value = 'UnAvail';
    }
    else if (agentObj.event == "AgentBusy") {
        agentInfo = { id: agentObj.agentID, group: agentObj.groupID, state: "AgentBusy" };
        document.getElementById("cStatus").value = 'Wrapup';
    }
    else if (agentObj.event == "AgentWrapup") {
        agentInfo = { id: agentObj.agentID, group: agentObj.groupID, state: "AgentWrapup" };
        document.getElementById("cStatus").value = 'Avail';
        document.getElementById("btnLogIn").disabled = true;
        document.getElementById("btnLogOff").disabled = false;
        document.getElementById("btnAvail").disabled = false;
        document.getElementById("btnUnAvail").disabled = true;
        document.getElementById("btnWrapup").disabled = true;
    }
}

function AgentLogOn(agentid) {
    //debugger;
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "AgentLogOn",
            agentID: agentid
        };
        wsSend(data);
    }
}

function AgentLogOff() {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "AgentLogOff"
        };
        wsSend(data);
    }
}

function AgentReady() {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "AgentReady"
        };
        wsSend(data);
    }
}

function AgentNotReady() {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "AgentNotReady"
        };
        wsSend(data);
    }
}

function AgentWrapup() {
    if (webSocket != null) {
        var data = {
            type: "command",
            devNumber: myext,
            action: "AgentWrapup"
        };
        wsSend(data);
    }
}

/**
 * Event handler for clicking on button "Connect"
 */
//$(document).ready(
function onConnectClick() {
    openWSConnection(ws_protocol, ws_hostname, ws_port, ws_endpoint);
}
//);

/**
 * Event handler for clicking on button "Disconnect"
 */
function onDisconnectClick() {
    webSocket.close();
}

/**
 * Open a new WebSocket connection using the given parameters
 */

var lastTime = new Date();

function openWSConnection(protocol, hostname, port, endpoint) {
    var webSocketURL = null;
    webSocketURL = protocol + "://" + hostname + ":" + port + endpoint + `?user=${myuser}`;
    console.log("@IVG[openWSConnection5]::Connecting to: " + webSocketURL);
    try {
        webSocket = new WebSocket(webSocketURL);
        webSocket.onopen = function (openEvent) {
            console.log("@IVG[WebSocket] OPEN: ", webSocket);
            document.getElementById("btnConnect").disabled = true;
            GetSCUser(myuser);
        };
        webSocket.onclose = function (closeEvent) {
            webSocket = null;
            console.log("@IVG[WebSocket] CLOSE: " + JSON.stringify(closeEvent, null, 4));
            document.getElementById("btnConnect").disabled = false;
        };
        webSocket.onerror = function (errorEvent) {
            webSocket = null;
            console.log("@IVG[WebSocket] ERROR: " + JSON.stringify(errorEvent, null, 4));
        };
        webSocket.onmessage = function (messageEvent) {
            var wsMsg = messageEvent.data;
            CallAgentEvent(wsMsg);
            lastTime = new Date();
        };
    } catch (exception) {
        console.error(exception);
    }
}

setInterval(function () {
    var dt2 = new Date();
    var dt1 = lastTime;
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    var rs = Math.abs(Math.round(diff));
    if (rs >= 20) {
        console.log(`so sanh thoi gian`, rs);
        location.reload();
    }

}, 10000);




/**
 * Send a message to the WebSocket server
 */
function onSendClick() {
    if (webSocket.readyState != WebSocket.OPEN) {
        console.error("@IVG[webSocket] is not open: " + webSocket.readyState);
        return;
    }
    var msg = document.getElementById("message").value;
    webSocket.send(msg);
}

/* Test Ham */
$(document).ready(function () {
    $("select.cStatus").change(function () {
        var mStatus = $(this).children("option:selected").val();
        if (webSocket != null && mStatus == "Avail") {
            var data = {
                type: "command",
                devNumber: myext,
                action: "AgentReady"
            };
            wsSend(data);
        }
        else if (webSocket != null && mStatus == "UnAvail") {
            var data = {
                type: "command",
                devNumber: myext,
                action: "AgentNotReady"
            };
            wsSend(data);
        }
        else if (webSocket != null && mStatus == "Wrapup") {
            var data = {
                type: "command",
                devNumber: myext,
                action: "AgentWrapup"
            };
            wsSend(data);
        }

    });
});

/**
 * AutoDial ==============================================================================================================================
 */
/* --------------------- Predictive Manual --------------------- */
/* Show Contact */
function ContactDataPopup(phone) {
    sendData = 1;
    if (phone.startsWith("00"))
        phone = phone.substring(1, phone.length);
    newConTactPhone = phone;
    var findInput = 'phone=' + phone;
    var param = { apexClass: 'SCSearchController', methodName: 'getCustomerByPhone', methodParams: findInput };
    param.callback = callbackContactDataPopup;
    sforce.opencti.runApex(param);
}

var callbackContactDataPopup = function (response) {
    if (response.success) {
        if (response.returnValue != null || response.returnValue != "") {
            if (response.returnValue.runApex != "") {
                var cuss = JSON.parse(response.returnValue.runApex);
                if (cuss.objectType == "Contact") {
                    console.log('IVG ---- ContactDataManual', cuss);
                    _customerId = cuss.conts[0].Id;
                    _customerType = "Contact";
                    var popupparam = { recordId: _customerId };
                    sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam }); /* PopupContact */
                    ContactDataCreateTask();/* Tạo task */
                }
            }
        }
    } else {
        console.log(response.error);
    }
};

/* Tạo task */
function ContactDataCreateTask() {
    $.ajax({
        type: "Get",
        crossDomain: true,
        dataType: 'json',
        data: { _phone: _phonenumber, username: myuser },
        url: apiUrl + "Contact",
        async: false,
        error: function (errorThrown) {
            console.log("ContactDataCreateTask Error: " + errorThrown);
        },
        success: function (result) {
            console.log("ContactDataCreateTask success: ", result);
            customerInCallList = true;

            sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });/*Mở SmartCenter*/
            $('#hdfRedialNumber').val(result.Number);
            $('#hdfIVRCallRequestID').val(result.RequestID);

            document.getElementById("fNumberCalling").innerHTML = "From: " + result.Number;
            document.getElementById("cdCusName").innerHTML = result.SFCusFullName;

            _customerName = result.SFCusFullName
            _customerId = result.SFCusId;
            _subject = result.SFTaskSubject;
            _phonenumber = result.Number;

            $('.scalling').show();
            $('.lCallIn').hide();
            $('.lCallOut').hide();
            SaveCallLogNew(_subject);
        }
    });
}

/* --------------------- Progressive Từ chối cuộc gọi --------------------- */
function GetUnAvailReason() {
    $.ajax({
        type: "GET",
        crossDomain: true,
        dataType: 'json',
        url: apiUrl + "UnAvail",
        async: false,
        error: function (errorThrown) {
            console.log("GetUnAvailReason Error: " + errorThrown);
        },
        success: function (result) {
            $('#ddlUnAvailReason').html('');
            for (var i = 0; i < result.length; i++) {
                $('#ddlUnAvailReason').append('<option value="' + result[i].ID + '">' + result[i].Text + '</option>');
            }
        }
    });
}
function UnAvailCancel() {
    AgentReady();
    $('.lUnAvail').hide();
    $('.home').show();
}
function UnAvailConfirm() {
    var _userId = userInfo.userid;
    var _reasonId = $('#ddlUnAvailReason :selected').val();
    $.ajax({
        type: "Get",
        crossDomain: true,
        dataType: 'json',
        data: { userId: _userId, reasonId: _reasonId },
        url: apiUrl + "UnAvail",
        async: false,
        error: function (errorThrown) {
            console.log("SaveRejectReason Error: " + errorThrown);
        },
        success: function (result) {
            AgentNotReady();
            $('.lUnAvail').hide();
            $('.home').show();
        }
    });
}

/* --------------------- Update Call Result --------------------- */
function InsertSFTask(_sfTaskId, _callsubject, _sfStatus, _sfStatusCode, _callDisTime, _callDura, _callDesc, _whoid, _customer_name__c, _phone__c, callafter, callRequestClosed) {
    console.log('@IVG[CallResult-Start]');
    var _callRequest = null;
    if (document.getElementById('hdfIVRCallRequestID').value != "") {
        _callRequest = document.getElementById('hdfIVRCallRequestID').value;
    }
    var checkCallBack = document.getElementById('ckCallback').checked;

    var _schedule = null;
    if (checkCallBack == true) {
        _sfStatusCode = 'Not available';
        _schedule = $('#txtScheduleDateTask').val() + ' ' + $('#txtScheduleTimeTask').val();
    }
    else {
        _sfStatusCode = 'D.Done';
    }

    //if (callRequestClosed == true) {
    //    _schedule = $('#txtScheduleDateTask').val() + ' ' + $('#txtScheduleTimeTask').val();
    //}

    var jsString = {
        SFTaskID: _sfTaskId,
        SFStatus: _sfStatus,
        SFStatusCode: _sfStatusCode,
        SFWhoID: _whoid,
        SFCusName: _customer_name__c,
        SFCusPhone: _phone__c,

        CallDisTime: _callDisTime,
        CallSubject: _callsubject,
        CallDura: _callDura,
        CallDesc: _callDesc,
        CallRequestID: _callRequest,
        CallAfter: callafter,
        CallRequestClosed: checkCallBack,
        CallObject: _callObject,
        CallModifiedBy: userIdSF,
        CallbackScheduleTime: _schedule,
        CallUpdateRedial: 0
    };
    var task = JSON.stringify(jsString);
    $.ajax({
        type: "Get",
        crossDomain: true,
        data: { data: task },
        dataType: 'json',
        url: apiUrl + "Result",
        async: false,
        error: function (errorThrown) {
            console.log("InsertSFTask Error: " + errorThrown);
        },
        success: function (result) {
            console.log('@IVG[CallResult-Success]', result);
            _taskid = null;
        }
    });
}
/* --------------------- Giao dien cuoc goi bi ngat --------------------- */
function ChangeCallResultRedial(value) {
    $.ajax({
        type: "GET",
        crossDomain: true,
        data: { value: value },
        dataType: 'json',
        url: apiUrl + "Status",
        async: false,
        error: function (errorThrown) {
            console.log("ChangeCallResultRedial >> Error: " + errorThrown);
        },
        success: function (result) {
            if (result == true) {
                callRequestClosed = result;
                SetCurrentDatetime();
                $('.ScheduleDateDial').show();
            }
            else {
                callRequestClosed = result;
                SetCurrentDatetime();
                $('.ScheduleDateDial').hide();
            }
        }
    });
}

function onRedial() {
    try {

        $('.lCallRedial').hide();
        var number = $('#hdfRedialNumber').val();
        MakeCall(number);
        $('.lCallOut').show();


    } catch (e) {

    }


}

function onNotRedial() {
    /* Check CallRequest */
    var _callRequest = null;
    var _hdfCallRequest = $('#hdfIVRCallRequestID').val();
    if (_hdfCallRequest != "") { _callRequest = _hdfCallRequest }

    /* Params CallResult */
    var checkCallBack = document.getElementById('ckCallbackRedial').checked;
    var _callSchedule = null;
    if (checkCallBack == true) {
        _callStatus = 'Not available';
        _callSchedule = $('#txtScheduleDateDial').val() + ' ' + $('#txtScheduleTimeDial').val();
    }
    else {
        _callStatus = 'D.Done';
    }

    /* Update CallResult */
    if (_callRequest != null) {
        try {
            var jsstring = {
                CallDesc: $('#txtCallDescDial').val(),
                callRequestId: _callRequest,
                CallbackScheduleTime: _callSchedule,
                CallStatus: _callStatus,
                CallUpdateRedial: 1
            };
            var data = JSON.stringify(jsstring);
            console.log(jsstring);
            $.ajax({
                type: "GET",
                crossdomain: true,
                data: { data: data },
                datatype: 'json',
                url: apiUrl + "Result",
                async: false,
                error: function (xmlhttprequest, textstatus, errorthrown) {
                    console.log("Update luc redial that bai error: " + errorthrown);
                },
                success: function (msg) {
                    console.log(msg);
                    location.reload();
                }
            }).done(function () {
                location.reload();
            });
        } catch (e) {
            console.log(e);
        }
    }
    else {
        location.reload();
    }
}
/* --------------------- Progressive --------------------- */
function GetRejectStatus() {
    $.ajax({
        type: "GET",
        crossDomain: true,
        dataType: 'json',
        url: apiUrl + "Reject",
        async: false,
        error: function (errorThrown) {
            console.log("GetUnAvailReason Error: " + errorThrown);
        },
        success: function (result) {
            $('#ddlRejectCall').html('');
            for (var i = 0; i < result.length; i++) {
                $('#ddlRejectCall').append('<option value="' + result[i].RejectCallReasonId + '">' + result[i].Name + '</option>');
            }
        }
    });
}
function ProgressiveCall(_obj) {

    var hdfCallRequestId = $('#hdfIVRCallRequestID').val();
    var _currentRequestId = _obj.requestID;
    if (_currentRequestId != hdfCallRequestId) {
        var _contact = _obj.contactData;
        /* set Content */
        _number = _obj.number;
        document.getElementById('cusInfo').innerHTML
            = '<b style="color:red">' + _contact.cusFullName.toUpperCase() + '</b></br>'
            + _contact.cusAddress;

        $('#hdfIVRCallRequestID').val(_obj.requestID);
        document.getElementById('callSubject').innerHTML = '<b>' + _obj.CallSubject + '</b>';

        customerInCallList = true;

        /* btn ACCEPT */
        $('.panelTask').show();
        document.getElementById('lCallIn').style.paddingTop = '2%';
        document.getElementById('btnAccept').style.borderRadius = 'unset';
        document.getElementById('btnAccept').style.borderBottomLeftRadius = '2em';
        document.getElementById('btnAccept').style.borderBottomRightRadius = '2em';
        document.getElementById('btnAccept').style.borderTopLeftRadius = '2em';
        document.getElementById('btnAccept').style.borderTopRightRadius = '2em';
        document.getElementById('btnAccept').innerHTML = '<i class="fas fa-phone"></i> Accept';

        /* btn REJECT */
        document.getElementById('btnReject').style.borderRadius = 'unset';
        document.getElementById('btnReject').style.borderBottomLeftRadius = '2em';
        document.getElementById('btnReject').style.borderBottomRightRadius = '2em';
        document.getElementById('btnReject').style.borderTopLeftRadius = '2em';
        document.getElementById('btnReject').style.borderTopRightRadius = '2em';
        document.getElementById('btnReject').innerHTML = '<i class="fas fa-phone-slash"></i> Reject';

        _msgcusSfId = _contact.cusSFId;

        //open popup on smartcenter
        sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });

        _subject = _obj.CallSubject + ': ' + _contact.cusFullName + '-' + _number;
        _taskid = _obj.sfTaskId;
        _msgcallDesc = _obj.CallDesc;
        _msgcallResult = _obj.CallResult;
        $('.sttCallIn').hide();

        $('.endCallIn').hide();
        $('.fcallIn').hide();
        $('.frmProgressive').show();

        $('.lCallIn').show("slow,swing");
        $('.home').hide();
        $('.call-now').hide();
    }
}

function onRejectClick() {
    var _userId = userInfo.userid;
    var _reasonId = $('#ddlRejectCall :selected').val();
    var _requestId = $('#hdfIVRCallRequestID').val();

    $.ajax({
        type: "Get",
        crossDomain: true,
        dataType: 'json',
        data: { userId: _userId, reasonId: _reasonId, requestId: _requestId, cusSFId: _msgcusSfId, number: _number },
        url: apiUrl + "Reject",
        async: false,
        error: function (errorThrown) {
            console.log("SaveRejectReason Error: " + errorThrown);
        },
        success: function (result) {
            AgentNotReady();
            location.reload();
        }
    });
}

function onAcceptClick() {
    $('.lCallIn').hide();
    _customerId = _msgcusSfId;
    var popupparam = { recordId: _msgcusSfId };
    sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: popupparam });

    if (_taskid == "") {
        SaveCallLogNew(_subject);
    }
    else {
        $('#txtCallDescTask').val(_msgcallDesc);
    }
    customerInCallList = true;
    MakeCall(_number);
}



//tạm thời không dùng

function onCheckConsentRequest() {
    try {
        if (_customerId != undefined && _customerId != null) {

            var data = { phone_number: _phonenumber, sf_id: _customerId };
            $.ajax({
                type: "POST",
                crossDomain: true,
                dataType: 'json',
                data: data,
                url: apiUrl_Zalo + 'kiem_tra_yeu_cau_goi',
                async: false,
                success: function (rs) {

                    console.log(`api kiem_tra_yeu_cau_goi onCheckConsentRequest `, rs);

                    var arrStatusNotSent = [0, 1, 2, 3, 8];
                    if (rs != undefined
                        && rs.LastCheckCode != undefined
                        && rs.LastCheckCode != null
                        && arrStatusNotSent.includes(rs.LastCheckCode)) {

                        $('#btnSendConsentRequest').hide();

                    }
                    else {
                        $('#btnSendConsentRequest').show();
                    }

                    //0	User approved the request
                    //1	Already allowed to call
                    //2	Request sent
                    //3	User rejected the request
                    //4	User blocked
                    //5	The number of requests allowed is exceeded, please try again later
                    //6	Insufficient permissions
                    //7	A reason is required to request user consent
                    //8	Waiting for user approval
                    //9	The user has not yet interacted with this OA
                    //10	Bad connection
                    //11	Bad request
                    //12	Something went wrong, please retry later
                    //13	Invalid param
                    //14	Failed
                    //16	Consent expired
                    //18	Outside working hours
                    //19	Not in permitted time range
                    //20	OA has not yet requested user consent
                    //21	OA has turned off inbound call



                }
            }).done(function () {

            });

        }

    } catch (e) {

    }
}

function onSendConsentRequest() {


    try {

        if (_customerId != undefined && _customerId != null) {
            var data = { phone_number: _phonenumber, sf_id: _customerId };
            $.ajax({
                type: "POST",
                crossDomain: true,
                dataType: 'json',
                data: data,
                url: apiUrl_Zalo + 'gui_yeu_cau_goi',
                async: false,
                success: function (rs) {

                    console.log(`api gui_yeu_cau_goi data`, data);
                    console.log(`api gui_yeu_cau_goi`, rs);

                    if (rs != undefined && rs.ID != undefined) {
                        $('#btnSendConsentRequest').html('<i class="fas fa-check"></i> SENT')
                    }


                }
            }).done(function () {

            });
        }

    } catch (e) {

    }


}

//end tạm thời không dùng









function zalo_uat_search_zalo_id() {

    try {
        var keyword = $('#txtZaloSearch').val();

        var findInput = 'phone=' + keyword;
        var param = { apexClass: 'SCSearchController', methodName: 'getCustomerByPhone', methodParams: findInput };
        param.callback = callbackSearchCusByPhone;
        sforce.opencti.runApex(param);

    } catch (e) {

    }

}



function phone_number_org(phone) {

    if (phone != undefined && phone != '') {

        //zaloId - không prefix
        if (phone.length >= 15 && !phone.startsWith('0'))
            phone = phone;

        //zaloId - có prefix
        else if (phone.length >= 15 && phone.startsWith('0'))
            phone = phone.substring(1, phone.length);

        //sđt - không prefix
        else if (phone.length > 7 && !phone.startsWith('0'))
            phone = '0' + phone;

        //sđt - có prefix
        else if (phone.length > 7 && phone.startsWith('00'))
            phone = phone.substring(1, phone.length);

    }
    return phone;

}