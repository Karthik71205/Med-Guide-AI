DISCLAIMER = (
    "MedGuide AI provides informational assistance and does not replace "
    "professional medical advice. Do not start, stop, or change medication "
    "without consulting a qualified healthcare professional."
)


def analyze_medicine_for_profile(medicine, profile):
    conditions = {
        condition.lower().strip()
        for condition in profile.get("conditions", [])
    }

    condition_notes = []
    relevant_flags = []

    for rule in medicine.get("condition_rules", []):
        condition = rule["condition"].lower()
        if condition in conditions:
            relevant_flags.append(rule["level"])
            condition_notes.append({
                "condition": rule["condition"],
                "message": rule["message"],
                "level": rule["level"]
            })

    dosage_message = (
        "Follow the dosage and schedule written on your prescription. "
        "Do not change it based only on this application."
    )

    # Import here to avoid a circular import:
    # ai_service uses the deterministic fallback in this module.
    from .ai_service import generate_patient_friendly_explanation

    simple_explanation, explanation_engine = generate_patient_friendly_explanation(
        medicine=medicine,
        profile=profile,
        condition_notes=condition_notes
    )

    return {
        "medicine": medicine["name"],
        "generic_name": medicine["generic_name"],
        "uses": medicine["uses"],
        "precautions": medicine["precautions"],
        "common_side_effects": medicine["common_side_effects"],
        "prescription_guidance": dosage_message,
        "personalized_flags": condition_notes,
        "risk_levels_detected": sorted(set(relevant_flags)),
        "simple_explanation": simple_explanation,
        "explanation_engine": explanation_engine,
        "disclaimer": DISCLAIMER
    }


def build_simple_explanation(medicine, condition_notes):
    uses = "; ".join(medicine["uses"][:2])
    text = f"This medicine is commonly used for {uses.lower()}."

    if condition_notes:
        text += " Based on the health conditions saved in your profile, the following information may be relevant: "
        text += " ".join(note["message"] for note in condition_notes)
    else:
        text += " No profile-specific note was found in the prototype knowledge base."

    text += (
        " Follow the prescription given by your doctor and ask a healthcare "
        "professional if you are unsure about your medicine."
    )

    return text
