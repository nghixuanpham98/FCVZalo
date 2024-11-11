namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class vw_CallListDetails
    {
        [Key]
        public Guid CallListDetailId { get; set; }
        public Guid? CallListId  { get; set; }

        [StringLength(250)]
        public string CallListName { get; set; }

        [Column(TypeName = "date")]
        public DateTime? CallListDate { get; set; }

        [StringLength(500)]
        public string CusSFId { get; set; }

        public int? Priority { get; set; }

        [StringLength(500)]
        public string CusFullName { get; set; }

        [StringLength(50)]
        public string CusMobilePhone { get; set; }

        public string CusAddress { get; set; }

        [Column(TypeName = "date")]
        public DateTime? CusBirthDate { get; set; }

        [StringLength(250)]
        public string TaskSubject { get; set; }

        public DateTime? CallRing { get; set; }

        public DateTime? CallConnect { get; set; }

        public DateTime? CallEnd { get; set; }

        public DateTime? CallLastTry { get; set; }

        public string IVRDisconnectedReason { get; set; }
    }
}
