import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: 'This endpoint has moved. Please update your Shopify webhook to /api/shopify/webhooks/inventory-item-update.',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: 'Inventory update webhook moved to /api/shopify/webhooks/inventory-item-update.',
    },
    { status: 410 }
  );
}

