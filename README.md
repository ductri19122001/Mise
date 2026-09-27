# MISE Stage 1

MISE compares standardized menu capture CSVs from Counter, Skip, and Uber Eats. The browser and console use the same TypeScript parser, validation rules, and reconciliation engine. There is no database, API, authentication, platform integration, or file upload to a server.

## Run

Requirements: Node.js 20.19 or newer and npm.

Download the project and enter its folder:

```powershell
git clone https://github.com/ductri19122001/Mise.git
Set-Location Mise
```

Install dependencies and start the app:

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Issues page begins empty. Choose one or more CSVs; selected files and the generated report remain in browser memory for the current session and are cleared on refresh.

```powershell
npm run build
npm run test
```

## CSV contract

Each file must have the standardized headers:

```text
capture_id,captured_at,source,data_version,channel_listing_id,channel_id,channel_type,channel_name,menu_item_id,menu_item_name,category,size_variant_id,size_name,available,last_updated,price,listing_description,add_ons,source_item_id
```

The file input is associated with its expected channel. Rows must use that exact `channel_type`; prices must be numeric and non-negative; `available` must be `TRUE` or `FALSE`. Errors identify the file, field, and row when available.

One or more channel files may be reconciled. Price, description, add-on, and availability comparisons use only imported channels. Missing-listing defects are reported only when all three channel files were supplied, since an unselected channel cannot prove a listing is absent. Matching uses `menu_item_id + size_variant_id`; `source_item_id` is never used for matching.

No sample CSVs or seeded defects are bundled. Automated test data is constructed inside the tests and never appears in the UI.

## Console CLI

Pass three files in Counter, Skip, Uber Eats order:

```powershell
npm run reconcile -- path/to/capture_counter.csv path/to/capture_skip.csv path/to/capture_uber_eats.csv
```

For partial or non-canonical selections, use channel flags:

```powershell
npm run reconcile -- --uber-eats path/to/uber.csv --counter path/to/counter.csv
```

The CLI prints record counts, generated defects, severity summary, execution time, and the five-second performance result. Validation failures stop reconciliation and identify the affected file and field.

## Defect rules

- `MISSING_LISTING`: key absent from one or more supplied channels; enabled only when all three channel files are present.
- `PRICE_MISMATCH`: different prices across available listings.
- `DESCRIPTION_MISMATCH`: trimmed, lowercased, whitespace-collapsed descriptions differ.
- `ADD_ON_MISMATCH`: basic trimmed, lowercased, whitespace-collapsed add-on values differ.
- `AVAILABILITY_MISMATCH`: `TRUE`/`FALSE` values differ.

High severity is assigned to missing listings and price mismatches, medium to availability, and low to description/add-on mismatches. Multiple defects can be reported for the same menu item and size.

## Stage 1 limits

Only user-selected CSV data is reconciled. No data is persisted after refresh. Margins and Ingredients are future-stage placeholders. Existing backend files are not used by this prototype.
