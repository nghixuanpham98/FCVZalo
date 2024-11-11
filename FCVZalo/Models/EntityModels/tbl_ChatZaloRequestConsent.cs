namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloRequestConsent
    {
        public Guid ID { get; set; }

        [StringLength(50)]
        public string Phone { get; set; }

        public bool? IsApproved { get; set; }

        public DateTime? ExpiredOn { get; set; }

        public int? LastSendCode { get; set; }

        public DateTime? LastSendOn { get; set; }

        public string LastSendMessage { get; set; }

        public Guid? LastSendBy { get; set; }

        public int? LastCheckCode { get; set; }

        public DateTime? LastCheckOn { get; set; }

        public string LastCheckMessage { get; set; }

        public Guid? LastCheckBy { get; set; }
    }
}
