namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class vw_ChatZaloRequestSummary
    {
        public Guid ID { get; set; }

        [StringLength(500)]
        public string Name { get; set; }

        public int? Total { get; set; }

        public int? Sent { get; set; }

        public int? Approved { get; set; }

        public int? Reject { get; set; }

        public int? Other { get; set; }
    }
}
