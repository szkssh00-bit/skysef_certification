import functions from '@google-cloud/functions-framework';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import sgMail from '@sendgrid/mail';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, 'template');

const mime = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function assetDataUri(filename) {
  const ext = path.extname(filename).toLowerCase();
  const buffer = fs.readFileSync(path.join(templateDir, filename));
  return `data:${mime[ext] || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
}

function buildHtml({ name, school }) {
  const css = fs.readFileSync(path.join(templateDir, 'certificate.css'), 'utf8');
  let html = fs.readFileSync(path.join(templateDir, 'certificate.html'), 'utf8');
  const replacements = {
    '{{CSS}}': css,
    '{{NAME}}': escapeHtml(name || 'Name'),
    '{{SCHOOL}}': escapeHtml(school || 'School'),
    '{{BORDER_IMAGE}}': assetDataUri('certificate-border.jpeg'),
    '{{SKYSEF_LOGO}}': assetDataUri('skysef-logo.jpeg'),
    '{{SHIZUOKA_LOGO}}': assetDataUri('shizuoka-logo.png'),
    '{{SEAL_IMAGE}}': assetDataUri('principal-seal.png')
  };
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(key, value);
  }
  return html;
}

async function createPdfBuffer(html) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
  } finally {
    await browser.close();
  }
}

async function sendPdfEmail({ to, cc, subject, body, filename, pdfBuffer }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('SENDGRID_API_KEY and MAIL_FROM are required when sendEmail=true.');
  }

  sgMail.setApiKey(apiKey);
  await sgMail.send({
    to,
    cc: cc || undefined,
    from,
    subject: subject || 'SKYSEF Certificate of Participation',
    text: body || 'Please find the attached certificate of participation.',
    attachments: [{
      content: Buffer.from(pdfBuffer).toString('base64'),
      filename,
      type: 'application/pdf',
      disposition: 'attachment'
    }]
  });
}

functions.http('generateCertificate', async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST only' });
      return;
    }

    const expectedKey = process.env.WEBHOOK_API_KEY;
    if (expectedKey && req.get('X-Api-Key') !== expectedKey) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    const data = req.body || {};
    const name = data.name || data.Name || data['氏名'];
    const school = data.school || data.School || data['学校名'];
    const email = data.email || data.Email || data['メールアドレス'];
    const sendEmail = Boolean(data.sendEmail || data.send_email);

    if (!name || !school) {
      res.status(400).json({ error: 'name and school are required' });
      return;
    }

    const html = buildHtml({ name, school });
    const pdfBuffer = await createPdfBuffer(html);
    const safeName = String(name).replace(/[\\/:*?"<>|]/g, '_').trim() || 'participant';
    const filename = `SKYSEF_Certificate_${safeName}.pdf`;

    if (sendEmail) {
      if (!email) {
        res.status(400).json({ error: 'email is required when sendEmail=true' });
        return;
      }
      await sendPdfEmail({
        to: email,
        cc: data.cc,
        subject: data.subject,
        body: data.body,
        filename,
        pdfBuffer
      });
      res.json({ ok: true, mode: 'email', filename });
      return;
    }

    if (data.returnBase64) {
      res.json({
        ok: true,
        filename,
        mimeType: 'application/pdf',
        base64: Buffer.from(pdfBuffer).toString('base64')
      });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || String(error) });
  }
});
