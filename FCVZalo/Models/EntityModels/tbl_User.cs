namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_User
    {
        public Guid id { get; set; }

        [StringLength(50)]
        public string sfid { get; set; }

        [StringLength(250)]
        public string Username { get; set; }

        [StringLength(250)]
        public string Password { get; set; }

        [StringLength(250)]
        public string FirstName { get; set; }

        [StringLength(250)]
        public string LastName { get; set; }

        [StringLength(250)]
        public string CompanyName { get; set; }

        [StringLength(250)]
        public string Division { get; set; }

        [StringLength(250)]
        public string Department { get; set; }

        [StringLength(250)]
        public string Title { get; set; }

        [StringLength(250)]
        public string Email { get; set; }

        [StringLength(250)]
        public string phone { get; set; }

        [StringLength(250)]
        public string mobilephone { get; set; }

        public bool? IsActive { get; set; }

        [StringLength(50)]
        public string UserRoleId { get; set; }

        [StringLength(50)]
        public string ProfileId { get; set; }

        [StringLength(250)]
        public string UserType { get; set; }

        [StringLength(250)]
        public string UserSubtype { get; set; }

        [StringLength(250)]
        public string StartDay { get; set; }

        [StringLength(250)]
        public string EndDay { get; set; }

        [StringLength(50)]
        public string EmployeeNumber { get; set; }

        [StringLength(50)]
        public string ManagerId { get; set; }

        public DateTime? LastLoginDate { get; set; }

        public DateTime? LastPasswordChangeDate { get; set; }

        public DateTime? CreatedDate { get; set; }

        [StringLength(50)]
        public string CreatedById { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        [StringLength(50)]
        public string LastModifiedById { get; set; }

        public DateTime? SystemModstamp { get; set; }

        [StringLength(50)]
        public string ContactId { get; set; }

        [StringLength(50)]
        public string AccountId { get; set; }

        public bool? IsSFUser { get; set; }

        public int? PortalRole { get; set; }

        [StringLength(250)]
        public string Token { get; set; }

        public int? AgentId { get; set; }

        public int? ExtensionId { get; set; }

        public DateTime? BirthDate { get; set; }

        public int? Gender { get; set; }

        public Guid? PortalCreatedBy { get; set; }

        public DateTime? PortalCreatedOn { get; set; }

        public Guid? PortalModifiedBy { get; set; }

        public DateTime? PortalModifiedOn { get; set; }

        [StringLength(50)]
        public string DisplayName { get; set; }

        [StringLength(50)]
        public string OU { get; set; }

        public string Description { get; set; }

        public int? AgentType { get; set; }

        public int? Status { get; set; }

        public DateTime? StatusBegin { get; set; }

        public bool? DesktopActive { get; set; }

        public DateTime? LastDesktopHeartbeat { get; set; }

        public bool? Active { get; set; }

        public int? InboundCalls { get; set; }

        public int? AnsweredCalls { get; set; }

        public int? OutboundCalls { get; set; }

        public int? AvgRingTime { get; set; }

        public int? AvgTalkTime { get; set; }

        public int? AvgIncTalk { get; set; }

        public int? AvgOutTalk { get; set; }

        public int? AvgHoldTime { get; set; }

        public Guid? GUID { get; set; }

        public string SID { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        public int? DepartmentID { get; set; }

        [StringLength(1000)]
        public string Groups { get; set; }

        public bool? IsAdmin { get; set; }

        public DateTime? LastLogOn { get; set; }

        public Guid? Session { get; set; }

        public long? LastMissCallID { get; set; }

        [StringLength(50)]
        public string AccountCode { get; set; }

        public DateTime? LastAgentLogOn { get; set; }

        public DateTime? FirstAgentLogOnToday { get; set; }

        public DateTime? LastAgentLogOff { get; set; }

        [StringLength(50)]
        public string LastWSEndPoint { get; set; }

        public DateTime? LastWSRxTime { get; set; }

        public int? IntID { get; set; }

        public DateTime? Sync2SCTime { get; set; }
    }
}
