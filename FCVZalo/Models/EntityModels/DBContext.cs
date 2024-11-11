using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;

namespace FCVZalo.Models.EntityModels
{
    public partial class DBContext : DbContext
    {
        public DBContext()
            : base("name=DbContext")
        {
        }

        //Table: ChatZalo
        public virtual DbSet<tbl_CallList> tbl_CallList { get; set; }
        public virtual DbSet<tbl_ChatZaloMessageDetails> tbl_ChatZaloMessageDetails { get; set; }
        public virtual DbSet<tbl_ChatZaloMessages> tbl_ChatZaloMessages { get; set; }
        public virtual DbSet<tbl_ChatZaloOAInfo> tbl_ChatZaloOAInfo { get; set; }
        public virtual DbSet<tbl_ChatZaloRequestConsent> tbl_ChatZaloRequestConsent { get; set; }
        public virtual DbSet<tbl_ChatZaloRequestDetails> tbl_ChatZaloRequestDetails { get; set; }
        public virtual DbSet<tbl_ChatZaloRequests> tbl_ChatZaloRequests { get; set; }
        public virtual DbSet<tbl_ChatZaloSettings> tbl_ChatZaloSettings { get; set; }
        public virtual DbSet<tbl_ChatZaloSharedInfo> tbl_ChatZaloSharedInfo { get; set; }
        public virtual DbSet<tbl_ChatZaloSwapAssignedLogs> tbl_ChatZaloSwapAssignedLogs { get; set; }
        public virtual DbSet<tbl_ChatZaloTagsAndNotes> tbl_ChatZaloTagsAndNotes { get; set; }
        public virtual DbSet<tbl_ChatZaloUsers> tbl_ChatZaloUsers { get; set; }
        public virtual DbSet<tbl_ChatZaloWebhook> tbl_ChatZaloWebhook { get; set; }
        public virtual DbSet<tbl_ChatZaloWebhookAfterHandled> tbl_ChatZaloWebhookAfterHandled { get; set; }
        public virtual DbSet<tbl_User> tbl_User { get; set; }
        public virtual DbSet<tbl_ChatZaloRequestQueue> tbl_ChatZaloRequestQueue { get; set; }

        //View: ChatZalo
        public virtual DbSet<vw_ChatZaloUsers> vw_ChatZaloUsers { get; set; }
        public virtual DbSet<vw_ChatZaloCheckUnReadMessages> vw_ChatZaloCheckUnReadMessages { get; set; }
        public virtual DbSet<v_Zalo_Test> v_Zalo_Test { get; set; }
        public virtual DbSet<vw_ChatZaloRequests> vw_ChatZaloRequests { get; set; }
        public virtual DbSet<vw_ChatZaloRequestDetails> vw_ChatZaloRequestDetails { get; set; }
        public virtual DbSet<vw_ChatZaloRequestSummary> vw_ChatZaloRequestSummary { get; set; }
        public virtual DbSet<vw_ChatZaloRequestSend> vw_ChatZaloRequestSend { get; set; }
        public virtual DbSet<vw_CallListDetails> vw_CallListDetails { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }
}
