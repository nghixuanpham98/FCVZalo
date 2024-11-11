namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class vw_ChatZaloAssignSummary
    {
        public Guid? RandomID { get; set; }

        public Guid? StaffID { get; set; }

        [StringLength(250)]
        public string Name { get; set; }

        public int? Count { get; set; }
    }
}