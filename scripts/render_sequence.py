#!/usr/bin/env python3
"""
High-Resolution UML Sequence Diagram Generator for HotelPro
Renders a crisp, professional 300 DPI dark-theme sequence diagram
covering the full Booking & Payment lifecycle.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    font_paths = [
        "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf",
        "/usr/share/fonts/google-carlito-fonts/Carlito-Bold.ttf" if bold else "/usr/share/fonts/google-carlito-fonts/Carlito-Regular.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_dashed_line(draw, pt1, pt2, color, width=2, dash_length=8, space_length=8):
    x1, y1 = pt1
    x2, y2 = pt2
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist == 0:
        return
    d_dx = dx / dist
    d_dy = dy / dist
    curr = 0
    while curr < dist:
        end = min(curr + dash_length, dist)
        draw.line(
            [(x1 + d_dx * curr, y1 + d_dy * curr), (x1 + d_dx * end, y1 + d_dy * end)],
            fill=color,
            width=width
        )
        curr += dash_length + space_length

def draw_arrow(draw, pt1, pt2, color, dashed=False, width=2, arrow_size=10):
    x1, y1 = pt1
    x2, y2 = pt2
    if dashed:
        draw_dashed_line(draw, pt1, pt2, color, width=width, dash_length=6, space_length=6)
    else:
        draw.line([pt1, pt2], fill=color, width=width)
    
    # Arrow head at pt2 pointing from pt1
    angle = math.atan2(y2 - y1, x2 - x1)
    if dashed:
        # Open arrowhead
        p1 = (x2 - arrow_size * math.cos(angle - math.pi / 6), y2 - arrow_size * math.sin(angle - math.pi / 6))
        p2 = (x2 - arrow_size * math.cos(angle + math.pi / 6), y2 - arrow_size * math.sin(angle + math.pi / 6))
        draw.line([p1, (x2, y2)], fill=color, width=width)
        draw.line([p2, (x2, y2)], fill=color, width=width)
    else:
        # Filled arrowhead polygon
        p1 = (x2 - arrow_size * math.cos(angle - math.pi / 6), y2 - arrow_size * math.sin(angle - math.pi / 6))
        p2 = (x2 - arrow_size * math.cos(angle + math.pi / 6), y2 - arrow_size * math.sin(angle + math.pi / 6))
        draw.polygon([(x2, y2), p1, p2], fill=color)

def draw_self_arrow(draw, x, y, color, width=2, loop_w=50, loop_h=30):
    # Self-calling loop: out right, down, back left
    draw.line([(x, y), (x + loop_w, y)], fill=color, width=width)
    draw.line([(x + loop_w, y), (x + loop_w, y + loop_h)], fill=color, width=width)
    draw.line([(x + loop_w, y + loop_h), (x, y + loop_h)], fill=color, width=width)
    # arrow head at (x, y + loop_h) pointing left
    draw.polygon([(x, y + loop_h), (x + 10, y + loop_h - 6), (x + 10, y + loop_h + 6)], fill=color)

def render_sequence_diagram(output_path):
    WIDTH = 3400
    HEIGHT = 2800

    img = Image.new("RGBA", (WIDTH, HEIGHT), "#0B132B")
    draw = ImageDraw.Draw(img)

    # Fonts
    title_font = get_font(36, bold=True)
    subtitle_font = get_font(18, bold=False)
    actor_title_font = get_font(18, bold=True)
    actor_sub_font = get_font(13, bold=False)
    phase_title_font = get_font(17, bold=True)
    step_num_font = get_font(14, bold=True)
    msg_font = get_font(15, bold=False)
    note_font = get_font(13, bold=False)

    # Background Header Banner
    draw.rounded_rectangle([(40, 25), (WIDTH - 40, 140)], radius=12, fill="#111D4A", outline="#1E3A8A", width=2)
    
    title_text = "HotelPro Management System — Booking & Payment Lifecycle Sequence Diagram"
    subtitle_text = "End-to-End Orchestration: Room Search, Double-Booking Concurrency Guards, IDOR Validation, Financial Settlement, and Multi-Agent Choreography"
    
    t_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text(((WIDTH - t_w) / 2, 45), title_text, fill="#F8FAFC", font=title_font)

    s_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text(((WIDTH - s_w) / 2, 95), subtitle_text, fill="#94A3B8", font=subtitle_font)

    # Participants
    actors = [
        {"id": "guest", "title": "Guest", "sub": "Browser Client", "x": 220, "bg": "#0369A1", "border": "#38BDF8"},
        {"id": "ui", "title": "React Client", "sub": "Vite SPA / Redux", "x": 640, "bg": "#1D4ED8", "border": "#60A5FA"},
        {"id": "api", "title": "API Gateway", "sub": "Express Router", "x": 1060, "bg": "#4338CA", "border": "#818CF8"},
        {"id": "auth", "title": "Auth & IDOR", "sub": "Middleware Guards", "x": 1480, "bg": "#9D174D", "border": "#F472B6"},
        {"id": "booking", "title": "Booking Agent", "sub": "Reservation Worker", "x": 1900, "bg": "#B45309", "border": "#FBBF24"},
        {"id": "billing", "title": "Billing Agent", "sub": "Ledger & Invoices", "x": 2320, "bg": "#15803D", "border": "#4ADE80"},
        {"id": "db", "title": "Database Store", "sub": "Dual Memory / Mongo", "x": 2740, "bg": "#0E7490", "border": "#22D3EE"},
        {"id": "agents", "title": "Housekeeping & Concierge", "sub": "Domain Autonomous Agents", "x": 3160, "bg": "#6D28D9", "border": "#A78BFA"},
    ]

    actor_map = {a["id"]: a for a in actors}

    top_actor_y = 165
    actor_h = 65
    bottom_actor_y = HEIGHT - 100

    # Draw Lifelines (vertical dashed lines)
    for a in actors:
        x = a["x"]
        draw_dashed_line(draw, (x, top_actor_y + actor_h), (x, bottom_actor_y), "#334155", width=2, dash_length=8, space_length=8)

    # Phases definitions
    phases = [
        {
            "title": "PHASE 1: ROOM DISCOVERY & DYNAMIC AVAILABILITY FILTERING",
            "y1": 255, "y2": 660, "color": "#0369A1", "bg": "#082F49"
        },
        {
            "title": "PHASE 2: BOOKING RESERVATION CREATION & CONCURRENCY GUARD",
            "y1": 675, "y2": 1150, "color": "#B45309", "bg": "#451A03"
        },
        {
            "title": "PHASE 3: SECURE PAYMENT SETTLEMENT & TRANSACTION LEDGER",
            "y1": 1165, "y2": 1670, "color": "#15803D", "bg": "#052E16"
        },
        {
            "title": "PHASE 4: AUTONOMOUS MULTI-AGENT POST-PAYMENT CHOREOGRAPHY",
            "y1": 1685, "y2": 2100, "color": "#6D28D9", "bg": "#2E1065"
        },
        {
            "title": "PHASE 5: FRONT DESK CHECK-IN & DEPARTURE CLEANING CYCLE",
            "y1": 2115, "y2": 2590, "color": "#C2410C", "bg": "#431407"
        }
    ]

    # Draw phase background banners
    for p in phases:
        draw.rounded_rectangle([(60, p["y1"]), (WIDTH - 60, p["y2"])], radius=10, fill=p["bg"], outline=p["color"], width=2)
        # Phase header label pill
        draw.rounded_rectangle([(75, p["y1"] + 10), (75 + 640, p["y1"] + 38)], radius=6, fill=p["color"])
        draw.text((85, p["y1"] + 14), p["title"], fill="#FFFFFF", font=phase_title_font)

    # Sequence Messages
    steps = [
        # PHASE 1
        {"from": "guest", "to": "ui", "y": 320, "type": "call", "step": "1", "msg": "Search available rooms (checkIn, checkOut, capacity, roomCategory)", "color": "#38BDF8"},
        {"from": "ui", "to": "api", "y": 375, "type": "call", "step": "2", "msg": "GET /api/rooms/available?checkIn=2026-11-01&checkOut=2026-11-05", "color": "#60A5FA"},
        {"from": "api", "to": "db", "y": 430, "type": "call", "step": "3", "msg": "Find active rooms with NO overlapping confirmed bookings in date window", "color": "#22D3EE"},
        {"from": "db", "to": "api", "y": 485, "type": "return", "step": "4", "msg": "Return available room records (RoomCategory, basePrice, amenities)", "color": "#22D3EE"},
        {"from": "api", "to": "ui", "y": 540, "type": "return", "step": "5", "msg": "200 OK: Available rooms JSON payload", "color": "#60A5FA"},
        {"from": "ui", "to": "guest", "y": 595, "type": "return", "step": "6", "msg": "Render responsive room cards with dynamic filters and nightly rates", "color": "#38BDF8"},

        # PHASE 2
        {"from": "guest", "to": "ui", "y": 735, "type": "call", "step": "7", "msg": "Select Room #101 & submit reservation booking form", "color": "#38BDF8"},
        {"from": "ui", "to": "api", "y": 790, "type": "call", "step": "8", "msg": "POST /api/bookings (Bearer JWT, roomId, checkInDate, checkOutDate)", "color": "#60A5FA"},
        {"from": "api", "to": "auth", "y": 845, "type": "call", "step": "9", "msg": "Verify JWT Bearer token signature & check account active status", "color": "#F472B6"},
        {"from": "auth", "to": "booking", "y": 900, "type": "call", "step": "10", "msg": "Dispatch CheckAvailabilityTask (Double-booking mutex check)", "color": "#FBBF24"},
        {"from": "booking", "to": "db", "y": 955, "type": "call", "step": "11", "msg": "Lock room & atomically insert Booking (status: 'confirmed', paymentStatus: 'pending')", "color": "#22D3EE"},
        {"from": "db", "to": "booking", "y": 1010, "type": "return", "step": "12", "msg": "Booking created with unique bookingReference: 'BKG-XXXXXX'", "color": "#22D3EE"},
        {"from": "booking", "to": "api", "y": 1055, "type": "return", "step": "13", "msg": "Task completed successfully -> pass reservation details", "color": "#FBBF24"},
        {"from": "api", "to": "ui", "y": 1095, "type": "return", "step": "14", "msg": "201 Created: Reservation confirmed, redirect to payment checkout", "color": "#60A5FA"},

        # PHASE 3
        {"from": "guest", "to": "ui", "y": 1225, "type": "call", "step": "15", "msg": "Review invoice breakdown and authorize payment card charge", "color": "#38BDF8"},
        {"from": "ui", "to": "api", "y": 1280, "type": "call", "step": "16", "msg": "POST /api/payments (Bearer JWT, bookingId, cardDetails, amount)", "color": "#60A5FA"},
        {"from": "api", "to": "auth", "y": 1335, "type": "call", "step": "17", "msg": "IDOR Guard: Verify req.user.id strictly matches booking.userId", "color": "#F472B6"},
        {"from": "auth", "to": "billing", "y": 1390, "type": "call", "step": "18", "msg": "Dispatch ProcessPaymentTransactionTask (Dedup + charge + fee calc)", "color": "#4ADE80"},
        {"from": "billing", "to": "billing", "y": 1445, "type": "self", "step": "19", "msg": "Generate unique transactionId: 'TXN-XXXX' & invoiceNumber: 'INV-XXXX'", "color": "#4ADE80"},
        {"from": "billing", "to": "db", "y": 1500, "type": "call", "step": "20", "msg": "Save Payment ledger & update Booking (paymentStatus: 'paid')", "color": "#22D3EE"},
        {"from": "billing", "to": "api", "y": 1555, "type": "return", "step": "21", "msg": "Payment settled successfully with itemized receipt", "color": "#4ADE80"},
        {"from": "api", "to": "ui", "y": 1600, "type": "return", "step": "22", "msg": "200 OK: Payment success payload + invoice download URL", "color": "#60A5FA"},
        {"from": "ui", "to": "guest", "y": 1635, "type": "return", "step": "23", "msg": "Display payment success confirmation badge & printable invoice modal", "color": "#38BDF8"},

        # PHASE 4
        {"from": "billing", "to": "agents", "y": 1745, "type": "call", "step": "24", "msg": "Event: BookingPaid -> Trigger ConciergeAgent send confirmation alert", "color": "#A78BFA"},
        {"from": "agents", "to": "db", "y": 1800, "type": "call", "step": "25", "msg": "Insert Notification record (type: 'booking', read: false) for user", "color": "#22D3EE"},
        {"from": "billing", "to": "agents", "y": 1855, "type": "call", "step": "26", "msg": "Event: BookingPaid -> Trigger HousekeepingAgent schedule turn-down", "color": "#A78BFA"},
        {"from": "agents", "to": "db", "y": 1910, "type": "call", "step": "27", "msg": "Create ServiceRequest ticket (type: 'cleaning', priority: 'medium')", "color": "#22D3EE"},
        {"from": "agents", "to": "guest", "y": 1965, "type": "return", "step": "28", "msg": "Deliver real-time in-app notification & confirmation toast to guest", "color": "#38BDF8"},
        {"from": "agents", "to": "db", "y": 2020, "type": "call", "step": "29", "msg": "OperationsAgent: Log compliance & audit entry in AdminLogs", "color": "#94A3B8"},

        # PHASE 5
        {"from": "guest", "to": "ui", "y": 2180, "type": "call", "step": "30", "msg": "Guest arrives at property -> Staff receptionist accesses Check-in desk", "color": "#FB923C"},
        {"from": "ui", "to": "api", "y": 2235, "type": "call", "step": "31", "msg": "POST /api/bookings/:id/checkin (Staff Bearer JWT, keyCardIssued: true)", "color": "#FB923C"},
        {"from": "api", "to": "db", "y": 2290, "type": "call", "step": "32", "msg": "Record CheckInOut('check_in'), set Booking.checked_in, Room.occupied", "color": "#22D3EE"},
        {"from": "api", "to": "ui", "y": 2345, "type": "return", "step": "33", "msg": "200 OK: Room key card active, guest marked checked-in", "color": "#FB923C"},
        {"from": "guest", "to": "ui", "y": 2395, "type": "call", "step": "34", "msg": "Guest checkout -> Staff initiates POST /api/bookings/:id/checkout", "color": "#FB923C"},
        {"from": "ui", "to": "api", "y": 2445, "type": "call", "step": "35", "msg": "POST /api/bookings/:id/checkout (Staff Bearer JWT, inspectStatus: 'clean')", "color": "#FB923C"},
        {"from": "api", "to": "db", "y": 2495, "type": "call", "step": "36", "msg": "Record CheckInOut('check_out'), Booking.checked_out, Room.status = 'cleaning'", "color": "#22D3EE"},
        {"from": "api", "to": "agents", "y": 2540, "type": "call", "step": "37", "msg": "Auto-dispatch Housekeeping ScheduleCleaningTask for room reset", "color": "#A78BFA"},
    ]

    # Draw execution activations (narrow vertical bars on lifelines)
    activations = [
        ("guest", 310, 610, "#0284C7"),
        ("ui", 365, 560, "#2563EB"),
        ("api", 420, 500, "#4F46E5"),
        ("db", 425, 490, "#0891B2"),
        
        ("guest", 725, 1110, "#0284C7"),
        ("ui", 780, 1100, "#2563EB"),
        ("api", 835, 1070, "#4F46E5"),
        ("auth", 840, 895, "#BE185D"),
        ("booking", 890, 1060, "#D97706"),
        ("db", 950, 1020, "#0891B2"),

        ("guest", 1215, 1645, "#0284C7"),
        ("ui", 1270, 1610, "#2563EB"),
        ("api", 1325, 1575, "#4F46E5"),
        ("auth", 1330, 1385, "#BE185D"),
        ("billing", 1380, 1565, "#16A34A"),
        ("db", 1495, 1545, "#0891B2"),

        ("billing", 1735, 1875, "#16A34A"),
        ("agents", 1740, 2035, "#7C3AED"),
        ("db", 1795, 2030, "#0891B2"),

        ("ui", 2170, 2555, "#EA580C"),
        ("api", 2225, 2550, "#4F46E5"),
        ("db", 2285, 2510, "#0891B2"),
        ("agents", 2535, 2565, "#7C3AED"),
    ]

    for act_id, y_start, y_end, col in activations:
        ax = actor_map[act_id]["x"]
        draw.rounded_rectangle([(ax - 7, y_start), (ax + 7, y_end)], radius=3, fill=col, outline="#FFFFFF", width=1)

    # Draw Messages
    for s in steps:
        y = s["y"]
        col = s["color"]
        num_str = f"[{s['step']}]"

        if s["type"] == "self":
            ax = actor_map[s["from"]]["x"]
            draw_self_arrow(draw, ax + 7, y, col, width=2, loop_w=45, loop_h=28)
            # Label
            draw.text((ax + 60, y + 4), num_str, fill="#FACC15", font=step_num_font)
            draw.text((ax + 105, y + 4), s["msg"], fill="#F8FAFC", font=msg_font)
        else:
            x1 = actor_map[s["from"]]["x"]
            x2 = actor_map[s["to"]]["x"]

            # Offset slightly from activation bar
            start_x = x1 + (7 if x2 > x1 else -7)
            end_x = x2 + (-7 if x2 > x1 else 7)

            is_dashed = (s["type"] == "return")
            draw_arrow(draw, (start_x, y), (end_x, y), col, dashed=is_dashed, width=2, arrow_size=11)

            # Label text positioning
            mid_x = (x1 + x2) / 2
            label_text = s["msg"]
            full_label = f"{num_str} {label_text}"
            
            # Draw step number badge
            t_box = draw.textbbox((0, 0), full_label, font=msg_font)
            tw = t_box[2] - t_box[0]
            label_x = max(min(mid_x - tw / 2, max(x1, x2) - tw - 15), min(x1, x2) + 15)

            # Draw small background pill for readability
            draw.rounded_rectangle([(label_x - 6, y - 20), (label_x + tw + 6, y - 2)], radius=4, fill="#0F172A", outline=col, width=1)
            draw.text((label_x, y - 19), num_str, fill="#FACC15", font=step_num_font)
            num_w = draw.textbbox((0, 0), num_str, font=step_num_font)[2]
            draw.text((label_x + num_w + 6, y - 19), label_text, fill="#F8FAFC", font=msg_font)

    # Draw Top & Bottom Actor Boxes (on top of lifelines)
    for a in actors:
        x = a["x"]
        w = 170
        h = actor_h

        # Top box
        box_top = [(x - w // 2, top_actor_y), (x + w // 2, top_actor_y + h)]
        draw.rounded_rectangle(box_top, radius=8, fill=a["bg"], outline=a["border"], width=2)
        
        t_box = draw.textbbox((0, 0), a["title"], font=actor_title_font)
        tw = t_box[2] - t_box[0]
        draw.text((x - tw / 2, top_actor_y + 12), a["title"], fill="#FFFFFF", font=actor_title_font)

        s_box = draw.textbbox((0, 0), a["sub"], font=actor_sub_font)
        sw = s_box[2] - s_box[0]
        draw.text((x - sw / 2, top_actor_y + 36), a["sub"], fill="#E2E8F0", font=actor_sub_font)

        # Bottom box
        box_bot = [(x - w // 2, bottom_actor_y), (x + w // 2, bottom_actor_y + h)]
        draw.rounded_rectangle(box_bot, radius=8, fill=a["bg"], outline=a["border"], width=2)
        
        draw.text((x - tw / 2, bottom_actor_y + 12), a["title"], fill="#FFFFFF", font=actor_title_font)
        draw.text((x - sw / 2, bottom_actor_y + 36), a["sub"], fill="#E2E8F0", font=actor_sub_font)

    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"✓ Successfully rendered UML Sequence Diagram to {output_path} ({WIDTH}x{HEIGHT})")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/test_sequence.png"
    render_sequence_diagram(out)
