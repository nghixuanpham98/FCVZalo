using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FCVZalo.Models.CustomModels
{
    public class UserLogin
    {
        public string soldCode { get; set; }

        public string shipCode { get; set; }

        public string passWord { get; set; }

        public string email { get; set; }
    }
}