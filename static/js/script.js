
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // GEMINI CHAT API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "Gemini API key is not configured." },
            { status: 503 }
          );
        }

        const data = await request.json();
        const message = String(data.message || "").trim();

        if (!message || message.length > 8000) {
          return Response.json(
            { error: "Please enter a valid message." },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{
                  text: "You are ABLEX AI, a friendly, helpful multilingual AI assistant. Reply in the same language as the user unless they request another language. Be clear, accurate and encouraging."
                }]
              },
              contents: [{
                role: "user",
                parts: [{ text: message }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
              }
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return Response.json(
            { error: result.error?.message || "Gemini could not answer." },
            { status: 502 }
          );
        }

        const reply = result.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("")
          .trim();

        if (!reply) {
          return Response.json(
            { error: "No answer received. Please try again." },
            { status: 502 }
          );
        }

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          { error: "Unable to connect. Please try again." },
          { status: 500 }
        );
      }
    }

    // WEBSITE
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#080719">
<meta name="description" content="Meet ABLEX AI, your intelligent multilingual AI assistant.">
<title>ABLEX AI | Your AI. Your World.</title>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html { scroll-behavior: smooth; }

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #080719;
  color: #ffffff;
  overflow-x: hidden;
}

header {
  min-height: 76px;
  padding: 0 8%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0d0b24;
  border-bottom: 1px solid #29204c;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 1px;
}

.logo span { color: #a78bfa; }

nav {
  display: flex;
  gap: 28px;
}

nav a {
  color: #ded9f5;
  text-decoration: none;
  font-size: 14px;
}

nav a:hover { color: #c4b5fd; }

.hero {
  min-height: 570px;
  padding: 85px 20px 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(
    ellipse at 50% 45%,
    #302064 0%,
    #17102f 38%,
    #080719 75%
  );
}

.tag {
  color: #c4b5fd;
  letter-spacing: 4px;
  font-size: 12px;
  font-weight: bold;
}

.hero h1 {
  font-size: clamp(43px, 8vw, 78px);
  margin: 25px 0;
  line-height: 1.12;
}

.gradient {
  background: linear-gradient(90deg, #c4b5fd, #8b5cf6, #e9d5ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero p {
  color: #c9c3df;
  max-width: 650px;
  font-size: 17px;
  line-height: 1.8;
}

.orb {
  width: 150px;
  height: 150px;
  margin: 40px auto 30px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    #f0d9ff,
    #a78bfa 25%,
    #6d28d9 58%,
    #1e104b 80%
  );
  box-shadow: 0 0 35px #8b5cf6, 0 0 90px #5b21b6;
}

.primary-button {
  display: inline-block;
  margin-top: 22px;
  padding: 15px 27px;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border: 1px solid #c4b5fd;
  border-radius: 30px;
  color: white;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 25px #8b5cf6;
}

.section { padding: 75px 8%; }

.section-heading {
  text-align: center;
  margin-bottom: 40px;
}

.section-heading h2 {
  font-size: 34px;
  margin-bottom: 12px;
}

.section-heading p { color: #aaa3c5; }

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.feature-card {
  background: linear-gradient(145deg, #1c1739, #100e25);
  border: 1px solid #392a62;
  border-radius: 18px;
  padding: 32px 24px;
  text-align: center;
  transition: 0.25s;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #a78bfa;
  box-shadow: 0 10px 35px #3b1b6b55;
}

.feature-icon {
  font-size: 38px;
  margin-bottom: 17px;
}

.feature-card h3 {
  color: #c4b5fd;
  margin-bottom: 12px;
}

.feature-card p {
  color: #bbb4d2;
  line-height: 1.7;
}

.chat-section {
  max-width: 850px;
  margin: 30px auto 80px;
  padding: 35px;
  background: linear-gradient(145deg, #1b1637, #100e24);
  border: 1px solid #49346e;
  border-radius: 22px;
  box-shadow: 0 0 55px #5b21b622;
}

.chat-section h2 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 30px;
}

.chat-subtitle {
  text-align: center;
  color: #aaa3c5;
  margin-bottom: 25px;
}

#messages {
  height: 320px;
  overflow-y: auto;
  padding: 18px;
  background: #090819;
  border: 1px solid #30234f;
  border-radius: 14px;
  margin-bottom: 18px;
}

.message {
  max-width: 85%;
  padding: 13px 16px;
  border-radius: 14px;
  margin-bottom: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.bot {
  background: #21183e;
  border: 1px solid #443064;
  color: #eee8ff;
}

.user {
  background: #673ab7;
  margin-left: auto;
  color: white;
}

form {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #49346e;
  background: #0b0920;
  color: white;
  font-size: 15px;
  outline: none;
}

input:focus { border-color: #a78bfa; }

.send-button {
  padding: 0 24px;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.about {
  text-align: center;
  background: #100d25;
  border-top: 1px solid #30234f;
}

.about p {
  max-width: 650px;
  margin: 15px auto;
  color: #bcb4d5;
  line-height: 1.8;
}

footer {
  padding: 25px;
  text-align: center;
  color: #8f87aa;
  background: #090819;
  font-size: 13px;
}

@media (max-width: 700px) {
  header { padding: 0 5%; }
  nav { gap: 12px; }
  nav a { font-size: 12px; }
  .features { grid-template-columns: 1fr; }
  .section { padding: 55px 6%; }
  .chat-section {
    margin: 20px 12px 55px;
    padding: 20px 14px;
  }
  form { gap: 7px; }
  .send-button { padding: 0 16px; }
}
</style>
</head>

<body>
<header>
  <div class="logo">ABLEX <span>AI</span></div>
  <nav>
    <a href="#home">Home</a>
    <a href="#features">Features</a>
    <a href="#about">About</a>
  </nav>
</header>

<main>
<section class="hero" id="home">
  <div class="tag">✦ THE FUTURE OF AI</div>
  <h1>Your AI.<br><span class="gradient">Your World.</span></h1>
  <p>Meet ABLEX AI — your intelligent multilingual assistant for learning, creating and exploring.</p>
  <div class="orb"></div>
  <a class="primary-button" href="#chat">Start Exploring →</a>
</section>

<section class="section" id="features">
  <div class="section-heading">
    <h2>Explore <span class="gradient">ABLEX AI</span></h2>
    <p>Intelligent features. One powerful assistant.</p>
  </div>

  <div class="features">
    <div class="feature-card">
      <div class="feature-icon">💬</div>
      <h3>Smart Chat</h3>
      <p>Ask questions, discover ideas and get helpful answers.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎙️</div>
      <h3>Voice AI</h3>
      <p>Voice features are part of our future roadmap.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🌍</div>
      <h3>Multilingual</h3>
      <p>Communicate with ABLEX AI in different languages.</p>
    </div>
  </div>
</section>

<section class="section" id="chat">
  <div class="chat-section">
    <h2>Meet Your <span class="gradient">AI Assistant</span></h2>
    <p class="chat-subtitle">Start a conversation with ABLEX.</p>

    <div id="messages" aria-live="polite">
      <div class="message bot">Hello! I'm ABLEX AI. How can I help you today?</div>
    </div>

    <form id="chat-form">
      <input
        id="user-input"
        type="text"
        placeholder="Message ABLEX AI..."
        autocomplete="off"
        maxlength="8000"
        required
      >
      <button class="send-button" id="send-button" type="submit">Send ➤</button>
    </form>
  </div>
</section>

<section class="section about" id="about">
  <div class="section-heading">
    <h2>Built for <span class="gradient">Tomorrow</span></h2>
    <p>One assistant. Endless possibilities.</p>
  </div>
  <p>ABLEX AI is designed to make artificial intelligence more accessible, helpful and multilingual.</p>
</section>
</main>

<footer>© 2026 ABLEX AI. Built with curiosity and innovation.</footer>

<script>
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");
const button = document.getElementById("send-button");

function addMessage(text, type) {
  const item = document.createElement("div");
  item.className = "message " + type;
  item.textContent = text;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  return item;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message || button.disabled) return;

  addMessage(message, "user");
  input.value = "";
  button.disabled = true;

  const loading = addMessage("ABLEX AI is thinking...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      loading.textContent = data.error || "Something went wrong.";
    } else {
      loading.textContent = data.reply || "No response received.";
    }
  } catch (error) {
    loading.textContent = "Unable to connect. Please try again.";
  } finally {
    button.disabled = false;
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
});
</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-store"
      }
    });
  }
};
