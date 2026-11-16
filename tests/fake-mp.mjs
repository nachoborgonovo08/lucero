// Simulador mínimo de la API de suscripciones de Mercado Pago, solo para las pruebas e2e.
import { createServer } from "node:http";

const pre = new Map();
const pay = new Map();
let n = 0;
const json = (res, code, body) => res.writeHead(code, { "Content-Type": "application/json" }).end(JSON.stringify(body));

createServer(async (req, res) => {
  let raw = "";
  for await (const c of req) raw += c;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://x");
  const m = url.pathname.match(/^\/(preapproval|authorized_payments|_pay)(?:\/(.+))?$/);
  if (!m) return json(res, 404, {});
  if (m[1] !== "_pay" && req.headers.authorization !== "Bearer TEST-fake-token") return json(res, 401, {});

  if (m[1] === "preapproval" && req.method === "POST") {
    if (body.payer_email === "rechazado@test.local") return json(res, 400, { message: "payer_email invalid" });
    const id = `pre_${++n}`;
    pre.set(id, { ...body, id, init_point: `http://127.0.0.1:4010/checkout?preapproval_id=${id}` });
    return json(res, 201, pre.get(id));
  }
  if (m[1] === "preapproval" && pre.has(m[2])) {
    if (req.method === "PUT") Object.assign(pre.get(m[2]), body);
    return json(res, 200, pre.get(m[2]));
  }
  if (m[1] === "_pay") {
    // Simula que el cliente pagó: autoriza la suscripción y crea un cobro aprobado.
    pre.get(m[2]).status = "authorized";
    const id = `${1000 + ++n}`;
    pay.set(id, { id, preapproval_id: m[2], transaction_amount: 19900, currency_id: "ARS", status: "processed", payment: { id: 1, status: "approved" } });
    return json(res, 200, { payment_id: id });
  }
  if (m[1] === "authorized_payments" && pay.has(m[2])) return json(res, 200, pay.get(m[2]));
  json(res, 404, {});
}).listen(4010, "127.0.0.1", () => console.log("fake MP en :4010"));
