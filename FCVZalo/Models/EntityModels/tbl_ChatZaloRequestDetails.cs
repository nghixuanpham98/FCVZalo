namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloRequestDetails
    {
        public Guid ID { get; set; }

        public Guid? RequestID { get; set; }

        [Column(TypeName = "date")]
        public DateTime? RequestDate { get; set; }

        public int? Type { get; set; }

        [StringLength(250)]
        public string SFID { get; set; }

        [StringLength(50)]
        public string MobilePhone { get; set; }

        [StringLength(50)]
        public string Phone { get; set; }
        [StringLength(250)]

        public string ZCC_Zalo_ID__c { get; set; }

        public bool? IsApproved { get; set; }

        public DateTime? ExpiredOn { get; set; }

        public DateTime? LastSendOn { get; set; }

        public int? LastSendCode { get; set; }

        public string LastSendMsg { get; set; }

        public DateTime? LastCheckOn { get; set; }

        public int? LastCheckCode { get; set; }

        public string LastCheckMsg { get; set; }
    }
}
