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

namespace FCVZalo.Controllers.ChatZalo
{
    public class ChatZaloIntermediaryController : ApiController
    {
        DBContext db = new DBContext();

        #region Common
        public static class zalo_api
        {

            public static string url_send_message = "https://openapi.zalo.me/v2.0/oa/message";
            public static string url_upload_image = "https://openapi.zalo.me/v2.0/oa/upload/image";
            public static string url_upload_file = "https://openapi.zalo.me/v2.0/oa/upload/file";
            public static string url_remove_tag = "https://openapi.zalo.me/v2.0/oa/tag/rmfollowerfromtag";
            public static string url_add_tag = "https://openapi.zalo.me/v2.0/oa/tag/tagfollower";

            public static string access_token()
            {
                DBContext db = new DBContext();
                return db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "access_token")?.value;
            }

        }
        #endregion

        #region Intermediary Send Message
        [HttpPost]
        [Route("api/ChatZalo/Intermediary/SendMessages")]

        public IHttpActionResult sendMessages(IntermediarySendMessages parameters)
        {
            string output = "";
            string error = "";
            try
            {
                var msgDetail = new tbl_ChatZaloMessageDetails();
                var msgDetailID = Guid.NewGuid();

                var imageURL = "";
                var access_token = zalo_api.access_token();

                switch (parameters.typeMessage)
                {
                    case "text":
                        var bodyText = new
                        {
                            recipient = new { user_id = parameters.followerIDZalo },
                            message = new { text = parameters.messageContent }
                        };

                        var zaloText = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_send_message,
                            input = JsonConvert.SerializeObject(bodyText),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zaloText, ref error);

                        var bodyTextFormat = JsonConvert.SerializeObject(bodyText);

                        // Save raw data
                        msgDetail.ID = msgDetailID;
                        msgDetail.Request = bodyTextFormat;
                        msgDetail.Response = null;

                        break;

                    case "link":
                        imageURL = "http://photo-link-talk.zadn.vn/photolinkv2/720/aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9pbWFnZXMvYnJhbmRpbmcvZ29vZ2xlZy8xeC9nb29nbGVnX3N0YW5kYXJkX2NvbG9yXzEyOGRwLnBuZw==";

                        var bodyLink = new
                        {
                            recipient = new { user_id = parameters.followerIDZalo },
                            message = new
                            {
                                attachment = new
                                {
                                    type = "template",
                                    payload = new
                                    {
                                        template_type = "list",
                                        elements = new[] {
                                            new {
                                                title = parameters.messageContent,
                                                subtitle = "Liên kết được chia sẻ",
                                                image_url = imageURL,
                                                default_action = new {
                                                    type = "oa.open.url",
                                                    url = parameters.messageContent
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };

                        var zaloLink = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_send_message,
                            input = JsonConvert.SerializeObject(bodyLink),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zaloLink, ref error);

                        var bodyLinkFormat = JsonConvert.SerializeObject(bodyLink);

                        // Save raw data
                        msgDetail.ID = msgDetailID;
                        msgDetail.Request = bodyLinkFormat;
                        msgDetail.Response = null;

                        break;

                    case "image":
                        var bodyImage = new
                        {
                            recipient = new { user_id = parameters.followerIDZalo },
                            message = new
                            {
                                attachment = new
                                {
                                    type = "template",
                                    payload = new
                                    {
                                        template_type = "media",
                                        elements = new[] {
                                            new {
                                                media_type = "image",
                                                attachment_id = parameters.messageContent
                                            }
                                        }
                                    }
                                }
                            }
                        };

                        var zaloImage = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_send_message,
                            input = JsonConvert.SerializeObject(bodyImage),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zaloImage, ref error);

                        var bodyImageFormat = JsonConvert.SerializeObject(bodyImage);

                        // Save raw data
                        msgDetail.ID = msgDetailID;
                        msgDetail.Request = bodyImageFormat;
                        msgDetail.Response = null;

                        break;

                    case "file":
                        var bodyFile = new
                        {
                            recipient = new { user_id = parameters.followerIDZalo },
                            message = new
                            {
                                attachment = new
                                {
                                    type = "file",
                                    payload = new
                                    {
                                        token = parameters.messageContent
                                    }
                                }
                            }
                        };

                        var zaloFile = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_send_message,
                            input = JsonConvert.SerializeObject(bodyFile),
                        };

                        output = DAO.DAOZalo.API_Intermadiary(zaloFile, ref error);

                        var bodyFileFormat = JsonConvert.SerializeObject(bodyFile);

                        // Save raw data
                        msgDetail.ID = msgDetailID;
                        msgDetail.Request = bodyFileFormat;
                        msgDetail.Response = null;

                        break;
                };

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);
                    var errorRS = jsonConvert["error"].Value<string>();

                    if (errorRS == "0")
                    {
                        var msgId = jsonConvert["data"]["message_id"].Value<string>();
                        var userId = jsonConvert["data"]["user_id"].Value<string>();

                        msgDetail.MessageID = msgId;
                        msgDetail.UserID = userId;
                        msgDetail.CreatedOn = DateTime.Now;
                        msgDetail.CreatedBy = Guid.Empty;
                        msgDetail.ModifiedOn = DateTime.Now;
                        msgDetail.ModifiedBy = Guid.Empty;

                        db.tbl_ChatZaloMessageDetails.Add(msgDetail);
                        db.SaveChanges();

                        var oa = db.tbl_ChatZaloOAInfo.FirstOrDefault();

                        var rs = new
                        {
                            data = new
                            {
                                messageContent = parameters.messageContent,
                                time = DateTime.Now,
                                oaName = oa.DisplayName,
                                oaAvatar = oa.Avatar,
                                imageURL = imageURL
                            },
                            code = CodeMess.Code.Success
                        };
                        return Json(rs);
                    }
                    else
                    {
                        var msgError = jsonConvert["message"].Value<string>();

                        var rs = new
                        {
                            code = CodeMess.Code.Exception,
                            messVN = msgError
                        };
                        return Json(rs);
                    }
                }
                else {
                    var rs = new
                    {
                        code = CodeMess.Code.Exception,
                        messVN = Language.VN.alert_Exception
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

        #region Intermediary Upload Image
        [HttpPost]
        [Route("api/ChatZalo/Intermediary/Upload/Image")]

        public IHttpActionResult uploadImage()
        {
            string output = "";
            string error = "";
            try
            {
                var access_token = zalo_api.access_token();

                var file_path = System.Web.HttpContext.Current.Server.MapPath("~/File");
                if (!System.IO.Directory.Exists(file_path))
                    System.IO.Directory.CreateDirectory(file_path);

                System.Web.HttpPostedFile file_info = System.Web.HttpContext.Current.Request.Files[0];

                file_path = Path.Combine(file_path, Guid.NewGuid().ToString() + file_info.FileName);

                file_info.SaveAs(file_path);

                var zalo = new ZaloParams()
                {
                    isAttach = true,
                    isImage = true,
                    access_token = zalo_api.access_token(),
                    file_base = Convert.ToBase64String(File.ReadAllBytes(file_path)),
                    file_name = file_info.FileName,
                    file_type = file_info.ContentType
                };

                output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var attachmentId = "";
                    var errorRS = jsonConvert["error"].Value<string>();
                    var messageError = jsonConvert["message"].Value<string>();

                    if (errorRS == "0")
                    {
                        attachmentId = jsonConvert["data"]["attachment_id"].Value<string>();
                    }

                    var rsNew = new
                    {
                        data = attachmentId,
                        code = errorRS,
                        messVN = messageError
                    };
                    return Json(rsNew);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Exception,
                        messVN = Language.VN.alert_Exception
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

        #region Intermediary Upload File
        [HttpPost]
        [Route("api/ChatZalo/Intermediary/Upload/File")]

        public IHttpActionResult uploadFile()
        {
            string output = "";
            string error = "";
            try
            {
                var access_token = zalo_api.access_token();

                var file_path = System.Web.HttpContext.Current.Server.MapPath("~/File");
                if (!System.IO.Directory.Exists(file_path))
                    System.IO.Directory.CreateDirectory(file_path);

                System.Web.HttpPostedFile file_info = System.Web.HttpContext.Current.Request.Files[0];

                file_path = Path.Combine(file_path, Guid.NewGuid().ToString() + file_info.FileName);

                file_info.SaveAs(file_path);

                var zalo = new ZaloParams()
                {
                    isAttach = true,
                    //isImage = true,
                    access_token = zalo_api.access_token(),
                    file_base = Convert.ToBase64String(File.ReadAllBytes(file_path)),
                    file_name = file_info.FileName,
                    file_type = file_info.ContentType
                };

                output = DAO.DAOZalo.API_Intermadiary(zalo, ref error);

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var tokenNew = "";
                    var errorRS = jsonConvert["error"].Value<string>();
                    var messageError = jsonConvert["message"].Value<string>();

                    if (errorRS == "0")
                    {
                        tokenNew = jsonConvert["data"]["token"].Value<string>();
                    }

                    var rsNew = new
                    {
                        data = tokenNew,
                        code = errorRS,
                        messVN = messageError
                    };
                    return Json(rsNew);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Exception,
                        messVN = Language.VN.alert_Exception
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

        #region Intermediary Update Tag Done
        [HttpPost]
        [Route("api/ChatZalo/Intermediary/UpdateTagDone")]

        public IHttpActionResult updateTag(IntermediarySendMessages parameters)
        {
            string output = "";
            string outputNew = "";
            string error = "";
            try
            {
                var access_token = zalo_api.access_token();

                var bodyText = new
                {
                    user_id = parameters.followerIDZalo,
                    tag_name = "Đang xử lý"
                };

                var zaloText = new ZaloParams()
                {
                    access_token = access_token,
                    content_type = "application/json",

                    method = "POST",
                    url = zalo_api.url_remove_tag,
                    input = JsonConvert.SerializeObject(bodyText),
                };

                output = DAO.DAOZalo.API_Intermadiary(zaloText, ref error);

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);
                    var errorRS = jsonConvert["error"].Value<string>();

                    if (errorRS == "0")
                    {
                        var bodyTextNew = new
                        {
                            user_id = parameters.followerIDZalo,
                            tag_name = "Hoàn thành"
                        };

                        var zaloTextNew = new ZaloParams()
                        {
                            access_token = access_token,
                            content_type = "application/json",

                            method = "POST",
                            url = zalo_api.url_add_tag,
                            input = JsonConvert.SerializeObject(bodyTextNew),
                        };

                        outputNew = DAO.DAOZalo.API_Intermadiary(zaloTextNew, ref error);

                        if (outputNew != "" && outputNew != null)
                        {
                            var jsonConvertNew = (JObject)JsonConvert.DeserializeObject(outputNew);
                            var errorNew = jsonConvertNew["error"].Value<string>();

                            if (errorNew == "0")
                            {
                                var rs = new
                                {
                                    code = CodeMess.Code.Success,
                                    messVN = Language.VN.alert_update_success
                                };
                                return Json(rs);
                            }
                            else
                            {
                                var msgErrorNew = jsonConvertNew["message"].Value<string>();

                                var rs = new
                                {
                                    code = CodeMess.Code.Exception,
                                    messVN = msgErrorNew
                                };
                                return Json(rs);
                            }
                        }
                        else {
                            var rs = new
                            {
                                code = CodeMess.Code.Exception,
                                messVN = Language.VN.alert_Exception
                            };
                            return Json(rs);
                        }
                    }
                    else
                    {
                        var msgError = jsonConvert["message"].Value<string>();

                        var rs = new
                        {
                            code = CodeMess.Code.Exception,
                            messVN = msgError
                        };
                        return Json(rs);
                    }
                }
                else {
                    var rs = new
                    {
                        code = CodeMess.Code.Exception,
                        messVN = Language.VN.alert_Exception
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
