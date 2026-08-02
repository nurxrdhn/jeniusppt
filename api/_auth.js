export async function requireFirebaseUser(req, res) {
  const token = String(req.headers.authorization || "").replace(
    /^Bearer\s+/i,
    "",
  );
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!token || !apiKey) {
    res
      .status(401)
      .json({
        error:
          "Sesi login tidak valid atau FIREBASE_WEB_API_KEY belum dipasang.",
      });
    return null;
  }
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  const data = await response.json();
  if (!response.ok || !data.users?.[0]) {
    res.status(401).json({ error: "Silakan login kembali." });
    return null;
  }
  return data.users[0];
}
