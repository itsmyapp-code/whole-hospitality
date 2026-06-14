export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
}

export interface ChecklistSubSection {
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  subsections: ChecklistSubSection[];
}

export const OVERT_HOTEL_CHECKLIST: ChecklistSection[] = [
  {
    id: "section1",
    title: "SECTION 1: FRONT DESK & PUBLIC AREAS (Hospitality & Service)",
    subsections: [
      {
        title: "1.1 Arrival & Hospitality",
        items: [
          { id: "1_1_1", label: "First Impression", description: "Staff display a warm, unprompted smile and immediate eye contact within 10 seconds of a guest crossing the threshold." },
          { id: "1_1_2", label: "Tone of Voice", description: "Staff conversation is natural, welcoming, and genuinely helpful rather than stiff, transactional, or robotic." },
          { id: "1_1_3", label: "Greeting Protocol", description: "Staff use appropriate verbal greetings and identify the guest's name early in the transaction." },
          { id: "1_1_4", label: "Anticipating Needs", description: "Staff proactively offer directions to hotel amenities, explain breakfast/dining times, and ask about travel arrangements without being prompted." },
          { id: "1_1_5", label: "Luggage & Escort", description: "Staff proactively offer luggage assistance and physically escort guests to their bedrooms." },
          { id: "1_1_6", label: "Staff Appearance", description: "All front-of-house team members wear pristine, uncreased uniforms complete with visible name badges." }
        ]
      },
      {
        title: "1.2 Reception Service & Administration",
        items: [
          { id: "1_2_1", label: "Check-In Velocity", description: "Total duration from initial greeting to room key handover is efficient and does not exceed 3 minutes under normal conditions." },
          { id: "1_2_2", label: "Booking Accuracy", description: "Walkthrough of a live reservation reveals instant, transparent pricing matching the confirmation email exactly." },
          { id: "1_2_3", label: "Key Card Security", description: "The physical card encoder terminal is password protected; it does not allow duplicate master keys to be cut without a logged manager login." },
          { id: "1_2_4", label: "Data Exposure Check", description: "Guest registration cards, printed arrival lists, and room numbers are kept completely flat and hidden from the public side of the reception desk." },
          { id: "1_2_5", label: "Key Safety Delivery", description: "Staff pass room keys discretely and never speak a guest's room number out loud in front of other waiting patrons." },
          { id: "1_2_6", label: "Desk Coverage", description: "Reception is monitored at all times, or features a clear, high-quality call system/bell if a lone worker steps into the back office." }
        ]
      },
      {
        title: "1.3 Public Areas & Kerb Appeal",
        items: [
          { id: "1_3_1", label: "Kerb Appeal & Signage", description: "External hotel signage is clean and illuminated. Exterior paintwork, masonry, and entryway steps are pristine and free of debris." },
          { id: "1_3_2", label: "Gardens & Pathways", description: "Public garden spaces, patios, and walkways are swept, manicured, and free of discarded glassware or weeds." },
          { id: "1_3_3", label: "Night-Time Lighting", description: "Car parks, structural drop-off points, and external pathways feature bright, working safety lights." },
          { id: "1_3_4", label: "Corridors & Stairwells", description: "Internal thoroughfares are completely free of housekeeping carts, dirty linen bags, or maintenance obstructions; walls are entirely free of scuffs." },
          { id: "1_3_5", label: "Public Restrooms", description: "Checked for immaculate tile grout, sparkling chrome fixtures, zero watermarks/hair, ample premium hand towels, and a signed hourly cleaning log." },
          { id: "1_3_6", label: "Lounge & Bar Seating", description: "Public lounge upholstery is entirely crumb-free, carpets are perfectly vacuumed, and furniture layouts are spaced to ensure guest privacy." }
        ]
      }
    ]
  },
  {
    id: "section2",
    title: "SECTION 2: THE WET TRADE & CELLAR (Margin Protection & Infrastructure)",
    subsections: [
      {
        title: "2.1 EPoS & Cash System Integrity",
        items: [
          { id: "2_1_1", label: "Till Drawer Latches", description: "Physical check of all bar EPoS drawers confirms they click completely shut automatically; latches are not taped, jammed, or wedged open." },
          { id: "2_1_2", label: "Cash Drop Protocols", description: "Review of the shift-drop log verifies that all cash drops are witnessed and double-signed by both the bartender and a manager." },
          { id: "2_1_3", label: "PMS-to-EPoS Integration", description: "Live synchronization check confirms that a beverage ordered at a bar terminal hits the guest's bedroom folio instantly, eliminating unbilled late departures." },
          { id: "2_1_4", label: "Manager Key Security", description: "EPoS administrative override keys or swipe cards are physically held by managers on duty and never left dangling in the terminal slots." }
        ]
      },
      {
        title: "2.2 Bar Station & Pour Controls",
        items: [
          { id: "2_2_1", label: "Measure Compliance", description: "Verification that every active bar well contains an abundance of government-stamped thimble measures, entirely removing staff justification for 'eyeballing' pours." },
          { id: "2_2_2", label: "Optic Seals", description: "Physical inspection of wall and shelf optics confirms an airtight seal with zero leakage or dripping of premium spirits." },
          { id: "2_2_3", label: "Waste Tracking", description: "Review of a live waste tablet or clipboard sheet shows every broken glass, bad pour, or flat mixer is actively logged with a staff signature." },
          { id: "2_2_4", label: "Post-Mix & Gas Monitoring", description: "Walkthrough of soft drink syrup levels confirms all stock is well within its best-before date; gas lines are checked for pressure drops to prevent silent CO2 leakage." }
        ]
      },
      {
        title: "2.3 Cellar Management",
        items: [
          { id: "2_3_1", label: "Remote Temperature Control", description: "Cellar cooling systems are verified as holding a constant temperature between 11°C and 13°C without drawing excess peak electricity." },
          { id: "2_3_2", label: "Line-Cleaning Cost Log", description: "Inspect the management ledger to verify that beer discarded during mandatory line-cleaning rotations is recorded as an operational cost rather than disappearing into general stock variance." },
          { id: "2_3_3", label: "Keg & Cask Rotation", description: "Stock layout confirms a strict First In, First Out (FIFO) system is physically arranged, preventing older stock from being forgotten in dark corners." }
        ]
      }
    ]
  },
  {
    id: "section3",
    title: "SECTION 3: THE BEDROOMS & BATHROOMS",
    subsections: [
      {
        title: "3.1 Bedroom Cleanliness",
        items: [
          { id: "3_1_1", label: "High-Ledge Dusting", description: "Zero dust accumulation on wardrobe tops, picture frames, high window valances, and hanging light fixtures." },
          { id: "3_1_2", label: "Baseboards & Radiators", description: "Baseboards, trunking, and individual radiator fins are wiped clean and entirely lint-free." },
          { id: "3_1_3", label: "Under-Bed Inspection", description: "Carpet spaces beneath bed frames and heavy lounge chairs are vacuumed perfectly." },
          { id: "3_1_4", label: "Linens & Protectors", description: "Fresh bed linens are completely crisp and uncreased; mattress and pillow protectors are pristine, stainless, and replaced regularly." },
          { id: "3_1_5", label: "Glass & Mirrors", description: "Bedside mirrors, dressing tables, and window panes are 100% free of streaks, smudges, and fingerprints." }
        ]
      },
      {
        title: "3.2 Bedroom Amenities & Comfort",
        items: [
          { id: "3_2_1", label: "The Bed Foundation", description: "Physical test confirms a high-intrinsic quality, supportive mattress with a minimum of two distinct pillow densities available per guest." },
          { id: "3_2_2", label: "Heating & Ventilation", description: "Room features easily adjustable, intuitive climate/radiator controls; historic sash or casement windows are verified draft-free." },
          { id: "3_2_3", label: "Lighting Ergonomics", description: "Functional bedside reading lights work independently; main room light switches are easily reachable from a resting position in bed." },
          { id: "3_2_4", label: "Storage & Power Utility", description: "Wardrobes contain matching, sturdy wooden hangers; dressing desks are clutter-free with easily accessible, unblocked power sockets and USB ports." },
          { id: "3_2_5", label: "Hospitality Tray presentation", description: "Kettles are entirely descaled and spotless inside; fresh milk options are presented in clean chill-flasks or a mini-fridge; premium loose-leaf or branded teas and coffees are stocked neatly." }
        ]
      },
      {
        title: "3.3 Bathroom Structure & Performance",
        items: [
          { id: "3_3_1", label: "Grout & Silicone Seals", description: "Tile grout and shower tray silicone lines are checked for spotless white finishes with zero mold, discolouration, or peeling." },
          { id: "3_3_2", label: "Water Pressure & Delivery", description: "Showers and basin taps achieve strong, consistent water pressure and rapid hot water delivery (under 15 seconds)." },
          { id: "3_3_3", label: "Thermostatic Integrity", description: "Shower valves are tested against temperature spikes when other bathroom fixtures or nearby toilets are operated simultaneously." },
          { id: "3_3_4", label: "Fixtures Security", description: "Toilet seats, towel rails, shower doors, and privacy hooks are firmly anchored and do not wobble." },
          { id: "3_3_5", label: "Towel Quality & Presentation", description: "Towels are exceptionally soft, plush, and provided in true bath-sheet sizes alongside branded, premium toiletries displayed in immaculate holders." }
        ]
      },
      {
        title: "3.4 Room Energy Controls",
        items: [
          { id: "3_4_1", label: "Void Room Energy Leakage", description: "Spot check of unoccupied, clean rooms reveals whether lighting has been switched off and heating dialed down to a baseline economy setting (16°C–18°C) to prevent massive utility bill inflation." }
        ]
      }
    ]
  },
  {
    id: "section4",
    title: "SECTION 4: THE RESTAURANT & KITCHEN",
    subsections: [
      {
        title: "4.1 Dining Presentation & Service Execution",
        items: [
          { id: "4_1_1", label: "Table Settings", description: "Restaurant tables feature immaculate linens or pristine, unmarred tabletops; cutlery is polished to a mirror finish, and glassware is completely clear of water spots." },
          { id: "4_1_2", label: "Local Sourcing Validation", description: "Menu descriptions of premium local produce are cross-referenced with live kitchen delivery invoices to maintain quality credentials." },
          { id: "4_1_3", label: "Service Temperature Control", description: "High-quality plates are physically warmed in a hot-cupboard prior to hot food plating; cold dishes are served on chilled crockery." },
          { id: "4_1_4", label: "Culinary Execution Spot-Check", description: "Breakfast and evening dishes match exact design specifications (e.g., breakfast poached eggs feature firm whites with liquid, running yolks; steaks match requested temperatures precisely)." },
          { id: "4_1_5", label: "Floor Clearance Speed", description: "Floor observations confirm that empty glassware and finished dining plates are cleared from guest tables within 3 minutes of consumption." }
        ]
      },
      {
        title: "4.2 Kitchen Margin & Portion Controls",
        items: [
          { id: "4_2_1", label: "Prep Station Measurement", description: "Scales are actively positioned and utilized across all protein prep stations (meat, fish) to guarantee consistency and eliminate profit leakage from oversized portions cut by eye." },
          { id: "4_2_2", label: "Cold Storage Organization", description: "Walk-in fridges and freezers display strict First In, First Out (FIFO) layouts with all items clearly dated, labeled, and securely sealed." },
          { id: "4_2_3", label: "High-Value Ingredient Security", description: "Premium stock lines are tracked in a secure section of the cooler with quantities cross-referenced daily against the kitchen EPoS ticket sales." }
        ]
      }
    ]
  },
  {
    id: "section5",
    title: "SECTION 5: MANDATORY ENTRY & STATUTORY COMPLIANCE",
    subsections: [
      {
        title: "5.1 Statutory Requirements",
        items: [
          { id: "5_1_1", label: "Insurance Validity", description: "Public Liability and Employers' Liability Insurance certificates are valid, up to date, and stored safely or displayed appropriately." },
          { id: "5_1_2", label: "Fire Safety Infrastructure", description: "The property possesses an up-to-date, legally compliant Fire Risk Assessment, with all emergency exit routes clear, illuminated, and unchained." },
          { id: "5_1_3", label: "Food Hygiene Rating", description: "The kitchen holds a valid registration and maintains a current 5-Star Food Hygiene Rating with the local Environmental Health department." },
          { id: "5_1_4", label: "UK GDPR / Data Privacy Protocol", description: "Physical guest check-in cards and printed registration data are locked inside a secure office drawer nightly; front-of-house EPoS terminals mask card digits completely on all merchant receipts." },
          { id: "5_1_5", label: "Accessibility Statement", description: "The property maintains an accurate, updated, and transparent physical Access Statement detailing specific facility parameters for disabled or mobility-impaired guests." }
        ]
      }
    ]
  }
];
