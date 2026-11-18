import type { NextApiRequest, NextApiResponse } from "next";
import os from "os";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // If user configured an explicit public base url (e.g. ngrok or domain), use it
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return res.status(200).json({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });
  }

  // Otherwise detect active LAN IPv4
  const interfaces = os.networkInterfaces();
  let detectedIp = "localhost";

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        // Skip WSL or Hyper-V virtual bridges if Wi-Fi/Ethernet is available
        if (!name.toLowerCase().includes("vethernet") && !name.toLowerCase().includes("hyper-v")) {
          detectedIp = net.address;
          break;
        }
        if (detectedIp === "localhost") {
          detectedIp = net.address;
        }
      }
    }
    if (detectedIp !== "localhost" && !detectedIp.startsWith("192.168.112")) {
      break;
    }
  }

  return res.status(200).json({ baseUrl: `http://${detectedIp}:3000` });
}
