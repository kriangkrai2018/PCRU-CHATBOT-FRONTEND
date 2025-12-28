const visibleContacts = [
  { organization: 'Org1', category: 'Cat1', contact: 'ติดต่อ: 056-717-144' },
  { organization: 'Org1', category: 'Cat2', contact: 'ติดต่อ: 056-717100 ต่อ 5103, 5101' },
  { organization: 'Org1', category: 'Cat3', contact: 'ลิงค์ : https://www.facebook.com/Studentloan.PCRU/?loca' },
  { organization: 'Org1', category: 'Cat3', contact: 'ติดต่อ: le=th_TH' }
];

function normalizeContacts(visibleContacts) {
  const normalizedContacts = [];
  for (const c of visibleContacts) {
    const org = c.organization || 'อื่นๆ';
    let rawContact = (c.contact || '').trim();
    const labelMatch = String(rawContact || '').match(/^(เบอร์โทรศัพท์|ติดต่อ|ลิงค์)\s*:/i);
    const isLinkLabel = labelMatch && /ลิงค์/i.test(labelMatch[1]);
    const stripped = String(rawContact || '').replace(/^(?:เบอร์โทรศัพท์|ติดต่อ|ลิงค์)\s*:\s*/i, '').trim();

    // skip entries with no meaningful content
    if (!stripped) continue;

    const isUrl = /https?:\/\/|www\./i.test(stripped);
    const currLooksLikeUrlContinuation = /^[\?&]/.test(stripped) || (/[=&]/.test(stripped) && stripped.length < 120);

    // If this looks like a URL continuation, try to attach it to the nearest previous link in the same org
    if (currLooksLikeUrlContinuation) {
      let attached = false;
      for (let j = normalizedContacts.length - 1; j >= 0; j--) {
        const prev = normalizedContacts[j];
        if (!prev || !prev.contact) continue;
        if (prev.organization !== org) break;
        if (/https?:\/\/|www\./i.test(prev.contact)) {
          prev.contact = String(prev.contact).trim() + stripped;
          attached = true;
          break;
        }
      }
      if (attached) continue;
    }

    // If labeled as link but does not contain a URL, skip it
    if (isLinkLabel && !isUrl) continue;

    normalizedContacts.push({ organization: org, category: c.category || null, contact: rawContact || null });
  }
  return normalizedContacts;
}

console.log(JSON.stringify(normalizeContacts(visibleContacts), null, 2));
