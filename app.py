import os
from flask import Flask, render_template, request, jsonify
from google import genai

app = Flask(__name__)

MODEL = "gemini-3.5-flash-lite"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "Please enter a message."}), 400

    if len(message) > 8000:
        return jsonify({"error": "Your message is too long."}), 400

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "error": "The AI service is not configured yet."
        }), 503

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=MODEL,
            contents=message,
            config={
                "system_instruction": (
                    "You are ABLEX AI, a friendly and helpful "
                    "multilingual assistant. Reply in the same "
                    "language as the user's message unless they "
                    "request another language."
                ),
                "max_output_tokens": 700
            }
        )

        return jsonify({
            "reply": response.text or "I couldn't generate a response."
        })

    except Exception:
        app.logger.exception("Gemini request failed")
        return jsonify({
            "error": "ABLEX AI is temporarily unavailable. Please try again."
        }), 502


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
