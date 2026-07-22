/**
 * HubApi.gs — write endpoint for the CRM Hub.
 *
 * ADD THIS FILE to the existing bound Apps Script project on the WORKING
 * COPY sheet (17xpNY8t5GVAikMQRMc-MpnxJAqk6-JU4G2zAkacFG6I). Do not modify
 * any existing function (hard rule 5). Reuses the project's existing
 * functions so all business rules stay in one place.
 *
 * Deploy: New deployment → Web app → execute as "Me", access "Anyone".
 * Store the shared secret in the Config tab under key HUB_API_SECRET.
 *
 * ⚠ INTEGRATION CHECKLIST — verify these existing function names in the
 *   project and adjust the four call sites marked [EXISTING] below:
 *     getConfig_()                 — Config tab as {key: value}
 *     logStageHistory_(uid, from, to, whenISO, actorName)
 *     assignAgentByPostcode(...)   — postcode → agent routing
 *     writeUpdateLinkForRow_(row)  — refresh prefilled/live links
 *
 * v1.0 — TEST ON THE COPY FIRST
 */

var HUB_API_SECRET_KEY = 'HUB_API_SECRET';

var HUB_STAGES = [
  'Lead',
  'Made contact',
  'Contact Failed',
  'Test Ride Booked',
  'Test Ride Completed',
  'Test Ride Declined',
  'Offer Accepted',
  'Offer Declined',
  'MY Customer',
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // 1. Authenticate
    var cfg = getConfig_(); // [EXISTING]
    if (!body.secret || body.secret !== cfg[HUB_API_SECRET_KEY]) {
      return jsonOut_({ ok: false, error: 'unauthorised' });
    }

    // 2. Serialise — never let two writes race
    var lock = LockService.getDocumentLock();
    if (!lock.tryLock(30000)) return jsonOut_({ ok: false, error: 'busy' });

    try {
      switch (body.action) {
        case 'updateLead': return jsonOut_(hubUpdateLead_(body));
        case 'addLead':    return jsonOut_(hubAddLead_(body));
        case 'reassign':   return jsonOut_(hubReassign_(body));
        default:           return jsonOut_({ ok: false, error: 'unknown action' });
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── helpers ────────────────────────────────────────────────────────────────

function hubSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

/** Header name → 1-based column index for a sheet (never bind by index). */
function hubHeaderMap_(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[String(headers[i]).trim()] = i + 1;
  }
  return map;
}

/** Find the 1-based row of a Unique ID in All data, or -1. */
function hubFindRow_(sheet, cols, uniqueId) {
  var col = cols['Unique ID'];
  var values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(uniqueId).trim()) return i + 2;
  }
  return -1;
}

/** Note stamp — must match the format the existing script appends. */
function hubNoteStamp_(when) {
  var tz = Session.getScriptTimeZone();
  var stamp = Utilities.formatDate(when, tz, 'h:mma dd/MM/yy');
  return stamp.toLowerCase(); // "2:47pm 10/07/26"
}

function hubLog_(message) {
  var logs = hubSheet_('Logs');
  if (logs) {
    logs.appendRow([
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
      'HUB',
      message,
    ]);
  }
}

// ── updateLead (§10.2) ─────────────────────────────────────────────────────

var HUB_EDITABLE = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  postCode: 'Post Code',
  city: 'City',
  model: 'Model',
  serial: 'Serial',
};

function hubUpdateLead_(body) {
  var sheet = hubSheet_('All data');
  var cols = hubHeaderMap_(sheet);
  var row = hubFindRow_(sheet, cols, body.uniqueId);
  if (row === -1) return { ok: false, error: 'not found' };

  var now = new Date();
  var actor = body.actorName || body.actorEmail || 'Hub';
  var updated = {};
  var changesLogged = [];

  // 2. Stage change — forward-only in canonical order
  if (body.stageTo) {
    var current = String(sheet.getRange(row, cols['Stage']).getValue()).trim();
    var fromIdx = HUB_STAGES.indexOf(current);
    var toIdx = HUB_STAGES.indexOf(body.stageTo);
    if (toIdx === -1) {
      return { ok: false, error: 'unknown stage: ' + body.stageTo };
    }
    if (fromIdx !== -1 && toIdx < fromIdx) {
      return {
        ok: false,
        error: 'Stage can only move forward. This lead is already at "' +
          current + '".',
      };
    }
    if (body.stageTo !== current) {
      sheet.getRange(row, cols['Stage']).setValue(body.stageTo);
      sheet.getRange(row, cols['Stage Updated At']).setValue(now); // real Date
      sheet.getRange(row, cols['Stage Update From']).setValue(current);
      sheet.getRange(row, cols['Stage Update To']).setValue(body.stageTo);
      logStageHistory_(body.uniqueId, current, body.stageTo, now.toISOString(), actor); // [EXISTING]
      updated['Stage'] = body.stageTo;
      changesLogged.push('Stage: ' + current + ' → ' + body.stageTo);

      // 3. Speed to lead — first move off Lead, only when blank.
      // NOTE: if the project already exposes a speed-to-lead function,
      // call it here instead — never maintain two calculations.
      var stlCell = sheet.getRange(row, cols['speed_to_lead_minutes']);
      if (current === 'Lead' && String(stlCell.getValue()).trim() === '') {
        var added = sheet.getRange(row, cols['Date added']).getValue();
        if (added instanceof Date) {
          var minutes = Math.round((now.getTime() - added.getTime()) / 60000);
          stlCell.setValue(minutes);
          updated['speed_to_lead_minutes'] = minutes;
        }
      }
    }
  }

  // 4. Notes — append-only, never overwrite (hard rule 4)
  if (body.noteText) {
    var notesCell = sheet.getRange(row, cols['Notes']);
    var existing = String(notesCell.getValue());
    var entry = hubNoteStamp_(now) + ' ' + actor + ': ' + body.noteText;
    notesCell.setValue(existing ? existing + '\n' + entry : entry);
    updated['Notes appended'] = body.noteText;
    changesLogged.push('note added');
  }

  // 5. Other fields — write only keys present; never blank an unsent field
  var changes = body.changes || {};
  var postcodeChanged = false;
  for (var key in HUB_EDITABLE) {
    if (Object.prototype.hasOwnProperty.call(changes, key)) {
      var header = HUB_EDITABLE[key];
      var oldVal = String(sheet.getRange(row, cols[header]).getValue());
      var newVal = String(changes[key]);
      if (oldVal !== newVal) {
        sheet.getRange(row, cols[header]).setValue(newVal);
        updated[header] = newVal;
        changesLogged.push(header + ': "' + oldVal + '" → "' + newVal + '"');
        if (key === 'postCode') postcodeChanged = true;
      }
    }
  }

  // 6. Re-run routing when a postcode lands on an unassigned record
  var agentEmail = String(sheet.getRange(row, cols['Agent Email']).getValue()).trim();
  if (postcodeChanged && agentEmail === '') {
    assignAgentByPostcode(row); // [EXISTING] — confirm signature
    updated['Agent'] = String(sheet.getRange(row, cols['Agent']).getValue());
    updated['Agent Email'] = String(sheet.getRange(row, cols['Agent Email']).getValue());
  }

  // 7. Refresh the row's links
  writeUpdateLinkForRow_(row); // [EXISTING] — confirm signature

  // 8. Log who changed what
  hubLog_('updateLead ' + body.uniqueId + ' by ' + (body.actorEmail || '?') +
    ': ' + (changesLogged.join('; ') || 'no-op'));

  // 9. Let the app reconcile without a refetch
  return { ok: true, row: updated };
}

// ── addLead (§10.3) ────────────────────────────────────────────────────────

function hubAddLead_(body) {
  var sheet = hubSheet_('New contact submissions');
  if (!sheet) return { ok: false, error: 'New contact submissions tab missing' };

  var cols = hubHeaderMap_(sheet);
  var rowArr = [];
  var fields = {
    'Timestamp': new Date(),
    'First Name': body.firstName || '',
    'Last Name': body.lastName || '',
    'Email': body.email || '',
    'Phone': body.phone || '',
    'Post Code': body.postCode || '',
    'City': body.city || '',
    'Notes': body.notes || '',
    // §18.4 decision: hub-created leads reuse the existing AgentForm value
    'Source': body.source || 'AgentForm',
    'Processed': '', // the 5-minute batch picks this up
  };
  var maxCol = 0;
  for (var header in fields) {
    if (cols[header]) maxCol = Math.max(maxCol, cols[header]);
  }
  for (var i = 0; i < maxCol; i++) rowArr.push('');
  for (var h in fields) {
    if (cols[h]) rowArr[cols[h] - 1] = fields[h];
  }
  sheet.appendRow(rowArr);

  hubLog_('addLead by ' + (body.actorEmail || '?') + ': ' +
    (body.firstName || '') + ' ' + (body.lastName || '') + ' / ' + (body.email || ''));

  // processNewContactSubmissionsBatch does IDs + assignment + All data write.
  return { ok: true, pending: true };
}

// ── reassign (§10.4) — manager role is enforced app-side, server-side ──────

function hubReassign_(body) {
  var sheet = hubSheet_('All data');
  var cols = hubHeaderMap_(sheet);
  var row = hubFindRow_(sheet, cols, body.uniqueId);
  if (row === -1) return { ok: false, error: 'not found' };

  var agents = hubSheet_('Agents');
  var aCols = hubHeaderMap_(agents);
  var emailCol = aCols['CRM Email'] || aCols['Agent Email'] || aCols['Email'];
  var nameCol = aCols['Agent Name'] || aCols['Name'] || aCols['Agent'];
  if (!emailCol || !nameCol) return { ok: false, error: 'Agents tab headers not recognised' };

  var data = agents.getRange(2, 1, agents.getLastRow() - 1, agents.getLastColumn()).getValues();
  var target = null;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][emailCol - 1]).trim().toLowerCase() ===
        String(body.agentEmail).trim().toLowerCase()) {
      target = { name: String(data[i][nameCol - 1]).trim(),
                 email: String(data[i][emailCol - 1]).trim() };
      break;
    }
  }
  if (!target) return { ok: false, error: 'agent not found in Agents tab' };

  var now = new Date();
  var actor = body.actorName || body.actorEmail || 'Hub';
  var previous = String(sheet.getRange(row, cols['Agent']).getValue()).trim();

  sheet.getRange(row, cols['Agent']).setValue(target.name);
  sheet.getRange(row, cols['Agent Email']).setValue(target.email);

  var notesCell = sheet.getRange(row, cols['Notes']);
  var existing = String(notesCell.getValue());
  var entry = hubNoteStamp_(now) + ' ' + actor + ': Reassigned from ' +
    (previous || 'unassigned') + ' to ' + target.name +
    (body.reason ? ' — ' + body.reason : '');
  notesCell.setValue(existing ? existing + '\n' + entry : entry);

  hubLog_('reassign ' + body.uniqueId + ' by ' + (body.actorEmail || '?') +
    ': ' + (previous || 'unassigned') + ' → ' + target.name);

  return { ok: true, row: { Agent: target.name, 'Agent Email': target.email } };
}
