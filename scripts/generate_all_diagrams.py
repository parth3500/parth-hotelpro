#!/usr/bin/env python3
"""
HotelPro Automated Diagram Generation Engine
Generates 4 high-resolution (300 DPI) PNG diagrams concurrently:
1. Complete Entity-Relationship Diagram (ERD covering all 14 models)
2. Full System Architecture Diagram (MERN + Ponytail + Multi-Agent Engine + Task Queue)
3. Multi-Agent Workflow Diagram (Agent Orchestrator + Domain Agents + Task Queue)
4. UML Booking & Payment Lifecycle Sequence Diagram (Lifelines + Activation Bars)
"""

import os
import sys
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIAGRAMS_DIR = os.path.join(PROJECT_ROOT, "docs", "diagrams")
ROOT_DIAGRAMS_DIR = os.path.join(PROJECT_ROOT, "diagrams")

os.makedirs(DOCS_DIAGRAMS_DIR, exist_ok=True)
os.makedirs(ROOT_DIAGRAMS_DIR, exist_ok=True)
sys.path.insert(0, os.path.dirname(__file__))

# -----------------------------------------------------------------------------
# 1. ER DIAGRAM (All 14 Collections / Models logically clustered)
# -----------------------------------------------------------------------------
ER_DOT = """digraph HotelPro_ERD {
  graph [
    rankdir=LR,
    splines=spline,
    nodesep=0.7,
    ranksep=1.1,
    bgcolor="#0F172A",
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=16,
    fontcolor="#F8FAFC",
    label="HotelPro Management System — Complete Entity-Relationship Diagram (14 Collections)",
    labelloc="t",
    dpi=300
  ];

  node [
    shape=plaintext,
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=11
  ];

  edge [
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=9,
    color="#94A3B8",
    fontcolor="#CBD5E1",
    penwidth=1.8,
    arrowsize=0.8
  ];

  // CLUSTER 1: IDENTITY & ACCESS MANAGEMENT
  subgraph cluster_iam {
    label="IDENTITY & ACCESS MANAGEMENT";
    style="rounded,filled";
    color="#1E3A8A";
    fillcolor="#0F172A";
    fontcolor="#93C5FD";
    fontsize=12;

    User [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#3B82F6">
        <tr><td colspan="3" bgcolor="#1D4ED8" align="center"><b><font color="#FFFFFF" point-size="13">User</font></b><br/><font color="#BFDBFE" point-size="9">Authentication &amp; RBAC Core</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left">email</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">name</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">password</td><td align="right"><font color="#94A3B8">String (Hash)</font></td></tr>
        <tr><td align="left"></td><td align="left">role</td><td align="right"><font color="#94A3B8">Enum: guest|staff|admin</font></td></tr>
        <tr><td align="left"></td><td align="left">phone</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">status</td><td align="right"><font color="#94A3B8">Enum: active|suspended</font></td></tr>
        <tr><td align="left"></td><td align="left">assignedDept</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">createdAt</td><td align="right"><font color="#94A3B8">Date</font></td></tr>
      </table>
    >];

    Guest [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#0284C7">
        <tr><td colspan="3" bgcolor="#0369A1" align="center"><b><font color="#FFFFFF" point-size="13">Guest</font></b><br/><font color="#BAE6FD" point-size="9">Guest Profile &amp; Loyalty</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"></td><td align="left">preferences</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">specialRequests</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">loyaltyPoints</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">totalStays</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
      </table>
    >];

    Staff [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#0D9488">
        <tr><td colspan="3" bgcolor="#0F766E" align="center"><b><font color="#FFFFFF" point-size="13">Staff</font></b><br/><font color="#99F6E4" point-size="9">Employee Roster &amp; Shift</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">assignedHotelId</td><td align="right"><font color="#94A3B8">ObjectId (Hotel)</font></td></tr>
        <tr><td align="left"></td><td align="left">department</td><td align="right"><font color="#94A3B8">Enum: Housekeeping|...</font></td></tr>
        <tr><td align="left"></td><td align="left">shift</td><td align="right"><font color="#94A3B8">Enum: Morning|Eve|Night</font></td></tr>
        <tr><td align="left"></td><td align="left">isActive</td><td align="right"><font color="#94A3B8">Boolean</font></td></tr>
      </table>
    >];

    AdminLog [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#64748B">
        <tr><td colspan="3" bgcolor="#475569" align="center"><b><font color="#FFFFFF" point-size="13">AdminLog</font></b><br/><font color="#F1F5F9" point-size="9">Audit &amp; Compliance Trail</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>adminId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"></td><td align="left">action</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">targetType</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">targetId</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">ip</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">createdAt</td><td align="right"><font color="#94A3B8">Date</font></td></tr>
      </table>
    >];
  }

  // CLUSTER 2: PROPERTY & ROOM INVENTORY
  subgraph cluster_inventory {
    label="PROPERTY & ROOM INVENTORY";
    style="rounded,filled";
    color="#065F46";
    fillcolor="#0F172A";
    fontcolor="#A7F3D0";
    fontsize=12;

    Hotel [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#10B981">
        <tr><td colspan="3" bgcolor="#047857" align="center"><b><font color="#FFFFFF" point-size="13">Hotel</font></b><br/><font color="#A7F3D0" point-size="9">Property Details</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"></td><td align="left">name</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">address</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">city, country</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">rating</td><td align="right"><font color="#94A3B8">Number (Float)</font></td></tr>
        <tr><td align="left"></td><td align="left">amenities</td><td align="right"><font color="#94A3B8">Array[String]</font></td></tr>
        <tr><td align="left"></td><td align="left">checkInTime</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">checkOutTime</td><td align="right"><font color="#94A3B8">String</font></td></tr>
      </table>
    >];

    RoomCategory [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#14B8A6">
        <tr><td colspan="3" bgcolor="#0D9488" align="center"><b><font color="#FFFFFF" point-size="13">RoomCategory</font></b><br/><font color="#CCFBF1" point-size="9">Pricing &amp; Class Definitions</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left"><b>name</b></td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">basePrice</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">capacity</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">features</td><td align="right"><font color="#94A3B8">Array[String]</font></td></tr>
      </table>
    >];

    Room [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#059669">
        <tr><td colspan="3" bgcolor="#065F46" align="center"><b><font color="#FFFFFF" point-size="13">Room</font></b><br/><font color="#A7F3D0" point-size="9">Physical Inventory</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left"><b>roomNumber</b></td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">hotelId</td><td align="right"><font color="#94A3B8">ObjectId (Hotel)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">category</td><td align="right"><font color="#94A3B8">String (RoomCategory)</font></td></tr>
        <tr><td align="left"></td><td align="left">pricePerNight</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">capacity</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">floor</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">status</td><td align="right"><font color="#94A3B8">avail|occupied|clean|maint</font></td></tr>
        <tr><td align="left"></td><td align="left">isActive</td><td align="right"><font color="#94A3B8">Boolean</font></td></tr>
      </table>
    >];
  }

  // CLUSTER 3: RESERVATIONS & FINANCIAL TRANSACTIONS
  subgraph cluster_reservations {
    label="RESERVATIONS & FINANCIAL TRANSACTIONS";
    style="rounded,filled";
    color="#B45309";
    fillcolor="#0F172A";
    fontcolor="#FEF08A";
    fontsize=12;

    Booking [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#EAB308">
        <tr><td colspan="3" bgcolor="#B45309" align="center"><b><font color="#FFFFFF" point-size="13">Booking</font></b><br/><font color="#FEF08A" point-size="9">Reservation Lifecycle</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left"><b>bookingReference</b></td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>roomId</b></td><td align="right"><font color="#94A3B8">ObjectId (Room)</font></td></tr>
        <tr><td align="left"></td><td align="left">checkInDate</td><td align="right"><font color="#94A3B8">String (YYYY-MM-DD)</font></td></tr>
        <tr><td align="left"></td><td align="left">checkOutDate</td><td align="right"><font color="#94A3B8">String (YYYY-MM-DD)</font></td></tr>
        <tr><td align="left"></td><td align="left">totalNights</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">totalAmount</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">status</td><td align="right"><font color="#94A3B8">confirmed|checked_in|...</font></td></tr>
        <tr><td align="left"></td><td align="left">paymentStatus</td><td align="right"><font color="#94A3B8">pending|paid|refunded</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">paymentId</td><td align="right"><font color="#94A3B8">ObjectId (Payment)</font></td></tr>
      </table>
    >];

    Payment [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#22C55E">
        <tr><td colspan="3" bgcolor="#15803D" align="center"><b><font color="#FFFFFF" point-size="13">Payment</font></b><br/><font color="#BBF7D0" point-size="9">Financial Ledger &amp; Invoices</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>bookingId</b></td><td align="right"><font color="#94A3B8">ObjectId (Booking)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left">transactionId</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"><font color="#38BDF8">UK</font></td><td align="left">invoiceNumber</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">amount</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">status</td><td align="right"><font color="#94A3B8">success|pending|refunded</font></td></tr>
        <tr><td align="left"></td><td align="left">subtotal, tax, fee</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
        <tr><td align="left"></td><td align="left">refundAmount</td><td align="right"><font color="#94A3B8">Number</font></td></tr>
      </table>
    >];

    CheckInOut [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#F97316">
        <tr><td colspan="3" bgcolor="#C2410C" align="center"><b><font color="#FFFFFF" point-size="13">CheckInOut</font></b><br/><font color="#FFEDD5" point-size="9">Front Desk Physical Entry</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>bookingId</b></td><td align="right"><font color="#94A3B8">ObjectId (Booking)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">roomNumber</td><td align="right"><font color="#94A3B8">String (Room)</font></td></tr>
        <tr><td align="left"></td><td align="left">type</td><td align="right"><font color="#94A3B8">Enum: check_in|check_out</font></td></tr>
        <tr><td align="left"></td><td align="left">timestamp</td><td align="right"><font color="#94A3B8">Date</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">processedByStaffId</td><td align="right"><font color="#94A3B8">ObjectId (Staff)</font></td></tr>
        <tr><td align="left"></td><td align="left">keyCardIssued</td><td align="right"><font color="#94A3B8">Boolean</font></td></tr>
      </table>
    >];
  }

  // CLUSTER 4: GUEST SERVICES & FEEDBACK
  subgraph cluster_services {
    label="SERVICES, FEEDBACK & TELEMETRY";
    style="rounded,filled";
    color="#7C3AED";
    fillcolor="#0F172A";
    fontcolor="#DDD6FE";
    fontsize=12;

    ServiceRequest [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#EC4899">
        <tr><td colspan="3" bgcolor="#BE185D" align="center"><b><font color="#FFFFFF" point-size="13">ServiceRequest</font></b><br/><font color="#FCE7F3" point-size="9">Housekeeping &amp; Room Service</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">roomNumber</td><td align="right"><font color="#94A3B8">String (Room)</font></td></tr>
        <tr><td align="left"></td><td align="left">type</td><td align="right"><font color="#94A3B8">cleaning|maintenance|...</font></td></tr>
        <tr><td align="left"></td><td align="left">priority</td><td align="right"><font color="#94A3B8">low|medium|high|urgent</font></td></tr>
        <tr><td align="left"></td><td align="left">status</td><td align="right"><font color="#94A3B8">pending|assigned|done</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">assignedStaffId</td><td align="right"><font color="#94A3B8">ObjectId (Staff)</font></td></tr>
      </table>
    >];

    Review [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#A855F7">
        <tr><td colspan="3" bgcolor="#7E22CE" align="center"><b><font color="#FFFFFF" point-size="13">Review</font></b><br/><font color="#F3E8FF" point-size="9">Guest Feedback &amp; Ratings</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>roomId</b></td><td align="right"><font color="#94A3B8">ObjectId (Room)</font></td></tr>
        <tr><td align="left"></td><td align="left">rating</td><td align="right"><font color="#94A3B8">Number (1 - 5)</font></td></tr>
        <tr><td align="left"></td><td align="left">comment</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">staffResponse</td><td align="right"><font color="#94A3B8">String</font></td></tr>
      </table>
    >];

    Notification [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#6366F1">
        <tr><td colspan="3" bgcolor="#4338CA" align="center"><b><font color="#FFFFFF" point-size="13">Notification</font></b><br/><font color="#E0E7FF" point-size="9">In-App &amp; Agent Alerts</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left"><b>userId</b></td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"></td><td align="left">title</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">type</td><td align="right"><font color="#94A3B8">booking|payment|service|agent</font></td></tr>
        <tr><td align="left"></td><td align="left">read</td><td align="right"><font color="#94A3B8">Boolean</font></td></tr>
        <tr><td align="left"></td><td align="left">metadata</td><td align="right"><font color="#94A3B8">Object</font></td></tr>
      </table>
    >];

    Report [label=<
      <table border="0" cellborder="1" cellspacing="0" cellpadding="4" bgcolor="#1E293B" color="#06B6D4">
        <tr><td colspan="3" bgcolor="#0E7490" align="center"><b><font color="#FFFFFF" point-size="13">Report</font></b><br/><font color="#CFFAFE" point-size="9">Telemetry &amp; Business Snapshots</font></td></tr>
        <tr><td align="left"><font color="#FBBF24">PK</font></td><td align="left"><b>_id</b></td><td align="right"><font color="#94A3B8">ObjectId</font></td></tr>
        <tr><td align="left"></td><td align="left">type</td><td align="right"><font color="#94A3B8">occupancy|revenue|bookings</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">hotelId</td><td align="right"><font color="#94A3B8">ObjectId (Hotel)</font></td></tr>
        <tr><td align="left"><font color="#F472B6">FK</font></td><td align="left">generatedBy</td><td align="right"><font color="#94A3B8">ObjectId (User)</font></td></tr>
        <tr><td align="left"></td><td align="left">period</td><td align="right"><font color="#94A3B8">String</font></td></tr>
        <tr><td align="left"></td><td align="left">data</td><td align="right"><font color="#94A3B8">Object</font></td></tr>
      </table>
    >];
  }

  // RELATIONSHIPS
  User -> Guest [label=" 1 : 0..1\\nextends", color="#38BDF8"];
  User -> Staff [label=" 1 : 0..1\\nextends", color="#2DD4BF"];
  User -> AdminLog [label=" 1 : 0..*\\nlogs", color="#94A3B8"];

  Hotel -> Room [label=" 1 : 0..*\\ncontains", color="#34D399"];
  Hotel -> Staff [label=" 1 : 0..*\\nemploys", color="#2DD4BF"];
  Hotel -> Report [label=" 1 : 0..*\\naggregates", color="#22D3EE"];
  RoomCategory -> Room [label=" 1 : 0..*\\nclassifies", color="#2DD4BF"];

  User -> Booking [label=" 1 : 0..*\\nbooks", color="#FBBF24"];
  Room -> Booking [label=" 1 : 0..*\\nreserved in", color="#FBBF24"];
  Booking -> Payment [label=" 1 : 1\\nsettles", color="#4ADE80"];
  Booking -> CheckInOut [label=" 1 : 0..*\\nmanifests", color="#FB923C"];
  Room -> CheckInOut [label=" 1 : 0..*\\noccupies", color="#FB923C"];
  Staff -> CheckInOut [label=" 1 : 0..*\\nprocesses", color="#FB923C"];

  User -> ServiceRequest [label=" 1 : 0..*\\nrequests", color="#F472B6"];
  Room -> ServiceRequest [label=" 1 : 0..*\\ntargeted", color="#F472B6"];
  Staff -> ServiceRequest [label=" 1 : 0..*\\nassigned to", color="#F472B6"];

  User -> Review [label=" 1 : 0..*\\nwrites", color="#C084FC"];
  Room -> Review [label=" 1 : 0..*\\nreviewed", color="#C084FC"];

  User -> Notification [label=" 1 : 0..*\\nreceives", color="#818CF8"];
  User -> Report [label=" 1 : 0..*\\ngenerates", color="#22D3EE"];
  User -> Payment [label=" 1 : 0..*\\npays", color="#4ADE80"];
}
"""

# -----------------------------------------------------------------------------
# 2. SYSTEM ARCHITECTURE DIAGRAM (MERN + Ponytail + Multi-Agent + Task Queue)
# -----------------------------------------------------------------------------
ARCH_DOT = """digraph HotelPro_Architecture {
  graph [
    rankdir=TB,
    splines=spline,
    nodesep=0.7,
    ranksep=0.9,
    bgcolor="#0B132B",
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=16,
    fontcolor="#F8FAFC",
    label="HotelPro — Full System Architecture (MERN + Ponytail + Multi-Agent Engine + Task Queue)",
    labelloc="t",
    dpi=300
  ];

  node [
    shape=rect,
    style="rounded,filled",
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=11,
    margin="0.25,0.18",
    penwidth=1.5
  ];

  edge [
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=10,
    color="#94A3B8",
    fontcolor="#CBD5E1",
    penwidth=1.8,
    arrowsize=0.8
  ];

  // SUBGRAPH 1: FRONTEND LAYER
  subgraph cluster_client {
    label="CLIENT PRESENTATION TIER (React 18 + Vite SPA)";
    style="rounded,filled";
    color="#1E3A8A";
    fillcolor="#0F172A";
    fontcolor="#93C5FD";
    fontsize=13;

    GuestUI [label="Guest Portal\\n• Room Catalog & Filters\\n• Booking Wizard & Checkout\\n• Guest Dashboard & Invoices\\n• Reviews & Live Notifications", fillcolor="#1E293B", color="#3B82F6", fontcolor="#F8FAFC"];
    StaffUI [label="Staff Operations Console\\n• Check-In & Check-Out Desk\\n• Housekeeping Queue\\n• Service Request Handler\\n• Room Status Overrides", fillcolor="#1E293B", color="#0D9488", fontcolor="#F8FAFC"];
    AdminUI [label="Executive Admin Console\\n• Global Booking Monitor\\n• Room & Pricing Inventory\\n• User & Staff Role Management\\n• Real-Time Revenue Reports", fillcolor="#1E293B", color="#F59E0B", fontcolor="#F8FAFC"];
    ClientState [label="Shared Client Utilities\\n• Axios API Client + Interceptors\\n• AuthContext & Token Storage\\n• React-Toastify Alerts\\n• Responsive CSS Design", fillcolor="#1E293B", color="#6366F1", fontcolor="#F8FAFC"];
  }

  // SUBGRAPH 2: PONYTAIL ARCHITECTURE GOVERNANCE
  subgraph cluster_ponytail {
    label="PONYTAIL ARCHITECTURAL GOVERNANCE & PRINCIPLES";
    style="rounded,filled";
    color="#065F46";
    fillcolor="#064E3B";
    fontcolor="#A7F3D0";
    fontsize=13;

    PT_1 [label="Anti-Overengineering Standard\\n'The best code is code never written'", fillcolor="#047857", color="#10B981", fontcolor="#FFFFFF"];
    PT_2 [label="Strict YAGNI Enforcement\\nZero bloated frameworks or mock layers", fillcolor="#047857", color="#10B981", fontcolor="#FFFFFF"];
    PT_3 [label="Standard Library First\\nNative Crypto, HTTP, async/await", fillcolor="#047857", color="#10B981", fontcolor="#FFFFFF"];
    PT_4 [label="Strict Separation of Concerns\\nAgents & Tasks strictly decoupled", fillcolor="#047857", color="#10B981", fontcolor="#FFFFFF"];
  }

  // SUBGRAPH 3: API GATEWAY & SECURITY
  subgraph cluster_backend {
    label="API GATEWAY & SECURITY GUARDS (Node.js + Express 4.21)";
    style="rounded,filled";
    color="#3730A3";
    fillcolor="#1E1B4B";
    fontcolor="#C7D2FE";
    fontsize=13;

    HTTP_Gateway [label="Express HTTP Server & Router\\n(/api/auth, /rooms, /bookings, /payments, /staff, /admin)", fillcolor="#312E81", color="#6366F1", fontcolor="#FFFFFF"];

    subgraph cluster_security {
      label="Security & Guard Pipeline";
      style="rounded,filled";
      color="#4F46E5";
      fillcolor="#1E293B";
      fontcolor="#A5B4FC";
      fontsize=11;

      AuthGuard [label="JWT Authenticator\\n• Bearer token verify\\n• User session decode", fillcolor="#1E1B4B", color="#818CF8", fontcolor="#F8FAFC"];
      RBACGuard [label="RBAC Authorizer\\n• guest / staff / admin\\n• Route permission check", fillcolor="#1E1B4B", color="#818CF8", fontcolor="#F8FAFC"];
      IDORGuard [label="IDOR Guard\\n• Ownership verification\\n• Prevents cross-tenant access", fillcolor="#1E1B4B", color="#EC4899", fontcolor="#F8FAFC"];
      ConcurrencyGuard [label="Double-Booking Guard\\n• Date overlap detection\\n• Atomic transaction locking", fillcolor="#1E1B4B", color="#EAB308", fontcolor="#F8FAFC"];
    }
  }

  // SUBGRAPH 4: MULTI-AGENT ENGINE & TASK QUEUE
  subgraph cluster_agents_and_tasks {
    label="MULTI-AGENT ENGINE & TASK WORKFORCE";
    style="rounded,filled";
    color="#9D174D";
    fillcolor="#3B0764";
    fontcolor="#F5D0FE";
    fontsize=13;

    AgentOrchestrator [label="AgentOrchestrator\\n(agents/agentOrchestrator.js)\\n• Central Message Bus & Coordinator\\n• Intent Dispatcher & Lifecycle Runner\\n• System Health & Telemetry", fillcolor="#9F1239", color="#F43F5E", fontcolor="#FFFFFF"];

    TaskRunner [label="TaskRunner Queue Engine\\n(tasks/taskRunner.js)\\n• Priority FIFO Queue\\n• State Machine: Pending -> Running -> Done\\n• Error Boundary & Auto-Retry", fillcolor="#A16207", color="#FACC15", fontcolor="#FFFFFF"];

    subgraph cluster_pairs {
      label="Autonomous Domain Agents & Corresponding Task Workers";
      style="rounded,filled";
      color="#4C1D95";
      fillcolor="#1E1B4B";
      fontcolor="#DDD6FE";
      fontsize=11;

      BookingAgent [label="BookingAgent\\n• Availability lock check\\n• Double-booking prevention\\n• Cancellation fee logic", fillcolor="#1E293B", color="#FB7185", fontcolor="#F8FAFC"];
      bookingTasks [label="bookingTasks.js\\n• CheckAvailability\\n• CreateReservation\\n• ModifyBooking / Cancel", fillcolor="#1E293B", color="#FDE047", fontcolor="#F8FAFC"];

      BillingAgent [label="BillingAgent\\n• Dynamic price engine\\n• Card settlement\\n• Invoice & refund generation", fillcolor="#1E293B", color="#FB7185", fontcolor="#F8FAFC"];
      billingTasks [label="billingTasks.js\\n• ProcessPayment\\n• GenerateInvoice\\n• SeasonalRates / Refund", fillcolor="#1E293B", color="#FDE047", fontcolor="#F8FAFC"];

      HousekeepingAgent [label="HousekeepingAgent\\n• Room status tracker\\n• Auto cleaning dispatch\\n• Service ticket resolution", fillcolor="#1E293B", color="#FB7185", fontcolor="#F8FAFC"];
      housekeepingTasks [label="housekeepingTasks.js\\n• ScheduleCleaning\\n• InspectRoom\\n• HandleServiceRequest", fillcolor="#1E293B", color="#FDE047", fontcolor="#F8FAFC"];

      ConciergeAgent [label="ConciergeAgent\\n• Inquiry processor\\n• Notifications dispatch\\n• Amenity advisor", fillcolor="#1E293B", color="#FB7185", fontcolor="#F8FAFC"];
      conciergeTasks [label="conciergeTasks.js\\n• GuestInquiry\\n• BookingConfirmation\\n• RecommendAmenities", fillcolor="#1E293B", color="#FDE047", fontcolor="#F8FAFC"];

      OperationsAgent [label="OperationsAgent\\n• Occupancy analytics\\n• Security log auditor\\n• Staff duty balancer", fillcolor="#1E293B", color="#FB7185", fontcolor="#F8FAFC"];
      operationsTasks [label="operationsTasks.js\\n• OccupancyReport\\n• AuditSecurityLogs\\n• BalanceStaffDuty", fillcolor="#1E293B", color="#FDE047", fontcolor="#F8FAFC"];
    }
  }

  // SUBGRAPH 5: PERSISTENCE LAYER
  subgraph cluster_database {
    label="DATA PERSISTENCE & DUAL-STORAGE TIER";
    style="rounded,filled";
    color="#0E7490";
    fillcolor="#164E63";
    fontcolor="#A5F3FC";
    fontsize=13;

    ModelFactory [label="ModelFactory & Active Proxy\\n• Routes transparently to MongoDB or In-Memory\\n• Zero mock-bloat, 100% API parity", fillcolor="#0891B2", color="#22D3EE", fontcolor="#FFFFFF"];
    MongoStore [label="MongoDB / Mongoose 8\\n• 14 Schema Collections\\n• Indexed lookups & TTL", fillcolor="#1E293B", color="#38BDF8", fontcolor="#F8FAFC"];
    MemoryStore [label="Dual In-Memory Fallback\\n• High-speed local store\\n• Zero-dependency testing", fillcolor="#1E293B", color="#38BDF8", fontcolor="#F8FAFC"];
    Collections [label="14 Database Collections\\nUser | Guest | Staff | Hotel | Room | RoomCategory | Booking\\nPayment | Review | Notification | ServiceRequest | CheckInOut | Report | AdminLog", fillcolor="#0F172A", color="#06B6D4", fontcolor="#CFFAFE"];
  }

  // GOVERNANCE CONNECTIONS
  PT_1 -> HTTP_Gateway [label="governs", style=dashed, color="#10B981"];
  PT_2 -> ModelFactory [label="governs", style=dashed, color="#10B981"];
  PT_3 -> AuthGuard [label="governs", style=dashed, color="#10B981"];
  PT_4 -> AgentOrchestrator [label="governs", style=dashed, color="#10B981"];

  // CLIENT -> GATEWAY
  GuestUI -> HTTP_Gateway [label="REST API", color="#60A5FA"];
  StaffUI -> HTTP_Gateway [label="REST API", color="#2DD4BF"];
  AdminUI -> HTTP_Gateway [label="REST API", color="#FBBF24"];

  // GATEWAY -> GUARDS
  HTTP_Gateway -> AuthGuard [color="#818CF8"];
  AuthGuard -> RBACGuard [color="#818CF8"];
  RBACGuard -> IDORGuard [color="#EC4899"];
  IDORGuard -> ConcurrencyGuard [color="#EAB308"];

  // DISPATCH
  ConcurrencyGuard -> AgentOrchestrator [label="Delegates Business Events", color="#F43F5E"];
  ConcurrencyGuard -> ModelFactory [label="Direct CRUD", color="#22D3EE"];

  AgentOrchestrator -> TaskRunner [label="Enqueues Tasks", color="#FACC15"];
  TaskRunner -> bookingTasks [color="#FACC15"];
  TaskRunner -> billingTasks [color="#FACC15"];
  TaskRunner -> housekeepingTasks [color="#FACC15"];
  TaskRunner -> conciergeTasks [color="#FACC15"];
  TaskRunner -> operationsTasks [color="#FACC15"];

  bookingTasks -> BookingAgent [dir=both, color="#FBBF24"];
  billingTasks -> BillingAgent [dir=both, color="#4ADE80"];
  housekeepingTasks -> HousekeepingAgent [dir=both, color="#34D399"];
  conciergeTasks -> ConciergeAgent [dir=both, color="#A78BFA"];
  operationsTasks -> OperationsAgent [dir=both, color="#38BDF8"];

  BookingAgent -> ModelFactory [color="#22D3EE"];
  BillingAgent -> ModelFactory [color="#22D3EE"];
  HousekeepingAgent -> ModelFactory [color="#22D3EE"];
  ConciergeAgent -> ModelFactory [color="#22D3EE"];
  OperationsAgent -> ModelFactory [color="#22D3EE"];

  ModelFactory -> MongoStore [label="Production", color="#38BDF8"];
  ModelFactory -> MemoryStore [label="Fallback / Test", color="#38BDF8"];
  MongoStore -> Collections [color="#22D3EE"];
  MemoryStore -> Collections [color="#22D3EE"];
}
"""

# -----------------------------------------------------------------------------
# 3. MULTI-AGENT WORKFLOW DIAGRAM (Top-to-Bottom Balanced Tiers)
# -----------------------------------------------------------------------------
WORKFLOW_DOT = """digraph HotelPro_AgentWorkflow {
  graph [
    rankdir=TB,
    splines=spline,
    nodesep=0.6,
    ranksep=0.8,
    bgcolor="#0B132B",
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=16,
    fontcolor="#F8FAFC",
    label="HotelPro — Autonomous Multi-Agent Workflow & Task Queue Orchestration",
    labelloc="t",
    dpi=300
  ];

  node [
    shape=rect,
    style="rounded,filled",
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=11,
    margin="0.22,0.14",
    penwidth=1.5
  ];

  edge [
    fontname="Inter, Helvetica, Arial, sans-serif",
    fontsize=9.5,
    color="#94A3B8",
    fontcolor="#CBD5E1",
    penwidth=1.6,
    arrowsize=0.75
  ];

  // TIER 1: INGESTION & TRIGGERS
  subgraph cluster_triggers {
    label="1. INGESTION & TRIGGER TIER";
    style="rounded,filled";
    color="#1E3A8A";
    fillcolor="#0F172A";
    fontcolor="#93C5FD";
    fontsize=12;

    Trig_HTTP [label="Guest / User Web Action\\n(Booking, Payment, Service)", fillcolor="#1E293B", color="#3B82F6", fontcolor="#FFFFFF"];
    Trig_Staff [label="Staff Front Desk Action\\n(Check-In, Check-Out, Inspect)", fillcolor="#1E293B", color="#0D9488", fontcolor="#FFFFFF"];
    Trig_Cron [label="Autonomous Scheduled Interval\\n(Audit Logs, Daily Occupancy)", fillcolor="#1E293B", color="#8B5CF6", fontcolor="#FFFFFF"];
  }

  // TIER 2: COORDINATION & QUEUE
  subgraph cluster_core {
    label="2. ENGINE & QUEUE WORKFORCE";
    style="rounded,filled";
    color="#831843";
    fillcolor="#1E1B4B";
    fontcolor="#FBCFE8";
    fontsize=12;

    Orchestrator [label="AgentOrchestrator (agents/agentOrchestrator.js)\\n• Central Message Bus & Workflow Coordinator\\n• Maps Business Triggers to Domain Tasks\\n• Tracks Autonomous Execution Telemetry", fillcolor="#9F1239", color="#FB7185", fontcolor="#FFFFFF"];
    TaskRunner [label="TaskRunner Engine (tasks/taskRunner.js)\\n• Priority FIFO Queue (Critical > Normal > Low)\\n• State Machine: Pending -> Running -> Done\\n• Error Boundary & Auto-Retry Mechanism", fillcolor="#A16207", color="#FACC15", fontcolor="#FFFFFF"];
  }

  // TIER 3: DOMAIN AGENTS & TASKS
  subgraph cluster_domain {
    label="3. SPECIALIZED AUTONOMOUS DOMAIN AGENTS & TASKS";
    style="rounded,filled";
    color="#065F46";
    fillcolor="#042F2E";
    fontcolor="#A7F3D0";
    fontsize=12;

    Agent_Booking [label="BookingAgent (bookingTasks.js)\\n• CheckAvailabilityTask\\n• CreateReservationTask\\n• CancelReservationTask", fillcolor="#1E293B", color="#34D399", fontcolor="#FFFFFF"];
    Agent_Billing [label="BillingAgent (billingTasks.js)\\n• ProcessPaymentTask\\n• GenerateInvoiceTask\\n• ProcessRefundTask", fillcolor="#1E293B", color="#34D399", fontcolor="#FFFFFF"];
    Agent_Housekeeping [label="HousekeepingAgent (housekeepingTasks.js)\\n• ScheduleCleaningTask\\n• InspectRoomTask\\n• HandleServiceRequestTask", fillcolor="#1E293B", color="#34D399", fontcolor="#FFFFFF"];
    Agent_Concierge [label="ConciergeAgent (conciergeTasks.js)\\n• GuestInquiryTask\\n• BookingConfirmTask\\n• RecommendAmenitiesTask", fillcolor="#1E293B", color="#34D399", fontcolor="#FFFFFF"];
    Agent_Operations [label="OperationsAgent (operationsTasks.js)\\n• OccupancyReportTask\\n• AuditSecurityLogsTask\\n• BalanceStaffDutyTask", fillcolor="#1E293B", color="#34D399", fontcolor="#FFFFFF"];
  }

  // TIER 4: PERSISTENCE & GUEST ALERTS
  subgraph cluster_data {
    label="4. DATA PERSISTENCE & GUEST ALERTS";
    style="rounded,filled";
    color="#0E7490";
    fillcolor="#083344";
    fontcolor="#A5F3FC";
    fontsize=12;

    DB [label="Active Model Proxy & Database Tier (Dual MongoDB / In-Memory Store)\\n14 Collections (Rooms, Bookings, Payments, CheckIns, Notifications, Logs)", fillcolor="#0E7490", color="#22D3EE", fontcolor="#FFFFFF"];
    Alerts [label="Notification & Real-Time Alerts\\n• In-App Notifications Model\\n• Toast Feedbacks & System Alerts", fillcolor="#0E7490", color="#22D3EE", fontcolor="#FFFFFF"];
  }

  // CONNECTIONS
  Trig_HTTP -> Orchestrator [label="API Event", color="#38BDF8"];
  Trig_Staff -> Orchestrator [label="Desk Action", color="#2DD4BF"];
  Trig_Cron -> Orchestrator [label="Cron Trigger", color="#A78BFA"];

  Orchestrator -> TaskRunner [label="Enqueues Task Payload", color="#FACC15", penwidth=2.0];
  TaskRunner -> Orchestrator [label="Telemetry & Result", color="#FDE047", style=dashed];

  TaskRunner -> Agent_Booking [label="Executes", color="#FACC15"];
  TaskRunner -> Agent_Billing [label="Executes", color="#FACC15"];
  TaskRunner -> Agent_Housekeeping [label="Executes", color="#FACC15"];
  TaskRunner -> Agent_Concierge [label="Executes", color="#FACC15"];
  TaskRunner -> Agent_Operations [label="Executes", color="#FACC15"];

  // Inter-agent choreography
  Agent_Booking -> Agent_Billing [label="1. Reservation Confirmed\\n-> Request Charge", style=dashed, color="#FBBF24"];
  Agent_Billing -> Agent_Concierge [label="2. Payment Settled\\n-> Send Confirmation", style=dashed, color="#4ADE80"];
  Agent_Billing -> Agent_Housekeeping [label="3. Room Booked\\n-> Schedule Turn-down", style=dashed, color="#6EE7B7"];
  Agent_Housekeeping -> Agent_Operations [label="4. Status Updated\\n-> Update Occupancy", style=dashed, color="#38BDF8"];

  Agent_Booking -> DB [color="#22D3EE"];
  Agent_Billing -> DB [color="#22D3EE"];
  Agent_Housekeeping -> DB [color="#22D3EE"];
  Agent_Concierge -> DB [color="#22D3EE"];
  Agent_Operations -> DB [color="#22D3EE"];

  Agent_Concierge -> Alerts [label="Dispatches Alert", color="#A78BFA"];
}
"""

def render_graphviz(name, dot_source, title):
    dot_path = os.path.join(DOCS_DIAGRAMS_DIR, f"{name}.dot")
    png_docs = os.path.join(DOCS_DIAGRAMS_DIR, f"{name}.png")
    png_root = os.path.join(ROOT_DIAGRAMS_DIR, f"{name}.png")

    with open(dot_path, "w", encoding="utf-8") as f:
        f.write(dot_source.strip())

    cmd = ["dot", "-Tpng", "-Gdpi=300", dot_path, "-o", png_docs]
    subprocess.run(cmd, check=True)
    shutil.copyfile(png_docs, png_root)

    size_kb = os.path.getsize(png_docs) / 1024
    print(f"✓ Generated: {name}.png ({size_kb:.1f} KB) — {title}")
    return name

def render_sequence_diagram_job():
    name = "booking_payment_sequence"
    title = "Booking & Payment Lifecycle Sequence Diagram"
    png_docs = os.path.join(DOCS_DIAGRAMS_DIR, f"{name}.png")
    png_root = os.path.join(ROOT_DIAGRAMS_DIR, f"{name}.png")

    # Import and call python renderer
    from render_sequence import render_sequence_diagram
    render_sequence_diagram(png_docs)
    shutil.copyfile(png_docs, png_root)

    size_kb = os.path.getsize(png_docs) / 1024
    print(f"✓ Generated: {name}.png ({size_kb:.1f} KB) — {title}")
    return name

def main():
    print("=== HotelPro Diagram Generation Pipeline ===")
    print("Generating 4 high-resolution 300 DPI diagrams in parallel...\n")

    jobs = [
        ("er_diagram", ER_DOT, "Entity-Relationship Diagram (14 Collections)"),
        ("system_architecture", ARCH_DOT, "System Architecture (MERN + Ponytail + Multi-Agent + Task Queue)"),
        ("multi_agent_workflow", WORKFLOW_DOT, "Multi-Agent Workflow & Task Queue Orchestration"),
    ]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(render_graphviz, name, dot, title)
            for name, dot, title in jobs
        ]
        futures.append(executor.submit(render_sequence_diagram_job))

        for f in futures:
            f.result()

    print("\nAll 4 diagrams generated successfully.")
    print("Saved in:")
    print(f"- {DOCS_DIAGRAMS_DIR}/")
    print(f"- {ROOT_DIAGRAMS_DIR}/")

if __name__ == "__main__":
    main()
