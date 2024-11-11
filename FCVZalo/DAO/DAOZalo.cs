using FCVZalo.Models.CustomModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;

namespace FCVZalo.DAO
{
    public class DAOZalo
    {

        //Gọi qua API trung gian (nơi server có thể truy cập mạng ngoài)
        public static string API_Intermadiary(ZaloParams zalo, ref string error)
        {
            string output = "";
            try
            {
                var IVGZaloApiUrl = System.Configuration.ConfigurationManager.AppSettings["IVGZaloApiUrl"];

                if (zalo.isAttach == true)
                    IVGZaloApiUrl = IVGZaloApiUrl + "ZaloFile";

                else if (zalo.isAccess == true)
                    IVGZaloApiUrl = IVGZaloApiUrl + "ZaloAccess";

                else
                    IVGZaloApiUrl = IVGZaloApiUrl + "Zalo";


                var req = (HttpWebRequest)WebRequest.Create(IVGZaloApiUrl);
                req.Method = "POST";
                req.ContentType = "application/json";
               
                using (var streamWriter = new StreamWriter(req.GetRequestStream()))
                {
                    string json = JsonConvert.SerializeObject(zalo);
                    streamWriter.Write(json);
                }

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                                 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                using (var req1 = req.GetResponse())
                {
                    using (var reader = new StreamReader(req1.GetResponseStream()))
                    {
                        output = reader.ReadToEnd();
                    }
                }
                output = !string.IsNullOrEmpty(output) ? JsonConvert.DeserializeObject<string>(output) : output;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                output = "";
            }
            return output;
        }


        //Gọi trực tiếp
        public static string API_Direct(ZaloParams zalo, ref string error)
        {
            string output = "";
            try
            {
                var req = (HttpWebRequest)WebRequest.Create(zalo.url);
                req.Headers.Add("access_token", zalo.access_token);
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

                using (var req1 = req.GetResponse())
                {
                    using (var reader = new StreamReader(req1.GetResponseStream()))
                    {
                        output = reader.ReadToEnd();
                    }
                }
            }
            catch (Exception ex)
            {
                error = ex.Message;
                output = "";
            }
            return output;
        }


    }
}