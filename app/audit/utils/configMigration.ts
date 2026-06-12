export interface MetricDef {
  id: string;
  label: string;
  description?: string;
}

export interface ModuleConfig {
  negative: MetricDef[];
  positive: MetricDef[];
  timers: MetricDef[];
}

export interface AuditConfigurationPayload {
  version: number;
  defaultVenueName: string;
  savedStaffProfiles: string[];
  modules: {
    BAR: ModuleConfig;
    RESTAURANT: ModuleConfig;
    HOTEL: ModuleConfig;
  };
}

export const DEFAULT_CONFIG: AuditConfigurationPayload = {
  version: 1,
  defaultVenueName: "",
  savedStaffProfiles: ["General / Unknown"],
  modules: {
    BAR: {
      negative: [
        { id: "freePours", label: "Free Pours", description: "Serving drinks without a jigger/optic." },
        { id: "incorrectMeasures", label: "Incorrect Measures", description: "Using wrong measure size (e.g., 50ml instead of 25ml)." },
        { id: "noRingIns", label: "No Ring Ins", description: "Taking cash but never entering the sale into the till." },
        { id: "chargeDiscrepancies", label: "Charge Discrepancies", description: "Undercharging friends or overcharging tourists." },
        { id: "tillLeftOpen", label: "Till Left Open", description: "Walking away while the cash drawer is wide open." },
        { id: "unrecordedWastage", label: "Unrecorded Wastage", description: "Dropping a drink without logging it in the wastage book." },
        { id: "givingAwayDrinks", label: "Giving Away Drinks", description: "Unauthorized free drinks or heavy 'comps'." },
        { id: "dirtyGlassware", label: "Dirty Glassware", description: "Serving in a glass with lipstick or chips." },
        { id: "usingPhone", label: "Using Phone", description: "Staff texting/browsing while customers wait." },
        { id: "eatingDrinking", label: "Eating / Drinking", description: "Consuming food/drink behind the bar." },
        { id: "underageStaff", label: "Underage Staff", description: "Under 18 serving alcohol without supervision." },
        { id: "noIdCheck", label: "No ID Check", description: "Failing to Challenge 25 young patrons." }
      ],
      positive: [
        { id: "immediateRingIn", label: "Immediate Ring-In", description: "Entering transactions the exact moment cash is taken." },
        { id: "consistentTillClosure", label: "Consistent Till Closure", description: "Keeping the drawer shut between transactions." },
        { id: "accurateChange", label: "Accurate Change Verifications", description: "Visually counting back change to customers." },
        { id: "immediateGreeting", label: "Immediate Greeting", description: "Acknowledging a guest within 30 seconds." },
        { id: "upselling", label: "Upselling", description: "Suggesting premium brands or larger pours." },
        { id: "efficiencyUnderPressure", label: "Efficiency Under Pressure", description: "Clean, methodical workflow during rush hour." },
        { id: "exactMeasurePouring", label: "Exact Measure Pouring", description: "Perfect use of jiggers/optics." },
        { id: "activeSpillLogging", label: "Active Spill Logging", description: "Immediately recording dropped drinks." },
        { id: "perfectGlassware", label: "Perfect Glassware", description: "Flawlessly clean, polished glasses used." },
        { id: "proactiveAgeVerification", label: "Proactive Age Verification", description: "Smoothly initiating Challenge 25 protocols." },
        { id: "responsibleService", label: "Responsible Service", description: "Politely cutting off over-served guests." },
        { id: "cleanlinessMaintenance", label: "Cleanliness Maintenance", description: "Wiping down the bar top instantly after service." }
      ],
      timers: [
        { id: "timeToGreet", label: "Time to Greet" },
        { id: "timeToServe", label: "Time to Serve" }
      ]
    },
    RESTAURANT: {
      negative: [
        { id: "offPocketCash", label: "Off-Pocket Cash", description: "Settling a bill with cash that goes into an apron, not the till." },
        { id: "unrecordedUpgrade", label: "Unrecorded Upgrade", description: "e.g., Adding truffle fries without charging the supplement." },
        { id: "tableSquatting", label: "Table Squatting", description: "Ignoring a table that clearly wants to pay and leave." },
        { id: "unauthComps", label: "Unauthorized Comps", description: "Giving away desserts or drinks without manager approval." },
        { id: "tillLeftOpen", label: "Till Left Open", description: "Leaving the POS cash drawer unlocked." },
        { id: "priceDiscrepancy", label: "Price Discrepancy", description: "Charging a different price than listed on the menu." }
      ],
      positive: [
        { id: "allergenVerification", label: "Allergen Verification", description: "Explicitly asking guests about allergies before taking the order." },
        { id: "highMarginUpsell", label: "High-Margin Upsell", description: "Suggesting sides, bottled water, or premium pairings." },
        { id: "billAccuracy", label: "Bill Accuracy", description: "Delivering the bill with 100% correct items." }
      ],
      timers: [
        { id: "timeToMenu", label: "Time to Menu" },
        { id: "timeToMains", label: "Time to Mains" }
      ]
    },
    HOTEL: {
      negative: [
        { id: "cashUpgradeLeak", label: "Cash Upgrade Leak", description: "Taking cash for a room upgrade and pocketing it." },
        { id: "idComplianceFail", label: "ID/Immigration Fail", description: "Failing to scan or record required passports for foreign guests." },
        { id: "guestDataExposure", label: "Guest Data Exposure", description: "Leaving guest registration cards or screens visible to the public." },
        { id: "deepCleanOversight", label: "Deep-Clean Oversight", description: "Missing obvious cleanliness issues in common areas or rooms." },
        { id: "amenitiesMalfunction", label: "Amenities Malfunction", description: "Broken keycards, missing towels, or empty soap dispensers not actioned." },
        { id: "unattendedDesk", label: "Unattended Desk", description: "Leaving the front desk entirely empty without a 'back in 5 mins' sign." }
      ],
      positive: [
        { id: "loyaltyPush", label: "Loyalty Push", description: "Actively encouraging sign-ups for the hotel rewards program." },
        { id: "preemptiveConcierge", label: "Preemptive Concierge", description: "Offering maps, dining tips, or umbrella assistance before being asked." },
        { id: "expressDeparture", label: "Express Departure", description: "Executing a flawless, rapid check-out process." }
      ],
      timers: [
        { id: "checkInDuration", label: "Check-In Duration" },
        { id: "roomLatency", label: "Room Latency" }
      ]
    }
  }
};

export const exportConfigToken = (payload: AuditConfigurationPayload): string => {
  try {
    const jsonStr = JSON.stringify(payload);
    // Use encodeURIComponent to safely handle special characters before Base64 encoding
    return btoa(encodeURIComponent(jsonStr));
  } catch (error) {
    console.error("Failed to export configuration token", error);
    return "";
  }
};

export const importConfigToken = (token: string): AuditConfigurationPayload | null => {
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const payload = JSON.parse(jsonStr);
    
    // Rigorous defensive validation
    if (!payload || typeof payload !== 'object') throw new Error("Invalid payload structure");
    if (payload.version !== 1) throw new Error("Unsupported token version");
    if (typeof payload.defaultVenueName !== 'string') throw new Error("Invalid defaultVenueName");
    if (!Array.isArray(payload.savedStaffProfiles)) throw new Error("Invalid savedStaffProfiles");
    if (!payload.modules || typeof payload.modules !== 'object') throw new Error("Missing modules configuration");
    
    // Ensure all modules exist
    ['BAR', 'RESTAURANT', 'HOTEL'].forEach(mod => {
      if (!payload.modules[mod]) throw new Error(`Missing module config for ${mod}`);
      ['negative', 'positive', 'timers'].forEach(arr => {
        if (!Array.isArray(payload.modules[mod][arr])) {
           throw new Error(`Missing array ${arr} in module ${mod}`);
        }
      });
    });

    return payload as AuditConfigurationPayload;
  } catch (error) {
    console.error("Configuration token import failed:", error);
    return null;
  }
};

export const getActiveConfiguration = (): AuditConfigurationPayload => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = localStorage.getItem('wh_global_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate loosely before returning to ensure we don't crash
      if (parsed.version === 1 && parsed.modules) return parsed;
    } catch (e) {}
  }
  return DEFAULT_CONFIG;
};

export const setActiveConfiguration = (payload: AuditConfigurationPayload) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wh_global_config', JSON.stringify(payload));
  }
};
