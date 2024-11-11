var webSocket = null;
var ws_protocol = "wss";
var ws_hostname = "inmpp.cogaihalan.com.vn";
var ws_port = "8081";
var ws_endpoint = "";
var myuser = "";
var myext = "";
var flogon = true;
var _logonExt = "";
var myagent = "";
var mysite = 0;
var ivrnumber = "82802";//"81795";
var usertype = 0; //0 outbound, 1 inbound, 2 user nay ko lam gi
var _currentCallid = "";
var _heldCallid = "";
var agentInfo = null;
var activeCall = null;
var heldCall = null;
var userInfo = null;
var fOpenCallLog = false;
var fAutoCreate = false;
var fUAT = false;
var fSaveInternalCall = true;

var isApproved = false;

var version_js = "ver_apr_2023_hotline_14";
var _CallId, _customerId, _customerName, _Direction, _phonenumber, _taskid;
var _accountid;
var _customerType;
var _startTime, _connectedtime, _disconnecttime;
var _link = "https://inmpp.cogaihalan.com.vn/SFintegration/playrecording.html?";

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
	//console.log(response);
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

    if (phone.length > 15 && phone.startsWith("88")) /* ZaloId HN */
        phone = phone.substring(2, phone.length);

    else if (phone.length > 15 && phone.startsWith("9")) /* ZaloId BD */
        phone = phone.substring(1, phone.length);

    if (phone.startsWith("00")) /* Di động */
        phone = phone.substring(1, phone.length);

    console.log(`SF | SearchCusByPhone`, phone);

    newConTactPhone = phone;
    var findInput = 'phone=' + phone;
    var param = { apexClass: 'SCSearchController', methodName: 'getCustomerByPhone', methodParams: findInput };
    param.callback = callbackSearchCusByPhone;
    sforce.opencti.runApex(param);

};

//eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

var callbackSearchCusByPhone = function (response) {
	if (response.success) {
		if (response.returnValue != null || response.returnValue != "") {
			if (response.returnValue.runApex == "") /*khong tim thay*/ {
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
				if (cuss.objectType == null || cuss.objectType == undefined || cuss.objectType == "")/*khong tim thay*/ {
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
		if (_startTime != undefined && _startTime != null && _disconnecttime != undefined && _disconnecttime != null) {
			duration = (_disconnecttime - _startTime) / 1000;
		}
		_startTime = null;
		_disconnecttime = null;
		_connectedtime = null;

		var whoId = _customerId;
		if (whoId != undefined && whoId != null)
			sforce.opencti.saveLog({
				value: {
					Id: _taskid,
					entityApiName: 'Task',
					WhoId: whoId,
					Status: 'Completed',
					CallDurationInSeconds: duration,
					Disconnected_Time__c: new Date()
				},
				callback: callbackSaveCallLog
			});
		else
			sforce.opencti.saveLog({
				value: {
					Id: _taskid,
					entityApiName: 'Task',
					Status: 'Completed',
					CallDurationInSeconds: duration,
					Disconnected_Time__c: new Date()
				},
				callback: callbackSaveCallLog
			});
		_taskid = null;
	} catch (e) {
		alert(e);
	}
}

function SaveCallLogNew(subject) {
	try {
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
					CallObject: "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + _CallId + "&date=" + formatDate(new Date())
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
					CallObject: "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + _CallId + "&date=" + formatDate(new Date())
				},
				callback: callbackSaveCallLogNew
			});
	} catch (e) {
		alert(e);
	}
}

var _fSaveNewCallTransfer = false;
function SaveCallLogNew2(subject, callid, phonenumber, Direction, Calltype, starttime, connecttime) {
	try {
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
					CallObject: "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + callid + "&date=" + formatDate(new Date())
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
					CallObject: "devnumber=" + myext + "&siteid=" + mysite + "&callid=" + callid + "&date=" + formatDate(new Date())
				},
				callback: callbackSaveCallLogNew
			});

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
	if (response.success) {

		_taskid = response.returnValue.recordId;
		if (fOpenCallLog)
			sforce.opencti.screenPop({ type: sforce.opencti.SCREENPOP_TYPE.SOBJECT, params: response.returnValue });
	} else {
		console.log("SaveCallLogNew: " + response.errors);
	}
	if (_fSaveNewCallTransfer)
		SearchCusByPhone(_phonenumber);
	//searchAndGetScreenPopUrl(_phonenumber, 1);
	_fSaveNewCallTransfer = false;
}

var _caseid;
function CreateCase() {
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

//eeeeeeeeeeeeeeeeeeeeeeee
//nếu dài hơn 15ký tự là zaloId add vô trường khác May.2023
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

function heartbeat2() {
	try {
		if (webSocket != null) {
			var data = {
				type: "heartbeat",
				time: new Date(),
				clientPc: "MyPC",
				user: myuser,
				extension: myext
			};
			webSocket.send(JSON.stringify(data));
			var data = { "type": "query", "object": "user", "user": myuser }
			webSocket.send(JSON.stringify(data));
		}
	} catch (e) {
		console.log('error heartbeat', e);
		onConnectClick();
	}
}


function onLogHub(text) {
	if (webSocket != null) {
		var data = {
			type: "log",
			text: text
		};
		wsSend(data);
	}
}

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
			console.log('Hotline v1.6 --- HeartBeat');
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


function GetSCUser(username) {
	if (webSocket != null) {
		var data = { "type": "query", "object": "user", "user": username }
		wsSend(data);
	}
}



function UserInfo(obj) {
	userInfo = obj;
	mysite = userInfo.siteID;
	f5inc = userInfo.inboundCalls;
	f5ans = userInfo.answeredCalls;
	f5ansf = userInfo.percentAnswered;
	f5out = userInfo.outboundCalls;
	f5avg = userInfo.averageTalk;
	f5queue = userInfo.queueingCalls;
	//alert("Day la Site ID: "+mysite);
	document.getElementById("f5queue").innerHTML = f5queue;
	document.getElementById("f5inc").innerHTML = f5inc;
	document.getElementById("f5ans").innerHTML = f5ans;
	document.getElementById("f5ansf").innerHTML = f5ansf;
	document.getElementById("f5out").innerHTML = f5out;
	document.getElementById("f5avg").innerHTML = f5avg;

	var UserID = userInfo.userid;
	//alert("User ID đang lam:  "+UserID);
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
		//document.getElementById("btnSingleStepTransfer").style.visibility = "hidden";
		//alert("Ban  khong co quyen vao khu vuc nay!");
		//$(#myAlert).append('<p>Sorry, You may not use this application</p>');
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

    var zalo_prefix = '9';

    //if (myext.startsWith('86') || myext.startsWith('82')) {
    //	/* 82-Hot / 84-HN / 86-BD */
    //	zalo_prefix = '9';
    //} 

    /*Jun.2023*/


	//zalo Id chưa có prefix
	if (callnumber.length > 15 && !callnumber.startsWith(zalo_prefix))
		callnumber = zalo_prefix + callnumber;

    //zalo Id đã có prefix
    else if (callnumber.length > 15 && callnumber.startsWith(zalo_prefix))
        callnumber = callnumber;

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

    //if (callnumber.length > 15 && !callnumber.startsWith("88"))/* Apr.2023 call-out zaloId*/
    //	callnumber = "88" + callnumber;
    //else if (callnumber.length > 15)/* Apr.2023 call-out zaloId*/
    //	callnumber = callnumber;
    //else if (callnumber.startsWith("0") && !callnumber.startsWith("00"))
    //	callnumber = "0" + callnumber;
    //else if (callnumber.length > 7 && !callnumber.startsWith("0"))
    //	callnumber = "0" + callnumber;

    console.log(`IVG | MakeCall`, callnumber);

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

/*function MakeCallOut(callnumber)
{
    if (webSocket != null &&  webSocket.readyState ==1)
    {       
        var data = { type:"command",
                     devNumber: myext,
                     action: "MakeCall", 
                     callNumber: callnumber };
        wsSend(data);
    }
}*/

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

		//wsSend(message);
	}


	if (callObj.type == "callEvent") {
		try {
			CallEvent(callObj);
		}
		catch (ex) {
			if (activeCall != null)
				console.log(activeCall);
			console.log(callObj);
			console.log(ex);
		}
	}
	else if (callObj.type == "agentEvent")
		AgentEvent(callObj);
	else if (callObj.type == "userSnapshot")
		UserInfo(callObj);
	else if (callObj.type == "query" && callObj.object == "callTransferInfo")
		CallTransferInfo(callObj);
	else if (callObj.type == "data") {
		if (callObj.object == "devices") {
			DeviceList(callObj);
		}
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

	if (callObj.devNumber != myext) {
		if (callObj.event == "Established" || callObj.event == "ConnectionCleared" || callObj.event == "Diverted") {

			console.log(`IVG | Cuộc gọi khác myExt`, callObj);
			// vì route mới không có end call tại devNumber của Agent mà là ##xxx

			if (callObj.devNumber.startsWith('##')) {

				console.log(`ConnectionCleared 1`, callObj);

				if (_CallId == callObj.callID) {
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

				if (activeCall == null && heldCall == null) {
					_tmpTransferCall = "";

					//$('.scalling').hide();
					//$('.home').show();

					CallCleared();

					_tmpTransferCall = "";

				}

			}

			else {
				if (activeCall == null)
					return;

				if (activeCall.callID == null)
					return;

				if (activeCall.callID != callObj.callID && heldCall == null)
					return;

				if (activeCall.callID != callObj.callID && heldCall.callID != callObj.callID)
					return;
			}

		}
		else {
			//console.log(`IVG | Cuộc gọi khác myExt 2`, callObj);
			return;
		}
	}

	_currentCallid = callObj.callID;
	//console.log(callObj);
	if (callObj.event == "Delivered") /* Cuoc goi den */ {

		//debugger;

		console.log(`IVG | Cuộc gọi Delivered`, callObj);

		// Apr.2023 vì cuộc gọi đi (Originated) bị nhận thêm cuộc dilivered
		if (callObj.calling == myext) return;

		sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });

		onLogHub(`popup_cuoc_den ${callObj.callID}`);

		console.log(`IVG | popup_cuoc_den`);

		if (_CallId != callObj.callID) {
			console.log(`IVG | Cuộc gọi Delivered 1`);
			_CallId = callObj.callID;
			_Direction = "Inbound";
			_phonenumber = callObj.calling;

			if (_phonenumber.length > 10) /*Apr.2023 bổ sung điều kiện cho zaloId callIn*/ {
				_phonenumber = _phonenumber;
			}
			else if (_phonenumber.length > 7 && !_phonenumber.startsWith("0")) {
				_phonenumber = "0" + _phonenumber;
			}

			var subject = "New call from: " + _phonenumber;
			_startTime = new Date();
			console.log(`IVG | Cuộc gọi Delivered 2`);
			if (CheckPopup(callObj)) {
				console.log(`IVG | Cuộc gọi Delivered 3`);
				SaveCallLogNew(subject);
				console.log(`IVG | Cuộc gọi Delivered 4`);
				SearchCusByPhone(_phonenumber);
				//searchAndGetScreenPopUrl(_phonenumber, 1);
			}
			else {
				console.log(`IVG | Cuộc gọi Delivered 5`);
				_Direction = "Internal";
				if (fSaveInternalCall)
					SaveCallLogNew2(subject, callObj.callID, _phonenumber, "Internal", 3, _startTime, null);
			}
		}

		activeCall = {
			event: "Delivered",
			callID: callObj.callID,
			alerting: callObj.alerting,
			calling: callObj.calling,
			called: callObj.called,
			redirect: callObj.redirect
		};

		console.log(`IVG | Cuộc gọi Delivered 6`);

		document.getElementById("btnMakeCall").disabled = true;
		document.getElementById("btnAnswer").disabled = false;
		document.getElementById("btnCancel").disabled = false;
		document.getElementById("btnClear").disabled = false;
		document.getElementById("btnConsult").disabled = true;
		document.getElementById("btnReconnect").disabled = true;
		document.getElementById("btnTransfer").disabled = true;
		document.getElementById("callNumber").innerHTML = callObj.calling;
		$('.lCallIn').show("slow,swing");
		$('.home').hide();
	}
	else if (callObj.event == "Originated") /* Cuoc goi di */ {
		console.log(`IVG | Cuộc gọi Originated`, callObj);

		if (heldCall == null || heldCall.callID == null) {
			sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
			onLogHub(`popup_cuoc_di ${callObj.callID}`);

			if (_CallId != callObj.callID) {
				_CallId = callObj.callID;
				_Direction = "Outbound";
				_phonenumber = callObj.called;
				if (_phonenumber.startsWith("00"))
					_phonenumber = _phonenumber.substr(1);
				_startTime = new Date();
				var subject = "New call to: " + _phonenumber;
				if (CheckPopup(callObj)) {
					SaveCallLogNew(subject);
					SearchCusByPhone(_phonenumber);
					//searchAndGetScreenPopUrl(_phonenumber, 2);	
				}
				else {
					_Direction = "Internal";
					if (fSaveInternalCall)
						SaveCallLogNew2(subject, callObj.callID, _phonenumber, "Internal", 3, _startTime, null);
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
	else if (callObj.event == "Established") /* Cuoc goi ket noi */ {
		console.log(`IVG | Cuộc gọi Established`, callObj);
		if (activeCall == null || callObj.cause == "callPickup") {
			sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: visibleSoftPhoneCallBack });
			_CallId = callObj.callID;
			_Direction = "Inbound";
			_phonenumber = callObj.calling;
			if (_phonenumber.length > 7 && !_phonenumber.startsWith("0"))
				_phonenumber = "0" + _phonenumber;
			_startTime = new Date();
			_connectedtime = _startTime;
			var subject = "New call from: " + _phonenumber;
			if (CheckPopup(callObj))
				SearchCusByPhone(_phonenumber);
			//searchAndGetScreenPopUrl(_phonenumber, 1);
			else {
				_Direction = "Internal";
				if (fSaveInternalCall)
					SaveCallLogNew2(subject, callObj.callID, _phonenumber, "Internal", 3, _startTime, null);
			}
			$('.home').hide();
		}

		activeCall = {
			event: "Established",
			callID: callObj.callID,
			answering: callObj.answering,
			calling: callObj.calling,
			called: callObj.called,
			redirect: callObj.redirect
		};
		$('.scalling').show("slow,swing");
		$('.lCallOut').hide();
		$('.lCallIn').hide();
		if (_Direction == "Internal") {
			$('.fContactSelect').hide();
			$('.fContactNew').hide();
			$('.fSaveLog').hide();
		}

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

		/* Hien thi From: xxxx to: xxxx */
		/*if (_tmpTransferCall == "")
			document.getElementById("fNumberCalling").innerHTML = callObj.calling;	
		else
			document.getElementById("fNumberCalling").innerHTML = _tmpTransferCall;	
		_tmpTransferCall = "";
		
		document.getElementById("fNumberCaller").innerHTML = callObj.called;*/

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
	else if (callObj.event == "ConnectionCleared") /* Cuoc goi huy */ {
		console.log(`IVG | Cuộc gọi ConnectionCleared`, callObj);
		var fServiceInitiated = true;
		if (activeCall != null && activeCall.event != "ServiceInitiated")
			fServiceInitiated = false;

		if (_CallId == callObj.callID && !fServiceInitiated) {
			_disconnecttime = new Date();
			SaveCallLogEndCall();
			_CallId = null;
		}

		if (activeCall != null && activeCall.callID == callObj.callID) {
			console.log(`IVG | Cuộc gọi ConnectionCleared 1`);
			activeCall = null;
		}
		else if (heldCall != null && heldCall.callID == callObj.callID) {
			console.log(`IVG | Cuộc gọi ConnectionCleared 2`);
			heldCall = null;
		}

		if (activeCall == null && heldCall == null && !fServiceInitiated) {
			_tmpTransferCall = "";

			//Apr.2023 
			CallCleared();
			_tmpTransferCall = "";

			//$('.scalling').hide();
			//$('.home').hide(); 
			console.log(`IVG | Cuộc gọi ConnectionCleared 3`);

		}

		for (i = 0; i < 10; i++) {
			window.clearInterval(i);
		}

		location.reload();
	}
	else if (callObj.event == "Held") /* Cuoc goi bi giu */ {
		console.log(`IVG | Cuộc gọi Held`, callObj);
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
	else if (callObj.event == "Retrieved")/* Cuoc goi lay lai */ {
		console.log(`IVG | Cuộc gọi Retrieved`, callObj);
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
		console.log(`IVG | Cuộc gọi Diverted`, callObj);
		if (callObj.divertedTo != myext) {
			activeCall = null;
			heldCall = null;
			//CallCleared();
			location.reload();
		}
		else if (callObj.divertedTo == myext) {
			activeCall = {
				event: "Diverted",
				callID: callObj.callID
			};
		}
	}
	else if (callObj.event == "Transferred")/* Cuoc goi transfer */ {
		console.log(`IVG | Cuộc gọi Transferred`, callObj);
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
			//CallCleared();
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
		console.log(`IVG | Cuộc gọi ServiceInitiated`, callObj);
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

	try {

		var ws_url = protocol + "://" + hostname + ":" + port + endpoint + `?user=${myuser}`;

		webSocket = new WebSocket(ws_url);

		console.log(`ws_url`, ws_url);

		webSocket.onopen = function (evt) {
			console.log(`onopen - connected`, evt);
			GetSCUser(myuser);
		};

		webSocket.onclose = function (evt) {
			console.log(`onclose`, evt.data);
			console.log("Connection is closed...");
		};

		webSocket.onerror = function (evt) {
			console.log("onerror - There was an error with your websocket." + evt.data);
		};

		webSocket.onmessage = function (evt) {
			//console.log(`onmessage`, evt.data);
			document.getElementById("btnConnect").disabled = true;
			CallAgentEvent(evt.data);
			 
			lastTime = new Date();

		};


	} catch (e) {
		console.log("catch - openWSConnection: ", e);
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

		console.error("webSocket is not open: " + webSocket.readyState);
		return;
	}
	var msg = document.getElementById("message").value;
	webSocket.send(msg);
}

/* Tesst Ham */
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