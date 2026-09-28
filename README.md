# Balancash

Balancash is a personal-finance web application that helps you understand and plan your monthly balance. It lets you record income, expenses, subscriptions, and debts, review outstanding commitments, and view a projected summary to make better decisions about your money.

Your information is stored locally in the browser. No account is required and no personal data is sent to a server; use the same browser and device to keep access to your records.

## Features

- Record fixed and additional income.
- Organize fixed expenses, one-time payments, subscriptions, and cash withdrawals.
- Track debts and their pending payments.
- Plan future expenses.
- View a projected monthly balance, outstanding amounts, and available savings.
- Mark expenses and debts as paid for each period.
- Review financial charts and an annual summary.
- Use the interface in light or dark mode.

## Technologies and libraries

### Application

- [Vue 3](https://vuejs.org/) with the Composition API for the user interface.
- [TypeScript](https://www.typescriptlang.org/) for static typing.
- [Vite](https://vite.dev/) as the development environment and build tool.
- [Vue Router](https://router.vuejs.org/) for navigation between the summary, income, expenses, debts, and future-expenses views.
- [Pinia](https://pinia.vuejs.org/) for application state management.
- [VueUse](https://vueuse.org/) to persist state and records in `localStorage`.

### Interface and visualization

- [PrimeVue](https://primevue.org/) and [PrimeIcons](https://primevue.org/icons/) for components and icons.
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and responsive design.
- [Chart.js](https://www.chartjs.org/) for financial-summary charts.

### Development and quality

- [ESLint](https://eslint.org/) and `eslint-plugin-vue` for static analysis.
- [`vue-tsc`](https://github.com/vuejs/language-tools) for type-checking Vue components.

## Requirements

- [Node.js](https://nodejs.org/) 22 or a compatible version.
- npm.

## Getting started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Create a production build and verify types:

```sh
npm run build
```

Run the linter:

```sh
npm run lint
```

## License

This project is distributed under the [MIT License](LICENSE).
