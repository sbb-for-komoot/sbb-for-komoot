# Privacy Policy — SBB for Komoot

_Last updated: 2026-05-23_

This privacy policy applies to the **SBB for Komoot** browser extension
("the Extension"), distributed on the Chrome Web Store, the Microsoft Edge
Add-ons store, and the Firefox Add-ons store.

The Extension is an open-source, community-maintained tool that helps users
plan train journeys with SBB/CFF/FFS (Swiss Federal Railways) to the starting
point of a hike they are viewing on Komoot.

## TL;DR

The Extension does **not** collect, transmit, sell, or share any personal
information. It has no analytics, no tracking, no accounts, and no advertising.

## 1. Information We Do Not Collect

We do not collect, store on our servers, or share any of the following:

- Personally identifiable information (name, email, address, phone number)
- Account credentials of any kind
- Browsing history outside the pages the Extension is explicitly designed to
  interact with (komoot.com)
- Health, fitness, location, or financial data
- IP addresses, device identifiers, or analytics events

We operate **no backend servers** that receive data from the Extension.

## 2. Information Stored Locally on Your Device

The Extension uses the browser's `storage` API to persist a small amount of
user-preference data **locally on your device only**. This may include:

- Your selected interface language
- UI preferences (e.g. last-used origin station, display options)

This data never leaves your browser. It is not transmitted to us or to any
third party. You can erase it at any time by removing the Extension or
clearing the extension's storage from your browser settings.

## 3. Network Requests Made by the Extension

To provide its functionality, the Extension makes direct requests from your
browser to the following third-party endpoints:

| Host | Purpose |
| --- | --- |
| `transport.opendata.ch` | Public Swiss public-transport timetable API used to look up train connections. |
| `www.komoot.com` / `komoot.com` | Read the start coordinates of the hiking tour you are currently viewing in Komoot. |

These requests are made directly from your browser to the respective services.
We do not proxy, log, or intercept them. Their use is governed by the
respective privacy policies of those services:

- SBB Open Data / opendata.ch: <https://opentransportdata.swiss/en/terms-of-use/>
- Komoot: <https://www.komoot.com/privacy>

## 4. Permissions Requested and Why

The Extension requests the minimum set of permissions required to function:

- **`storage`** — to save your local preferences on your device, as described
  in section 2.
- **`tabs`** — to detect when you are viewing a Komoot tour page so that the
  sidebar can show the relevant train connections.
- **`sidePanel`** (Chromium browsers) — to display the journey planner in the
  browser's side panel.
- **Host permission for `https://www.komoot.com/*` and `https://komoot.com/*`**
  — to read the tour's start coordinates from the page you are viewing.
- **Host permission for `https://transport.opendata.ch/*`** — to query the
  public-transport timetable API.

The Extension does not run on any other website.

## 5. Data Collection Declarations

- **Firefox Add-ons:** The Extension's manifest declares
  `data_collection_permissions: { required: ["none"] }`, meaning it requires
  no data-collection permissions from the user.
- **Chrome Web Store:** Under the "Data usage" section of the store listing,
  the Extension declares that **no user data is collected, used, or transferred**
  for purposes unrelated to the Extension's single purpose, and that no user
  data is sold to third parties.

## 6. Children's Privacy

The Extension is a general-audience public-transport planning tool. It does
not knowingly collect any information from anyone, including children under
the age of 13/16.

## 7. Security

Because no data leaves your device, there is no server-side data to breach.
All communication with third-party services listed in section 3 takes place
over HTTPS.

## 8. Changes to This Policy

If the Extension's data-handling practices ever change, this document will be
updated and the "Last updated" date at the top will be revised. Material
changes will also be noted in the Extension's release notes on the store
listing and in the GitHub repository.

## 9. Contact

Questions or concerns about this privacy policy can be raised by opening an
issue on the project's GitHub repository:

<https://github.com/sbb-for-komoot/sbb-for-komoot/issues>

The Extension is maintained by Aloha Churchill and Benjamin Lozes and is
distributed under the MIT License.
