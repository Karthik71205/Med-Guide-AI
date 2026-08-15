import os

from flask import current_app

from .personalization_service import build_simple_explanation


SYSTEM_INSTRUCTIONS = """
You are the patient-friendly explanation layer of MedGuide AI.
You are NOT a doctor and must not diagnose, prescribe, calculate a new dose,
recommend starting/stopping/changing medication, or override a physician.

Use only the medicine information supplied by the application.
Explain it in short, simple language for an ordinary patient.
Mention relevant profile-specific notes, precautions and common side effects.
For dosage, say that the user should follow the physician's prescription.
Do not invent medical facts.
"""


def generate_patient_friendly_explanation(medicine, profile, condition_notes):
    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not api_key:
        return build_simple_explanation(medicine, condition_notes), "prototype_fallback"

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        model = current_app.config.get("OPENAI_MODEL", "gpt-5.5")

        prompt = {
            "medicine": {
                "name": medicine["name"],
                "generic_name": medicine["generic_name"],
                "uses": medicine["uses"],
                "precautions": medicine["precautions"],
                "common_side_effects": medicine["common_side_effects"],
            },
            "patient_profile": {
                "age": profile.get("age"),
                "sex": profile.get("sex"),
                "weight_kg": profile.get("weight_kg"),
                "conditions": profile.get("conditions", []),
            },
            "profile_specific_notes": condition_notes,
            "dosage_rule": "Never provide a new dose. Tell the user to follow the physician's prescription.",
        }

        response = client.responses.create(
            model=model,
            instructions=SYSTEM_INSTRUCTIONS,
            input=str(prompt),
        )

        return response.output_text.strip(), "openai_responses_api"

    except Exception:
        # A hackathon demo should still work if the external AI service is unavailable.
        return build_simple_explanation(medicine, condition_notes), "prototype_fallback"
