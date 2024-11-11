namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_CallList
    {
        [Key]
        public Guid CallListId { get; set; }

        [StringLength(250)]
        public string Subject { get; set; }

        public Guid? GroupId { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Date { get; set; }

        [StringLength(250)]
        public string ViewName { get; set; }

        public string SQLStatement { get; set; }

        public string Description { get; set; }

        public long? TotalCall { get; set; }

        public long? TotalDialerCall { get; set; }

        public long? TotalConnectedCall { get; set; }

        public double? ConnectedRate { get; set; }

        public long? TotalUnconnectedCall { get; set; }

        public double? UnconnectedRate { get; set; }

        public double? AvgRingTime { get; set; }

        public double? AvgCallTime { get; set; }

        public double? AvgTalkTime { get; set; }

        public DateTime? CreatedOn { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public Guid? ModifiedBy { get; set; }

        public bool? Scheduled { get; set; }

        public DateTime? FromTime { get; set; }

        public DateTime? ToTime { get; set; }

        public DateTime? RequestTimeLoadData { get; set; }

        [StringLength(50)]
        public string TimeLoadData { get; set; }

        public DateTime? LastLoadDataTime { get; set; }

        public bool? Pause { get; set; }
    }
}
