function parseContactParts(contactStr){
  if(!contactStr) return [];
  let cleaned = String(contactStr).replace(/^(?:เบอร์โทรศัพท์|ติดต่อ)\s*:\s*/i, '').trim();
  const rawParts = cleaned.split(/(?:,|\sหรือ\s|;|\r?\n)/i).map(p => p.trim()).filter(Boolean);
  const parts = [];
  for (let i = 0; i < rawParts.length; i++) {
    let p = rawParts[i];
    if (/^https?:$/i.test(p) && rawParts[i+1]) {
      p = p + rawParts[i+1];
      i++;
    }
    if (/(facebook\.com|www\.|https?:)/i.test(p) && i+1 < rawParts.length) {
      while (i+1 < rawParts.length && (/^[\?=&]/.test(rawParts[i+1]) || /facebook\.com|www\.|\./i.test(rawParts[i+1]))) {
        p += rawParts[i+1];
        i++;
      }
    }

    // If this part is just 'ต่อ' and previous part is a phone, attach 'ต่อ' to previous
    if (/^ต่อ\s*$/i.test(p) && parts.length > 0) {
      const lastIdx = parts.length - 1;
      const last = parts[lastIdx];
      if (/\b0[- \d]{8,15}\d\b/.test(last)) {
        parts[lastIdx] = `${last} ต่อ`;
        continue;
      }
    }

    // If this part contains a phone followed by space-separated extensions (e.g., '056-717-100 1121 1122'), split them into separate parts
    // If format is 'PHONE ext1 ext2' (space separated), handle it robustly using tokenization
    const tokens = p.split(/\s+/).filter(Boolean);
    if (tokens.length > 1 && /^0[0-9\-\s]{6,}$/.test(tokens[0])) {
      const phoneCandidate = tokens[0];
      const extTokens = tokens.slice(1);
      if (extTokens.every(t => /^[0-9,]+$/.test(t))) {
        p = phoneCandidate;
        // expand comma-separated pieces inside tokens
        const exts = extTokens.flatMap(t => t.split(/[,\s]+/).filter(Boolean));
        if (exts.length) rawParts.splice(i+1, 0, ...exts);
      }
    } else {
      const phoneMatch = p.match(/\b0[- \d]{8,15}\d\b(?!\s+\d)/);
      if (phoneMatch) {
        const phone = phoneMatch[0];
        const rest = p.slice(p.indexOf(phone) + phone.length).trim();
        if (/^[0-9][0-9,\s]*$/.test(rest)) {
          const exts = rest.split(/[,\s]+/).filter(Boolean);
          p = phone;
          if (exts.length) rawParts.splice(i+1, 0, ...exts);
        }
      }
    }

    if (/^[0-9\s,]+$/.test(p) && parts.length > 0) {
      const lastIdx = parts.length - 1;
      const last = parts[lastIdx];
      const cleanedExt = p.replace(/\s+/g, '').replace(/(^,|,$)/g, '');
      if (/ต่อ\s*(?:\d+)?$/i.test(last) || /ต่อ\s*\d+/i.test(last)) {
        if (/ต่อ\s*$/.test(last)) {
          parts[lastIdx] = `${last} ${cleanedExt}`;
        } else {
          parts[lastIdx] = `${last}, ${cleanedExt}`;
        }
        continue;
      }
      if (/\b0[- \d]{8,15}\d\b/.test(last)) {
        parts[lastIdx] = `${last} ต่อ ${cleanedExt}`;
        continue;
      }
    }

    parts.push(p);
  }
  return parts;
}

const tests = [
  '056-717-100 ต่อ 1121, 1122',
  '056-717-100, 1121, 1122',
  '056-717-100,1121,1122',
  'ติดต่อ: 056-717-100 1121 1122',
  'https:',
  'https: www.facebook.com/somepage?ref=abc',
  'ติดต่อ: 02-1234567 ต่อ 899, 900, 901',
  'ติดต่อ: 02-1234567, 899, 900',
  'ติดต่อ: 02-1234567 ต่อ',
  'ติดต่อ: 02-1234567, ต่อ, 1122'
];

tests.forEach(t => {
  console.log('INPUT:', t);
  console.log('OUTPUT:', parseContactParts(t));
  console.log('---');
});
