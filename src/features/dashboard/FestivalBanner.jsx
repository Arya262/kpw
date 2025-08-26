// Single API for session handling (login + QR)
app.get("/session/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // If client already exists AND is ready
    if (clients[id] && clients[id].info) {
      return res.json({
        status: "active",
        sessionId: id,
        message: `Session ${id} already active`
      });
    }

    // Create a new client if not exists
    if (!clients[id]) {
      createClient(id);
    }

    // Only respond if QR is generated
    if (qrCodes[id]) {
      return res.json({
        status: "pending",
        sessionId: id,
        qr: qrCodes[id]
      });
    }

    // 👇 If QR is not yet generated → keep request open until it is
    const checkInterval = setInterval(() => {
      if (qrCodes[id]) {
        clearInterval(checkInterval);
        return res.json({
          status: "pending",
          sessionId: id,
          qr: qrCodes[id]
        });
      }
      if (clients[id] && clients[id].info) {
        clearInterval(checkInterval);
        return res.json({
          status: "active",
          sessionId: id,
          message: `Session ${id} already active`
        });
      }
    }, 1000);

    // Optional timeout safeguard (after 30s, end request)
    setTimeout(() => {
      clearInterval(checkInterval);
      res.status(408).json({
        status: "timeout",
        sessionId: id,
        message: "QR not generated in time"
      });
    }, 30000);

  } catch (err) {
    console.error("Error handling session:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to create or show session"
    });
  }
});