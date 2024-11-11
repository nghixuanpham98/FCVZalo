using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;

namespace FCVZalo.Controllers.ChatZalo
{
    public class ZaloController : ApiController
    {

        [HttpPost]
        [Route("api/Zalo")]

        public IHttpActionResult CallZaloAPI(ZaloParams zalo)
        {
            string output = "";

            try
            {
                if (zalo != null)
                {
                    var req = (HttpWebRequest)WebRequest.Create(zalo.url);
                    req.Headers.Set("access_token", zalo.access_token);
                    req.Method = zalo.method;
                    req.ContentType = zalo.content_type;

                    if (!string.IsNullOrEmpty(zalo.input))
                    {
                        using (var streamWriter = new StreamWriter(req.GetRequestStream()))
                        {
                            streamWriter.Write(zalo.input);
                        }
                    }

                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                                  | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                    ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                    using (var response1 = req.GetResponse())
                    {
                        using (var reader = new StreamReader(response1.GetResponseStream()))
                        {
                            output = reader.ReadToEnd();
                        }
                    }
                    WriteLog(output);
                }

                return Json(output);

            }
            catch (Exception ex)
            {
                WriteLog(ex, true);
                return Json(new { Error = ex.Message, Error_Type = "Exception" });
            }

        }



        [HttpPost]
        [Route("api/ZaloFile")]

        public IHttpActionResult ZaloFile(ZaloParams zalo)
        {
            string output = "";

            try
            {
                if (zalo != null)
                {

                    if (!System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/File")))
                        System.IO.Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/File"));

                    var FilePath = Path.Combine(HttpContext.Current.Server.MapPath("~/File"), Guid.NewGuid() + zalo.file_name);

                    System.IO.File.WriteAllBytes(FilePath, Convert.FromBase64String(zalo.file_base));

                    string boundary = "---------------------------" + DateTime.Now.Ticks.ToString("x");
                    byte[] boundarybytes = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "\r\n");

                    var wrCreate = zalo.isImage == true
                        ? "https://openapi.zalo.me/v2.0/oa/upload/image"
                        : "https://openapi.zalo.me/v2.0/oa/upload/file";

                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(wrCreate);

                    request.Headers.Set("access_token", zalo.access_token);
                    request.ContentType = "multipart/form-data; boundary=" + boundary;
                    request.Method = "POST";

                    Stream rs = request.GetRequestStream();

                    rs.Write(boundarybytes, 0, boundarybytes.Length);

                    string headerTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\n\r\n";
                    string header = string.Format(headerTemplate, "file", FilePath, zalo.file_type);
                    byte[] headerbytes = System.Text.Encoding.UTF8.GetBytes(header);
                    rs.Write(headerbytes, 0, headerbytes.Length);

                    FileStream fileStream = new FileStream(FilePath, FileMode.Open, FileAccess.Read);
                    byte[] buffer = new byte[4096];
                    int bytesRead = 0;
                    while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0)
                    {
                        rs.Write(buffer, 0, bytesRead);
                    }
                    fileStream.Close();

                    byte[] trailer = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "--\r\n");
                    rs.Write(trailer, 0, trailer.Length);
                    rs.Close();

                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                                   | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                    ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                    using (var response1 = request.GetResponse())
                    {
                        using (var reader = new StreamReader(response1.GetResponseStream()))
                        {
                            output = reader.ReadToEnd();
                        }
                    }

                    WriteLog(output);
                }

                return Json(output);

            }
            catch (Exception ex)
            {
                WriteLog(ex, true);
                return Json(new { Error = ex.Message, Error_Type = "Exception" });
            }

        }



        [HttpPost]
        [Route("api/ZaloAccess")]

        public IHttpActionResult ZaloAccess(ZaloParams zalo)
        {
            string output = "";

            try
            {
                if (zalo != null)
                {
                    var url = "https://oauth.zaloapp.com/v4/oa/access_token";

                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                          | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                    // Skip validation of SSL/TLS certificate
                    ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                    string data = $"refresh_token={zalo.refresh_token}&app_id={zalo.app_id}&grant_type=refresh_token";
                    byte[] dataStream = Encoding.UTF8.GetBytes(data);

                    var request = (HttpWebRequest)WebRequest.Create(url);

                    request.Method = "POST";
                    request.ContentType = "application/x-www-form-urlencoded";
                    request.Headers.Add("secret_key", zalo.secret_key);
                    request.ContentLength = dataStream.Length;

                    Stream newStream = request.GetRequestStream();
                    newStream.Write(dataStream, 0, dataStream.Length);
                    newStream.Close();

                    using (var response1 = request.GetResponse())
                    {
                        using (var reader = new StreamReader(response1.GetResponseStream()))
                        {
                            output = reader.ReadToEnd();
                        }
                    }

                    WriteLog(output);
                }

                return Json(output);

            }
            catch (Exception ex)
            {
                WriteLog(ex, true);
                return Json(new { Error = ex.Message, Error_Type = "Exception" });
            }

        }



        #region Other
        public static void WriteLog(object Message, bool isException = false)
        {
            string path = HttpContext.Current.Server.MapPath("~/Log/" + DateTime.Now.ToString("yyyy_MM_dd") + ".txt");
            if (isException) path = HttpContext.Current.Server.MapPath("~/Log/" + DateTime.Now.ToString("yyyy_MM_dd") + "_exception.txt");

            if (!System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/Log")))
            {
                System.IO.Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Log"));
            }

            if (!System.IO.File.Exists(path))
            {
                System.IO.File.Create(path).Close();
            }

            TextWriter tw = new StreamWriter(path, true);
            tw.WriteLine($"\n{DateTime.Now.ToString("HH:mm:ss")}\t{JsonConvert.SerializeObject(Message)}");
            tw.Close();
        }

        public class ZaloParams
        {
            public string secret_key { get; set; }
            public string refresh_token { get; set; }
            public string app_id { get; set; }
            public string access_token { get; set; }
            public string url { get; set; }
            public string method { get; set; }
            public string content_type { get; set; }

            public string input { get; set; }
            public string output { get; set; }
            public string error { get; set; }

            public string file_base { get; set; }
            public string file_type { get; set; }
            public string file_name { get; set; }
            public bool? isImage { get; set; }
            public bool? isAccess { get; set; }
        }

        #endregion

    }

}
