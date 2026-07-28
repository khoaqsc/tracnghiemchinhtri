var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var BANKS_FILE = import_path.default.join(DATA_DIR, "banks.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var savedBanksCache = null;
function loadBanks() {
  if (savedBanksCache) return savedBanksCache;
  if (import_fs.default.existsSync(BANKS_FILE)) {
    try {
      const content = import_fs.default.readFileSync(BANKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        savedBanksCache = { banks: parsed, updatedAt: Date.now() };
      } else if (parsed && Array.isArray(parsed.banks)) {
        savedBanksCache = { banks: parsed.banks, updatedAt: parsed.updatedAt || Date.now() };
      }
      return savedBanksCache;
    } catch (err) {
      console.error("Error reading banks.json:", err);
    }
  }
  return null;
}
function saveBanks(banks, updatedAt) {
  const ts = updatedAt || Date.now();
  const data = { banks, updatedAt: ts };
  savedBanksCache = data;
  try {
    import_fs.default.writeFileSync(BANKS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing banks.json:", err);
  }
}
var shareStore = {};
app.get("/api/banks", (req, res) => {
  const data = loadBanks();
  res.json({
    success: true,
    banks: data ? data.banks : null,
    updatedAt: data ? data.updatedAt : 0
  });
});
app.post("/api/banks", (req, res) => {
  const { banks, updatedAt } = req.body;
  if (!Array.isArray(banks)) {
    return res.status(400).json({ success: false, error: "Danh s\xE1ch ng\xE2n h\xE0ng kh\xF4ng h\u1EE3p l\u1EC7" });
  }
  const ts = typeof updatedAt === "number" ? updatedAt : Date.now();
  saveBanks(banks, ts);
  res.json({
    success: true,
    message: "\u0110\xE3 l\u01B0u th\xE0nh c\xF4ng l\xEAn m\xE1y ch\u1EE7! M\u1ECDi thi\u1EBFt b\u1ECB k\u1EBFt n\u1ED1i \u0111\u1EC1u c\xF3 th\u1EC3 xem d\u1EEF li\u1EC7u n\xE0y.",
    updatedAt: new Date(ts).toISOString()
  });
});
app.post("/api/share", (req, res) => {
  const { bank } = req.body;
  if (!bank || !bank.title) {
    return res.status(400).json({ success: false, error: "D\u1EEF li\u1EC7u b\u1ED9 \u0111\u1EC1 kh\xF4ng h\u1EE3p l\u1EC7" });
  }
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  shareStore[code] = {
    ...bank,
    sharedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({
    success: true,
    code,
    message: `M\xE3 chia s\u1EBB: ${code}`
  });
});
app.get("/api/share/:code", (req, res) => {
  const code = req.params.code;
  const bank = shareStore[code];
  if (!bank) {
    return res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y b\u1ED9 \u0111\u1EC1 v\u1EDBi m\xE3 chia s\u1EBB n\xE0y" });
  }
  res.json({ success: true, bank });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
