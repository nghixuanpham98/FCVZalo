using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using FCVZalo.Models.EntityModels;
using FCVZalo.Models.CustomModels;
using FCVZalo.DAO;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using OfficeOpenXml.Table;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace FCVZalo.Controllers
{
    public class AdminController : ApiController
    {
        DBContext db = new DBContext();


        #region COMMON

        public static class zalo_api
        {

            public static string url_requestconsent = "https://openapi.zalo.me/v2.0/oa/call/requestconsent";
            public static string url_checkconsent = "https://openapi.zalo.me/v2.0/oa/call/checkconsent?data=";

            public static string access_token()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "access_token")?.value;
            }
            public static string refresh_token()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "refresh_token")?.value;
            }
            public static string app_id()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "app_id")?.value;
            }
            public static string secret_key()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "secret_key")?.value;
            }

        }
        public static class alert
        {
            public static string success_send = "Request sent successfully";
            public static string success_update = "Update successfully";
            public static string error_params_is_null = "Params is null";
            public static string error_phone_is_invalid = "Phone is invalid";
            public static string error_column_mobilephone_not_found = "Column mobilephone not found";
        }


        public static class errorCode
        {
            public static int User_approved_the_request = 0;
            public static int Already_allowed_to_call = 1;
            public static int Request_sent = 2;
            public static int User_rejected_the_request = 3;
            public static int User_blocked = 4;
            public static int The_number_of_requests_allowed_is_exceeded = 5;
            public static int Insufficient_permissions = 6;
            public static int A_reason_is_required_to_request_user_consent = 7;
            public static int Waiting_for_user_approval = 8;
            public static int The_user_has_not_yet_interacted_with_this_OA = 9;
            public static int Bad_connection = 10;
            public static int Bad_request = 11;
            public static int Something_went_wrong = 12;
            public static int Invalid_param = 13;
            public static int Failed = 14;
            public static int Consent_expired = 15;
            public static int Outside_working_hours = 16;
            public static int Not_in_permitted_time_range = 17;
            public static int OA_has_not_yet_requested_user_consent = 18;
            public static int OA_has_turned_off_inbound_call = 19;
        }

        static int LineNumber([System.Runtime.CompilerServices.CallerLineNumber] int lineNumber = 0)
        {
            return lineNumber;
        }

        public class AdminEntity
        {

            public Guid? CallListID { get; set; }
            public DateTime? CallListDate { get; set; }
            public bool IsExport { get; set; } = false;
            public string US { get; set; }
            public string PW { get; set; }
            public DateTime From { get; set; } = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            public DateTime To { get; set; } = DateTime.Now.Date;



            public int PageIndex { get; set; } = 1;
            public int PageSize { get; set; } = 500;
            public int? TotalPages { get; set; }
            public int? TotalRecords { get; set; }
            public string Keyword { get; set; }
            public string SQLQuery { get; set; }
            public string phone_number { get; set; }
            public string sf_id { get; set; }
            public bool IsApproved { get; set; } = false;
            public bool IsActive { get; set; } = false;
            public bool IsApprovedNot { get; set; } = false;


            //public string phone { get; set; }
            public List<string> phone_list { get; set; }
            public List<tbl_ChatZaloSettings> list_oa_setting { get; set; }
            public List<tbl_ChatZaloOAInfo> list_oa_info { get; set; }
            public class output_msg
            {
                public output_data data { get; set; }
                public int? error { get; set; }
                public string message { get; set; }
            }

            //{\"data\":{\"expired_time\":1681898549557},\"error\":0,\"message\":\"User approved the request\"}

            public class output_data
            {
                public long? expired_time { get; set; }
                public DateTime? expired_time_dt { get; set; }
            }


            //May.2023 

            public Guid? myId { get; set; }
            public Guid? ID { get; set; }
            public List<Guid> ListGuid{ get; set; }
            public tbl_ChatZaloRequests request { get; set; }

        }

        public static DateTime ConvertNumberToDateTime(long input)
        {

            try
            {
                long beginTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks;

                return new DateTime(beginTicks + input * 10000, DateTimeKind.Utc);
            }
            catch { return new DateTime(); }
        }


        #endregion


        #region REQUEST CONSENT


        [HttpPost]
        [Route("api/Admin/RequestConsent")]

        public IHttpActionResult RequestConsent(AdminEntity ent)
        {
            string output = "", error = "";

            try
            {

                var access_token = zalo_api.access_token();

                if (ent != null && ent.phone_list != null)
                {

                    ent.phone_list = ent.phone_list.Where(x => !string.IsNullOrEmpty(x)).ToList();

                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();

                        var input = new
                        {
                            phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone,
                            call_type = "audio", /* audio + video + audio_and_video */
                            reason_code = 101
                        };

                        var zalo = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_requestconsent,
                            input = JsonConvert.SerializeObject(input),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        DAO.DAOCommon.WriteLog($"{i}.REQUEST => " + JsonConvert.SerializeObject(new { zalo.url, input }));
                        DAO.DAOCommon.WriteLog($"{i}.RESPONSE <= " + output);

                        var outputJS = JsonConvert.DeserializeObject<AdminEntity.output_msg>(output);

                        func_update_consent_db(outputJS, phone);

                    }

                }

                if (!string.IsNullOrEmpty(error))
                {
                    return Json(new { Error = error, output });
                }

                return Json(new { Success = alert.success_send, output });

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message, output });
            }

        }



        [HttpPost]
        [Route("api/Admin/CheckConsent")]

        public IHttpActionResult CheckConsent(AdminEntity ent)
        {
            string output = "";
            string error = "";
            try
            {
                #region check api  

                //var zalo1 = new ZaloParams()
                //{
                //    isAccess = true,
                //    app_id = zalo_api.app_id(),
                //    refresh_token = zalo_api.refresh_token(),
                //    secret_key = zalo_api.secret_key(),
                //};

                //output = DAO.DAOZalo.API_Intermadiary(zalo1, ref error);

                #endregion

                var phoneContact = db.v_Zalo_Test.Select(x => x.mobilephone).ToList();

                if (phoneContact.Count() > 0)
                {
                    ent = ent == null ? new AdminEntity() : ent;
                    ent.phone_list = ent.phone_list == null ? new List<string>() : ent.phone_list;
                    ent.phone_list.AddRange(phoneContact);
                    ent.phone_list = ent.phone_list.Distinct().ToList();
                }


                if (ent != null && ent.phone_list != null)
                {
                    var access_token = zalo_api.access_token();

                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();

                        var input = new { phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone };

                        var zalo = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "GET",
                            url = zalo_api.url_checkconsent + JsonConvert.SerializeObject(input),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        DAO.DAOCommon.WriteLog($"{i}.REQUEST => " + JsonConvert.SerializeObject(new { zalo.url, zalo.input }));
                        DAO.DAOCommon.WriteLog($"{i}.RESPONSE <= " + output);

                        if (!string.IsNullOrEmpty(error))
                        {
                            return Json(new { Error = error });
                        }

                        var outputJS = JsonConvert.DeserializeObject<AdminEntity.output_msg>(output);

                        if (outputJS.data != null && outputJS.data.expired_time.HasValue)
                        {
                            outputJS.data.expired_time_dt = ConvertNumberToDateTime(outputJS.data.expired_time.Value);
                        }

                        func_update_consent_db(outputJS, phone, true);


                    }

                }

                if (!string.IsNullOrEmpty(error))
                {
                    return Json(new { Error = error, output });
                }

                return Json(new { Success = alert.success_send, output });

            }
            catch (Exception ex)
            {
                return Json(new
                {
                    Exception = ex.Message,
                    Error = error,
                    output
                });
            }
        }

        void func_update_consent_db(AdminEntity.output_msg outputJS, string phone, bool isCheck = false)
        {
            try
            {

                if (outputJS != null && !string.IsNullOrEmpty(phone))
                {
                    var today = DateTime.Now;

                    var isAdd = false;

                    var consent = db.tbl_ChatZaloRequestConsent.FirstOrDefault(x => x.Phone == phone);
                    if (consent == null)
                    {
                        isAdd = true;
                        consent = new tbl_ChatZaloRequestConsent();
                        consent.ID = Guid.NewGuid();
                        consent.Phone = phone;
                    }

                    if (isCheck)
                    {
                        consent.LastCheckCode = outputJS.error;
                        consent.LastCheckMessage = outputJS.message;
                        consent.IsApproved = outputJS.data != null && outputJS.data.expired_time_dt.HasValue ? true : false;
                        consent.ExpiredOn = outputJS.data != null ? outputJS.data.expired_time_dt : null;
                        consent.LastCheckOn = today;
                    }
                    else
                    {
                        consent.LastSendCode = outputJS.error;
                        consent.LastSendMessage = outputJS.message;
                        consent.LastSendOn = today;
                    }

                    if (isAdd) db.tbl_ChatZaloRequestConsent.Add(consent);
                    db.SaveChanges();
                }
            }
            catch { }
        }



        [HttpPost]
        [Route("api/Admin/SavePhone")]

        public IHttpActionResult SavePhone(AdminEntity ent)
        {

            try
            {

                if (ent != null && ent.phone_list != null)
                {
                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();

                        //phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone;

                        var consent = db.tbl_ChatZaloRequestConsent.FirstOrDefault(x => x.Phone == phone);

                        if (consent == null)
                        {
                            consent = new tbl_ChatZaloRequestConsent();
                            consent.ID = Guid.NewGuid();
                            consent.Phone = phone;
                            db.tbl_ChatZaloRequestConsent.Add(consent);
                            db.SaveChanges();
                        }
                    }
                }

                return Json(new { Success = alert.success_update });

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }


        [HttpPost]
        [Route("api/Admin/DeletePhone")]

        public IHttpActionResult DeletePhone(AdminEntity ent)
        {

            try
            {

                if (ent != null && ent.phone_list != null)
                {
                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();

                        var consent = db.tbl_ChatZaloRequestConsent.FirstOrDefault(x => x.Phone == phone);

                        if (consent != null)
                            db.tbl_ChatZaloRequestConsent.Remove(consent);

                    }
                    db.SaveChanges();
                }

                return Json(new { Success = alert.success_update });

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }


        [HttpPost]
        [Route("api/Admin/ConsentList")]
        public IHttpActionResult ConsentList(AdminEntity ent)
        {

            try
            {

                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloRequestConsent select x;

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.Phone) && x.Phone.Contains(ent.Keyword)));
                }
                if (ent.IsApproved)
                {
                    query = query.Where(x => x.IsApproved == true);
                }

                if (ent.IsApprovedNot)
                {
                    query = query.Where(x => x.IsApproved == false || x.IsApproved == null);
                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderBy(x => x.Phone).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }


        #endregion


        #region OA SETTING

        [HttpPost]
        [Route("api/Admin/OASettingList")]
        public IHttpActionResult OASettingList(AdminEntity ent)
        {

            try
            {

                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloSettings select x;

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.text) && x.text.Contains(ent.Keyword))
                                            || (!string.IsNullOrEmpty(x.value) && x.value.Contains(ent.Keyword)));
                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderBy(x => x.id).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }

        [HttpPost]
        [Route("api/Admin/OASettingUpdate")]
        public IHttpActionResult OASettingUpdate(AdminEntity ent)
        {

            try
            {
                if (ent != null && ent.list_oa_setting != null)
                {
                    foreach (var item in ent.list_oa_setting)
                    {
                        var data = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.id == item.id);
                        if (data != null)
                        {
                            data.value = item.value;
                            db.SaveChanges();
                        }
                    }
                    return Json(new { Success = alert.success_update });
                }

                return Json(new { Error = alert.error_params_is_null });

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

        #endregion


        #region OA-INFO
        [HttpPost]
        [Route("api/Admin/OAInfo")]
        public IHttpActionResult OAInfo(AdminEntity ent)
        {

            try
            {

                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloOAInfo select x;

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.DisplayName) && x.DisplayName.Contains(ent.Keyword)));
                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderBy(x => x.DisplayName).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }


        [HttpPost]
        [Route("api/Admin/OAInfoUpdate")]
        public IHttpActionResult OAInfoUpdate(AdminEntity ent)
        {


            try
            {
                if (ent != null && ent.list_oa_info != null)
                {
                    foreach (var item in ent.list_oa_info)
                    {
                       
                    }
                    return Json(new { Success = alert.success_update });
                }

                return Json(new { Error = alert.error_params_is_null });

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }
        #endregion


        #region Salesforce


        [HttpPost]
        [Route("api/Admin/SFContactList")]
        public IHttpActionResult SFContactList(AdminEntity ent)
        {

            try
            {
                if (ent != null)
                {

                    DataTable DT = new DataTable();
                    string errorMsg = "";
                    List<string> Columns = new List<string>();
                    try
                    {
                        (new SqlDataAdapter(ent.SQLQuery, db.Database.Connection.ConnectionString)).Fill(DT);

                        if (DT != null && DT.Columns.Count > 0)
                        {
                            for (int i = 0; i < DT.Columns.Count; i++)
                            {
                                Columns.Add(DT.Columns[i].ColumnName);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        errorMsg = ex.Message;
                    }

                    var TotalRecords = DT.Rows.Count;

                    return Json(new { ent.SQLQuery, Data = DT, Error = errorMsg, Columns });
                }

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

            return Json(new { Error = "Try again" });

        }

        [HttpPost]
        [Route("api/Admin/SFContactAlterView")]
        public IHttpActionResult SFContactAlterView(AdminEntity ent)
        {

            try
            {
                if (ent != null && !string.IsNullOrEmpty(ent.SQLQuery))
                {
                    //đổ câu query này ra table lần nữa xem có thông tin mobile không 

                    DataTable DT = new DataTable();
                    string errorMsg = "";
                    List<string> Columns = new List<string>();
                    try
                    {
                        (new SqlDataAdapter(ent.SQLQuery, db.Database.Connection.ConnectionString)).Fill(DT);

                        if (DT != null && DT.Columns.Count > 0)
                        {
                            for (int i = 0; i < DT.Columns.Count; i++)
                            {
                                Columns.Add(DT.Columns[i].ColumnName);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        errorMsg = ex.Message;
                    }

                    var checkColPhone = Columns.Any(x => x == "mobilephone");
                    if (!checkColPhone)
                    {
                        return Json(new { Error = alert.error_column_mobilephone_not_found });
                    }

                    //CustomerId
                    //FullName
                    //SalesForceId
                    //mobilephone
                    //phone
                    //email
                    //Birthdate
                    //Address
                    //Subject
                    //Priority

                    string successMsg = null;
                    try
                    {
                        var CMD = $" ALTER view [dbo].[v_Zalo_Test] as {ent.SQLQuery} ";
                        var exec = db.Database.ExecuteSqlCommand(CMD);
                        successMsg = alert.success_update;


                        List<string> phone_list = new List<string>();
                        for (int i = 0; i < DT.Rows.Count; i++)
                        {
                            phone_list.Add(DT.Rows[i]["mobilephone"].ToString());
                        }

                        //Check_Consent(phone_list, ref errorMsg);
                    }
                    catch (Exception ex)
                    {
                        errorMsg = ex.Message;
                    }

                    return Json(new { Error = errorMsg, Success = successMsg });
                }

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

            return Json(new { Error = "Try again" });

        }

        #endregion




        [HttpPost]
        [Route("api/Admin/WebhookList")]
        public IHttpActionResult WebhookList(AdminEntity ent)
        {

            try
            { 
                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloWebhook where x.eventtime >= ent.From && x.eventtime <= ent.To select x;
 

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.EventName) && x.EventName.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.ResponseContent) && x.ResponseContent.Contains(ent.Keyword)));
                }


                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderByDescending(x => x.eventtime).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }

        


        [HttpPost]
        [Route("api/Admin/RequestQueueList")]
        public IHttpActionResult RequestQueueList(AdminEntity ent)
        {

            try
            {
                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloRequestQueue where x.insert_time >= ent.From && x.insert_time <= ent.To select x;


                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.phone) && x.phone.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.output) && x.output.Contains(ent.Keyword)));
                }


                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderByDescending(x => x.insert_time).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);

            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

        }




        #region CHIẾN DỊCH GỬI YÊU CẦU CHẤP NHẬN CUỘC GỌI


        [HttpPost]
        [Route("api/Admin/CampaignRequest")]
        public IHttpActionResult CampaignRequest(AdminEntity ent)
        {

            try
            { 
                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.vw_ChatZaloRequests select x;

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    query = query.Where(x => (!string.IsNullOrEmpty(x.Name) && x.Name.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.Description) && x.Description.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.ViewName) && x.ViewName.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.SqlQuery) && x.SqlQuery.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.CreatedByName) && x.CreatedByName.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.ModifiedByName) && x.ModifiedByName.Contains(ent.Keyword)));
                }
                if (ent.IsApproved)
                {
                    query = query.Where(x => x.IsActive == true);
                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderBy(x => x.Name).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var rs = new { Data, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);
                  
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }


        }


        [HttpPost]
        [Route("api/Admin/CampaignRequestByID")]
        public IHttpActionResult CampaignRequestByID(AdminEntity ent)
        {
            try
            {
                if (ent != null && ent.ID.HasValue)
                {
                    var Data = db.tbl_ChatZaloRequests.FirstOrDefault(x => x.ID == ent.ID);
                    return Json(new { Data });
                }
                return Json(new { Error = Language.VN.alert_try_again });
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

        [HttpPost]
        [Route("api/Admin/CampaignRequestDelete")]
        public IHttpActionResult CampaignRequestDelete(AdminEntity ent)
        {
            try
            {
                if (ent != null && ent.ListGuid != null && ent.ListGuid.Count() > 0)
                {
                    var listGuidString = $"'{string.Join("','", ent.ListGuid)}'";

                    db.Database.ExecuteSqlCommand($"DELETE tbl_ChatZaloRequests WHERE ID IN ({listGuidString})");

                    db.Database.ExecuteSqlCommand($"DELETE tbl_ChatZaloRequestDetails WHERE RequestID IN ({listGuidString})");

                    db.SaveChanges();

                    return Json(new { Success = Language.VN.alert_delete_success });
                }
                return Json(new { Error = Language.VN.alert_try_again });
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

    
        
        [HttpPost]
        [Route("api/Admin/CampaignRequestActive")]
        public IHttpActionResult CampaignRequestActive(AdminEntity ent)
        {
            try
            {
                if (ent != null && ent.ID.HasValue)
                {


                    var req = db.tbl_ChatZaloRequests.FirstOrDefault(x => x.ID == ent.ID.Value);
                    if (req != null)
                    {
                        req.IsActive = ent.IsActive;
                    }
                    db.SaveChanges();
                     

                    return Json(new { Success = Language.VN.alert_update_success });
                }
                return Json(new { Error = Language.VN.alert_try_again });
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

   

        [HttpPost]
        [Route("api/Admin/CampaignRequestUpdate")]
        public IHttpActionResult CampaignRequestUpdate(AdminEntity ent)
        {

            try
            {
                if (ent != null && ent.request != null)
                {

                    var now = DateTime.Now;
                    var today = DateTime.Now.Date;
                    var isAdd = false;
                    var item = ent.request;
                    var requestId = item.ID;
                    var data = db.tbl_ChatZaloRequests.FirstOrDefault(x => x.ID == requestId);
                    if (data == null)
                    {
                        requestId = Guid.NewGuid();
                        isAdd = true;

                        data = new tbl_ChatZaloRequests();
                        data.ID = requestId;
                        data.CreatedBy = ent.myId;
                        data.CreatedOn = DateTime.Now;
                    }

                    var queryInsert = "";

                    var req = new List<RequestEntity>();

                    if (!string.IsNullOrEmpty(item.SqlQuery) || !string.IsNullOrEmpty(item.ViewName))
                    {
                        try
                        {
                            if (data.SqlQuery != item.SqlQuery || data.ViewName != item.ViewName)
                            {
                                queryInsert = !string.IsNullOrEmpty(item.SqlQuery) ? item.SqlQuery : $"SELECT TOP 10 * FROM {item.ViewName}";

                                req = db.Database.SqlQuery<RequestEntity>(queryInsert).ToList();

                                queryInsert = !string.IsNullOrEmpty(item.SqlQuery) ? item.SqlQuery : $"SELECT * FROM {item.ViewName}";

                                if (req != null)
                                {
                                    var sfIdNull = req.Any(x => string.IsNullOrEmpty(x.SalesForceId) && string.IsNullOrEmpty(x.sfid));

                                    if (sfIdNull) return Json(new { Error = Language.VN.alert_invalid_sfId });

                                    var mobileNull = req.Any(x => string.IsNullOrEmpty(x.mobilephone));

                                    if (mobileNull) return Json(new { Error = Language.VN.alert_invalid_mobilephone });
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            return Json(new { Error = ex.Message });
                        }
                    }

                    var insertInto = $" INSERT INTO tbl_ChatZaloRequestDetails(ID,MobilePhone,SFID,RequestID) ";
                    insertInto += $" SELECT newid(),mobilephone,sfid,'{requestId}' FROM ({queryInsert}) AS A ";
                    insertInto += $" WHERE mobilephone not in(select mobilephone from tbl_ChatZaloRequestDetails)  ";
                    insertInto += $" GROUP BY mobilephone,sfid ";
                    insertInto += $" HAVING COUNT(mobilephone)=1 ";

                    queryInsert = !string.IsNullOrEmpty(queryInsert) ? insertInto : ""; 

                    db.Database.ExecuteSqlCommand(queryInsert);

                    var liDetailRemove = new List<tbl_ChatZaloRequestDetails>();
                    var liDetailAdd = new List<tbl_ChatZaloRequestDetails>();

                    #region MyRegion

                    //if (req != null && req.Count() > 0)
                    //{
                    //    liDetailRemove = db.tbl_ChatZaloRequestDetails.Where(x => x.RequestID == requestId).ToList();

                    //    foreach (var detail in req)
                    //    {
                    //        var checkExisted = liDetailAdd.Any(x => x.MobilePhone == detail.mobilephone);
                    //        var checkDuplicate = db.tbl_ChatZaloRequestDetails.Any(x => x.MobilePhone == detail.mobilephone);
                    //        if (!checkExisted && !checkDuplicate)
                    //        {
                    //            liDetailAdd.Add(new tbl_ChatZaloRequestDetails
                    //            {
                    //                ID = Guid.NewGuid(),
                    //                MobilePhone = detail.mobilephone,
                    //                Phone = detail.phone,
                    //                SFID = !string.IsNullOrEmpty(detail.sfid) ? detail.sfid : detail.SalesForceId,
                    //                RequestID = requestId,
                    //                //RequestDate = today
                    //            });
                    //        }
                    //    }
                    //}
                    #endregion

                    data.Name = item.Name;
                    data.Description = item.Description;
                    data.SendOn = item.SendOn;
                    data.ViewName = item.ViewName;
                    data.SqlQuery = item.SqlQuery;
                    data.IsActive = item.IsActive;
                    data.ModifiedBy = ent.myId;
                    data.ModifiedOn = DateTime.Now;

                    if (isAdd) db.tbl_ChatZaloRequests.Add(data);

                    if (liDetailRemove != null && liDetailRemove.Count() > 0)
                    {
                        db.tbl_ChatZaloRequestDetails.RemoveRange(liDetailRemove);
                    }
                    if (liDetailAdd != null && liDetailAdd.Count() > 0)
                    {
                        db.tbl_ChatZaloRequestDetails.AddRange(liDetailAdd);
                    }

                    db.SaveChanges();


                    db = new DBContext();
                    data = db.tbl_ChatZaloRequests.FirstOrDefault(x => x.ID == requestId);
                    var dataDetail = db.tbl_ChatZaloRequestDetails.Where(x => x.RequestID == requestId);

                    return Json(new { Success = Language.VN.alert_update_success, data, dataDetail });

                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

            return Json(new { Error = "Try again" });

        }


        #region chi tiết
        [HttpPost]
        [Route("api/Admin/CampaignDetailByRequestID")]
        public IHttpActionResult CampaignDetailByRequestID(AdminEntity ent)
        {

            try
            {
                double TotalPages = 1;

                var TotalRecords = 0;

                var query = from x in db.tbl_ChatZaloRequestDetails select x;
                var requestInfo = new vw_ChatZaloRequests();
                if (ent.ID.HasValue && ent.ID != Guid.Empty)
                {
                    query = query.Where(x => x.RequestID == ent.ID);
                    requestInfo = db.vw_ChatZaloRequests.FirstOrDefault(x => x.ID == ent.ID);
                }

                if (!string.IsNullOrEmpty(ent.Keyword))
                {
                    ent.Keyword = ent.Keyword.Trim();
                    query = query.Where(x => (!string.IsNullOrEmpty(x.Phone) && x.Phone.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.MobilePhone) && x.MobilePhone.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.LastCheckMsg) && x.LastCheckMsg.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.LastSendMsg) && x.LastSendMsg.Contains(ent.Keyword))
                     || (!string.IsNullOrEmpty(x.SFID) && x.SFID.Contains(ent.Keyword)));
                }
                if (ent.IsApproved)
                {
                    query = query.Where(x => x.IsApproved == true);
                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;


                var ThongKeTrangThai = ent.ID.HasValue ? db.vw_ChatZaloRequestSummary.FirstOrDefault(x => x.ID == ent.ID) : null;


                var Data = query.OrderBy(x => x.MobilePhone).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var queryChiTietTrangThai = $"select LastSendCode[Code], ISNULL(LastSendMsg,N'None')[Msg], Count(1)[Total] from tbl_ChatZaloRequestDetails ";
                queryChiTietTrangThai += ent.ID.HasValue && ent.ID != Guid.Empty ? $" where RequestID='{ent.ID}' " : "";
                queryChiTietTrangThai += " group by RequestID, LastSendCode, LastSendMsg";
                queryChiTietTrangThai += " order by LastSendCode";

                var liChiTietTrangThai = db.Database.SqlQuery<AdminSummaryDetail>(queryChiTietTrangThai).ToList();

                var queryByCheck = $"select LastCheckCode [Code], LastCheckMsg [Msg], Count(1) [Total] from tbl_ChatZaloRequestDetails ";
                queryByCheck += ent.ID.HasValue && ent.ID != Guid.Empty ? $" where RequestID='{ent.ID}' " : "";
                queryByCheck += $" group by LastCheckCode,LastCheckMsg order by LastCheckCode ";
                var liCheck = db.Database.SqlQuery<AdminSummaryDetail>(queryByCheck).ToList();

                var queryBySend = $"select LastSendCode [Code], LastSendMsg [Msg], Count(1) [Total] from tbl_ChatZaloRequestDetails ";
                queryBySend += ent.ID.HasValue && ent.ID != Guid.Empty ? $" where RequestID='{ent.ID}' " : "";
                queryBySend += $" group by LastSendCode,LastSendMsg order by LastSendCode ";
                var liSend = db.Database.SqlQuery<AdminSummaryDetail>(queryBySend).ToList();

                var liRequest = db.vw_ChatZaloRequests.OrderBy(x => x.Name).ToList();
                var rs = new { Data, liRequest, requestInfo, liCheck, liSend, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }
        #endregion



        #endregion


        #region MyRegion

        public static class sqlServer
        {

            public static DataTable Execute(string Query)
            {
                var connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["DBContext"].ToString();

                using (SqlConnection connection = new SqlConnection(connectionString))
                {

                    try
                    {
                        connection.Open();
                        SqlCommand cmd = new SqlCommand(Query, connection);
                        cmd.CommandType = CommandType.Text;
                        SqlDataAdapter da = new SqlDataAdapter(cmd);
                        DataTable dt = new DataTable();
                        da.Fill(dt);

                        int a = cmd.ExecuteNonQuery();
                        connection.Close();
                        return dt;
                    }
                    catch (Exception)
                    {
                        connection.Close();
                        return null;

                    }
                }

            }
        }

        #endregion



        #region API CALL CRM 


        [HttpPost]
        [Route("api/CRM/kiem_tra_yeu_cau_goi")]
        public IHttpActionResult kiem_tra_yeu_cau_goi(AdminEntity ent)
        {

            try
            {

                string output = "", error= "";

                if (ent != null && ent.ID.HasValue)
                {

                    ent.phone_list = new List<string>();

                    var listRequest = db.tbl_ChatZaloRequestDetails.Where(x => x.RequestID == ent.ID).ToList();

                    if (listRequest != null && listRequest.Count() > 0)
                    {
                        ent.phone_list = listRequest.Select(x => x.MobilePhone).ToList();
                    }


                    var access_token = zalo_api.access_token();

                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();
                        var phoneOrg = phone;
                        var input = new { phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone };

                        var zalo = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "GET",
                            url = zalo_api.url_checkconsent + JsonConvert.SerializeObject(input),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        if (!string.IsNullOrEmpty(error))
                        {
                            return Json(new { Error = error });
                        } 
                         
                        var query= $" insert into [dbo].[tbl_ChatZaloRequestProcessing](random_id,phone,output) values(newid(),'{phone}',N'{output}') ";

                        sqlServer.Execute(query); 

                    }

                }
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

            return Json(new { Error = "Try again" });

        }


        [HttpPost]
        [Route("api/CRM/gui_yeu_cau_goi")]
        public IHttpActionResult gui_yeu_cau_goi(AdminEntity ent)
        {

            try
            {
 
                string output = "", error = "";

                if (ent != null && ent.ID.HasValue)
                {

                    ent.phone_list = new List<string>();

                    var listRequest = db.tbl_ChatZaloRequestDetails.Where(x => x.RequestID == ent.ID).ToList();

                    if (listRequest != null && listRequest.Count() > 0)
                    {
                        ent.phone_list = listRequest.Select(x => x.MobilePhone).ToList();
                    }

                    var list_phone_approved = new List<string>();
                    var access_token = zalo_api.access_token();

                    for (int i = 0; i < ent.phone_list.Count(); i++)
                    {
                        var phone = ent.phone_list[i].Trim();

                        //var phone = ent.phone_number.StartsWith("00") ? ent.phone_number.Remove(0, 1) : ent.phone_number;

                        var input = new
                        {
                            phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone,
                            call_type = "audio", /* audio + video + audio_and_video */
                            reason_code = 101
                        };

                        var zalo = new ZaloParams()
                        {
                            access_token = zalo_api.access_token(),
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_requestconsent,
                            input = JsonConvert.SerializeObject(input),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        if (!string.IsNullOrEmpty(error))
                        {
                            return Json(new { Error = error });
                        }


                        var outputJS = JsonConvert.DeserializeObject<AdminEntity.output_msg>(output);


                        if (outputJS.data != null && outputJS.data.expired_time.HasValue)
                        {
                            outputJS.data.expired_time_dt = ConvertNumberToDateTime(outputJS.data.expired_time.Value);
                        }


                        var today = DateTime.Now;
                        var isAdd = false;

                        var consent = db.tbl_ChatZaloRequestDetails.FirstOrDefault(x => x.MobilePhone == phone && x.RequestID == ent.ID);

                        if (consent == null)
                        {
                            consent = new tbl_ChatZaloRequestDetails()
                            {
                                ID = Guid.NewGuid(),
                                MobilePhone = phone,
                                SFID = ent.sf_id,
                            };
                            isAdd = true;
                        }

                        consent.LastSendCode = outputJS.error;
                        consent.LastSendMsg = outputJS.message;
                        consent.LastSendOn = today;

                        //nếu những sđt này có chấp nhận thì gửi check xem bao giờ hết hạn
                        if (outputJS.error.HasValue && IsApprovedCode.Contains(outputJS.error.Value))
                        {
                            list_phone_approved.Add(phone);
                        }

                        if (isAdd) db.tbl_ChatZaloRequestDetails.Add(consent);

                        db.SaveChanges();


                    }

                    if (list_phone_approved.Count > 0)
                    {
                        update_expired_consent(list_phone_approved, ent.ID.Value);
                    }

                }
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }

            return Json(new { Success = Language.EN.alert_update_success });

        }



        //Giá trị	Ý nghĩa
        //0	    User approved the request
        //1	    Already allowed to call
        //2	    Request sent
        //3	    User rejected the request
        //4	    User blocked
        //5	    The number of requests allowed is exceeded, please try again later
        //6	    Insufficient permissions
        //7	    A reason is required to request user consent
        //8	    Waiting for user approval
        //9	    The user has not yet interacted with this OA
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

        public static List<int> IsApprovedCode = new List<int> { 0, 1 };

        public static void update_expired_consent(List<string> list_phone_approved, Guid request_id)
        {
            try
            {
                string output = "", error = "";
                var db = new DBContext();
                for (int i = 0; i < list_phone_approved.Count; i++)
                {
                    var phone = list_phone_approved[i].Trim();

                    var input = new { phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone };

                    var zalo = new ZaloParams()
                    {
                        access_token = zalo_api.access_token(),
                        content_type = "application/json",

                        method = "GET",
                        url = zalo_api.url_checkconsent + JsonConvert.SerializeObject(input),
                    };

                    output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                    if (string.IsNullOrEmpty(error))
                    {
                        var outputJS = JsonConvert.DeserializeObject<AdminEntity.output_msg>(output);

                        if (outputJS.data != null && outputJS.data.expired_time.HasValue)
                        {
                            outputJS.data.expired_time_dt = ConvertNumberToDateTime(outputJS.data.expired_time.Value);
                        }


                        var today = DateTime.Now;

                        var consent = db.tbl_ChatZaloRequestDetails.FirstOrDefault(x => x.MobilePhone == phone && x.RequestID == request_id);
                        if (consent != null)
                        {
                            consent.IsApproved = outputJS.data != null && outputJS.data.expired_time_dt.HasValue ? true : false;
                            consent.ExpiredOn = outputJS.data != null ? outputJS.data.expired_time_dt : null;
                            consent.LastCheckCode = outputJS.error;
                            consent.LastCheckMsg = outputJS.message;
                            consent.LastCheckOn = today;
                        }

                        db.SaveChanges();
                    }
                }

            }
            catch { }
        }

        [HttpPost]
        [Route("api/CRM/gui_yeu_cau_goi_sf")]
        public IHttpActionResult gui_yeu_cau_goi_sf(AdminEntity ent)
        {
            try
            {
                string output = "", error = "";

                if (ent != null && !string.IsNullOrEmpty(ent.phone_number))
                {

                    var phone = ent.phone_number.StartsWith("00") ? ent.phone_number.Remove(0, 1) : ent.phone_number;

                    var input = new
                    {
                        phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone,
                        call_type = "audio", /* audio + video + audio_and_video */
                        reason_code = 101
                    };

                    var zalo = new ZaloParams()
                    {
                        access_token = zalo_api.access_token(),
                        content_type = "application/json",

                        method = "POST",
                        url = zalo_api.url_requestconsent,
                        input = JsonConvert.SerializeObject(input),
                    };

                    output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                    if (!string.IsNullOrEmpty(error))
                    {
                        return Json(new { Error = error });
                    }


                    var outputJS = JsonConvert.DeserializeObject<AdminEntity.output_msg>(output);
                     

                    if (outputJS.data != null && outputJS.data.expired_time.HasValue)
                    {
                        outputJS.data.expired_time_dt = ConvertNumberToDateTime(outputJS.data.expired_time.Value);
                    }


                    var today = DateTime.Now;
                    var isAdd = false;
                    var consent = db.tbl_ChatZaloRequestDetails.FirstOrDefault(x => x.MobilePhone == phone && !x.RequestID.HasValue);

                    if (consent == null)
                    {
                        consent = new tbl_ChatZaloRequestDetails()
                        {
                            ID = Guid.NewGuid(),
                            MobilePhone = phone,
                            SFID = ent.sf_id,
                        };
                        isAdd = true;
                    }

                    consent.LastSendCode = outputJS.error;
                    consent.LastSendMsg = outputJS.message;
                    consent.LastSendOn = today;

                    if (isAdd) db.tbl_ChatZaloRequestDetails.Add(consent);

                    db.SaveChanges();


                    return Json(consent);
                }
                return Json(new { Error = Language.VN.alert_try_again });
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

        #endregion





        #region Authen


        [HttpPost]
        [Route("api/Admin/Login")]
        public IHttpActionResult Login(AdminEntity ent)
        {
            try
            {

                if (ent != null && !string.IsNullOrEmpty(ent.US) && !string.IsNullOrEmpty(ent.PW))
                {

                    var passMD5 = GetMd5Hash(ent.PW);

                    var user = db.tbl_User.FirstOrDefault(x => x.Username == ent.US && x.Password == passMD5 && x.IsActive == true);
                    if (user != null)
                    {
                        user.LastLoginDate = DateTime.Now;
                        db.SaveChanges();
                        db = new DBContext();
                        user = db.tbl_User.FirstOrDefault(x => x.Username == ent.US);
                        return Json(new { Data = user });
                    }
                    else
                    {
                        return Json(new { Error = "Tài khoản hoặc mật khẩu không đúng" });
                    }

                }

                return Json(new { });
            }
            catch (Exception ex)
            {

                return Json(new { Error = ex.Message });
            }
        }

        public static string GetMd5Hash(string input)
        {
            MD5 md5Hash = MD5.Create();
            byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

            StringBuilder sBuilder = new StringBuilder();

            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            return sBuilder.ToString();
        }

        #endregion





        #region call list export 


        public string ExportToExcelFile(DataTable DT)
        {
            if (DT != null)
            {
                var base64 = "";

                var memoryStream = new MemoryStream();

                using (var excelPackage = new ExcelPackage(memoryStream))
                {
                    var worksheet = excelPackage.Workbook.Worksheets.Add("Sheet1");
                    worksheet.Cells["A1"].LoadFromDataTable(DT, true, TableStyles.Medium27); /*Load Datatable to Excel*/

                    /* Set style */
                    worksheet.Row(1).Style.Font.Bold = true;
                    worksheet.Row(1).Style.Font.Size = 13;
                    worksheet.Row(1).Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Row(1).Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                    /* Set column size */
                    worksheet.Cells.AutoFitColumns();

                    base64 = Convert.ToBase64String(excelPackage.GetAsByteArray()); /* Convert to base 64 */
                }

                var mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return $"data:{mimeType};base64,{base64}";

            }

            return "";
        }
 

        [HttpPost]
        [Route("api/Admin/CallListView1")]
        public IHttpActionResult CallListView1(AdminEntity ent)
        {

            try
            {
                double TotalPages = 1;

                var TotalRecords = 0;

                var callListDate = ent.CallListDate.HasValue ? ent.CallListDate.Value.Date : DateTime.Now.Date;


                var query = from x in db.vw_CallListDetails where x.CallListDate == callListDate select x;

                if (ent.CallListID.HasValue && ent.CallListID.Value != Guid.Empty)
                {
                    query = query.Where(x => x.CallListId == ent.CallListID);
                }
                if (ent.IsExport)
                {

                    var DT = new DataTable();
                    DT.Columns.AddRange(new DataColumn[] {
                        new DataColumn("Call List Date"),
                        new DataColumn("Call List"),
                        new DataColumn("Priority"),

                        new DataColumn("Cust.Salesforce ID"),
                        new DataColumn("Cust.Full Name"),
                        new DataColumn("Cust.Phone"),
                        new DataColumn("Cust.Address"),
                        new DataColumn("Cust.Birth Date"),
                        new DataColumn("Task Subject"),

                        new DataColumn("Call Ring"),
                        new DataColumn("Call Connect"),
                        new DataColumn("Call End"),
                        new DataColumn("Call Last Try"),
                        new DataColumn("IVR Disconnected Reason")
                    });

                    foreach (var item in query)
                    {
                        DT.Rows.Add(
                            item.CallListDate,
                            item.CallListName,
                            item.Priority,

                            item.CusSFId,
                            item.CusFullName,
                            item.CusMobilePhone,
                            item.CusAddress,
                            item.CusBirthDate,
                            item.TaskSubject,

                            item.CallRing,
                            item.CallConnect,
                            item.CallEnd,
                            item.CallLastTry,
                            item.IVRDisconnectedReason);
                    }

                    var fileSrc = ExportToExcelFile(DT);

                    var fileName = $"Call List Detail {callListDate.ToString("dd_MM_yyyy")}.xlsx";

                    return Json(new { fileSrc, fileName });

                }

                ent.PageIndex = ent.PageIndex == 0 ? 1 : ent.PageIndex;

                TotalRecords = query.Count();

                TotalPages = (double)TotalRecords / (double)ent.PageSize;

                TotalPages = (TotalPages % 1) >= 0.01 ? (int)TotalPages + 1 : (int)TotalPages;

                ent.PageIndex = (int)TotalPages > 0 && ent.PageIndex > (int)TotalPages ? (int)TotalPages : ent.PageIndex;

                var Data = query.OrderBy(x => x.CusSFId).Skip((ent.PageIndex - 1) * ent.PageSize).Take(ent.PageSize).ToList();

                var today = DateTime.Now.Date;

                var CallList = db.tbl_CallList.Where(x => x.LastLoadDataTime >= today).OrderBy(x => x.Subject).ToList();

                var rs = new { Data, CallList, Paging = new { ent.PageIndex, ent.PageSize, TotalPages, TotalRecords } };

                return Json(rs);
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }
        
        [HttpPost]
        [Route("api/Admin/CallListView")]
        public IHttpActionResult CallListView(AdminEntity ent)
        {

            try
            { 
                 
                var callListDate = ent.CallListDate.HasValue ? ent.CallListDate.Value.Date : DateTime.Now.Date;


                string viewName = "vw_CallListDetails";

                string orderBy = "ORDER BY CallListName";

                var whereClause = ent.CallListID.HasValue && ent.CallListID.Value != Guid.Empty ?
                                    $" WHERE CallListId='{ent.CallListID}' " : "";

                whereClause += (string.IsNullOrEmpty(whereClause) ? " WHERE " : " AND ")
                            + $" CallListDate='{callListDate.ToString("yyyy-MM-dd")}' ";


                var queryTable = $"SELECT * FROM {viewName} {whereClause} {orderBy} ";

                if (!ent.IsExport)
                    queryTable += $"OFFSET ({ent.PageIndex}-1)*{ent.PageSize} ROWS FETCH NEXT {ent.PageSize} ROW ONLY";


                var queryTotal = $"SELECT COUNT(1) FROM {viewName} {whereClause} ";

                ent.TotalRecords = db.Database.SqlQuery<int>(queryTotal).FirstOrDefault();

                double TotalPages = (double)ent.TotalRecords / (double)ent.PageSize;

                ent.TotalPages = TotalPages % ent.PageSize > 0 ? (int)TotalPages + 1 : (int)TotalPages;


                var DT = new DataTable(); (new SqlDataAdapter(queryTable, db.Database.Connection.ConnectionString)).Fill(DT);

                if (ent.IsExport)
                {
                    var DTExport = new DataTable();

                    DTExport.Columns.AddRange(new DataColumn[] {
                        new DataColumn("Call List Date"),
                        new DataColumn("Call List"),
                        new DataColumn("Priority"),

                        new DataColumn("Cust.Salesforce ID"),
                        new DataColumn("Cust.Full Name"),
                        new DataColumn("Cust.Phone"),
                        new DataColumn("Cust.Address"),
                        new DataColumn("Cust.Birth Date"),
                        new DataColumn("Task Subject"),

                        new DataColumn("Call Ring"),
                        new DataColumn("Call Connect"),
                        new DataColumn("Call End"),
                        new DataColumn("Call Last Try"),
                        new DataColumn("IVR Disconnected Reason")
                    });

                    for (int i = 0; i < DT.Rows.Count; i++)
                    {

                        DTExport.Rows.Add(
                            DT.Rows[i]["CallListDate"],
                            DT.Rows[i]["CallListName"],
                            DT.Rows[i]["Priority"],

                            DT.Rows[i]["CusSFId"],
                            DT.Rows[i]["CusFullName"],
                            DT.Rows[i]["CusMobilePhone"],
                            DT.Rows[i]["CusAddress"],
                            DT.Rows[i]["CusBirthDate"],
                            DT.Rows[i]["TaskSubject"],

                            DT.Rows[i]["CallRing"],
                            DT.Rows[i]["CallConnect"],
                            DT.Rows[i]["CallEnd"],
                            DT.Rows[i]["CallLastTry"],
                            DT.Rows[i]["IVRDisconnectedReason"]);

                    }

                    var fileSrc = ExportToExcelFile(DTExport);

                    var fileName = $"Call List Detail {callListDate.ToString("dd_MM_yyyy")}.xlsx";

                    return Json(new { fileSrc, fileName });

                }


                var today = DateTime.Now.Date;

                var CallList = db.tbl_CallList.Where(x => x.LastLoadDataTime >= today).OrderBy(x => x.Subject).ToList();

                var rs = new { Data = DT, CallList, Paging = new { ent.PageIndex, ent.PageSize, ent.TotalPages, ent.TotalRecords } };

                return Json(rs);
            }
            catch (Exception ex)
            {
                return Json(new { Error = ex.Message });
            }
        }

        #endregion

    }

}