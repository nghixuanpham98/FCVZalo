namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloWebhook
    {
        public Guid ID { get; set; }

        [StringLength(250)]
        public string EventName { get; set; }

        [StringLength(50)]
        public string TimeReceived { get; set; }

        public string ResponseContent { get; set; }

        public DateTime? eventtime { get; set; }
    }
}
