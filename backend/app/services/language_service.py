# Small deterministic translations for the hackathon prototype.
# This avoids making the demo dependent on an external translation API.
# Replace with a validated translation service for a production system.

SUPPORTED_LANGUAGES = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
}

DEMO_TRANSLATIONS = {
    "te": {
        "This medicine is commonly used to help control blood sugar.": "ఈ మందు రక్తంలో చక్కెర స్థాయిని నియంత్రించడంలో సహాయపడుతుంది.",
        "Follow the prescription given by your doctor and ask a healthcare professional if you are unsure about your medicine.": "మీ వైద్యుడు ఇచ్చిన ప్రిస్క్రిప్షన్‌ను పాటించండి. మీ మందు గురించి సందేహం ఉంటే ఆరోగ్య నిపుణులను సంప్రదించండి.",
    },
    "hi": {
        "This medicine is commonly used to help control blood sugar.": "यह दवा आमतौर पर रक्त शर्करा को नियंत्रित करने में मदद करने के लिए उपयोग की जाती है.",
        "Follow the prescription given by your doctor and ask a healthcare professional if you are unsure about your medicine.": "अपने डॉक्टर द्वारा दिए गए प्रिस्क्रिप्शन का पालन करें। दवा के बारे में संदेह होने पर स्वास्थ्य विशेषज्ञ से सलाह लें।",
    },
}


def translate(text, target_language):
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError("Unsupported language. Use en, te, or hi.")

    if target_language == "en":
        return text

    return DEMO_TRANSLATIONS.get(target_language, {}).get(
        text,
        f"[{SUPPORTED_LANGUAGES[target_language]} translation for prototype]: {text}"
    )
