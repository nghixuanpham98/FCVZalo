using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FCVZalo.Models.CustomModels
{
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
        public bool? isAttach { get; set; }
        public bool? isAccess{ get; set; }
    }
}