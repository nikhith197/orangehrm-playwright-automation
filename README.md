# Senior QA Automation Engineer — Playwright JavaScript

This repository implements the Senior QA Automation Engineer technical assessment against the OrangeHRM demo application.

## Assessment coverage

| Requirement               | Implementation                                                      |
| ------------------------- | ------------------------------------------------------------------- |
| Authentication            | `LoginPage` + reusable `adminSession` fixture                       |
| Employee creation         | `employee-create.spec.js` + `EmployeeDetailsPage`                   |
| Role-based validation     | Admin positive test + optional ESS/non-admin negative test          |
| Employee update           | `employee-update.spec.js`                                           |
| API verification          | API checks after create, update and delete                          |
| Employee deletion         | `employee-delete.spec.js`                                           |
| POM                       | Page classes extending `BasePage`                                   |
| Scalable structure        | `pages`, `fixtures`, `utils`, `config`, `scripts`, `k6`             |
| Environment configuration | `config.js` + `.env.<environment>.example` files                    |
| Reusable utilities        | Fixtures, employee data factory, API client, logger                 |
| Test data isolation       | Unique first/middle/last names, employee ID and username            |
| Cleanup                   | Fixture-based API cleanup with UI fallback                          |
| Retry                     | 2 retries in CI, 0 locally                                          |
| Smart waits               | Locator auto-waiting, assertions and URL waits; no `waitForTimeout` |
| Failure evidence          | Screenshots, videos and traces on failure                           |
| CI/CD                     | GitHub Actions                                                      |
| Parallelization           | Browser matrix + 2-way Playwright sharding                          |
| HTML reporting            | Playwright HTML reporter                                            |
| Tagging                   | Playwright first-class `tag` option with `@smoke` / `@regression`   |
| Code quality              | ESLint + Prettier checks in CI                                      |
| Bonus performance         | k6 login and employee-create scripts                                |

## Project structure

```text
.
├── .github/workflows/playwright.yml
├── config.js
├── scripts/run-tests.js
├── tests/
│   ├── fixtures/test.js
│   ├── pages/
│   │   ├── BasePage.js
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── PimPage.js
│   │   ├── EmployeeDetailsPage.js
│   │   └── EmployeeListPage.js
│   ├── utils/
│   │   ├── apiClient.js
│   │   ├── employeeActions.js
│   │   ├── logger.js
│   │   └── testData.js
│   ├── employee-create.spec.js
│   ├── employee-update.spec.js
│   ├── employee-delete.spec.js
│   ├── employee-lifecycle.spec.js
│   └── role-validation.spec.js
├── k6/
├── docs/
├── .env.example
├── .env.demo.example
├── .env.qa.example
├── .env.staging.example
├── eslint.config.js
├── .prettierrc
├── playwright.config.js
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- npm
- Git
- Optional: k6 for the performance bonus

## Setup

### 1. Install dependencies

```bash
npm ci
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Configure the environment

For the demo environment, copy `.env.demo.example` to `.env.demo` (or `.env`) and provide credentials.

For QA or staging, provide `BASE_URL`, `APP_USERNAME` and `APP_PASSWORD` for the selected environment.

For the negative role-based test, also provide:

```text
ESS_USERNAME=
ESS_PASSWORD=
```

The ESS test is skipped when those credentials are intentionally not supplied; the rest of the suite remains executable.

## Execution

### Run all tests

```bash
npm test
```

### Chromium only

```bash
npm run test:chromium
```

### Smoke

```bash
npm run test:smoke
```

### Regression

```bash
npm run test:regression
```

### Headed mode

```bash
npm run test:headed
```

### Debug

```bash
npm run test:debug
```

### Environment-specific execution

```bash
npm run test:qa
npm run test:staging
```

### Syntax and quality checks

```bash
npm run lint:syntax
npm run lint
npm run format:check
```

### HTML report

```bash
npm run report
```

## CI/CD

GitHub Actions performs the following steps:

1. Checkout repository
2. Install Node.js 20
3. Install dependencies with `npm ci`
4. Install the selected Playwright browser
5. Run syntax, ESLint and Prettier checks
6. Execute Playwright tests
7. Run browser jobs in parallel and shard each browser into two partitions
8. Upload HTML reports
9. Upload screenshots, videos and traces from `test-results`

Repository secrets expected by CI:

- `BASE_URL`
- `APP_USERNAME`
- `APP_PASSWORD`
- Optional: `ESS_USERNAME`, `ESS_PASSWORD`

## Design decisions

### Page Object Model

Locators and page actions are isolated from test intent. A shared `BasePage` provides common wait/click helpers without putting business logic in the tests.

### Fixture-based dependency injection

`tests/fixtures/test.js` creates page objects, an API client, an authenticated admin session and an employee cleanup service. This removes duplicated login setup and gives every test the same dependencies.

### Independent test cases

Create, update and delete are separate tests so a failure in one scenario does not prevent the other scenarios from executing. Each test creates its own data and registers it for cleanup.

The complete lifecycle test remains as a small smoke-level business-flow test, while detailed assertions are isolated in the independent specs.

### Test data isolation

The employee data factory adds a unique suffix to first name, middle name, last name, employee ID and username. This reduces collisions when workers execute tests concurrently.

### Cleanup and failure isolation

Created employees are tracked by the fixture. Cleanup runs after the test regardless of pass/fail. API deletion is attempted first and the framework falls back to UI deletion when API cleanup cannot be completed.

### API verification

The UI performs the business operation while the API client validates backend state. Create, update and delete tests therefore verify both user-visible behavior and persisted state.

### Environment configuration

`TEST_ENV` selects demo, QA or staging configuration. Environment values can be supplied through `.env.<environment>` files locally or CI environment/secrets in GitHub Actions.

### Reliability

The suite relies on Playwright auto-waiting and web-first assertions rather than fixed sleeps. Retries are enabled only in CI. Failure artifacts are retained for root-cause analysis rather than using retries as a substitute for fixing flaky tests.

### Observability

The framework logs meaningful actions and cleanup events with timestamps. Screenshots, videos and traces are retained on failure.

### Code quality

ESLint and Prettier are part of the CI quality gate. Syntax checking is also retained as a lightweight early validation step.

## Flaky test detection and mitigation

A test is considered potentially flaky when it passes after a retry, repeatedly fails only under concurrency/CI, or exhibits timing, state, locator or test-data related failures.

Mitigation process:

1. Inspect retry information and failure artifacts.
2. Identify the root cause rather than increasing retries.
3. Replace brittle selectors with stable, scoped locators.
4. Wait for meaningful application state.
5. Isolate test data.
6. Clean up created records after every test.
7. Track recurring retry-only failures until the underlying cause is fixed.

## k6 performance bonus

The scripts are environment-driven and define thresholds for request failure rate and p95 response time.

Example:

```bash
k6 run -e BASE_URL=https://opensource-demo.orangehrmlive.com \
       -e APP_USERNAME=Admin \
       -e APP_PASSWORD=admin123 \
       k6/login-api.js
```

The target application's API contract should be validated in the target environment before interpreting the bonus performance results as production-level benchmarks.

## Submission checklist

- Push the complete repository to GitHub.
- Confirm `.env` and credentials are not committed.
- Configure required GitHub Actions secrets.
- Run the workflow manually once.
- Confirm tests, HTML reports and artifacts are visible in Actions.
- Share the GitHub repository link with the assessor.
