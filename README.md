# MBA Decision Lab

An interactive, browser-based tool for making a simple business case. Enter unit economics, fixed costs, an upfront investment, expected demand, growth, a discount rate, and a time horizon. The dashboard calculates break-even volume, monthly profit, cumulative cash flow, payback, and net present value (NPV). Three editable scenarios show how the result changes when price, demand, and unit cost differ from plan.

**[Open the live decision lab](https://poojaahegde.github.io/mba-decision-lab/)**

## Why this helps with MBA work

It makes assumptions visible. A class case or startup idea can look attractive under one forecast and weak under another. The tool helps you explain *which* assumptions drive the decision, then export the monthly cash-flow table for a report or further analysis.

Useful for practice in managerial economics, entrepreneurship, product strategy, and introductory corporate finance. It is a learning and portfolio project, not an investment recommendation.

## Try the example

The preloaded inputs are **illustrative synthetic values**, not data from a real company: price 75, variable cost 28, fixed monthly cost 4,200, month-one volume 160 units, monthly sales growth 1%, upfront investment 18,000, annual discount rate 10%, and a 24-month horizon. Replace these with evidence from your own case.

1. Enter a price, unit cost, sales estimate, fixed monthly cost, and upfront investment.
2. Set the growth assumption, discount rate, and analysis horizon.
3. Select **Analyze business case**.
4. Adjust the conservative and upside percentages to test uncertainty.
5. Download the base-case month-by-month CSV if you need to inspect or cite the arithmetic.

## Calculation notes

- **Contribution per unit:** price − variable cost per unit.
- **Break-even units per month:** ceiling of fixed monthly cost ÷ contribution per unit. If contribution is zero or negative, no finite break-even volume is shown.
- **Monthly volume:** month-one volume × (1 + monthly growth rate)^(month − 1).
- **Monthly operating profit:** volume × contribution per unit − fixed monthly cost.
- **Cumulative cash flow:** negative upfront investment + sum of operating profit through that month.
- **Monthly discount rate:** (1 + annual discount rate)^(1/12) − 1.
- **NPV:** negative upfront investment + sum of each month's operating profit discounted to month 0.
- **Payback:** the first time cumulative cash flow crosses zero, interpolated within that month. “Not reached” means the crossing did not occur within the selected horizon.

The model treats operating profit as cash flow. It does **not** include taxes, financing, working capital, depreciation, capital replacement, seasonality, capacity limits, or terminal value. A positive NPV is conditional on the entered assumptions; it is not proof that a project will succeed.

## Decision memo prompts

Use the dashboard to answer these questions in a report:

1. What decision is being made, and what alternative is the comparison point?
2. Where did each input come from, and how confident are you in it?
3. Which scenario changes the decision, and why?
4. What evidence would you gather next before committing resources?
5. What important costs or risks are outside this simplified model?

## Run locally

Serve the directory with any static web server, then open `index.html` in the browser. For example:

```bash
python3 -m http.server 8000
```

The project has no application dependencies and uses no external API. Calculations stay in the browser. To run the model checks:

```bash
node test.mjs
```

## Files

- `index.html` — semantic interface and explanatory content
- `style.css` — responsive visual design
- `model.mjs` — pure financial calculations and validation
- `app.mjs` — form, chart, scenarios, and CSV export
- `test.mjs` — arithmetic and edge-case checks
