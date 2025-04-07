
This is a demo project demonstrating how to integrate AskYourDatabase chatbot into [Next.js](https://nextjs.org/).

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

## Prepare enviroment variables

Copy `.env.local.example` to `.env.local` and replace with your own enviroment variable.

`AYD_API_KEY` can be created in [API Key](https://www.askyourdatabase.com/dashboard/api-key) page.

`AYD_CHATBOT_ID` can be found in the URL, for example `https://www.askyourdatabase.com/dashboard/chatbot/12345678-1234-1234-1234-123456789012` the chatbot ID is `12345678-1234-1234-1234-123456789012`.

`AYD_WIDGET_ID` can be found in the URL, for example `https://www.askyourdatabase.com/dashboard/analytic/1?widgetId=cf51c274-0a0e-45ff-b90d-3b8107e6d8cd&isEndpoint=false,` the widget ID is `cf51c274-0a0e-45ff-b90d-3b8107e6d8cd`.

## Chatbot ID and Widget ID

There are two main functional modules in AskYourDatabase:

1. **Chatbot** (`AYD_CHATBOT_ID`): An AI chatbot that allows users to interact with data through natural language conversations. This ID is used for the chatbot interface.

2. **Dashboard Widget** (`AYD_WIDGET_ID`): Live data apps built using natural language in the `/dashboard/analytic` section. This ID is used for embedding interactive data visualizations and analytics.

Note: Each ID corresponds to a specific functionality. If you don't provide one of these IDs, the corresponding feature will not be available in your application:
- Without `AYD_CHATBOT_ID`, the chatbot interface will not work
- Without `AYD_WIDGET_ID`, the dashboard analytics widget will not function

After deployment, you can access:
- The chatbot interface at the root route (`/`)
- The dashboard widget at `/dashboard`


## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAskYourDatabase%2Fnextjs-chatbot&env=AYD_API_KEY,AYD_CHATBOT_ID,AYD_WIDGET_ID&envDescription=API_KEY%20can%20be%20created%20at%20https%3A%2F%2Fwww.askyourdatabase.com%2Fdashboard%2Fapi-key.%20CHATBOT_ID%20can%20be%20found%20in%20chatbot%20edit%20URL.)