# MeloYelo CRM: old system and new hub

Prepared for Greg Ward. July 2026.

## What happened

The CRM work that was spread across six tools now runs in one app.

An agent opens one site, signs in with their MeloYelo account, and sees the
leads that need attention. They call, change the stage and add a note on the
same screen, and it works properly on a phone. Managers get every agent's
leads in a spreadsheet style view they can edit directly, dashboards built
into the site, and control of every page of content without needing a
developer. Emma runs her calling queue in the same place, with the ride guide
process built into the screen.

The spreadsheet is still the database. The scripts still assign leads by
postcode and record every stage change. Zapier still brings enquiries in and
emails agents. None of that was replaced.

Two problems in the current reporting came to light during the build.

Test ride bookings are reported at 4.23 percent. The true figure is at least
13.6 percent and almost certainly higher.

The speed to lead figure on the dashboard cannot be reproduced from the data
and appears to be inflated.

## Why it happened

The old setup was never broken, it was scattered. Six tools meant six places
to learn, and the two pieces agents touched most often, the add and update
forms, were the weakest. The update form does not work reliably on a phone,
which is where agents actually are. Every minute lost there is a minute added
to speed to lead, and speed to lead decides how many test rides get booked.

The booking rate is understated because it counts only the leads sitting at
the Test Ride Booked stage at this moment. As soon as someone completes their
ride they move on and drop out of the count. Of 836 website leads, 36 are at
that stage today, but another 78 have completed a ride, 198 became customers
and 21 accepted an offer. Nearly all of them booked a test ride first, and
none of them are counted.

Speed to lead is overstated because the stored column contains artefacts as
extreme as 213 days, and the dashboard appears to average them in rather than
setting them aside.

Both numbers come from the same cause. The dashboards report the state of a
lead today, not the events in its history. The new hub reads the stage history
instead, and shows both figures side by side so they can be compared rather
than swapped silently.

## What to do

**Confirm two things.** First, that test rides ever booked, rather than
currently booked, becomes the headline metric. Second, the exact formula
behind the speed to lead figure in the old dashboard, so the two numbers can
be reconciled.

**Restrict the customer spreadsheet.** It is currently shared so that anyone
with the link can view it, which exposes customer names, emails and phone
numbers. Under the Privacy Act 2020 it should be limited to named accounts.
This should be done before launch.

**Put the hub on a proper web address.** It is running against live data now,
but only on one computer. This is the last step before anyone else can use it.

**Trial it before switching anything off.** Run it alongside the existing
tools with two or three agents for a week and act on what they report. Keep
the Google Forms live until the new screens have run cleanly for a fortnight,
and leave the intranet up for a month after that. If the hub stopped working
tomorrow the CRM would carry on exactly as it does today, so there is no point
at which this cannot be reversed.

**Two smaller items.** The Website and Email Analytics report needs sharing
with the account being used, and a decision is needed on whether the hub takes
over the existing intranet address or runs on its own during the trial.
