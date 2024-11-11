using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using FCVZalo.Models.EntityModels;
using Newtonsoft.Json;
using FCVZalo.Models.CustomModels;
using FCVZalo.DAO;
using System.Web;
using System.IO;
using RestSharp;
using Newtonsoft.Json.Linq;
using static FCVZalo.Controllers.AdminController;
using static FCVZalo.DAO.Language;
using System.Security.Policy;

namespace FCVZalo.Controllers.ChatZalo
{
    public class ChatZaloUsersController : ApiController
    {
        DBContext db = new DBContext();

        #region Common
        public static class zalo_api
        {

            public static string url_check_consent = "https://openapi.zalo.me/v2.0/oa/call/checkconsent?data={phone:";
            public static string url_request_consent = "https://openapi.zalo.me/v2.0/oa/call/requestconsent";

            public static string access_token()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "access_token")?.value;
            }

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

        #region OA: Create 
        [HttpPost]
        [Route("api/ChatZalo/OA/Create")]

        public IHttpActionResult createOA(tbl_ChatZaloOAInfo entity) {
            try
            {
                var item = new tbl_ChatZaloOAInfo();

                var oa = db.tbl_ChatZaloOAInfo.FirstOrDefault();

                // Check Zalo OA exist or not
                if (oa == null) 
                {
                    // Create a new one
                    item.ID = entity.ID;
                    item.DisplayName = entity.DisplayName;
                    item.Description = entity.Description;
                    item.Avatar = entity.Avatar;
                    item.CoverImage = entity.CoverImage;
                    item.IsVerified = entity.IsVerified;
                    item.CreatedOn = DateTime.Now;
                    item.CreatedBy = Guid.Empty;
                    item.ModifiedOn = DateTime.Now;
                    item.ModifiedBy = Guid.Empty;

                    db.tbl_ChatZaloOAInfo.Add(item);

                    db.SaveChanges();

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_create_success
                    };

                    return Json(rs);
                }
                else {

                    // Update
                    oa.DisplayName = entity.DisplayName;
                    oa.Description = entity.Description;
                    oa.Avatar = entity.Avatar;
                    oa.CoverImage = entity.CoverImage;
                    oa.IsVerified = entity.IsVerified;
                    oa.ModifiedOn = DateTime.Now;
                    oa.ModifiedBy = Guid.Empty;

                    db.SaveChanges();

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_update_success
                    };

                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region OA: Get OA Information
        [HttpGet]
        [Route("api/ChatZalo/OA/GetInformation")]

        public IHttpActionResult getOAInformation() {
            try
            {
                var oa = db.tbl_ChatZaloOAInfo.FirstOrDefault();
                if (oa != null)
                {
                    var rs = new
                    {
                        data = oa,
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
               
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region User: Create
        [HttpPost]
        [Route("api/ChatZalo/User/Create")]

        public IHttpActionResult createFollower(vw_ChatZaloUsers entity)
        {
            try
            {
                var itemFollower = new tbl_ChatZaloUsers();
                var itemShared = new tbl_ChatZaloSharedInfo();
                var itemTagsAndNotes = new tbl_ChatZaloTagsAndNotes();

                var sharedID = Guid.NewGuid();
                var tagsAndNotesID = Guid.NewGuid();

                var follower = db.tbl_ChatZaloUsers.FirstOrDefault(x => x.UserID == entity.UserID);

                if (follower == null)
                {
                    // If Follower not existed --> Create a new one
                    itemFollower.UserID = entity.UserID;
                    itemFollower.DisplayName = entity.DisplayName;
                    itemFollower.UserGender = entity.UserGender;
                    itemFollower.UserIDByApp = entity.UserIDByApp;
                    itemFollower.AvatarDefaultApp = entity.AvatarDefaultApp;
                    itemFollower.BirthDate = entity.BirthDate;
                    itemFollower.IsFollower = entity.IsFollower;
                    itemFollower.LastMessage = null;
                    itemFollower.TypeLastMessage = null;
                    itemFollower.LastTimeMessage = null;
                    itemFollower.CreatedOn = DateTime.Now;
                    itemFollower.CreatedBy = Guid.Empty;
                    itemFollower.ModifiedOn = null;
                    itemFollower.ModifiedBy = Guid.Empty;

                    // Shared Info
                    itemShared.ID = sharedID;
                    itemShared.UserID = entity.UserID;
                    itemShared.Name = entity.Name;
                    itemShared.PhoneNumber = entity.PhoneNumber;
                    itemShared.Ward = entity.Ward;
                    itemShared.District = entity.District;
                    itemShared.City = entity.City;
                    itemShared.Address = entity.Address;

                    // Tags and Notes Info
                    itemTagsAndNotes.ID = tagsAndNotesID;
                    itemTagsAndNotes.UserID = entity.UserID;
                    itemTagsAndNotes.TagsName = entity.TagsName;
                    itemTagsAndNotes.Notes = entity.Notes;

                    db.tbl_ChatZaloUsers.Add(itemFollower);
                    db.tbl_ChatZaloSharedInfo.Add(itemShared);
                    db.tbl_ChatZaloTagsAndNotes.Add(itemTagsAndNotes);

                    db.SaveChanges();

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_create_success
                    };

                    return Json(rs);
                }
                else {
                    var followerShared = db.tbl_ChatZaloSharedInfo.FirstOrDefault(x => x.UserID == follower.UserID);
                    var followerTagsAndNotes = db.tbl_ChatZaloTagsAndNotes.FirstOrDefault(x => x.UserID == follower.UserID);

                    // If Follower existed --> Update
                    follower.DisplayName = entity.DisplayName;
                    follower.UserGender = entity.UserGender;
                    follower.AvatarDefaultApp = entity.AvatarDefaultApp;
                    follower.BirthDate = entity.BirthDate;
                    follower.IsFollower = entity.IsFollower;

                    // Shared Info
                    followerShared.Name = entity.Name;
                    followerShared.PhoneNumber = entity.PhoneNumber;
                    followerShared.Ward = entity.Ward;
                    followerShared.District = entity.District;
                    followerShared.City = entity.City;
                    followerShared.Address = entity.Address;

                    // Tags and Notes Info
                    followerTagsAndNotes.TagsName = entity.TagsName;
                    followerTagsAndNotes.Notes = entity.Notes;

                    db.SaveChanges();

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_update_success
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region User: Get All 
        [HttpPost]
        [Route("api/ChatZalo/User/GetAll")]

        public IHttpActionResult getAllUser(ParameterModel parameters)
        {
            try
            {
                if (parameters.type == 1)
                {
                    var conversations = db.vw_ChatZaloUsers
                               .Where(x => (x.TagsName != "Hoàn thành")
                               && ((x.DisplayName.Contains(parameters.keySearch))
                               || (x.Name.Contains(parameters.keySearch))
                               || (x.PhoneNumber.Contains(parameters.keySearch))
                               || (x.TagsName.Contains(parameters.keySearch))
                               || (x.Notes.Contains(parameters.keySearch))
                               || (x.LastMessage.Contains(parameters.keySearch))))
                               .OrderByDescending(x => x.LastTimeMessage)
                               .ToList();

                    if (conversations.Count > 0 && conversations != null)
                    {
                        var count = conversations.Count();
                        int TotalCount = count;
                        int CurrentPage = parameters.pageIndex;
                        int PageSize = parameters.pageSize;
                        int TotalPages = (int)Math.Ceiling(count / (double)PageSize);
                        var items = conversations.Skip((CurrentPage - 1) * PageSize).Take(PageSize).ToList();

                        var rs = new
                        {
                            data = items,
                            paging = new
                            {
                                PageIndex = CurrentPage,
                                PageSize = PageSize,
                                TotalRecords = TotalCount,
                                TotalPages = TotalPages,
                            },
                            code = CodeMess.Code.Success
                        };
                        return Json(rs);
                    }
                    else
                    {
                        var rs = new
                        {
                            code = CodeMess.Code.Invalid_Data,
                            messVN = Language.VN.alert_notFoundData
                        };
                        return Json(rs);
                    }
                }
                else
                {
                    var conversations = db.vw_ChatZaloUsers
                               .Where(x => (x.TagsName == "Hoàn thành")
                               && ((x.DisplayName.Contains(parameters.keySearch))
                               || (x.Name.Contains(parameters.keySearch))
                               || (x.PhoneNumber.Contains(parameters.keySearch))
                               || (x.TagsName.Contains(parameters.keySearch))
                               || (x.Notes.Contains(parameters.keySearch))
                               || (x.LastMessage.Contains(parameters.keySearch))))
                               .OrderByDescending(x => x.LastTimeMessage)
                               .ToList();

                    if (conversations.Count > 0 && conversations != null)
                    {
                        var count = conversations.Count();
                        int TotalCount = count;
                        int CurrentPage = parameters.pageIndex;
                        int PageSize = parameters.pageSize;
                        int TotalPages = (int)Math.Ceiling(count / (double)PageSize);
                        var items = conversations.Skip((CurrentPage - 1) * PageSize).Take(PageSize).ToList();

                        var rs = new
                        {
                            data = items,
                            paging = new
                            {
                                PageIndex = CurrentPage,
                                PageSize = PageSize,
                                TotalRecords = TotalCount,
                                TotalPages = TotalPages,
                            },
                            code = CodeMess.Code.Success
                        };
                        return Json(rs);
                    }
                    else
                    {
                        var rs = new
                        {
                            code = CodeMess.Code.Invalid_Data,
                            messVN = Language.VN.alert_notFoundData
                        };
                        return Json(rs);
                    }
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region User: Update Status Of Last Message
        [HttpPost]
        [Route("api/ChatZalo/User/UpdateStatusOfLastMsg")]

        public IHttpActionResult updateFollower(vw_ChatZaloUsers entity)
        {
            try
            {
                var follower = db.vw_ChatZaloUsers
                    .FirstOrDefault(x => x.UserID == entity.UserID);

                if (follower != null)
                {
                    follower.LastMessage = entity.LastMessage;
                    follower.TypeLastMessage = entity.TypeLastMessage;
                    follower.LastTimeMessage = entity.LastTimeMessage;

                    db.SaveChanges();

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_update_success
                    };
                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_ID,
                        messVN = Language.VN.alert_id_does_not_exist
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Get User For Check Consent
        [HttpGet]
        [Route("api/ChatZalo/User/GetListUserForCheckConsent")]

        public IHttpActionResult getListUserForCheckConsent()
        {
            string output = "";
            string error = "";
            try
            {
                var users = db.Database
                   .SqlQuery<vw_ChatZaloRequestDetails>($" SELECT * FROM [vw_ChatZaloRequestDetails] WHERE ISNULL(IsActive,0)=1 and CAST(SendOn AS DATE)=CAST(GETDATE() AS DATE) ")
                   .ToList();

                if (users.Count() > 0 && users != null)
                {

                    var access_token = zalo_api.access_token();

                    foreach (var item in users)
                    {
                        string text = item.MobilePhone;
                        string replacement = "84";
                        string result = replacement + text.Substring(1);

                        var zalo = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "GET",
                            url = zalo_api.url_check_consent + result + "}",
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                        var errorNew = jsonConvert["error"].Value<int>();
                        var msg = jsonConvert["message"].Value<string>();

                        var updateUser = db.tbl_ChatZaloRequestDetails
                            .FirstOrDefault(x =>
                            (x.RequestID == item.RequestID)
                            && (x.MobilePhone == item.MobilePhone));

                        if (errorNew == 0)
                        {
                            var expired_time = jsonConvert["data"]["expired_time"].Value<long>();

                            updateUser.IsApproved = true;
                            updateUser.ExpiredOn = ConvertNumberToDateTime(expired_time);
                            updateUser.LastCheckOn = DateTime.Now;
                            updateUser.LastCheckCode = errorNew;
                            updateUser.LastCheckMsg = msg;

                            db.SaveChanges();
                        }
                        else
                        {
                            updateUser.LastCheckOn = DateTime.Now;
                            updateUser.LastCheckCode = errorNew;
                            updateUser.LastCheckMsg = msg;

                            db.SaveChanges();
                        }
                    }

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_update_success
                    };
                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Get User For Request Consent
        [HttpGet]
        [Route("api/ChatZalo/User/GetListUserForRequestConsent")]

        public IHttpActionResult requestConsent()
        {
            string output = "", error = "";

            try
            {
                var users = db.Database
                   .SqlQuery<vw_ChatZaloRequestSend>($" SELECT * FROM [dbo].[vw_ChatZaloRequestSend] ")
                   .ToList();

                if (users.Count() > 0 && users != null)
                {
                    var list_phone_approved = new List<string>();
                    var access_token = zalo_api.access_token();

                    foreach (var item in users)
                    {
                        string text = item.MobilePhone;
                        string replacement = "84";
                        string result = replacement + text.Substring(1);

                        var input = new
                        {
                            phone = result,
                            call_type = "audio",
                            reason_code = 101
                        };

                        var zalo = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_request_consent,
                            input = JsonConvert.SerializeObject(input),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                        var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                        var errorNew = jsonConvert["error"].Value<int>();
                        var msg = jsonConvert["message"].Value<string>();

                        var updateUser = db.tbl_ChatZaloRequestDetails
                            .FirstOrDefault(x =>
                            (x.RequestID == item.RequestID)
                            && (x.MobilePhone == item.MobilePhone));

                        updateUser.LastSendOn = DateTime.Now;
                        updateUser.LastSendCode = errorNew;
                        updateUser.LastSendMsg = msg;

                        db.SaveChanges();


                        //nếu những sđt này có chấp nhận thì gửi check xem bao giờ hết hạn
                        if (AdminController.IsApprovedCode.Contains(errorNew))
                        {
                            list_phone_approved = new List<string> { result };
                            AdminController.update_expired_consent(list_phone_approved, item.RequestID);
                        }

                    }


                    var rs = new
                    {
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }

        }
        #endregion
    }
}
