using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FCVZalo.Models.CustomModels
{
    public class IntermediarySendMessages
    {
        public string followerIDZalo { get; set; }

        public string typeMessage { get; set; }

        public string messageContent { get; set; }

        public object fileUpload { get; set; }
    }
}