const contactStr = 'ติดต่อ: 056-717-100 1121 1122';
let cleaned = String(contactStr).replace(/^เบอร์โทรศัพท์\s*:\s*/i, '').trim();
const rawParts = cleaned.split(/(?:,|\sหรือ\s|;|\r?\n)/i).map(p => p.trim()).filter(Boolean);
console.log('Initial cleaned:', cleaned);
console.log('Initial rawParts:', rawParts);
let parts = [];
for (let i = 0; i < rawParts.length; i++) {
  let p = rawParts[i];
  console.log('\nIteration', i, 'p=', p);
  if (/^https?:$/i.test(p) && rawParts[i+1]) { p = p + rawParts[i+1]; i++; console.log(' merged https'); }
  if (/(facebook\.com|www\.|https?:)/i.test(p) && i+1 < rawParts.length) {
    while (i+1 < rawParts.length && (/^[\?=&]/.test(rawParts[i+1]) || /facebook\.com|www\.|\./i.test(rawParts[i+1]))) {
      p += rawParts[i+1];
      i++; console.log(' merged domain part', rawParts[i]);
    }
  }
  if (/^ต่อ\s*$/i.test(p) && parts.length > 0) { const lastIdx = parts.length - 1; const last = parts[lastIdx]; if (/\b0[- \d]{8,15}\d\b/.test(last)) { parts[lastIdx] = `${last} ต่อ`; console.log(' attached lone ต่อ to prev'); continue; } }
  const phoneWithExtMatch = p.match(/(0[- \d]{8,15}\d)\s+([0-9][0-9,\s,]*)$/);
  if (phoneWithExtMatch) {
    p = phoneWithExtMatch[1];
    const exts = phoneWithExtMatch[2].split(/[,\s]+/).filter(Boolean);
    if (exts.length) rawParts.splice(i+1, 0, ...exts);
    console.log(' phoneWithExtMatch, exts=', exts);
  }
  console.log('After splits, p=', p);

  if (/^[0-9\s,]+$/.test(p) && parts.length > 0) {
    const lastIdx = parts.length - 1;
    const last = parts[lastIdx];
    const cleanedExt = p.replace(/\s+/g, '').replace(/(^,|,$)/g, '');
    if (/ต่อ\s*(?:\d+)?$/i.test(last) || /ต่อ\s*\d+/i.test(last)) {
      if (/ต่อ\s*$/.test(last)) { parts[lastIdx] = `${last} ${cleanedExt}`; }
      else { parts[lastIdx] = `${last}, ${cleanedExt}`; }
      console.log(' attached numeric to previous as continuation. parts=', parts);
      continue;
    }
    if (/\b0[- \d]{8,15}\d\b/.test(last)) {
      parts[lastIdx] = `${last} ต่อ ${cleanedExt}`;
      console.log(' attached numeric to previous phone. parts=', parts);
      continue;
    }
  }

  parts.push(p);
  console.log(' p pushed, parts=', parts);
}
console.log('\nFinal parts=', parts);
